"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEvents, MainEvent, SubEvent, ImportantLink } from "@/lib/events-context"
import { useRouter, useParams } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { pageItem } from "@/components/animation/PageTransition"
import { motion } from "framer-motion"
import {
  PlusCircle, X, ArrowLeft, Trophy, Phone, Save, AlertTriangle,
  Trash2, ToggleLeft, ToggleRight, Settings, CalendarDays, Info, LinkIcon
} from "lucide-react"
import Link from "next/link"

interface SubEventForm {
  id: string
  name: string
  description: string
  type: "solo" | "team"
  maxParticipants: number
  minTeamSize: number
  maxTeamSize: number
  rules: string[]
  prizeFirst: string
  prizeSecond: string
  prizeThird: string
  coordName: string
  coordEmail: string
  coordPhone: string
  coordRole: string
  coordinators: { name: string; email: string; phone: string; role: string }[]
}

export default function EditEventPage() {
  const { user } = useAuth()
  const { events, updateEvent } = useEvents()
  const router = useRouter()
  const params = useParams()

  const event = events.find(e => e.id === params.id)

  const [form, setForm] = useState({
    title: "",
    date: "",
    venue: "",
    seats: 100,
    category: "Technical" as "Technical" | "Cultural" | "Sports" | "Workshop",
    isInter: true,
    price: 0,
    description: "",
    collegeDomain: "",
    organizerPhone: "",
    prizePool: "",
    registrationDeadline: "",
    registrationOpen: true,
    rules: [""],
  })

  const [subEvents, setSubEvents] = useState<SubEventForm[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<"details" | "rules" | "subevents" | "links" | "settings">("details")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [importantLinks, setImportantLinks] = useState<{ id: string; label: string; url: string }[]>([])

  const addLink = () => setImportantLinks(prev => [...prev, { id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: "", url: "" }])
  const updateLink = (idx: number, key: "label" | "url", val: string) =>
    setImportantLinks(prev => prev.map((l, i) => i === idx ? { ...l, [key]: val } : l))
  const removeLink = (idx: number) => setImportantLinks(prev => prev.filter((_, i) => i !== idx))

  // Pre-populate form when event data loads
  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        date: event.date,
        venue: event.venue,
        seats: event.seats,
        category: event.category,
        isInter: event.isInter,
        price: event.price,
        description: event.description,
        collegeDomain: event.collegeDomain || "",
        organizerPhone: event.organizerPhone || "",
        prizePool: event.prizePool || "",
        registrationDeadline: event.registrationDeadline || "",
        registrationOpen: event.registrationOpen,
        rules: event.rules.length > 0 ? event.rules : [""],
      })

      setSubEvents(event.subEvents.map(se => ({
        id: se.id,
        name: se.name,
        description: se.description,
        type: se.type,
        maxParticipants: se.maxParticipants,
        minTeamSize: se.minTeamSize || 2,
        maxTeamSize: se.maxTeamSize || 4,
        rules: se.rules.length > 0 ? se.rules : [""],
        prizeFirst: se.prize.first || "",
        prizeSecond: se.prize.second || "",
        prizeThird: se.prize.third || "",
        coordName: "",
        coordEmail: "",
        coordPhone: "",
        coordRole: "Head Coordinator",
        coordinators: se.coordinators || [],
      })))

      setImportantLinks((event.importantLinks || []).map(l => ({
        id: l.id,
        label: l.label,
        url: l.url,
      })))
    }
  }, [event])

  if (!user) { router.push("/login"); return null }
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40 font-mono">Event not found</p>
      </div>
    )
  }
  if (user.email !== event.organizerEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-white/40 font-mono">Only the host can edit this event.</p>
        <Link href={`/events/${event.id}`}>
          <Button variant="outline" className="border-white/20 text-white">Back to Event</Button>
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

  const updateSubEvent = (idx: number, key: string, value: string | number) => {
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

  const addSubCoordinator = (seIdx: number) => {
    setSubEvents((prev) => prev.map((se, i) => {
      if (i === seIdx && se.coordName && se.coordEmail) {
        return {
          ...se,
          coordinators: [...se.coordinators, { name: se.coordName, email: se.coordEmail, phone: se.coordPhone, role: se.coordRole }],
          coordName: "", coordEmail: "", coordPhone: "", coordRole: "Logistics",
        }
      }
      return se
    }))
  }
  const removeSubCoordinator = (seIdx: number, cIdx: number) => {
    setSubEvents((prev) => prev.map((se, i) => i === seIdx ? { ...se, coordinators: se.coordinators.filter((_, j) => j !== cIdx) } : se))
  }

  const emptySubEvent = (): SubEventForm => ({
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "", description: "", type: "solo", maxParticipants: 50,
    minTeamSize: 2, maxTeamSize: 4,
    rules: [""], prizeFirst: "", prizeSecond: "", prizeThird: "",
    coordName: "", coordEmail: "", coordPhone: "", coordRole: "Head Coordinator",
    coordinators: [],
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const updates: Partial<MainEvent> = {
      title: form.title,
      date: form.date,
      venue: form.venue,
      seats: form.seats,
      category: form.category,
      isInter: form.isInter,
      price: form.price,
      description: form.description,
      collegeDomain: form.isInter ? "" : form.collegeDomain,
      organizerPhone: form.organizerPhone,
      prizePool: form.prizePool,
      registrationDeadline: form.registrationDeadline,
      registrationOpen: form.registrationOpen,
      rules: form.rules.filter(r => r.trim()),
      subEvents: subEvents.filter((se) => se.name).map((se) => {
        const sub: SubEvent = {
          id: se.id,
          name: se.name,
          description: se.description,
          type: se.type,
          maxParticipants: se.maxParticipants,
          rules: se.rules.filter(r => r.trim()),
          prize: {
            first: se.prizeFirst || "TBD",
            second: se.prizeSecond || "TBD",
            ...(se.prizeThird ? { third: se.prizeThird } : {}),
          },
          coordinators: se.coordinators,
        }
        if (se.type === "team") {
          sub.minTeamSize = se.minTeamSize
          sub.maxTeamSize = se.maxTeamSize
        }
        return sub
      }),
      importantLinks: importantLinks.filter(l => l.label.trim() && l.url.trim()).map(l => ({
        id: l.id,
        label: l.label,
        url: l.url,
      })),
    }

    try {
      await updateEvent(event.id, updates)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error("Failed to update event:", err)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-10 text-sm"
  const labelCls = "text-[10px] font-mono text-white/40 mb-1 block tracking-widest uppercase"

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
        <Link href={`/events/${event.id}`} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Event
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <MicroLabel>Edit Event</MicroLabel>
            <h1 className="text-3xl font-light tracking-tight">Edit {event.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-green-400 text-xs font-mono tracking-widest uppercase flex items-center gap-1"
              >
                ✓ Saved
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Section Tabs */}
      <motion.div variants={pageItem} className="flex gap-1 mb-8 border-b border-white/[0.06] overflow-x-auto pb-px">
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium transition-all relative whitespace-nowrap ${activeSection === sec.id ? "text-white" : "text-white/40 hover:text-white/60"}`}
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
              <div>
                <label className={labelCls}>Event Title</label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="TechFest '26" className={`${inputCls} h-11`} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className={labelCls}>Event Date</label><Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={`${inputCls} h-11`} required /></div>
                <div><label className={labelCls}>Venue</label><Input value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Main Auditorium" className={`${inputCls} h-11`} required /></div>
                <div><label className={labelCls}>Registration Deadline</label><Input type="date" value={form.registrationDeadline} onChange={(e) => update("registrationDeadline", e.target.value)} className={`${inputCls} h-11`} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className={labelCls}>Total Seats</label><Input type="number" value={form.seats} onChange={(e) => update("seats", parseInt(e.target.value) || 0)} className={`${inputCls} h-11`} required /></div>
                <div><label className={labelCls}>Price (₹)</label><Input type="number" value={form.price} onChange={(e) => update("price", parseInt(e.target.value) || 0)} className={`${inputCls} h-11`} /></div>
                <div><label className={labelCls}>Category</label>
                  <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full h-11 bg-white/[0.03] border border-white/[0.08] text-white rounded-md px-3 text-sm">
                    <option value="Technical">Technical</option><option value="Cultural">Cultural</option><option value="Sports">Sports</option><option value="Workshop">Workshop</option>
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Description</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your event..." rows={4} className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 rounded-md px-3 py-3 text-sm resize-none" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}><Phone className="w-3 h-3 inline mr-1" />Organizer Phone</label>
                  <Input value={form.organizerPhone} onChange={(e) => update("organizerPhone", e.target.value)} placeholder="+91 98765 43210" className={`${inputCls} h-11`} />
                </div>
                <div>
                  <label className={labelCls}><Trophy className="w-3 h-3 inline mr-1" />Total Prize Pool</label>
                  <Input value={form.prizePool} onChange={(e) => update("prizePool", e.target.value)} placeholder="₹1,50,000" className={`${inputCls} h-11`} />
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
                <div><label className={labelCls}>College Email Domain</label>
                  <Input value={form.collegeDomain} onChange={(e) => update("collegeDomain", e.target.value)} placeholder="srmist.edu.in" className={`${inputCls} h-11`} />
                  <p className="text-[10px] text-white/30 mt-1">Only users with verified @{form.collegeDomain || "domain"} email can register</p>
                </div>
              )}
            </GlassCard>
          )}

          {/* ═══ RULES ═══ */}
          {activeSection === "rules" && (
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
                    <button type="button" onClick={() => removeRule(idx)} className="text-white/20 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
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
                <button type="button" onClick={addSubEvent} className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"><PlusCircle className="w-4 h-4" /> Add Sub-Event</button>
              </div>

              {subEvents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm font-mono mb-4">No sub-events yet</p>
                  <Button type="button" onClick={addSubEvent} variant="outline" className="border-white/20 text-white/60">
                    <PlusCircle className="w-4 h-4 mr-2" /> Add First Sub-Event
                  </Button>
                </div>
              )}

              {subEvents.map((se, idx) => {
                const regCount = event.registrations.filter(r => r.subEventId === se.id).length

                return (
                  <div key={se.id} className="p-4 rounded-md bg-white/[0.02] border border-white/[0.06] space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Sub-Event {idx + 1}</p>
                        {regCount > 0 && (
                          <span className="text-[9px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            {regCount} registration{regCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <button type="button" onClick={() => removeSubEvent(idx)} className="text-white/20 hover:text-red-400 transition-colors p-1">
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
                              }} className="bg-red-500 text-white text-xs h-7 px-3 hover:bg-red-600">Remove Anyway</Button>
                              <Button type="button" onClick={() => setShowDeleteConfirm(null)} variant="ghost" className="text-white/50 text-xs h-7 px-3 border border-white/10">Cancel</Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className={labelCls}>Name</label><Input value={se.name} onChange={(e) => updateSubEvent(idx, "name", e.target.value)} placeholder="Hackathon" className={inputCls} required /></div>
                      <div><label className={labelCls}>Max Participants</label><Input type="number" value={se.maxParticipants} onChange={(e) => updateSubEvent(idx, "maxParticipants", parseInt(e.target.value) || 0)} className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>Description</label><Input value={se.description} onChange={(e) => updateSubEvent(idx, "description", e.target.value)} placeholder="Brief description" className={inputCls} /></div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => updateSubEvent(idx, "type", "solo")} className={`flex-1 py-2 rounded-md text-xs transition-colors border ${se.type === "solo" ? "bg-white text-black border-white" : "bg-white/[0.03] text-white/50 border-white/[0.08]"}`}>Solo</button>
                      <button type="button" onClick={() => updateSubEvent(idx, "type", "team")} className={`flex-1 py-2 rounded-md text-xs transition-colors border ${se.type === "team" ? "bg-white text-black border-white" : "bg-white/[0.03] text-white/50 border-white/[0.08]"}`}>Team</button>
                    </div>
                    {se.type === "team" && (
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                        <div>
                          <label className={labelCls}>Min Team Size</label>
                          <Input type="number" min={2} value={se.minTeamSize} onChange={(e) => updateSubEvent(idx, "minTeamSize", parseInt(e.target.value) || 2)} className={inputCls} />
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
                        <button type="button" onClick={() => addSubRule(idx)} className="text-[10px] text-white/30 hover:text-white/60 transition-colors"><PlusCircle className="w-3 h-3 inline mr-0.5" /> Add</button>
                      </div>
                      {se.rules.map((rule, rIdx) => (
                        <div key={rIdx} className="flex gap-2 items-center">
                          <span className="text-[9px] font-mono text-white/20 w-4">{rIdx + 1}.</span>
                          <Input value={rule} onChange={(e) => updateSubRule(idx, rIdx, e.target.value)} placeholder="Rule..." className={`${inputCls} flex-1 h-8 text-xs`} />
                          {se.rules.length > 1 && <button type="button" onClick={() => removeSubRule(idx, rIdx)} className="text-white/20 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>}
                        </div>
                      ))}
                    </div>

                    {/* Sub-Event Prizes */}
                    <div>
                      <span className={labelCls}><Trophy className="w-3 h-3 inline mr-1" />Prize Money</span>
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
                    </div>

                    {/* Sub-Event Coordinators */}
                    <div className="space-y-2">
                      <span className={labelCls}><Phone className="w-3 h-3 inline mr-1" />Coordinators</span>
                      {se.coordinators.map((c, cIdx) => (
                        <div key={cIdx} className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.05] text-xs">
                          <div>
                            <span className="text-white/70">{c.name}</span>
                            <span className="text-white/30 ml-2">{c.phone}</span>
                            <span className="ml-2 text-[9px] font-mono text-white/30">{c.role}</span>
                          </div>
                          <button type="button" onClick={() => removeSubCoordinator(idx, cIdx)} className="text-white/20 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Input value={se.coordName} onChange={(e) => updateSubEvent(idx, "coordName", e.target.value)} placeholder="Name" className={`${inputCls} h-8 text-xs`} />
                        <Input value={se.coordEmail} onChange={(e) => updateSubEvent(idx, "coordEmail", e.target.value)} placeholder="Email" className={`${inputCls} h-8 text-xs`} />
                        <Input value={se.coordPhone} onChange={(e) => updateSubEvent(idx, "coordPhone", e.target.value)} placeholder="Phone" className={`${inputCls} h-8 text-xs`} />
                        <div className="flex gap-1">
                          <select value={se.coordRole} onChange={(e) => updateSubEvent(idx, "coordRole", e.target.value)} className="flex-1 h-8 bg-white/[0.03] border border-white/[0.08] text-white text-xs rounded-md px-1">
                            <option value="Head Coordinator">Head</option><option value="Logistics">Logistics</option><option value="Finance">Finance</option><option value="Communications">Comms</option>
                          </select>
                          <Button type="button" onClick={() => addSubCoordinator(idx)} className="bg-white text-black h-8 px-2 text-xs shrink-0">+</Button>
                        </div>
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
                    <div key={link.id} className="flex gap-2 items-center">
                      <span className="text-[10px] font-mono text-white/30 w-6 shrink-0">{idx + 1}.</span>
                      <Input value={link.label} onChange={(e) => updateLink(idx, "label", e.target.value)} placeholder="Label (e.g. WhatsApp Group)" className={`${inputCls} flex-1`} />
                      <Input value={link.url} onChange={(e) => updateLink(idx, "url", e.target.value)} placeholder="https://..." className={`${inputCls} flex-1`} />
                      <button type="button" onClick={() => removeLink(idx)} className="text-white/20 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
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

                <div className="flex items-center justify-between p-4 rounded-md bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <p className="text-sm font-medium mb-0.5">Registration Status</p>
                    <p className="text-[10px] font-mono text-white/30">Toggle whether new participants can register for this event</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => update("registrationOpen", !form.registrationOpen)}
                    className="flex items-center gap-2"
                  >
                    {form.registrationOpen ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-green-400 tracking-widest uppercase">Open</span>
                        <ToggleRight className="w-8 h-8 text-green-400" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-red-400 tracking-widest uppercase">Closed</span>
                        <ToggleLeft className="w-8 h-8 text-red-400" />
                      </div>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-md bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium mb-0.5">Registration Deadline</p>
                      <p className="text-[10px] font-mono text-white/30">Auto-close registration after this date</p>
                    </div>
                  </div>
                  <Input type="date" value={form.registrationDeadline} onChange={(e) => update("registrationDeadline", e.target.value)} className={`${inputCls} h-11 max-w-xs`} />
                </div>
              </GlassCard>

              {/* Event Stats Summary */}
              <GlassCard className="p-6">
                <MicroLabel className="mb-4">Event Stats</MicroLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06] text-center">
                    <p className="text-2xl font-light text-white">{event.registeredCount}</p>
                    <p className="text-[9px] font-mono text-white/30 tracking-widest uppercase mt-1">Registered</p>
                  </div>
                  <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06] text-center">
                    <p className="text-2xl font-light text-green-400">{event.registrations.filter(r => r.status === "PAID").length}</p>
                    <p className="text-[9px] font-mono text-white/30 tracking-widest uppercase mt-1">Paid</p>
                  </div>
                  <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06] text-center">
                    <p className="text-2xl font-light text-yellow-400">{event.registrations.filter(r => r.status === "PENDING").length}</p>
                    <p className="text-[9px] font-mono text-white/30 tracking-widest uppercase mt-1">Pending</p>
                  </div>
                  <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06] text-center">
                    <p className="text-2xl font-light text-white">{event.registrations.filter(r => r.checkedIn).length}</p>
                    <p className="text-[9px] font-mono text-white/30 tracking-widest uppercase mt-1">Checked In</p>
                  </div>
                </div>
              </GlassCard>

              {/* Danger Zone */}
              <GlassCard className="p-6 border-red-500/10">
                <MicroLabel className="mb-0 text-red-400/60">Danger Zone</MicroLabel>
                <p className="text-xs text-white/30 mt-1 mb-4">These actions are permanent and cannot be undone.</p>

                <div className="flex items-center justify-between p-4 rounded-md bg-red-500/5 border border-red-500/10">
                  <div>
                    <p className="text-sm font-medium text-red-400/80 mb-0.5">Close Registration Permanently</p>
                    <p className="text-[10px] font-mono text-white/30">Close registration and prevent it from being reopened</p>
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
            <Button type="submit" disabled={saving} className="flex-1 bg-white text-black hover:bg-white/90 font-medium h-12 text-base disabled:opacity-50">
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
              <Button type="button" variant="outline" className="h-12 px-6 border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
