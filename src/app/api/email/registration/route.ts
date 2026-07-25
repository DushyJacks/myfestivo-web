import { NextRequest, NextResponse } from 'next/server'
import { sendRegistrationConfirmation } from '@/lib/email'

/**
 * Send registration confirmation email
 * POST /api/email/registration
 *
 * Body:
 * {
 *   toEmail: string
 *   userName: string
 *   eventTitle: string
 *   subEventName: string
 *   eventDate: string
 *   eventVenue: string
 *   eventId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toEmail, userName, eventTitle, subEventName, eventDate, eventVenue, eventId } = body

    if (!toEmail || !eventTitle || !eventId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: toEmail, eventTitle, eventId' },
        { status: 400 }
      )
    }

    const sent = await sendRegistrationConfirmation(
      toEmail,
      userName || 'Participant',
      eventTitle,
      subEventName || 'Event',
      eventDate || '',
      eventVenue || '',
      eventId
    )

    if (!sent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send registration email.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: `Registration email sent to ${toEmail}` })
  } catch (error) {
    console.error('[API /email/registration] Error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
