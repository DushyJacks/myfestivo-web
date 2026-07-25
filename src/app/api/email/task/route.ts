import { NextRequest, NextResponse } from 'next/server'
import { sendTaskAssignment } from '@/lib/email'

/**
 * Send task assignment email to the assignee
 * POST /api/email/task
 *
 * Body:
 * {
 *   toEmail: string
 *   assigneeName: string
 *   taskTitle: string
 *   taskDescription: string
 *   eventTitle: string
 *   deadline: string
 *   assignedBy: string
 *   eventId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toEmail, assigneeName, taskTitle, taskDescription, eventTitle, deadline, assignedBy, eventId } = body

    if (!toEmail || !taskTitle || !eventTitle || !eventId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: toEmail, taskTitle, eventTitle, eventId' },
        { status: 400 }
      )
    }

    const sent = await sendTaskAssignment(
      toEmail,
      assigneeName || 'Assignee',
      taskTitle,
      taskDescription || '',
      eventTitle,
      deadline || 'No deadline set',
      assignedBy || 'Event Organizer',
      eventId
    )

    if (!sent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send task assignment email.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: `Task assignment email sent to ${toEmail}` })
  } catch (error) {
    console.error('[API /email/task] Error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
