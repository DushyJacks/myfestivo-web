"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db as getDb } from "@/lib/firebase"
import { Registration, MainEvent } from "@/lib/events-context"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Phone, School, User, BookOpen, Calendar, Trophy, Users, CheckCircle2 } from "lucide-react"

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !reg) {
      setUserDetails(null)
      return
    }

    const fetchUserDetails = async () => {
      setLoading(true)
      try {
        // Try to fetch user details from Firestore
        const userRef = doc(getDb(), "users", reg.userEmail)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setUserDetails(userSnap.data() as ParticipantUser)
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
                  <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-2">Status</p>
                  <span className={`inline-block text-[10px] font-mono px-2 py-1 rounded border ${reg.status === "PAID" ? "border-green-500/30 text-green-400 bg-green-500/5" :
                    reg.status === "PENDING" ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/5" :
                      "border-white/20 text-white/40"
                  }`}>{reg.status}</span>
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

            {/* Team Information */}
            {reg.teamName && (
              <div className="mt-6">
                <MicroLabel>Team Information</MicroLabel>
                <div className="mt-4">
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-white/40" />
                      <p className="font-medium text-white/80">{reg.teamName}</p>
                    </div>
                    {reg.teamMembers && reg.teamMembers.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-2">Members ({reg.teamMembers.length})</p>
                        <ul className="space-y-1">
                          {reg.teamMembers.map((member, i) => (
                            <li key={i} className="text-sm text-white/60 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                              {member}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </GlassCard>
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
