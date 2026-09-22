import { FIELD_LIMITS, HONEYPOT_FIELD } from "./contract.js";

export const SITE_ORIGIN = "https://moiraemoss.com";
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

export const FROM = { email: "website@moiraemoss.com", name: "Moirae Moss website" };
export const TO = { email: "contact@moiraemoss.com", name: "Moirae Moss" };

const MAX_BODY_BYTES = 32 * 1024;
const TEM_TIMEOUT_MS = 10_000;

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

export function parseSubmission(contentType, body) {
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

export function buildEmail({ firstName, lastName, email, message }, projectId) {
  const name = `${firstName} ${lastName}`;
  return {
    from: FROM,
    to: [TO],
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
    project_id: projectId,
    additional_headers: [{ key: "Reply-To", value: email }],
  };
}

export function createHandler({ env, fetch, now, log, rateLimit = createRateLimiter(RATE_LIMIT) }) {
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

    const parsed = parseSubmission(header(event, "content-type"), body);
    if (!parsed.ok) return respond(parsed.status, { ok: false, error: parsed.error });

    const trap = parsed.data[HONEYPOT_FIELD];
    if (typeof trap === "string" ? trap.trim() !== "" : trap != null) {
      log("honeypot filled; dropped silently");
      return respond(200, { ok: true });
    }

    const valid = parseEnquiry(parsed.data);
    if (!valid.ok) return respond(400, { ok: false, error: "invalid_fields", fields: valid.invalid });

    const apiKey = env.TEM_SECRET_KEY;
    const projectId = env.TEM_PROJECT_ID;
    const region = env.TEM_REGION || "fr-par";
    if (!apiKey || !projectId) {
      log("TEM_SECRET_KEY or TEM_PROJECT_ID is not set");
      return respond(500, { ok: false, error: "not_configured" });
    }

    let response;
    try {
      response = await fetch(
        `https://api.scaleway.com/transactional-email/v1alpha1/regions/${region}/emails`,
        {
          method: "POST",
          headers: { "X-Auth-Token": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify(buildEmail(valid.fields, projectId)),
          signal: AbortSignal.timeout(TEM_TIMEOUT_MS),
        },
      );
    } catch (error) {
      log(`TEM request failed: ${error instanceof Error ? error.message : String(error)}`);
      return respond(502, { ok: false, error: "send_failed" });
    }

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      log(`TEM rejected the email: ${response.status} ${JSON.stringify(result)}`);
      return respond(502, { ok: false, error: "send_failed" });
    }

    const sent = result?.emails?.[0];
    log(`TEM accepted email id=${sent?.id} status=${sent?.status}`);
    return respond(200, { ok: true, id: sent?.id ?? null });
  };
}

export const handle = createHandler({
  env: process.env,
  fetch: (...args) => globalThis.fetch(...args),
  now: () => Date.now(),
  log: (line) => console.log(line),
});
