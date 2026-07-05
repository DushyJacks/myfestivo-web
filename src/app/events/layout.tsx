import type { Metadata } from "next"
import EventsLayoutClient from "./events-layout-client"

export const metadata: Metadata = {
  title: "Browse Events — Discover College Fests & Competitions | MyFestivo",
  description:
    "Browse and register for college events, cultural fests, technical competitions, sports events, and workshops across India. Filter by category, price, and event type on MyFestivo.",
  keywords: [
    "college events",
    "college fest",
    "student events",
    "inter college events",
    "college competitions",
    "cultural fest",
    "technical events",
    "sports events college",
  ],
  alternates: {
    canonical: "https://myfestivo.live/events",
  },
  openGraph: {
    title: "Browse College Events — MyFestivo",
    description:
      "Find and register for the best college fests, cultural events, technical competitions, and sports events.",
    url: "https://myfestivo.live/events",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse College Events — MyFestivo",
    description:
      "Find and register for the best college fests, cultural events, technical competitions, and sports events.",
  },
}


export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <EventsLayoutClient>{children}</EventsLayoutClient>
}
