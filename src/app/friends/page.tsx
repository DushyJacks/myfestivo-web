"use client"

import { useAuth } from "@/lib/auth-context"
import { useEvents } from "@/lib/events-context"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db as getDb } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Search, UserPlus, Check, X, Loader2, Trophy, CalendarDays, GraduationCap, Mail, UserCircle2, Building, ShieldCheck } from "lucide-react"

interface FriendProfile {
  name?: string
  email?: string
  role?: string
  college?: string
  department?: string
  year?: string
  avatarUrl?: string
  collegeEmailVerified?: boolean
  collegeEmailVerifiedAt?: string
}

export default function FriendsPage() {
  const { user, isLoading, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } = useAuth()
  const { events } = useEvents()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [friendEmail, setFriendEmail] = useState("")
  const [friendSending, setFriendSending] = useState(false)
  const [friendMsg, setFriendMsg] = useState("")

  // Confirmation dialog state
  const [removingFriend, setRemovingFriend] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Friend details modal state
  const [selectedFriend, setSelectedFriend] = useState<{ email: string; profile: FriendProfile | null; loading: boolean } | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [user, isLoading, router])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[var(--color-border)] border-t-white/80 rounded-full animate-spin" />
    </div>
  )

  if (!user) return null

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !user) return
    setIsSearching(true)
    try {
      const q = query(collection(getDb(), "users"), where("email", "!=", user.email))
      const snap = await getDocs(q)
      const term = searchQuery.toLowerCase()
      const results = snap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter((u: any) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
        )
        .slice(0, 15)
      setSearchResults(results)
    } catch (err) {
      console.error("Search failed:", err)
    }
    setIsSearching(false)
  }

  const handleSendRequest = async (email: string) => {
    const ok = await sendFriendRequest(email)
    if (ok) setSearchResults(prev => prev.filter((u: any) => u.email !== email))
  }

  const handleSendByEmail = async () => {
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

  const handleConfirmRemove = async () => {
    if (!removingFriend) return
    setIsRemoving(true)
    await removeFriend(removingFriend)
    setIsRemoving(false)
    setRemovingFriend(null)
  }

  const handleOpenFriendProfile = async (email: string) => {
    setSelectedFriend({ email, profile: null, loading: true })
    try {
      const q = query(collection(getDb(), "users"), where("email", "==", email))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const data = snap.docs[0].data() as FriendProfile
        setSelectedFriend({ email, profile: data, loading: false })
      } else {
        setSelectedFriend({ email, profile: { email }, loading: false })
      }
    } catch {
      setSelectedFriend({ email, profile: { email }, loading: false })
    }
  }

  // Compute event stats for the selected friend
  const friendHostedCount = selectedFriend
    ? events.filter(e => e.organizerEmail === selectedFriend.email).length
    : 0
  const friendParticipatedCount = selectedFriend
    ? events.filter(e =>
        e.registrations.some(r => r.userEmail === selectedFriend.email && r.status !== "DRAFT")
      ).length
    : 0

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeItem="friends" />
      <main className="flex-1 md:ml-[72px] lg:ml-[260px] pb-20 md:pb-0">
        <PageTransition className="p-6 lg:p-10 max-w-5xl mx-auto">
          <motion.div variants={pageItem} className="mb-8">
            <MicroLabel>Social</MicroLabel>
            <h1 className="text-3xl font-light tracking-tight">Friends.</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Search & Add */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search */}
              <motion.div variants={pageItem}>
                <MicroLabel>Find your peers</MicroLabel>
                <GlassCard className="p-4 mb-3">
                  <form onSubmit={handleSearchUsers} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-faint)]" />
                    <Input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="pl-9 bg-[var(--color-surface-2)] border-[var(--color-border)] text-sm h-10"
                    />
                  </form>
                </GlassCard>
                <div className="space-y-2">
                  {isSearching && <p className="text-[10px] font-mono text-[var(--color-text-faint)] text-center py-2 animate-pulse">SEARCHING...</p>}
                  {!isSearching && searchQuery && searchResults.length === 0 && (
                    <p className="text-[10px] font-mono text-[var(--color-text-faint)] text-center py-2 uppercase">No results found</p>
                  )}
                  {searchResults.map((u: any) => {
                    const isFriend = user.friends.includes(u.email)
                    const isSent = user.friendRequestsOut.includes(u.email)
                    const isIncoming = user.friendRequestsIn.some(r => r.from === u.email)
                    return (
                      <GlassCard key={u.id} className="p-3 border-[var(--color-border)]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[10px] font-bold overflow-hidden">
                              {u.avatarUrl ? <Image src={u.avatarUrl} alt={u.name ?? "User"} width={32} height={32} className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{u.name}</p>
                              <p className="text-[9px] font-mono text-[var(--color-text-faint)] truncate">{u.email}</p>
                            </div>
                          </div>
                          {isFriend ? (
                            <span className="text-[9px] font-mono text-[var(--color-success)]/50 uppercase">Friend</span>
                          ) : isSent ? (
                            <span className="text-[9px] font-mono text-[var(--color-text-faint)] uppercase">Sent</span>
                          ) : isIncoming ? (
                            <span className="text-[9px] font-mono text-yellow-400/50 uppercase">Pending</span>
                          ) : (
                            <button onClick={() => handleSendRequest(u.email)} className="p-1.5 rounded hover:bg-[var(--color-surface-3)] text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors">
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </GlassCard>
                    )
                  })}
                </div>
              </motion.div>

              {/* Add by email */}
              <motion.div variants={pageItem}>
                <MicroLabel>Add by Email</MicroLabel>
                <GlassCard className="p-4">
                  <div className="flex gap-2">
                    <Input
                      value={friendEmail}
                      onChange={e => setFriendEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendByEmail()}
                      placeholder="friend@gmail.com"
                      className="bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] h-10 flex-1 text-sm"
                    />
                    <Button onClick={handleSendByEmail} disabled={friendSending} className="bg-white text-black hover:bg-[var(--color-surface-3)] h-10 px-4">
                      {friendSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    </Button>
                  </div>
                  {friendMsg && <p className={`text-xs mt-2 ${friendMsg.includes("✓") ? "text-[var(--color-success)]" : "text-red-400"}`}>{friendMsg}</p>}
                </GlassCard>
              </motion.div>

              {/* Incoming Requests */}
              {user.friendRequestsIn.length > 0 && (
                <motion.div variants={pageItem}>
                  <MicroLabel>Friend Requests ({user.friendRequestsIn.length})</MicroLabel>
                  <div className="space-y-2">
                    {user.friendRequestsIn.map(req => (
                      <GlassCard key={req.from} className="p-4 border-yellow-500/20 bg-yellow-500/[0.02]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-xs text-yellow-500 font-bold">
                              {req.fromName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-medium">{req.fromName}</p>
                              <p className="text-[9px] font-mono text-[var(--color-text-faint)]">{req.from}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => acceptFriendRequest(req.from)} aria-label="Accept" className="p-1.5 rounded hover:bg-[var(--color-success)]/20 text-[var(--color-success)]">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => declineFriendRequest(req.from)} aria-label="Decline" className="p-1.5 rounded hover:bg-red-500/20 text-red-400">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right: Friends List */}
            <motion.div variants={pageItem} className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <MicroLabel className="mb-0">My Friends ({user.friends.length})</MicroLabel>
              </div>
              {user.friends.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center border border-dashed border-[var(--color-border)] rounded-xl">
                  <p className="text-sm text-[var(--color-text-faint)] font-mono italic">YOUR SOCIAL CIRCLE IS EMPTY</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.friends.map(email => (
                    <GlassCard
                      key={email}
                      className="p-4 hover:border-[var(--color-border)] transition-colors group cursor-pointer"
                      onClick={() => handleOpenFriendProfile(email)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-sm font-bold border border-[var(--color-border)]">
                            {email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{email.split('@')[0]}</p>
                            <p className="text-[10px] font-mono text-[var(--color-text-faint)] italic">{email}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setRemovingFriend(email)
                          }}
                          className="p-2 rounded hover:bg-red-500/10 text-[var(--color-text-faint)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          title="Remove Friend"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* Pending sent */}
              {user.friendRequestsOut.length > 0 && (
                <div className="mt-6">
                  <MicroLabel>Pending Sent ({user.friendRequestsOut.length})</MicroLabel>
                  <div className="flex flex-wrap gap-2">
                    {user.friendRequestsOut.map(email => (
                      <span key={email} className="text-[10px] font-mono px-3 py-1 rounded-full border border-yellow-500/20 text-yellow-400/60 bg-yellow-500/5">{email}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </PageTransition>
      </main>

      {/* ── Remove Friend Confirmation Modal ── */}
      <AnimatePresence>
        {removingFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => !isRemoving && setRemovingFriend(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-[#0d0d0d] border border-white/[0.08] rounded-xl p-6 shadow-2xl"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-base font-medium mb-1">Remove Friend?</h2>
              <p className="text-sm text-white/50 mb-6">
                Are you sure you want to remove <span className="text-white/80 font-medium">{removingFriend}</span> from your friends? They will also be removed from their end.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                  onClick={() => setRemovingFriend(null)}
                  disabled={isRemoving}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  onClick={handleConfirmRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Friend Details Modal ── */}
      <AnimatePresence>
        {selectedFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setSelectedFriend(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-[#0d0d0d] border border-white/[0.08] rounded-xl p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  {selectedFriend.profile?.avatarUrl ? (
                    <img src={selectedFriend.profile.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border border-[#B388FF]/20" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#B388FF]/10 border border-[#B388FF]/20 flex items-center justify-center text-xl font-bold text-[#B388FF]">
                      {(selectedFriend.profile?.name ?? selectedFriend.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    {selectedFriend.loading ? (
                      <div className="w-24 h-4 bg-white/10 rounded animate-pulse mb-2" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-base">{selectedFriend.profile?.name ?? selectedFriend.email.split("@")[0]}</p>
                        {(() => {
                          const p = selectedFriend.profile
                          if (!p?.collegeEmailVerified || !p.collegeEmailVerifiedAt) return null
                          const SIX_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000
                          const isValid = (Date.now() - new Date(p.collegeEmailVerifiedAt).getTime()) < SIX_MONTHS
                          if (!isValid) return null
                          return (
                            <span title="Verified Student" className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[9px] font-mono text-emerald-400 tracking-wider">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          )
                        })()}
                      </div>
                    )}
                    <p className="text-[10px] font-mono text-white/40">{selectedFriend.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedFriend(null)} className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedFriend.loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 bg-white/[0.04] rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFriend.profile?.role && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <UserCircle2 className="w-4 h-4 text-white/30 shrink-0" />
                      <div>
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Role</p>
                        <p className="text-sm capitalize">{selectedFriend.profile.role}</p>
                      </div>
                    </div>
                  )}
                  {selectedFriend.profile?.college && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <Building className="w-4 h-4 text-white/30 shrink-0" />
                      <div>
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">College</p>
                        <p className="text-sm">{selectedFriend.profile.college}</p>
                      </div>
                    </div>
                  )}
                  {selectedFriend.profile?.department && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <GraduationCap className="w-4 h-4 text-white/30 shrink-0" />
                      <div>
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Department & Year</p>
                        <p className="text-sm">{selectedFriend.profile.department}{selectedFriend.profile?.year ? ` · ${selectedFriend.profile.year}` : ""}</p>
                      </div>
                    </div>
                  )}

                  {/* Event Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 rounded-lg bg-[#B388FF]/[0.06] border border-[#B388FF]/10 text-center">
                      <Trophy className="w-4 h-4 text-[#B388FF]/60 mx-auto mb-1" />
                      <p className="text-2xl font-light text-[#B388FF]">{friendHostedCount}</p>
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Hosted</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                      <CalendarDays className="w-4 h-4 text-white/30 mx-auto mb-1" />
                      <p className="text-2xl font-light">{friendParticipatedCount}</p>
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Participated</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
