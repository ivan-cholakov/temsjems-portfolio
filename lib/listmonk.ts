import { LISTMONK_LIST_UUID, LISTMONK_URL } from "@/content/site";

export type SubscribeResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

type AltchaChallenge = {
  algorithm: string;
  challenge: string;
  maxNumber: number;
  salt: string;
  signature: string;
};

const NETWORK_ERROR = "Network error - please try again.";
const ERROR_FALLBACK = "Something went wrong - please try again.";
const CONFIRM_MESSAGE = "Almost there - check your inbox to confirm.";
const SUBSCRIBED_MESSAGE = "You're on the list.";
const BATCH = 2000;

const encoder = new TextEncoder();

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function solve(c: AltchaChallenge): Promise<number> {
  for (let start = 0; start <= c.maxNumber; start += BATCH) {
    const numbers = Array.from({ length: Math.min(BATCH, c.maxNumber + 1 - start) }, (_, i) => start + i);
    const hashes = await Promise.all(numbers.map((n) => sha256Hex(c.salt + n)));
    const hit = hashes.indexOf(c.challenge);
    if (hit !== -1) return numbers[hit];
  }
  throw new Error("captcha unsolved");
}

async function captchaPayload(): Promise<string> {
  const res = await fetch(`${LISTMONK_URL}/api/public/captcha/altcha`);
  if (!res.ok) throw new Error("captcha challenge failed");
  const c: AltchaChallenge = await res.json();
  const number = await solve(c);
  return btoa(
    JSON.stringify({
      algorithm: c.algorithm,
      challenge: c.challenge,
      number,
      salt: c.salt,
      signature: c.signature,
    }),
  );
}

export async function subscribe(email: string): Promise<SubscribeResult> {
  try {
    const altcha = await captchaPayload();
    const res = await fetch(`${LISTMONK_URL}/api/public/subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: "", list_uuids: [LISTMONK_LIST_UUID], altcha }),
    });
    const body: { data?: { has_optin?: boolean }; message?: string } = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: body.message || ERROR_FALLBACK };
    return { ok: true, message: body.data?.has_optin ? CONFIRM_MESSAGE : SUBSCRIBED_MESSAGE };
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }
}
