import { NextRequest, NextResponse } from 'next/server'
import { sendAnnouncementNotification } from '@/lib/email'
import { isRateLimited, getClientIp } from '@/lib/rate-limit'

/**
 * Send announcement notification emails to all registered participants
 * POST /api/email/announcement
 *
 * Body:
 * {
 *   recipients: Array<{ email: string; name: string }>
 *   eventTitle: string
 *   announcementTitle: string
 *   announcementMessage: string
 *   eventId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (isRateLimited(ip, 'email-announcement', { limit: 20, windowMs: 60000 })) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { recipients, eventTitle, announcementTitle, announcementMessage, eventId } = body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing or empty recipients array' },
        { status: 400 }
      )
    }

    if (!eventTitle || !announcementTitle || !eventId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: eventTitle, announcementTitle, eventId' },
        { status: 400 }
      )
    }

    // Send to each recipient individually so emails are personalised
    const results = await Promise.allSettled(
      recipients.map(({ email, name }: { email: string; name: string }) =>
        sendAnnouncementNotification(
          email,
          name || 'Participant',
          eventTitle,
          announcementTitle,
          announcementMessage || '',
          eventId
        )
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled' && r.value).length
    const failed = results.length - sent

    console.log(`[API /email/announcement] Sent ${sent}/${results.length} emails (${failed} failed)`)

    return NextResponse.json({
      success: true,
      message: `Announcement emails sent: ${sent} succeeded, ${failed} failed`,
      sent,
      failed,
    })
  } catch (error) {
    console.error('[API /email/announcement] Error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
