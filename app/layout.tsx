import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Sidebar } from "@/components/Sidebar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { SITE, OG_IMAGE } from "@/content/site";

const PLAUSIBLE_SRC = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC;
const PLAUSIBLE_INIT = `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`;
const ANALYTICS_ENABLED = process.env.NODE_ENV === "production" && Boolean(PLAUSIBLE_SRC);

// Only the weights the site actually renders are loaded (400 regular,
// 500 font-medium, 700 font-bold) - every extra weight is a preloaded
// woff2 competing with the LCP resource. `display: "optional"` keeps the
// first paint as the LCP anchor: on a slow first visit the fallback serif
// stays for that page-load and the webfont appears from cache thereafter,
// instead of a late swap dragging LCP out.

// Playfair Display - high-contrast Didone with romantic curves; mirrors the
// flowing serifed "M" of the logo better than Cinzel's monumental Roman caps.
const display = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "optional",
});
// Cormorant Garamond - refined serif for body text, harmonises with Cinzel.
const body = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "optional",
});
// JetBrains Mono - industrial counterweight for eyebrow / caption labels.
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}`, template: `%s - ${SITE.name}` },
  description: SITE.bio.slice(0, 200),
  applicationName: SITE.name,
  authors: [{ name: SITE.artist }],
  creator: SITE.artist,
  keywords: [
    SITE.artist,
    SITE.name,
    "linocut",
    "watercolor",
    "printmaking",
    "Bulgarian visual artist",
    "Sofia",
    "contemporary art",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/", // resolved against metadataBase - the trailing-slash form the site serves

    siteName: SITE.name,
    title: `${SITE.name}`,
    description: SITE.tagline,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}`,
    description: SITE.tagline,
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-ink">
        <Sidebar />
        <main>
          {/* Hero is a full-bleed banner at the top; it never reaches the
              bottom-left menu, so it stays full width. */}
          <Hero />
          {/* Inset page content by the rail width on desktop so the fixed
              left menu never overlaps it. */}
          <div className="md:pl-rail">{children}</div>
        </main>
        <Footer />
        {ANALYTICS_ENABLED && PLAUSIBLE_SRC && (
          <>
            <Script src={PLAUSIBLE_SRC} strategy="afterInteractive" />
            <Script id="plausible-init" strategy="afterInteractive">
              {PLAUSIBLE_INIT}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
