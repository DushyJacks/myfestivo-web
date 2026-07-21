"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { db as getDb } from "./firebase"
import {
  collection, doc, onSnapshot, addDoc, updateDoc, arrayUnion, increment, setDoc, deleteDoc,
} from "firebase/firestore"
import { 
  sendRegistrationConfirmation, 
  sendPaymentConfirmation, 
  sendEventReminder,
  sendAnnouncementNotification,
  sendTaskAssignment,
} from "./notifications"

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
}

// ─── Registration ───
export interface Registration {
  id: string
  userId: string
  userName: string
  userEmail: string
  eventId: string
  subEventId: string
  status: "PAID" | "PENDING" | "REFUNDED"
  timestamp: string
  teamName?: string
  teamMembers?: string[]
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
  addAutomation: (eventId: string, rule: AutomationRule) => void
  toggleAutomation: (eventId: string, ruleId: string) => void
  addAutomationLog: (eventId: string, log: AutomationLog) => void
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

// ─── SessionStorage cache helpers ───
const EVENTS_CACHE_KEY = 'mf_events_cache_v1'

/** Strip poster_base64 (large base64 string) before caching to stay under the ~5MB sessionStorage limit. */
function eventsForCache(evts: MainEvent[]): object[] {
  return evts.map(({ poster_base64: _p, ...rest }) => rest)
}

// ─── Provider ───
export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<MainEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Real-time listener for all events + sessionStorage read-through cache
  useEffect(() => {
    // ── 1. Serve stale cache immediately so pages don't show a spinner on reload ──
    try {
      const raw = sessionStorage.getItem(EVENTS_CACHE_KEY)
      if (raw) {
        setEvents(JSON.parse(raw))
        setIsLoading(false) // unblock page render with cached data right away
      }
    } catch {}

    // ── 2. Set up live Firestore listener (updates over the cached data) ──
    const col = getEventsCol()
    if (!col) {
      console.warn("[EventsProvider] Firebase not initialized — skipping onSnapshot. Check your .env.local")
      setIsLoading(false)
      return
    }
    const unsub = onSnapshot(
      col,
      (snapshot) => {
        const fetched: MainEvent[] = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            ...data,
            id: d.id,
            // Ensure arrays exist even if missing in Firestore
            subEvents: data.subEvents || [],
            registrations: data.registrations || [],
            chatMessages: data.chatMessages || [],
            announcements: data.announcements || [],
            tasks: data.tasks || [],
            automations: data.automations || [],
            automationLogs: data.automationLogs || [],
            importantLinks: data.importantLinks || [],
            restricted_registrations: data.restricted_registrations || [],
            rules: data.rules || [],
            registrationOpen: data.registrationOpen !== false,
            registrationDeadline: data.registrationDeadline || "",
          } as MainEvent
        })
        setEvents(fetched)
        setIsLoading(false)
        // Persist fresh data to sessionStorage for the next reload
        try {
          sessionStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(eventsForCache(fetched)))
        } catch {}
      },
      (error) => {
        // Firestore error — cached data is already displayed; just stop loading
        console.error('[EventsProvider] Firestore listener error:', error)
        setIsLoading(false)
      }
    )
    return () => unsub()
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

  const registerForSubEvent = async (eventId: string, _subEventId: string, reg: Registration) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return

    await updateDoc(getEventRef(eventId), {
      registrations: arrayUnion(reg),
      registeredCount: increment(1),
    })

    // Trigger on_register automation
    const onRegisterRule = evt.automations.find(a => a.trigger === "on_register" && a.enabled)
    if (onRegisterRule) {
      try {
        // Send notification
        const subEvent = evt.subEvents.find(se => se.id === _subEventId)
        await sendRegistrationConfirmation(
          eventId,
          evt.title,
          reg.userEmail,
          subEvent?.name || "Event"
        )

        // Log automation
        await addAutomationLog(eventId, {
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

  // Module 1 — Payment
  const submitTransaction = async (eventId: string, regId: string, transactionId: string, method: string) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    // Auto-approve Razorpay payments (they're verified), keep others as PENDING
    const isPaid = method === "razorpay"
    const updatedRegs = evt.registrations.map(r =>
      r.id === regId ? { 
        ...r, 
        transactionId, 
        paymentMethod: method,
        status: isPaid ? "PAID" : "PENDING"
      } : r
    )
    await updateDoc(getEventRef(eventId), { registrations: updatedRegs })

    // Send payment confirmation if approved
    if (isPaid) {
      const reg = evt.registrations.find(r => r.id === regId)
      if (reg) {
        try {
          await sendPaymentConfirmation(eventId, evt.title, reg.userEmail, evt.price)

          // Trigger payment_pending automation if exists
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
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const updatedRegs = evt.registrations.map(r =>
      r.id === regId ? { ...r, status: "PAID" as const } : r
    )
    await updateDoc(getEventRef(eventId), { registrations: updatedRegs })
  }

  const rejectPayment = async (eventId: string, regId: string) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const updatedRegs = evt.registrations.map(r =>
      r.id === regId ? { ...r, status: "REFUNDED" as const } : r
    )
    await updateDoc(getEventRef(eventId), { registrations: updatedRegs })
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
        await sendAnnouncementNotification(
          eventId,
          evt.title,
          registeredEmails,
          a.title,
          a.message
        )
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
        await sendTaskAssignment(
          eventId,
          evt.title,
          task.assignedTo,
          task.title,
          task.deadline
        )
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
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const updatedRegs = evt.registrations.map(r =>
      r.id === regId ? { ...r, checkedIn: true, checkInTime: new Date().toISOString() } : r
    )
    await updateDoc(getEventRef(eventId), { registrations: updatedRegs })
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
      events, isLoading, addEvent, deleteEvent, updateEvent, registerForSubEvent, addChatMessage, addCoordinator,
      submitTransaction, approvePayment, rejectPayment,
      addAnnouncement, addTask, updateTaskStatus, updateTaskOrder, checkInParticipant,
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
