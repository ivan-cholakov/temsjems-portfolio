import Link from "next/link";

const ITEMS = [
  { href: "/",        label: "Home" },
  { href: "/work",    label: "Work" },
  { href: "/about",   label: "About" },
  { href: "/blog",    label: "Blog" },
  { href: "/contact", label: "Contact" },
];

// On desktop, "About" is anchored to the top-right of the hero, so the
// left rail only carries the rest. The mobile top bar keeps all four.
const RAIL_ITEMS = ITEMS.filter((i) => i.href !== "/about");

/**
 * analog.glass-style chrome: fixed left rail with nav pinned to the
 * bottom, transparent background, no border. On mobile, a thin sticky
 * top bar with the same links inline.
 */
export function Sidebar() {
  return (
    <>
      {/* ─────────────── Mobile top bar ─────────────── */}
      <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-[2px] md:hidden">
        <nav
          aria-label="Primary"
          className="flex items-center justify-end gap-5 px-6 py-4"
        >
          {ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="eyebrow underline-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* ─────────────── Desktop left rail ─────────────── */}
      <aside
        aria-label="Primary"
        className="pointer-events-none hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:w-[260px] md:flex-col md:justify-end md:px-7 md:pb-10"
      >
        <nav className="pointer-events-auto">
          <ul className="space-y-2">
            {RAIL_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-h3 font-bold tracking-tight underline-link"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
