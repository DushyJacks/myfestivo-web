"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { auth as getAuthInstance } from "@/lib/firebase"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [oobCode, setOobCode] = useState<string | null>(null)
  const [codeError, setCodeError] = useState("")
  const [verifyingCode, setVerifyingCode] = useState(true)

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Validate the oobCode on mount
  useEffect(() => {
    const code = searchParams.get("oobCode")
    if (!code) {
      setCodeError("Invalid or missing reset link. Please request a new one.")
      setVerifyingCode(false)
      return
    }
    const authInstance = getAuthInstance()
    if (!authInstance) {
      setCodeError("Authentication not configured.")
      setVerifyingCode(false)
      return
    }
    verifyPasswordResetCode(authInstance, code)
      .then(() => {
        setOobCode(code)
        setVerifyingCode(false)
      })
      .catch((err: any) => {
        const code = err?.code || ""
        if (code === "auth/invalid-action-code" || code === "auth/expired-action-code") {
          setCodeError("This reset link has expired or already been used. Please request a new one.")
        } else {
          setCodeError("Invalid reset link. Please request a new one.")
        }
        setVerifyingCode(false)
      })
  }, [searchParams])

  const passwordsMatch = password && confirm && password === confirm
  const isStrong = password.length >= 8
  const canSubmit = passwordsMatch && isStrong && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oobCode || !canSubmit) return
    setError("")
    setLoading(true)

    try {
      const authInstance = getAuthInstance()
      if (!authInstance) throw new Error("Authentication not configured.")
      await confirmPasswordReset(authInstance, oobCode, password)
      setSuccess(true)
      // Auto-redirect to login after 3 seconds
      setTimeout(() => router.push("/login"), 3000)
    } catch (err: any) {
      const code = err?.code || ""
      if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 8 characters.")
      } else if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
        setError("This reset link has expired. Please request a new one.")
      } else {
        setError(err?.message || "Failed to reset password. Please try again.")
      }
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
          <h1 className="text-4xl font-light tracking-tight mb-2">Create new password</h1>
          <p className="text-white/40 text-sm">Enter and confirm your new password below.</p>
        </div>

        <GlassCard className="p-8">
          <AnimatePresence mode="wait">
            {verifyingCode ? (
              /* Loading while verifying code */
              <motion.div key="loading" className="flex justify-center py-8">
                <span className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
              </motion.div>
            ) : codeError ? (
              /* Invalid / expired code */
              <motion.div
                key="code-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 text-center"
              >
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                  </div>
                </div>
                <p className="text-sm text-white/60">{codeError}</p>
                <Link
                  href="/forgot-password"
                  className="inline-block mt-2 text-sm text-[#B388FF] hover:underline"
                >
                  Request a new reset link
                </Link>
              </motion.div>
            ) : success ? (
              /* Success */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                  </div>
                </div>
                <h2 className="text-xl font-medium text-white">Password changed!</h2>
                <p className="text-sm text-white/60">
                  Your password has been updated successfully. You&apos;ll be redirected to sign in shortly.
                </p>
                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center gap-2 text-sm text-[#B388FF] hover:underline"
                >
                  Go to Sign In now
                </Link>
              </motion.div>
            ) : (
              /* Form */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
              >
                {error && (
                  <div role="alert" className="flex items-start gap-3 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && !isStrong && (
                    <p className="text-[10px] text-red-400 mt-1">Password must be at least 8 characters</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className={`bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11 pr-10 ${
                        confirm && !passwordsMatch ? "border-red-500/50" : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && !passwordsMatch && (
                    <p className="text-[10px] text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-white text-black hover:bg-[#B388FF] font-medium h-12 transition-colors disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" aria-hidden="true" />
                      <span>Updating…</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      <span>Set New Password</span>
                    </span>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </PageTransition>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
