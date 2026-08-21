"use client"

import { useAuth } from "@/lib/auth-context"
import { useEvents, TaskStatus, SubEvent, SubEventCoordinator } from "@/lib/events-context"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db as getDb } from "@/lib/firebase"
import { QRCodeSVG } from "qrcode.react"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { ChatPanel } from "@/components/event/ChatPanel"
import { RegistrationWizard } from "@/components/event/RegistrationWizard"
import { ParticipantsList } from "@/components/event/ParticipantsList"
import { QRScanner } from "@/components/event/QRScanner"
import { useEventReminders } from "@/hooks/useEventReminders"
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils"
import { RichTextDisplay } from "@/components/ui/RichTextDisplay"
import { EventMapViewDynamic } from "@/components/map"
import {
  MapPin, Clock, UserCheck, Users, MessageSquare, ArrowLeft,
  Lock, Check, PlusCircle, Send, Trophy, Phone, FileText,
  ChevronDown, ChevronUp, BadgeCheck, UserPlus, CreditCard,
  Megaphone, CheckSquare, QrCode, Zap, DollarSign,
  Pin, Eye, ListTodo, ClipboardCheck, ArrowRight, Download, CalendarDays,
  Pencil, LinkIcon, ExternalLink, Camera, X
} from "lucide-react"

type TabId = "overview" | "chat" | "announcements" | "tasks" | "checkin" | "automation" | "participant_qr" | "participants"

