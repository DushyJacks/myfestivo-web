"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEvents, MainEvent, SubEvent } from "@/lib/events-context"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeDateInput } from "@/components/ui/NativeDateInput"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { TimeInput } from "@/components/ui/TimeInput"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion } from "framer-motion"
import { PlusCircle, X, Trophy, Phone, LinkIcon, Users, Search, Clock, CheckSquare, Save, RotateCcw } from "lucide-react"
import Link from "next/link"
import { compressImage } from "@/lib/utils"
import { VenueMapPickerDynamic } from "@/components/map"

const DEPARTMENTS = ["BSc CS", "BSc Cyber Security", "BSc AI/ML", "BCA", "BCA Gen AI", "BCA DS"]
const INCHARGE_ROLES = ["Host", "Coordinator", "Volunteer"]

interface SubEventForm {
  name: string
  description: string
  type: "solo" | "team"
  maxParticipants: number
  minTeamSize: number
  maxTeamSize: number
  rules: string[]
  showPrize: boolean
  prizeFirst: string
  prizeSecond: string
  prizeThird: string
  inchargeSearch: string
  inchargeRole: string
  incharges: { name: string; email: string; phone: string; role: string }[]
  hasSubTime: boolean
  subTime: string
}

export default function CreateEventPage() {
  const { user, isLoading } = useAuth()
  const { addEvent } = useEvents()
  const router = useRouter()

  // Compute date constraints using local time, not UTC (toISOString)
  const getLocalDateString = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const today = new Date()
  const minEventDate = new Date(today)
  minEventDate.setDate(today.getDate() + 2)
  const minEventDateStr = getLocalDateString(minEventDate)
  const todayStr = getLocalDateString(today)

  const [form, setForm] = useState({
    title: "",
    date: "",
    hasTime: false,
    time: "",
    venue: "",
    category: "Technical" as "Technical" | "Cultural" | "Sports" | "Workshop",
    isInter: true,
    isPaid: false,
    price: 0,
    description: "",
    collegeDomain: "",
    organizerPhone: "",
    showPrizePool: false,
    prizePool: "",
    registrationDeadline: "",
    posterBase64: "",
    rules: [""],
    allowedDepartments: [] as string[],
  })

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  // ── Draft state ──
  const DRAFT_KEY = "mf_create_event_draft_v1"
  const [hasDraft, setHasDraft] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.form) setForm(saved.form)
        if (saved.subEvents) setSubEvents(saved.subEvents)
        if (saved.importantLinks) setImportantLinks(saved.importantLinks)
        setHasDraft(true)
      }
    } catch {}
  }, [])

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, subEvents, importantLinks }))
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2500)
    } catch {
      alert("Could not save draft. Storage might be full.")
    }
  }

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    setForm({
      title: "", date: "", hasTime: false, time: "", venue: "",
      category: "Technical" as "Technical" | "Cultural" | "Sports" | "Workshop",
      isInter: true, isPaid: false, price: 0, description: "",
      collegeDomain: "", organizerPhone: "", showPrizePool: false,
      prizePool: "", registrationDeadline: "", posterBase64: "",
      rules: [""], allowedDepartments: [] as string[],
    })
    setSubEvents([emptySubEvent()])
    setImportantLinks([])
  }

  const emptySubEvent = (): SubEventForm => ({
    name: "", description: "", type: "solo", maxParticipants: 50,
    minTeamSize: 2, maxTeamSize: 4,
    rules: [""], showPrize: false, prizeFirst: "", prizeSecond: "", prizeThird: "",
    inchargeSearch: "", inchargeRole: "Coordinator", incharges: [],
    hasSubTime: false, subTime: "",
  })

  const [subEvents, setSubEvents] = useState<SubEventForm[]>([emptySubEvent()])
  const [importantLinks, setImportantLinks] = useState<{ label: string; url: string }[]>([])


  // Friends autocomplete state per sub-event
  const [inchargeResults, setInchargeResults] = useState<{ [key: number]: any[] }>({})

  // Event-level Staff state
  const [staffList, setStaffList] = useState<{ name: string; email: string }[]>([])
  const [staffSearch, setStaffSearch] = useState("")
  const [staffResults, setStaffResults] = useState<{ name: string; email: string }[]>([])

  // Venue map coordinates
  const [venueLat, setVenueLat] = useState<number | undefined>(undefined)
  const [venueLng, setVenueLng] = useState<number | undefined>(undefined)

  const handleStaffSearch = (q: string) => {
    setStaffSearch(q)
    if (!user || !q.trim()) { setStaffResults([]); return }
    const term = q.toLowerCase()
    const filtered = user.friends
      .filter(email => email.toLowerCase().includes(term) && !staffList.some(s => s.email === email))
      .map(email => ({ email, name: email.split('@')[0] }))
    setStaffResults(filtered)
  }

  const addStaff = (friend: { name: string; email: string }) => {
    if (staffList.some(s => s.email === friend.email)) return
    setStaffList(prev => [...prev, friend])
    setStaffSearch("")
    setStaffResults([])
  }

  const removeStaff = (email: string) => {
    setStaffList(prev => prev.filter(s => s.email !== email))
  }

  const addLink = () => setImportantLinks(prev => [...prev, { label: "", url: "" }])
  const updateLink = (idx: number, key: "label" | "url", val: string) =>
    setImportantLinks(prev => prev.map((l, i) => i === idx ? { ...l, [key]: val } : l))
  const removeLink = (idx: number) => setImportantLinks(prev => prev.filter((_, i) => i !== idx))

  const update = (key: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const updateRule = (idx: number, val: string) => {
    setForm((prev) => ({ ...prev, rules: prev.rules.map((r, i) => i === idx ? val : r) }))
  }
  const addRule = () => setForm((prev) => ({ ...prev, rules: [...prev.rules, ""] }))
  const removeRule = (idx: number) => {
    if (form.rules.length > 1) setForm((prev) => ({ ...prev, rules: prev.rules.filter((_, i) => i !== idx) }))
  }

  const toggleDepartment = (dept: string) => {
    setForm(prev => ({
      ...prev,
      allowedDepartments: prev.allowedDepartments.includes(dept)
        ? prev.allowedDepartments.filter(d => d !== dept)
        : [...prev.allowedDepartments, dept]
    }))
  }

  const updateSubEvent = (idx: number, key: string, value: string | number | boolean) => {
    setSubEvents((prev) => prev.map((se, i) => i === idx ? { ...se, [key]: value } : se))
  }
  const updateSubRule = (seIdx: number, rIdx: number, val: string) => {
    setSubEvents((prev) => prev.map((se, i) => i === seIdx ? { ...se, rules: se.rules.map((r, j) => j === rIdx ? val : r) } : se))
  }
  const addSubRule = (seIdx: number) => {
    setSubEvents((prev) => prev.map((se, i) => i === seIdx ? { ...se, rules: [...se.rules, ""] } : se))
  }
  const removeSubRule = (seIdx: number, rIdx: number) => {
    setSubEvents((prev) => prev.map((se, i) => i === seIdx && se.rules.length > 1 ? { ...se, rules: se.rules.filter((_, j) => j !== rIdx) } : se))
  }

  // In-charges: search friends by name/email
  const handleInchargeSearch = (seIdx: number, query: string) => {
    updateSubEvent(seIdx, "inchargeSearch", query)
    if (!user || !query.trim()) {
      setInchargeResults(prev => ({ ...prev, [seIdx]: [] }))
      return
    }
    const q = query.toLowerCase()
    const filtered = user.friends
      .filter(email => email.toLowerCase().includes(q))
      .map(email => ({ email, name: email.split('@')[0] }))
    setInchargeResults(prev => ({ ...prev, [seIdx]: filtered }))
  }

  const addIncharge = (seIdx: number, friend: { name: string; email: string }) => {
    setSubEvents(prev => prev.map((se, i) => {
      if (i !== seIdx) return se
      if (se.incharges.some(c => c.email === friend.email)) return { ...se, inchargeSearch: "", }
      return {
        ...se,
        incharges: [...se.incharges, { name: friend.name, email: friend.email, phone: "", role: se.inchargeRole }],
        inchargeSearch: "",
      }
    }))
    setInchargeResults(prev => ({ ...prev, [seIdx]: [] }))
  }

  const removeIncharge = (seIdx: number, cIdx: number) => {
    setSubEvents((prev) => prev.map((se, i) => i === seIdx ? { ...se, incharges: se.incharges.filter((_, j) => j !== cIdx) } : se))
  }

  const addSubEvent = () => setSubEvents((prev) => [...prev, emptySubEvent()])
  const removeSubEvent = (idx: number) => {
    if (subEvents.length > 1) setSubEvents((prev) => prev.filter((_, i) => i !== idx))
  }

  const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large (max 5MB)")
      return
    }
    try {
      const compressedBase64 = await compressImage(file, 800, 600, 0.7)
      if (compressedBase64.length > 1048487) {
        alert("Compressed image is still too large. Please use a smaller image.")
        return
      }
      setForm(prev => ({ ...prev, posterBase64: compressedBase64 }))
    } catch (error) {
      console.error("Error compressing image:", error)
      alert("Failed to process image. Please try a different image.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!form.posterBase64) {
      alert("Event poster is required. Please upload an image.")
      return
    }

    setShowSubmitConfirm(true)
  }

  const confirmSubmit = async () => {
    if (!user) return
    setShowSubmitConfirm(false)
    setSubmitting(true)

    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60)
    const eventId = `${slug}-${Date.now().toString(36).slice(-4)}`

    const newEvent: MainEvent = {
      id: eventId,
      title: form.title,
      organizer: user.name,
      organizerEmail: user.email,
      organizerPhone: form.organizerPhone,
      date: form.date,
      hasTime: form.hasTime,
      time: form.hasTime ? form.time : "",
      venue: form.venue,
      seats: 9999, // Unlimited seats — capacity managed per sub-event maxParticipants
      registeredCount: 0,
      ...(venueLat !== undefined && venueLng !== undefined ? { venueLat, venueLng } : {}),
      category: form.category,
      isInter: form.isInter,
      price: form.price,
      description: form.description,
      rules: form.rules.filter(r => r.trim()),
      prizePool: form.showPrizePool ? form.prizePool : "",
      collegeDomain: form.isInter ? "" : form.collegeDomain,
      registrationOpen: false,  // Starts closed — opened after admin approval
      registrationDeadline: form.registrationDeadline || "",
      eventCoordinators: staffList.map(s => ({ name: s.name, email: s.email, phone: "", role: "Staff" })),
      status: "pending_review" as const,
      subEvents: subEvents.filter((se) => se.name).map((se, i) => {
        const sub: SubEvent = {
          id: `sub-${Date.now()}-${i}`,
          name: se.name,
          description: se.description,
          type: se.type,
          maxParticipants: se.maxParticipants,
          rules: se.rules.filter(r => r.trim()),
          prize: se.showPrize
            ? { first: se.prizeFirst || "", second: se.prizeSecond || "", ...(se.prizeThird ? { third: se.prizeThird } : {}) }
            : null as any,
          showPrize: se.showPrize,
          coordinators: se.incharges,
          hasTime: se.hasSubTime,
          time: se.hasSubTime ? se.subTime : "",
        } as any
        if (se.type === "team") {
          sub.minTeamSize = se.minTeamSize
          sub.maxTeamSize = se.maxTeamSize
        }
        return sub
      }),
      registrations: [],
      chatMessages: [],
      announcements: [],
      tasks: [],
      automations: [
        { id: `auto-${Date.now()}-1`, name: "Registration Confirmation", trigger: "on_register" as const, message: `You're registered for ${form.title}! Check your dashboard for your QR pass.`, enabled: true },
        { id: `auto-${Date.now()}-2`, name: "24hr Reminder", trigger: "before_event_24h" as const, message: `Reminder: ${form.title} starts tomorrow at ${form.venue}. Don't forget your college ID!`, enabled: true },
        { id: `auto-${Date.now()}-3`, name: "Payment Nudge", trigger: "payment_pending" as const, message: `Your payment for ${form.title} is still pending. Please complete it to confirm your spot.`, enabled: form.price > 0 },
      ],
      automationLogs: [],
      importantLinks: importantLinks.filter(l => l.label.trim() && l.url.trim()).map((l, i) => ({
        id: `link-${Date.now()}-${i}`,
        label: l.label,
        url: l.url,
      })),
      restricted_registrations: [],
      // Store allowed departments as extra field for intra-college filtering
      ...(form.posterBase64 ? { poster_base64: form.posterBase64 } : {}),
      ...(!form.isInter && form.allowedDepartments.length > 0 ? { allowedDepartments: form.allowedDepartments } : {}),
    } as MainEvent & { allowedDepartments?: string[] }

    try {
      await addEvent(newEvent)
      // Clear draft on successful submit
      localStorage.removeItem(DRAFT_KEY)
      setSubmitted(true)
      setSubmitting(false)
    } catch (err) {
      console.error("Failed to submit event for review:", err)
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [user, isLoading, router])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!user) return null

  // ── Submission success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-light tracking-tight mb-4">Event Submitted!</h1>
          <GlassCard className="p-6 mb-6 text-left">
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Your event has been submitted for review. It will be published within{" "}
              <span className="text-white font-medium">1 hour</span> after our team reviews and approves it.
            </p>
            <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
              <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
              <p className="text-xs text-yellow-400/80 leading-relaxed">
                Your event registration is currently closed. It will open automatically once approved by the admin.
              </p>
            </div>
          </GlassCard>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard">
              <Button className="bg-white text-black hover:bg-[#B388FF] font-medium">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Browse Events
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const inputCls = "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-10 text-sm"
  const labelCls = "text-[10px] font-mono text-white/40 mb-1 block tracking-widest uppercase"

  return (
    <div className="pb-16 px-4 max-w-3xl mx-auto">
      <PageTransition>
      <motion.div variants={pageItem}>
        <MicroLabel>New Event</MicroLabel>
        <h1 className="text-3xl font-light tracking-tight mb-8">Host your event.</h1>
      </motion.div>

      <motion.div variants={pageItem}>
        {/* Draft restored banner */}
        {hasDraft && (
          <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-[#B388FF]/10 border border-[#B388FF]/20 text-sm">
            <RotateCcw className="w-4 h-4 text-[#B388FF] shrink-0" />
            <span className="text-[#B388FF]/90 flex-1">Draft restored. You can continue editing or clear it to start fresh.</span>
            <button type="button" onClick={handleClearDraft} className="text-[10px] font-mono text-white/40 hover:text-red-400 transition-colors uppercase tracking-widest whitespace-nowrap">Clear Draft</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <GlassCard className="p-6 space-y-5">
            <MicroLabel className="mb-0">01 — Event Details</MicroLabel>
            <div>
              <label className={labelCls}>Event Title</label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="TechFest '26" className={`${inputCls} h-11`} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Event Date</label>
                <NativeDateInput
                  value={form.date}
                  min={minEventDateStr}
                  onChange={(e) => update("date", e.target.value)}
                  className="h-11"
                  required
                />
                <p className="text-[10px] text-white/30 mt-1">Must be at least 2 days from today</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls}>Event Time <span className="text-white/20">(optional)</span></label>
                  <button
                    type="button"
                    onClick={() => update("hasTime", !form.hasTime)}
                    aria-label={form.hasTime ? "Disable event time" : "Enable event time"}
                    className={`relative w-9 h-5 rounded-full transition-colors ${form.hasTime ? "bg-green-500" : "bg-white/10"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.hasTime ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
                {form.hasTime ? (
                  <TimeInput
                    value={form.time}
                    onChange={(val) => update("time", val)}
                    className="w-full"
                  />
                ) : (
                  <div className="h-11 bg-white/[0.01] border border-white/[0.04] rounded-md px-3 flex items-center">
                    <span className="text-xs text-white/20 font-mono">Toggle to add event time</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Venue</label>
                <Input value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Main Auditorium" className={`${inputCls} h-11`} required />
              </div>
              <div>
                <label className={labelCls}>Registration Deadline</label>
                <NativeDateInput
                  value={form.registrationDeadline}
                  min={todayStr}
                  max={form.date || undefined}
                  onChange={(e) => update("registrationDeadline", e.target.value)}
                  className="h-11"
                />
                <p className="text-[10px] text-white/30 mt-1">Between today and the event date</p>
              </div>
            </div>

            {/* Venue Map Picker */}
            <div>
              <label className={labelCls}>Venue Location on Map <span className="text-white/20 normal-case font-sans tracking-normal">(optional)</span></label>
              <VenueMapPickerDynamic
                lat={venueLat}
                lng={venueLng}
                onSelect={(lat, lng) => { setVenueLat(lat); setVenueLng(lng) }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls}>Registration Fee</label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !form.isPaid
                      setForm(prev => ({ ...prev, isPaid: next, price: next ? prev.price || 0 : 0 }))
                    }}
                    aria-label={form.isPaid ? "Switch to free event" : "Switch to paid event"}
                    className={`relative w-9 h-5 rounded-full transition-colors ${form.isPaid ? "bg-green-500" : "bg-white/10"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.isPaid ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
                {form.isPaid ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-mono">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={form.price || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.replace(/\D/g, "")) || 0
                        update("price", val)
                      }}
                      placeholder="0"
                      className="w-full h-11 bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 rounded-md pl-7 pr-3 text-sm focus:outline-none focus:border-white/20"
                    />
                  </div>
                ) : (
                  <div className="h-11 bg-white/[0.01] border border-white/[0.04] rounded-md px-3 flex items-center gap-2">
                    <span className="text-xs text-white/20 font-mono">Free Event</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full h-11 bg-white/[0.03] border border-white/[0.08] text-white rounded-md px-3 text-sm">
                <option value="Technical">Technical</option><option value="Cultural">Cultural</option><option value="Sports">Sports</option><option value="Workshop">Workshop</option>
              </select>
            </div>
            <div><label className={labelCls}>Description</label>
              <RichTextEditor
                value={form.description}
                onChange={(val) => update("description", val)}
                placeholder="Describe your event..."
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}><Phone className="w-3 h-3 inline mr-1" />Organizer Phone</label>
                <div className="flex h-11">
                  <span className="flex items-center px-3 bg-white/[0.04] border border-r-0 border-white/[0.08] rounded-l-md text-sm text-white/50 font-mono shrink-0 select-none">+91</span>
                  <input
                    type="tel"
                    value={form.organizerPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                      update("organizerPhone", digits)
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-r-md px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 font-mono"
                  />
                </div>
                {form.organizerPhone.length > 0 && form.organizerPhone.length < 10 && (
                  <p className="text-[10px] text-red-400/70 mt-1">{10 - form.organizerPhone.length} more digits required</p>
                )}
              </div>
              {/* Total Prize Pool with toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls}><Trophy className="w-3 h-3 inline mr-1" />Total Prize Pool</label>
                  <button
                    type="button"
                    onClick={() => update("showPrizePool", !form.showPrizePool)}
                    aria-label={form.showPrizePool ? "Disable prize pool" : "Enable prize pool"}
                    className={`relative w-9 h-5 rounded-full transition-colors ${form.showPrizePool ? "bg-green-500" : "bg-white/10"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.showPrizePool ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>
                {form.showPrizePool ? (
                  <Input value={form.prizePool} onChange={(e) => update("prizePool", e.target.value)} placeholder="₹1,50,000" className={`${inputCls} h-11`} />
                ) : (
                  <div className="h-11 bg-white/[0.01] border border-white/[0.04] rounded-md px-3 flex items-center">
                    <span className="text-xs text-white/20 font-mono">Toggle to add prize pool</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Scope */}
            <div><label className={labelCls}>Event Scope</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => update("isInter", true)} className={`flex-1 py-2.5 px-4 rounded-md text-sm transition-colors border ${form.isInter ? "bg-white text-black border-white" : "bg-white/[0.03] text-white/50 border-white/[0.08]"}`}>Inter-College (Open)</button>
                <button type="button" onClick={() => update("isInter", false)} className={`flex-1 py-2.5 px-4 rounded-md text-sm transition-colors border ${!form.isInter ? "bg-white text-black border-white" : "bg-white/[0.03] text-white/50 border-white/[0.08]"}`}>Intra-College (Restricted)</button>
              </div>
            </div>
            {!form.isInter && (
              <div className="space-y-4">
                <div><label className={labelCls}>College Email Domain</label>
                  <Input value={form.collegeDomain} onChange={(e) => update("collegeDomain", e.target.value)} placeholder="srmist.edu.in" className={`${inputCls} h-11`} />
                  <p className="text-[10px] text-white/30 mt-1">Students with a @{form.collegeDomain || "domain"} email can register</p>
                </div>
                {/* Optional Department Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelCls}>Restrict by Department (optional)</label>
                    {form.allowedDepartments.length > 0 && (
                      <button type="button" onClick={() => setForm(p => ({ ...p, allowedDepartments: [] }))} className="text-[10px] text-white/30 hover:text-white/60">Clear</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DEPARTMENTS.map(dept => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => toggleDepartment(dept)}
                        className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${form.allowedDepartments.includes(dept) ? "bg-white text-black border-white" : "bg-white/[0.03] text-white/50 border-white/[0.08] hover:border-white/30"}`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">
                    {form.allowedDepartments.length === 0 ? "All departments can register (no restriction)" : `Only: ${form.allowedDepartments.join(", ")}`}
                  </p>
                </div>
              </div>
            )}

            {/* Poster Upload */}
            <div>
              <label className={labelCls}>Event Poster <span className="text-red-400">*</span></label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="block w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-mono file:bg-white/[0.05] file:text-white hover:file:bg-white/[0.1] file:transition-colors bg-white/[0.02] border border-white/[0.08] rounded-md h-11 file:h-11 file:cursor-pointer"
                />
                {form.posterBase64 && (
                  <div className="w-11 h-11 rounded-md overflow-hidden shrink-0 border border-white/[0.08]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.posterBase64} alt="Poster preview" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-white/30 mt-1">Max 5MB. Will be displayed in 16:9 ratio on event cards.</p>
            </div>

            {/* Event-level Staff */}
            <div className="space-y-2">
              <div>
                <span className={labelCls}><Users className="w-3 h-3 inline mr-1" />Staff</span>
                <p className="text-[10px] text-white/30 mb-2">Staff can view all event data (participants, check-in, announcements, tasks) but cannot make changes. CSV export is allowed.</p>
              </div>
              {staffList.map(s => (
                <div key={s.email} className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.05] text-xs">
                  <div>
                    <span className="text-white/70">{s.name || s.email}</span>
                    <span className="ml-2 text-[9px] font-mono text-[#B388FF]/60">Staff</span>
                  </div>
                  <button type="button" onClick={() => removeStaff(s.email)} className="text-white/20 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <Input
                  value={staffSearch}
                  onChange={(e) => handleStaffSearch(e.target.value)}
                  placeholder="Search friends to add as staff..."
                  className={`${inputCls} h-8 text-xs pl-8`}
                />
                {staffResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/[0.1] rounded-md z-20 overflow-hidden">
                    {staffResults.map(f => (
                      <button
                        key={f.email}
                        type="button"
                        onClick={() => addStaff(f)}
                        className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/[0.08] transition-colors flex items-center gap-2"
                      >
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold">{f.email[0].toUpperCase()}</div>
                        <span>{f.email}</span>
                      </button>
                    ))}
                  </div>
                )}
                {staffSearch && staffResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/[0.1] rounded-md z-20 px-3 py-2">
                    <p className="text-[10px] text-white/30">No friends found. Add them as friends first.</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>


          {/* Rules */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <MicroLabel className="mb-0">02 — Event Rules</MicroLabel>
              <button type="button" onClick={addRule} className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"><PlusCircle className="w-3 h-3" /> Add Rule</button>
            </div>
            {form.rules.map((rule, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-[10px] font-mono text-white/30 w-6 shrink-0">{idx + 1}.</span>
                <Input value={rule} onChange={(e) => updateRule(idx, e.target.value)} placeholder="Enter a rule..." className={`${inputCls} flex-1`} />
                {form.rules.length > 1 && (
                  <button type="button" onClick={() => removeRule(idx)} className="text-white/20 hover:text-red-400"><X className="w-3 h-3" /></button>
                )}
              </div>
            ))}
          </GlassCard>

          {/* Sub Events */}
          <GlassCard className="p-6 space-y-5">
            <div className="flex justify-between items-center">
              <MicroLabel className="mb-0">03 — Sub-Events</MicroLabel>
              <button type="button" onClick={addSubEvent} className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"><PlusCircle className="w-4 h-4" /> Add Sub-Event</button>
            </div>

            {subEvents.map((se, idx) => (
              <div key={idx} className="p-4 rounded-md bg-white/[0.02] border border-white/[0.06] space-y-4 relative">
                {subEvents.length > 1 && (
                  <button type="button" onClick={() => removeSubEvent(idx)} className="absolute top-3 right-3 text-white/20 hover:text-red-400"><X className="w-4 h-4" /></button>
                )}
                <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Sub-Event {idx + 1}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className={labelCls}>Name</label><Input value={se.name} onChange={(e) => updateSubEvent(idx, "name", e.target.value)} placeholder="Hackathon" className={inputCls} required /></div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls}>Sub-Event Time <span className="text-white/20">(optional)</span></label>
                      <button
                        type="button"
                        onClick={() => updateSubEvent(idx, "hasSubTime", !se.hasSubTime)}
                        aria-label={se.hasSubTime ? "Disable sub-event time" : "Enable sub-event time"}
                        className={`relative w-9 h-5 rounded-full transition-colors ${se.hasSubTime ? "bg-green-500" : "bg-white/10"}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${se.hasSubTime ? "left-4" : "left-0.5"}`} />
                      </button>
                    </div>
                    {se.hasSubTime ? (
                      <TimeInput
                        value={se.subTime}
                        onChange={(val) => updateSubEvent(idx, "subTime", val)}
                        className="w-full !h-10"
                      />
                    ) : (
                      <div className="h-10 bg-white/[0.01] border border-white/[0.04] rounded-md px-3 flex items-center">
                        <span className="text-xs text-white/20 font-mono">Toggle to add time</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <RichTextEditor
                    value={se.description}
                    onChange={(val) => updateSubEvent(idx, "description", val)}
                    placeholder="Brief description of this sub-event..."
                    rows={3}
                  />
                </div>

                {/* Solo / Team Toggle */}
                <div>
                  <label className={labelCls}>Participation Type</label>
                  <p className="text-[10px] text-amber-400/70 mb-2 font-mono">⚠ This cannot be changed after the event is created.</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => updateSubEvent(idx, "type", "solo")} className={`flex-1 py-2 rounded-md text-xs transition-colors border ${se.type === "solo" ? "bg-white text-black border-white" : "bg-white/[0.03] text-white/50 border-white/[0.08]"}`}>Solo</button>
                    <button type="button" onClick={() => updateSubEvent(idx, "type", "team")} className={`flex-1 py-2 rounded-md text-xs transition-colors border ${se.type === "team" ? "bg-white text-black border-white" : "bg-white/[0.03] text-white/50 border-white/[0.08]"}`}>Team</button>
                  </div>
                </div>

                {/* Max Participants / Teams */}
                <div>
                  <label className={labelCls}>{se.type === "team" ? "Max Teams" : "Max Participants"}</label>
                  <Input type="number" min={1} value={se.maxParticipants} onChange={(e) => updateSubEvent(idx, "maxParticipants", Math.max(1, parseInt(e.target.value) || 1))} className={inputCls} />
                </div>

                {se.type === "team" && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <label className={labelCls}>Min Team Size</label>
                      <Input type="number" min={1} value={se.minTeamSize} onChange={(e) => updateSubEvent(idx, "minTeamSize", Math.max(1, parseInt(e.target.value) || 1))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Max Team Size</label>
                      <Input type="number" min={2} value={se.maxTeamSize} onChange={(e) => updateSubEvent(idx, "maxTeamSize", Math.max(se.minTeamSize || 2, parseInt(e.target.value) || 2))} className={inputCls} />
                    </div>
                  </div>
                )}

                {/* Sub-Event Rules */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={labelCls}>Rules</span>
                    <button type="button" onClick={() => addSubRule(idx)} className="text-[10px] text-white/30 hover:text-white/60"><PlusCircle className="w-3 h-3 inline mr-0.5" /> Add</button>
                  </div>
                  {se.rules.map((rule, rIdx) => (
                    <div key={rIdx} className="flex gap-2 items-center">
                      <span className="text-[9px] font-mono text-white/20 w-4">{rIdx + 1}.</span>
                      <Input value={rule} onChange={(e) => updateSubRule(idx, rIdx, e.target.value)} placeholder="Rule..." className={`${inputCls} flex-1 h-8 text-xs`} />
                      {se.rules.length > 1 && <button type="button" onClick={() => removeSubRule(idx, rIdx)} className="text-white/20 hover:text-red-400"><X className="w-3 h-3" /></button>}
                    </div>
                  ))}
                </div>

                {/* Prize Money Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={labelCls}><Trophy className="w-3 h-3 inline mr-1" />Prize Money</span>
                    <button
                      type="button"
                      onClick={() => updateSubEvent(idx, "showPrize", !se.showPrize)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${se.showPrize ? "bg-green-500" : "bg-white/10"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${se.showPrize ? "left-4" : "left-0.5"}`} />
                    </button>
                  </div>
                  {se.showPrize && (
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <span className="text-[9px] font-mono text-white/30 flex items-center gap-1"><Trophy className="w-2.5 h-2.5" /> 1st Prize</span>
                        <Input value={se.prizeFirst} onChange={(e) => updateSubEvent(idx, "prizeFirst", e.target.value)} placeholder="₹50,000" className={`${inputCls} h-8 text-xs mt-1`} />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-white/30 flex items-center gap-1"><Trophy className="w-2.5 h-2.5 text-gray-400" /> 2nd Prize</span>
                        <Input value={se.prizeSecond} onChange={(e) => updateSubEvent(idx, "prizeSecond", e.target.value)} placeholder="₹25,000" className={`${inputCls} h-8 text-xs mt-1`} />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-white/30 flex items-center gap-1"><Trophy className="w-2.5 h-2.5 text-amber-700" /> 3rd Prize</span>
                        <Input value={se.prizeThird} onChange={(e) => updateSubEvent(idx, "prizeThird", e.target.value)} placeholder="₹10,000" className={`${inputCls} h-8 text-xs mt-1`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* In-charges (friends autocomplete) */}
                <div className="space-y-2">
                  <span className={labelCls}><Users className="w-3 h-3 inline mr-1" />In-charges</span>
                  {se.incharges.map((c, cIdx) => (
                    <div key={cIdx} className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.05] text-xs">
                      <div>
                        <span className="text-white/70">{c.name || c.email}</span>
                        <span className="ml-2 text-[9px] font-mono text-white/30">{c.role}</span>
                      </div>
                      <button type="button" onClick={() => removeIncharge(idx, cIdx)} className="text-white/20 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Search friends */}
                    <div className="relative sm:col-span-2">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                      <Input
                        value={se.inchargeSearch}
                        onChange={(e) => handleInchargeSearch(idx, e.target.value)}
                        placeholder="Search friends by name or email..."
                        className={`${inputCls} h-8 text-xs pl-8`}
                      />
                      {/* Autocomplete dropdown */}
                      {(inchargeResults[idx] || []).length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/[0.1] rounded-md z-20 overflow-hidden">
                          {(inchargeResults[idx] || []).map((f: any) => (
                            <button
                              key={f.email}
                              type="button"
                              onClick={() => addIncharge(idx, f)}
                              className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/[0.08] transition-colors flex items-center gap-2"
                            >
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold">{f.email[0].toUpperCase()}</div>
                              <span>{f.email}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {se.inchargeSearch && (inchargeResults[idx] || []).length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/[0.1] rounded-md z-20 px-3 py-2">
                          <p className="text-[10px] text-white/30">No friends found. Friends must be added first.</p>
                        </div>
                      )}
                    </div>
                    {/* Role selector */}
                    <select
                      value={se.inchargeRole}
                      onChange={(e) => updateSubEvent(idx, "inchargeRole", e.target.value)}
                      className="h-8 bg-white/[0.03] border border-white/[0.08] text-white text-xs rounded-md px-2"
                    >
                      {INCHARGE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <p className="text-[10px] text-white/30">Only users in your friends list can be added as in-charges.</p>
                </div>
              </div>
            ))}
          </GlassCard>

          {/* Important Links */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <MicroLabel className="mb-0">04 — Important Links</MicroLabel>
              <button type="button" onClick={addLink} className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"><PlusCircle className="w-3 h-3" /> Add Link</button>
            </div>
            <p className="text-[10px] text-white/30">Add links to resources participants should see (WhatsApp groups, Google Forms, rule books, etc.)</p>
            {importantLinks.length === 0 ? (
              <button type="button" onClick={addLink} className="w-full py-6 border border-dashed border-white/10 rounded-md text-white/30 text-sm hover:border-white/20 hover:text-white/50 transition-colors flex items-center justify-center gap-2">
                <LinkIcon className="w-4 h-4" /> Add your first link
              </button>
            ) : (
              <div className="space-y-3">
                {importantLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-[10px] font-mono text-white/30 w-6 shrink-0">{idx + 1}.</span>
                    <Input value={link.label} onChange={(e) => updateLink(idx, "label", e.target.value)} placeholder="Label (e.g. WhatsApp Group)" className={`${inputCls} flex-1`} />
                    <Input value={link.url} onChange={(e) => updateLink(idx, "url", e.target.value)} placeholder="https://..." className={`${inputCls} flex-1`} />
                    <button type="button" onClick={() => removeLink(idx)} className="text-white/20 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Draft & Submit actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              onClick={handleSaveDraft}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 h-12 text-sm"
            >
              {draftSaved ? (
                <span className="flex items-center gap-2 text-green-400">
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                  Draft Saved!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Draft
                </span>
              )}
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting} className="flex-1 bg-white text-black hover:bg-[#B388FF] font-medium h-12 text-base disabled:opacity-50">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Submitting for Review...
                </span>
              ) : (
                "Submit for Review"
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Confirmation Dialog for Submission */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-[#B388FF]" /> Confirm Submission
              </h2>
              <div className="space-y-3 mb-6 text-sm text-white/80">
                <p><strong>Title:</strong> {form.title || "Untitled"}</p>
                <p><strong>Date:</strong> {form.date || "Not set"}</p>
                <p><strong>Sub-Events:</strong> {subEvents.filter(s => s.name.trim() !== "").length}</p>
              </div>
              <p className="text-sm text-white/60 mb-6 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20">
                Your event will be submitted to the admins for review. It will be published shortly after approval.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" className="border-white/20" onClick={() => setShowSubmitConfirm(false)}>
                  Cancel
                </Button>
                <Button className="bg-white text-black hover:bg-[#B388FF]" onClick={confirmSubmit}>
                  Yes, Submit
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </PageTransition>
    </div>
  )
}
