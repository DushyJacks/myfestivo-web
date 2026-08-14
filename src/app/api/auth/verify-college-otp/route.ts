import { NextRequest, NextResponse } from 'next/server'
import { db as getDb } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { verifyAndConsumeOtp } from '@/lib/otp-store'

/**
 * Verify college email OTP and link college email
 * POST /api/auth/verify-college-otp
 *
 * Body: { uid: string, otp: string }
 * Returns: { success: boolean, message: string, collegeEmail?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, otp } = body

    if (!uid || !otp) {
      return NextResponse.json(
        { success: false, message: 'Missing uid or otp' },
        { status: 400 }
      )
    }

    // Verify OTP against in-memory store (no Firestore reads required)
    const result = verifyAndConsumeOtp(uid, otp)

    if (!result) {
      // Could be: no OTP found, OTP expired, or OTP mismatch
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 }
      )
    }

    const { collegeEmail } = result

    // Confirm user still exists before writing
    const userDoc = await getDoc(doc(getDb(), 'users', uid))
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Persist verified college email to Firestore user document
    await updateDoc(doc(getDb(), 'users', uid), {
      collegeEmail,
      collegeEmailVerified: true,
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
