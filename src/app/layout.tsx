import type { Metadata } from "next";
import { BackgroundWrapper } from "@/components/three/BackgroundWrapper";
import { Providers } from "./providers";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://myfestivo.live"

export const metadata: Metadata = {
  title: "MyFestivo — College Event Platform",
  description: "Your events. One place. Built for college events that actually happen.",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "MyFestivo — College Event Platform",
    description: "Your events. One place. Built for college events that actually happen.",
    url: APP_URL,
    siteName: "MyFestivo",
    images: [
      {
        url: `${APP_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "MyFestivo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyFestivo — College Event Platform",
    description: "Your events. One place. Built for college events that actually happen.",
    images: [`${APP_URL}/logo.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="icon" href="/favicon.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/favicon.jpg" type="image/jpeg" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:font-medium">
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
