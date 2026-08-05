"use client"

import { useAuth, AuthProvider } from "@/lib/auth-context"
import { EventsProvider } from "@/lib/events-context"
import { ThemeProvider } from "@/lib/theme-context"
import { ProfileCompleteModal } from "@/components/ui/ProfileCompleteModal"
import { GlobalTermsModal } from "@/components/ui/TermsModal"

/**
 * Inner wrapper that bridges AuthContext → EventsProvider.
 * EventsProvider needs to know when auth has resolved so it can safely open
 * the Firestore listener without hitting PERMISSION_DENIED errors.
 */
function EventsProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  // authReady = true once Firebase Auth has finished restoring the session
  const authReady = !authLoading
  const authUid = user?.id ?? null

  return (
    <EventsProvider authReady={authReady} authUid={authUid}>
      {children}
    </EventsProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EventsProviderWithAuth>
          {children}
          {/* Profile completion modal — appears when a new Google user has no college set */}
          <ProfileCompleteModal />
          {/* Legal acceptance modal — appears for any logged-in user who hasn't accepted T&C + Privacy */}
          <GlobalTermsModal />
        </EventsProviderWithAuth>
      </AuthProvider>
    </ThemeProvider>
  )
}
