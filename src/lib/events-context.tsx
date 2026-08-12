"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react"
import { db as getDb } from "./firebase"
import {
  collection, doc, onSnapshot, updateDoc, arrayUnion, increment, setDoc, deleteDoc, getDocs, query, getDoc,
} from "firebase/firestore"
import { 
  sendRegistrationConfirmation, 
  sendPaymentConfirmation, 
  sendEventReminder,
  sendAnnouncementNotification,
  sendTaskAssignment,
} from "./notifications"
import {
  emailRegistrationConfirmation,
  emailAnnouncementNotification,
  emailTaskAssignment,
} from "./emailApi"

// ─── Sub-Event Types ───
export interface SubEventCoordinator {
  name: string
  email: string
  phone: string
  role: string
}

export interface SubEventPrize {
  first: string
  second: string
  third?: string
}

export interface SubEvent {
  id: string
  name: string
  description: string
  type: "solo" | "team"
  maxParticipants: number
  minTeamSize?: number
  maxTeamSize?: number
  rules: string[]
  prize: SubEventPrize
  coordinators: SubEventCoordinator[]
  /** Optional event time for this sub-event */
  hasTime?: boolean
  time?: string
}

// ─── Registration ───
export interface Registration {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  eventId: string
  subEventId: string
  status: "PAID" | "FREE" | "PENDING" | "REFUNDED" | "DRAFT"
  timestamp: string
  teamName?: string
  teamMembers?: string[]
  pendingMembers?: string[]
  /** Emails that have already been sent an invitation (to prevent spam re-invites). */
  invitedMembers?: string[]
  /** Emails that explicitly declined the invitation (captain can re-invite after decline). */
  declinedMembers?: string[]
  transactionId?: string
  paymentMethod?: string
  checkedIn: boolean
  checkInTime?: string
}

// ─── Chat ───
export interface ChatMessage {
  id: string
  eventId: string
  subEventId: string  // "general" for event-level chat, or sub-event ID
  userId: string
  userName: string
  message: string
  timestamp: string
}

// ─── Module 2 — Announcements ───
export interface Announcement {
  id: string
  title: string
  message: string
  authorName: string
  authorEmail: string
  targetSubEventId?: string
  pinned: boolean
  timestamp: string
}

// ─── Module 3 — Tasks ───
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"
export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedBy: string
  deadline: string
  status: TaskStatus
  subEventId?: string
  createdAt: string
}

// ─── Module 7 — Automation Rules ───
export type AutomationTrigger = "on_register" | "before_event_24h" | "before_event_1h" | "payment_pending"
export interface AutomationRule {
  id: string
  name: string
  trigger: AutomationTrigger
  message: string
  enabled: boolean
}
export interface AutomationLog {
  id: string
  ruleId: string
  ruleName: string
  recipientEmail: string
  message: string
  timestamp: string
}

// ─── Main Event ───
export interface MainEvent {
  id: string
  title: string
  organizer: string
  organizerEmail: string
  organizerPhone: string
  date: string
  /** Optional specific time for the main event (HH:MM 24h) */
  hasTime?: boolean
  time?: string
  venue: string
  seats: number
  registeredCount: number
  category: "Technical" | "Cultural" | "Sports" | "Workshop"
  isInter: boolean
  price: number
  description: string
  rules: string[]
  prizePool: string
  collegeDomain: string
  registrationOpen: boolean
  registrationDeadline: string  // ISO date string, "" means no deadline
  /** Admin review workflow. Undefined = legacy event (treated as published). */
  status?: "pending_review" | "published"
  subEvents: SubEvent[]
  eventCoordinators: SubEventCoordinator[]  // Event-level coordinators (overall, event leads, etc.)
  registrations: Registration[]
  chatMessages: ChatMessage[]
  announcements: Announcement[]
  tasks: Task[]
  automations: AutomationRule[]
  automationLogs: AutomationLog[]
  importantLinks: ImportantLink[]
  restricted_registrations: string[]
  poster_base64?: string
  allowedDepartments?: string[]
}

// ─── Important Links ───
export interface ImportantLink {
  id: string
  label: string
  url: string
}

