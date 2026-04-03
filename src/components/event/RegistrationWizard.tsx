"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEvents, SubEvent, MainEvent } from "@/lib/events-context"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronRight, Users, User, X, Plus, Trophy } from "lucide-react"

interface Props {
  event: MainEvent
  onClose: () => void
}

type Step = "select" | "team" | "confirm"

export function RegistrationWizard({ event, onClose }: Props) {
  const { user } = useAuth()
  const { registerForSubEvent } = useEvents()
  const [step, setStep] = useState<Step>("select")
  const [selectedSe, setSelectedSe] = useState<SubEvent | null>(null)
  const [teamName, setTeamName] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (!user) return null

  const alreadyRegistered = (seId: string) =>
    event.registrations.some(r => r.subEventId === seId && r.userEmail === user.email)

  const addMember = () => {
    const email = memberEmail.trim().toLowerCase()
    if (!email || teamMembers.includes(email) || email === user.email) return
    if (selectedSe?.maxTeamSize && teamMembers.length + 1 >= selectedSe.maxTeamSize) return
    setTeamMembers(prev => [...prev, email])
    setMemberEmail("")
  }

  const handleConfirm = async () => {
    if (!selectedSe) return
    setSubmitting(true)
    const reg: any = {
      id: `reg-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      eventId: event.id,
      subEventId: selectedSe.id,
      status: "PENDING",
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      checkedIn: false,
    }
    if (selectedSe.type === "team") {
      reg.teamName = teamName || `${user.name}'s Team`
      reg.teamMembers = [user.email, ...teamMembers]
    }
    try {
      await registerForSubEvent(event.id, selectedSe.id, reg)
      setDone(true)
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const stepIndex = step === "select" ? 0 : step === "team" ? 1 : 2
  const steps = selectedSe?.type === "team"
    ? ["Select Sub-Event", "Team Details", "Confirm"]
    : ["Select Sub-Event", "Confirm"]

  // Done state
  if (done) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <GlassCard className="p-8 max-w-md w-full text-center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">Registered!</h2>
          <p className="text-sm text-white/50 mb-6">You&apos;re in for <span className="text-white">{selectedSe?.name}</span>. Check your dashboard for your QR pass.</p>
          <Button onClick={onClose} className="bg-white text-black hover:bg-white/90 h-10 px-6">Done</Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <GlassCard className="p-0 max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Register for</p>
            <p className="font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 border-b border-white/[0.06] flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono ${i < stepIndex ? "bg-green-500/20 text-green-400" :
                i === stepIndex ? "bg-white text-black" : "bg-white/[0.06] text-white/30"
                }`}>{i < stepIndex ? <Check className="w-3 h-3" /> : i + 1}</div>
              <span className={`text-[10px] font-mono tracking-widest uppercase ${i === stepIndex ? "text-white" : "text-white/30"}`}>{s}</span>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-white/20 mx-1" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* STEP 1: Select Sub-Event */}
          {step === "select" && (
            <div className="space-y-3">
              <p className="text-xs text-white/40 mb-4">Choose the competition you&apos;d like to participate in:</p>
              {event.subEvents.map(se => {
                const regCount = event.registrations.filter(r => r.subEventId === se.id).length
                const isFull = regCount >= se.maxParticipants
                const already = alreadyRegistered(se.id)
                return (
                  <button
                    key={se.id}
                    disabled={isFull || already}
                    onClick={() => { setSelectedSe(se); setStep(se.type === "team" ? "team" : "confirm") }}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${isFull || already ? "border-white/[0.04] bg-white/[0.01] opacity-50 cursor-not-allowed"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 cursor-pointer"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{se.name}</span>
                      <div className="flex items-center gap-2">
                        {se.type === "team" ? <Users className="w-3.5 h-3.5 text-white/40" /> : <User className="w-3.5 h-3.5 text-white/40" />}
                        <span className="text-[10px] font-mono text-white/40">{se.type.toUpperCase()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mb-2 line-clamp-2">{se.description}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="text-white/30">{regCount}/{se.maxParticipants} spots</span>
                      {se.prize.first !== "TBD" && <span className="text-yellow-400/60 flex items-center gap-1"><Trophy className="w-3 h-3" />{se.prize.first}</span>}
                      {already && <span className="text-green-400">Already registered</span>}
                      {isFull && !already && <span className="text-red-400">Full</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* STEP 2: Team Details */}
          {step === "team" && selectedSe && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-mono text-white/40 mb-2 block tracking-widest uppercase">Team Name</label>
                <Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder={`${user.name}'s Team`}
                  className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-10" />
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/40 mb-2 block tracking-widest uppercase">
                  Team Members {selectedSe.minTeamSize && selectedSe.maxTeamSize
                    ? `(${selectedSe.minTeamSize} - ${selectedSe.maxTeamSize} including you)`
                    : ""}
                </label>

                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center"><Check className="w-3 h-3 text-green-400" /></div>
                    <span className="text-white/80">{user.name}</span>
                    <span className="text-[10px] font-mono text-white/30 ml-auto">You (Captain)</span>
                  </div>
                </div>

                {teamMembers.map((email, i) => (
                  <div key={email} className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] mb-2">
                    <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-mono text-white/40">{i + 2}</div>
                    <span className="text-sm text-white/70 flex-1">{email}</span>
                    <button onClick={() => setTeamMembers(prev => prev.filter(e => e !== email))} className="text-white/20 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}

                <div className="flex gap-2 mt-3">
                  <Input value={memberEmail} onChange={e => setMemberEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addMember()}
                    placeholder="teammate@gmail.com"
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-9 flex-1 text-sm" />
                  <Button onClick={addMember} variant="outline" className="h-9 px-3 border-white/20 text-white/60 hover:text-white">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {selectedSe.minTeamSize && (teamMembers.length + 1) < selectedSe.minTeamSize && (
                  <p className="text-[10px] text-yellow-400/80 mt-2 font-mono">Need at least {selectedSe.minTeamSize - teamMembers.length - 1} more member(s)</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep("select")} variant="ghost" className="flex-1 h-10 border border-white/[0.1] text-white/60">Back</Button>
                <Button
                  onClick={() => setStep("confirm")}
                  disabled={!!(selectedSe.minTeamSize && (teamMembers.length + 1) < selectedSe.minTeamSize)}
                  className="flex-1 h-10 bg-white text-black hover:bg-white/90"
                >Continue</Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === "confirm" && selectedSe && (
            <div className="space-y-5">
              <p className="text-xs text-white/40 mb-2">Review your registration:</p>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Event</span><span className="text-white/80">{event.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Sub-Event</span><span className="text-white/80">{selectedSe.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Type</span><span className="text-white/80 capitalize">{selectedSe.type}</span>
                </div>
                {selectedSe.type === "team" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Team</span><span className="text-white/80">{teamName || `${user.name}'s Team`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Members</span><span className="text-white/80">{teamMembers.length + 1}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Fee</span><span className="text-white/80">{event.price > 0 ? `₹${event.price}` : "Free"}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(selectedSe.type === "team" ? "team" : "select")} variant="ghost" className="flex-1 h-10 border border-white/[0.1] text-white/60">Back</Button>
                <Button onClick={handleConfirm} disabled={submitting} className="flex-1 h-10 bg-white text-black hover:bg-white/90">
                  {submitting ? "Registering..." : "Confirm Registration"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
