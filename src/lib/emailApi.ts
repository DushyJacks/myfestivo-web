/**
 * emailApi.ts — Client-safe fetch wrappers for the Gmail email API routes.
 *
 * These functions run in the browser and POST to the Next.js server-side
 * API routes, which in turn use Nodemailer (server-only) to send real emails.
 *
 * All functions are fire-and-forget safe: they never throw — they log errors
 * to the console so a failed email never breaks the UI flow.
 */

// ─── Registration Confirmation ────────────────────────────────────────────────

export async function emailRegistrationConfirmation(params: {
  toEmail: string
  userName: string
  eventTitle: string
  subEventName: string
  eventDate: string
  eventVenue: string
  eventId: string
  subEventId: string
  registrationId: string
}): Promise<void> {
  try {
    const res = await fetch('/api/email/registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    if (!data.success) {
      console.warn('[emailApi] Registration email failed:', data.message)
    } else {
      console.log('[emailApi] Registration email sent →', params.toEmail)
    }
  } catch (error) {
    console.error('[emailApi] emailRegistrationConfirmation error:', error)
  }
}

// ─── Announcement Notification ────────────────────────────────────────────────

export async function emailAnnouncementNotification(params: {
  recipients: Array<{ email: string; name: string }>
  eventTitle: string
  announcementTitle: string
  announcementMessage: string
  eventId: string
}): Promise<void> {
  try {
    const res = await fetch('/api/email/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    if (!data.success) {
      console.warn('[emailApi] Announcement email failed:', data.message)
    } else {
      console.log(`[emailApi] Announcement emails → ${data.sent} sent, ${data.failed} failed`)
    }
  } catch (error) {
    console.error('[emailApi] emailAnnouncementNotification error:', error)
  }
}

// ─── Task Assignment ──────────────────────────────────────────────────────────

export async function emailTaskAssignment(params: {
  toEmail: string
  assigneeName: string
  taskTitle: string
  taskDescription: string
  eventTitle: string
  deadline: string
  assignedBy: string
  eventId: string
}): Promise<void> {
  try {
    const res = await fetch('/api/email/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    if (!data.success) {
      console.warn('[emailApi] Task email failed:', data.message)
    } else {
      console.log('[emailApi] Task assignment email sent →', params.toEmail)
    }
  } catch (error) {
    console.error('[emailApi] emailTaskAssignment error:', error)
  }
}

// ─── Signup OTP ───────────────────────────────────────────────────────────────

export async function emailSignupOTP(params: {
  email: string
  otp: string
  userName: string
}): Promise<void> {
  try {
    const res = await fetch('/api/email/signup-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    if (!data.success) {
      console.warn('[emailApi] Signup OTP email failed:', data.message)
    } else {
      console.log('[emailApi] Signup OTP email sent →', params.email)
    }
  } catch (error) {
    console.error('[emailApi] emailSignupOTP error:', error)
  }
}

// ─── Team Invitation ──────────────────────────────────────────────────────────

export async function emailTeamInvitation(params: {
  toEmail: string
  captainName: string
  teamName: string
  eventTitle: string
  subEventName: string
  eventId: string
}): Promise<void> {
  try {
    const res = await fetch('/api/email/team-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    if (!data.success) {
      console.warn('[emailApi] Team invitation email failed:', data.message)
    } else {
      console.log('[emailApi] Team invitation email sent →', params.toEmail)
    }
  } catch (error) {
    console.error('[emailApi] emailTeamInvitation error:', error)
  }
}
