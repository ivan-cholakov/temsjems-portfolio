"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/",        label: "Home" },
  { href: "/work",    label: "Work" },
  { href: "/about",   label: "About" },
  { href: "/blog",    label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  // Closes over the current pathname so call sites pass only the href -
  // no pair of same-typed string params to transpose.
  const isActive = (href: string): boolean => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* ─────────────── Mobile top bar ─────────────── */}
      <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-[2px] md:hidden">
        <nav
          aria-label="Primary"
          className="flex items-center justify-end gap-5 px-6 py-4"
        >
          {ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`eyebrow underline-link transition-colors ${
                  active ? "font-bold text-ink" : "text-mute"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ─────────────── Desktop left rail ─────────────── */}
      <aside
        aria-label="Primary"
        className="pointer-events-none hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:w-rail md:flex-col md:justify-end md:px-7 md:pb-10"
      >
        <nav className="pointer-events-auto">
          <ul className="space-y-2">
            {ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-[clamp(1.5rem,2.4vw,1.875rem)] tracking-tight underline-link transition-colors ${
                      active
                        ? "font-bold text-ink"
                        : "font-medium text-mute"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
