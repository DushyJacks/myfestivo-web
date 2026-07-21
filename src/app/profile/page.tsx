"use client"

import { useAuth } from "@/lib/auth-context"
import { useEvents } from "@/lib/events-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Save, Mail, Phone, School, BadgeCheck, AlertCircle,
  Loader2, CheckCircle2, Shield, User, BookOpen, Pencil, X,
  LogOut, Trash2, AlertTriangle
} from "lucide-react"

const DEPARTMENTS = ["Computer Science", "Cyber Security", "AI/ML", "BCA"]
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Postgraduate", "PhD", "Faculty/Staff"]

/** Confirmation modal used for both sign-out and delete account */
function ConfirmModal({
  type,
  onConfirm,
  onCancel,
  loading,
}: {
  type: "signout" | "delete"
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const isDelete = type === "delete"
  return (
    <motion.div
      key="confirm-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <GlassCard className={`p-6 border ${isDelete ? "border-red-500/30" : "border-white/10"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDelete ? "bg-red-500/10" : "bg-white/[0.06]"}`}>
              {isDelete ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <LogOut className="w-5 h-5 text-white/60" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {isDelete ? "Delete Account?" : "Sign Out?"}
              </h2>
              <p className="text-xs text-white/40">
                {isDelete ? "This action cannot be undone" : "You can sign back in anytime"}
              </p>
            </div>
          </div>

          {isDelete && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-300 leading-relaxed">
                <strong>Warning:</strong> This will permanently delete your account, profile data, and remove you from all events. This cannot be reversed.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md text-xs border border-white/[0.1] text-white/50 hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                isDelete
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white hover:bg-white/90 text-black"
              }`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isDelete ? "Yes, Delete My Account" : "Yes, Sign Out"}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

export default function ProfilePage() {
  const { user, updateProfile, linkCollegeEmail, sendFriendRequest, logout, deleteAccount } = useAuth()
  const { events, isLoading: eventsLoading } = useEvents()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [college, setCollege] = useState("")
  const [department, setDepartment] = useState("")
  const [rollNo, setRollNo] = useState("")
  const [year, setYear] = useState("")
  const [saved, setSaved] = useState(false)

  const [collegePrefix, setCollegePrefix] = useState("")
  const [collegeDomain, setCollegeDomain] = useState("srmist.edu.in")
  const [verifying, setVerifying] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [verifyError, setVerifyError] = useState("")

  // Confirmation modals
  const [confirmModal, setConfirmModal] = useState<"signout" | "delete" | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    setName(user.name)
    setPhone(user.phone || "")
    setBio(user.bio || "")
    setCollege(user.college || "")
    setDepartment(user.department || "")
    setRollNo(user.rollNo || "")
    setYear(user.year || "")
  }, [user, router])

  if (!user) return null

  // Check if user has any active (non-expired) event registrations → lock editing.
  // While events are still loading we conservatively treat it as locked to prevent
  // a flash where the edit button is enabled before data arrives from Firestore.
  const now = new Date()
  const hasActiveRegistration = eventsLoading || events.some(evt => {
    const isRegistered = evt.registrations.some(
      r => r.userEmail === user.email || r.userId === user.id
    )
    if (!isRegistered) return false
    const eventDate = new Date(evt.date)
    const eventEnded = eventDate.getTime() + 86400000 < now.getTime()
    return !eventEnded
  })

  const phoneDigits = phone.replace(/\D/g, "")
  const isPhoneValid = phoneDigits.length === 10
  const canSave = name.trim() && isPhoneValid && college.trim() && department.trim() && year.trim()

  const handleSave = () => {
    if (hasActiveRegistration) return
    if (!canSave) return
    updateProfile({ name, phone, bio, college, department, rollNo, year })
    setSaved(true)
    setTimeout(() => { setSaved(false); setIsEditing(false) }, 1500)
  }

  const handleSendOtp = async () => {
    if (!collegePrefix.trim()) return
    setVerifying(true)
    setVerifyError("")
    try {
      const collegeEmail = `${collegePrefix}@${collegeDomain}`
      const response = await fetch('/api/auth/send-college-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id, collegeEmail, collegeDomain }),
      })
      const data = await response.json()
      if (data.success) { setOtpSent(true) }
      else { setVerifyError(data.message || 'Failed to send OTP') }
    } catch { setVerifyError('Network error. Please try again.') }
    finally { setVerifying(false) }
  }

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { setVerifyError("Enter a valid 6-digit OTP"); return }
    setVerifying(true)
    setVerifyError("")
    try {
      const response = await fetch('/api/auth/verify-college-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id, otp }),
      })
      const data = await response.json()
      if (data.success) { setOtpSent(false); setOtp(""); setCollegePrefix("") }
      else { setVerifyError(data.message || 'Verification failed.') }
    } catch { setVerifyError('Network error. Please try again.') }
    finally { setVerifying(false) }
  }

  const handleSignOut = async () => {
    setActionLoading(true)
    await logout()
    setActionLoading(false)
    setConfirmModal(null)
    router.push("/login")
  }

  const handleDeleteAccount = async () => {
    setActionLoading(true)
    setDeleteError("")
    try {
      await deleteAccount()
      setConfirmModal(null)
      router.push("/")
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete account. Please try again.")
      setActionLoading(false)
    }
  }

  const inputCls = "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11"
  const readonlyCls = "h-11 px-3 flex items-center text-sm text-white/80 bg-white/[0.02] border border-white/[0.06] rounded-md"
  const labelCls = "text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block"

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeItem="profile" />

      {/* Confirmation modals */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            type={confirmModal}
            onConfirm={confirmModal === "signout" ? handleSignOut : handleDeleteAccount}
            onCancel={() => { setConfirmModal(null); setDeleteError("") }}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 md:ml-[72px] lg:ml-[260px] pb-20 md:pb-0">
        <PageTransition className="p-6 lg:p-10 max-w-3xl mx-auto">
          <motion.div variants={pageItem} className="mb-8">
            <MicroLabel>Your Profile</MicroLabel>
            <h1 className="text-3xl font-light tracking-tight">Your profile.</h1>
          </motion.div>

          {/* Avatar + Basic Info */}
          <motion.div variants={pageItem} className="mb-8">
            <GlassCard className="p-6 sm:p-8">
              {/* Header row: avatar + name + edit button */}
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                <div className="relative group shrink-0">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="User avatar" width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: user.avatarColor || "#3B82F6" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="text-[9px] font-mono text-white/80 uppercase tracking-widest">Change</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => { updateProfile({ avatarUrl: reader.result as string }) }
                        reader.readAsDataURL(file)
                      }} />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-medium">{user.name}</h2>
                  <p className="text-sm text-white/40 font-mono">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono border border-white/20 text-white/40 px-2 py-0.5 rounded uppercase">{user.role}</span>
                    {user.collegeEmailVerified && (
                      <span className="text-[10px] font-mono border border-green-500/30 text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> College Verified
                      </span>
                    )}
                  </div>
                </div>
                {/* Edit / Cancel button in top-right */}
                <div className="shrink-0">
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        if (hasActiveRegistration) return
                        setIsEditing(true)
                      }}
                      disabled={hasActiveRegistration}
                      title={hasActiveRegistration ? "Cannot edit profile while registered for an active event" : "Edit profile"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors ${hasActiveRegistration ? "border-white/[0.05] text-white/20 cursor-not-allowed" : "border-white/20 text-white/60 hover:border-white/40 hover:text-white"}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/20 text-white/60 hover:border-white/40 hover:text-white text-xs transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {hasActiveRegistration && !isEditing && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {eventsLoading
                    ? "Checking event registrations…"
                    : "Profile editing is locked while you have active event registrations."}
                </div>
              )}

              <MicroLabel>01 — Personal Info</MicroLabel>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}><User className="w-3 h-3 inline mr-1" />Full Name <span className="text-red-400">*</span></label>
                    {isEditing
                      ? <Input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                      : <div className={readonlyCls}>{user.name || <span className="text-white/30">Not set</span>}</div>}
                  </div>
                  <div>
                    <label className={labelCls}><Phone className="w-3 h-3 inline mr-1" />Phone <span className="text-red-400">*</span></label>
                    {isEditing ? (
                      <div>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" type="tel" maxLength={10}
                          className={`${inputCls} ${phone && !isPhoneValid ? "border-red-500/50" : ""}`} />
                        {phone && !isPhoneValid && (
                          <p className="text-[10px] text-red-400 mt-1">Phone number must be exactly 10 digits</p>
                        )}
                      </div>
                    ) : (
                      <div className={readonlyCls}>{user.phone || <span className="text-white/30">Not set</span>}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Bio</label>
                  {isEditing
                    ? <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 rounded-md px-3 py-3 text-sm resize-none" />
                    : <div className="min-h-[60px] px-3 py-3 text-sm text-white/80 bg-white/[0.02] border border-white/[0.06] rounded-md">{user.bio || <span className="text-white/30">No bio added</span>}</div>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}><School className="w-3 h-3 inline mr-1" />College <span className="text-red-400">*</span></label>
                    {isEditing
                      ? <Input value={college} onChange={e => setCollege(e.target.value)} className={inputCls} />
                      : <div className={readonlyCls}>{user.college || <span className="text-white/30">Not set</span>}</div>}
                  </div>
                  <div>
                    <label className={labelCls}><BookOpen className="w-3 h-3 inline mr-1" />Department <span className="text-red-400">*</span></label>
                    {isEditing ? (
                      <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full h-11 bg-white/[0.03] border border-white/[0.08] text-white rounded-md px-3 text-sm"
                      >
                        <option value="">Select department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <div className={readonlyCls}>{user.department || <span className="text-white/30">Not set</span>}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Roll Number <span className="text-white/30">(optional)</span></label>
                    {isEditing
                      ? <Input value={rollNo} onChange={e => setRollNo(e.target.value)} className={inputCls} />
                      : <div className={readonlyCls}>{user.rollNo || <span className="text-white/30">Not set</span>}</div>}
                  </div>
                  <div>
                    <label className={labelCls}>Year <span className="text-red-400">*</span></label>
                    {isEditing ? (
                      <select
                        value={year}
                        onChange={e => setYear(e.target.value)}
                        className="w-full h-11 bg-white/[0.03] border border-white/[0.08] text-white rounded-md px-3 text-sm"
                      >
                        <option value="">Select year</option>
                        {YEAR_OPTIONS.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                      </select>
                    ) : (
                      <div className={readonlyCls}>{user.year || <span className="text-white/30">Not set</span>}</div>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex items-center gap-3">
                  <Button onClick={handleSave} disabled={!canSave} className="bg-white text-black hover:bg-white/90 font-medium h-11 px-8 disabled:opacity-50">
                    <Save className="w-4 h-4 mr-2" />Save Changes
                  </Button>
                  {saved && <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved!</span>}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* College Email Verification */}
          <motion.div variants={pageItem} className="mb-8">
            <GlassCard className="p-6 sm:p-8">
              <MicroLabel>02 — College Email Verification</MicroLabel>
              <p className="text-sm text-white/40 mb-2">Link your college email to access intra-college events.</p>
              <p className="text-[11px] text-white/30 mb-6 font-mono">This step is optional — you can participate in events without verification.</p>

              {user.collegeEmailVerified ? (
                <div className="flex items-center gap-3 p-4 rounded-md bg-green-500/10 border border-green-500/20">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-green-400 font-medium">College Email Verified</p>
                    <p className="text-xs font-mono text-green-400/60">{user.collegeEmail}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>College Email Domain</label>
                    <Input value={collegeDomain} onChange={e => setCollegeDomain(e.target.value)} placeholder="srmist.edu.in"
                      className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11 mb-3" />
                  </div>
                  <div>
                    <label className={labelCls}>Your College Email</label>
                    <div className="flex items-center gap-0">
                      <Input value={collegePrefix} onChange={e => setCollegePrefix(e.target.value)} placeholder="your.name"
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11 rounded-r-none border-r-0 flex-1" />
                      <div className="h-11 px-4 flex items-center bg-white/[0.06] border border-white/[0.08] rounded-r-md text-white/50 text-sm font-mono whitespace-nowrap">@{collegeDomain}</div>
                    </div>
                  </div>
                  {verifyError && <div className="flex items-center gap-2 text-xs text-red-400"><AlertCircle className="w-3 h-3" /> {verifyError}</div>}
                  {!otpSent ? (
                    <Button onClick={handleSendOtp} disabled={!collegePrefix.trim() || verifying} className="bg-white text-black hover:bg-white/90 h-10">
                      {verifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Mail className="w-4 h-4 mr-2" /> Send Verification OTP</>}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 rounded-md bg-white/[0.03] border border-white/[0.06]">
                        <Mail className="w-4 h-4 text-white/40" />
                        <span className="text-xs text-white/50">Check {collegePrefix}@{collegeDomain} for the code. Valid 10 min.</span>
                      </div>
                      <div className="flex gap-3">
                        <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6}
                          className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11 font-mono text-center tracking-[0.5em] max-w-[200px]" />
                        <Button onClick={handleVerifyOtp} disabled={verifying} className="bg-white text-black hover:bg-white/90 h-11 px-6">
                          {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* ── Account Actions ── */}
          <motion.div variants={pageItem} className="mb-8">
            <GlassCard className="p-6 sm:p-8">
              <MicroLabel>03 — Account</MicroLabel>
              <p className="text-sm text-white/40 mb-6">Manage your session and account data.</p>

              <div className="space-y-3">
                {/* Sign Out */}
                <button
                  onClick={() => setConfirmModal("signout")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all text-sm"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <div className="text-left">
                    <p className="font-medium">Sign Out</p>
                    <p className="text-xs text-white/30">End your current session</p>
                  </div>
                </button>

                {/* Delete Account */}
                <button
                  onClick={() => setConfirmModal("delete")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/[0.05] transition-all text-sm"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <div className="text-left">
                    <p className="font-medium">Delete Account</p>
                    <p className="text-xs text-red-400/40">Permanently remove your account and all data</p>
                  </div>
                </button>

                {deleteError && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {deleteError}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

        </PageTransition>
      </main>
    </div>
  )
}
