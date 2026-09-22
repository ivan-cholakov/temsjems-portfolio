import { FIELD_LIMITS, HONEYPOT_FIELD } from "./contract.js";

export const SITE_ORIGIN = "https://moiraemoss.com";
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

export const FROM = { address: "website@moiraemoss.com", name: "Moirae Moss website" };
export const TO = { address: "contact@moiraemoss.com", name: "Moirae Moss" };

const MAX_BODY_BYTES = 32 * 1024;

export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

const EMAIL_SHAPE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const MESSAGE_CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export function createRateLimiter({ max, windowMs }) {
  const hits = new Map();

  return function take(key, now) {
    const since = now - windowMs;
    const recent = (hits.get(key) ?? []).filter((t) => t > since);

    if (hits.size > 10_000) {
      for (const [k, times] of hits) {
        if (times.every((t) => t <= since)) hits.delete(k);
      }
    }

    if (recent.length >= max) {
      hits.set(key, recent);
      return { allowed: false, retryAfterSeconds: Math.ceil((recent[0] + windowMs - now) / 1000) };
    }

    recent.push(now);
    hits.set(key, recent);
    return { allowed: true };
  };
}

export function isAllowedOrigin(origin) {
  return origin === SITE_ORIGIN || LOCAL_ORIGIN.test(origin ?? "");
}

function header(event, name) {
  const headers = event.headers ?? {};
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === wanted) return Array.isArray(value) ? value[0] : value;
  }
  return undefined;
}

function clientIp(event) {
  const forwarded = header(event, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return header(event, "x-real-ip") ?? "unknown";
}

function rawBody(event) {
  const body = event.body ?? "";
  return event.isBase64Encoded ? Buffer.from(body, "base64").toString("utf8") : body;
}

export function parseBody(contentType, body) {
  const type = (contentType ?? "").split(";")[0].trim().toLowerCase();

  if (type === "application/json") {
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return { ok: false, status: 400, error: "malformed_body" };
    }
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, status: 400, error: "malformed_body" };
    }
    return { ok: true, data };
  }

  if (type === "application/x-www-form-urlencoded") {
    return { ok: true, data: Object.fromEntries(new URLSearchParams(body)) };
  }

  return { ok: false, status: 415, error: "unsupported_media_type" };
}

export function parseEnquiry(data) {
  const text = (key) => (typeof data[key] === "string" ? data[key].trim() : null);
  const fields = {
    firstName: text("firstName"),
    lastName: text("lastName"),
    email: text("email"),
    message: text("message"),
  };

  const invalid = Object.entries(fields)
    .filter(([key, value]) => {
      if (!value || [...value].length > FIELD_LIMITS[key]) return true;
      if (key === "message") return MESSAGE_CONTROL_CHARS.test(value);
      if (CONTROL_CHARS.test(value)) return true;
      return key === "email" && !EMAIL_SHAPE.test(value);
    })
    .map(([key]) => key);

  return invalid.length === 0 ? { ok: true, fields } : { ok: false, invalid };
}

export function buildMessage({ firstName, lastName, email, message }) {
  const name = `${firstName} ${lastName}`;
  return {
    from: FROM,
    to: TO,
    replyTo: email,
    subject: `Website enquiry - ${name}`,
    text: [
      "New enquiry from the moiraemoss.com contact form.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
      "",
    ].join("\n"),
  };
}

export function createHandler({ send, now, log, rateLimit = createRateLimiter(RATE_LIMIT) }) {
  return async function handle(event) {
    const origin = header(event, "origin");
    const allowed = isAllowedOrigin(origin);
    const cors = allowed
      ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
      : { Vary: "Origin" };

    const respond = (statusCode, payload, extra = {}) => ({
      statusCode,
      headers: { ...cors, "Content-Type": "application/json", ...extra },
      body: JSON.stringify(payload),
    });

    const method = (event.httpMethod ?? "").toUpperCase();

    if (method === "OPTIONS") {
      if (!allowed) return respond(403, { ok: false, error: "origin_not_allowed" });
      return {
        statusCode: 204,
        headers: {
          ...cors,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
        body: "",
      };
    }

    if (method !== "POST") {
      return respond(405, { ok: false, error: "method_not_allowed" }, { Allow: "POST, OPTIONS" });
    }

    if (!allowed) return respond(403, { ok: false, error: "origin_not_allowed" });

    const limit = rateLimit(clientIp(event), now());
    if (!limit.allowed) {
      return respond(
        429,
        { ok: false, error: "rate_limited" },
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }

    const body = rawBody(event);
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      return respond(413, { ok: false, error: "payload_too_large" });
    }

    const parsed = parseBody(header(event, "content-type"), body);
    if (!parsed.ok) return respond(parsed.status, { ok: false, error: parsed.error });

    const trap = parsed.data[HONEYPOT_FIELD];
    if (typeof trap === "string" ? trap.trim() !== "" : trap != null) {
      log("honeypot filled; dropped silently");
      return respond(200, { ok: true });
    }

    const valid = parseEnquiry(parsed.data);
    if (!valid.ok) return respond(400, { ok: false, error: "invalid_fields", fields: valid.invalid });

    if (!send) {
      log("the SMTP credentials are not configured");
      return respond(500, { ok: false, error: "not_configured" });
    }

    let sent;
    try {
      sent = await send(buildMessage(valid.fields));
    } catch (error) {
      log(`send failed: ${error instanceof Error ? error.message : String(error)}`);
      return respond(502, { ok: false, error: "send_failed" });
    }

    log(`accepted by the relay: id=${sent.id} response=${sent.response}`);
    return respond(200, { ok: true, id: sent.id });
  };
}
