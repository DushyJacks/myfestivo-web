import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin-server'
import { sendCollegeOTP } from '@/lib/email'
import { saveOtp, clearOtp } from '@/lib/otp-store'
import { isRateLimited, getClientIp } from '@/lib/rate-limit'

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
    // 1. Rate Limiting (5 requests per minute per IP)
    const ip = getClientIp(request)
    if (isRateLimited(ip, 'send-college-otp', { limit: 5, windowMs: 60000 })) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { uid, collegeEmail } = body

    if (!uid || typeof uid !== 'string' || !collegeEmail || typeof collegeEmail !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    const sanitizedEmail = collegeEmail.trim().toLowerCase()

    // Enforce hardcoded domain
    if (!sanitizedEmail.endsWith(`@${COLLEGE_DOMAIN}`)) {
      return NextResponse.json(
        { success: false, message: `College email must end with @${COLLEGE_DOMAIN}` },
        { status: 400 }
      )
    }

    // Use Admin SDK to bypass Firestore security rules on the server
    const adminDb = await getAdminDb()

    // Verify user exists in Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get()
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Clear any previous OTP for this user
    clearOtp(uid)

    // Generate OTP and store in server-side memory (2-minute TTL, no Firestore)
    const otp = generateOTP()
    saveOtp(uid, otp, sanitizedEmail)

    // Send OTP via Resend
    const emailSent = await sendCollegeOTP(sanitizedEmail, otp, COLLEGE_DOMAIN)

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
