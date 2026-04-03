import type { Metadata } from "next"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { ReactNode } from "react"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://myfestivo.live"

interface EventLayoutProps {
  children: ReactNode
  params: Promise<{
    id: string
  }>
}

/**
 * Fetch event data to generate dynamic metadata
 */
async function getEventData(eventId: string) {
  try {
    const eventDoc = await getDoc(doc(db, "events", eventId))
    if (eventDoc.exists()) {
      return eventDoc.data()
    }
  } catch (error) {
    console.error("Error fetching event for metadata:", error)
  }
  return null
}

/**
 * Generate dynamic metadata for event pages
 */
export async function generateMetadata(
  { params }: EventLayoutProps
): Promise<Metadata> {
  const { id } = await params
  const eventData = await getEventData(id)

  if (!eventData) {
    return {
      title: "Event Not Found — MyFestivo",
      description: "The event you're looking for doesn't exist.",
    }
  }

  const eventTitle = eventData.title || "Event"
  const eventDescription = eventData.description || "Check out this event on MyFestivo"
  const eventUrl = `${APP_URL}/events/${id}`

  return {
    title: `${eventTitle} — MyFestivo`,
    description: eventDescription,
    openGraph: {
      title: `${eventTitle} — MyFestivo`,
      description: eventDescription,
      url: eventUrl,
      siteName: "MyFestivo",
      images: [
        {
          url: `${APP_URL}/logo.png`,
          width: 1200,
          height: 630,
          alt: `${eventTitle} - MyFestivo`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${eventTitle} — MyFestivo`,
      description: eventDescription,
      images: [`${APP_URL}/logo.png`],
    },
  }
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  return <>{children}</>
}
