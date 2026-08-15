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
      const code: string = err?.code ?? ''

      // Expected Firebase errors: silently ignore to prevent user enumeration.
      // "auth/user-not-found" — no account exists for this email (intentional).
      // "auth/invalid-email"  — malformed email string.
      const isBenignAuthError =
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-email' ||
        code === 'auth/email-not-found'

      if (isBenignAuthError) {
        console.info('[forgot-password] Benign auth error (ignored):', code)
        // Fall through to generic success below
      } else {
        // Unexpected system error (ESM crash, network failure, Resend error, etc.)
        // Re-throw so the outer catch returns a proper 500.
        console.error('[forgot-password] Unexpected error:', code, err?.message)
        throw err
      }
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
