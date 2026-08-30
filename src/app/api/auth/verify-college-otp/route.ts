import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin-server'
import { verifyAndConsumeOtp } from '@/lib/otp-store'
import { isRateLimited, getClientIp } from '@/lib/rate-limit'

/**
 * Verify college email OTP and link college email
 * POST /api/auth/verify-college-otp
 *
 * Body: { uid: string, otp: string }
 * Returns: { success: boolean, message: string, collegeEmail?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (5 requests per minute per IP)
    const ip = getClientIp(request)
    if (isRateLimited(ip, 'verify-college-otp', { limit: 5, windowMs: 60000 })) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { uid, otp } = body

    if (!uid || typeof uid !== 'string' || !otp || typeof otp !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid uid or otp' },
        { status: 400 }
      )
    }

    // Basic sanitization
    const sanitizedUid = uid.trim()
    const sanitizedOtp = otp.trim()

    // Verify OTP against in-memory store (no Firestore reads required)
    const result = verifyAndConsumeOtp(sanitizedUid, sanitizedOtp)

    if (!result) {
      // Could be: no OTP found, OTP expired, or OTP mismatch
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 }
      )
    }

    const { collegeEmail } = result

    // Use Admin SDK to bypass Firestore security rules on the server
    const adminDb = await getAdminDb()

    // Confirm user still exists before writing
    const userDoc = await adminDb.collection('users').doc(sanitizedUid).get()
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Persist verified college email to Firestore user document
    await adminDb.collection('users').doc(sanitizedUid).update({
      collegeEmail,
      collegeEmailVerified: true,
      collegeEmailVerifiedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'College email verified successfully',
      collegeEmail,
    })
  } catch (error) {
    console.error('Error verifying college OTP:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
