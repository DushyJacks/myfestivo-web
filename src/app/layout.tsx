import type { Metadata, Viewport } from "next";
import { BackgroundWrapper } from "@/components/three/BackgroundWrapper";
import { Providers } from "./providers";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://myfestivo.live"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "MyFestivo — College Event Management Platform",
    template: "%s | MyFestivo",
  },
  description:
    "MyFestivo is the all-in-one college event management platform. Discover, register, and host college fests, cultural events, tech hackathons, and sports events — all in one place.",
  keywords: [
    "college event management",
    "college fest platform",
    "student event registration",
    "event hosting platform",
    "college events India",
    "inter college events",
    "college hackathon",
    "cultural fest",
    "MyFestivo",
  ],
  authors: [{ name: "MyFestivo Team", url: APP_URL }],
  creator: "MyFestivo",
  publisher: "MyFestivo",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: APP_URL,
  },
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyFestivo",
  },
  openGraph: {
    title: "MyFestivo — College Event Management Platform",
    description:
      "Discover, register, and host college fests, cultural events, tech hackathons, and sports events — all in one place.",
    url: APP_URL,
    siteName: "MyFestivo",
    locale: "en_IN",
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MyFestivo — College Event Management Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyFestivo — College Event Management Platform",
    description:
      "Discover, register, and host college fests, cultural events, tech hackathons, and sports events.",
    images: [`${APP_URL}/og-image.png`],
    site: "@myfestivo",
    creator: "@myfestivo",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* Dark mode is permanent — class is hardcoded, no script flash needed */
    <html lang="en" className="h-full antialiased dark" style={{ colorScheme: "dark", backgroundColor: "#000000" }} suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/favicon.jpg" type="image/jpeg" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />

        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />

        {/* JSON-LD — Organization + WebSite structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "MyFestivo",
                url: APP_URL,
                logo: {
                  "@type": "ImageObject",
                  url: `${APP_URL}/logo.png`,
                  width: 120,
                  height: 40,
                },
                description:
                  "MyFestivo is the all-in-one college event management platform for student organizers and participants in India.",
                contactPoint: {
                  "@type": "ContactPoint",
                  email: "myfestivo@gmail.com",
                  contactType: "customer support",
                },
                sameAs: [],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "MyFestivo",
                url: APP_URL,
                description:
                  "Discover, register, and host college fests, cultural events, tech hackathons, and sports events — all in one place.",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${APP_URL}/events?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
                hasPart: [
                  { "@type": "WebPage", name: "Browse Events", url: `${APP_URL}/events` },
                  { "@type": "WebPage", name: "Create Account", url: `${APP_URL}/signup` },
                  { "@type": "WebPage", name: "Sign In", url: `${APP_URL}/login` },
                  { "@type": "WebPage", name: "Site Map", url: `${APP_URL}/sitemap-page` },
                ],
              },
            ]),
          }}
        />

        {/* Dark mode is always on — no inline script needed */}
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:font-medium"
        >
          Skip to main content
        </a>
        <BackgroundWrapper />
        <Providers>
          <div className="relative z-10 flex-1 flex flex-col" id="main-content">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
