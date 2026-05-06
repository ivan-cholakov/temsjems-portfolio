export type AnalyticsEvent =
  | "Outbound: Email"
  | "Outbound: Instagram"
  | "Outbound: TikTok"
  | "Outbound: Pinterest"
  | "Contact Form Submit";

type Plausible = (
  event: string,
  options?: { props?: Record<string, string | number | boolean> },
) => void;

declare global {
  interface Window {
    plausible?: Plausible;
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.plausible?.(event);
}
