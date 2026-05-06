"use client";

import { useState } from "react";

import { SITE } from "@/content/site";
import { track } from "@/lib/analytics";

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

const EMPTY: Fields = { firstName: "", lastName: "", email: "", message: "" };

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);

  const update = <K extends keyof Fields>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = `Website enquiry — ${fields.firstName} ${fields.lastName}`.trim();
    const body = [
      `From: ${fields.firstName} ${fields.lastName}`,
      `Email: ${fields.email}`,
      "",
      fields.message,
    ].join("\n");
    const href =
      `mailto:${SITE.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    track("Contact Form Submit");
    window.location.href = href;
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Field
        label="First name"
        required
        value={fields.firstName}
        onChange={update("firstName")}
        autoComplete="given-name"
      />
      <Field
        label="Last name"
        required
        value={fields.lastName}
        onChange={update("lastName")}
        autoComplete="family-name"
      />
      <Field
        label="Email"
        required
        type="email"
        value={fields.email}
        onChange={update("email")}
        autoComplete="email"
        className="sm:col-span-2"
      />
      <TextAreaField
        label="Message"
        value={fields.message}
        onChange={update("message")}
        className="sm:col-span-2"
      />

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="eyebrow underline-link font-bold text-ink"
        >
          Send →
        </button>
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
  className = "",
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-mute">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="mt-3 block w-full border-b border-ink/30 bg-transparent py-2 text-lead leading-tight focus:border-ink focus:outline-none"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-mute">{label}</span>
      <textarea
        rows={5}
        value={value}
        onChange={onChange}
        className="mt-3 block w-full resize-y border-b border-ink/30 bg-transparent py-2 leading-relaxed focus:border-ink focus:outline-none"
      />
    </label>
  );
}
