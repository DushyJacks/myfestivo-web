export interface RateLimitOptions {
  limit: number
  windowMs: number
}

interface RateLimitRecord {
  count: number
  resetAt: number
}

// In-memory store for rate limiting. 
// Note: In serverless environments (like Vercel/Netlify functions), this memory 
// is isolated per function instance and may be reset frequently. 
// It provides basic abuse protection rather than strict distributed rate limiting.
const rateLimitStore = new Map<string, RateLimitRecord>()

/**
 * Clean up expired records to prevent memory leaks
 */
function cleanupStore() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every minute
setInterval(cleanupStore, 60000)

/**
 * Rate limit checker
 * @param identifier A unique identifier (e.g., IP address or User ID)
 * @param action The action being rate-limited (e.g., 'send-otp')
 * @param options Rate limit configuration
 * @returns boolean True if the request is allowed, false if rate limited
 */
export function isRateLimited(
  identifier: string,
  action: string,
  options: RateLimitOptions
): boolean {
  if (!identifier) return false // Fallback if no identifier can be found

  const key = `${action}:${identifier}`
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetAt) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return false
  }

  if (record.count >= options.limit) {
    // Rate limited
    return true
  }

  // Increment counter
  record.count += 1
  return false
}

/**
 * Helper to extract client IP from NextRequest
 */
export function getClientIp(request: Request): string {
  // In Next.js App Router, headers are standard Fetch API Headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return 'unknown-ip'
}
