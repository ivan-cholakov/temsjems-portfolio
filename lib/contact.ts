import { SITE } from "@/content/site";
import { HONEYPOT_FIELD } from "@/functions/contact/contract.js";

export type Enquiry = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export type Delivery =
  | { kind: "endpoint"; url: string }
  | { kind: "mailto"; address: string };

export const DELIVERY: Delivery = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT
  ? { kind: "endpoint", url: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT }
  : { kind: "mailto", address: SITE.email };

export type SendResult =
  | { ok: true }
  | { ok: false; message: string };

const RESPONSE_TIMEOUT_MS = 15_000;

const FIELD_NAMES: Record<keyof Enquiry, string> = {
  firstName: "first name",
  lastName: "last name",
  email: "email address",
  message: "message",
};

const SEND_FAILED = `Your message could not be sent. Please try again, or write to ${SITE.email}.`;
const RATE_LIMITED = `Too many messages from this connection. Please try again later, or write to ${SITE.email}.`;

export async function sendEnquiry(
  url: string,
  enquiry: Enquiry,
  honeypot: string,
): Promise<SendResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...enquiry, [HONEYPOT_FIELD]: honeypot }),
      signal: AbortSignal.timeout(RESPONSE_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, message: SEND_FAILED };
  }

  if (response.ok) return { ok: true };
  if (response.status === 429) return { ok: false, message: RATE_LIMITED };
  if (response.status === 400) {
    const body: { fields?: unknown } | null = await response.json().catch(() => null);
    const names = Array.isArray(body?.fields)
      ? body.fields.filter(isEnquiryField).map((f) => FIELD_NAMES[f])
      : [];
    if (names.length > 0) return { ok: false, message: `Please check your ${listOf(names)}.` };
  }
  return { ok: false, message: SEND_FAILED };
}

export function mailtoHref(address: string, enquiry: Enquiry): string {
  const subject = `Website enquiry - ${enquiry.firstName} ${enquiry.lastName}`.trim();
  const body = [
    `From: ${enquiry.firstName} ${enquiry.lastName}`,
    `Email: ${enquiry.email}`,
    "",
    enquiry.message,
  ].join("\n");
  return (
    `mailto:${address}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}

function isEnquiryField(value: unknown): value is keyof Enquiry {
  return typeof value === "string" && Object.hasOwn(FIELD_NAMES, value);
}

function listOf(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
