import type { Metadata } from "next";
import { Instrument_Serif, Inter, Manrope, Sora } from "next/font/google";
import Script from "next/script";
import { ViewTransitions } from "next-view-transitions";
import type { ReactNode } from "react";
import { organizationSchema, seo, websiteSchema } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_HOST || seo.host),
  title: {
    default: seo.title,
    template: `%s — ${seo.name}`,
  },
  description: seo.description,
  applicationName: seo.name,
  keywords: [
    "branching stories",
    "collaborative writing",
    "interactive fiction",
    "web novels",
    "creator platform",
    "read and write",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: seo.host,
    siteName: seo.name,
    title: seo.title,
    description: seo.description,
  },
  twitter: {
    card: "summary_large_image",
    site: seo.twitter,
    title: seo.title,
    description: seo.description,
  },
  appleWebApp: {
    capable: true,
    title: seo.name,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default ({ children }: Readonly<{ children: ReactNode }>) => (
  <ViewTransitions>
    <html
      lang="en"
      className={`dark ${inter.variable} ${sora.variable} ${manrope.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "development" ? (
          <Script
            src="https://unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        ) : null}
      </head>
      <body className="bg-background font-body text-foreground antialiased">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {children}
      </body>
    </html>
  </ViewTransitions>
);
