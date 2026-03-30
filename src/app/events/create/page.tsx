"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEvents, MainEvent, SubEvent, ImportantLink } from "@/lib/events-context"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion } from "framer-motion"
import { PlusCircle, X, ArrowLeft, Trophy, Phone, LinkIcon } from "lucide-react"
import Link from "next/link"

interface SubEventForm {
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

export default function CreateEventPage() {
  const { user } = useAuth()
  const { addEvent } = useEvents()
  const router = useRouter()

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
    rules: [""],
  })

  const emptySubEvent = (): SubEventForm => ({
    name: "", description: "", type: "solo", maxParticipants: 50,
    minTeamSize: 2, maxTeamSize: 4,
    rules: [""], prizeFirst: "", prizeSecond: "", prizeThird: "",
    coordName: "", coordEmail: "", coordPhone: "", coordRole: "Head Coordinator",
    coordinators: [],
  })

  const [subEvents, setSubEvents] = useState<SubEventForm[]>([emptySubEvent()])
  const [importantLinks, setImportantLinks] = useState<{ label: string; url: string }[]>([])

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

  const addSubEvent = () => setSubEvents((prev) => [...prev, emptySubEvent()])
  const removeSubEvent = (idx: number) => {
    if (subEvents.length > 1) setSubEvents((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

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
      venue: form.venue,
      seats: form.seats,
      registeredCount: 0,
      category: form.category,
      isInter: form.isInter,
      price: form.price,
      description: form.description,
      rules: form.rules.filter(r => r.trim()),
      prizePool: form.prizePool,
      collegeDomain: form.isInter ? "" : form.collegeDomain,
      registrationOpen: true,
      registrationDeadline: form.registrationDeadline || "",
      subEvents: subEvents.filter((se) => se.name).map((se, i) => {
        const sub: SubEvent = {
          id: `sub-${Date.now()}-${i}`,
          name: se.name,
          description: se.description,
          type: se.type,
          maxParticipants: se.maxParticipants,
          rules: se.rules.filter(r => r.trim()),
          prize: { first: se.prizeFirst || "TBD", second: se.prizeSecond || "TBD", ...(se.prizeThird ? { third: se.prizeThird } : {}) },
          coordinators: se.coordinators,
        }
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
    }

    try {
      await addEvent(newEvent)
      router.push(`/events/${newEvent.id}`)
    } catch (err) {
      console.error("Failed to publish event:", err)
    }
  }

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  if (!user) return null

  const inputCls = "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-10 text-sm"
  const labelCls = "text-[10px] font-mono text-white/40 mb-1 block tracking-widest uppercase"

  return (
    <div className="pb-16 px-4 max-w-3xl mx-auto">
      <motion.div variants={pageItem}>
        <MicroLabel>New Event</MicroLabel>
        <h1 className="text-3xl font-light tracking-tight mb-8">Host your event.</h1>
      </motion.div>

      <motion.div variants={pageItem}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
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
                      <button type="button" onClick={() => removeSubCoordinator(idx, cIdx)} className="text-white/20 hover:text-red-400"><X className="w-3 h-3" /></button>
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

          <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 font-medium h-12 text-base">
            Publish Event
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