// ─── Context Type ───
interface EventsContextType {
  events: MainEvent[]
  isLoading: boolean
  addEvent: (event: MainEvent) => void
  deleteEvent: (id: string) => void
  updateEvent: (id: string, updates: Partial<MainEvent>) => void
  deleteRegistration: (eventId: string, regId: string) => Promise<void>
  registerForSubEvent: (eventId: string, subEventId: string, reg: Registration) => void
  addChatMessage: (eventId: string, subEventId: string, msg: ChatMessage) => void
  addCoordinator: (eventId: string, subEventId: string, coordinator: SubEventCoordinator) => void
  submitTransaction: (eventId: string, regId: string, transactionId: string, method: string) => void
  approvePayment: (eventId: string, regId: string) => void
  rejectPayment: (eventId: string, regId: string) => void
  addAnnouncement: (eventId: string, a: Announcement) => void
  addTask: (eventId: string, task: Task) => void
  updateTaskStatus: (eventId: string, taskId: string, status: TaskStatus) => void
  updateTaskOrder: (eventId: string, tasks: Task[]) => void
  checkInParticipant: (eventId: string, regId: string) => void
  undoCheckInParticipant: (eventId: string, regId: string) => void
  acceptTeamRequest: (eventId: string, regId: string, email: string) => Promise<void>
  rejectTeamRequest: (eventId: string, regId: string, email: string) => Promise<void>
  removePendingMember: (eventId: string, regId: string, email: string) => Promise<void>
  addAutomation: (eventId: string, rule: AutomationRule) => void
  toggleAutomation: (eventId: string, ruleId: string) => void
  addAutomationLog: (eventId: string, log: AutomationLog) => void
}

// Props for EventsProvider — requires auth state so we only open the Firestore
// listener once auth is resolved (avoids PERMISSION_DENIED before session restores).
export interface EventsProviderProps {
  children: ReactNode
  /** Set to true once Firebase Auth has finished restoring the session. */
  authReady: boolean
  /** The authenticated user's UID, or null if signed out. */
  authUid: string | null
}

const EventsContext = createContext<EventsContextType | null>(null)

// Helper: get events collection (lazy) — returns null if Firebase not initialized
function getEventsCol() {
  const db = getDb()
  if (!db) return null
  return collection(db, "events")
}

// Helper: get current event ref — throws if Firebase not initialized (mutations require auth)
function getEventRef(eventId: string) {
  const db = getDb()
  if (!db) throw new Error("[MyFestivo] Firebase not initialized. Check your .env.local file.")
  return doc(db, "events", eventId)
}

// Helper: get a registration subcollection doc ref
function getRegRef(eventId: string, regId: string) {
  const db = getDb()
  if (!db) throw new Error("[MyFestivo] Firebase not initialized. Check your .env.local file.")
  return doc(db, "events", eventId, "registrations", regId)
}

// Helper: get the registrations subcollection ref
function getRegsCol(eventId: string) {
  const db = getDb()
  if (!db) throw new Error("[MyFestivo] Firebase not initialized. Check your .env.local file.")
  return collection(db, "events", eventId, "registrations")
}

// ─── localStorage cache helpers ───
// We use localStorage (not sessionStorage) so the cache persists across new
// browser tabs — this is critical for shared event links to load instantly.
const EVENTS_CACHE_KEY = 'mf_events_cache_v1'

/** Strip poster_base64 (large base64 string) before caching to stay under the ~5MB localStorage limit. */
function eventsForCache(evts: MainEvent[]): object[] {
  return evts.map(({ poster_base64: _p, ...rest }) => rest)
}

// ─── Provider ───
const legacyDeptMap: Record<string, string> = {
  "Computer Science": "BSc CS",
  "Cyber Security": "BSc Cyber Security",
  "AI/ML": "BSc AI/ML",
}

