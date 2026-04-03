/**
 * Razorpay Integration Service
 * Handles payment initialization and processing
 */

export interface RazorpayOptions {
  key: string
  amount: number // in paise (smallest unit)
  currency: string
  name: string
  description: string
  order_id?: string
  prefill: {
    name: string
    email: string
    contact: string
  }
  notes: {
    eventId: string
    eventTitle: string
    registrationId: string
  }
  theme: {
    color: string
  }
  handler: (response: RazorpayResponse) => void
  modal: {
    ondismiss: () => void
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

export interface RazorpayScript extends Window {
  Razorpay: any
}

declare global {
  interface Window {
    Razorpay: any
  }
}

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Initialize Razorpay payment
 */
export const initiatePayment = async (options: RazorpayOptions) => {
  const scriptLoaded = await loadRazorpayScript()
  if (!scriptLoaded) {
    throw new Error('Failed to load Razorpay script')
  }

  if (!window.Razorpay) {
    throw new Error('Razorpay is not available')
  }

  const razorpay = new window.Razorpay(options)
  razorpay.open()
}

/**
 * Verify payment on backend
 * Calls the backend API to verify the Razorpay payment signature
 * This is CRITICAL for security - must be called before marking registration as PAID
 */
export const verifyPayment = async (
  orderId: string,
  paymentId: string,
  signature: string,
  registrationId: string
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        registrationId
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { valid: false, error: data.error || 'Payment verification failed' }
    }
    
    return { valid: true }
  } catch (error) {
    console.error('Payment verification error:', error)
    return { valid: false, error: 'Payment verification failed' }
  }
}

/**
 * Format amount to paise (Razorpay requires amount in paise)
 * @param rupees Amount in Indian Rupees
 * @returns Amount in paise
 */
export const toPaise = (rupees: number): number => {
  return Math.round(rupees * 100)
}

/**
 * Format paise to rupees
 * @param paise Amount in paise
 * @returns Amount in Indian Rupees
 */
export const toRupees = (paise: number): number => {
  return paise / 100
}
