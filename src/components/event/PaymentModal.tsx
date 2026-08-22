"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import { X, Loader2, CheckCircle2 } from "lucide-react"
import { initiatePayment, toPaise, RazorpayResponse } from "@/lib/razorpay"

interface PaymentModalProps {
  eventId: string
  eventTitle: string
  regId: string
  amount: number // in rupees
  userName: string
  userEmail: string
  userPhone: string
  onSuccess: (paymentId: string, transactionId: string) => void
  onCancel: () => void
}

type PaymentState = "ready" | "processing" | "success" | "error"

export function PaymentModal({
  eventId,
  eventTitle,
  regId,
  amount,
  userName,
  userEmail,
  userPhone,
  onSuccess,
  onCancel,
}: PaymentModalProps) {
  const [state, setState] = useState<PaymentState>("ready")
  const [error, setError] = useState("")
  const [transactionId, setTransactionId] = useState("")

  const handlePayment = async () => {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setError("Razorpay configuration missing. Contact support.")
      setState("error")
      return
    }

    setState("processing")
    setError("")

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: toPaise(amount),
        currency: "INR",
        name: "MyFestivo",
        description: `Registration for ${eventTitle}`,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone || "",
        },
        notes: {
          eventId,
          eventTitle,
          registrationId: regId,
        },
        theme: {
          color: "#ffffff",
        },
        handler: (response: RazorpayResponse) => {
          // Payment successful
          setTransactionId(response.razorpay_payment_id)
          setState("success")
          // Call success callback after user sees confirmation
          setTimeout(() => {
            onSuccess(response.razorpay_payment_id, `RAZORPAY_${response.razorpay_payment_id}`)
          }, 1500)
        },
        modal: {
          ondismiss: () => {
            setState("ready")
            setError("Payment cancelled")
          },
        },
      }

      await initiatePayment(options)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment initialization failed")
      setState("error")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <GlassCard
        className="p-0 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-medium">Complete Payment</h2>
          <button
            onClick={onCancel}
            disabled={state === "processing"}
            className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success State */}
          {state === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[var(--color-success)]" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-[var(--color-success)] mb-1">Payment Successful!</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Transaction ID: <span className="font-mono text-[var(--color-text-muted)]">{transactionId}</span>
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {state === "error" && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
              <Button
                onClick={() => setState("ready")}
                className="w-full bg-white text-black hover:bg-[#B388FF] h-10"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Ready State */}
          {state === "ready" && (
            <>
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase">
                  Event
                </p>
                <p className="text-sm">{eventTitle}</p>
              </div>

              <div className="flex justify-between items-center p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                <span className="text-[var(--color-text-muted)]">Amount to Pay</span>
                <span className="font-mono font-semibold text-lg">₹{amount}</span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase">
                  Participant
                </p>
                <div className="text-sm space-y-0.5">
                  <p className="text-[var(--color-text)]">{userName}</p>
                  <p className="text-[var(--color-text-muted)] text-xs">{userEmail}</p>
                </div>
              </div>

              <p className="text-[10px] text-[var(--color-text-faint)] text-center">
                You will be redirected to Razorpay Secure Payment Gateway
              </p>
            </>
          )}

          {/* Processing State */}
          {state === "processing" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-8 h-8 text-[var(--color-text-muted)] animate-spin" />
              <p className="text-sm text-[var(--color-text-muted)]">Loading payment gateway...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {state === "ready" && (
          <div className="flex gap-3 px-6 py-4 border-t border-[var(--color-border)]">
            <Button
              onClick={onCancel}
              variant="ghost"
              className="flex-1 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1 bg-white text-black hover:bg-[#B388FF] h-10 font-medium"
            >
              Pay ₹{amount}
            </Button>
          </div>
        )}

        {state === "success" && (
          <div className="px-6 py-4 border-t border-[var(--color-border)]">
            <Button
              onClick={onCancel}
              className="w-full bg-white text-black hover:bg-[#B388FF] h-10"
            >
              Continue
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
