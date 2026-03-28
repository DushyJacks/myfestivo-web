"use client"

import { AuthProvider } from "@/lib/auth-context"
import { EventsProvider } from "@/lib/events-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EventsProvider>
        {children}
      </EventsProvider>
    </AuthProvider>
  )
}
