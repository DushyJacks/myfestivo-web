"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEvents, ChatMessage, MainEvent } from "@/lib/events-context"
import { sanitizeUserInput } from "@/lib/xss-protection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Shield, Zap } from "lucide-react"

interface ChatPanelProps {
  event: MainEvent
  eventId: string
  channelId: string // "general" or sub-event ID
  channelLabel: string
  messages: ChatMessage[]
}

/** Format a date-only label like WhatsApp: Today, Yesterday, or "Mon, 14 Jul" */
function formatDateLabel(dateStr: string): string {
  // dateStr is "YYYY-MM-DD"
  const msgDate = new Date(dateStr + "T00:00:00")
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const toKey = (d: Date) => d.toISOString().slice(0, 10)

  if (toKey(msgDate) === toKey(today)) return "Today"
  if (toKey(msgDate) === toKey(yesterday)) return "Yesterday"

  return msgDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

/** Extract YYYY-MM-DD from a "YYYY-MM-DD HH:mm" timestamp */
function extractDate(timestamp: string): string {
  return timestamp.slice(0, 10)
}

/** Format time portion for display: "HH:mm" */
function formatTime(timestamp: string): string {
  // timestamp may be "YYYY-MM-DD HH:mm"
  if (timestamp.length >= 16) return timestamp.slice(11, 16)
  return timestamp
}

export function ChatPanel({ event, eventId, channelId, channelLabel, messages }: ChatPanelProps) {
  const { user } = useAuth()
  const { addChatMessage } = useEvents()
  const [msg, setMsg] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const filtered = messages.filter(m => m.subEventId === channelId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [filtered.length])

  // Determine user roles
  const isEventOrganizer = user && event.organizerEmail === user.email
  const eventCoordinatorRoles = user 
    ? (event.eventCoordinators || []).filter(c => c.email === user.email).map(c => c.role)
    : []
  const subEventCoordinatorRoles = user ? event.subEvents
    .filter(se => se.coordinators.some(c => c.email === user.email))
    .map(se => ({
      subEventName: se.name,
      role: se.coordinators.find(c => c.email === user.email)?.role || ""
    })) : []

  const getUserRole = (messageUserId: string, messageUserEmail: string) => {
    const isOrganizer = event.organizerEmail === messageUserEmail
    
    // Check for event-level coordinators
    const eventCoordinatorRoles = event.eventCoordinators
      ?.filter(c => c.email === messageUserEmail)
      .map(c => c.role)
      .filter(Boolean) || []
    
    // Check for sub-event coordinators
    const subEventRoles = event.subEvents
      .filter(se => se.coordinators.some(c => c.email === messageUserEmail))
      .map(se => se.coordinators.find(c => c.email === messageUserEmail)?.role)
      .filter(Boolean)
    
    return { isOrganizer, eventCoordinatorRoles: eventCoordinatorRoles as string[], subEventRoles: subEventRoles as string[] }
  }

  const send = async () => {
    if (!user || !msg.trim()) return
    await addChatMessage(eventId, channelId, {
      id: `chat-${Date.now()}`,
      eventId,
      subEventId: channelId,
      userId: user.id,
      userName: user.name,
      message: msg.trim(),
      timestamp: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16),
    })
    setMsg("")
  }

  return (
    <div className="flex flex-col h-[600px] bg-white/[0.01] border border-white/[0.06] rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Channel</p>
        <p className="font-medium text-white"># {channelLabel}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/20 text-sm font-mono text-center">No messages yet. Start the conversation!</p>
          </div>
        )}
        {filtered.map((m, idx) => {
          const { isOrganizer, eventCoordinatorRoles, subEventRoles } = getUserRole(m.userId, m.userId)
          
          // ── Date separator logic ──────────────────────────────────
          const msgDate = extractDate(m.timestamp)
          const prevDate = idx > 0 ? extractDate(filtered[idx - 1].timestamp) : null
          const showDateSeparator = msgDate !== prevDate

          return (
            <div key={m.id}>
              {/* WhatsApp-style date separator */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono text-white/40 bg-white/[0.05] border border-white/[0.08] tracking-widest">
                    {formatDateLabel(msgDate)}
                  </span>
                </div>
              )}

              <div className={`flex flex-col ${m.userId === user?.id ? "items-end" : "items-start"}`}>
                {/* User info with roles */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{m.userName}</span>
                    
                    {/* Overall Event Organizer Badge */}
                    {isOrganizer && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded-full text-[10px] font-mono text-purple-300 tracking-tight">
                        <Shield className="w-3 h-3" />
                        EVENT ORG
                      </span>
                    )}
                    
                    {/* Event-Level Coordinator Badges */}
                    {eventCoordinatorRoles.length > 0 && eventCoordinatorRoles.map((role, i) => (
                      <span key={`event-${i}`} className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-[10px] font-mono text-amber-300 tracking-tight">
                        <Shield className="w-3 h-3" />
                        {role.toUpperCase()}
                      </span>
                    ))}
                    
                    {/* Sub-Event Coordinator Badges */}
                    {subEventRoles.length > 0 && subEventRoles.map((role, i) => (
                      <span key={`sub-${i}`} className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 rounded-full text-[10px] font-mono text-blue-300 tracking-tight">
                        <Zap className="w-3 h-3" />
                        {role.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  
                  {/* Show date + time */}
                  <span className="text-[9px] font-mono text-white/20">
                    {formatTime(m.timestamp)}
                  </span>
                </div>
                
                {/* Message bubble */}
                <div className={`max-w-[70%] px-4 py-2.5 rounded-lg text-sm leading-relaxed ${
                  m.userId === user?.id
                    ? "bg-white/[0.1] border border-white/[0.15] text-white/90"
                    : "bg-white/[0.04] border border-white/[0.08] text-white/70"
                }`}>
                  {sanitizeUserInput(m.message)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {user && (
        <div className="px-4 py-4 border-t border-white/[0.06] bg-white/[0.01] flex gap-2">
          <Input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 text-sm h-10 flex-1 rounded-lg"
          />
          <Button 
            onClick={send} 
            disabled={!msg.trim()} 
            className="h-10 px-4 bg-white text-black hover:bg-white/90 rounded-lg font-medium"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
