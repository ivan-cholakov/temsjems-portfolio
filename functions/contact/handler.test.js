import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { FIELD_LIMITS } from "./contract.js";
import {
  RATE_LIMIT,
  buildEmail,
  createHandler,
  isAllowedOrigin,
  parseEnquiry,
} from "./handler.js";

const VALID = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  message: "I would like to ask about Saturn.",
};

const ENV = { TEM_SECRET_KEY: "test-key", TEM_PROJECT_ID: "project-123" };

function setup({ env = ENV, status = 200, reply, fail } = {}) {
  const calls = [];
  const logs = [];
  const fetch = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    if (fail) throw new Error(fail);
    return new Response(
      JSON.stringify(reply ?? { emails: [{ id: "email-1", status: "new" }] }),
      { status, headers: { "Content-Type": "application/json" } },
    );
  };
  let clock = 1_000_000;
  const handle = createHandler({
    env,
    fetch,
    now: () => clock,
    log: (line) => logs.push(line),
  });
  return { handle, calls, logs, advance: (ms) => { clock += ms; } };
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
    const { handle, calls } = setup();
    const preflight = await handle({ httpMethod: "OPTIONS", headers: { origin: "https://evil.test" } });
    assert.equal(preflight.statusCode, 403);
    assert.equal(preflight.headers["Access-Control-Allow-Origin"], undefined);

    const foreign = await handle(post(VALID, { origin: "https://evil.test" }));
    assert.equal(foreign.statusCode, 403);
    assert.equal(json(foreign).error, "origin_not_allowed");

    const missing = await handle(post(VALID, { origin: null }));
    assert.equal(missing.statusCode, 403);
    assert.equal(calls.length, 0);
  });

  it("rejects methods other than POST", async () => {
    const { handle } = setup();
    const response = await handle({ httpMethod: "GET", headers: { origin: "https://moiraemoss.com" } });
    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, "POST, OPTIONS");
  });
});

describe("sending", () => {
  it("sends one email through TEM with the visitor as reply-to", async () => {
    const { handle, calls } = setup();
    const response = await handle(post(VALID));

    assert.equal(response.statusCode, 200);
    assert.deepEqual(json(response), { ok: true, id: "email-1" });
    assert.equal(response.headers["Access-Control-Allow-Origin"], "https://moiraemoss.com");
    assert.equal(calls.length, 1);

    const [{ url, init, body }] = calls;
    assert.equal(url, "https://api.scaleway.com/transactional-email/v1alpha1/regions/fr-par/emails");
    assert.equal(init.method, "POST");
    assert.equal(init.headers["X-Auth-Token"], "test-key");
    assert.deepEqual(body.from, { email: "website@moiraemoss.com", name: "Moirae Moss website" });
    assert.deepEqual(body.to, [{ email: "contact@moiraemoss.com", name: "Moirae Moss" }]);
    assert.equal(body.subject, "Website enquiry - Ada Lovelace");
    assert.equal(body.project_id, "project-123");
    assert.deepEqual(body.additional_headers, [{ key: "Reply-To", value: "ada@example.com" }]);
    assert.match(body.text, /Name: Ada Lovelace\nEmail: ada@example.com\n\nI would like to ask about Saturn\./);
  });

  it("accepts form-encoded and base64-encoded bodies", async () => {
    const { handle, calls } = setup();
    const form = new URLSearchParams({ ...VALID, website: "" }).toString();
    const encoded = await handle(post(form, { type: "application/x-www-form-urlencoded; charset=UTF-8" }));
    assert.equal(encoded.statusCode, 200);

    const base64 = await handle(post(VALID, { base64: true, ip: "198.51.100.2" }));
    assert.equal(base64.statusCode, 200);
    assert.equal(calls.length, 2);
  });

  it("trims fields before sending", async () => {
    const { handle, calls } = setup();
    await handle(post({ ...VALID, firstName: "  Ada ", email: " ada@example.com " }));
    assert.equal(calls[0].body.subject, "Website enquiry - Ada Lovelace");
    assert.equal(calls[0].body.additional_headers[0].value, "ada@example.com");
  });

  it("reports a TEM rejection as 502 without leaking the reason", async () => {
    const { handle, logs } = setup({ status: 403, reply: { message: "permission denied" } });
    const response = await handle(post(VALID));
    assert.equal(response.statusCode, 502);
    assert.deepEqual(json(response), { ok: false, error: "send_failed" });
    assert.match(logs.join("\n"), /403/);
  });

  it("reports a network failure as 502", async () => {
    const { handle } = setup({ fail: "socket hang up" });
    const response = await handle(post(VALID));
    assert.equal(response.statusCode, 502);
  });

  it("refuses to send when the secrets are missing", async () => {
    const { handle, calls } = setup({ env: {} });
    const response = await handle(post(VALID));
    assert.equal(response.statusCode, 500);
    assert.equal(json(response).error, "not_configured");
    assert.equal(calls.length, 0);
  });

  it("uses the configured region", async () => {
    const { handle, calls } = setup({ env: { ...ENV, TEM_REGION: "nl-ams" } });
    await handle(post(VALID));
    assert.match(calls[0].url, /\/regions\/nl-ams\/emails$/);
  });
});

describe("rejections", () => {
  it("drops a filled honeypot with a silent 200", async () => {
    const { handle, calls } = setup();
    const response = await handle(post({ ...VALID, website: "https://spam.test" }));
    assert.equal(response.statusCode, 200);
    assert.deepEqual(json(response), { ok: true });
    assert.equal(calls.length, 0);
  });

  it("names every invalid field", async () => {
    const { handle, calls } = setup();
    const response = await handle(post({ firstName: "", lastName: 42, email: "not-an-email" }));
    assert.equal(response.statusCode, 400);
    assert.deepEqual(json(response), {
      ok: false,
      error: "invalid_fields",
      fields: ["firstName", "lastName", "email", "message"],
    });
    assert.equal(calls.length, 0);
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

  it("builds the email from validated fields", () => {
    const email = buildEmail(VALID, "p");
    assert.equal(email.subject, "Website enquiry - Ada Lovelace");
    assert.equal(email.to.length, 1);
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
