"use client";

import { useState } from "react";

import { track } from "@/lib/analytics";
import { subscribe } from "@/lib/mailchimp";

// Submit lifecycle as a sum type — no invalid combinations of loading/error/done
// booleans, and each state carries exactly the data that state needs.
type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.status === "submitting") return;

    setState({ status: "submitting" });
    const result = await subscribe(email);

    if (result.ok) {
      track("Newsletter Signup");
      setState({ status: "success", message: result.message });
      setEmail("");
    } else {
      setState({ status: "error", message: result.message });
    }
  };

  if (state.status === "success") {
    return (
      <p role="status" className="max-w-[30ch] text-lead leading-snug text-ink">
        {state.message}
      </p>
    );
  }

  const submitting = state.status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="max-w-[30rem]">
      <div className="flex items-end gap-4 border-b border-ink/30 focus-within:border-ink">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@email.com"
          aria-label="Email address"
          disabled={submitting}
          className="min-w-0 flex-1 bg-transparent py-2 text-lead leading-tight placeholder:text-mute/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="eyebrow underline-link shrink-0 pb-2 font-bold text-ink disabled:opacity-40"
        >
          {submitting ? "Sending…" : "Subscribe →"}
        </button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="mt-3 max-w-[36ch] text-sm leading-snug text-mute">
          {state.message}
        </p>
      )}
    </form>
  );
}
