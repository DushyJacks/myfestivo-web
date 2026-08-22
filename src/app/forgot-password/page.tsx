"use client"

import { useState } from "react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        setError(data.message || "Something went wrong. Please try again.")
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div variants={pageItem} className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-12">
          <Link href="/" className="block mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="MyFestivo"
              className="h-10 w-auto"
              width={120}
              height={40}
              loading="lazy"
              decoding="async"
            />
          </Link>
          <MicroLabel>Password Reset</MicroLabel>
          <h1 className="text-4xl font-light tracking-tight mb-2">Forgot password?</h1>
          <p className="text-[var(--color-text-muted)] text-sm">
            Enter your account email and we&apos;ll send you a reset link.
          </p>
        </div>

        <GlassCard className="p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Success State ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-[var(--color-success)]" />
                  </div>
                </div>
                <h2 className="text-xl font-medium text-[var(--color-text)]">Check your email</h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  If an account exists for <span className="text-[var(--color-text)] font-mono">{email}</span>,
                  we&apos;ve sent instructions to reset your password.
                </p>

                <div className="mt-4 p-4 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-left">
                  <p className="text-xs text-[var(--color-text-faint)] leading-relaxed">
                    <strong className="text-[var(--color-text-muted)]">Didn&apos;t receive it?</strong><br />
                    Check your spam folder or{" "}
                    <button
                      onClick={() => { setSent(false) }}
                      className="text-[#B388FF] hover:underline"
                    >
                      try again
                    </button>
                    .
                  </p>
                </div>

                <Link
                  href="/login"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              /* ── Form State ── */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
                noValidate
              >
                {error && (
                  <div role="alert" className="flex items-start gap-3 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="text-[11px] font-mono tracking-widest uppercase text-[var(--color-text-muted)] mb-2 block"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    autoComplete="email"
                    spellCheck={false}
                    className="themed-input h-11"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-white text-black hover:bg-[#B388FF] font-medium h-12 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" aria-hidden="true" />
                      <span>Sending…</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      <span>Send Reset Link</span>
                    </span>
                  )}
                </Button>

                <div className="text-center text-sm text-[var(--color-text-muted)]">
                  Remember your password?{" "}
                  <Link href="/login" className="text-[var(--color-accent)] hover:underline">
                    Sign in
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </PageTransition>
  )
}
