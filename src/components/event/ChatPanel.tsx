"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEvents, ChatMessage } from "@/lib/events-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatPanelProps {
  eventId: string
  channelId: string // "general" or sub-event ID
  channelLabel: string
  messages: ChatMessage[]
}

export function ChatPanel({ eventId, channelId, channelLabel, messages }: ChatPanelProps) {
  const { user } = useAuth()
  const { addChatMessage } = useEvents()
  const [msg, setMsg] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const filtered = messages.filter(m => m.subEventId === channelId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [filtered.length])

  const send = async () => {
    if (!user || !msg.trim()) return
    await addChatMessage(eventId, channelId, {
      id: `chat-${Date.now()}`,
      eventId,
      subEventId: channelId,
      userId: user.id,
      userName: user.name,
      message: msg.trim(),
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
    })
    setMsg("")
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase px-4 py-3 border-b border-white/[0.06]">
        # {channelLabel}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filtered.length === 0 && (
          <p className="text-white/20 text-sm font-mono text-center py-12">No messages yet. Start the conversation!</p>
        )}
        {filtered.map(m => (
          <div key={m.id} className={`flex flex-col ${m.userId === user?.id ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-white/40">{m.userName}</span>
              <span className="text-[9px] font-mono text-white/20">{m.timestamp.slice(11)}</span>
            </div>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              m.userId === user?.id
                ? "bg-white/[0.1] text-white/90"
                : "bg-white/[0.04] border border-white/[0.08] text-white/70"
            }`}>
              {m.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {user && (
        <div className="px-4 py-3 border-t border-white/[0.06] flex gap-2">
          <Input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 text-sm h-9 flex-1"
          />
          <Button onClick={send} disabled={!msg.trim()} className="h-9 px-3 bg-white text-black hover:bg-white/90">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
