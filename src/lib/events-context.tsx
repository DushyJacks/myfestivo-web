"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { db } from "./firebase"
import {
  collection, doc, onSnapshot, addDoc, updateDoc, arrayUnion, increment, setDoc, deleteDoc,
} from "firebase/firestore"

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
  registrations: Registration[]
  chatMessages: ChatMessage[]
  announcements: Announcement[]
  tasks: Task[]
  automations: AutomationRule[]
  automationLogs: AutomationLog[]
  importantLinks: ImportantLink[]
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
  checkInParticipant: (eventId: string, regId: string) => void
  addAutomation: (eventId: string, rule: AutomationRule) => void
  toggleAutomation: (eventId: string, ruleId: string) => void
  addAutomationLog: (eventId: string, log: AutomationLog) => void
}

const EventsContext = createContext<EventsContextType | null>(null)

const eventsCol = collection(db, "events")

// Helper: get current event from local state and update Firestore
function getEventRef(eventId: string) {
  return doc(db, "events", eventId)
}

// ─── Provider ───
export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<MainEvent[]>([])

  // Real-time listener for all events
  useEffect(() => {
    const unsub = onSnapshot(eventsCol, (snapshot) => {
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
          rules: data.rules || [],
          registrationOpen: data.registrationOpen !== false,
          registrationDeadline: data.registrationDeadline || "",
        } as MainEvent
      })
      setEvents(fetched)
    })
    return () => unsub()
  }, [])

  const addEvent = async (event: MainEvent) => {
    const { id, ...data } = event
    await setDoc(doc(db, "events", id), data)
  }

  const updateEvent = async (id: string, updates: Partial<MainEvent>) => {
    await updateDoc(getEventRef(id), updates as Record<string, unknown>)
  }

  const deleteEvent = async (id: string) => {
    await deleteDoc(getEventRef(id))
  }

  const registerForSubEvent = async (eventId: string, _subEventId: string, reg: Registration) => {
    await updateDoc(getEventRef(eventId), {
      registrations: arrayUnion(reg),
      registeredCount: increment(1),
    })
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
    await updateDoc(getEventRef(eventId), { subEvents: updatedSubEvents })
  }

  // Module 1 — Payment
  const submitTransaction = async (eventId: string, regId: string, transactionId: string, method: string) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const updatedRegs = evt.registrations.map(r =>
      r.id === regId ? { ...r, transactionId, paymentMethod: method } : r
    )
    await updateDoc(getEventRef(eventId), { registrations: updatedRegs })
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
    await updateDoc(getEventRef(eventId), { announcements: [a, ...evt.announcements] })
  }

  // Module 3 — Tasks
  const addTask = async (eventId: string, task: Task) => {
    await updateDoc(getEventRef(eventId), { tasks: arrayUnion(task) })
  }

  const updateTaskStatus = async (eventId: string, taskId: string, status: TaskStatus) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const updatedTasks = evt.tasks.map(t =>
      t.id === taskId ? { ...t, status } : t
    )
    await updateDoc(getEventRef(eventId), { tasks: updatedTasks })
  }

  // Module 4 — Check-In
  const checkInParticipant = async (eventId: string, regId: string) => {
    const evt = events.find(e => e.id === eventId)
    if (!evt) return
    const updatedRegs = evt.registrations.map(r =>
      r.id === regId ? { ...r, checkedIn: true, checkInTime: new Date().toISOString().slice(0, 16).replace("T", " ") } : r
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
      events, addEvent, deleteEvent, updateEvent, registerForSubEvent, addChatMessage, addCoordinator,
      submitTransaction, approvePayment, rejectPayment,
      addAnnouncement, addTask, updateTaskStatus, checkInParticipant,
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
