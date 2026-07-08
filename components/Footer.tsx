import { NewsletterForm } from "@/components/NewsletterForm";
import { Eyebrow } from "@/components/Eyebrow";
import { SITE } from "@/content/site";

/**
 * Site-wide footer. Rendered once from the root layout, so it appears on every
 * page. Left padding clears the fixed 260px desktop rail (mirrors the Contact
 * page's `md:pl-[300px]`) so the content never sits under the nav.
 */
export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/15 md:mt-32">
      <div className="max-w-[1600px] px-6 py-16 md:py-20 md:pl-[300px] md:pr-10">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 md:col-span-7">
            <Eyebrow as="p" className="text-mute">── Newsletter</Eyebrow>
            <h2 className="mt-6 text-h2 font-bold tracking-tight">
              Join the list.
            </h2>
            <p className="mt-6 max-w-[46ch] text-lead leading-snug text-ink">
              New work, exhibitions, and the occasional note from me.
              No noise, unsubscribe anytime.
            </p>
            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow text-mute">© {SITE.name}</p>
        </div>
      </div>
    </footer>
  );
}
