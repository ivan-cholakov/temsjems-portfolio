"use client";

import { useState } from "react";

import { FIELD_LIMITS, HONEYPOT_FIELD } from "@/functions/contact/contract.js";
import { DELIVERY, mailtoHref, sendEnquiry, type Enquiry } from "@/lib/contact";
import { track } from "@/lib/analytics";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

const EMPTY: Enquiry = { firstName: "", lastName: "", email: "", message: "" };

export function ContactForm() {
  const [fields, setFields] = useState<Enquiry>(EMPTY);
  const [state, setState] = useState<State>({ status: "idle" });

  const update = <K extends keyof Enquiry>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (DELIVERY.kind === "mailto") {
      track("Contact Form Submit");
      window.location.href = mailtoHref(DELIVERY.address, fields);
      return;
    }

    if (state.status === "submitting") return;
    const honeypot = new FormData(e.currentTarget).get(HONEYPOT_FIELD);

    setState({ status: "submitting" });
    const result = await sendEnquiry(
      DELIVERY.url,
      fields,
      typeof honeypot === "string" ? honeypot : "",
    );

    if (result.ok) {
      track("Contact Form Submit");
      setState({ status: "sent", email: fields.email.trim() });
      setFields(EMPTY);
    } else {
      setState({ status: "error", message: result.message });
    }
  };

  if (state.status === "sent") {
    return (
      <p role="status" className="max-w-[60ch] text-lead leading-snug text-ink">
        Thank you, your message has been sent. You will hear back at {state.email}.
      </p>
    );
  }

  const submitting = state.status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="relative grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Field
        label="First name"
        required
        value={fields.firstName}
        onChange={update("firstName")}
        autoComplete="given-name"
        maxLength={FIELD_LIMITS.firstName}
        disabled={submitting}
      />
      <Field
        label="Last name"
        required
        value={fields.lastName}
        onChange={update("lastName")}
        autoComplete="family-name"
        maxLength={FIELD_LIMITS.lastName}
        disabled={submitting}
      />
      <Field
        label="Email"
        required
        type="email"
        value={fields.email}
        onChange={update("email")}
        autoComplete="email"
        maxLength={FIELD_LIMITS.email}
        disabled={submitting}
        className="sm:col-span-2"
      />
      <TextAreaField
        label="Message"
        required
        value={fields.message}
        onChange={update("message")}
        maxLength={FIELD_LIMITS.message}
        disabled={submitting}
        className="sm:col-span-2"
      />

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="eyebrow text-eyebrow underline-link font-bold text-ink disabled:opacity-40"
        >
          {submitting ? "Sending…" : "Send →"}
        </button>
        {state.status === "error" && (
          <p role="alert" className="mt-3 max-w-[60ch] text-sm leading-snug text-mute">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
  autoComplete,
  maxLength,
  disabled,
  className = "",
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  maxLength: number;
  disabled: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-eyebrow">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        maxLength={maxLength}
        disabled={disabled}
        className="mt-3 block w-full border-b border-ink/30 bg-transparent py-2 text-lead leading-tight focus:border-ink focus:outline-none"
      />
    </label>
  );
}

function TextAreaField({
  label,
  required,
  value,
  onChange,
  maxLength,
  disabled,
  className = "",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
  disabled: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-eyebrow">
        {label}
        {required ? " *" : ""}
      </span>
      <textarea
        rows={5}
        required={required}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        disabled={disabled}
        className="mt-3 block w-full resize-y border-b border-ink/30 bg-transparent py-2 leading-relaxed focus:border-ink focus:outline-none"
      />
    </label>
  );
}
