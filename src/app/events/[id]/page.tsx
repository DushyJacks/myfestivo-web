"use client"

import { useAuth } from "@/lib/auth-context"
import { useEvents, TaskStatus } from "@/lib/events-context"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { ChatPanel } from "@/components/event/ChatPanel"
import { RegistrationWizard } from "@/components/event/RegistrationWizard"
import { ParticipantsList } from "@/components/event/ParticipantsList"
import { QRScanner } from "@/components/event/QRScanner"
import { useEventReminders } from "@/hooks/useEventReminders"
import {
  MapPin, Clock, UserCheck, Users, MessageSquare, ArrowLeft,
  Lock, Check, PlusCircle, Send, Trophy, Phone, FileText,
  ChevronDown, ChevronUp, BadgeCheck, UserPlus, CreditCard,
  Megaphone, CheckSquare, QrCode, Zap, DollarSign,
  Pin, Eye, ListTodo, ClipboardCheck, ArrowRight, Download, CalendarDays,
  Pencil, LinkIcon, ExternalLink, Camera, X
} from "lucide-react"

type TabId = "overview" | "chat" | "announcements" | "tasks" | "checkin" | "automation" | "participant_qr" | "participants"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { events, updateEvent, registerForSubEvent, addAnnouncement, addTask, updateTaskStatus, approvePayment, rejectPayment, checkInParticipant, toggleAutomation, addAutomationLog } = useEvents()

  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [selectedSubEvent, setSelectedSubEvent] = useState<string | null>(null)
  const [showRegWizard, setShowRegWizard] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [chatChannel, setChatChannel] = useState("general")
  const [scanStatus, setScanStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)

  // Announcement state
  const [annTitle, setAnnTitle] = useState("")
  const [annMsg, setAnnMsg] = useState("")

  // Push notification state
  const [pushRecipient, setPushRecipient] = useState("")
  const [pushMessage, setPushMessage] = useState("")
  const [annTarget, setAnnTarget] = useState("")
  const [annPinned, setAnnPinned] = useState(false)

  // Task state
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [taskAssignee, setTaskAssignee] = useState("")
  const [taskDeadline, setTaskDeadline] = useState("")
  const [taskSubEvent, setTaskSubEvent] = useState("")

  const event = events.find(e => e.id === params.id)

  // Set up automatic event reminders
  useEventReminders(event || null as any)

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40 font-mono">Event not found</p>
      </div>
    )
  }

  const isHost = user?.email === event.organizerEmail
  const isCoordinator = event.subEvents.some(se => se.coordinators.some(c => c.email === user?.email))
  const isRegistered = user ? event.registrations.some(r => r.userEmail === user.email) : false
  const canAccessIntra = !event.collegeDomain || (user?.collegeEmailVerified && user?.collegeEmail?.endsWith(`@${event.collegeDomain}`))
  const isRestricted = !!(event.collegeDomain && !canAccessIntra)
  const now = new Date()
  const eventDate = new Date(event.date)
  const eventExpired = eventDate.getTime() + 86400000 < now.getTime() // event day has ended
  const deadlinePassed = event.registrationDeadline ? new Date(event.registrationDeadline).getTime() + 86400000 < now.getTime() : false
  const registrationClosed = !event.registrationOpen || deadlinePassed

  const handleRegister = (seId: string) => {
    if (!user) { router.push("/login"); return }
    if (isRestricted) return

    registerForSubEvent(event.id, seId, {
      id: `reg-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      eventId: event.id,
      subEventId: seId,
      status: "PENDING",
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      checkedIn: false
    })
  }

  const handleAddAnnouncement = () => {
    if (!user || !annTitle.trim() || !annMsg.trim()) return
    addAnnouncement(event.id, {
      id: `ann-${Date.now()}`, title: annTitle, message: annMsg,
      authorName: user.name, authorEmail: user.email,
      targetSubEventId: annTarget || "", pinned: annPinned,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
    })
    setAnnTitle(""); setAnnMsg(""); setAnnTarget(""); setAnnPinned(false)
  }

  const handleAddTask = () => {
    if (!user || !taskTitle.trim() || !taskAssignee.trim()) return
    addTask(event.id, {
      id: `task-${Date.now()}`, title: taskTitle, description: taskDesc,
      assignedTo: taskAssignee, assignedBy: user.email, deadline: taskDeadline,
      status: "TODO", subEventId: taskSubEvent || "", createdAt: new Date().toISOString().slice(0, 10)
    })
    setTaskTitle(""); setTaskDesc(""); setTaskAssignee(""); setTaskDeadline(""); setTaskSubEvent("")
  }

  const handleSendPush = () => {
    if (!pushMessage || !event) return
    const logId = `log-${Date.now()}`
    addAutomationLog(event.id, {
      id: logId,
      ruleId: "manual-push",
      ruleName: "Manual Push Notification",
      recipientEmail: pushRecipient || "All Participants",
      message: pushMessage,
      timestamp: new Date().toLocaleString()
    })
    setPushMessage("")
    setPushRecipient("")
  }
  const handleQRScan = (data: string) => {
    if (!event) return

    // Format: MYFESTIVO:eventId:subEventId:regId
    const parts = data.split(':')
    if (parts.length !== 4 || parts[0] !== 'MYFESTIVO') {
      setScanStatus({ type: 'error', msg: 'Invalid QR Code Format' })
      return
    }

    const [_, scanEventId, scanSubEventId, scanRegId] = parts

    if (scanEventId !== event.id) {
      setScanStatus({ type: 'error', msg: 'QR Code is for a different event' })
      return
    }

    const registration = event.registrations.find(r => r.id === scanRegId)
    if (!registration) {
      setScanStatus({ type: 'error', msg: 'Registration not found' })
      return
    }

    if (registration.checkedIn) {
      setScanStatus({ type: 'error', msg: `${registration.userName} already checked in` })
      return
    }

    if (registration.status !== 'PAID') {
      setScanStatus({ type: 'error', msg: `Payment ${registration.status} for ${registration.userName}` })
      return
    }

    // Success
    checkInParticipant(event.id, scanRegId)
    setScanStatus({ type: 'success', msg: `Checked in ${registration.userName}!` })

    // Clear status after 3 seconds
    setTimeout(() => setScanStatus(null), 3000)
  }

  const inputCls = "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 text-sm"
  const labelCls = "text-[10px] font-mono text-white/40 mb-1 block tracking-widest uppercase"

  const hostTabs = [
    { id: "overview" as TabId, label: "Overview", icon: Eye },
    { id: "chat" as TabId, label: "Chat", icon: MessageSquare },
    { id: "participants" as TabId, label: "Participants", icon: Users },
    { id: "announcements" as TabId, label: "Announcements", icon: Megaphone },
    { id: "tasks" as TabId, label: "Tasks", icon: ListTodo },
    { id: "checkin" as TabId, label: "Check-In", icon: QrCode },
    { id: "automation" as TabId, label: "Automation", icon: Zap },
  ]
  const coordinatorTabs = [
    { id: "overview" as TabId, label: "Overview", icon: Eye },
    { id: "chat" as TabId, label: "Chat", icon: MessageSquare },
    { id: "announcements" as TabId, label: "Announcements", icon: Megaphone },
    { id: "tasks" as TabId, label: "Tasks", icon: ListTodo },
  ]
  const participantTabs = [
    { id: "overview" as TabId, label: "Overview", icon: Eye },
    { id: "chat" as TabId, label: "Chat", icon: MessageSquare },
    { id: "participant_qr" as TabId, label: "Check-in QR", icon: QrCode },
  ]

  let tabs: typeof hostTabs = []
  if (isHost) tabs = hostTabs
  else if (isCoordinator) tabs = coordinatorTabs
  else if (isRegistered) tabs = participantTabs

  return (
    <>
      <header className="fixed top-0 left-[72px] lg:left-[260px] right-0 h-16 flex items-center justify-between px-8 z-50 bg-black/60 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <Link href="/events" className="text-white/40 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="font-medium text-white truncate">{event.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isHost && (
            <>
              <button
                onClick={() => updateEvent(event.id, { registrationOpen: !event.registrationOpen })}
                className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded border transition-colors ${event.registrationOpen
                  ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                  : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  }`}
              >
                Registration {event.registrationOpen ? "Open" : "Closed"}
              </button>
              <Link href={`/events/${event.id}/edit`}>
                <Button variant="ghost" className="text-white/50 hover:text-white text-sm"><Pencil className="w-4 h-4 mr-1" />Edit</Button>
              </Link>
              <Link href={`/events/${event.id}/finance`}>
                <Button variant="ghost" className="text-white/50 hover:text-white text-sm"><DollarSign className="w-4 h-4 mr-1" />Finance</Button>
              </Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link href="/admin">
              <Button variant="outline" className="border-white/20 text-white text-[10px] h-8 px-3 font-mono tracking-widest hover:bg-white/10 uppercase">Admin Hub</Button>
            </Link>
          )}
        </div>
      </header>

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div variants={pageItem} className="mb-12">
          {/* Poster - always render with fixed height for consistent layout */}
          <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 border border-white/[0.06] relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
            {event.poster_base64 ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.poster_base64} alt={event.title} width={400} height={600} className="w-full h-full object-cover opacity-80" />
              </>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <span className="text-sm text-white/30">Event poster unavailable</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {!event.collegeDomain ? <span className="font-mono text-[10px] px-2 py-0.5 border border-white/20 text-white/50">OPEN EVENT</span>
              : <span className="font-mono text-[10px] px-2 py-0.5 border border-yellow-500/50 text-yellow-400">INTRA — @{event.collegeDomain}</span>}
            <span className="font-mono text-[10px] px-2 py-0.5 border border-white/20 text-white/50">{event.category}</span>
            {event.price > 0 && <span className="font-mono text-[10px] px-2 py-0.5 border border-white/20 text-white/50">₹{event.price}</span>}
            {event.prizePool && <span className="font-mono text-[10px] px-2 py-0.5 border border-yellow-500/20 text-yellow-400/80 flex items-center gap-1"><Trophy className="w-3 h-3" /> {event.prizePool}</span>}
            {registrationClosed && <span className="font-mono text-[10px] px-2 py-0.5 border border-red-500/30 text-red-400">REGISTRATION CLOSED</span>}
            {eventExpired && <span className="font-mono text-[10px] px-2 py-0.5 border border-red-500/30 text-red-400">EVENT ENDED</span>}
            {event.registrationDeadline && !deadlinePassed && <span className="font-mono text-[10px] px-2 py-0.5 border border-white/20 text-white/50">Deadline: {event.registrationDeadline}</span>}
          </div>
          <h1 className="text-3xl md:text-5xl font-light leading-tight tracking-tight mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-5 font-mono text-sm text-white/50">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venue}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{event.date}</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4" />{event.registeredCount} / {event.seats} registered</span>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={pageItem} className="flex w-full gap-1 border-b border-white/[0.06] mb-8 overflow-x-auto pb-px no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-xs font-medium transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/60"}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
          ))}
        </motion.div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <motion.div variants={pageItem} className="lg:col-span-8 space-y-12">
              <section>
                <MicroLabel>About Event</MicroLabel>
                <p className="text-white/60 leading-relaxed text-[15px]">{event.description}</p>
              </section>

              <section>
                <MicroLabel>Sub-Events & Competitions</MicroLabel>
                <div className="space-y-4">
                  {event.subEvents.map(se => {
                    const isUserRegistered = event.registrations.some(r => r.subEventId === se.id && r.userEmail === user?.email)
                    return (
                      <GlassCard key={se.id} className="p-6 transition-all hover:bg-white/[0.04] scroll-mt-24" id={se.id}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium mb-1">{se.name}</h3>
                            <div className="flex gap-3 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                              <span>{se.type}</span>
                              <span>•</span>
                              <span>Max: {se.maxParticipants}</span>
                            </div>
                          </div>
                          {isUserRegistered ? (
                            <span className="text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Registered</span>
                          ) : registrationClosed || eventExpired ? (
                            <span className="text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">Closed</span>
                          ) : (
                            <Button
                              onClick={() => setShowRegWizard(true)}
                              disabled={isRestricted || event.restricted_registrations?.includes(user?.email || "")}
                              variant="outline" className="h-8 px-4 text-[10px] font-mono border-white/20 hover:bg-white text-white bg-white/5 transition-all">
                              {event.restricted_registrations?.includes(user?.email || "") ? "Staff Restricted" : "Register"}
                            </Button>
                          )}
                        </div>

                        <p className="text-sm text-white/50 mb-4">{se.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400/80 px-2 py-0.5 rounded flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> {se.prize.first}</span>
                          <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/40 px-2 py-0.5 rounded flex items-center gap-1"><Trophy className="w-3 h-3 text-gray-400" /> {se.prize.second}</span>
                          {se.prize.third && <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/30 px-2 py-0.5 rounded flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-700" /> {se.prize.third}</span>}
                        </div>

                        {se.rules.length > 0 && (
                          <div className="mb-3">
                            <button onClick={() => setSelectedSubEvent(selectedSubEvent === se.id ? null : se.id)} className="text-[10px] font-mono text-white/30 flex items-center gap-1 hover:text-white/50 transition-colors uppercase tracking-widest">
                              {selectedSubEvent === se.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Sub-event Rules
                            </button>
                            {selectedSubEvent === se.id && (
                              <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-1.5 pl-4 border-l border-white/10">
                                {se.rules.map((rule, i) => <li key={i} className="text-[11px] text-white/40">{rule}</li>)}
                              </motion.ul>
                            )}
                          </div>
                        )}

                        {se.coordinators.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">{se.coordinators.map((c, i) => (
                            <span key={i} className="text-[10px] font-mono bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded">
                              {c.name} — {c.role} {c.phone && <span className="text-white/30 ml-1 flex items-center gap-1 inline-flex"><Phone className="w-2.5 h-2.5" />{c.phone}</span>}
                            </span>
                          ))}</div>
                        )}
                      </GlassCard>
                    )
                  })}
                </div>
              </section>

              <section>
                <MicroLabel>Event Rules & Guidelines</MicroLabel>
                <ul className="space-y-3">
                  {event.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
                      <span className="text-white/50 text-sm group-hover:text-white/70 transition-colors">{rule}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Important Links */}
              {event.importantLinks && event.importantLinks.length > 0 && (
                <section>
                  <MicroLabel>Important Links</MicroLabel>
                  <div className="space-y-2">
                    {event.importantLinks.map(link => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <LinkIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-sm text-white/70 group-hover:text-white transition-colors flex-1">{link.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>

            <motion.div variants={pageItem} className="lg:col-span-4 space-y-8">
              <section>
                <MicroLabel>Organizer Info</MicroLabel>
                <GlassCard className="p-5">
                  <p className="text-white/80 font-medium mb-1">{event.organizer}</p>
                  <p className="text-xs text-white/40 font-mono mb-4">{event.organizerEmail}</p>
                  <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                    <Button variant="ghost" className="text-[10px] h-8 px-3 border border-white/10 text-white/60 hover:text-white flex items-center gap-1 uppercase tracking-widest"><Phone className="w-3 h-3" /> Contact</Button>
                  </div>
                </GlassCard>
              </section>

              {isRestricted && (
                <section>
                  <MicroLabel>Verification Required</MicroLabel>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-lg">
                    <Lock className="w-5 h-5 text-yellow-400 mb-3" />
                    <p className="text-xs text-yellow-400/80 leading-relaxed font-mono uppercase tracking-widest">
                      This is an intra-college event for students at
                      <span className="text-yellow-400 ml-1 font-bold">@{event.collegeDomain}</span>.
                    </p>
                    <Link href="/profile">
                      <Button className="w-full mt-4 h-8 bg-yellow-500 text-black text-[10px] font-mono tracking-widest uppercase hover:bg-yellow-400">
                        Verify College Email
                      </Button>
                    </Link>
                  </div>
                </section>
              )}

              {isRegistered && !isHost && (
                <section>
                  <MicroLabel>Event Chat</MicroLabel>
                  <Button onClick={() => setActiveTab("chat")} variant="ghost" className="w-full text-[10px] font-mono text-white/40 uppercase tracking-widest hover:text-white border border-white/[0.08] h-8 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Open Chat
                  </Button>
                </section>
              )}

              {/* Announcements sidebar for participants */}
              {isRegistered && event.announcements.length > 0 && (
                <section>
                  <MicroLabel>Announcements</MicroLabel>
                  <div className="space-y-3">
                    {event.announcements.slice(0, 5).map(a => (
                      <div key={a.id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          {a.pinned && <Pin className="w-3 h-3 text-yellow-400" />}
                          <span className="text-xs font-medium text-white/80">{a.title}</span>
                        </div>
                        <p className="text-[11px] text-white/50 line-clamp-3">{a.message}</p>
                        <p className="text-[9px] font-mono text-white/20 mt-1">{a.authorName} · {a.timestamp.slice(0, 10)}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          </div>
        )}

        {/* ═══ ANNOUNCEMENTS TAB ═══ */}
        {activeTab === "announcements" && (
          <motion.div variants={pageItem} className="max-w-3xl">
            <MicroLabel>Announcements</MicroLabel>
            {isHost && (
              <GlassCard className="p-5 mb-6 space-y-3">
                <p className="text-xs font-mono text-white/40 tracking-widest uppercase">New Announcement</p>
                <Input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Title" className={`${inputCls} h-9`} />
                <textarea value={annMsg} onChange={e => setAnnMsg(e.target.value)} placeholder="Message..."
                  className={`w-full ${inputCls} min-h-[80px] rounded-md p-3 outline-none resize-none`} />
                <div className="flex gap-3">
                  <select value={annTarget} onChange={e => setAnnTarget(e.target.value)} className="h-8 bg-white/[0.03] border border-white/[0.08] text-white text-xs rounded-md px-2 flex-1">
                    <option value="">All Participants</option>
                    {event.subEvents.map(se => <option key={se.id} value={se.id}>{se.name}</option>)}
                  </select>
                  <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3 h-8 rounded-md">
                    <input type="checkbox" id="pin" checked={annPinned} onChange={e => setAnnPinned(e.target.checked)} className="accent-white" />
                    <label htmlFor="pin" className="text-[10px] font-mono text-white/40 uppercase cursor-pointer">Pin</label>
                  </div>
                  <Button onClick={handleAddAnnouncement} className="bg-white text-black text-[10px] h-8 px-4 font-mono tracking-widest uppercase hover:bg-white/90">
                    <Send className="w-3 h-3 mr-1" /> Post
                  </Button>
                </div>
              </GlassCard>
            )}

            <div className="space-y-4">
              {event.announcements.length === 0 ? (
                <p className="text-white/30 text-sm font-mono py-12 text-center border border-white/[0.04] rounded-lg bg-white/[0.01]">No announcements yet.</p>
              ) : (
                event.announcements.map(ann => {
                  const se = event.subEvents.find(s => s.id === ann.targetSubEventId)
                  return (
                    <GlassCard key={ann.id} className={`p-5 relative ${ann.pinned ? 'border-l-white border-l-2' : ''}`}>
                      {ann.pinned && <Pin className="absolute top-4 right-4 w-3 h-3 text-white/50" />}
                      <div className="flex items-center gap-2 mb-2">
                        {se ? <span className="text-[9px] font-mono bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded text-white/60">{se.name}</span>
                          : <span className="text-[9px] font-mono bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded text-green-400">GENERAL</span>}
                        <span className="text-[10px] font-mono text-white/30">{ann.timestamp}</span>
                      </div>
                      <h3 className="font-medium mb-1">{ann.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{ann.message}</p>
                      <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-mono">{ann.authorName[0]}</div>
                        <span className="text-[10px] font-mono text-white/30">{ann.authorName}</span>
                      </div>
                    </GlassCard>
                  )
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ TASKS TAB ═══ */}
        {activeTab === "tasks" && (isHost || isCoordinator) && (
          <motion.div variants={pageItem}>
            <div className="flex justify-between items-center mb-6">
              <MicroLabel className="mb-0">Team Tasks ({event.tasks.length})</MicroLabel>
            </div>

            {isHost && (
              <GlassCard className="p-5 mb-6 space-y-3">
                <p className="text-xs font-mono text-white/40 tracking-widest uppercase">New Task</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task title" className={`${inputCls} h-9`} />
                  <Input value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} placeholder="Assign to (email)" className={`${inputCls} h-9`} />
                </div>
                <Input value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Description (optional)" className={`${inputCls} h-9`} />
                <div className="flex gap-3">
                  <Input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} max={event.date} className={`${inputCls} h-8 flex-1`} />
                  <select value={taskSubEvent} onChange={e => setTaskSubEvent(e.target.value)} className="h-8 bg-white/[0.03] border border-white/[0.08] text-white text-xs rounded-md px-2 flex-1">
                    <option value="">General</option>
                    {event.subEvents.map(se => <option key={se.id} value={se.id}>{se.name}</option>)}
                  </select>
                  <Button onClick={handleAddTask} className="bg-white text-black text-xs h-8 px-4"><PlusCircle className="w-3 h-3 mr-1" />Add</Button>
                </div>
              </GlassCard>
            )}

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map(status => (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">{status}</span>
                    <span className="text-[10px] font-mono text-white/20">{event.tasks.filter(t => t.status === status).length}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2 min-h-[400px] space-y-2">
                    {event.tasks.filter(t => t.status === status).map(task => {
                      const se = event.subEvents.find(s => s.id === task.subEventId)
                      const isOverdue = task.deadline && new Date(task.deadline) < new Date() && status !== "DONE"
                      return (
                        <GlassCard key={task.id} className="p-3 space-y-2 border-white/[0.04]">
                          <p className="text-sm font-medium">{task.title}</p>
                          {task.description && <p className="text-xs text-white/40 line-clamp-2">{task.description}</p>}
                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className="text-[9px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-white/40">{task.assignedTo}</span>
                            {se && <span className="text-[9px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-white/30">{se.name}</span>}
                            {task.deadline && <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.05] text-white/30'}`}><CalendarDays className="w-2.5 h-2.5" /> {task.deadline}</span>}
                          </div>
                          <div className="flex gap-1">
                            {status !== "IN_PROGRESS" && status !== "DONE" && (
                              <button onClick={() => updateTaskStatus(event.id, task.id, "IN_PROGRESS")}
                                className="text-[9px] font-mono p-1 border border-white/10 hover:border-white/30 text-white/40 rounded transition-colors"><ArrowRight className="w-2.5 h-2.5" /></button>
                            )}
                            {status !== "DONE" && (
                              <button onClick={() => updateTaskStatus(event.id, task.id, "DONE")}
                                className="text-[9px] font-mono p-1 border border-white/10 hover:border-white/30 text-white/40 rounded transition-colors"><Check className="w-2.5 h-2.5" /></button>
                            )}
                            {status === "DONE" && (
                              <button onClick={() => updateTaskStatus(event.id, task.id, "TODO")}
                                className="text-[9px] font-mono p-1 border border-white/10 hover:border-white/30 text-white/40 rounded transition-colors"><Lock className="w-2.5 h-2.5 rotate-180" /></button>
                            )}
                          </div>
                        </GlassCard>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ CHECK-IN TAB ═══ */}
        {activeTab === "checkin" && isHost && (
          <motion.div variants={pageItem}>
            <MicroLabel>Participant Check-In</MicroLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <GlassCard className="p-4 text-center">
                <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Checked In</p>
                <p className="text-2xl font-light">{event.registrations.filter(r => r.checkedIn).length}</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Total Paid</p>
                <p className="text-2xl font-light text-green-400">{event.registrations.filter(r => r.status === "PAID").length}</p>
              </GlassCard>
              <GlassCard className="p-4 text-center col-span-2 flex items-center justify-center border-white/20">
                <Button onClick={() => setShowQRScanner(true)} className="bg-white text-black text-[10px] font-mono tracking-widest uppercase hover:bg-white/80 h-10 px-8 rounded-full max-w-sm w-full">
                  <Camera className="w-4 h-4 mr-2" /> Live QR Scan
                </Button>
              </GlassCard>
            </div>

            {/* Scan Status Feedback */}
            <AnimatePresence>
              {scanStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${scanStatus.type === 'success'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                >
                  <div className={`p-1.5 rounded-full ${scanStatus.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {scanStatus.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium">{scanStatus.msg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="overflow-x-auto">
              {event.registrations.filter(r => r.status === "PAID").map(reg => {
                const se = event.subEvents.find(s => s.id === reg.subEventId)
                return (
                  <div key={reg.id} className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${reg.checkedIn ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.05] text-white/30'}`}>
                        {reg.checkedIn ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{reg.userName}</p>
                        <p className="text-[10px] font-mono text-white/30">{se?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {reg.checkedIn ? (
                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Arrived @ {reg.checkInTime?.slice(11)}</span>
                      ) : (
                        <Button onClick={() => checkInParticipant(event.id, reg.id)} className="h-8 bg-white text-black text-[10px] font-mono tracking-widest uppercase hover:bg-white/80">Check In</Button>
                      )}
                      <Download className="w-4 h-4 text-white/10 hover:text-white/30 cursor-pointer" />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ AUTOMATION TAB ═══ */}
        {activeTab === "automation" && isHost && (
          <motion.div variants={pageItem} className="max-w-3xl">
            <MicroLabel>Automation Rules</MicroLabel>
            <div className="space-y-3 mb-8">
              {event.automations.map(rule => (
                <GlassCard key={rule.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rule.enabled ? 'bg-green-500/10' : 'bg-white/[0.03]'}`}>
                      <Zap className={`w-4 h-4 ${rule.enabled ? 'text-green-400' : 'text-white/20'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rule.name}</p>
                      <p className="text-[10px] font-mono text-white/30">Trigger: {rule.trigger.replace(/_/g, " ")}</p>
                      <p className="text-xs text-white/40 mt-1">{rule.message}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleAutomation(event.id, rule.id)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${rule.enabled ? 'bg-green-500' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${rule.enabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </GlassCard>
              ))}
            </div>

            <MicroLabel>Notification Log ({event.automationLogs.length})</MicroLabel>
            {event.automationLogs.length === 0 ? (
              <p className="text-white/30 text-sm font-mono">No notifications sent yet.</p>
            ) : (
              <div className="space-y-2">
                {event.automationLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                    <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-green-400" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{log.ruleName}</span>
                        <span className="text-[10px] font-mono text-white/30">→ {log.recipientEmail}</span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">{log.message}</p>
                      <p className="text-[9px] font-mono text-white/20 mt-1">{log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8">
              <MicroLabel>Manual Push Notification</MicroLabel>
              <GlassCard className="p-4 flex flex-col gap-3">
                <Input placeholder="Recipient Email (Leave empty for all)" value={pushRecipient} onChange={e => setPushRecipient(e.target.value)} className="bg-white/[0.03] border-white/[0.08]" />
                <textarea placeholder="Message content..." value={pushMessage} onChange={e => setPushMessage(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-sm text-white placeholder:text-white/30 rounded-md p-3 min-h-[80px] outline-none focus:border-white/20 transition-colors" />
                <Button onClick={handleSendPush} className="bg-white text-black self-end text-xs h-9 px-4">Send Push Notification</Button>
              </GlassCard>
            </div>
          </motion.div>
        )}
        {/* ═══ PARTICIPANT QR TAB ═══ */}
        {activeTab === "participant_qr" && isRegistered && (
          <motion.div variants={pageItem}>
            <MicroLabel>My Registration Pass</MicroLabel>
            <div className="space-y-4">
              {event.registrations.filter(r => r.userEmail === user?.email).map(reg => {
                const se = event.subEvents.find(s => s.id === reg.subEventId)
                return (
                  <GlassCard key={reg.id} className="p-6 flex flex-col items-center">
                    <p className="text-sm font-medium mb-4">{se?.name}</p>
                    <div className="p-4 bg-white rounded-lg mb-4">
                      <QRCodeSVG value={`MYFESTIVO:${event.id}:${reg.subEventId}:${reg.id}`} size={200} />
                    </div>
                    <p className="text-xs font-mono text-white/40 mb-1">REG-ID: {reg.id}</p>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] px-2 py-0.5 border rounded ${reg.status === "PAID" ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"}`}>{reg.status}</span>
                      {reg.checkedIn && <span className="text-[10px] font-mono text-green-400 flex items-center gap-1"><ClipboardCheck className="w-3 h-3" /> Checked In</span>}
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ CHAT TAB ═══ */}
        {activeTab === "chat" && (user && (isHost || isCoordinator || isRegistered)) && (
          <motion.div variants={pageItem} className="max-w-3xl">
            <MicroLabel>Event Chat</MicroLabel>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              <button
                onClick={() => setChatChannel("general")}
                className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-widest uppercase whitespace-nowrap transition-colors ${chatChannel === "general" ? "bg-white text-black" : "bg-white/[0.04] text-white/40 hover:text-white/60 border border-white/[0.08]"
                  }`}
              ># General</button>
              {event.subEvents.map(se => (
                <button
                  key={se.id}
                  onClick={() => setChatChannel(se.id)}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-widest uppercase whitespace-nowrap transition-colors ${chatChannel === se.id ? "bg-white text-black" : "bg-white/[0.04] text-white/40 hover:text-white/60 border border-white/[0.08]"
                    }`}
                ># {se.name}</button>
              ))}
            </div>
            <GlassCard className="p-0 overflow-hidden">
              <ChatPanel
                event={event}
                eventId={event.id}
                channelId={chatChannel}
                channelLabel={chatChannel === "general" ? "General" : event.subEvents.find(s => s.id === chatChannel)?.name || "Chat"}
                messages={event.chatMessages}
              />
            </GlassCard>
          </motion.div>
        )}

        {/* ═══ PARTICIPANTS TAB ═══ */}
        {activeTab === "participants" && isHost && (
          <motion.div variants={pageItem}>
            <ParticipantsList event={event} />
          </motion.div>
        )}
      </div>

      {/* Registration Wizard Modal */}
      {showRegWizard && <RegistrationWizard event={event} onClose={() => setShowRegWizard(false)} />}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={(data) => handleQRScan(data)}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </>
  )
}
