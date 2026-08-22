"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEvents, MainEvent, SubEvent, ImportantLink } from "@/lib/events-context"
import { useRouter, useParams } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeDateInput } from "@/components/ui/NativeDateInput"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { TimeInput } from "@/components/ui/TimeInput"
import { pageItem } from "@/components/animation/PageTransition"
import { motion } from "framer-motion"
import {
  PlusCircle, X, ArrowLeft, Trophy, Phone, Save, AlertTriangle,
  Trash2, ToggleLeft, ToggleRight, Settings, CalendarDays, Info, LinkIcon, Search, Users, ImageIcon, Upload
} from "lucide-react"
import Link from "next/link"
import { VenueMapPickerDynamic } from "@/components/map"

interface SubEventForm {
  id: string
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
  /** Search query for friend-based in-charge lookup (transient, not persisted) */
  inchargeSearch: string
  coordRole: string
  coordinators: { name: string; email: string; phone: string; role: string }[]
  hasTime: boolean
  time: string
}

export default function EditEventPage() {
  const { user, isLoading } = useAuth()
  const { events, updateEvent, deleteEvent } = useEvents()
  const router = useRouter()
  const params = useParams()

  const event = events.find(e => e.id === params.id)

  const [form, setForm] = useState({
    title: "",
    date: "",
    hasTime: false,
    time: "",
    venue: "",
    seats: 100,
    category: "Technical" as "Technical" | "Cultural" | "Sports" | "Workshop",
    isInter: true,
    price: 0,
    description: "",
    collegeDomain: "",
    organizerPhone: "",
    showPrizePool: false,
    prizePool: "",
    registrationDeadline: "",
    registrationOpen: true,
    rules: [""],
  })

  const [subEvents, setSubEvents] = useState<SubEventForm[]>([])
  const [saving, setSaving] = useState(false)
  const [posterBase64, setPosterBase64] = useState<string | undefined>(undefined)
  const [posterPreview, setPosterPreview] = useState<string | undefined>(undefined)
  const [activeSection, setActiveSection] = useState<"details" | "rules" | "subevents" | "links" | "settings">("details")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState(false)
  const [importantLinks, setImportantLinks] = useState<{ id: string; label: string; url: string }[]>([])
  // Per-sub-event autocomplete results for in-charge search
  const [inchargeResults, setInchargeResults] = useState<{ [key: number]: { email: string; name: string }[] }>({})
  // Event-level Staff
  const [staffList, setStaffList] = useState<{ name: string; email: string }[]>([])
  const [staffSearch, setStaffSearch] = useState("")
  const [staffResults, setStaffResults] = useState<{ name: string; email: string }[]>([])
  // Venue map coordinates
  const [venueLat, setVenueLat] = useState<number | undefined>(undefined)
  const [venueLng, setVenueLng] = useState<number | undefined>(undefined)

  const addLink = () => setImportantLinks(prev => [...prev, { id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: "", url: "" }])
  const updateLink = (idx: number, key: "label" | "url", val: string) =>
    setImportantLinks(prev => prev.map((l, i) => i === idx ? { ...l, [key]: val } : l))
  const removeLink = (idx: number) => setImportantLinks(prev => prev.filter((_, i) => i !== idx))

  // Compress an image file via canvas and return it as base64
  const compressImage = (file: File, maxW = 1200, quality = 0.82): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width)
          const canvas = document.createElement("canvas")
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext("2d")
          if (!ctx) { reject(new Error("Canvas unavailable")); return }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL("image/jpeg", quality))
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file)
      setPosterBase64(compressed)
      setPosterPreview(compressed)
    } catch (err) {
      console.error("Poster compression failed:", err)
    }
  }

  // Pre-populate form when event data loads
  useEffect(() => {
    if (event) {
      // Restore existing poster
      if (event.poster_base64) {
        setPosterBase64(event.poster_base64)
        setPosterPreview(event.poster_base64)
      }
      setForm({
        title: event.title,
        date: event.date,
        hasTime: event.hasTime ?? false,
        time: event.time ?? "",
        venue: event.venue,
        seats: event.seats,
        category: event.category,
        isInter: event.isInter,
        price: event.price,
        description: event.description,
        collegeDomain: event.collegeDomain || "",
        organizerPhone: (event.organizerPhone || "").replace(/^\+?91[\s-]?/, "").replace(/\D/g, "").slice(0, 10),
        showPrizePool: !!(event.prizePool && event.prizePool.trim()),
        prizePool: event.prizePool || "",
        registrationDeadline: event.registrationDeadline || "",
        registrationOpen: event.registrationOpen,
        rules: event.rules.length > 0 ? event.rules : [""],
      })

      setSubEvents(event.subEvents.map((se: any) => {
        // showPrize is STRICTLY off by default. It only turns on if the host
        // explicitly toggled it on in a previous save (se.showPrize === true).
        // No fallback logic — prevents the bug of auto-enabling for legacy events.
        return {
          id: se.id,
          name: se.name,
          description: se.description,
          type: se.type,
          maxParticipants: se.maxParticipants,
          minTeamSize: se.minTeamSize || 2,
          maxTeamSize: se.maxTeamSize || 4,
          rules: se.rules.length > 0 ? se.rules : [""],
          showPrize: se.showPrize === true,
          prizeFirst: se.prize?.first || "",
          prizeSecond: se.prize?.second || "",
          prizeThird: se.prize?.third || "",
          coordRole: "Head Coordinator",
          inchargeSearch: "",
          coordinators: se.coordinators || [],
          hasTime: se.hasTime ?? false,
          time: se.time ?? "",
        }
      }))

      setImportantLinks((event.importantLinks || []).map(l => ({
        id: l.id,
        label: l.label,
        url: l.url,
      })))

      // Load existing event-level staff
      const existingStaff = (event.eventCoordinators || [])
        .filter((c: any) => c.role === "Staff")
        .map((c: any) => ({ name: c.name || c.email.split('@')[0], email: c.email }))
      setStaffList(existingStaff)

      // Load existing venue coordinates
      if (event.venueLat !== undefined) setVenueLat(event.venueLat)
      if (event.venueLng !== undefined) setVenueLng(event.venueLng)
    }
  }, [event])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
    </div>
  )
  if (!user) { router.push("/login"); return null }
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-faint)] font-mono">Event not found</p>
      </div>
    )
  }
  if (user.email !== event.organizerEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-[var(--color-text-faint)] font-mono">Only the host can edit this event.</p>
        <Link href={`/events/${event.id}`}>
          <Button variant="outline" className="border-[var(--color-border)] text-[var(--color-text)]">Back to Event</Button>
        </Link>
      </div>
    )
  }

  const update = (key: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const updateRule = (idx: number, val: string) => {
    setForm((prev) => ({ ...prev, rules: prev.rules.map((r, i) => i === idx ? val : r) }))
  }
  const addRule = () => setForm((prev) => ({ ...prev, rules: [...prev.rules, ""] }))
  const removeRule = (idx: number) => {
    if (form.rules.length > 1) setForm((prev) => ({ ...prev, rules: prev.rules.filter((_, i) => i !== idx) }))
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

  // In-charges: search friends by name or email, then add
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
      if (se.coordinators.some(c => c.email === friend.email)) return { ...se, inchargeSearch: "" }
      return {
        ...se,
        coordinators: [...se.coordinators, { name: friend.name, email: friend.email, phone: "", role: se.coordRole }],
        inchargeSearch: "",
      }
    }))
    setInchargeResults(prev => ({ ...prev, [seIdx]: [] }))
  }
  const removeSubCoordinator = (seIdx: number, cIdx: number) => {
    setSubEvents((prev) => prev.map((se, i) => i === seIdx ? { ...se, coordinators: se.coordinators.filter((_, j) => j !== cIdx) } : se))
  }

  const emptySubEvent = (): SubEventForm => ({
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "", description: "", type: "solo", maxParticipants: 50,
    minTeamSize: 2, maxTeamSize: 4,
    rules: [""], showPrize: false, prizeFirst: "", prizeSecond: "", prizeThird: "",
    inchargeSearch: "", coordRole: "Head Coordinator",
    coordinators: [],
    hasTime: false, time: "",
  })

  const addSubEvent = () => setSubEvents((prev) => [...prev, emptySubEvent()])
  const removeSubEvent = (idx: number) => {
    if (subEvents.length > 0) {
      const se = subEvents[idx]
      const hasRegistrations = event.registrations.some(r => r.subEventId === se.id)
      if (hasRegistrations) {
        setShowDeleteConfirm(se.id)
        return
      }
      setSubEvents((prev) => prev.filter((_, i) => i !== idx))
    }
  }

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const updates: Partial<MainEvent> = {
      title: form.title,
      date: form.date,
      hasTime: form.hasTime,
      time: form.hasTime ? form.time : "",
      venue: form.venue,
      seats: form.seats,
      category: form.category,
      isInter: form.isInter,
      price: form.price,
      description: form.description,
      collegeDomain: form.isInter ? "" : form.collegeDomain,
      organizerPhone: form.organizerPhone,
      prizePool: form.showPrizePool ? form.prizePool : "",
      registrationDeadline: form.registrationDeadline,
      registrationOpen: form.registrationOpen,
      rules: form.rules.filter(r => r.trim()),
      subEvents: subEvents.filter((se) => se.name).map((se) => {
        const sub: any = {
          id: se.id,
          name: se.name,
          description: se.description,
          type: se.type,
          maxParticipants: se.maxParticipants,
          rules: se.rules.filter(r => r.trim()),
          showPrize: se.showPrize,
          prize: se.showPrize
            ? { first: se.prizeFirst || "", second: se.prizeSecond || "", ...(se.prizeThird ? { third: se.prizeThird } : {}) }
            : null,
          coordinators: se.coordinators,
          hasTime: se.hasTime,
          time: se.hasTime ? se.time : "",
        }
        if (se.type === "team") {
          sub.minTeamSize = se.minTeamSize
          sub.maxTeamSize = se.maxTeamSize
        }
        return sub
      }),
      poster_base64: posterBase64,
      importantLinks: importantLinks.filter(l => l.label.trim() && l.url.trim()).map(l => ({
        id: l.id,
        label: l.label,
        url: l.url,
      })),
      // Persist event-level staff (non-Staff coordinators are preserved from the original)
      eventCoordinators: [
        ...(event.eventCoordinators || []).filter((c: any) => c.role !== "Staff"),
        ...staffList.map(s => ({ name: s.name, email: s.email, phone: "", role: "Staff" })),
      ],
      ...(venueLat !== undefined && venueLng !== undefined ? { venueLat, venueLng } : {}),
    }

    try {
      await updateEvent(event.id, updates)
      // Navigate back to event page so changes are visible immediately
      router.push(`/events/${event.id}`)
    } catch (err) {
      console.error("Failed to update event:", err)
      setSaving(false)
    }
  }

  const handleDeleteEvent = async () => {
    setDeletingEvent(true)
    try {
      await deleteEvent(event.id)
      router.push("/events")
    } catch (err) {
      console.error("Failed to delete event:", err)
      setDeletingEvent(false)
    }
  }

  const inputCls = "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] h-10 text-sm"
  const labelCls = "text-[10px] font-mono text-[var(--color-text-faint)] mb-1 block tracking-widest uppercase"

  const sections = [
    { id: "details" as const, label: "Event Details", icon: Info },
    { id: "rules" as const, label: "Rules", icon: CalendarDays },
    { id: "subevents" as const, label: "Sub-Events", icon: Trophy },
    { id: "links" as const, label: "Links", icon: LinkIcon },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ]

  return (
    <div className="pb-16 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div variants={pageItem} className="mb-3">
        <Link href={`/events/${event.id}`} className="flex items-center gap-2 text-[var(--color-text-faint)] hover:text-[var(--color-text)] text-sm transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Event
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <MicroLabel>Edit Event</MicroLabel>
            <h1 className="text-3xl font-light tracking-tight">Edit {event.title}</h1>
          </div>
        </div>
      </motion.div>

      {/* Section Tabs */}
      <motion.div variants={pageItem} className="flex gap-1 mb-8 border-b border-[var(--color-border)] overflow-x-auto pb-px">
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium transition-all relative whitespace-nowrap ${activeSection === sec.id ? "text-[var(--color-text)]" : "text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]"}`}
          >
            <sec.icon className="w-4 h-4" />
            {sec.label}
            {activeSection === sec.id && <motion.div layoutId="editTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
        ))}
      </motion.div>

      <motion.div variants={pageItem}>
        <form onSubmit={handleSave} className="space-y-8">

          {/* ═══ EVENT DETAILS ═══ */}
          {activeSection === "details" && (
            <GlassCard className="p-6 space-y-5">
              <MicroLabel className="mb-0">01 — Event Details</MicroLabel>
              {/* Event Poster */}
              <div>
                <label className={labelCls}><ImageIcon className="w-3 h-3 inline mr-1" />Event Poster <span className="text-[var(--color-text-faint)]">(optional)</span></label>
                <div className="flex gap-4 items-start">
                  {posterPreview ? (
                    <div className="relative w-24 h-24 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={posterPreview} alt="Event poster preview" className="w-24 h-24 object-cover rounded-md border border-[var(--color-border)]" />
                      <button
                        type="button"
                        onClick={() => { setPosterBase64(undefined); setPosterPreview(undefined) }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black/80 border border-[var(--color-border)] rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                        aria-label="Remove poster"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 shrink-0 border border-dashed border-[var(--color-border)] rounded-md flex flex-col items-center justify-center text-[var(--color-text-faint)] bg-[var(--color-surface-2)]">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[9px] font-mono">No poster</span>
                    </div>
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center h-24 border border-dashed border-[var(--color-border)] rounded-md cursor-pointer hover:border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors bg-[var(--color-surface-2)]">
                    <Upload className="w-4 h-4 text-[var(--color-text-faint)] mb-1" />
                    <span className="text-[10px] font-mono text-[var(--color-text-faint)]">Click to {posterPreview ? "change" : "upload"}</span>
                    <span className="text-[9px] font-mono text-[var(--color-text-faint)] mt-0.5">JPG, PNG, WebP</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handlePosterChange} />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Event Title</label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="TechFest '26" className={`${inputCls} h-11`} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Event Date</label><NativeDateInput value={form.date} onChange={(e) => update("date", e.target.value)} className="h-11" required /></div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelCls}>Event Time <span className="text-[var(--color-text-faint)]">(optional)</span></label>
                    <button
                      type="button"
                      onClick={() => update("hasTime", !form.hasTime)}
                      aria-label={form.hasTime ? "Disable event time" : "Enable event time"}
                      className={`relative w-9 h-5 rounded-full transition-colors ${form.hasTime ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-3)]"}`}
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
                    <div className="h-11 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-3 flex items-center">
                      <span className="text-xs text-[var(--color-text-faint)] font-mono">Toggle to add event time</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Venue</label><Input value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Main Auditorium" className={`${inputCls} h-11`} required /></div>
                <div><label className={labelCls}>Registration Deadline</label><NativeDateInput value={form.registrationDeadline} onChange={(e) => update("registrationDeadline", e.target.value)} className="h-11" /></div>
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
                <div><label className={labelCls}>Price (₹)</label><Input type="number" value={form.price} onChange={(e) => update("price", parseInt(e.target.value) || 0)} className={`${inputCls} h-11`} /></div>
                <div><label className={labelCls}>Category</label>
                  <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full h-11 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 text-sm">
                    <option value="Technical">Technical</option><option value="Cultural">Cultural</option><option value="Sports">Sports</option><option value="Workshop">Workshop</option>
                  </select>
                </div>
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
                    <span className="flex items-center px-3 bg-[var(--color-surface-3)] border border-r-0 border-[var(--color-border)] rounded-l-md text-sm text-[var(--color-text-muted)] font-mono shrink-0 select-none">+91</span>
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
                      className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-r-md px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-border)] font-mono"
                    />
                  </div>
                  {form.organizerPhone.length > 0 && form.organizerPhone.length < 10 && (
                    <p className="text-[10px] text-red-400/70 mt-1">{10 - form.organizerPhone.length} more digits required</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelCls}><Trophy className="w-3 h-3 inline mr-1" />Total Prize Pool</label>
                    <button
                      type="button"
                      onClick={() => update("showPrizePool", !form.showPrizePool)}
                      aria-label={form.showPrizePool ? "Disable prize pool" : "Enable prize pool"}
                      className={`relative w-9 h-5 rounded-full transition-colors ${form.showPrizePool ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-3)]"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.showPrizePool ? "left-4" : "left-0.5"}`} />
                    </button>
                  </div>
                  {form.showPrizePool ? (
                    <Input value={form.prizePool} onChange={(e) => update("prizePool", e.target.value)} placeholder="₹1,50,000" className={`${inputCls} h-11`} />
                  ) : (
                    <div className="h-11 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-3 flex items-center">
                      <span className="text-xs text-[var(--color-text-faint)] font-mono">Toggle to add prize pool</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Event Scope */}
              <div><label className={labelCls}>Event Scope</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => update("isInter", true)} className={`flex-1 py-2.5 px-4 rounded-md text-sm transition-colors border ${form.isInter ? "bg-white text-black border-[var(--color-border-focus)]" : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)]"}`}>Inter-College (Open)</button>
                  <button type="button" onClick={() => update("isInter", false)} className={`flex-1 py-2.5 px-4 rounded-md text-sm transition-colors border ${!form.isInter ? "bg-white text-black border-[var(--color-border-focus)]" : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)]"}`}>Intra-College (Restricted)</button>
                </div>
              </div>
              {!form.isInter && (
                <div><label className={labelCls}>College Email Domain</label>
                  <Input value={form.collegeDomain} onChange={(e) => update("collegeDomain", e.target.value)} placeholder="srmist.edu.in" className={`${inputCls} h-11`} />
                  <p className="text-[10px] text-[var(--color-text-faint)] mt-1">Only users with verified @{form.collegeDomain || "domain"} email can register</p>
                </div>
              )}

              {/* Event-level Staff */}
              <div className="space-y-2 pt-1 border-t border-white/[0.05]">
                <div>
                  <span className={labelCls}><Users className="w-3 h-3 inline mr-1" />Staff</span>
                  <p className="text-[10px] text-white/30 mb-2">Staff can view all event data but cannot make changes. CSV export allowed.</p>
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
                        <button key={f.email} type="button" onClick={() => addStaff(f)} className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/[0.08] flex items-center gap-2">
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
          )}


          {/* ═══ RULES ═══ */}
          {activeSection === "rules" && (
            <GlassCard className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <MicroLabel className="mb-0">02 — Event Rules</MicroLabel>
                <button type="button" onClick={addRule} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"><PlusCircle className="w-3 h-3" /> Add Rule</button>
              </div>
              {form.rules.map((rule, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-[10px] font-mono text-[var(--color-text-faint)] w-6 shrink-0">{idx + 1}.</span>
                  <Input value={rule} onChange={(e) => updateRule(idx, e.target.value)} placeholder="Enter a rule..." className={`${inputCls} flex-1`} />
                  {form.rules.length > 1 && (
                    <button type="button" onClick={() => removeRule(idx)} className="text-[var(--color-text-faint)] hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                  )}
                </div>
              ))}
            </GlassCard>
          )}

          {/* ═══ SUB EVENTS ═══ */}
          {activeSection === "subevents" && (
            <GlassCard className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <MicroLabel className="mb-0">03 — Sub-Events</MicroLabel>
                <button type="button" onClick={addSubEvent} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"><PlusCircle className="w-4 h-4" /> Add Sub-Event</button>
              </div>

              {subEvents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-faint)] text-sm font-mono mb-4">No sub-events yet</p>
                  <Button type="button" onClick={addSubEvent} variant="outline" className="border-[var(--color-border)] text-[var(--color-text-muted)]">
                    <PlusCircle className="w-4 h-4 mr-2" /> Add First Sub-Event
                  </Button>
                </div>
              )}

              {subEvents.map((se, idx) => {
                const regCount = event.registrations.filter(r => r.subEventId === se.id).length

                return (
                  <div key={se.id} className="p-4 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase">Sub-Event {idx + 1}</p>
                        {regCount > 0 && (
                          <span className="text-[9px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            {regCount} registration{regCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <button type="button" onClick={() => removeSubEvent(idx)} className="text-[var(--color-text-faint)] hover:text-red-400 transition-colors p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Warning if deleting sub-event with registrations */}
                    {showDeleteConfirm === se.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-red-500/10 border border-red-500/20 rounded-md p-4"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-red-400 font-medium mb-1">This sub-event has {regCount} registration(s)</p>
                            <p className="text-xs text-red-400/60 mb-3">Removing it will leave those registrations orphaned. This action cannot be undone.</p>
                            <div className="flex gap-2">
                              <Button type="button" onClick={() => {
                                setSubEvents(prev => prev.filter((_, i) => i !== idx))
                                setShowDeleteConfirm(null)
                              }} className="bg-red-500 text-[var(--color-text)] text-xs h-7 px-3 hover:bg-red-600">Remove Anyway</Button>
                              <Button type="button" onClick={() => setShowDeleteConfirm(null)} variant="ghost" className="text-[var(--color-text-muted)] text-xs h-7 px-3 border border-[var(--color-border)]">Cancel</Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><label className={labelCls}>Name</label><Input value={se.name} onChange={(e) => updateSubEvent(idx, "name", e.target.value)} placeholder="Hackathon" className={inputCls} required /></div>
                      <div><label className={labelCls}>Max Participants</label><Input type="number" value={se.maxParticipants} onChange={(e) => updateSubEvent(idx, "maxParticipants", parseInt(e.target.value) || 0)} className={inputCls} /></div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className={labelCls}>Time <span className="text-[var(--color-text-faint)]">(opt.)</span></label>
                          <button
                            type="button"
                            onClick={() => updateSubEvent(idx, "hasTime", !se.hasTime)}
                            aria-label={se.hasTime ? "Disable sub-event time" : "Enable sub-event time"}
                            className={`relative w-9 h-5 rounded-full transition-colors ${se.hasTime ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-3)]"}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${se.hasTime ? "left-4" : "left-0.5"}`} />
                          </button>
                        </div>
                        {se.hasTime ? (
                          <TimeInput
                            value={se.time}
                            onChange={(val) => updateSubEvent(idx, "time", val)}
                            className="w-full !h-10"
                          />
                        ) : (
                          <div className="h-10 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-3 flex items-center">
                            <span className="text-xs text-[var(--color-text-faint)] font-mono">Toggle to add</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div><label className={labelCls}>Description</label>
                      <RichTextEditor
                        value={se.description}
                        onChange={(val) => updateSubEvent(idx, "description", val)}
                        placeholder="Brief description of this sub-event..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className={`flex-1 py-2 rounded-md text-xs text-center border cursor-not-allowed select-none ${se.type === "solo" ? "bg-[var(--color-surface-3)] text-[var(--color-text)] border-[var(--color-border-focus)]" : "bg-[var(--color-surface-2)] text-[var(--color-text-faint)] border-[var(--color-border)]"}`}>Solo</div>
                      <div className={`flex-1 py-2 rounded-md text-xs text-center border cursor-not-allowed select-none ${se.type === "team" ? "bg-[var(--color-surface-3)] text-[var(--color-text)] border-[var(--color-border-focus)]" : "bg-[var(--color-surface-2)] text-[var(--color-text-faint)] border-[var(--color-border)]"}`}>Team</div>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-faint)] font-mono mt-1.5">🔒 Participation type is locked and cannot be changed after creation.</p>

                    {se.type === "team" && (
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <div>
                          <label className={labelCls}>Min Team Size</label>
                          <Input type="number" min={1} value={se.minTeamSize} onChange={(e) => updateSubEvent(idx, "minTeamSize", Math.max(1, parseInt(e.target.value) || 1))} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Max Team Size</label>
                          <Input type="number" min={2} value={se.maxTeamSize} onChange={(e) => updateSubEvent(idx, "maxTeamSize", parseInt(e.target.value) || 4)} className={inputCls} />
                        </div>
                      </div>
                    )}

                    {/* Sub-Event Rules */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={labelCls}>Rules</span>
                        <button type="button" onClick={() => addSubRule(idx)} className="text-[10px] text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors"><PlusCircle className="w-3 h-3 inline mr-0.5" /> Add</button>
                      </div>
                      {se.rules.map((rule, rIdx) => (
                        <div key={rIdx} className="flex gap-2 items-center">
                          <span className="text-[9px] font-mono text-[var(--color-text-faint)] w-4">{rIdx + 1}.</span>
                          <Input value={rule} onChange={(e) => updateSubRule(idx, rIdx, e.target.value)} placeholder="Rule..." className={`${inputCls} flex-1 h-8 text-xs`} />
                          {se.rules.length > 1 && <button type="button" onClick={() => removeSubRule(idx, rIdx)} className="text-[var(--color-text-faint)] hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>}
                        </div>
                      ))}
                    </div>

                    {/* Sub-Event Prizes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={labelCls}><Trophy className="w-3 h-3 inline mr-1" />Prize Money</span>
                        <button
                          type="button"
                          onClick={() => updateSubEvent(idx, "showPrize", !se.showPrize)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${se.showPrize ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-3)]"}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${se.showPrize ? "left-4" : "left-0.5"}`} />
                        </button>
                      </div>
                      {se.showPrize && (
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          <div>
                            <span className="text-[9px] font-mono text-[var(--color-text-faint)] flex items-center gap-1"><Trophy className="w-2.5 h-2.5" /> 1st Prize</span>
                            <Input value={se.prizeFirst} onChange={(e) => updateSubEvent(idx, "prizeFirst", e.target.value)} placeholder="₹50,000" className={`${inputCls} h-8 text-xs mt-1`} />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-[var(--color-text-faint)] flex items-center gap-1"><Trophy className="w-2.5 h-2.5 text-gray-400" /> 2nd Prize</span>
                            <Input value={se.prizeSecond} onChange={(e) => updateSubEvent(idx, "prizeSecond", e.target.value)} placeholder="₹25,000" className={`${inputCls} h-8 text-xs mt-1`} />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-[var(--color-text-faint)] flex items-center gap-1"><Trophy className="w-2.5 h-2.5 text-amber-700" /> 3rd Prize</span>
                            <Input value={se.prizeThird} onChange={(e) => updateSubEvent(idx, "prizeThird", e.target.value)} placeholder="₹10,000" className={`${inputCls} h-8 text-xs mt-1`} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sub-Event In-charges (friend search autocomplete) */}
                    <div className="space-y-2">
                      <span className={labelCls}><Users className="w-3 h-3 inline mr-1" />In-charges</span>
                      {/* Already-added in-charges */}
                      {se.coordinators.map((c, cIdx) => (
                        <div key={cIdx} className="flex items-center justify-between p-2 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs">
                          <div>
                            <span className="text-[var(--color-text-muted)]">{c.name || c.email}</span>
                            <span className="text-[var(--color-text-faint)] ml-2">{c.email}</span>
                            <span className="ml-2 text-[9px] font-mono text-[var(--color-text-faint)]">{c.role}</span>
                          </div>
                          <button type="button" onClick={() => removeSubCoordinator(idx, cIdx)} className="text-[var(--color-text-faint)] hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                      {/* Search + role row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Search friends */}
                        <div className="relative sm:col-span-2">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-faint)]" />
                          <Input
                            value={se.inchargeSearch}
                            onChange={(e) => handleInchargeSearch(idx, e.target.value)}
                            placeholder="Search friends by name or email…"
                            className={`${inputCls} h-8 text-xs pl-8`}
                          />
                          {/* Autocomplete dropdown */}
                          {(inchargeResults[idx] || []).length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] shadow-lg border border-[var(--color-border-muted)] rounded-md z-20 overflow-hidden">
                              {(inchargeResults[idx] || []).map((f) => (
                                <button
                                  key={f.email}
                                  type="button"
                                  onClick={() => addIncharge(idx, f)}
                                  className="w-full text-left px-3 py-2 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] transition-colors flex items-center gap-2"
                                >
                                  <div className="w-5 h-5 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[9px] font-bold">{f.email[0].toUpperCase()}</div>
                                  <span>{f.email}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {se.inchargeSearch && (inchargeResults[idx] || []).length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] shadow-lg border border-[var(--color-border-muted)] rounded-md z-20 px-3 py-2">
                              <p className="text-[10px] text-[var(--color-text-faint)]">No friends found matching “{se.inchargeSearch}”. Add them as friends first.</p>
                            </div>
                          )}
                        </div>
                        {/* Role selector */}
                        <select
                          value={se.coordRole}
                          onChange={(e) => updateSubEvent(idx, "coordRole", e.target.value)}
                          className="h-8 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-xs rounded-md px-2"
                        >
                          <option value="Host">Host</option>
                          <option value="Coordinator">Coordinator</option>
                          <option value="Volunteer">Volunteer</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </GlassCard>
          )}

          {/* ═══ SETTINGS ═══ */}
          {activeSection === "links" && (
            <GlassCard className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <MicroLabel className="mb-0">04 — Important Links</MicroLabel>
                <button type="button" onClick={addLink} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"><PlusCircle className="w-3 h-3" /> Add Link</button>
              </div>
              <p className="text-[10px] text-[var(--color-text-faint)]">Add links to resources participants should see (WhatsApp groups, Google Forms, rule books, etc.)</p>
              {importantLinks.length === 0 ? (
                <button type="button" onClick={addLink} className="w-full py-6 border border-dashed border-[var(--color-border)] rounded-md text-[var(--color-text-faint)] text-sm hover:border-[var(--color-border)] hover:text-[var(--color-text-muted)] transition-colors flex items-center justify-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Add your first link
                </button>
              ) : (
                <div className="space-y-3">
                  {importantLinks.map((link, idx) => (
                    <div key={link.id} className="flex gap-2 items-center">
                      <span className="text-[10px] font-mono text-[var(--color-text-faint)] w-6 shrink-0">{idx + 1}.</span>
                      <Input value={link.label} onChange={(e) => updateLink(idx, "label", e.target.value)} placeholder="Label (e.g. WhatsApp Group)" className={`${inputCls} flex-1`} />
                      <Input value={link.url} onChange={(e) => updateLink(idx, "url", e.target.value)} placeholder="https://..." className={`${inputCls} flex-1`} />
                      <button type="button" onClick={() => removeLink(idx)} className="text-[var(--color-text-faint)] hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              {/* Registration Controls */}
              <GlassCard className="p-6 space-y-5">
                <MicroLabel className="mb-0">Registration Controls</MicroLabel>

                <div className="flex items-center justify-between p-4 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <div>
                    <p className="text-sm font-medium mb-0.5">Registration Status</p>
                    <p className="text-[10px] font-mono text-[var(--color-text-faint)]">Toggle whether new participants can register for this event</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => update("registrationOpen", !form.registrationOpen)}
                    className="flex items-center gap-2"
                  >
                    {form.registrationOpen ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--color-success)] tracking-widest uppercase">Open</span>
                        <ToggleRight className="w-8 h-8 text-[var(--color-success)]" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-red-400 tracking-widest uppercase">Closed</span>
                        <ToggleLeft className="w-8 h-8 text-red-400" />
                      </div>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium mb-0.5">Registration Deadline</p>
                      <p className="text-[10px] font-mono text-[var(--color-text-faint)]">Auto-close registration after this date</p>
                    </div>
                  </div>
                  <Input type="date" value={form.registrationDeadline} onChange={(e) => update("registrationDeadline", e.target.value)} className={`${inputCls} h-11 max-w-xs`} />
                </div>
              </GlassCard>

              {/* Event Stats Summary */}
              <GlassCard className="p-6">
                <MicroLabel className="mb-4">Event Stats</MicroLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center">
                    <p className="text-2xl font-light text-[var(--color-text)]">{event.registrations.filter(r => r.status !== "DRAFT").length}</p>
                    <p className="text-[9px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase mt-1">Registered</p>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center">
                    <p className="text-2xl font-light text-[var(--color-success)]">{event.registrations.filter(r => r.status === "PAID").length}</p>
                    <p className="text-[9px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase mt-1">Paid</p>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center">
                    <p className="text-2xl font-light text-yellow-400">{event.registrations.filter(r => r.status === "PENDING").length}</p>
                    <p className="text-[9px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase mt-1">Pending</p>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center">
                    <p className="text-2xl font-light text-[var(--color-text)]">{event.registrations.filter(r => r.status !== "DRAFT" && r.checkedIn).length}</p>
                    <p className="text-[9px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase mt-1">Checked In</p>
                  </div>
                </div>
              </GlassCard>

              {/* Danger Zone */}
              <GlassCard className="p-6 border-red-500/10">
                <MicroLabel className="mb-0 text-red-400/60">Danger Zone</MicroLabel>
                <p className="text-xs text-[var(--color-text-faint)] mt-1 mb-4">These actions are permanent and cannot be undone.</p>

                <div className="flex items-center justify-between p-4 rounded-md bg-red-500/5 border border-red-500/10">
                  <div>
                    <p className="text-sm font-medium text-red-400/80 mb-0.5">Close Registration Permanently</p>
                    <p className="text-[10px] font-mono text-[var(--color-text-faint)]">Close registration and prevent it from being reopened</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      update("registrationOpen", false)
                    }}
                    variant="ghost"
                    className="border border-red-500/30 text-red-400 text-[10px] font-mono tracking-widest uppercase hover:bg-red-500/10 h-8 px-4"
                  >
                    Close
                  </Button>
                </div>
              </GlassCard>
            </div>
          )}

          {/* ─── Save Button ─── */}
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="flex-1 bg-white text-black hover:bg-[#B388FF] font-medium h-12 text-base disabled:opacity-50">
              {saving ? (
                <span className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </Button>
            <Link href={`/events/${event.id}`} className="shrink-0">
              <Button type="button" variant="outline" className="h-12 px-6 border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)]">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
