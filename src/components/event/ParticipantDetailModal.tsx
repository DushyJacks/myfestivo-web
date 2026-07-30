"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db as getDb } from "@/lib/firebase"
import { Registration, MainEvent } from "@/lib/events-context"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Phone, School, User, BookOpen, Calendar, Trophy, Users, CheckCircle2, Crown } from "lucide-react"

interface ParticipantUser {
  id: string
  name: string
  email: string
  college: string
  rollNo: string
  department: string
  year: string
  phone: string
  bio: string
  avatarColor: string
}

interface Props {
  reg: Registration | null
  event: MainEvent
  isOpen: boolean
  onClose: () => void
}

export function ParticipantDetailModal({ reg, event, isOpen, onClose }: Props) {
  const [userDetails, setUserDetails] = useState<ParticipantUser | null>(null)
  const [teammateDetails, setTeammateDetails] = useState<ParticipantUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !reg) {
      setUserDetails(null)
      setTeammateDetails([])
      return
    }

    // Helper: fetch a user profile by email using a Firestore query
    const fetchByEmail = async (email: string): Promise<ParticipantUser | null> => {
      try {
        const q = query(collection(getDb(), "users"), where("email", "==", email))
        const snap = await getDocs(q)
        if (!snap.empty) return snap.docs[0].data() as ParticipantUser
        return null
      } catch {
        return null
      }
    }

    const fetchUserDetails = async () => {
      setLoading(true)
      try {
        // Fetch captain profile by email
        const captainData = await fetchByEmail(reg.userEmail)
        if (captainData) setUserDetails(captainData)

        // Fetch all teammate profiles (skip captain — index 0 is captain's email)
        if (reg.teamMembers && reg.teamMembers.length > 1) {
          const teammateEmails = reg.teamMembers.slice(1)
          const profiles = await Promise.all(
            teammateEmails.map(async (email) => {
              const data = await fetchByEmail(email)
              return data ?? ({ email, name: email.split("@")[0], college: "—", department: "—", year: "—", phone: "—" } as unknown as ParticipantUser)
            })
          )
          setTeammateDetails(profiles)
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [isOpen, reg])

  if (!reg) return null

  const se = event.subEvents.find(s => s.id === reg.subEventId)
  const isTeam = !!(reg.teamName && reg.teamMembers && reg.teamMembers.length > 1)



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.1] p-8 z-50"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-light"
                style={{ backgroundColor: userDetails?.avatarColor || "#3B82F6" }}
              >
                {reg.userName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-light tracking-tight mb-1">{reg.userName}</h2>
                <p className="text-white/40 font-mono text-sm">{reg.userEmail}</p>
                {isTeam && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3" /> Team: {reg.teamName}
                  </span>
                )}
              </div>
            </div>

            {/* Main Details */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-white/40 font-mono text-sm">Loading details...</p>
              </div>
            ) : userDetails ? (
              <div className="space-y-6 mb-8">
                {/* Personal Information */}
                <div>
                  <MicroLabel>Personal Information</MicroLabel>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-white/40" />
                        <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Full Name</p>
                      </div>
                      <p className="text-sm text-white/80">{userDetails.name}</p>
                    </GlassCard>
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-white/40" />
                        <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Phone</p>
                      </div>
                      <p className="text-sm text-white/80">{userDetails.phone || "—"}</p>
                    </GlassCard>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <MicroLabel>Academic Information</MicroLabel>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <School className="w-4 h-4 text-white/40" />
                        <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">College</p>
                      </div>
                      <p className="text-sm text-white/80">{userDetails.college || "—"}</p>
                    </GlassCard>
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-white/40" />
                        <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Department</p>
                      </div>
                      <p className="text-sm text-white/80">{userDetails.department || "—"}</p>
                    </GlassCard>
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Year</p>
                      </div>
                      <p className="text-sm text-white/80">{userDetails.year || "—"}</p>
                    </GlassCard>
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-white/40" />
                        <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Roll No</p>
                      </div>
                      <p className="text-sm text-white/80 font-mono">{userDetails.rollNo || "—"}</p>
                    </GlassCard>
                  </div>
                </div>

                {/* Bio */}
                {userDetails.bio && (
                  <div>
                    <MicroLabel>Bio</MicroLabel>
                    <p className="text-sm text-white/60 leading-relaxed mt-2">{userDetails.bio}</p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Event Registration Details */}
            <div>
              <MicroLabel>Event Registration Details</MicroLabel>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <GlassCard className="p-4">
                  <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-2">Sub-Event</p>
                  <p className="text-sm text-white/80">{se?.name || "—"}</p>
                </GlassCard>

                <GlassCard className="p-4">
                  <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-2">Registered</p>
                  <p className="text-sm text-white/80 font-mono">{reg.timestamp}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-2">Check-In</p>
                  {reg.checkedIn ? (
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">{reg.checkInTime || "Checked in"}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-white/40">Not checked in</p>
                  )}
                </GlassCard>
              </div>
            </div>

            {/* Teammate's information */}
            {isTeam && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <MicroLabel className="mb-0">Teammate&apos;s information</MicroLabel>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-xs text-white/30 font-mono text-center py-4">Loading teammate details…</p>
                  ) : (
                    teammateDetails.map((tm, i) => (
                      <div key={tm.email ?? i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-3">
                          Teammate {i + 1}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-1">Name</p>
                            <p className="text-sm text-white/80">{tm.name || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-1">Email</p>
                            <p className="text-sm text-white/80">{tm.email}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-1">Phone Number</p>
                            <p className="text-sm text-white/80">{tm.phone || "—"}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Transaction Info */}
            {reg.transactionId && (
              <div className="mt-6">
                <MicroLabel>Payment Information</MicroLabel>
                <div className="grid grid-cols-2 gap-4 mt-4 mb-8">
                  <GlassCard className="p-4">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-2">Transaction ID</p>
                    <p className="text-sm text-white/80 font-mono break-all">{reg.transactionId}</p>
                  </GlassCard>
                  <GlassCard className="p-4">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-2">Payment Method</p>
                    <p className="text-sm text-white/80">{reg.paymentMethod || "—"}</p>
                  </GlassCard>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
