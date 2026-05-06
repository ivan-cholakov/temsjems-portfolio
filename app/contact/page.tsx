import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import { Eyebrow } from "@/components/Eyebrow";
import { TrackedLink } from "@/components/TrackedLink";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.artist} — collaborations, commissions, available work.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact — ${SITE.name}`,
    description: `Get in touch with ${SITE.artist}.`,
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      {/* ── Title slab ─────────────────────────────────────────────────
           Left padding is bumped past the desktop rail (260px) so the
           form and copy never sit beneath the nav. */}
      <section className="max-w-[1600px] px-6 pt-6 pb-16 md:pt-10 md:pb-24 md:pl-[300px] md:pr-10">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 md:col-span-9">
            <Eyebrow as="p" className="text-mute">── Get in touch</Eyebrow>
            <h2 className="mt-6 text-h1 font-bold tracking-tight">
              Contact.
            </h2>
            <p className="mt-8 max-w-[60ch] text-lead leading-snug">
              Whether you&rsquo;re interested in a collaboration or wish to acquire an
              available piece, please reach out directly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────────────────── */}
      <section className="max-w-[1600px] px-6 py-16 md:py-24 md:pl-[300px] md:pr-10">
        <div className="max-w-[640px]">
          <ContactForm />
        </div>
      </section>

      {/* ── Channels ─────────────────────────────────────────────────── */}
      <section className="max-w-[1600px] px-6 py-16 md:py-24 md:pl-[300px] md:pr-10">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
          <div>
            <dd className="mt-4 text-h3 font-bold tracking-tight">
              <TrackedLink
                event="Outbound: Email"
                href={`mailto:${SITE.email}`}
                className="underline-link break-all"
              >
                {SITE.email}
              </TrackedLink>
            </dd>
          </div>

          <div>
            <dd className="mt-4 text-h3 font-bold tracking-tight">
              {SITE.social.instagram ? (
                <TrackedLink
                  event="Outbound: Instagram"
                  href={`https://instagram.com/${SITE.social.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SITE.artist} on Instagram (@${SITE.social.instagram})`}
                  className="inline-flex items-center gap-3 underline-link"
                >
                  <InstagramIcon className="h-6 w-6" />
                  <span>@{SITE.social.instagram}</span>
                </TrackedLink>
              ) : (
                <span className="text-mute">— Coming soon</span>
              )}
            </dd>
          </div>

          <div>
            <dd className="mt-4 text-h3 font-bold tracking-tight">
              {SITE.social.tiktok ? (
                <TrackedLink
                  event="Outbound: TikTok"
                  href={`https://www.tiktok.com/@${SITE.social.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SITE.artist} on TikTok (@${SITE.social.tiktok})`}
                  className="inline-flex items-center gap-3 underline-link"
                >
                  <TikTokIcon className="h-6 w-6" />
                  <span>@{SITE.social.tiktok}</span>
                </TrackedLink>
              ) : (
                <span className="text-mute">— Coming soon</span>
              )}
            </dd>
          </div>

          <div>
            <dd className="mt-4 text-h3 font-bold tracking-tight">
              {SITE.social.pinterest ? (
                <TrackedLink
                  event="Outbound: Pinterest"
                  href={`https://www.pinterest.com/${SITE.social.pinterest}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SITE.artist} on Pinterest (@${SITE.social.pinterest})`}
                  className="inline-flex items-center gap-3 underline-link"
                >
                  <PinterestIcon className="h-6 w-6" />
                  <span>@{SITE.social.pinterest}</span>
                </TrackedLink>
              ) : (
                <span className="text-mute">— Coming soon</span>
              )}
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.5 7.6a6.3 6.3 0 0 1-3.7-1.2 6.3 6.3 0 0 1-2.4-3.9h-3v12.4a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .8.1V9.2a5.7 5.7 0 1 0 4.9 5.7V9.4a9.3 9.3 0 0 0 5.4 1.7v-3a6.3 6.3 0 0 1-.3 0z" />
    </svg>
  );
}

function PinterestIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M11 8.5c-1.7 0-3 1.3-3 3 0 1 .5 2 1.4 2.4l-.6 2.4c-.1.5-.5 2.5.6 3.4 0 0 1.7-1.6 2.2-3.6.2-1 .8-3.4.8-3.4.4.6 1.3 1 2 1 2.1 0 3.6-1.9 3.6-4.3 0-2.5-2-4.4-4.7-4.4-3.3 0-5 2.4-5 4.4 0 1.2.5 2.3 1.2 2.7.1.1.2 0 .2-.1l.2-.7c0-.1 0-.2-.1-.3-.3-.4-.5-.9-.5-1.5 0-1.9 1.4-3.6 3.7-3.6 2 0 3.1 1.2 3.1 2.9 0 2.2-1 4-2.4 4-.8 0-1.4-.7-1.2-1.5.2-1 .7-2.1.7-2.8 0-.6-.4-1.2-1.1-1.2z" />
    </svg>
  );
}
