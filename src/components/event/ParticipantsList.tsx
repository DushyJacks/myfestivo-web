"use client"

import { MainEvent, Registration } from "@/lib/events-context"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { Button } from "@/components/ui/button"
import { Download, Users, BadgeCheck, Clock, ExternalLink, Phone } from "lucide-react"
import { useState } from "react"
import { ParticipantDetailModal } from "./ParticipantDetailModal"

interface Props {
  event: MainEvent
}

export function ParticipantsList({ event }: Props) {
  const [filterSe, setFilterSe] = useState("")
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Exclude DRAFT registrations — those are team invitation placeholders, not confirmed participants
  const confirmedRegs = event.registrations.filter(r => r.status !== "DRAFT")

  const regs = filterSe
    ? confirmedRegs.filter(r => r.subEventId === filterSe)
    : confirmedRegs

  const downloadCSV = () => {
    const headers = ["Name", "Email", "Phone", "Sub-Event", "Status", "Team Name", "Team Members", "Registered At", "Checked In"]
    const rows = regs.map(r => {
      const se = event.subEvents.find(s => s.id === r.subEventId)
      return [
        r.userName,
        r.userEmail,
        r.userPhone || "",
        se?.name || "",
        r.status,
        r.teamName || "",
        (r.teamMembers || []).join("; "),
        r.timestamp,
        r.checkedIn ? "Yes" : "No",
      ]
    })
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${event.title.replace(/\s+/g, "_")}_participants.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Total</p>
          <p className="text-2xl font-light">{confirmedRegs.length}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Pending</p>
          <p className="text-2xl font-light text-yellow-400">{confirmedRegs.filter(r => r.status === "PENDING").length}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Checked In</p>
          <p className="text-2xl font-light">{confirmedRegs.filter(r => r.checkedIn).length}</p>
        </GlassCard>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MicroLabel className="mb-0">Participants ({regs.length})</MicroLabel>
          <select
            value={filterSe}
            onChange={e => setFilterSe(e.target.value)}
            className="h-7 bg-white/[0.03] border border-white/[0.08] text-white text-[10px] font-mono rounded px-2"
          >
            <option value="">All Sub-Events</option>
            {event.subEvents.map(se => (
              <option key={se.id} value={se.id}>{se.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={downloadCSV} variant="outline" className="h-8 px-4 text-[10px] font-mono border-white/20 text-white/60 hover:text-white gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03] text-white/50">
              <th className="text-left p-3 text-[10px] font-mono tracking-widest">#</th>
              <th className="text-left p-3 text-[10px] font-mono tracking-widest">Participant</th>
              <th className="text-left p-3 text-[10px] font-mono tracking-widest">Phone</th>
              <th className="text-left p-3 text-[10px] font-mono tracking-widest">Sub-Event</th>
              <th className="text-left p-3 text-[10px] font-mono tracking-widest">Team</th>
              <th className="text-left p-3 text-[10px] font-mono tracking-widest">Date</th>
            </tr>
          </thead>
          <tbody>
            {regs.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-white/20 font-mono">No registrations yet</td></tr>
            ) : regs.map((reg, i) => {
              const se = event.subEvents.find(s => s.id === reg.subEventId)
              return (
                <tr
                  key={reg.id}
                  onClick={() => {
                    setSelectedReg(reg)
                    setModalOpen(true)
                  }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <td className="p-3 text-white/30 font-mono text-xs">{i + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-mono text-white/40">
                        {reg.userName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{reg.userName}</p>
                        <p className="text-[10px] font-mono text-white/30">{reg.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {reg.userPhone ? (
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <Phone className="w-3 h-3 text-white/30" />
                        <span className="font-mono">{reg.userPhone}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-white/20">—</span>
                    )}
                  </td>
                  <td className="p-3 text-white/50 text-xs">{se?.name}</td>
                  <td className="p-3">
                    {reg.teamName ? (
                      <div>
                        <p className="text-xs text-white/60 flex items-center gap-1"><Users className="w-3 h-3" />{reg.teamName}</p>
                        {reg.teamMembers && reg.teamMembers.length > 1 && (
                          <p className="text-[10px] font-mono text-white/30">{reg.teamMembers.length} members</p>
                        )}
                      </div>
                    ) : <span className="text-[10px] font-mono text-white/20">Solo</span>}
                  </td>
                  <td className="p-3 text-[10px] font-mono text-white/30">{reg.timestamp}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Participant Detail Modal */}
      <ParticipantDetailModal 
        reg={selectedReg} 
        event={event} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  )
}
