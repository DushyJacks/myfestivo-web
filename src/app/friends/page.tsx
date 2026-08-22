"use client"

import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db as getDb } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Search, UserPlus, Check, X, Loader2 } from "lucide-react"

export default function FriendsPage() {
  const { user, isLoading, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } = useAuth()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [friendEmail, setFriendEmail] = useState("")
  const [friendSending, setFriendSending] = useState(false)
  const [friendMsg, setFriendMsg] = useState("")

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
      // Fetch all users except self, then filter client-side by name/email
      // (Firestore doesn't support full-text search natively, so we fetch all and filter locally)
      const q = query(collection(getDb(), "users"), where("email", "!=", user.email))
      const snap = await getDocs(q)
      const term = searchQuery.toLowerCase()
      const results = snap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter((u: any) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
        )
        .slice(0, 15) // cap display at 15
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
                    <GlassCard key={email} className="p-4 hover:border-[var(--color-border)] transition-colors group">
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
                          onClick={() => removeFriend(email)}
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
    </div>
  )
}