function CoordinatorBadge({ c }: { c: SubEventCoordinator }) {
  const [name, setName] = useState(c.name)
  useEffect(() => {
    const fetchName = async () => {
      try {
        const q = query(collection(getDb(), "users"), where("email", "==", c.email))
        const snap = await getDocs(q)
        if (!snap.empty) {
          setName(snap.docs[0].data().name || c.name)
        }
      } catch {}
    }
    fetchName()
  }, [c.email, c.name])

  return (
    <span className="text-[10px] font-mono bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded">
      {name} — {c.role} {c.phone && <span className="text-white/30 ml-1 flex items-center gap-1 inline-flex"><Phone className="w-2.5 h-2.5" />{c.phone}</span>}
    </span>
  )
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { events, updateEvent, registerForSubEvent, addChatMessage, addAnnouncement, addTask, updateTaskStatus, approvePayment, rejectPayment, checkInParticipant, undoCheckInParticipant, toggleAutomation, addAutomationLog, isLoading: eventsLoading } = useEvents()
  // Show spinner while either auth OR events are still loading
  const isLoading = authLoading || eventsLoading

  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [selectedSubEvent, setSelectedSubEvent] = useState<string | null>(null)
  const [selectedSubEventForReg, setSelectedSubEventForReg] = useState<SubEvent | null>(null)
  const showRegWizard = selectedSubEventForReg !== null
  const [showQRScanner, setShowQRScanner] = useState(false)
  // Optimistic local registrations — immediately reflects a new registration
  // before the Firestore subcollection listener fires (avoids stale "Register" button).
  const [localRegistrations, setLocalRegistrations] = useState<any[]>([])
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [chatChannel, setChatChannel] = useState("general")
  const [scanStatus, setScanStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  // Filter for Check-in tab — "" means show all sub-events
  const [checkInSubEventFilter, setCheckInSubEventFilter] = useState<string>("")
  // Timeout flag — set to true after 8s if Firestore is still loading (offline / slow network)
  const [loadTimedOut, setLoadTimedOut] = useState(false)

  // Announcement state
  const [annTitle, setAnnTitle] = useState("")
  const [annMsg, setAnnMsg] = useState("")

  // Push notification state
  const [pushRecipient, setPushRecipient] = useState("")
  const [pushSubject, setPushSubject] = useState("")
  const [pushBody, setPushBody] = useState("")
  const [annTarget, setAnnTarget] = useState("")
  const [annPinned, setAnnPinned] = useState(false)

  // Task state
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [taskAssignee, setTaskAssignee] = useState("")      // display: name shown in input
  const [taskAssigneeEmail, setTaskAssigneeEmail] = useState("") // actual email to persist
  const [taskAssigneeResults, setTaskAssigneeResults] = useState<{ email: string; name: string }[]>([])
  const [taskDeadline, setTaskDeadline] = useState("")
  const [taskSubEvent, setTaskSubEvent] = useState("")

  // Work Update state
  const [workUpdateText, setWorkUpdateText] = useState("")

  const event = events.find(e => e.id === params.id)

  // Safe defaults so hooks below don't need `event` to be defined
  const subEvents = event?.subEvents ?? []
  // Merge Firestore registrations with any optimistic local ones
  const registrations = [
    ...(event?.registrations ?? []),
    // Only include local regs not yet reflected in Firestore data
    ...localRegistrations.filter(lr => !(event?.registrations ?? []).some((r: any) => r.id === lr.id))
  ]

  const isHost = user?.email === event?.organizerEmail
    // Sub-event coordinators assigned the "Host" role get the same full access as the event organizer
    || (!!user?.email && subEvents.some(se =>
        se.coordinators.some(c => c.email === user!.email && c.role === "Host")
      ))

  // "Coordinator" role — can see overview, chat, announcements, tasks
  const isCoordinator = !isHost && !!user?.email && subEvents.some(se =>
    se.coordinators.some(c => c.email === user!.email && c.role !== "Host")
  )

  // "Staff" — event-level read-only access assigned in eventCoordinators
  const isStaff = !isHost && !!user?.email &&
    (event?.eventCoordinators ?? []).some((c: any) => c.email === user.email && c.role === "Staff")

  // "Volunteer" coordinators can register and use participant-level features
  const isVolunteer = !isHost && !!user?.email && subEvents.some(se =>
    se.coordinators.some(c => c.email === user!.email && c.role === "Volunteer")
  )

  // Staff (Host, Coordinator, Volunteer) or any user who has been assigned a task
  const isStaffRestricted = !!user?.email && (
    isHost || isCoordinator || event?.restricted_registrations?.includes(user.email)
  )

  // Confirmed registrations — DRAFT registrations are pending team invites,
  // not yet accepted. Exclude them from counts, access checks, and chat.
  const confirmedRegistrations = registrations.filter(r => r.status !== "DRAFT")

  const isRegistered = user ? confirmedRegistrations.some(r =>
    r.userEmail === user.email || r.teamMembers?.includes(user.email)
  ) : false

  // Chat channel access by role
  const myRegisteredSubEventIds = user
    ? confirmedRegistrations.filter(r => r.userEmail === user.email || r.teamMembers?.includes(user.email)).map(r => r.subEventId)
    : []
  const myCoordinatingSubEventIds = user
    ? subEvents.filter(se => se.coordinators.some(c => c.email === user.email)).map(se => se.id)
    : []
  const accessibleChannels: string[] = (isHost || isStaff)
    ? ["general", ...subEvents.map(se => se.id)]
    : isCoordinator
    ? ["general", ...myCoordinatingSubEventIds]
    : isRegistered || isVolunteer
    ? ["general", ...myRegisteredSubEventIds]
    : []

  // Set up automatic event reminders
  useEventReminders(event ?? null)

  // ── 10-second loading timeout — show a friendly error instead of infinite spinner ──
  // 10 s is enough for slow mobile connections while still providing
  // feedback if Firestore is genuinely unreachable (e.g. offline / blocked).
  useEffect(() => {
    if (!isLoading) {
      setLoadTimedOut(false) // reset if loading resolves (race condition guard)
      return
    }
    const timer = setTimeout(() => setLoadTimedOut(true), 10000)
    return () => clearTimeout(timer)
  }, [isLoading])

  // Keep chatChannel in sync with accessible channels (must be before any return)
  useEffect(() => {
    if (
      accessibleChannels.length > 0 &&
      !accessibleChannels.includes(chatChannel)
    ) {
      setChatChannel(accessibleChannels[0])
    }
  }, [chatChannel, accessibleChannels.join(",")])

  if (isLoading && !loadTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          <p className="text-white/30 font-mono text-xs tracking-widest uppercase">Loading event…</p>
        </div>
      </div>
    )
  }

  if (loadTimedOut && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <X className="w-5 h-5 text-white/40" />
          </div>
          <div>
            <p className="text-white/60 font-medium mb-1">Couldn’t load this event</p>
            <p className="text-white/30 text-sm font-mono">Check your connection and try again.</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="bg-white text-black text-xs h-9 px-5 hover:bg-white/80"
            >
              Reload
            </Button>
            <Button onClick={() => router.back()} variant="outline" className="border-white/20 text-white/60 text-xs h-9 px-5">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40 font-mono">Event not found</p>
      </div>
    )
  }

  // Loosened: college email verification no longer required — any user can participate
  const canAccessIntra = !event.collegeDomain || !!user
  const isRestricted = !!(event.collegeDomain && !canAccessIntra)

  // ── Check-In CSV export (checked-in participants only) ──
  const downloadCheckedInCSV = () => {
    const checkedInRegs = registrations.filter(r => r.checkedIn)
    const headers = ["Name", "Email", "Sub-Event", "Check-In Time"]
    const rows = checkedInRegs.map(r => {
      const se = event.subEvents.find(s => s.id === r.subEventId)
      const rawTime = r.checkInTime || ""
      const time = rawTime
        ? new Date(rawTime.includes('T') ? rawTime : rawTime.replace(' ', 'T') + 'Z').toLocaleString()
        : "Unknown"
      return [r.userName, r.userEmail, se?.name || "", time]
    })
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${event.title.replace(/\s+/g, "_")}_checkedin.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
      timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16),
      checkedIn: false
    })
  }

  const handleAddAnnouncement = () => {
    if (!user || !annTitle.trim() || !annMsg.trim()) return
    addAnnouncement(event.id, {
      id: `ann-${Date.now()}`, title: annTitle, message: annMsg,
      authorName: user.name, authorEmail: user.email,
      targetSubEventId: annTarget || "", pinned: annPinned,
      timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16),
    })
    setAnnTitle(""); setAnnMsg(""); setAnnTarget(""); setAnnPinned(false)
  }

  const handleAddTask = () => {
    // Description is required
    if (!user || !taskTitle.trim() || !taskAssigneeEmail.trim() || !taskDesc.trim()) return
    addTask(event.id, {
      id: `task-${Date.now()}`, title: taskTitle, description: taskDesc,
      assignedTo: taskAssigneeEmail, assignedBy: user.email, deadline: taskDeadline,
      status: "TODO", subEventId: taskSubEvent || "", createdAt: new Date().toISOString().slice(0, 10)
    })
    setTaskTitle(""); setTaskDesc(""); setTaskAssignee(""); setTaskAssigneeEmail(""); setTaskDeadline(""); setTaskSubEvent("")
  }

  const handleAddWorkUpdate = () => {
    if (!user || !workUpdateText.trim()) return
    addChatMessage(event.id, "work-updates", {
      id: `wu-${Date.now()}`,
      eventId: event.id,
      subEventId: "work-updates",
      userId: user.id,
      userName: user.name,
      message: workUpdateText.trim(),
      timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16),
    })
    setWorkUpdateText("")
  }

  const handleSendPush = () => {
    if (!pushSubject || !pushBody || !event) return
    const logId = `log-${Date.now()}`
    addAutomationLog(event.id, {
      id: logId,
      ruleId: "manual-push",
      ruleName: "Manual Push Notification",
      recipientEmail: pushRecipient || "All Participants",
      message: `Subject: ${pushSubject}\n\n${pushBody}`,
      timestamp: new Date().toLocaleString()
    })
    setPushSubject("")
    setPushBody("")
    setPushRecipient("")
  }

  const handleQRScan = (data: string) => {
    if (!event) return

    // Format: MYFESTIVO:eventId:subEventId:regId
    const parts = data.split(':')
    if (parts.length !== 4 || parts[0] !== 'MYFESTIVO') {
      setScanStatus({ type: 'error', msg: 'Invalid QR Code Format' })
      setTimeout(() => setScanStatus(null), 2500)
      return
    }

    const [_, scanEventId, scanSubEventId, scanRegId] = parts

    if (scanEventId !== event.id) {
      setScanStatus({ type: 'error', msg: 'QR Code is for a different event' })
      setTimeout(() => setScanStatus(null), 2500)
      return
    }

    const registration = registrations.find(r => r.id === scanRegId)
    if (!registration) {
      setScanStatus({ type: 'error', msg: 'Registration not found' })
      setTimeout(() => setScanStatus(null), 2500)
      return
    }

    if (registration.checkedIn) {
      setScanStatus({ type: 'error', msg: `${registration.userName} already checked in` })
      setTimeout(() => setScanStatus(null), 2500)
      return
    }

    if (registration.status !== 'PAID' && registration.status !== 'FREE') {
      setScanStatus({ type: 'error', msg: `Payment ${registration.status} for ${registration.userName}` })
      setTimeout(() => setScanStatus(null), 2500)
      return
    }

    // Success — close scanner after a short delay so the overlay is visible
    checkInParticipant(event.id, scanRegId)
    setScanStatus({ type: 'success', msg: `${registration.userName} checked in!` })
    setTimeout(() => setScanStatus(null), 2500)
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
  // Staff (event-level): same tabs as host but all actions are read-only
  const staffTabs = [
    { id: "overview" as TabId, label: "Overview", icon: Eye },
    { id: "chat" as TabId, label: "Chat", icon: MessageSquare },
    { id: "participants" as TabId, label: "Participants", icon: Users },
    { id: "announcements" as TabId, label: "Announcements", icon: Megaphone },
    { id: "tasks" as TabId, label: "Tasks", icon: ListTodo },
    { id: "checkin" as TabId, label: "Check-In", icon: QrCode },
    { id: "automation" as TabId, label: "Automation", icon: Zap },
  ]
  // Coordinator (non-Host roles): overview, chat, announcements, tasks
  const coordinatorTabs = [
    { id: "overview" as TabId, label: "Overview", icon: Eye },
    { id: "chat" as TabId, label: "Chat", icon: MessageSquare },
    { id: "announcements" as TabId, label: "Announcements", icon: Megaphone },
    { id: "tasks" as TabId, label: "Tasks", icon: ListTodo },
  ]
  // Participants and volunteers: overview, chat, QR pass
  const participantTabs = [
    { id: "overview" as TabId, label: "Overview", icon: Eye },
    { id: "chat" as TabId, label: "Chat", icon: MessageSquare },
    { id: "participant_qr" as TabId, label: "Check-in QR", icon: QrCode },
  ]

  let tabs: typeof hostTabs = []
  if (isHost) tabs = hostTabs
  else if (isStaff) tabs = staffTabs
  else if (isCoordinator) tabs = coordinatorTabs
  else if (isRegistered || isVolunteer) tabs = participantTabs

  return (
    <>
      <header className="fixed top-0 left-0 md:left-[72px] lg:left-[260px] right-0 h-16 flex items-center justify-between px-4 md:px-8 z-50 bg-black/60 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <Link href="/events" className="text-white/40 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="font-medium text-white truncate">{event.title}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isHost && (
            <>
              {/* Registration toggle — short text on mobile */}
              <button
                onClick={() => setShowRegConfirm(true)}
                className={`text-[10px] font-mono tracking-widest uppercase px-2 sm:px-3 py-1.5 rounded border transition-colors ${event.registrationOpen
                  ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                  : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  }`}
              >
                <span className="sm:hidden">{event.registrationOpen ? "Open" : "Closed"}</span>
                <span className="hidden sm:inline">Registration {event.registrationOpen ? "Open" : "Closed"}</span>
              </button>
              {/* Edit — icon only on mobile */}
              <Link href={`/events/${event.id}/edit`}>
                <Button variant="ghost" className="text-white/50 hover:text-white h-9 px-2 sm:px-3">
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-sm">Edit</span>
                </Button>
              </Link>
              {/* Finance — icon only on mobile */}
              <Link href={`/events/${event.id}/finance`}>
                <Button variant="ghost" className="text-white/50 hover:text-white h-9 px-2 sm:px-3">
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-sm">Finance</span>
                </Button>
              </Link>
            </>
          )}
          {/* Share Event — visible to all users */}
          <button
            onClick={() => {
              const url = `${window.location.origin}/events/${event.id}`
              if (navigator.share) {
                navigator.share({ title: event.title, url })
              } else {
                navigator.clipboard.writeText(url).then(() => {
                  const btn = document.getElementById('share-event-btn')
                  if (btn) {
                    const span = btn.querySelector('span.share-label')
                    if (span) { span.textContent = 'Copied!'; setTimeout(() => { span.textContent = 'Share' }, 2000) }
                  }
                })
              }
            }}
            id="share-event-btn"
            className="text-[10px] font-mono tracking-widest uppercase px-2 sm:px-3 py-1.5 rounded border border-white/20 text-white/60 hover:bg-white/10 transition-colors flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            <span className="share-label hidden sm:inline">Share</span>
          </button>
          {user?.role === "admin" && (
            <Link href="/admin">
              <Button variant="outline" className="border-white/20 text-white text-[10px] h-8 px-3 font-mono tracking-widest hover:bg-white/10 uppercase">Admin Hub</Button>
            </Link>
          )}
        </div>

      </header>

      <div className="pt-24 pb-24 md:pb-16 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div variants={pageItem} className="mb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {!event.collegeDomain ? <span className="font-mono text-[10px] px-2 py-0.5 border border-white/20 text-white/50">OPEN EVENT</span>
              : <span className="font-mono text-[10px] px-2 py-0.5 border border-yellow-500/50 text-yellow-400">INTRA — @{event.collegeDomain}</span>}
            <span className="font-mono text-[10px] px-2 py-0.5 border border-white/20 text-white/50">{event.category}</span>
            {event.price > 0 && <span className="font-mono text-[10px] px-2 py-0.5 border border-white/20 text-white/50">₹{event.price}</span>}
            {event.prizePool && <span className="font-mono text-[10px] px-2 py-0.5 border border-yellow-500/20 text-yellow-400/80 flex items-center gap-1"><Trophy className="w-3 h-3" /> {event.prizePool}</span>}
            {registrationClosed && <span className="font-mono text-[10px] px-2 py-0.5 border border-red-500/30 text-red-400">REGISTRATION CLOSED</span>}
            {eventExpired && <span className="font-mono text-[10px] px-2 py-0.5 border border-red-500/30 text-red-400">EVENT ENDED</span>}
            {event.registrationDeadline && !deadlinePassed && <span className="font-mono text-[10px] px-2 py-0.5 border border-white/20 text-white/50">Deadline: {formatDateDisplay(event.registrationDeadline)}</span>}
          </div>
          <h1 className="text-3xl md:text-5xl font-light leading-tight tracking-tight mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-5 font-mono text-sm text-white/60">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venue}</span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDateDisplay(event.date)}
              {event.hasTime && event.time && <span className="ml-1 text-white/40">at {formatTimeDisplay(event.time)}</span>}
            </span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4" />{Math.max(event.registeredCount || 0, confirmedRegistrations.length)}{event.seats !== 9999 ? ` / ${event.seats}` : ""} registered</span>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={pageItem} className="flex w-full gap-1 border-b border-white/[0.06] mb-8 overflow-x-auto pb-px no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-4 text-xs font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#B388FF]'
                  : 'text-white/40 hover:text-[#B388FF]/70'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B388FF]" />}
            </button>
          ))}
        </motion.div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <motion.div variants={pageItem} className="lg:col-span-8 space-y-12">
              <section>
                <MicroLabel>About the Event</MicroLabel>
                <RichTextDisplay content={event.description} />
              </section>

              <section>
                <MicroLabel>Sub-Events & Competitions</MicroLabel>
                <div className="space-y-4">
                  {event.subEvents.map(se => {
                    // A user is considered registered if they have a non-DRAFT registration for this sub-event
                    const isUserRegistered = registrations.some(r => r.subEventId === se.id && r.status !== "DRAFT" && (r.userEmail === user?.email || r.teamMembers?.includes(user?.email || "")))
                    return (
                      <GlassCard key={se.id} className="p-6 transition-all hover:bg-white/[0.04] scroll-mt-24" id={se.id}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium mb-1">{se.name}</h3>
                            <div className="flex gap-3 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                              <span>{se.type}</span>
                              <span>•</span>
                              <span>Max: {se.maxParticipants}</span>
                              {se.hasTime && se.time && (
                                <span className="flex items-center gap-1 text-white/30">
                                  <Clock className="w-3 h-3" />{formatTimeDisplay(se.time)}
                                </span>
                              )}
                            </div>
                          </div>
                          {isUserRegistered ? (
                            <span className="text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Registered</span>
                          ) : registrationClosed || eventExpired ? (
                            <span className="text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">Closed</span>
                          ) : (
                            <Button
                              onClick={() => {
                                if (!user) { router.push("/login"); return }
                                setSelectedSubEventForReg(se)
                              }}
                              disabled={isRestricted || isStaffRestricted}
                              variant="outline" className="h-8 px-4 text-[10px] font-mono border-white/20 hover:bg-[#B388FF] hover:text-black hover:border-[#B388FF] text-white bg-white/5 transition-all">
                              {!user ? "Login to Register" : isStaffRestricted ? "Restricted" : "Register"}
                            </Button>
                          )}
                        </div>

                        <div className="text-sm text-white/60 mb-4">
                            <RichTextDisplay content={se.description} className="text-sm" />
                          </div>

  {/* Prize badges — only show when showPrize is enabled */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(se as any).showPrize && se.prize ? (
                            <>
                              <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400/80 px-2 py-0.5 rounded flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> {se.prize.first}</span>
                              <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/40 px-2 py-0.5 rounded flex items-center gap-1"><Trophy className="w-3 h-3 text-gray-400" /> {se.prize.second}</span>
                              {se.prize.third && <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/30 px-2 py-0.5 rounded flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-700" /> {se.prize.third}</span>}
                            </>
                          ) : (
                            <span className="text-[10px] bg-white/[0.02] border border-white/[0.06] text-white/30 px-2 py-0.5 rounded">No Special rewards</span>
                          )}
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
                            <CoordinatorBadge key={i} c={c} />
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
                      <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">{rule}</span>
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
                  <p className="text-white/90 font-medium mb-1">{event.organizer}</p>
                  <p className="text-xs text-white/60 font-mono mb-4">{event.organizerEmail}</p>
                  {event.organizerPhone && (
                    <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                      <Phone className="w-3 h-3 text-white/40" />
                      <span className="text-sm text-white/70 font-mono">+91 {event.organizerPhone}</span>
                    </div>
                  )}
                </GlassCard>
              </section>

              {/* Venue Map */}
              {event.venueLat && event.venueLng && (
                <section>
                  <MicroLabel>Venue Location</MicroLabel>
                  <div className="space-y-2">
                    <EventMapViewDynamic
                      lat={event.venueLat}
                      lng={event.venueLng}
                      venueName={event.venue}
                    />
                    <a
                      href={`https://www.google.com/maps?q=${event.venueLat},${event.venueLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-[#B388FF] transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      Open in Google Maps
                    </a>
                  </div>
                </section>
              )}

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

              {(isRegistered || isVolunteer) && !isHost && (
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
                  <Button onClick={handleAddAnnouncement} className="bg-white text-black text-[10px] h-8 px-4 font-mono tracking-widest uppercase hover:bg-[#B388FF]">
                    <Send className="w-3 h-3 mr-1" /> Post
                  </Button>
                </div>
              </GlassCard>
            )}

            <div className="space-y-4">
              {event.announcements.length === 0 ? (
                <p className="text-white/30 text-sm font-mono py-12 text-center border border-white/[0.04] rounded-lg bg-white/[0.01]">No announcements yet.</p>
              ) : (
                [...event.announcements]
                  .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                  .map(ann => {
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
        {activeTab === "tasks" && (isHost || isCoordinator || isStaff) && (
          <motion.div variants={pageItem}>
            <div className="flex justify-between items-center mb-6">
              <MicroLabel className="mb-0">Team Tasks ({event.tasks.length})</MicroLabel>
            </div>

            {isHost && (
              <GlassCard className="p-5 mb-6 space-y-3">
                <p className="text-xs font-mono text-white/40 tracking-widest uppercase">New Task</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task title" className={`${inputCls} h-9`} />
                  {/* Assignee with friends name-based autofill */}
                  <div className="relative">
                    <Input
                      value={taskAssignee}
                      onChange={e => {
                        const val = e.target.value
                        setTaskAssignee(val)
                        setTaskAssigneeEmail("") // clear confirmed email when user edits
                        if (user && val.trim()) {
                          const q = val.toLowerCase()
                          const matches = user.friends
                            .filter(email => {
                              const name = email.split('@')[0].toLowerCase()
                              return name.includes(q) || email.toLowerCase().includes(q)
                            })
                            .map(email => ({ email, name: email.split('@')[0] }))
                          setTaskAssigneeResults(matches)
                        } else {
                          setTaskAssigneeResults([])
                        }
                      }}
                      placeholder="Search friend by name"
                      className={`${inputCls} h-9`}
                    />
                    {taskAssigneeResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/[0.1] rounded-md z-20 overflow-hidden">
                        {taskAssigneeResults.map(f => (
                          <button
                            key={f.email}
                            type="button"
                            onClick={() => {
                              setTaskAssignee(f.name)
                              setTaskAssigneeEmail(f.email)
                              setTaskAssigneeResults([])
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/[0.08] transition-colors flex items-center gap-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">{f.name[0].toUpperCase()}</div>
                            <div className="min-w-0">
                              <p className="font-medium text-white/80">{f.name}</p>
                              <p className="text-[10px] text-white/30 truncate">{f.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Indicate when a friend has been selected */}
                    {taskAssigneeEmail && (
                      <p className="text-[10px] font-mono text-green-400/70 mt-0.5 px-0.5 truncate">{taskAssigneeEmail}</p>
                    )}
                  </div>
                </div>
                <Input value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Description (required)" className={`${inputCls} h-9`} required />
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-[9px] font-mono text-white/30 mb-1 block tracking-widest uppercase">Deadline</label>
                    <Input
                      type="date"
                      value={taskDeadline}
                      onChange={e => setTaskDeadline(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      max={event.date}
                      className={`${inputCls} h-8`}
                    />
                  </div>
                  <select value={taskSubEvent} onChange={e => setTaskSubEvent(e.target.value)} className="h-8 bg-white/[0.03] border border-white/[0.08] text-white text-xs rounded-md px-2 flex-1">
                    <option value="">General</option>
                    {event.subEvents.map(se => <option key={se.id} value={se.id}>{se.name}</option>)}
                  </select>
                  <Button onClick={handleAddTask} disabled={!taskTitle.trim() || !taskAssigneeEmail.trim() || !taskDesc.trim()} className="bg-white text-black text-xs h-8 px-4"><PlusCircle className="w-3 h-3 mr-1" />Assign</Button>
                </div>
              </GlassCard>
            )}

            {/* Kanban Board + Work Update */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map(status => {
                const statusConfig = {
                  TODO: { label: "To-do", btnCls: "bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30" },
                  IN_PROGRESS: { label: "In Progress", btnCls: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30" },
                  DONE: { label: "Done", btnCls: "bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30" },
                }[status]
                return (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold ${
                        status === 'TODO' ? 'text-red-400/70' : status === 'IN_PROGRESS' ? 'text-yellow-400/70' : 'text-green-400/70'
                      }`}>{statusConfig.label}</span>
                      <span className="text-[10px] font-mono text-white/20">{event.tasks.filter(t => t.status === status).length}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2 min-h-[400px] space-y-2">
                      {event.tasks.filter(t => t.status === status).map(task => {
                        const se = event.subEvents.find(s => s.id === task.subEventId)
                        const isOverdue = task.deadline && new Date(task.deadline) < new Date() && status !== "DONE"
                        // Only the assignee can change task status
                        const canChangeStatus = user?.email === task.assignedTo || user?.collegeEmail === task.assignedTo
                        return (
                          <GlassCard key={task.id} className="p-3 space-y-2 border-white/[0.04]">
                            <p className="text-sm font-medium">{task.title}</p>
                            {task.description && <p className="text-xs text-white/40 line-clamp-2">{task.description}</p>}
                            <div className="flex flex-wrap gap-1 mb-1">
                              <span className="text-[9px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-white/40">{task.assignedTo}</span>
                              {se && <span className="text-[9px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-white/30">{se.name}</span>}
                              {task.deadline && <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.05] text-white/30'}`}><CalendarDays className="w-2.5 h-2.5" /> {task.deadline}</span>}
                            </div>
                            {/* Status change buttons — only shown to the assignee */}
                            {canChangeStatus && (
                              <div className="flex gap-1.5 flex-wrap">
                                {status !== "IN_PROGRESS" && status !== "DONE" && (
                                  <button onClick={() => updateTaskStatus(event.id, task.id, "IN_PROGRESS")}
                                    className={`text-[10px] font-mono px-3 py-1.5 border rounded-md transition-colors ${statusConfig.btnCls.includes('yellow') ? '' : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30'}`}>In Progress</button>
                                )}
                                {status !== "DONE" && (
                                  <button onClick={() => updateTaskStatus(event.id, task.id, "DONE")}
                                    className="text-[10px] font-mono px-3 py-1.5 border rounded-md transition-colors bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30">Done</button>
                                )}
                                {status === "DONE" && (
                                  <button onClick={() => updateTaskStatus(event.id, task.id, "TODO")}
                                    className="text-[10px] font-mono px-3 py-1.5 border rounded-md transition-colors bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30">Re-open</button>
                                )}
                              </div>
                            )}
                          </GlassCard>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Work Update column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">Work Update</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg flex flex-col min-h-[400px]">
                  {/* Feed */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {event.chatMessages.filter(m => m.subEventId === "work-updates").length === 0 && (
                      <p className="text-[10px] font-mono text-white/15 text-center mt-8">No updates yet</p>
                    )}
                    {event.chatMessages.filter(m => m.subEventId === "work-updates").map(m => (
                      <div key={m.id} className="p-2 rounded bg-white/[0.03] border border-white/[0.05] text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-medium text-white/70 text-[10px]">{m.userName}</span>
                          <span className="text-[9px] text-white/20 font-mono">{m.timestamp.slice(11)}</span>
                        </div>
                        <p className="text-white/50 leading-relaxed">{m.message}</p>
                      </div>
                    ))}
                  </div>
                  {/* Input */}
                  {user && (isHost || isCoordinator || isRegistered || isVolunteer) && (
                    <div className="p-2 border-t border-white/[0.06] flex gap-1">
                      <input
                        value={workUpdateText}
                        onChange={e => setWorkUpdateText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddWorkUpdate()}
                        placeholder="Post an update..."
                        className="flex-1 bg-white/[0.03] border border-white/[0.06] text-white text-[10px] rounded px-2 py-1.5 placeholder:text-white/20 outline-none"
                      />
                      <button onClick={handleAddWorkUpdate} className="bg-white text-black text-[9px] px-2 py-1.5 rounded font-mono">Post</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ CHECK-IN TAB ═══ */}
        {activeTab === "checkin" && (isHost || isStaff) && (
          <motion.div variants={pageItem}>
            <MicroLabel>Participant Check-In</MicroLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <GlassCard className="p-4 text-center">
                <p className="text-[10px] font-mono text-white/50 tracking-widest uppercase mb-1">Checked In</p>
                <p className="text-2xl font-light">{registrations.filter(r => r.checkedIn).length}</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <p className="text-[10px] font-mono text-white/50 tracking-widest uppercase mb-1">Total Registered</p>
                <p className="text-2xl font-light text-green-400">{confirmedRegistrations.length}</p>
              </GlassCard>
              <GlassCard className="p-4 col-span-2 flex items-center gap-3 border-white/20">
                {!isStaff && (
                  <Button onClick={() => setShowQRScanner(true)} className="bg-white text-black text-[10px] font-mono tracking-widest uppercase hover:bg-white/80 h-10 px-6 rounded-full flex-1 max-w-[220px]">
                    <Camera className="w-4 h-4 mr-2" /> Live QR Scan
                  </Button>
                )}
                <Button onClick={downloadCheckedInCSV} variant="outline" className="h-10 px-4 text-[10px] font-mono border-white/20 text-white/70 hover:text-white gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </Button>
              </GlassCard>
            </div>

            {/* Sub-event filter dropdown — its own row below summary cards */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase whitespace-nowrap">Filter by Sub-event:</span>
              <select
                value={checkInSubEventFilter}
                onChange={e => setCheckInSubEventFilter(e.target.value)}
                className="flex-1 max-w-xs h-9 bg-white/[0.04] border border-white/[0.1] text-white text-xs rounded-lg px-3 focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
              >
                <option value="">All Sub-events</option>
                {event.subEvents.map(se => (
                  <option key={se.id} value={se.id}>{se.name}</option>
                ))}
              </select>
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

            {/* Sub-event-wise grouped check-in list */}
            <div className="space-y-8">
              {event.subEvents
                .filter(se => !checkInSubEventFilter || se.id === checkInSubEventFilter)
                .map(se => {
                const seRegs = registrations.filter(r => r.subEventId === se.id && (r.status === "PAID" || r.status === "FREE"))
                const checkedCount = seRegs.filter(r => r.checkedIn).length
                if (seRegs.length === 0) return null
                return (
                  <div key={se.id}>
                    {/* Sub-event section header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.08]">
                      <div>
                        <h3 className="text-sm font-medium text-white">{se.name}</h3>
                        <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-0.5">{se.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
                          checkedCount === seRegs.length
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-white/[0.04] border-white/10 text-white/70'
                        }`}>
                          {checkedCount} / {seRegs.length} checked in
                        </span>
                      </div>
                    </div>
                    {/* Participants for this sub-event */}
                    <div className="space-y-2">
                      {seRegs.map(reg => (
                        <div key={reg.id} className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              reg.checkedIn ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.05] text-white/40'
                            }`}>
                              {reg.checkedIn ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{reg.userName}</p>
                              <p className="text-[10px] font-mono text-white/50">{reg.userEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {reg.checkedIn ? (
                              <>
                                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                                  Arrived @ {reg.checkInTime ? new Date(reg.checkInTime.includes('T') ? reg.checkInTime : reg.checkInTime.replace(' ', 'T') + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'UNKNOWN'}
                                </span>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Undo check-in for ${reg.userName}?`)) {
                                      undoCheckInParticipant(event.id, reg.id)
                                    }
                                  }}
                                  className="text-[9px] font-mono text-white/30 hover:text-red-400 border border-white/10 hover:border-red-400/40 rounded px-2 py-0.5 transition-colors uppercase tracking-wider"
                                >
                                  Undo
                                </button>
                              </>
                            ) : (
                              <Button onClick={() => checkInParticipant(event.id, reg.id)} className="h-8 bg-white text-black text-[10px] font-mono tracking-widest uppercase hover:bg-white/80">Check In</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {/* Registrations with no matching sub-event (edge case) */}
              {(() => {
                const orphanRegs = registrations.filter(r => (r.status === "PAID" || r.status === "FREE") && !event.subEvents.find(se => se.id === r.subEventId))
                if (orphanRegs.length === 0) return null
                return (
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.08]">
                      <h3 className="text-sm font-medium text-white/70">General / Uncategorised</h3>
                      <span className="text-xs font-mono px-3 py-1 rounded-full border bg-white/[0.04] border-white/10 text-white/60">
                        {orphanRegs.filter(r => r.checkedIn).length} / {orphanRegs.length} checked in
                      </span>
                    </div>
                    <div className="space-y-2">
                      {orphanRegs.map(reg => (
                        <div key={reg.id} className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              reg.checkedIn ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.05] text-white/40'
                            }`}>
                              {reg.checkedIn ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            </div>
                            <p className="text-sm font-medium">{reg.userName}</p>
                          </div>
                          {reg.checkedIn ? (
                            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                              Arrived @ {reg.checkInTime ? new Date(reg.checkInTime.includes('T') ? reg.checkInTime : reg.checkInTime.replace(' ', 'T') + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'UNKNOWN'}
                            </span>
                          ) : !isStaff ? (
                            <Button onClick={() => checkInParticipant(event.id, reg.id)} className="h-8 bg-white text-black text-[10px] font-mono tracking-widest uppercase hover:bg-white/80">Check In</Button>
                          ) : (
                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Pending</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </motion.div>
        )}

        {/* ═══ AUTOMATION TAB ═══ */}
        {activeTab === "automation" && (isHost || isStaff) && (
          <motion.div variants={pageItem} className="max-w-3xl">
            <MicroLabel>Automation Rules</MicroLabel>
            {isStaff && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                <Zap className="w-3.5 h-3.5 text-yellow-400/60 shrink-0" />
                <p className="text-[10px] font-mono text-yellow-400/60">You have read-only access. Only the host can enable or disable automation rules.</p>
              </div>
            )}
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
                  {isStaff ? (
                    <div className={`w-10 h-5 rounded-full relative opacity-40 cursor-not-allowed ${rule.enabled ? 'bg-green-500' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 ${rule.enabled ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  ) : (
                    <button onClick={() => toggleAutomation(event.id, rule.id)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${rule.enabled ? 'bg-green-500' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${rule.enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  )}
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
                <Input placeholder="Recipient Email (leave empty for all participants)" value={pushRecipient} onChange={e => setPushRecipient(e.target.value)} className="bg-white/[0.03] border-white/[0.08]" />
                <div>
                  <label className="text-[9px] font-mono text-white/30 mb-1 block tracking-widest uppercase">Email Subject</label>
                  <Input placeholder="e.g. Important Update for TechFest" value={pushSubject} onChange={e => setPushSubject(e.target.value)} className="bg-white/[0.03] border-white/[0.08]" />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-white/30 mb-1 block tracking-widest uppercase">Email Body</label>
                  <textarea placeholder="Write the full email message here..." value={pushBody} onChange={e => setPushBody(e.target.value)} className="bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/30 rounded-md p-3 min-h-[100px] w-full outline-none focus:border-white/20 transition-colors" />
                </div>
                <Button onClick={handleSendPush} disabled={!pushSubject.trim() || !pushBody.trim()} className="bg-white text-black self-end text-xs h-9 px-4">Send Notification</Button>
              </GlassCard>
            </div>
          </motion.div>
        )}
        {/* ═══ PARTICIPANT QR TAB ═══ */}
        {activeTab === "participant_qr" && isRegistered && (
          <motion.div variants={pageItem}>
            <MicroLabel>My Registration Pass</MicroLabel>
            <div className="space-y-4">
              {confirmedRegistrations.filter(r => r.userEmail === user?.email).map(reg => {
                const se = event.subEvents.find(s => s.id === reg.subEventId)
                return (
                  <GlassCard key={reg.id} className="p-6 flex flex-col items-center">
                    <p className="text-sm font-medium mb-4">{se?.name}</p>
                    <div className="p-4 bg-white rounded-lg mb-4">
                      <QRCodeSVG value={`MYFESTIVO:${event.id}:${reg.subEventId}:${reg.id}`} size={200} />
                    </div>
                    <p className="text-xs font-mono text-white/40 mb-1">REG-ID: {reg.id}</p>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] px-2 py-0.5 border rounded ${reg.status === "PAID" || reg.status === "FREE" ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"}`}>{reg.status}</span>
                      {reg.checkedIn && <span className="text-[10px] font-mono text-green-400 flex items-center gap-1"><ClipboardCheck className="w-3 h-3" /> Checked In</span>}
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ CHAT TAB ═══ */}
        {activeTab === "chat" && (user && (isHost || isCoordinator || isRegistered || isVolunteer)) && (
          <motion.div variants={pageItem} className="max-w-3xl">
            <MicroLabel>Event Chat</MicroLabel>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {/* General channel — always accessible */}
              {accessibleChannels.includes("general") && (
                <button
                  onClick={() => setChatChannel("general")}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-widest uppercase whitespace-nowrap transition-colors ${chatChannel === "general" ? "bg-white text-black" : "bg-white/[0.04] text-white/40 hover:text-white/60 border border-white/[0.08]"}`}
                ># General</button>
              )}
              {/* Sub-event channels — filtered by role */}
              {event.subEvents.filter(se => accessibleChannels.includes(se.id)).map(se => (
                <button
                  key={se.id}
                  onClick={() => setChatChannel(se.id)}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-widest uppercase whitespace-nowrap transition-colors ${chatChannel === se.id ? "bg-white text-black" : "bg-white/[0.04] text-white/40 hover:text-white/60 border border-white/[0.08]"}`}
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
      {showRegWizard && selectedSubEventForReg && <RegistrationWizard event={event} initialSubEvent={selectedSubEventForReg} localRegistrations={localRegistrations} isVolunteer={isVolunteer} onClose={() => setSelectedSubEventForReg(null)} onSuccess={(reg) => { setLocalRegistrations(prev => [...prev, reg]); setSelectedSubEventForReg(null) }} />}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={(data) => handleQRScan(data)}
          onClose={() => { setShowQRScanner(false); setScanStatus(null) }}
          scanResult={scanStatus}
        />
      )}

      {/* Registration Open/Close Confirmation Modal */}
      <AnimatePresence>
        {showRegConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-[#111] border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${event.registrationOpen ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                <UserCheck className={`w-6 h-6 ${event.registrationOpen ? 'text-red-400' : 'text-green-400'}`} />
              </div>

              <h3 className="text-lg font-medium mb-1">
                {event.registrationOpen ? 'Close Registration?' : 'Open Registration?'}
              </h3>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                {event.registrationOpen
                  ? 'This will prevent new participants from registering for your event. Existing registrations will not be affected.'
                  : 'This will allow participants to register for your event. You can close it again at any time.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRegConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateEvent(event.id, { registrationOpen: !event.registrationOpen })
                    setShowRegConfirm(false)
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${event.registrationOpen
                    ? 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30'
                    : 'bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30'
                  }`}
                >
                  {event.registrationOpen ? 'Yes, Close' : 'Yes, Open'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
