import { NextRequest, NextResponse } from 'next/server'
import { sendSignupOTP } from '@/lib/email'

/**
 * Send a signup OTP email for new manual registrations.
 * POST /api/email/signup-otp
 *
 * Body:
 * {
 *   email: string
 *   otp: string
 *   userName: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, userName } = body

    if (!email || !otp || !userName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: email, otp, userName' },
        { status: 400 }
      )
    }

    const sent = await sendSignupOTP(email, otp, userName)

    if (!sent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP email.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: `OTP email sent to ${email}` })
  } catch (error) {
    console.error('[API /email/signup-otp] Error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
