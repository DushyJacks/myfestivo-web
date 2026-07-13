"use client"

import { AuthProvider } from "@/lib/auth-context"
import { EventsProvider } from "@/lib/events-context"
import { ThemeProvider } from "@/lib/theme-context"
import { ProfileCompleteModal } from "@/components/ui/ProfileCompleteModal"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EventsProvider>
          {children}
          {/* Profile completion modal — appears when a new Google user has no college set */}
          <ProfileCompleteModal />
        </EventsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
