"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, AlertCircle, Phone, Mail, RefreshCw, CheckCircle2 } from "lucide-react"
import { TermsModal, useLegalAccepted } from "@/components/ui/TermsModal"
import { emailSignupOTP } from "@/lib/emailApi"

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export default function SignupPage() {
  const { signup, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as const,
    college: "",
    rollNo: "",
    department: "",
    year: "1st Year",
    phone: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // OTP state
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [enteredOtp, setEnteredOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { accepted, accept } = useLegalAccepted()

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const sendOtp = async (otp: string) => {
    await emailSignupOTP({ email: form.email, otp, userName: form.name })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!form.college.trim()) {
      setError("Please enter your college name")
      return
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    const phoneDigits = form.phone.replace(/\D/g, "")
    if (phoneDigits.length !== 10) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setLoading(true)
    try {
      const otp = generateOTP()
      setGeneratedOtp(otp)
      await sendOtp(otp)
      setShowOtpStep(true)
      startResendCooldown()
    } catch {
      setError("Failed to send OTP. Please check your email and try again.")
    }
    setLoading(false)
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return
    setResending(true)
    setOtpError("")
    try {
      const otp = generateOTP()
      setGeneratedOtp(otp)
      setEnteredOtp("")
      await sendOtp(otp)
      startResendCooldown()
    } catch {
      setOtpError("Failed to resend OTP. Please try again.")
    }
    setResending(false)
  }

  const handleVerifyOtp = async () => {
    setOtpError("")
    if (enteredOtp.trim() !== generatedOtp) {
      setOtpError("Incorrect code. Please check your email and try again.")
      return
    }

    setOtpLoading(true)
    try {
      const success = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        college: form.college,
        rollNo: form.rollNo,
        department: form.department,
        year: form.year,
        phone: form.phone.replace(/\D/g, ""),
      })
      if (success) {
        router.push("/dashboard")
      } else {
        setOtpError("Account creation failed. Please try again.")
      }
    } catch (err: any) {
      const code = err?.code || ""
      if (code === "auth/email-already-in-use") setOtpError("An account with this email already exists.")
      else if (code === "auth/invalid-email") setOtpError("Invalid email address.")
      else if (code === "auth/weak-password") setOtpError("Password is too weak. Use at least 6 characters.")
      else setOtpError(err?.message || "Signup failed. Please try again.")
    }
    setOtpLoading(false)
  }

  const showTerms = accepted === false

  // ── OTP Verification Screen ────────────────────────────────────────────────
  if (showOtpStep) {
    return (
      <>
        <AnimatePresence>
          {showTerms && <TermsModal onAccept={accept} />}
        </AnimatePresence>

        <PageTransition className="min-h-screen flex items-center justify-center px-4 py-16">
          <motion.div variants={pageItem} className="w-full max-w-md">
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
              <MicroLabel>Verify your email</MicroLabel>
              <h1 className="text-4xl font-light tracking-tight mb-2">Check your inbox.</h1>
              <p className="text-[13px] text-white/70">
                We sent a 6-digit code to{" "}
                <span className="text-white font-medium">{form.email}</span>.
                Check your primary inbox or spam folder.
              </p>
            </div>

            <GlassCard className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[rgba(179,136,255,0.1)] border border-[rgba(179,136,255,0.2)] flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#B388FF]" />
                </div>
              </div>

              {otpError && (
                <div role="alert" className="flex items-start gap-3 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="otp-input" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">
                    Verification Code
                  </label>
                  <Input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, ""))
                      setOtpError("")
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleVerifyOtp() }}
                    placeholder="000000"
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 h-14 text-center text-2xl font-mono tracking-[0.4em]"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={enteredOtp.length !== 6 || otpLoading}
                  className="w-full bg-white text-black hover:bg-[#B388FF] font-medium h-12 transition-colors disabled:opacity-50"
                >
                  {otpLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" aria-hidden="true" />
                      <span>Verifying…</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Verify &amp; Create Account</span>
                    </span>
                  )}
                </Button>

                {/* Resend */}
                <div className="text-center">
                  <p className="text-sm text-white/40 mb-2">Didn&apos;t receive it?</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resending}
                    className="inline-flex items-center gap-1.5 text-sm text-[#B388FF] hover:text-[#c9a9ff] disabled:text-white/20 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : resending
                      ? "Sending…"
                      : "Resend code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setShowOtpStep(false); setOtpError(""); setEnteredOtp("") }}
                  className="w-full text-center text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  ← Back to sign up
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </PageTransition>
      </>
    )
  }

  // ── Signup Form ────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {showTerms && <TermsModal onAccept={accept} />}
      </AnimatePresence>

      <PageTransition className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div variants={pageItem} className="w-full max-w-lg">
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
          <MicroLabel>Create Account</MicroLabel>
          <h1 className="text-4xl font-light tracking-tight mb-2">Join the platform.</h1>
          <p className="text-[13px] text-white/70">
            Sign up with any Gmail. Link your college email from your Profile to access intra-college events.
          </p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div role="alert" className="flex items-start gap-3 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="fullname" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">Full Name</label>
              <Input id="fullname" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11" required />
            </div>

            <div>
              <label htmlFor="signup-email" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">Email Address</label>
              <Input id="signup-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@gmail.com" autoComplete="email" spellCheck={false} className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11" required aria-describedby="email-hint" />
              <p id="email-hint" className="text-[13px] text-white/70 mt-1">You can link your college email from your Profile later for intra-college events.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="signup-password" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">Password</label>
                <Input id="signup-password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" autoComplete="new-password" className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11" required />
              </div>
              <div>
                <label htmlFor="signup-confirm-password" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">Confirm Password</label>
                <Input id="signup-confirm-password" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="••••••••" autoComplete="new-password" className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11" required />
              </div>
            </div>

            {form.role === "student" && (
              <>
                <div>
                  <label htmlFor="college" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">College / University</label>
                  <select
                    id="college"
                    value={form.college}
                    onChange={(e) => update("college", e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-md bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="" className="bg-black text-white/50">Select your campus...</option>
                    {["SRMIST, Ramapuram", "SRMIST, Kattankulathur", "SRMIST, Vadapalani", "SRMIST, Tiruchirappalli"].map(c => (
                      <option key={c} value={c} className="bg-black text-white">{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rollNo" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">Roll Number <span className="text-white/30">(optional)</span></label>
                    <Input id="rollNo" value={form.rollNo} onChange={(e) => update("rollNo", e.target.value)} placeholder="RA2211003010001" className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11" />
                  </div>
                  <div>
                    <label htmlFor="department" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">Department</label>
                    <select
                      id="department"
                      value={form.department}
                      onChange={(e) => update("department", e.target.value)}
                      required
                      className="w-full h-11 px-3 rounded-md bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                    >
                      <option value="" className="bg-black text-white/50">Select department...</option>
                      {["Computer Science", "Cyber Security", "AI/ML", "BCA", "BCA Gen AI", "BCA DS"].map(dept => (
                        <option key={dept} value={dept} className="bg-black text-white">{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="year" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 block">Year of Study</label>
                  <select
                    id="year"
                    value={form.year}
                    onChange={(e) => update("year", e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-md bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                  >
                    {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Postgraduate", "PhD", "Faculty/Staff"].map((yr) => (
                      <option key={yr} value={yr} className="bg-black text-white">{yr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="phone" className="text-[11px] font-mono tracking-widest uppercase text-white/75 mb-2 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center h-11 px-3 rounded-l-md border border-r-0 border-white/[0.08] bg-white/[0.05] text-white/50 text-sm font-mono">+91</span>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11 rounded-l-none flex-1 ${
                        form.phone && form.phone.replace(/\D/g, "").length !== 10 ? "border-red-500/50" : ""
                      }`}
                      required
                    />
                  </div>
                  {form.phone && form.phone.replace(/\D/g, "").length !== 10 && (
                    <p className="text-[11px] text-red-400 mt-1">Must be exactly 10 digits</p>
                  )}
                </div>
              </>
            )}

            <Button type="submit" disabled={loading || accepted === false} aria-label={loading ? "Sending OTP..." : "Continue with email verification"} className="w-full bg-white text-black hover:bg-[#B388FF] font-medium h-12 transition-colors mt-2 disabled:opacity-50">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" aria-hidden="true" />
                  <span>Sending OTP…</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  <span>Create Account</span>
                </span>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4" aria-hidden="true">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <Button
            type="button"
            disabled={googleLoading || accepted === false}
            aria-label={googleLoading ? "Connecting to Google..." : "Continue with Google"}
            onClick={async () => {
              setGoogleLoading(true)
              setError("")
              try {
                const success = await signInWithGoogle()
                if (success) {
                  router.push("/dashboard")
                } else {
                  setError("Google sign-in failed. Please try again.")
                }
              } catch (err: any) {
                const code = err?.code || ""
                if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request")
                  setError("Sign-in was cancelled.")
                else if (code === "auth/popup-blocked")
                  setError("Pop-up was blocked by your browser. Please allow pop-ups for this site.")
                else
                  setError(err?.message || "Google sign-in failed. Please try again.")
              }
              setGoogleLoading(false)
            }}
            className="w-full bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1] font-medium h-12 transition-colors"
          >
            {googleLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-hidden="true" />
                <span>Connecting…</span>
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="hidden sm:inline">Continue with Google</span>
                <span className="sm:hidden">Google</span>
              </span>
            )}
          </Button>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50">
              Sign in
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </PageTransition>
    </>
  )
}
