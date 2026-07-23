"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/ui/GlassCard"
import { User, GraduationCap, Phone, BookOpen, X } from "lucide-react"

/**
 * ProfileCompleteModal — shown once after a first-time Google sign-in
 * when required profile fields (college, department, year) are empty.
 * Prompts the user to complete their profile before using the platform.
 */
export function ProfileCompleteModal() {
  const { user, updateProfile } = useAuth()
  const [open, setOpen] = useState(false)

  // Fields
  const [college, setCollege] = useState("")
  const [department, setDepartment] = useState("")
  const [year, setYear] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Show the modal when user is logged in but profile is incomplete
  useEffect(() => {
    if (user && !user.college) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [user])

  if (!open || !user) return null

  const phoneDigits = phone.replace(/\D/g, "")
  const isPhoneValid = phoneDigits.length === 10
  const canSave = college.trim() && department.trim() && year.trim() && isPhoneValid

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError("")
    try {
      await updateProfile({
        college: college.trim(),
        department: department.trim(),
        year: year.trim(),
        phone: phone.trim(),
      })
      setOpen(false)
    } catch {
      setError("Failed to save profile. Please try again.")
    }
    setSaving(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="profile-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            key="profile-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-lg"
          >
            <GlassCard className="p-0 overflow-hidden border border-[rgba(179,136,255,0.2)] max-h-[90dvh] overflow-y-auto">
              {/* Header */}
              <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-white/[0.06] bg-gradient-to-r from-[rgba(179,136,255,0.08)] to-transparent sticky top-0 z-10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-full bg-[rgba(179,136,255,0.12)] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#B388FF]" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Complete Your Profile</h2>
                </div>
                <p className="text-sm text-white/40 ml-12">
                  Fill in a few details before registering or hosting events.
                </p>
              </div>

              {/* Body */}
              <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4">
                {/* Welcome message */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[rgba(179,136,255,0.06)] border border-[rgba(179,136,255,0.12)]">
                  <span className="text-[#B388FF] text-lg">👋</span>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Welcome, <strong className="text-white">{user.name}</strong>! You signed in with Google.
                    Please complete your profile so others can identify you at events.
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                    {error}
                  </p>
                )}

                {/* College */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-white/60 mb-1.5 flex items-center gap-1.5 block">
                    <GraduationCap className="w-3 h-3" /> College / University <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                    className="w-full h-10 bg-white/[0.03] border border-white/[0.08] text-white text-sm rounded-md px-3 outline-none focus:border-[rgba(179,136,255,0.4)] transition-colors"
                    required
                  >
                    <option value="" disabled className="bg-black text-white/50">Select your campus...</option>
                    {["SRMIST, Ramapuram", "SRMIST, Kattankulathur", "SRMIST, Vadapalani", "SRMIST, Tiruchirappalli"].map(c => (
                      <option key={c} value={c} className="bg-black text-white">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-white/60 mb-1.5 flex items-center gap-1.5 block">
                    <BookOpen className="w-3 h-3" /> Department <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full h-10 bg-white/[0.03] border border-white/[0.08] text-white text-sm rounded-md px-3 outline-none focus:border-[rgba(179,136,255,0.4)] transition-colors"
                  >
                    <option value="" disabled>Select department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="BCA">BCA</option>
                    <option value="BCA Gen AI">BCA Gen AI</option>
                    <option value="BCA DS">BCA DS</option>
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-white/60 mb-1.5 block">
                    Year of Study <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="w-full h-10 bg-white/[0.03] border border-white/[0.08] text-white text-sm rounded-md px-3 outline-none focus:border-[rgba(179,136,255,0.4)] transition-colors"
                  >
                    <option value="" disabled>Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="PhD">PhD</option>
                    <option value="Faculty">Faculty / Staff</option>
                  </select>
                </div>

                {/* Phone (required) */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-white/60 mb-1.5 flex items-center gap-1.5 block">
                    <Phone className="w-3 h-3" /> Phone <span className="text-red-400">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center h-10 px-3 rounded-l-md border border-r-0 border-white/[0.08] bg-white/[0.05] text-white/50 text-sm font-mono">+91</span>
                    <Input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="9876543210"
                      type="tel"
                      maxLength={10}
                      className={`bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 h-10 rounded-l-none flex-1 ${phone && !isPhoneValid ? "border-red-500/50" : ""}`}
                      required
                    />
                  </div>
                  {phone && !isPhoneValid && (
                    <p className="text-[10px] text-red-400 mt-1">Phone number must be exactly 10 digits</p>
                  )}
                </div>

                <p className="text-[11px] text-white/40 font-mono">
                  You can update these details anytime from your Profile page.
                </p>
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-8 py-4 sm:py-5 border-t border-white/[0.06] bg-black/20 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="text-white/30 hover:text-white/60 text-sm h-10 px-4"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className="bg-[#B388FF] text-black hover:bg-[#c9a9ff] font-semibold h-10 px-6 transition-colors disabled:opacity-40"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    "Save & Continue"
                  )}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
