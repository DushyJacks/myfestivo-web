import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin-server'
import { sendPasswordResetEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://myfestivo.live'

/**
 * Request a password reset email for a given address.
 * POST /api/auth/forgot-password
 *
 * Body: { email: string }
 * Returns: { success: boolean, message: string }
 *
 * NOTE: We intentionally return a generic success response even when the email
 * is not registered. This prevents user enumeration attacks.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Normalize
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const auth = await getAdminAuth()

      // Generate the reset link pointing to our custom /reset-password page
      const actionCodeSettings = {
        url: `${APP_URL}/reset-password`,
        handleCodeInApp: false,
      }

      const resetLink = await auth.generatePasswordResetLink(
        normalizedEmail,
        actionCodeSettings
      )

      // Send via Resend (our branding)
      await sendPasswordResetEmail(normalizedEmail, resetLink)
    } catch (err: any) {
      // Log the real error server-side but return generic success to the client
      // to prevent user enumeration (e.g. "auth/user-not-found" silently ignored)
      console.error('[forgot-password] Error generating reset link:', err?.code, err?.message)
    }

    // Always respond with a generic success — user never knows if the email exists
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a reset link has been sent.',
    })
  } catch (error) {
    console.error('[forgot-password] Unhandled error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
