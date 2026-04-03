import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Verify Razorpay payment signature
 * POST /api/payments/verify
 * 
 * Body:
 * {
 *   razorpay_order_id: string
 *   razorpay_payment_id: string
 *   razorpay_signature: string
 *   registrationId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment verification not configured on server' },
        { status: 500 }
      )
    }

    // Verify request is authorized (optional: check Firebase auth token)
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify signature using Razorpay's method
    // Signature = HMAC-SHA256(order_id|payment_id, secret)
    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET as string)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const generated_signature = hmac.digest('hex')

    const isSignatureValid = generated_signature === razorpay_signature

    if (!isSignatureValid) {
      console.error('Payment signature verification failed', {
        registrationId,
        razorpay_order_id,
        razorpay_payment_id,
        expected: generated_signature,
        received: razorpay_signature,
      })
      
      return NextResponse.json(
        { valid: false, error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Log successful verification for audit trail
    console.log('Payment verified successfully', {
      registrationId,
      razorpay_order_id,
      razorpay_payment_id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      { valid: true, message: 'Payment verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
