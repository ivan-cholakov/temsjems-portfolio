"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

import { track, type AnalyticsEvent } from "@/lib/analytics";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick"> & {
  event: AnalyticsEvent;
  children: ReactNode;
};

export function TrackedLink({ event, children, ...rest }: Props) {
  return (
    <a {...rest} onClick={() => track(event)}>
      {children}
    </a>
  );
}
