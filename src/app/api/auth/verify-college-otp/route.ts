import { NextRequest, NextResponse } from 'next/server'
import { db as getDb } from '@/lib/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'

/**
 * Verify college email OTP and link college email
 * POST /api/auth/verify-college-otp
 * 
 * Body:
 * {
 *   uid: string,
 *   otp: string
 * }
 * 
 * Returns:
 * { success: boolean, message: string, collegeEmail?: string }
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

    // Retrieve stored OTP
    const otpDoc = await getDoc(doc(getDb(), 'collegeOtps', uid))
    if (!otpDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'No OTP found. Please request a new one.' },
        { status: 404 }
      )
    }

    const otpData = otpDoc.data()
    const currentTime = new Date()
    const expiresAt = new Date(otpData.expiresAt)

    // Check if OTP is expired
    if (currentTime > expiresAt) {
      await deleteDoc(doc(getDb(), 'collegeOtps', uid))
      return NextResponse.json(
        { success: false, message: 'OTP expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (otp !== otpData.otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Get user document
    const userDoc = await getDoc(doc(getDb(), 'users', uid))
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Update user with verified college email
    const collegeEmail = otpData.collegeEmail
    await updateDoc(doc(getDb(), 'users', uid), {
      collegeEmail,
      collegeEmailVerified: true,
    })

    // Delete OTP document
    await deleteDoc(doc(getDb(), 'collegeOtps', uid))

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
