import { NextRequest, NextResponse } from 'next/server'
import { db as getDb } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { sendCollegeOTP } from '@/lib/email'

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
 * Body:
 * {
 *   uid: string,
 *   collegeEmail: string,
 *   collegeDomain: string
 * }
 * 
 * Returns:
 * { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, collegeEmail, collegeDomain } = body

    if (!uid || !collegeEmail || !collegeDomain) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user exists
    const userDoc = await getDoc(doc(getDb(), 'users', uid))
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate OTP
    const otp = generateOTP()

    // Store OTP in a temporary collection with expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await setDoc(doc(getDb(), 'collegeOtps', uid), {
      otp,
      collegeEmail,
      collegeDomain,
      createdAt: new Date().toISOString(),
      expiresAt,
    })

    // Send email with OTP
    const emailSent = await sendCollegeOTP(collegeEmail, otp, collegeDomain)

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

