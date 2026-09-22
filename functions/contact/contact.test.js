import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { FIELD_LIMITS } from "./contract.js";
import {
  RATE_LIMIT,
  buildMessage,
  createHandler,
  isAllowedOrigin,
  parseEnquiry,
} from "./contact.js";

const VALID = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  message: "I would like to ask about Saturn.",
};

function setup({ fail, configured = true } = {}) {
  const sent = [];
  const logs = [];
  const send = async (message) => {
    sent.push(message);
    if (fail) throw new Error(fail);
    return { id: "<msg-1@moiraemoss.com>", response: "250 2.0.0 Ok: queued" };
  };
  let clock = 1_000_000;
  const handle = createHandler({
    send: configured ? send : null,
    now: () => clock,
    log: (line) => logs.push(line),
  });
  return { handle, sent, logs, advance: (ms) => { clock += ms; } };
}

function post(body, { origin = "https://moiraemoss.com", type = "application/json", ip = "203.0.113.7", base64 = false } = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return {
    httpMethod: "POST",
    headers: {
      ...(origin ? { Origin: origin } : {}),
      ...(type ? { "Content-Type": type } : {}),
      "X-Forwarded-For": `${ip}, 10.0.0.1`,
    },
    body: base64 ? Buffer.from(raw).toString("base64") : raw,
    isBase64Encoded: base64,
  };
}

const json = (response) => JSON.parse(response.body);

describe("origins", () => {
  it("allows the site and local development only", () => {
    assert.equal(isAllowedOrigin("https://moiraemoss.com"), true);
    assert.equal(isAllowedOrigin("http://localhost:3000"), true);
    assert.equal(isAllowedOrigin("http://127.0.0.1:4173"), true);
    assert.equal(isAllowedOrigin("http://localhost"), true);
    assert.equal(isAllowedOrigin("https://www.moiraemoss.com"), false);
    assert.equal(isAllowedOrigin("http://moiraemoss.com"), false);
    assert.equal(isAllowedOrigin("https://moiraemoss.com.evil.test"), false);
    assert.equal(isAllowedOrigin("http://localhost.evil.test"), false);
    assert.equal(isAllowedOrigin(undefined), false);
  });

  it("answers preflight for an allowed origin", async () => {
    const { handle } = setup();
    const response = await handle({ httpMethod: "OPTIONS", headers: { origin: "https://moiraemoss.com" } });
    assert.equal(response.statusCode, 204);
    assert.equal(response.headers["Access-Control-Allow-Origin"], "https://moiraemoss.com");
    assert.equal(response.headers["Access-Control-Allow-Methods"], "POST, OPTIONS");
    assert.equal(response.headers["Access-Control-Allow-Headers"], "Content-Type");
  });

  it("refuses preflight and posts from other origins without sending", async () => {
    const { handle, sent } = setup();
    const preflight = await handle({ httpMethod: "OPTIONS", headers: { origin: "https://evil.test" } });
    assert.equal(preflight.statusCode, 403);
    assert.equal(preflight.headers["Access-Control-Allow-Origin"], undefined);

    const foreign = await handle(post(VALID, { origin: "https://evil.test" }));
    assert.equal(foreign.statusCode, 403);
    assert.equal(json(foreign).error, "origin_not_allowed");

    const missing = await handle(post(VALID, { origin: null }));
    assert.equal(missing.statusCode, 403);
    assert.equal(sent.length, 0);
  });

  it("rejects methods other than POST", async () => {
    const { handle } = setup();
    const response = await handle({ httpMethod: "GET", headers: { origin: "https://moiraemoss.com" } });
    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, "POST, OPTIONS");
  });
});

describe("sending", () => {
  it("sends one message to the mailbox with the visitor as reply-to", async () => {
    const { handle, sent } = setup();
    const response = await handle(post(VALID));

    assert.equal(response.statusCode, 200);
    assert.deepEqual(json(response), { ok: true, id: "<msg-1@moiraemoss.com>" });
    assert.equal(response.headers["Access-Control-Allow-Origin"], "https://moiraemoss.com");
    assert.equal(sent.length, 1);

    const [message] = sent;
    assert.deepEqual(message.from, { address: "website@moiraemoss.com", name: "Moirae Moss website" });
    assert.deepEqual(message.to, { address: "contact@moiraemoss.com", name: "Moirae Moss" });
    assert.equal(message.replyTo, "ada@example.com");
    assert.equal(message.subject, "Website enquiry - Ada Lovelace");
    assert.match(message.text, /Name: Ada Lovelace\nEmail: ada@example.com\n\nI would like to ask about Saturn\./);
  });

  it("accepts form-encoded and base64-encoded bodies", async () => {
    const { handle, sent } = setup();
    const form = new URLSearchParams({ ...VALID, website: "" }).toString();
    const encoded = await handle(post(form, { type: "application/x-www-form-urlencoded; charset=UTF-8" }));
    assert.equal(encoded.statusCode, 200);

    const base64 = await handle(post(VALID, { base64: true, ip: "198.51.100.2" }));
    assert.equal(base64.statusCode, 200);
    assert.equal(sent.length, 2);
  });

  it("trims fields before sending", async () => {
    const { handle, sent } = setup();
    await handle(post({ ...VALID, firstName: "  Ada ", email: " ada@example.com " }));
    assert.equal(sent[0].subject, "Website enquiry - Ada Lovelace");
    assert.equal(sent[0].replyTo, "ada@example.com");
  });

  it("reports a relay failure as 502 without leaking the reason", async () => {
    const { handle, logs } = setup({ fail: "535 Authentication failed" });
    const response = await handle(post(VALID));
    assert.equal(response.statusCode, 502);
    assert.deepEqual(json(response), { ok: false, error: "send_failed" });
    assert.match(logs.join("\n"), /535/);
  });

  it("refuses to send when the credentials are missing", async () => {
    const { handle } = setup({ configured: false });
    const response = await handle(post(VALID));
    assert.equal(response.statusCode, 500);
    assert.equal(json(response).error, "not_configured");
  });
});

