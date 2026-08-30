import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin-server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/check-provider?email=...
 *
 * Returns the sign-in provider for a given email using Firebase Admin SDK.
 * Response: { provider: 'google' | 'password' | null }
 *   - 'google'   → account created via Google OAuth
 *   - 'password' → account created via email/password
 *   - null       → no account exists for this email
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const adminAuth = await getAdminAuth()
    const userRecord = await adminAuth.getUserByEmail(email)

    // providerData is an array of linked providers
    const providers = userRecord.providerData.map((p) => p.providerId)

    let provider: 'google' | 'password' | null = null
    if (providers.includes('google.com')) provider = 'google'
    else if (providers.includes('password')) provider = 'password'

    return NextResponse.json({ provider })
  } catch (err: any) {
    // Firebase Admin throws 'auth/user-not-found' when the email doesn't exist
    if (err?.errorInfo?.code === 'auth/user-not-found' || err?.code === 'auth/user-not-found') {
      return NextResponse.json({ provider: null })
    }
    console.error('[check-provider] Error:', err)
    return NextResponse.json({ error: 'Failed to check provider' }, { status: 500 })
  }
}
