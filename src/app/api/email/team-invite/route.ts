import { NextRequest, NextResponse } from 'next/server'
import { sendTeamInvitation } from '@/lib/email'

/**
 * Send team invitation email
 * POST /api/email/team-invite
 *
 * Body:
 * {
 *   toEmail: string
 *   captainName: string
 *   teamName: string
 *   eventTitle: string
 *   subEventName: string
 *   eventId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toEmail, captainName, teamName, eventTitle, subEventName, eventId } = body

    if (!toEmail || !eventTitle || !eventId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: toEmail, eventTitle, eventId' },
        { status: 400 }
      )
    }

    const sent = await sendTeamInvitation(
      toEmail,
      captainName || 'A teammate',
      teamName || 'a team',
      eventTitle,
      subEventName || 'Event',
      eventId
    )

    if (!sent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send team invitation email.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: `Team invitation sent to ${toEmail}` })
  } catch (error) {
    console.error('[API /email/team-invite] Error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
