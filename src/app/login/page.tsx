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
import { motion } from "framer-motion"
import { LogIn, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { login, user, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const success = await login(email, password)
    setLoading(false)

    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid email or password. Please try again.")
    }
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div variants={pageItem} className="w-full max-w-md">
        <div className="mb-12">
          <Link href="/" className="block mb-8">
            <img src="/logo.png" alt="MyFestivo" className="h-10 w-auto" />
          </Link>
          <MicroLabel>Sign In</MicroLabel>
          <h1 className="text-4xl font-light tracking-tight mb-2">Welcome back.</h1>
          <p className="text-white/40 text-sm">Enter your credentials to continue.</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                autoComplete="email"
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-white/90 font-medium h-11 transition-colors"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/30">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <Button
            type="button"
            disabled={googleLoading}
            onClick={async () => {
              setGoogleLoading(true)
              setError("")
              const success = await signInWithGoogle()
              setGoogleLoading(false)
              if (success) {
                router.push("/dashboard")
              } else {
                setError("Google sign-in failed. Please try again.")
              }
            }}
            className="w-full bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1] font-medium h-11 transition-colors"
          >
            {googleLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="inline-flex items-center gap-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </span>
            )}
          </Button>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center text-sm text-white/40">
            No account?{" "}
            <Link href="/signup" className="text-white hover:underline">
              Sign up
            </Link>
          </div>
        </GlassCard>


      </motion.div>
    </PageTransition>
  )
}
