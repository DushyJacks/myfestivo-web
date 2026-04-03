"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Save, Mail, Phone, School, BadgeCheck, AlertCircle,
  Loader2, CheckCircle2, Shield, User, BookOpen, UserPlus
} from "lucide-react"
import { NotificationSettings } from "@/components/settings/NotificationSettings"

export default function ProfilePage() {
  const { user, updateProfile, linkCollegeEmail, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } = useAuth()
  const router = useRouter()

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
  const [friendEmail, setFriendEmail] = useState("")
  const [friendSending, setFriendSending] = useState(false)
  const [friendMsg, setFriendMsg] = useState("")

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

  const handleSave = () => {
    updateProfile({ name, phone, bio, college, department, rollNo, year })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSendRequest = async () => {
    const email = friendEmail.trim().toLowerCase()
    if (!email) return
    setFriendSending(true); setFriendMsg("")
    try {
      const ok = await sendFriendRequest(email)
      setFriendMsg(ok ? "✓ Request sent!" : "User not found or already friends.")
      if (ok) setFriendEmail("")
    } catch { setFriendMsg("Failed to send request.") }
    setFriendSending(false)
    setTimeout(() => setFriendMsg(""), 3000)
  }

  const handleSendOtp = () => {
    if (!collegePrefix.trim()) return
    setVerifying(true); setVerifyError("")
    setTimeout(() => { setOtpSent(true); setVerifying(false) }, 1000)
  }

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { setVerifyError("Enter a valid OTP"); return }
    setVerifying(true); setVerifyError("")
    const success = await linkCollegeEmail(collegePrefix, collegeDomain)
    setVerifying(false)
    if (!success) { setVerifyError("Verification failed. Try again.") }
    else { setOtpSent(false); setOtp(""); setCollegePrefix("") }
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeItem="profile" />

      <main className="flex-1 ml-[72px] lg:ml-[260px]">
        <PageTransition className="p-6 lg:p-10 max-w-3xl mx-auto">
          <motion.div variants={pageItem} className="mb-8">
            <MicroLabel>Your Profile</MicroLabel>
            <h1 className="text-3xl font-light tracking-tight">Customize your profile.</h1>
          </motion.div>

          {/* Avatar + Basic Info */}
          <motion.div variants={pageItem} className="mb-8">
            <GlassCard className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                <div className="relative group shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User avatar" width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: user.avatarColor || "#3B82F6" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="text-[9px] font-mono text-white/80 uppercase tracking-widest">Change</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        const dataUrl = reader.result as string
                        updateProfile({ avatarUrl: dataUrl })
                      }
                      reader.readAsDataURL(file)
                    }} />
                  </label>
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
              </div>

              <MicroLabel>01 — Personal Info</MicroLabel>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block"><User className="w-3 h-3 inline mr-1" />Full Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white h-11" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block"><Phone className="w-3 h-3 inline mr-1" />Phone</label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..."
                    rows={3} className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 rounded-md px-3 py-3 text-sm resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block"><School className="w-3 h-3 inline mr-1" />College</label>
                    <Input value={college} onChange={e => setCollege(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white h-11" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block"><BookOpen className="w-3 h-3 inline mr-1" />Department</label>
                    <Input value={department} onChange={e => setDepartment(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block">Roll Number</label>
                    <Input value={rollNo} onChange={e => setRollNo(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white h-11" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block">Year</label>
                    <div className="flex gap-2">
                      {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(yr => (
                        <button key={yr} type="button" onClick={() => setYear(yr)}
                          className={`flex-1 py-2.5 rounded-md text-xs transition-colors border ${year === yr ? "bg-white text-black border-white" : "bg-white/[0.03] text-white/50 border-white/[0.08] hover:border-white/20"}`}>{yr}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button onClick={handleSave} className="bg-white text-black hover:bg-white/90 font-medium h-11 px-8"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
                {saved && <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved!</span>}
              </div>
            </GlassCard>
          </motion.div>

          {/* College Email Verification */}
          <motion.div variants={pageItem} className="mb-8">
            <GlassCard className="p-6 sm:p-8">
              <MicroLabel>02 — College Email Verification</MicroLabel>
              <p className="text-sm text-white/40 mb-6">Link your college email to access intra-college events.</p>

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
                    <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block">College Email Domain</label>
                    <Input value={collegeDomain} onChange={e => setCollegeDomain(e.target.value)} placeholder="srmist.edu.in"
                      className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11 mb-3" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block">Your College Email</label>
                    <div className="flex items-center gap-0">
                      <Input value={collegePrefix} onChange={e => setCollegePrefix(e.target.value)} placeholder="your.name"
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-11 rounded-r-none border-r-0 flex-1" />
                      <div className="h-11 px-4 flex items-center bg-white/[0.06] border border-white/[0.08] rounded-r-md text-white/50 text-sm font-mono whitespace-nowrap">@{collegeDomain}</div>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">Full email: {collegePrefix || "username"}@{collegeDomain}</p>
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
                        <span className="text-xs text-white/50">OTP sent to {collegePrefix}@{collegeDomain} (demo: enter any 6 digits)</span>
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

          {/* Friends */}
          <motion.div variants={pageItem} className="mb-8">
            <GlassCard className="p-6 sm:p-8">
              <MicroLabel>03 — Friends</MicroLabel>

              {/* Send Friend Request */}
              <div className="mb-6">
                <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-2 block">
                  <UserPlus className="w-3 h-3 inline mr-1" />Add Friend by Email
                </label>
                <div className="flex gap-2">
                  <Input
                    value={friendEmail}
                    onChange={e => setFriendEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendRequest()}
                    placeholder="friend@gmail.com"
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-10 flex-1"
                  />
                  <Button onClick={handleSendRequest} disabled={friendSending} className="bg-white text-black hover:bg-white/90 h-10 px-5">
                    {friendSending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Request"}
                  </Button>
                </div>
                {friendMsg && <p className={`text-xs mt-2 ${friendMsg.includes("✓") ? "text-green-400" : "text-red-400"}`}>{friendMsg}</p>}
              </div>

              {/* Incoming Requests */}
              {user.friendRequestsIn.length > 0 && (
                <div className="mb-6">
                  <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-3 block">
                    Incoming Requests ({user.friendRequestsIn.length})
                  </label>
                  <div className="space-y-2">
                    {user.friendRequestsIn.map(req => (
                      <div key={req.from} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{req.fromName}</p>
                          <p className="text-[10px] font-mono text-white/30">{req.from}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => acceptFriendRequest(req.from)} className="h-7 px-3 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">Accept</Button>
                          <Button onClick={() => declineFriendRequest(req.from)} variant="ghost" className="h-7 px-3 text-[10px] text-white/40 border border-white/[0.08] hover:text-red-400">Decline</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Outgoing */}
              {user.friendRequestsOut.length > 0 && (
                <div className="mb-6">
                  <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-3 block">
                    Pending Sent ({user.friendRequestsOut.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user.friendRequestsOut.map(email => (
                      <span key={email} className="text-[10px] font-mono px-3 py-1 rounded-full border border-yellow-500/20 text-yellow-400/60 bg-yellow-500/5">{email}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Friend List */}
              <div>
                <label className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-3 block">
                  Your Friends ({user.friends.length})
                </label>
                {user.friends.length === 0 ? (
                  <p className="text-sm text-white/20 font-mono">No friends yet. Send a request to get started!</p>
                ) : (
                  <div className="space-y-2">
                    {user.friends.map(f => (
                      <div key={f} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-mono text-white/40">{f[0].toUpperCase()}</div>
                          <span className="text-sm font-mono text-white/70">{f}</span>
                        </div>
                        <Button onClick={() => removeFriend(f)} variant="ghost" className="h-7 px-3 text-[10px] text-white/30 hover:text-red-400">Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Account Info */}
          <motion.div variants={pageItem}>
            <GlassCard className="p-6 sm:p-8">
              <MicroLabel>04 — Account Info</MicroLabel>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                  <span className="text-sm text-white/40">Login Email</span>
                  <span className="text-sm font-mono">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                  <span className="text-sm text-white/40">User ID</span>
                  <span className="text-sm font-mono text-white/50">{user.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                  <span className="text-sm text-white/40">Role</span>
                  <span className="text-sm font-mono">{user.role}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-white/40">Friends</span>
                  <span className="text-sm font-mono">{user.friends.length}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Notification Settings */}
          <motion.div variants={pageItem}>
            <NotificationSettings userEmail={user.email} />
          </motion.div>
        </PageTransition>
      </main>
    </div>
  )
}
