// Client-side Mailchimp audience signup for a static (server-less) site.
//
// The site is a static export (`output: "export"`), so there is no backend to
// proxy through and no place to safely hold a Mailchimp API key. Mailchimp's
// embedded form is designed for exactly this: it submits straight from the
// browser to `list-manage.com`. We can't use `fetch`, because that endpoint
// sends no CORS headers — so we hit its JSONP variant (`/subscribe/post-json`)
// with a callback, which is Mailchimp's officially supported cross-origin path.

import { MAILCHIMP_URL } from "@/content/site";

export type SubscribeResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

// A monotonic id keeps concurrent submits from colliding on the global callback
// name. Module-level so it survives re-renders without a ref.
let callbackSeq = 0;

// How long to wait for Mailchimp's JSONP callback before giving up. Without this
// the promise would hang forever if the script loads but never calls us back.
const RESPONSE_TIMEOUT_MS = 10_000;

// User-facing fallback copy. `NETWORK_ERROR` covers every "no usable response"
// path (script error or timeout); the SUCCESS/ERROR fallbacks fill in when
// Mailchimp answers but sends no message text.
const NETWORK_ERROR = "Network error — please try again.";
const SUCCESS_FALLBACK = "You're on the list.";
const ERROR_FALLBACK = "Something went wrong — please try again.";

/**
 * Subscribe an email to the configured Mailchimp audience.
 *
 * Resolves (never rejects) with a discriminated result so the caller can render
 * success/error branches without a try/catch. On network failure we resolve
 * `ok: false` rather than throwing.
 */
export function subscribe(email: string): Promise<SubscribeResult> {
  // Parse the configured URL once. The JSONP endpoint is the same URL with the
  // trailing `/post` path segment swapped for `/post-json`; anchoring to the
  // pathname end leaves the query string (which contains no `/post`) untouched.
  const endpoint = new URL(MAILCHIMP_URL);
  const u = endpoint.searchParams.get("u");
  const id = endpoint.searchParams.get("id");
  endpoint.pathname = endpoint.pathname.replace(/\/post$/, "/post-json");
  endpoint.searchParams.set("EMAIL", email);
  // Mailchimp's honeypot: a field named `b_<u>_<id>` that must arrive empty.
  // Real submitters leave it blank; bots that fill every field get rejected.
  if (u && id) endpoint.searchParams.set(`b_${u}_${id}`, "");

  return new Promise((resolve) => {
    const callbackName = `__mcjsonp_${callbackSeq++}`;
    endpoint.searchParams.set("c", callbackName);

    const script = document.createElement("script");
    const globals = window as unknown as Record<string, unknown>;
    let settled = false;
    let timer = 0;

    const finish = (result: SubscribeResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      delete globals[callbackName];
      script.remove();
      resolve(result);
    };

    globals[callbackName] = (data: { result?: string; msg?: string }) => {
      const text = stripTags(data.msg);
      finish(
        data.result === "success"
          ? { ok: true, message: text || SUCCESS_FALLBACK }
          : { ok: false, message: text || ERROR_FALLBACK },
      );
    };

    script.onerror = () => finish({ ok: false, message: NETWORK_ERROR });
    timer = window.setTimeout(
      () => finish({ ok: false, message: NETWORK_ERROR }),
      RESPONSE_TIMEOUT_MS,
    );

    script.src = endpoint.toString();
    document.body.appendChild(script);
  });
}

// Mailchimp returns human-facing text, sometimes wrapped in HTML (e.g. an
// "update your profile" link for an already-subscribed address). Strip tags so
// we never inject markup; returns "" when nothing is left, letting the caller
// pick a fallback line.
function stripTags(raw: string | undefined): string {
  return raw?.replace(/<[^>]*>/g, "").trim() ?? "";
}
