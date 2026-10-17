import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteName, siteUrl } from "./site";

// Fonts aren't preloaded: text paints at once in next/font's size-matched fallback (display: swap), so the
// font files needn't compete with the first paint.
const jakarta = Plus_Jakarta_Sans({ preload: false, subsets: ["latin"], weight: ["500", "800"], variable: "--font-jakarta", display: "swap" });

const title = "Notifications | Notifications Page";
const description =
  "A Frontend Mentor notifications page: read seven notifications and mark them read individually or all at once. Practice demo; changes stay on this page.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName, title, description, locale: "en_US" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = { themeColor: "#f7fafd" };

const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
