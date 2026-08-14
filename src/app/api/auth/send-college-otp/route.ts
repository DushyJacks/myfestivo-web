import { NextRequest, NextResponse } from 'next/server'
import { db as getDb } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { sendCollegeOTP } from '@/lib/email'
import { saveOtp, clearOtp } from '@/lib/otp-store'

const COLLEGE_DOMAIN = 'srmist.edu.in'

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send college email verification OTP
 * POST /api/auth/send-college-otp
 *
 * Body: { uid: string, collegeEmail: string }
 * Returns: { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, collegeEmail } = body

    if (!uid || !collegeEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Enforce hardcoded domain
    if (!collegeEmail.endsWith(`@${COLLEGE_DOMAIN}`)) {
      return NextResponse.json(
        { success: false, message: `College email must end with @${COLLEGE_DOMAIN}` },
        { status: 400 }
      )
    }

    // Verify user exists in Firestore
    const userDoc = await getDoc(doc(getDb(), 'users', uid))
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Clear any previous OTP for this user
    clearOtp(uid)

    // Generate OTP and store in server-side memory (2-minute TTL, no Firestore)
    const otp = generateOTP()
    saveOtp(uid, otp, collegeEmail)

    // Send OTP via Resend
    const emailSent = await sendCollegeOTP(collegeEmail, otp, COLLEGE_DOMAIN)

    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send email. Please check your email configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Verification email sent to ${collegeEmail}`,
    })
  } catch (error) {
    console.error('Error sending college OTP:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
