import type { ReactNode } from "react";

/** Uppercase, mono, tracked-out brutalist caption. */
export function Eyebrow({
  children,
  as: Tag = "span",
  className = "",
}: {
  children: ReactNode;
  as?: "span" | "p" | "div" | "h2" | "h3" | "dt" | "figcaption";
  className?: string;
}) {
  return <Tag className={`eyebrow ${className}`}>{children}</Tag>;
}