describe("rejections", () => {
  it("drops a filled honeypot with a silent 200", async () => {
    const { handle, sent } = setup();
    const response = await handle(post({ ...VALID, website: "https://spam.test" }));
    assert.equal(response.statusCode, 200);
    assert.deepEqual(json(response), { ok: true });
    assert.equal(sent.length, 0);
  });

  it("names every invalid field", async () => {
    const { handle, sent } = setup();
    const response = await handle(post({ firstName: "", lastName: 42, email: "not-an-email" }));
    assert.equal(response.statusCode, 400);
    assert.deepEqual(json(response), {
      ok: false,
      error: "invalid_fields",
      fields: ["firstName", "lastName", "email", "message"],
    });
    assert.equal(sent.length, 0);
  });

  it("rejects unsupported and malformed bodies", async () => {
    const { handle } = setup();
    const text = await handle(post("hello", { type: "text/plain" }));
    assert.equal(text.statusCode, 415);
    const broken = await handle(post("{not json", { ip: "198.51.100.3" }));
    assert.equal(broken.statusCode, 400);
    assert.equal(json(broken).error, "malformed_body");
    const array = await handle(post("[]", { ip: "198.51.100.4" }));
    assert.equal(array.statusCode, 400);
  });

  it("rejects oversized bodies", async () => {
    const { handle } = setup();
    const response = await handle(post({ ...VALID, message: "x".repeat(40_000) }));
    assert.equal(response.statusCode, 413);
  });
});

describe("validation", () => {
  it("enforces field lengths", () => {
    for (const [key, max] of Object.entries(FIELD_LIMITS)) {
      const atLimit = key === "email" ? `${"a".repeat(max - 12)}@example.com` : "a".repeat(max);
      assert.equal(parseEnquiry({ ...VALID, [key]: atLimit }).ok, true, key);
      assert.deepEqual(parseEnquiry({ ...VALID, [key]: `${atLimit}a` }).invalid, [key]);
    }
  });

  it("checks the email shape", () => {
    for (const email of ["ada@example.com", "a.b+tag@mail.example.co.uk"]) {
      assert.equal(parseEnquiry({ ...VALID, email }).ok, true, email);
    }
    for (const email of ["ada", "ada@", "@example.com", "ada@example", "ada @example.com", "a<b>@example.com", "ada@example.com\nBcc: x@y.z"]) {
      assert.deepEqual(parseEnquiry({ ...VALID, email }).invalid, ["email"], email);
    }
  });

  it("rejects control characters in names but keeps message line breaks", () => {
    assert.deepEqual(parseEnquiry({ ...VALID, firstName: "Ada\r\nBcc: x" }).invalid, ["firstName"]);
    assert.equal(parseEnquiry({ ...VALID, message: "Line one\r\n\tLine two" }).ok, true);
    assert.deepEqual(parseEnquiry({ ...VALID, message: "bell\u0007" }).invalid, ["message"]);
  });

  it("builds the message from validated fields", () => {
    const message = buildMessage(VALID);
    assert.equal(message.subject, "Website enquiry - Ada Lovelace");
    assert.equal(message.replyTo, VALID.email);
  });
});

describe("rate limiting", () => {
  it("limits each client IP within the window", async () => {
    const { handle, advance } = setup();
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      assert.equal((await handle(post(VALID))).statusCode, 200);
    }
    const limited = await handle(post(VALID));
    assert.equal(limited.statusCode, 429);
    assert.equal(limited.headers["Retry-After"], String(RATE_LIMIT.windowMs / 1000));
    assert.equal(json(limited).error, "rate_limited");

    assert.equal((await handle(post(VALID, { ip: "198.51.100.9" }))).statusCode, 200);

    advance(RATE_LIMIT.windowMs);
    assert.equal((await handle(post(VALID))).statusCode, 200);
  });
});