export function EventsProvider({ children, authReady, authUid }: EventsProviderProps) {
  const [events, setEvents] = useState<MainEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // We store per-event registration maps in a ref so the events onSnapshot
  // callback always has the latest registration data without needing to close over stale state.
  const regsByEventRef = useRef<Record<string, Registration[]>>({})

  // Helper to merge current event docs with their subcollection registrations
  const mergeRegistrations = useCallback((evtDocs: MainEvent[]): MainEvent[] => {
    return evtDocs.map(e => ({
      ...e,
      registrations: regsByEventRef.current[e.id] ?? e.registrations,
    }))
  }, [])

  // ── 1. Serve stale cache immediately so pages don't flash a spinner on reload ──
  // Also seed regsByEventRef from the cache so the merge works immediately.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(EVENTS_CACHE_KEY)
      if (raw) {
        const cached: MainEvent[] = JSON.parse(raw)
        // Seed the ref so mergeRegistrations has data before Firestore responds
        cached.forEach(evt => {
          if (evt.registrations?.length) {
            regsByEventRef.current[evt.id] = evt.registrations
          }
        })
        setEvents(cached)
        setIsLoading(false)
      }
    } catch {}
  }, [])

  // ── 2. Set up live Firestore listener — only once auth state is known ──
  // We gate on authReady to avoid PERMISSION_DENIED errors before session restores.
  useEffect(() => {
    if (!authReady) return

    const col = getEventsCol()
    if (!col) {
      console.warn("[EventsProvider] Firebase not initialized — skipping onSnapshot. Check your .env.local")
      setIsLoading(false)
      return
    }

    // Track per-event registration subcollection unsubscribers
    const regUnsubs: Record<string, () => void> = {}
    // Keep the latest list of event docs so registration updates can re-merge
    let latestEvtDocs: MainEvent[] = []

    const eventsUnsub = onSnapshot(
      col,
      (snapshot) => {
        const fetched: MainEvent[] = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            ...data,
            id: d.id,
            subEvents: (data.subEvents || []).map((se: any) => ({
              ...se,
              prize: {
                first: se.prize?.first ?? "TBD",
                second: se.prize?.second ?? "TBD",
                third: se.prize?.third ?? "TBD",
              },
              coordinators: se.coordinators ?? [],
              rules: se.rules ?? [],
            })),
            // Start with empty array — registrations subcollection listeners will fill it in
            registrations: regsByEventRef.current[d.id] ?? [],
            chatMessages: data.chatMessages || [],
            announcements: data.announcements || [],
            tasks: data.tasks || [],
            automations: data.automations || [],
            automationLogs: data.automationLogs || [],
            importantLinks: data.importantLinks || [],
            restricted_registrations: data.restricted_registrations || [],
            allowedDepartments: (data.allowedDepartments || []).map((d: string) => legacyDeptMap[d] || d),
            rules: data.rules || [],
            registrationOpen: data.registrationOpen !== false,
            registrationDeadline: data.registrationDeadline || "",
          } as MainEvent
        })
        latestEvtDocs = fetched

        // Subscribe to registrations subcollection for any new events
        fetched.forEach(evt => {
          if (regUnsubs[evt.id]) return // already subscribed
          try {
            const regCol = getRegsCol(evt.id)
            const unsub = onSnapshot(regCol, (regSnap) => {
              const regs: Registration[] = regSnap.docs.map(rd => ({ ...rd.data(), id: rd.id } as Registration))
              regsByEventRef.current = { ...regsByEventRef.current, [evt.id]: regs }
              // Re-merge, update state, AND persist to cache so reloads see registrations
              setEvents(prev => {
                const next = prev.map(e => e.id === evt.id ? { ...e, registrations: regs } : e)
                try {
                  localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(eventsForCache(next)))
                } catch {}
                return next
              })
            }, (err) => {
              console.error(`[EventsProvider] Registrations listener error for event ${evt.id}:`, err)
            })
            regUnsubs[evt.id] = unsub
          } catch (e) {
            console.error(`[EventsProvider] Failed to subscribe to registrations for ${evt.id}`, e)
          }
        })

        setEvents(mergeRegistrations(fetched))
        setIsLoading(false)
        // Note: localStorage is updated by the registration subcollection listeners
        // (above) so it always contains the full registration data, not an empty snapshot.
      },
      (error) => {
        console.error('[EventsProvider] Firestore listener error:', error)
        setIsLoading(false)
      }
    )
    return () => {
      eventsUnsub()
      Object.values(regUnsubs).forEach(u => u())
    }
  }, [authReady, authUid, mergeRegistrations])

  // ── 3. Grace-period fallback — unblock the page after 6 s regardless ──
  // If both localStorage cache is empty AND Firestore is slow (e.g. auth takes
  // 4 s + Firestore round-trip takes 2 s = 6 s total), isLoading would stay
  // true and the page-level 10 s timeout would fire. This timer acts as a
  // safety net: after 6 s, we stop blocking so the page renders with whatever
  // data is available (even if it’s empty). Firestore will still populate when
  // it responds — the listener remains active.
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 6000)
    return () => clearTimeout(timer)
  }, [])

  const addEvent = async (event: MainEvent) => {
    const { id, ...data } = event
    const ref = getEventRef(id)
    await setDoc(ref, data)
  }

  const updateEvent = async (id: string, updates: Partial<MainEvent>) => {
    await updateDoc(getEventRef(id), updates as Record<string, unknown>)
  }

  const deleteEvent = async (id: string) => {
    await deleteDoc(getEventRef(id))
  }

  const deleteRegistration = async (eventId: string, regId: string) => {
    const existing = regsByEventRef.current[eventId]?.find(r => r.id === regId)
    await deleteDoc(getRegRef(eventId, regId))
    if (existing?.status === "PAID" || existing?.status === "FREE") {
      await updateDoc(getEventRef(eventId), { registeredCount: increment(-1) })
    }
  }

  const registerForSubEvent = async (eventId: string, _subEventId: string, reg: Registration) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return

    // ── Upsert Guard ─────────────────────────────────────────────────────────
    // Check if a registration with the SAME ID already exists in Firestore.
    // If it does, this is an UPDATE (e.g., PENDING → PAID after payment), so
    // we update the doc and local state without incrementing the count.
    // If it's a new registration (different user+subEvent combo), we check for
    // a duplicate by userId+subEventId to prevent creating a second registration.
    let isUpdate = false
    const currentRegs = regsByEventRef.current[eventId] ?? []

    // Does a reg with this exact ID already exist?
    const existingById = currentRegs.find(r => r.id === reg.id)
    if (existingById) {
      isUpdate = true
    } else {
      // Check for duplicate by userId + subEventId (any status)
      const duplicateByUser = currentRegs.some(
        r => r.userId === reg.userId && r.subEventId === reg.subEventId
      )
      if (!duplicateByUser) {
        // Also check Firestore authoritatively to catch stale local state
        try {
          const regsCol = getRegsCol(eventId)
          const existingSnap = await getDocs(query(regsCol))
          const alreadyInFirestore = existingSnap.docs.some(d => {
            const data = d.data()
            return data.userId === reg.userId && data.subEventId === reg.subEventId && d.id !== reg.id
          })
          if (alreadyInFirestore) {
            // Sync local state with Firestore and bail — it's truly a duplicate
            const regs: Registration[] = existingSnap.docs.map(d => ({ ...d.data(), id: d.id } as Registration))
            regsByEventRef.current = { ...regsByEventRef.current, [eventId]: regs }
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registrations: regs } : e))
            return
          }
        } catch (e) {
          console.warn("[registerForSubEvent] Could not verify duplicate in Firestore:", e)
        }
      } else {
        // Same userId+subEventId exists locally but different ID — it's a duplicate, bail silently
        return
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Write or update the registration doc in the subcollection
    const { id: regId, ...regData } = reg
    await setDoc(getRegRef(eventId, regId), regData)

    // Optimistic local state update — upsert (replace if same ID, append if new)
    const updatedRegs = isUpdate
      ? currentRegs.map(r => r.id === reg.id ? reg : r)
      : [...currentRegs, reg]
    regsByEventRef.current = { ...regsByEventRef.current, [eventId]: updatedRegs }
    setEvents(prev => prev.map(e =>
      e.id === eventId
        ? { ...e, registrations: updatedRegs }
        : e
    ))

    // We increment count and fire automations only when a user successfully registers (PAID or FREE),
    // and ONLY if they weren't already successfully registered before.
    const wasAlreadyRegistered = existingById?.status === "PAID" || existingById?.status === "FREE"
    const isNowRegistered = reg.status === "PAID" || reg.status === "FREE"
    
    const shouldTriggerRegisterEvents = !wasAlreadyRegistered && isNowRegistered

    // DRAFT registrations are placeholders for team invitations — skip count and automations
    if (reg.status === "DRAFT") return

    // Increment the count on the event doc (non-critical, may fail if rules block it)
    if (shouldTriggerRegisterEvents) {
      try {
        await updateDoc(getEventRef(eventId), { registeredCount: increment(1) })
      } catch { /* non-critical */ }
    }

    // Trigger on_register automation — fire-and-forget so UI doesn't wait on these
    if (shouldTriggerRegisterEvents) {
      const onRegisterRule = evt.automations.find(a => a.trigger === "on_register" && a.enabled)
      if (onRegisterRule) {
        ;(async () => {
          try {
            const subEvent = evt.subEvents.find(se => se.id === _subEventId)
            // Browser push notification
            sendRegistrationConfirmation(
              eventId,
              evt.title,
              reg.userEmail,
              subEvent?.name || "Event"
            )

            // Gmail confirmation email
            emailRegistrationConfirmation({
              toEmail: reg.userEmail,
              userName: reg.userName,
              eventTitle: evt.title,
              subEventName: subEvent?.name || "Event",
              eventDate: evt.date,
              eventVenue: evt.venue,
              eventId,
            })

            // Automation log
            addAutomationLog(eventId, {
              id: `log-${Date.now()}`,
              ruleId: onRegisterRule.id,
              ruleName: onRegisterRule.name,
              recipientEmail: reg.userEmail,
              message: onRegisterRule.message,
              timestamp: new Date().toISOString(),
            })
          } catch (error) {
            console.error("Error triggering on_register automation:", error)
          }
        })()
      }
    }
  }

  const addChatMessage = async (eventId: string, _subEventId: string, msg: ChatMessage) => {
    await updateDoc(getEventRef(eventId), {
      chatMessages: arrayUnion(msg),
    })
  }

  const addCoordinator = async (eventId: string, subEventId: string, coordinator: SubEventCoordinator) => {
    // Need to update the specific sub-event's coordinators — read-modify-write
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const updatedSubEvents = evt.subEvents.map(se =>
      se.id === subEventId ? { ...se, coordinators: [...se.coordinators, coordinator] } : se
    )
    await updateDoc(getEventRef(eventId), { 
      subEvents: updatedSubEvents,
      restricted_registrations: arrayUnion(coordinator.email)
    })
  }

  const acceptTeamRequest = async (eventId: string, regId: string, email: string) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const reg = evt.registrations.find(r => r.id === regId)
    if (!reg || !reg.pendingMembers?.includes(email)) return
    await updateDoc(getRegRef(eventId, regId), {
      pendingMembers: reg.pendingMembers.filter(e => e !== email),
      teamMembers: [...(reg.teamMembers || []), email],
    })
  }

  const rejectTeamRequest = async (eventId: string, regId: string, email: string) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const reg = evt.registrations.find(r => r.id === regId)
    if (!reg || !reg.pendingMembers?.includes(email)) return
    // Move to declinedMembers so the captain can re-invite this person
    const currentDeclined = reg.declinedMembers || []
    const currentInvited = reg.invitedMembers || []
    await updateDoc(getRegRef(eventId, regId), {
      pendingMembers: reg.pendingMembers.filter(e => e !== email),
      invitedMembers: currentInvited.filter(e => e !== email),
      declinedMembers: currentDeclined.includes(email) ? currentDeclined : [...currentDeclined, email],
    })
  }

  // Remove a pending member and clean up invitedMembers so the captain can re-invite them
  // and so the invite disappears from the invitee's dashboard immediately.
  const removePendingMember = async (eventId: string, regId: string, email: string) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const reg = evt.registrations.find(r => r.id === regId)
    if (!reg) return
    await updateDoc(getRegRef(eventId, regId), {
      pendingMembers: (reg.pendingMembers || []).filter(e => e !== email),
      invitedMembers: (reg.invitedMembers || []).filter(e => e !== email),
    })
  }

  // Module 1 — Payment
  const submitTransaction = async (eventId: string, regId: string, transactionId: string, method: string) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const isPaid = method === "razorpay"
    await updateDoc(getRegRef(eventId, regId), {
      transactionId,
      paymentMethod: method,
      status: isPaid ? "PAID" : "PENDING",
    })

    if (isPaid) {
      const reg = evt.registrations.find(r => r.id === regId)
      if (reg) {
        try {
          await sendPaymentConfirmation(eventId, evt.title, reg.userEmail, evt.price)
          const paymentRule = evt.automations.find(a => a.trigger === "payment_pending" && a.enabled)
          if (paymentRule) {
            await addAutomationLog(eventId, {
              id: `log-${Date.now()}`,
              ruleId: paymentRule.id,
              ruleName: paymentRule.name,
              recipientEmail: reg.userEmail,
              message: paymentRule.message,
              timestamp: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error("Error sending payment confirmation:", error)
        }
      }
    }
  }

  const approvePayment = async (eventId: string, regId: string) => {
    await updateDoc(getRegRef(eventId, regId), { status: "PAID" })
    await updateDoc(getEventRef(eventId), { registeredCount: increment(1) })
  }

  const rejectPayment = async (eventId: string, regId: string) => {
    const existing = regsByEventRef.current[eventId]?.find(r => r.id === regId)
    if (existing?.status === "PAID" || existing?.status === "FREE") {
      await updateDoc(getEventRef(eventId), { registeredCount: increment(-1) })
    }
    await updateDoc(getRegRef(eventId, regId), { status: "REFUNDED" })
  }

  // Module 2 — Announcements
  const addAnnouncement = async (eventId: string, a: Announcement) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return

    // If the new announcement is pinned, unpin all existing ones first
    // so only one announcement is ever pinned at a time
    const updatedExisting = a.pinned
      ? evt.announcements.map(ann => ann.pinned ? { ...ann, pinned: false } : ann)
      : evt.announcements

    await updateDoc(getEventRef(eventId), { announcements: [a, ...updatedExisting] })

    // Send announcement notification to all registered participants
    try {
      const registeredEmails = [...new Set(evt.registrations.map(r => r.userEmail))]
      if (registeredEmails.length > 0) {
        // Browser push notification
        await sendAnnouncementNotification(
          eventId,
          evt.title,
          registeredEmails,
          a.title,
          a.message
        )

        // Gmail emails — build recipient list with names (fire-and-forget)
        const recipients = [...new Map(
          evt.registrations.map(r => [r.userEmail, { email: r.userEmail, name: r.userName }])
        ).values()]
        emailAnnouncementNotification({
          recipients,
          eventTitle: evt.title,
          announcementTitle: a.title,
          announcementMessage: a.message,
          eventId,
        })
      }
    } catch (error) {
      console.error("Error sending announcement notification:", error)
    }
  }

  // Module 3 — Tasks
  const addTask = async (eventId: string, task: Task) => {
    try {
      const evt = events.find(e => e.id === eventId)
      if (!evt) return

      const docRef = getEventRef(eventId)
      await updateDoc(docRef, {
        tasks: arrayUnion(task),
        restricted_registrations: arrayUnion(task.assignedTo)
      })

      // Send task assignment notification
      try {
        // Browser push notification
        await sendTaskAssignment(
          eventId,
          evt.title,
          task.assignedTo,
          task.title,
          task.deadline
        )

        // Gmail email (fire-and-forget)
        emailTaskAssignment({
          toEmail: task.assignedTo,
          assigneeName: task.assignedTo, // email used as name fallback
          taskTitle: task.title,
          taskDescription: task.description,
          eventTitle: evt.title,
          deadline: task.deadline,
          assignedBy: task.assignedBy,
          eventId,
        })
      } catch (error) {
        console.error("Error sending task notification:", error)
      }
    } catch (error) {
      console.error("Error adding task: ", error)
    }
  }

  const updateTaskStatus = async (eventId: string, taskId: string, status: TaskStatus) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const updatedTasks = evt.tasks.map(t =>
      t.id === taskId ? { ...t, status } : t
    )
    await updateDoc(getEventRef(eventId), { tasks: updatedTasks })
  }

  const updateTaskOrder = async (eventId: string, tasks: Task[]) => {
    await updateDoc(getEventRef(eventId), { tasks })
  }

  // Module 4 — Check-In
  const checkInParticipant = async (eventId: string, regId: string) => {
    await updateDoc(getRegRef(eventId, regId), {
      checkedIn: true,
      checkInTime: new Date().toISOString(),
    })
  }

  const undoCheckInParticipant = async (eventId: string, regId: string) => {
    await updateDoc(getRegRef(eventId, regId), {
      checkedIn: false,
      checkInTime: null,
    })
  }

  // Module 7 — Automation
  const addAutomation = async (eventId: string, rule: AutomationRule) => {
    await updateDoc(getEventRef(eventId), { automations: arrayUnion(rule) })
  }

  const toggleAutomation = async (eventId: string, ruleId: string) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const updatedAutomations = evt.automations.map(a =>
      a.id === ruleId ? { ...a, enabled: !a.enabled } : a
    )
    await updateDoc(getEventRef(eventId), { automations: updatedAutomations })
  }

  const addAutomationLog = async (eventId: string, log: AutomationLog) => {
    await updateDoc(getEventRef(eventId), { automationLogs: arrayUnion(log) })
  }

  return (
    <EventsContext.Provider value={{
      events, isLoading, addEvent, deleteEvent, updateEvent, deleteRegistration, registerForSubEvent, addChatMessage, addCoordinator,
      submitTransaction, approvePayment, rejectPayment,
      addAnnouncement, addTask, updateTaskStatus, updateTaskOrder,
      checkInParticipant, undoCheckInParticipant,
      acceptTeamRequest,
      rejectTeamRequest,
      removePendingMember,
      addAutomation, toggleAutomation, addAutomationLog
    }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error("useEvents must be used within EventsProvider")
  return ctx
}
