"use client"

import { useAuth, User as AppUser, UserRole } from "@/lib/auth-context"
import { useEvents, MainEvent } from "@/lib/events-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import {
  LogOut, BarChart3, Users, Calendar, TrendingUp,
  Ticket, DollarSign, Activity, ChevronRight,
  Trash2, Pencil, Search, Shield, ShieldOff, AlertTriangle,
  X, Check, ExternalLink, ToggleLeft, ToggleRight,
  UserX, Eye, Filter, RefreshCw, Download, UserCheck
} from "lucide-react"
import { db as getDb } from "@/lib/firebase"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { RichTextDisplay } from "@/components/ui/RichTextDisplay"
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils"

type AdminTab = "overview" | "events" | "users" | "registrations"

// ─── Confirmation Modal ───
function ConfirmModal({ title, message, onConfirm, onCancel, variant = "danger" }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void; variant?: "danger" | "warning"
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-lg ${variant === "danger" ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === "danger" ? "text-red-400" : "text-yellow-400"}`} />
          </div>
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-white/50 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onCancel} className="text-white/50 text-sm">Cancel</Button>
          <Button onClick={onConfirm} className={`text-sm ${variant === "danger" ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30" : "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30"}`}>
            Confirm
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminPage() {
  const { user, logout } = useAuth()
  const { events, deleteEvent, updateEvent, approvePayment, rejectPayment, deleteRegistration } = useEvents()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>("overview")

  // ─── Users State ───
  const [allUsers, setAllUsers] = useState<AppUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | UserRole>("all")
  const [userDeptFilter, setUserDeptFilter] = useState<string>("all")
  const [userYearFilter, setUserYearFilter] = useState<string>("all")

  // ─── Events State ───
  const [eventSearch, setEventSearch] = useState("")
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("all")

  // ─── Registrations State ───
  const [regSearch, setRegSearch] = useState("")
  const [regStatusFilter, setRegStatusFilter] = useState<string>("all")
  const [regEventFilter, setRegEventFilter] = useState<string>("all")

  // ─── Modals ───
  const [confirmAction, setConfirmAction] = useState<{
    title: string; message: string; action: () => void; variant?: "danger" | "warning"
  } | null>(null)

  // ─── Editing Event inline ───
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<{ title: string; date: string; venue: string; seats: number; price: number }>({ title: "", date: "", venue: "", seats: 0, price: 0 })

  // ─── Expanding pending review event details ───
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  // ─── Fetch Users from Firestore ───
  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const snap = await getDocs(collection(getDb(), "users"))
      const STANDARD_COLLEGES = new Set([
        "SRMIST, Ramapuram",
        "SRMIST, Kattankulathur",
        "SRMIST, Vadapalani",
        "SRMIST, Tiruchirappalli",
      ])
      const users = snap.docs.map(d => {
        const data = { ...d.data(), id: d.id } as AppUser
        // Normalise college
        if (data.college && !STANDARD_COLLEGES.has(data.college.trim())) {
          data.college = "SRMIST, Ramapuram"
        }
        // Derive faculty role from year field (non-destructive — doesn't write back to DB)
        if (data.role !== "admin") {
          const isFaculty = data.year === "Faculty/Staff" || data.year === "Faculty" || data.role === "faculty"
          data.role = isFaculty ? "faculty" : "student"
        }
        return data
      })
      setAllUsers(users)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    }
    setUsersLoading(false)
  }

  useEffect(() => {
    if (activeTab === "users" && allUsers.length === 0) {
      fetchUsers()
    }
  }, [activeTab])

  if (!user || user.role !== "admin") return null

  // ─── Analytics ───
  const totalEvents = events.length
  const totalRegistrations = events.reduce((sum, e) => sum + e.registrations.filter(r => r.status !== "DRAFT").length, 0)
  const totalRevenue = events.reduce((sum, e) =>
    sum + e.registrations.filter(r => r.status === "PAID").length * e.price, 0)
  const totalSubEvents = events.reduce((sum, e) => sum + e.subEvents.length, 0)
  const paidRegistrations = events.reduce((sum, e) => sum + e.registrations.filter(r => r.status === "PAID").length, 0)
  const pendingRegistrations = events.reduce((sum, e) => sum + e.registrations.filter(r => r.status === "PENDING").length, 0)
  const refundedRegistrations = events.reduce((sum, e) => sum + e.registrations.filter(r => r.status === "REFUNDED").length, 0)
  const interEvents = events.filter(e => e.isInter).length
  const intraEvents = events.filter(e => !e.isInter).length
  const categoryStats = ["Technical", "Cultural", "Sports", "Workshop"].map(cat => ({
    name: cat,
    count: events.filter(e => e.category === cat).length,
    registrations: events.filter(e => e.category === cat).reduce((s, e) => s + e.registrations.filter(r => r.status !== "DRAFT").length, 0),
  }))

  // ─── Filtered Events ───
  const filteredEvents = events.filter(evt => {
    // Pending events are shown separately in the review queue above, not in the main table
    if (evt.status === "pending_review") return false
    const matchSearch = evt.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(eventSearch.toLowerCase())
    const matchCategory = eventCategoryFilter === "all" || evt.category === eventCategoryFilter
    return matchSearch && matchCategory
  })

  // ─── Filtered Users ───
  const uniqueDepts = Array.from(new Set(allUsers.map(u => u.department).filter(Boolean))).sort() as string[]
  const uniqueYears = Array.from(new Set(allUsers.map(u => u.year).filter(Boolean))).sort() as string[]

  const filteredUsers = allUsers.filter(u => {
    const college = u.college || ""
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      college.toLowerCase().includes(userSearch.toLowerCase())
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter
    const matchDept = userDeptFilter === "all" || u.department === userDeptFilter
    const matchYear = userYearFilter === "all" || u.year === userYearFilter
    return matchSearch && matchRole && matchDept && matchYear
  })

  // ─── All Registrations flat list ───
  const allRegistrations = events.flatMap(evt =>
    evt.registrations.map(reg => ({ ...reg, eventTitle: evt.title, eventId: evt.id, eventPrice: evt.price }))
  ).filter(reg => {
    const matchSearch = reg.userName.toLowerCase().includes(regSearch.toLowerCase()) ||
      reg.userEmail.toLowerCase().includes(regSearch.toLowerCase())
    const matchStatus = regStatusFilter === "all" || reg.status === regStatusFilter
    const matchEvent = regEventFilter === "all" || reg.eventId === regEventFilter
    return matchSearch && matchStatus && matchEvent
  })

  // ─── User CRUD ───
  const changeUserRole = async (uid: string, newRole: UserRole) => {
    await updateDoc(doc(getDb(), "users", uid), { role: newRole })
    setAllUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u))
  }

  const deleteUser = async (uid: string) => {
    await deleteDoc(doc(getDb(), "users", uid))
    setAllUsers(prev => prev.filter(u => u.id !== uid))
  }

  const handleManualVerify = async (uid: string) => {
    await updateDoc(doc(getDb(), "users", uid), { collegeEmailVerified: true })
    setAllUsers(prev => prev.map(u => u.id === uid ? { ...u, collegeEmailVerified: true } : u))
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return
    
    // Flatten and clean data for CSV
    const csvData = data.map(item => {
      const cleanItem: any = {}
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          cleanItem[key] = JSON.stringify(value).replace(/"/g, '""')
        } else {
          cleanItem[key] = String(value).replace(/"/g, '""')
        }
      })
      return cleanItem
    })

    const headers = Object.keys(csvData[0])
    const csvRows = [
      headers.join(","),
      ...csvData.map(row => headers.map(header => `"${row[header] || ""}"`).join(","))
    ]
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ─── Event inline edit ───
  const startEditEvent = (evt: MainEvent) => {
    setEditingEventId(evt.id)
    setEditFields({ title: evt.title, date: evt.date, venue: evt.venue, seats: evt.seats, price: evt.price })
  }

  const saveEventEdit = async () => {
    if (!editingEventId) return
    await updateEvent(editingEventId, editFields)
    setEditingEventId(null)
  }

  // ─── Cancel a single registration ───
  const cancelRegistration = async (eventId: string, regId: string) => {
    await deleteRegistration(eventId, regId)
  }

  const tabs: { id: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "events", label: "Events", icon: Calendar },
    { id: "users", label: "Users", icon: Users },
    { id: "registrations", label: "Registrations", icon: Ticket },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-[72px] lg:w-[260px] border-r border-white/[0.06] bg-black/60 backdrop-blur-md flex flex-col justify-between py-6 fixed h-screen z-40">
        <div>
          <Link href="/" className="hidden lg:block px-5 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto" width={100} height={32} loading="lazy" decoding="async" />
          </Link>
          <Link href="/" className="block lg:hidden px-5 mb-2 text-lg font-semibold tracking-tight text-white text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto mx-auto" width={100} height={32} loading="lazy" decoding="async" />
          </Link>
          <p className="hidden lg:block px-5 mb-8 text-[10px] font-mono text-white/30 tracking-widest uppercase">Admin Panel</p>

          <nav className="flex flex-col gap-1 px-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors text-left w-full ${
                  activeTab === tab.id ? 'bg-white/[0.05] text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <tab.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                <span className="hidden lg:inline text-sm">{tab.label}</span>
                {tab.id === "users" && allUsers.length > 0 && (
                  <span className="hidden lg:inline ml-auto text-[10px] font-mono text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded">{allUsers.length}</span>
                )}
                {tab.id === "events" && (
                  <span className="hidden lg:inline ml-auto text-[10px] font-mono text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded">{events.length}</span>
                )}
                {tab.id === "events" && events.filter(e => e.status === "pending_review").length > 0 && (
                  <span className="hidden lg:inline ml-1 text-[10px] font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded animate-pulse">
                    {events.filter(e => e.status === "pending_review").length} pending
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-3 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-medium text-red-400">
              <Shield className="w-4 h-4" />
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user.name}</p>
              <p className="text-[10px] font-mono text-red-400/60 truncate">ADMIN</p>
            </div>
          </div>
          <button onClick={() => { logout(); router.push("/") }} className="flex items-center gap-3 p-3 w-full rounded-md hover:bg-red-500/10 transition-colors text-white/40 hover:text-red-400">
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span className="hidden lg:inline text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-[72px] lg:ml-[260px] pb-20 md:pb-0">
        <PageTransition className="p-6 lg:p-10 max-w-7xl mx-auto">

          {/* ═══════════════════════════════════════ */}
          {/* OVERVIEW TAB                           */}
          {/* ═══════════════════════════════════════ */}
          {activeTab === "overview" && (
            <>
              <motion.div variants={pageItem} className="mb-10">
                <MicroLabel>Admin Overview</MicroLabel>
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight">Platform Analytics</h1>
                <p className="text-sm text-white/30 mt-2">Real-time overview of all platform activity</p>
              </motion.div>

              <motion.div variants={pageItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <GlassCard className="p-6">
                  <div className="text-4xl font-light mb-2">{totalEvents}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Total Events</div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-400"><TrendingUp className="w-3 h-3" /> Active</div>
                </GlassCard>
                <GlassCard className="p-6">
                  <div className="text-4xl font-light mb-2">{totalRegistrations}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Registrations</div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-white/30"><Activity className="w-3 h-3" /> {paidRegistrations} paid</div>
                </GlassCard>
                <GlassCard className="p-6">
                  <div className="text-4xl font-light mb-2">₹{totalRevenue.toLocaleString()}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Revenue</div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-white/30"><DollarSign className="w-3 h-3" /> Collected</div>
                </GlassCard>
                <GlassCard className="p-6">
                  <div className="text-4xl font-light mb-2">{totalSubEvents}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Sub-Events</div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-white/30">{interEvents} inter / {intraEvents} intra</div>
                </GlassCard>
              </motion.div>

              <motion.div variants={pageItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Category Breakdown */}
                <GlassCard className="p-6">
                  <MicroLabel>Category Breakdown</MicroLabel>
                  <div className="space-y-4 mt-4">
                    {categoryStats.map(cat => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat.name}</span>
                          <span className="text-white/40 font-mono text-xs">{cat.count} events · {cat.registrations} regs</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-white/20 to-white/40 rounded-full transition-all" style={{ width: `${totalEvents > 0 ? (cat.count / totalEvents) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Registration Status */}
                <GlassCard className="p-6">
                  <MicroLabel>Registration Status</MicroLabel>
                  <div className="grid grid-cols-3 gap-6 mt-4">
                    <div className="text-center">
                      <div className="text-3xl font-light text-green-400 mb-1">{paidRegistrations}</div>
                      <div className="text-[10px] font-mono text-white/40 tracking-widest">PAID</div>
                    </div>
                    <div className="text-center border-x border-white/[0.06]">
                      <div className="text-3xl font-light text-yellow-400 mb-1">{pendingRegistrations}</div>
                      <div className="text-[10px] font-mono text-white/40 tracking-widest">PENDING</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-light mb-1">{refundedRegistrations}</div>
                      <div className="text-[10px] font-mono text-white/40 tracking-widest">REFUNDED</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Quick User Stats */}
              <motion.div variants={pageItem}>
                <GlassCard className="p-6">
                  <MicroLabel>Platform Users</MicroLabel>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    <div>
                      <div className="text-2xl font-light">{allUsers.length || "—"}</div>
                      <p className="text-[10px] font-mono text-white/40 tracking-widest mt-1">TOTAL USERS</p>
                    </div>
                    <div>
                      <div className="text-2xl font-light">{allUsers.filter(u => u.role === "admin").length || "—"}</div>
                      <p className="text-[10px] font-mono text-white/40 tracking-widest mt-1">ADMINS</p>
                    </div>
                    <div>
                      <div className="text-2xl font-light">{allUsers.filter(u => u.hostedEvents.length > 0).length || "—"}</div>
                      <p className="text-[10px] font-mono text-white/40 tracking-widest mt-1">HOSTS</p>
                    </div>
                    <div>
                      <div className="text-2xl font-light">{allUsers.filter(u => u.collegeEmailVerified).length || "—"}</div>
                      <p className="text-[10px] font-mono text-white/40 tracking-widest mt-1">VERIFIED</p>
                    </div>
                  </div>
                  {allUsers.length === 0 && (
                    <button onClick={fetchUsers} className="mt-4 text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                      <RefreshCw className="w-3 h-3" /> Load user data
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            </>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* EVENTS TAB — FULL CRUD                 */}
          {/* ═══════════════════════════════════════ */}
          {activeTab === "events" && (
            <motion.div variants={pageItem}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <MicroLabel>Event Management</MicroLabel>
                  <h2 className="text-2xl font-light">All Events ({events.length})</h2>
                </div>
                <Link href="/events/create">
                  <Button variant="outline" className="border-white/20 text-white text-sm hover:bg-white/10">+ Create Event</Button>
                </Link>
              </div>

              {/* ── Pending Review Queue ── */}
              {events.filter(e => e.status === "pending_review").length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <MicroLabel className="mb-0 text-yellow-400/80">Pending Review ({events.filter(e => e.status === "pending_review").length})</MicroLabel>
                  </div>
                  <div className="space-y-3">
                    {events.filter(e => e.status === "pending_review").map(evt => {
                      const isExpanded = expandedEventId === evt.id
                      return (
                        <GlassCard key={evt.id} className="border-yellow-500/10 overflow-hidden">
                          {/* ─ Header Row ─ */}
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[9px] font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">PENDING REVIEW</span>
                                  <span className="text-[10px] font-mono text-white/30">{evt.category}</span>
                                  {evt.isInter ? (
                                    <span className="text-[9px] font-mono text-purple-400/60 border border-purple-500/20 px-2 py-0.5 rounded-full">INTER-COLLEGE</span>
                                  ) : (
                                    <span className="text-[9px] font-mono text-blue-400/60 border border-blue-500/20 px-2 py-0.5 rounded-full">INTRA-COLLEGE</span>
                                  )}
                                </div>
                                <h3 className="font-medium text-white mb-0.5">{evt.title}</h3>
                                <p className="text-xs text-white/40 font-mono">
                                  by {evt.organizer} · {formatDateDisplay(evt.date)}{evt.hasTime && evt.time ? ` at ${formatTimeDisplay(evt.time)}` : ""} · {evt.venue}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Toggle details */}
                                <button
                                  onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                                  className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border transition-colors ${isExpanded ? "border-white/20 text-white/60 bg-white/5" : "border-white/10 text-white/30 hover:text-white/60 hover:border-white/20"}`}
                                >
                                  <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                  {isExpanded ? "Hide" : "View Details"}
                                </button>
                                <Button
                                  onClick={() => setConfirmAction({
                                    title: "Approve Event",
                                    message: `Approve "${evt.title}"? This will publish it and open registration for participants.`,
                                    variant: "warning",
                                    action: async () => {
                                      await updateEvent(evt.id, { registrationOpen: true, status: "published" } as any)
                                      setConfirmAction(null)
                                    }
                                  })}
                                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 text-xs h-8 px-3"
                                >
                                  <Check className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button
                                  onClick={() => setConfirmAction({
                                    title: "Reject Event",
                                    message: `Reject and permanently delete "${evt.title}"? This cannot be undone.`,
                                    variant: "danger",
                                    action: async () => {
                                      await deleteEvent(evt.id)
                                      setConfirmAction(null)
                                    }
                                  })}
                                  variant="ghost"
                                  className="border border-red-500/30 text-red-400 text-xs h-8 px-3 hover:bg-red-500/10"
                                >
                                  <X className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* ─ Expanded Details Panel ─ */}
                          {isExpanded && (
                            <div className="border-t border-yellow-500/10 bg-white/[0.01] px-5 pb-5 pt-4 space-y-5">
                              {/* Quick stat badges */}
                              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                                <span className="px-2 py-1 rounded border border-white/10 text-white/40">{evt.seats} seats</span>
                                <span className="px-2 py-1 rounded border border-white/10 text-white/40">{evt.price > 0 ? `₹${evt.price} entry` : "Free entry"}</span>
                                {evt.registrationDeadline && <span className="px-2 py-1 rounded border border-white/10 text-white/40">Deadline: {formatDateDisplay(evt.registrationDeadline)}</span>}
                                {evt.organizerPhone && <span className="px-2 py-1 rounded border border-white/10 text-white/40">📞 {evt.organizerPhone}</span>}
                                {evt.prizePool && <span className="px-2 py-1 rounded border border-yellow-500/20 text-yellow-400/60">🏆 {evt.prizePool}</span>}
                              </div>

                              {/* About */}
                              <div>
                                <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">About the Event</p>
                                <div className="text-sm text-white/60 leading-relaxed">
                                  <RichTextDisplay content={evt.description} />
                                </div>
                              </div>

                              {/* Rules */}
                              {evt.rules && evt.rules.filter(r => r.trim()).length > 0 && (
                                <div>
                                  <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">Rules</p>
                                  <ul className="space-y-1">
                                    {evt.rules.filter(r => r.trim()).map((rule, i) => (
                                      <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                                        <span className="font-mono text-white/20 shrink-0 mt-0.5">{i + 1}.</span>
                                        <span>{rule}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Sub-events */}
                              {evt.subEvents && evt.subEvents.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">Sub-Events ({evt.subEvents.length})</p>
                                  <div className="space-y-3">
                                    {evt.subEvents.map((se, si) => (
                                      <div key={si} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="text-sm font-medium text-white">{se.name}</p>
                                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-white/30">{se.type}</span>
                                          {se.hasTime && se.time && (
                                            <span className="text-[9px] font-mono text-white/30">🕐 {formatTimeDisplay(se.time)}</span>
                                          )}
                                        </div>
                                        <div className="flex gap-3 text-[10px] font-mono text-white/30 mb-1">
                                          <span>Max: {se.maxParticipants}</span>
                                          {se.type === "team" && <span>Team: {se.minTeamSize}–{se.maxTeamSize}</span>}
                                          {se.prize?.first && <span className="text-yellow-400/60">🥇 {se.prize.first}</span>}
                                          {se.prize?.second && <span className="text-white/40">🥈 {se.prize.second}</span>}
                                        </div>
                                        {se.description && (
                                          <div className="text-xs text-white/40 mt-1">
                                            <RichTextDisplay content={se.description} />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Important Links */}
                              {evt.importantLinks && evt.importantLinks.filter(l => l.url).length > 0 && (
                                <div>
                                  <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">Important Links</p>
                                  <div className="flex flex-wrap gap-2">
                                    {evt.importantLinks.filter(l => l.url).map((link, li) => (
                                      <a key={li} href={link.url} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-blue-400/70 hover:text-blue-400 border border-blue-500/20 px-2 py-1 rounded transition-colors">
                                        {link.label || link.url}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </GlassCard>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={eventSearch} onChange={e => setEventSearch(e.target.value)}
                    placeholder="Search events by name or organizer…"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                  />
                </div>
                <select
                  value={eventCategoryFilter} onChange={e => setEventCategoryFilter(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/70 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>

              {/* Events Table */}
              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03] text-white/50">
                      <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Event</th>
                      <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Date</th>
                      <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Category</th>
                      <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Regs</th>
                      <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Seats</th>
                      <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Price</th>
                      <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Status</th>
                      <th className="text-right p-3 font-medium text-[11px] tracking-widest uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((evt, i) => (
                      <tr key={evt.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                        {editingEventId === evt.id ? (
                          /* ─── Inline Edit Mode ─── */
                          <>
                            <td className="p-2">
                              <input value={editFields.title} onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))}
                                className="bg-white/[0.06] border border-white/20 rounded px-2 py-1 text-sm w-full text-white focus:outline-none" />
                            </td>
                            <td className="p-2">
                              <input type="date" value={editFields.date} onChange={e => setEditFields(f => ({ ...f, date: e.target.value }))}
                                className="bg-white/[0.06] border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none" />
                            </td>
                            <td className="p-2 text-xs text-white/40">{evt.category}</td>
                            <td className="p-2 text-center font-mono text-white/60">{evt.registrations.filter(r => r.status !== "DRAFT").length}</td>
                            <td className="p-2">
                              <input type="number" value={editFields.seats} onChange={e => setEditFields(f => ({ ...f, seats: +e.target.value }))}
                                className="bg-white/[0.06] border border-white/20 rounded px-2 py-1 text-sm w-16 text-center text-white focus:outline-none" />
                            </td>
                            <td className="p-2">
                              <input type="number" value={editFields.price} onChange={e => setEditFields(f => ({ ...f, price: +e.target.value }))}
                                className="bg-white/[0.06] border border-white/20 rounded px-2 py-1 text-sm w-20 text-center text-white focus:outline-none" />
                            </td>
                            <td className="p-2" />
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={saveEventEdit} className="p-1.5 rounded hover:bg-green-500/10 text-green-400" title="Save"><Check className="w-4 h-4" /></button>
                                <button onClick={() => setEditingEventId(null)} className="p-1.5 rounded hover:bg-white/10 text-white/40" title="Cancel"><X className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          /* ─── Normal View Mode ─── */
                          <>
                            <td className="p-3">
                              <Link href={`/events/${evt.id}`} className="text-white hover:underline">{evt.title}</Link>
                              <p className="text-[10px] font-mono text-white/30">{evt.organizer} · {evt.organizerEmail}</p>
                            </td>
                            <td className="p-3 font-mono text-white/50 text-xs">{evt.date}</td>
                            <td className="p-3"><span className="text-[10px] border border-white/20 text-white/50 px-2 py-0.5 rounded">{evt.category}</span></td>
                            <td className="p-3 text-center font-mono text-white/60">{evt.registrations.filter(r => r.status !== "DRAFT").length}</td>
                            <td className="p-3 text-center font-mono text-white/40">{evt.seats}</td>
                            <td className="p-3 text-center font-mono text-white/40">₹{evt.price}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => updateEvent(evt.id, { registrationOpen: !evt.registrationOpen })}
                                className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                                  evt.registrationOpen ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                }`}
                              >
                                {evt.registrationOpen ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                                {evt.registrationOpen ? "OPEN" : "CLOSED"}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link href={`/events/${evt.id}`}>
                                  <button className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white" title="View"><Eye className="w-4 h-4" /></button>
                                </Link>
                                <button onClick={() => startEditEvent(evt)} className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-yellow-400" title="Quick Edit">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <Link href={`/events/${evt.id}/edit`}>
                                  <button className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-blue-400" title="Full Edit"><ExternalLink className="w-4 h-4" /></button>
                                </Link>
                                <button
                                  onClick={() => setConfirmAction({
                                    title: "Delete Event",
                                    message: `Permanently delete "${evt.title}"? This will remove all registrations, chats, and data. This cannot be undone.`,
                                    variant: "danger",
                                    action: () => { deleteEvent(evt.id); setConfirmAction(null) }
                                  })}
                                  className="p-1.5 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400" title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {filteredEvents.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-white/20 font-mono text-sm">No events match your search</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* USERS TAB — FULL USER MANAGEMENT       */}
          {/* ═══════════════════════════════════════ */}
          {activeTab === "users" && (
            <motion.div variants={pageItem}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <MicroLabel>User Management</MicroLabel>
                  <h2 className="text-2xl font-light">Platform Users ({allUsers.length})</h2>
                </div>
                <Button variant="outline" className="border-white/20 text-white text-sm hover:bg-white/10" onClick={fetchUsers} disabled={usersLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? "animate-spin" : ""}`} />
                  {usersLoading ? "Loading…" : "Refresh"}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/10 text-white/60 text-sm hover:bg-white/5 hover:text-white ml-2" 
                  onClick={() => exportToCSV(filteredUsers, "myfestivo_users")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, or college…"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                  />
                </div>
                <select
                  value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value as "all" | UserRole)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/70 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admins</option>
                </select>
                <select
                  value={userDeptFilter} onChange={e => setUserDeptFilter(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/70 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  value={userYearFilter} onChange={e => setUserYearFilter(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/70 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Years</option>
                  {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {usersLoading ? (
                <GlassCard className="p-12 text-center">
                  <RefreshCw className="w-6 h-6 text-white/20 animate-spin mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Loading users…</p>
                </GlassCard>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.03] text-white/50">
                        <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">User</th>
                        <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">College</th>
                        <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Department</th>
                        <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Year</th>
                        <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Role</th>
                        <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Events</th>
                        <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Verified</th>
                        <th className="text-right p-3 font-medium text-[11px] tracking-widest uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr key={u.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: u.avatarColor + "30", color: u.avatarColor }}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{u.name}</p>
                                <p className="text-[10px] font-mono text-white/30">{u.email}</p>
                                {u.phone && <p className="text-[10px] font-mono text-white/20">{u.phone}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-white/50 text-xs">{u.college || <span className="text-white/20">—</span>}</td>
                          <td className="p-3 text-white/50 text-xs">{u.department || <span className="text-white/20">—</span>}</td>
                          <td className="p-3 text-white/50 text-xs">{u.year || <span className="text-white/20">—</span>}</td>
                          <td className="p-3 text-center">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              u.role === "admin"
                                ? "border-red-500/30 text-red-400 bg-red-500/5"
                                : u.role === "faculty"
                                ? "border-blue-500/30 text-blue-400 bg-blue-500/5"
                                : "border-white/20 text-white/40"
                            }`}>{u.role.toUpperCase()}</span>
                          </td>
                          <td className="p-3 text-center">
                            {(() => {
                              // Compute live from the events collection — always accurate
                              const hostedCount = events.filter(e => e.organizerEmail === u.email).length
                              const registeredCount = events.filter(e =>
                                e.registrations.some(r => r.userEmail === u.email && r.status !== "DRAFT")
                              ).length
                              return (
                                <div className="text-[10px] font-mono text-white/40 space-y-0.5">
                                  <div title="Events hosted by this user" className={hostedCount > 0 ? "text-[#B388FF]/80" : ""}>{hostedCount} Hosted</div>
                                  <div title="Events registered for" className={registeredCount > 0 ? "text-white/60" : ""}>{registeredCount} Reg</div>
                                </div>
                              )
                            })()}
                          </td>
                          <td className="p-3 text-center">
                            {u.collegeEmailVerified ? (
                              <span className="text-green-400 text-[10px] font-mono">✓ VERIFIED</span>
                            ) : (
                              <span className="text-white/20 text-[10px] font-mono">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Toggle Role */}
                              <button
                                onClick={() => {
                                  const newRole = u.role === "admin" ? "student" : "admin"
                                  setConfirmAction({
                                    title: `Change Role to ${newRole.toUpperCase()}`,
                                    message: `Change ${u.name}'s role from ${u.role} to ${newRole}?`,
                                    variant: "warning",
                                    action: () => { changeUserRole(u.id, newRole as UserRole); setConfirmAction(null) }
                                  })
                                }}
                                className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-yellow-400" title={u.role === "admin" ? "Demote to Student" : "Promote to Admin"}
                              >
                                {u.role === "admin" ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                              </button>
                              {/* Delete User */}
                              <button
                                onClick={() => setConfirmAction({
                                  title: "Delete User",
                                  message: `Permanently delete ${u.name} (${u.email})? This removes their Firestore profile. Their Firebase Auth account will remain and can be removed from Firebase Console.`,
                                  variant: "danger",
                                  action: () => { deleteUser(u.id); setConfirmAction(null) }
                                })}
                                className="p-1.5 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400" title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {/* Manual Verify */}
                              {!u.collegeEmailVerified && (
                                <button
                                  onClick={() => setConfirmAction({
                                    title: "Verify User",
                                    message: `Manually verify ${u.name}'s college email? Use this if you have alternate proof of their student status.`,
                                    variant: "warning",
                                    action: () => { handleManualVerify(u.id); setConfirmAction(null) }
                                  })}
                                  className="p-1.5 rounded hover:bg-green-500/10 text-white/30 hover:text-green-400 ml-1" title="Verify User"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan={7} className="p-8 text-center text-white/20 font-mono text-sm">
                          {allUsers.length === 0 ? "Click Refresh to load users" : "No users match your search"}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* REGISTRATIONS TAB                      */}
          {/* ═══════════════════════════════════════ */}
          {activeTab === "registrations" && (
            <motion.div variants={pageItem}>
              <MicroLabel>Registration Management</MicroLabel>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light">All Registrations ({allRegistrations.length})</h2>
                <Button 
                  variant="outline" 
                  className="border-white/10 text-white/60 text-sm hover:bg-white/5 hover:text-white" 
                  onClick={() => exportToCSV(allRegistrations, "myfestivo_registrations")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={regSearch} onChange={e => setRegSearch(e.target.value)}
                    placeholder="Search by student name or email…"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                  />
                </div>
                <select
                  value={regStatusFilter} onChange={e => setRegStatusFilter(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/70 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
                <select
                  value={regEventFilter} onChange={e => setRegEventFilter(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/70 focus:outline-none appearance-none cursor-pointer max-w-[220px]"
                >
                  <option value="all">All Events</option>
                  {events.filter(e => e.status !== "pending_review").map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03] text-white/50">
                      <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Student</th>
                      <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Event</th>
                      <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Sub-Event</th>
                      <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Status</th>
                      <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Date</th>
                      <th className="text-right p-3 font-medium text-[11px] tracking-widest uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRegistrations.map((reg, i) => {
                      const evt = events.find(e => e.id === reg.eventId)
                      const subEvt = evt?.subEvents.find(se => se.id === reg.subEventId)
                      return (
                        <tr key={reg.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                          <td className="p-3">
                            <p className="text-white/80">{reg.userName}</p>
                            <p className="text-[10px] font-mono text-white/30">{reg.userEmail}</p>
                          </td>
                          <td className="p-3 text-white/60">{reg.eventTitle}</td>
                          <td className="p-3 text-white/50 text-xs">{subEvt?.name || "—"}</td>
                          <td className="p-3 text-center">
                            <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                              reg.status === "PAID" ? "border-green-500/30 text-green-400" :
                              reg.status === "PENDING" ? "border-yellow-500/30 text-yellow-400" :
                              "border-white/20 text-white/40"
                            }`}>{reg.status}</span>
                          </td>
                          <td className="p-3 font-mono text-xs text-white/40">{reg.timestamp}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {reg.status === "PENDING" && (
                                <>
                                  <button onClick={() => approvePayment(reg.eventId, reg.id)} className="p-1.5 rounded hover:bg-green-500/10 text-white/30 hover:text-green-400" title="Approve Payment">
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => rejectPayment(reg.eventId, reg.id)} className="p-1.5 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400" title="Reject Payment">
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setConfirmAction({
                                  title: "Cancel Registration",
                                  message: `Cancel ${reg.userName}'s registration from ${reg.eventTitle}? This cannot be undone.`,
                                  variant: "danger",
                                  action: () => { cancelRegistration(reg.eventId, reg.id); setConfirmAction(null) }
                                })}
                                className="p-1.5 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400" title="Cancel Registration"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {allRegistrations.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-white/20 font-mono text-sm">No registrations match your search</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </PageTransition>
      </main>

      {/* ─── Confirmation Modal ─── */}
      <AnimatePresence>
        {confirmAction && (
          <ConfirmModal
            title={confirmAction.title}
            message={confirmAction.message}
            variant={confirmAction.variant}
            onConfirm={confirmAction.action}
            onCancel={() => setConfirmAction(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
