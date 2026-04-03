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
 * Verify payment on backend (optional - for enhanced security)
 * This would be called from your backend to verify the payment signature
 */
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
) => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, orderId, signature }),
    })
    return response.ok
  } catch (error) {
    console.error('Payment verification failed:', error)
    return false
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
