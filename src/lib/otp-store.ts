/**
 * Server-side in-memory OTP store for college email verification.
 *
 * OTPs are kept in a globalThis Map so they survive Next.js module hot-reloads
 * in development. Each entry expires after TTL_MS (2 minutes).
 *
 * NOTE: This is a per-instance store. On multi-instance deployments (e.g. several
 * Netlify lambda containers) a user might hit a different instance for send vs
 * verify. For the current single-instance Netlify deployment this is safe. If you
 * scale horizontally in the future, replace this with Upstash Redis or equivalent.
 */

const TTL_MS = 2 * 60 * 1000 // 2 minutes

interface OtpEntry {
  otp: string
  collegeEmail: string
  expiresAt: number // Unix timestamp ms
}

// Attach to globalThis so Next.js fast-refresh doesn't wipe it
const g = globalThis as typeof globalThis & { __otpStore?: Map<string, OtpEntry> }
if (!g.__otpStore) {
  g.__otpStore = new Map<string, OtpEntry>()
}
const store: Map<string, OtpEntry> = g.__otpStore

/** Save an OTP for a given uid. Overwrites any existing entry. */
export function saveOtp(uid: string, otp: string, collegeEmail: string): void {
  store.set(uid, {
    otp,
    collegeEmail,
    expiresAt: Date.now() + TTL_MS,
  })
}

/** Verify and consume an OTP. Returns the stored college email on success, null otherwise. */
export function verifyAndConsumeOtp(uid: string, submittedOtp: string): { collegeEmail: string } | null {
  const entry = store.get(uid)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(uid)
    return null
  }
  if (submittedOtp !== entry.otp) return null
  // Valid — consume (delete) the entry
  store.delete(uid)
  return { collegeEmail: entry.collegeEmail }
}

/** Remove any existing OTP for a uid (e.g. on explicit resend). */
export function clearOtp(uid: string): void {
  store.delete(uid)
}
