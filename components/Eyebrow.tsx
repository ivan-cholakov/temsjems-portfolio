import type { ReactNode } from "react";

/**
 * Uppercase, mono, tracked-out brutalist caption.
 *
 * `size` picks a step of the mono label tier, quietest to loudest: a `badge`
 * stamps a number on an image, an `eyebrow` captions, a `label` names a group
 * inside a page's copy, and a `section` divides the page itself. Passing the
 * step as a prop keeps the choice a checked value rather than a utility class
 * each caller has to remember to override with.
 */
type Size = "badge" | "eyebrow" | "label" | "section";

const SIZE_CLASS: Record<Size, string> = {
  badge: "text-badge",
  eyebrow: "text-eyebrow",
  label: "text-label",
  section: "text-section",
};

export function Eyebrow({
  children,
  as: Tag = "span",
  size = "eyebrow",
  className = "",
}: {
  children: ReactNode;
  as?: "span" | "p" | "div" | "h2" | "h3" | "dt" | "figcaption";
  size?: Size;
  className?: string;
}) {
  return <Tag className={`eyebrow ${SIZE_CLASS[size]} ${className}`}>{children}</Tag>;
}
