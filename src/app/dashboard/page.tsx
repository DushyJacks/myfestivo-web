"use client"

import { useAuth } from "@/lib/auth-context"
import { useEvents } from "@/lib/events-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QRCodeSVG } from "qrcode.react"
import {
  ChevronRight, Ticket, BarChart3,
  ListTodo, QrCode, CheckSquare, Clock, DollarSign, Megaphone,
  Pencil, Search, Check, Trash2, Mail, PlusCircle, Users, CalendarDays, X, UserPlus
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, limit } from "firebase/firestore"

export default function DashboardPage() {
  const { user, logout, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } = useAuth()
  const { events } = useEvents()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "friends" | "hosted" | "registered" | "tasks">("overview")
  const [showQR, setShowQR] = useState<string | null>(null)

  // ─── Friends State ───
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!user) router.push("/login")
    else if (user.role === "admin") router.push("/admin")
  }, [user, router])

  if (!user) return null

  const registeredEvents = events.filter(e => e.registrations.some(r => r.userEmail === user.email))
  const hostedEvents = events.filter(e => e.organizerEmail === user.email)
  const coordinatingEvents = events.filter(e => e.subEvents.some(se => se.coordinators.some(c => c.email === user.email)))

  const myTasks = events.flatMap(e =>
    e.tasks.filter(t => t.assignedTo === user.email || t.assignedTo === user.collegeEmail).map(t => ({ ...t, eventTitle: e.title, eventId: e.id }))
  )
  const pendingTasks = myTasks.filter(t => t.status !== "DONE")

  const myAnnouncements = events.filter(e => e.registrations.some(r => r.userEmail === user.email)).flatMap(e =>
    e.announcements.slice(0, 3).map(a => ({ ...a, eventTitle: e.title, eventId: e.id }))
  ).slice(0, 5)

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !user) return
    setIsSearching(true)
    try {
      const q = query(
        collection(db, "users"),
        where("email", "!=", user.email),
        limit(10)
      )
      const snap = await getDocs(q)
      const results = snap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter((u: any) => 
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      setSearchResults(results)
    } catch (err) {
      console.error("Search failed:", err)
    }
    setIsSearching(false)
  }

  const handleSendRequest = async (email: string) => {
    const ok = await sendFriendRequest(email)
    if (ok) {
      setSearchResults(prev => prev.filter(u => u.email !== email))
    }
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "registered" as const, label: "My Tickets", icon: QrCode },
    { id: "hosted" as const, label: "Hosted", icon: PlusCircle },
    { id: "tasks" as const, label: `Tasks${pendingTasks.length > 0 ? ` (${pendingTasks.length})` : ''}`, icon: ListTodo },
    { id: "friends" as const, label: "Friends", icon: Users },
  ]

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeItem="dashboard" />

      <main className="flex-1 ml-[72px] lg:ml-[260px]">
        <PageTransition className="p-6 lg:p-10 max-w-6xl mx-auto">
          <motion.div variants={pageItem} className="mb-10">
            <MicroLabel>Student Dashboard</MicroLabel>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight">Hey, {user.name.split(" ")[0]}.</h1>
          </motion.div>

          <motion.div variants={pageItem} className="flex gap-1 mb-10 border-b border-white/[0.08] overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? "text-white border-white" : "text-white/40 border-transparent hover:text-white/60"}`}>
                <tab.icon className="w-4 h-4" strokeWidth={1.5} />{tab.label}
              </button>
            ))}
          </motion.div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <motion.div variants={pageItem} className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{registeredEvents.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Registered</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{hostedEvents.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Hosted</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{coordinatingEvents.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Coordinating</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1 text-yellow-400">{pendingTasks.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Pending Tasks</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{user.friends.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Friends</div>
                </GlassCard>
              </motion.div>

              <motion.div variants={pageItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <Link href="/events">
                  <GlassCard className="p-6 hover:scale-[1.01] transition-transform cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div><h3 className="font-medium mb-1">Browse Events</h3><p className="text-sm text-white/40">Find and register for upcoming events</p></div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
                <Link href="/events/create">
                  <GlassCard className="p-6 hover:scale-[1.01] transition-transform cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div><h3 className="font-medium mb-1">Host New Event</h3><p className="text-sm text-white/40">Create and manage your own event</p></div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>

              {myAnnouncements.length > 0 && (
                <motion.div variants={pageItem} className="mb-10">
                  <MicroLabel>Latest Announcements</MicroLabel>
                  <div className="space-y-2">
                    {myAnnouncements.map(a => (
                      <Link key={a.id} href={`/events/${a.eventId}`}>
                        <GlassCard className="p-4 hover:bg-white/[0.04] transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Megaphone className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-medium">{a.title}</span>
                                <span className="text-[9px] font-mono text-white/30 border border-white/10 px-1 rounded">{a.eventTitle}</span>
                              </div>
                              <p className="text-xs text-white/50 line-clamp-1">{a.message}</p>
                              <p className="text-[9px] font-mono text-white/20 mt-1">{a.timestamp}</p>
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {pendingTasks.length > 0 && (
                <motion.div variants={pageItem} className="mb-10">
                  <MicroLabel>Assigned Tasks</MicroLabel>
                  <div className="space-y-2">
                    {pendingTasks.slice(0, 5).map(t => (
                      <Link key={t.id} href={`/events/${t.eventId}`}>
                        <GlassCard className="p-4 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${t.status === "IN_PROGRESS" ? 'bg-yellow-500/10' : 'bg-white/[0.05]'}`}>
                            {t.status === "IN_PROGRESS" ? <Clock className="w-4 h-4 text-yellow-400" /> : <CheckSquare className="w-4 h-4 text-white/30" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{t.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-white/30">{t.eventTitle}</span>
                              {t.deadline && <span className={`text-[10px] font-mono flex items-center gap-0.5 ${new Date(t.deadline) < new Date() ? 'text-red-400' : 'text-white/30'}`}><CalendarDays className="w-3 h-3" /> {t.deadline}</span>}
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${t.status === "IN_PROGRESS" ? "border-yellow-500/30 text-yellow-400" : "border-white/20 text-white/40"}`}>{t.status.replace("_", " ")}</span>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* MY TICKETS */}
          {activeTab === "registered" && (
            <motion.div variants={pageItem}>
              <MicroLabel>My Tickets & QR Passes</MicroLabel>
              {registeredEvents.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="font-mono text-white/20 text-lg mb-4">No tickets yet</p>
                  <Link href="/events"><Button className="bg-white text-black hover:bg-white/90">Browse Events</Button></Link>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {registeredEvents.map(evt => {
                    const myRegs = evt.registrations.filter(r => r.userEmail === user.email)
                    return (
                      <GlassCard key={evt.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium mb-1">{evt.title}</h3>
                            <p className="text-xs font-mono text-white/40">{evt.date} — {evt.venue}</p>
                          </div>
                          <Link href={`/events/${evt.id}`}>
                            <Button variant="outline" className="border-white/20 text-white text-xs">View Event</Button>
                          </Link>
                        </div>
                        {myRegs.map(reg => {
                          const subEvt = evt.subEvents.find(se => se.id === reg.subEventId)
                          const isOpen = showQR === reg.id
                          return (
                            <div key={reg.id} className="mb-3 p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm">{subEvt?.name || "Sub-Event"}</p>
                                    {reg.teamName && <p className="text-xs text-white/40">Team: {reg.teamName}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono text-[10px] px-2 py-0.5 border rounded ${reg.status === "PAID" ? "border-green-500/30 text-green-400" : reg.status === "PENDING" ? "border-yellow-500/30 text-yellow-400" : "border-white/20 text-white/40"}`}>{reg.status}</span>
                                  {reg.checkedIn && <span className="text-[10px] font-mono text-green-400 flex items-center gap-1"><CheckSquare className="w-3 h-3" />Checked In</span>}
                                  <button onClick={() => setShowQR(isOpen ? null : reg.id)} aria-label={isOpen ? "Hide QR pass" : "Show QR pass"} className="flex items-center gap-1 text-xs text-white/50 hover:text-white border border-white/20 rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                                    <QrCode className="w-3 h-3" aria-hidden="true" />{isOpen ? "Hide" : "QR Pass"}
                                  </button>
                                </div>
                              </div>
                              {isOpen && (
                                <div className="mt-4 flex flex-col items-center pt-4 border-t border-white/[0.06]">
                                  <div className="p-4 bg-white rounded-lg mb-3">
                                    <QRCodeSVG value={`MYFESTIVO:${evt.id}:${reg.subEventId}:${reg.id}`} size={160} />
                                  </div>
                                  <p className="text-[10px] font-mono text-white/40">{reg.id}</p>
                                  <p className="text-[10px] font-mono text-white/30">Show this at check-in</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </GlassCard>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* HOSTED */}
          {activeTab === "hosted" && (
            <motion.div variants={pageItem}>
              <div className="flex justify-between items-center mb-6">
                <MicroLabel className="mb-0">Events You Hosted</MicroLabel>
                <Link href="/events/create"><Button className="bg-white text-black hover:bg-white/90 text-sm"><PlusCircle className="w-4 h-4 mr-2" />New Event</Button></Link>
              </div>
              {hostedEvents.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="font-mono text-white/20 text-lg mb-4">No events hosted yet</p>
                  <Link href="/events/create"><Button className="bg-white text-black hover:bg-white/90">Host Your First Event</Button></Link>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {hostedEvents.map(evt => (
                    <GlassCard key={evt.id} className="p-6 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium mb-1">{evt.title}</h3>
                          <p className="text-xs font-mono text-white/40 mb-2">{evt.date}</p>
                          <div className="flex gap-4 text-xs text-white/50">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{evt.registeredCount} registrations</span>
                            <span>{evt.subEvents.length} sub-events</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{(evt.registrations.filter(r => r.status === "PAID").length * evt.price).toLocaleString()}</span>
                            <span className="flex items-center gap-1"><ListTodo className="w-3 h-3" />{evt.tasks.filter(t => t.status !== "DONE").length} tasks</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <Link href={`/events/${evt.id}/edit`}>
                            <Button variant="outline" className="border-white/20 text-white text-xs h-8 px-3 hover:bg-white/10">
                              <Pencil className="w-3 h-3 mr-1.5" />Edit
                            </Button>
                          </Link>
                          <Link href={`/events/${evt.id}`}>
                            <Button variant="ghost" className="text-white/50 hover:text-white text-xs h-8 px-3">
                              View<ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TASKS */}
          {activeTab === "tasks" && (
            <motion.div variants={pageItem}>
              <MicroLabel>My Assigned Tasks</MicroLabel>
              {myTasks.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="font-mono text-white/20 text-lg mb-4">No tasks assigned</p>
                  <p className="text-sm text-white/30">Tasks assigned to you by event organizers will appear here.</p>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["TODO", "IN_PROGRESS", "DONE"] as const).map(status => {
                    const label = status === "TODO" ? "To Do" : status === "IN_PROGRESS" ? "In Progress" : "Done"
                    const color = status === "TODO" ? "border-white/10" : status === "IN_PROGRESS" ? "border-yellow-500/20" : "border-green-500/20"
                    const tasks = myTasks.filter(t => t.status === status)
                    return (
                      <div key={status} className={`rounded-lg border ${color} bg-white/[0.01] p-4`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono tracking-widest uppercase text-white/50">{label}</span>
                          <span className="text-[10px] font-mono text-white/30 bg-white/[0.05] px-2 py-0.5 rounded">{tasks.length}</span>
                        </div>
                        <div className="space-y-3">
                          {tasks.map(t => {
                            const isOverdue = t.deadline && new Date(t.deadline) < new Date() && status !== "DONE"
                            return (
                              <Link key={t.id} href={`/events/${t.eventId}`}>
                                <div className={`p-3 rounded-md bg-white/[0.03] border ${isOverdue ? 'border-red-500/30' : 'border-white/[0.06]'} hover:bg-white/[0.05] transition-colors cursor-pointer`}>
                                  <p className="text-sm font-medium mb-1">{t.title}</p>
                                  {t.description && <p className="text-[10px] text-white/40 mb-2">{t.description}</p>}
                                  <div className="flex flex-wrap gap-1">
                                    <span className="text-[9px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-white/30">{t.eventTitle}</span>
                                    {t.deadline && <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.05] text-white/30'}`}><CalendarDays className="w-2.5 h-2.5" /> {t.deadline}</span>}
                                  </div>
                                </div>
                              </Link>
                            )
                          })}
                          {tasks.length === 0 && <p className="text-[10px] text-white/20 font-mono text-center py-4">Empty</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* FRIENDS */}
          {activeTab === "friends" && (
            <motion.div variants={pageItem}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Search & Pending */}
                <div className="lg:col-span-1 space-y-8">
                  <div>
                    <MicroLabel>Find Peers</MicroLabel>
                    <GlassCard className="p-4 mb-4">
                      <form onSubmit={handleSearchUsers} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input 
                          value={searchQuery} 
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search by name or email..." 
                          className="pl-9 bg-white/[0.03] border-white/10 text-sm h-10" 
                        />
                      </form>
                    </GlassCard>

                    <div className="space-y-2">
                      {isSearching && <p className="text-[10px] font-mono text-white/20 text-center py-2 animate-pulse">SEARCHING...</p>}
                      {!isSearching && searchQuery && searchResults.length === 0 && (
                        <p className="text-[10px] font-mono text-white/20 text-center py-2 uppercase">No results found</p>
                      )}
                      {searchResults.map(u => {
                        const isFriend = user.friends.includes(u.email)
                        const isSent = user.friendRequestsOut.includes(u.email)
                        const isIncoming = user.friendRequestsIn.some(r => r.from === u.email)
                        
                        return (
                          <GlassCard key={u.id} className="p-3 border-white/[0.03]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                  {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} width={32} height={32} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate">{u.name}</p>
                                  <p className="text-[9px] font-mono text-white/30 truncate">{u.email}</p>
                                </div>
                              </div>
                              {isFriend ? (
                                <span className="text-[9px] font-mono text-green-400/50 uppercase">Friend</span>
                              ) : isSent ? (
                                <span className="text-[9px] font-mono text-white/20 uppercase">Sent</span>
                              ) : isIncoming ? (
                                <span className="text-[9px] font-mono text-yellow-400/50 uppercase">Pending</span>
                              ) : (
                                <button 
                                  onClick={() => handleSendRequest(u.email)}
                                  className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </GlassCard>
                        )
                      })}
                    </div>
                  </div>

                  {/* Incoming Requests */}
                  {user.friendRequestsIn.length > 0 && (
                    <div>
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
                                  <p className="text-[9px] font-mono text-white/40">{req.from}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => acceptFriendRequest(req.from)} aria-label="Accept friend request" className="p-1.5 rounded hover:bg-green-500/20 text-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/40"><Check className="w-4 h-4" aria-hidden="true" /></button>
                                <button onClick={() => declineFriendRequest(req.from)} aria-label="Decline friend request" className="p-1.5 rounded hover:bg-red-500/20 text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"><X className="w-4 h-4" aria-hidden="true" /></button>
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Friends List */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <MicroLabel className="mb-0">My Friends ({user.friends.length})</MicroLabel>
                  </div>
                  
                  {user.friends.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                      <p className="text-sm text-white/20 font-mono italic">YOUR SOCIAL CIRCLE IS EMPTY</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {user.friends.map(email => (
                        <GlassCard key={email} className="p-4 hover:border-white/10 transition-colors group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/10">
                                {email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{email.split('@')[0]}</p>
                                <p className="text-[10px] font-mono text-white/30 italic">{email}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeFriend(email)}
                              className="p-2 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              title="Remove Friend"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </PageTransition>
      </main>
    </div>
  )
}
