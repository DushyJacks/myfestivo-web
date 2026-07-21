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
import { UserPlus, AlertCircle, Phone } from "lucide-react"
import Image from "next/image"
import { TermsModal, useLegalAccepted } from "@/components/ui/TermsModal"

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

  const { accepted, accept } = useLegalAccepted()

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

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
        setError("Signup failed. Please try again.")
      }
    } catch (err: any) {
      const code = err?.code || ""
      if (code === "auth/email-already-in-use") setError("An account with this email already exists.")
      else if (code === "auth/invalid-email") setError("Invalid email address.")
      else if (code === "auth/weak-password") setError("Password is too weak. Use at least 6 characters.")
      else setError(err?.message || "Signup failed. Please try again.")
    }
    setLoading(false)
  }

  const showTerms = accepted === false

  return (
    <>
      <AnimatePresence>
        {showTerms && <TermsModal onAccept={accept} />}
      </AnimatePresence>

      <PageTransition className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div variants={pageItem} className="w-full max-w-lg">
        <div className="mb-12">
          <Link href="/" className="block mb-8">
            <Image
              src="/logo.png"
              alt="MyFestivo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <MicroLabel>Create Account</MicroLabel>
          <h1 className="text-4xl font-light tracking-tight mb-2">Join the platform.</h1>
          <p className="text-[13px] text-white/60">
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
              <p id="email-hint" className="text-[13px] text-white/60 mt-1">You can link your college email from your Profile later for intra-college events.</p>
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
                  <Input id="college" value={form.college} onChange={(e) => update("college", e.target.value)} placeholder="e.g. SRM Institute of Science and Technology" className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11" required />
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
                      {["Computer Science", "Cyber Security", "AI/ML", "BCA"].map(dept => (
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
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className={`bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11 ${
                      form.phone && form.phone.replace(/\D/g, "").length !== 10 ? "border-red-500/50" : ""
                    }`}
                    required
                  />
                  {form.phone && form.phone.replace(/\D/g, "").length !== 10 && (
                    <p className="text-[11px] text-red-400 mt-1">Must be exactly 10 digits</p>
                  )}
                </div>
              </>
            )}

            <Button type="submit" disabled={loading || accepted === false} aria-label={loading ? "Creating account..." : "Create account"} className="w-full bg-white text-black hover:bg-white/90 font-medium h-12 transition-colors mt-2 disabled:opacity-50">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" aria-hidden="true" />
                  <span>Creating account…</span>
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
