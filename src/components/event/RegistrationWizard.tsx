"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEvents, SubEvent, MainEvent, Registration } from "@/lib/events-context"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronRight, Users, X, Plus, Trophy, UserPlus, Clock, Send, Loader2 } from "lucide-react"
import { emailTeamInvitation } from "@/lib/emailApi"

interface Props {
  event: MainEvent
  /** The sub-event the user clicked Register on — skips the "Select Sub-Event" step */
  initialSubEvent: SubEvent
  localRegistrations?: any[]
  /** If true the user is a Volunteer coordinator — they CAN register despite being in restricted_registrations */
  isVolunteer?: boolean
  onClose: () => void
  onSuccess?: (reg: any) => void
}

type Step = "team" | "confirm"

export function RegistrationWizard({ event, initialSubEvent, localRegistrations = [], isVolunteer = false, onClose, onSuccess }: Props) {
  const { user } = useAuth()
  const { registerForSubEvent, removePendingMember } = useEvents()

  const selectedSe = initialSubEvent

  const [step, setStep] = useState<Step>(selectedSe.type === "team" ? "team" : "confirm")
  const [teamName, setTeamName] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  // Accepted team members (confirmed via dashboard)
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  // Pending invitations (awaiting accept/decline)
  const [pendingMembers, setPendingMembers] = useState<string[]>([])
  // Emails already sent an invite (persisted to DB to prevent spam)
  const [invitedMembers, setInvitedMembers] = useState<string[]>([])
  // Emails that declined (captain can re-invite these)
  const [declinedMembers, setDeclinedMembers] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [done, setDone] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [friendSuggestions, setFriendSuggestions] = useState<string[]>([])
  const [draftRegId, setDraftRegId] = useState<string | null>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  // ── Load existing DRAFT registration if one already exists ──
  // This allows the wizard to resume state across closes/re-opens.
  useEffect(() => {
    if (!user || selectedSe.type !== "team") return
    const allRegs = [...event.registrations, ...localRegistrations.filter(lr => !event.registrations.some((r: any) => r.id === lr.id))]
    const draft = allRegs.find(
      (r: any) => r.subEventId === selectedSe.id && r.userEmail === user.email && r.status === "DRAFT"
    ) as Registration | undefined
    if (draft) {
      setDraftRegId(draft.id)
      setTeamName(draft.teamName || "")
      // teamMembers in DB = confirmed; filter out the captain's own email
      setTeamMembers((draft.teamMembers || []).filter((e: string) => e !== user.email))
      setPendingMembers(draft.pendingMembers || [])
      setInvitedMembers(draft.invitedMembers || [])
      setDeclinedMembers(draft.declinedMembers || [])
    }
  }, []) // Run only on mount

  // ── Re-sync accepted/rejected status from live Firestore data ──
  useEffect(() => {
    if (!user || !draftRegId) return
    const allRegs = [...event.registrations, ...localRegistrations.filter(lr => !event.registrations.some((r: any) => r.id === lr.id))]
    const draft = allRegs.find((r: any) => r.id === draftRegId) as Registration | undefined
    if (draft) {
      setTeamMembers((draft.teamMembers || []).filter((e: string) => e !== user.email))
      setPendingMembers(draft.pendingMembers || [])
      setInvitedMembers(draft.invitedMembers || [])
      setDeclinedMembers(draft.declinedMembers || [])
    }
  }, [event.registrations, draftRegId])

  if (!user) return null

  const allRegistrations = [
    ...event.registrations,
    ...localRegistrations.filter(lr => !event.registrations.some((r: any) => r.id === lr.id))
  ]

  // Staff restriction: block organizers/coordinators UNLESS they are Volunteers (who can register)
  const isStaffRestricted = !!user?.email && !isVolunteer && (event.restricted_registrations ?? []).includes(user.email)

  // Department restriction for intra-college events
  const isDeptRestricted = !event.isInter && (event.allowedDepartments ?? []).length > 0 && !!user?.department && !event.allowedDepartments!.includes(user.department)

  const addMemberByEmail = (email: string) => {
    const normalized = email.trim().toLowerCase()
    if (!normalized || teamMembers.includes(normalized) || normalized === user.email) return
    // Block adding if already pending (awaiting response)
    if (pendingMembers.includes(normalized)) return
    // Block adding if already invited & NOT declined (prevent spam)
    if (invitedMembers.includes(normalized) && !declinedMembers.includes(normalized)) return
    if (selectedSe?.maxTeamSize && (teamMembers.length + pendingMembers.length + 1) >= selectedSe.maxTeamSize) return

    // Friends-only restriction: only users in the captain's friends list can be added
    if (!user?.friends?.includes(normalized)) {
      setEmailError("Only friends can be added as team members. Add them as a friend first.")
      return
    }

    setEmailError(null)
    setPendingMembers(prev => [...prev, normalized])
    // If they were previously declined, remove from declinedMembers on re-add
    if (declinedMembers.includes(normalized)) {
      setDeclinedMembers(prev => prev.filter(e => e !== normalized))
    }
    setMemberEmail("")
    setFriendSuggestions([])
  }

  const addMember = () => addMemberByEmail(memberEmail)

  const removePending = async (email: string) => {
    // Optimistic local state update
    setPendingMembers(prev => prev.filter(e => e !== email))
    // Remove from invitedMembers locally too (allows re-invite)
    setInvitedMembers(prev => prev.filter(e => e !== email))
    // Persist to Firestore so the invite vanishes from the invitee's dashboard
    if (draftRegId) {
      await removePendingMember(event.id, draftRegId, email)
    }
  }

  const handleMemberInput = (val: string) => {
    setMemberEmail(val)
    setEmailError(null)
    if (!val.trim() || !user?.friends?.length) { setFriendSuggestions([]); return }
    const q = val.toLowerCase()
    const matches = user.friends.filter(
      f => f.toLowerCase().includes(q) && f !== user.email && !teamMembers.includes(f) && !pendingMembers.includes(f)
    )
    setFriendSuggestions(matches.slice(0, 6))
  }

  // ── Send Request: create/update DRAFT and email pending members ──
  const handleSendRequest = async () => {
    if (pendingMembers.length === 0) return
    setSendingRequest(true)
    try {
      const regId = draftRegId || `reg-${Date.now()}`
      // Only send emails to members who haven't been invited yet
      const newlyInvited = pendingMembers.filter(e => !invitedMembers.includes(e))
      const updatedInvitedMembers = [...new Set([...invitedMembers, ...newlyInvited])]

      const draft: any = {
        id: regId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone || "",
        eventId: event.id,
        subEventId: selectedSe.id,
        status: "DRAFT",
        timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16),
        checkedIn: false,
        teamName: teamName || `${user.name}'s Team`,
        teamMembers: [user.email, ...teamMembers],
        pendingMembers,
        invitedMembers: updatedInvitedMembers,
        declinedMembers,
      }

      await registerForSubEvent(event.id, selectedSe.id, draft)
      setDraftRegId(regId)
      setInvitedMembers(updatedInvitedMembers)

      // Send invitation emails only to newly added members (prevent spam re-sends)
      for (const email of newlyInvited) {
        emailTeamInvitation({
          toEmail: email,
          captainName: user.name,
          teamName: teamName || `${user.name}'s Team`,
          eventTitle: event.title,
          subEventName: selectedSe.name,
          eventId: event.id,
        })
      }
    } catch (err) {
      console.error("Send request error:", err)
      alert("Failed to send requests. Please try again.")
    }
    setSendingRequest(false)
  }

  // ── Confirm Registration: update DRAFT → PAID / FREE / PENDING ──
  const handleConfirm = async () => {
    setSubmitting(true)
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
    const requiresPayment = event.price && event.price > 0 && razorpayKey.trim() !== ''
    const regId = draftRegId || `reg-${Date.now()}`

    const reg: any = {
      id: regId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || "",
      eventId: event.id,
      subEventId: selectedSe.id,
      status: requiresPayment ? "PENDING" : "FREE",
      timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16),
      checkedIn: false,
      ...(requiresPayment ? {} : { transactionId: `FREE-${regId}` }),
      paymentMethod: requiresPayment ? "pending" : "free",
    }

    if (selectedSe.type === "team") {
      reg.teamName = teamName || `${user.name}'s Team`
      reg.teamMembers = [user.email, ...teamMembers]
      reg.pendingMembers = pendingMembers
    }

    try {
      await registerForSubEvent(event.id, selectedSe.id, reg)

      if (requiresPayment) {
        const { initiatePayment } = await import("@/lib/razorpay")
        const { verifyPayment } = await import("@/lib/razorpay")

        const paymentOptions = {
          key: razorpayKey,
          amount: event.price * 100,
          currency: 'INR',
          name: 'MyFestivo',
          description: `${event.title} - ${selectedSe.name}`,
          order_id: regId,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || '',
          },
          notes: {
            eventId: event.id,
            eventTitle: event.title,
            registrationId: regId,
          },
          theme: {
            color: '#3B82F6',
          },
          handler: async (response: any) => {
            const verificationResult = await verifyPayment(
              regId,
              response.razorpay_payment_id,
              response.razorpay_signature,
              regId
            )

            if (verificationResult.valid) {
              const updatedReg = {
                ...reg,
                status: "PAID",
                transactionId: response.razorpay_payment_id,
                paymentMethod: "razorpay",
              }
              await registerForSubEvent(event.id, selectedSe.id, updatedReg)
              setDone(true)
            } else {
              console.error('Payment verification failed:', verificationResult.error)
              alert('Payment verification failed. Please try again.')
            }
          },
          modal: {
            ondismiss: () => {
              console.log('Payment cancelled by user. Registration is PENDING.')
            }
          }
        }

        await initiatePayment(paymentOptions)
      } else {
        setDone(true)
        onSuccess?.(reg)
      }
    } catch (err) {
      console.error('Registration error:', err)
      alert('Registration failed. Please try again.')
    }
    setSubmitting(false)
  }

  const steps: Step[] = selectedSe.type === "team" ? ["team", "confirm"] : ["confirm"]
  const stepLabels: Record<Step, string> = { team: "Team Details", confirm: "Confirm" }
  const stepIndex = steps.indexOf(step)

  const totalMembers = 1 + teamMembers.length + pendingMembers.length
  const acceptedCount = 1 + teamMembers.length // captain + accepted
  const meetsMinSize = !selectedSe.minTeamSize || acceptedCount >= selectedSe.minTeamSize
  const atMaxSize = !!(selectedSe.maxTeamSize && totalMembers >= selectedSe.maxTeamSize)
  const hasPendingOrAccepted = teamMembers.length > 0 || pendingMembers.length > 0

  // Done state
  if (done) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <GlassCard className="p-8 max-w-md w-full text-center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">Registration Successful!</h2>
          <p className="text-sm text-white/50 mb-2">
            You have been registered for <span className="text-white">{event.title} - {selectedSe?.name}</span>. Check your dashboard for your QR pass.
          </p>
          <p className="text-xs text-[#B388FF]/70 mb-6 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Please check your mail inbox or spam folder for event details.
          </p>
          <Button onClick={onClose} className="bg-white text-black hover:bg-[#B388FF] h-10 px-6">Done</Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose} role="presentation">
      <GlassCard className="p-0 max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="registration-title">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Register for</p>
            <p className="font-medium" id="registration-title">{event.title} — {selectedSe.name}</p>
          </div>
          <button onClick={onClose} aria-label="Close registration wizard" className="text-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"><X className="w-5 h-5" aria-hidden="true" /></button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 border-b border-white/[0.06] flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono ${i < stepIndex ? "bg-green-500/20 text-green-400" :
                i === stepIndex ? "bg-white text-black" : "bg-white/[0.06] text-white/30"
                }`}>{i < stepIndex ? <Check className="w-3 h-3" /> : i + 1}</div>
              <span className={`text-[10px] font-mono tracking-widest uppercase ${i === stepIndex ? "text-white" : "text-white/30"}`}>{stepLabels[s]}</span>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-white/20 mx-1" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isStaffRestricted && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-mono text-center">
              Restricted: Event Staff/Coordinators cannot register.
            </div>
          )}

          {isDeptRestricted && (
            <div className="p-3 mb-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-mono text-center">
              Restricted: This event is only open to specific departments.
            </div>
          )}

          {/* STEP: Team Details */}
          {step === "team" && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-mono text-white/40 mb-2 block tracking-widest uppercase">Team Name</label>
                <Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder={`${user.name}'s Team`}
                  className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-10" />
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/40 mb-2 block tracking-widest uppercase">
                  Team Members {selectedSe.minTeamSize && selectedSe.maxTeamSize
                    ? `(${selectedSe.minTeamSize} – ${selectedSe.maxTeamSize} including you)`
                    : ""}
                </label>

                {/* Captain */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center"><Check className="w-3 h-3 text-green-400" /></div>
                    <span className="text-white/80">{user.name}</span>
                    <span className="text-[10px] font-mono text-white/30 ml-auto">You (Captain)</span>
                  </div>
                </div>

                {/* Accepted members */}
                {teamMembers.map((email, i) => (
                  <div key={email} className="flex items-center gap-2 p-3 rounded-lg bg-green-500/[0.05] border border-green-500/20 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/15 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-sm text-white/80 flex-1">{email}</span>
                    <span className="text-[9px] font-mono text-green-400/80 mr-1">ACCEPTED</span>
                  </div>
                ))}

                {/* Pending members — always show remove button, even if already invited */}
                {pendingMembers.map((email) => {
                  const alreadyInvited = invitedMembers.includes(email)
                  return (
                    <div key={email} className={`flex items-center gap-2 p-3 rounded-lg mb-2 ${
                      alreadyInvited
                        ? 'bg-[#B388FF]/[0.05] border border-[#B388FF]/20'
                        : 'bg-yellow-500/[0.05] border border-yellow-500/20'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        alreadyInvited ? 'bg-[#B388FF]/10' : 'bg-yellow-500/10'
                      }`}>
                        {alreadyInvited
                          ? <Send className="w-3 h-3 text-[#B388FF]" />
                          : <Clock className="w-3 h-3 text-yellow-400" />}
                      </div>
                      <span className="text-sm text-white/60 flex-1">{email}</span>
                      <span className={`text-[9px] font-mono mr-1 ${
                        alreadyInvited ? 'text-[#B388FF]/70' : 'text-yellow-400/70'
                      }`}>{alreadyInvited ? 'INVITED' : 'PENDING'}</span>
                      <button
                        onClick={() => removePending(email)}
                        className="text-white/20 hover:text-red-400 ml-1"
                        title={alreadyInvited ? "Remove invite" : "Remove"}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}

                {/* Add member input */}
                {!atMaxSize && (
                  <div className="flex gap-2 mt-3 relative">
                    <div className="flex-1 relative">
                      <Input value={memberEmail} onChange={e => handleMemberInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addMember() } if (e.key === "Escape") setFriendSuggestions([]) }}
                        placeholder="Search friends..."
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 h-9 text-sm w-full" />
                      {/* Friend autocomplete dropdown */}
                      {friendSuggestions.length > 0 && (
                        <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-white/[0.1] rounded-lg z-20 overflow-hidden shadow-xl">
                          {friendSuggestions.map(email => (
                            <button
                              key={email}
                              type="button"
                              onMouseDown={e => { e.preventDefault(); addMemberByEmail(email) }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#B388FF]/10 transition-colors"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#B388FF]/20 flex items-center justify-center text-[10px] font-bold text-[#B388FF] shrink-0">
                                {email[0].toUpperCase()}
                              </div>
                              <span className="text-sm text-white/80 truncate">{email}</span>
                              <span className="ml-auto text-[9px] font-mono text-[#B388FF]/60">Friend</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={addMember} variant="outline" className="h-9 px-3 border-white/20 text-white/60 hover:text-white shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                {/* Friends-only restriction notice and error */}
                <div className="flex items-center gap-1.5 mt-2">
                  <UserPlus className="w-3 h-3 text-white/25 shrink-0" />
                  <p className="text-[10px] text-white/30 font-mono">Team members must be added from your Friends list. Add teammates as friends first.</p>
                </div>
                {emailError && (
                  <p className="text-[10px] text-red-400/80 mt-1.5 font-mono flex items-center gap-1">
                    <X className="w-3 h-3 shrink-0" />{emailError}
                  </p>
                )}

                {selectedSe.minTeamSize && acceptedCount < selectedSe.minTeamSize && (
                  <p className="text-[10px] text-yellow-400/80 mt-2 font-mono">
                    Need at least {selectedSe.minTeamSize - acceptedCount} more accepted member(s) to continue
                  </p>
                )}

                {draftRegId && (
                  <p className="text-[10px] text-[#B388FF]/60 mt-2 font-mono flex items-center gap-1">
                    <Check className="w-3 h-3" /> Invitations saved — your team state is preserved even if you close this.
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                {/* Send Request — only visible when there are members who haven't been invited yet */}
                {(() => {
                  const newlyToInvite = pendingMembers.filter(e => !invitedMembers.includes(e))
                  return newlyToInvite.length > 0 ? (
                    <Button
                      onClick={handleSendRequest}
                      disabled={sendingRequest}
                      className="w-full h-10 bg-[#B388FF]/20 text-[#B388FF] border border-[#B388FF]/30 hover:bg-[#B388FF]/30 hover:text-white"
                      variant="outline"
                    >
                      {sendingRequest
                        ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Sending…</>
                        : <><Send className="w-3.5 h-3.5 mr-2" />Send Request to {newlyToInvite.length} member{newlyToInvite.length > 1 ? "s" : ""}</>
                      }
                    </Button>
                  ) : null
                })()}

                {/* Continue */}
                <Button
                  onClick={() => setStep("confirm")}
                  disabled={!meetsMinSize || isStaffRestricted || isDeptRestricted}
                  className="w-full h-10 bg-white text-black hover:bg-[#B388FF]"
                >
                  {!meetsMinSize
                    ? `Waiting for ${selectedSe.minTeamSize! - acceptedCount} more acceptance${selectedSe.minTeamSize! - acceptedCount > 1 ? "s" : ""}…`
                    : "Continue →"
                  }
                </Button>
              </div>
            </div>
          )}

          {/* STEP: Confirm */}
          {step === "confirm" && (
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
                      <span className="text-white/40">Members (confirmed)</span><span className="text-white/80">{acceptedCount}</span>
                    </div>
                    {pendingMembers.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-400/60">Pending invitations</span><span className="text-yellow-400/80">{pendingMembers.length}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Fee</span>
                  <span className="text-white/80">{event.price > 0 ? `₹${event.price}` : "Free"}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedSe.type === "team" && (
                  <Button onClick={() => setStep("team")} variant="ghost" className="flex-1 h-10 border border-white/[0.1] text-white/60">Back</Button>
                )}
                <Button onClick={handleConfirm} disabled={submitting || isStaffRestricted || isDeptRestricted} className="flex-1 h-10 bg-white text-black hover:bg-[#B388FF]">
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
