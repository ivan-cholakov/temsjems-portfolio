import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Sidebar } from "@/components/Sidebar";
import { Hero } from "@/components/Hero";
import { SITE } from "@/content/site";

const PLAUSIBLE_SRC = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC;
const PLAUSIBLE_INIT = `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`;
const ANALYTICS_ENABLED = process.env.NODE_ENV === "production" && Boolean(PLAUSIBLE_SRC);

// Playfair Display — high-contrast Didone with romantic curves; mirrors the
// flowing serifed "M" of the logo better than Cinzel's monumental Roman caps.
const display = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
// Cormorant Garamond — refined serif for body text, harmonises with Cinzel.
const body = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
// JetBrains Mono — industrial counterweight for eyebrow / caption labels.
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.artist}`, template: `%s — ${SITE.name}` },
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
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.artist}`,
    description: SITE.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.artist}`,
    description: SITE.tagline,
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
          <Hero />
          {children}
        </main>
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
