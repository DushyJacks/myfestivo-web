"use client"

import { useAuth } from "@/lib/auth-context"
import { useEvents } from "@/lib/events-context"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, DollarSign, TrendingUp, PieChart, Receipt, Check, Clock, X } from "lucide-react"
import { AppSidebar } from "@/components/layout/AppSidebar"

export default function FinancePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { events } = useEvents()

  const event = events.find(e => e.id === params.id)
  
  if (!event) { 
    router.push("/events")
    return null 
  }

  // Security check: Only the student host (Category 1) can see the finance dashboard
  const isHost = user?.email === event.organizerEmail
  if (!user || !isHost) { 
    router.push(`/events/${params.id}`)
    return null 
  }

  // Exclude DRAFT registrations (team invite placeholders) from all counts
  const confirmedRegs = event.registrations.filter(r => r.status !== "DRAFT")
  const paidRegs = event.registrations.filter(r => r.status === "PAID")
  const pendingRegs = event.registrations.filter(r => r.status === "PENDING")
  const refundedRegs = event.registrations.filter(r => r.status === "REFUNDED")
  const totalCollected = paidRegs.length * event.price
  const totalPending = pendingRegs.length * event.price
  const totalRefunded = refundedRegs.length * event.price

  // Per-sub-event breakdown — exclude DRAFTs
  const subEventBreakdown = event.subEvents.map(se => {
    const seRegs = confirmedRegs.filter(r => r.subEventId === se.id)
    const sePaid = seRegs.filter(r => r.status === "PAID")
    const sePending = seRegs.filter(r => r.status === "PENDING")
    return {
      name: se.name, type: se.type,
      total: seRegs.length, paid: sePaid.length, pending: sePending.length,
      revenue: sePaid.length * event.price,
      checkedIn: seRegs.filter(r => r.checkedIn).length,
    }
  })

  const exportCSV = () => {
    const headers = "Name,Email,Sub-Event,Team,Status,Transaction ID,Method,Checked In,Time\n"
    const rows = event.registrations.map(r => {
      const se = event.subEvents.find(s => s.id === r.subEventId)
      return `"${r.userName}","${r.userEmail}","${se?.name || ''}","${r.teamName || ''}","${r.status}","${r.transactionId || ''}","${r.paymentMethod || ''}","${r.checkedIn ? 'Yes' : 'No'}","${r.timestamp}"`
    }).join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `${event.title.replace(/\s+/g, '_')}_finance.csv`; a.click()
  }

  return (
    <>
      <header className="fixed top-0 left-[72px] lg:left-[260px] right-0 h-16 flex items-center justify-between px-8 z-50 bg-[var(--color-surface)]/60 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <Link href={`/events/${event.id}`} className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="font-medium text-[var(--color-text)]">{event.title} — Finance</span>
        </div>
        <button onClick={exportCSV} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs border border-[var(--color-border)] px-4 py-2 rounded-md transition-colors flex items-center gap-2"><Download className="w-4 h-4" />Export CSV</button>
      </header>

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
          <motion.div variants={pageItem} className="mb-10">
            <MicroLabel>Financial Overview</MicroLabel>
            <h1 className="text-3xl font-light tracking-tight text-[var(--color-text)]">Settlement Dashboard</h1>
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={pageItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <GlassCard className="p-6">
              <DollarSign className="w-5 h-5 text-[var(--color-success)] mb-2" />
              <div className="text-3xl font-light text-[var(--color-success)] mb-1">₹{totalCollected.toLocaleString()}</div>
              <div className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase">Collected</div>
            </GlassCard>
            <GlassCard className="p-6">
              <TrendingUp className="w-5 h-5 text-yellow-400 mb-2" />
              <div className="text-3xl font-light text-yellow-400 mb-1">₹{totalPending.toLocaleString()}</div>
              <div className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase">Pending</div>
            </GlassCard>
            <GlassCard className="p-6">
              <Receipt className="w-5 h-5 text-[var(--color-text-faint)] mb-2" />
              <div className="text-3xl font-light mb-1 text-[var(--color-text)]">₹{totalRefunded.toLocaleString()}</div>
              <div className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase">Refunded</div>
            </GlassCard>
            <GlassCard className="p-6">
              <PieChart className="w-5 h-5 text-[var(--color-text-faint)] mb-2" />
              <div className="text-3xl font-light mb-1 text-[var(--color-text)]">{confirmedRegs.length}</div>
              <div className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase">Total Regs</div>
            </GlassCard>
          </motion.div>

          {/* Sub-Event Breakdown */}
          <motion.div variants={pageItem} className="mb-10">
            <MicroLabel>Per Sub-Event Breakdown</MicroLabel>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                  <th className="text-left p-3 text-[10px] font-mono tracking-widest">Sub-Event</th>
                  <th className="text-left p-3 text-[10px] font-mono tracking-widest">Type</th>
                  <th className="text-right p-3 text-[10px] font-mono tracking-widest">Total</th>
                  <th className="text-right p-3 text-[10px] font-mono tracking-widest">Paid</th>
                  <th className="text-right p-3 text-[10px] font-mono tracking-widest">Pending</th>
                  <th className="text-right p-3 text-[10px] font-mono tracking-widest">Revenue</th>
                  <th className="text-right p-3 text-[10px] font-mono tracking-widest">Checked In</th>
                </tr></thead>
                <tbody>
                  {subEventBreakdown.map((se, i) => (
                    <tr key={i} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)]">
                      <td className="p-3 text-[var(--color-text)]">{se.name}</td>
                      <td className="p-3"><span className="text-[10px] font-mono border border-[var(--color-border)] text-[var(--color-text-faint)] px-2 py-0.5 rounded uppercase">{se.type}</span></td>
                      <td className="p-3 text-right font-mono text-[var(--color-text-muted)]">{se.total}</td>
                      <td className="p-3 text-right font-mono text-[var(--color-success)]">{se.paid}</td>
                      <td className="p-3 text-right font-mono text-yellow-400">{se.pending}</td>
                      <td className="p-3 text-right font-mono text-[var(--color-text-muted)]">₹{se.revenue.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-[var(--color-text-faint)]">{se.checkedIn}</td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--color-surface-2)] font-medium">
                    <td className="p-3 text-[var(--color-text-muted)]" colSpan={2}>TOTAL</td>
                    <td className="p-3 text-right font-mono text-[var(--color-text)]">{confirmedRegs.length}</td>
                    <td className="p-3 text-right font-mono text-[var(--color-success)]">{paidRegs.length}</td>
                    <td className="p-3 text-right font-mono text-yellow-400">{pendingRegs.length}</td>
                    <td className="p-3 text-right font-mono text-[var(--color-text)]">₹{totalCollected.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-[var(--color-text-faint)]">{confirmedRegs.filter(r => r.checkedIn).length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Payment Timeline */}
          <motion.div variants={pageItem} className="mb-10">
            <MicroLabel>Settlement Status</MicroLabel>
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-2">
                    <span>Collection Progress</span>
                    <span>{confirmedRegs.length > 0 ? Math.round(paidRegs.length / confirmedRegs.length * 100) : 0}%</span>
                  </div>
                  <div className="h-3 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all" style={{ width: `${confirmedRegs.length > 0 ? (paidRegs.length / confirmedRegs.length * 100) : 0}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-faint)] mt-2">
                    <span>₹0</span>
                    <span>₹{(confirmedRegs.length * event.price).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--color-border)]">
                <div className="text-center">
                  <p className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest mb-1 uppercase">Event Price</p>
                  <p className="text-lg font-light text-[var(--color-text)]">{event.price > 0 ? `₹${event.price}` : "Free"}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest mb-1 uppercase">Prize Pool</p>
                  <p className="text-lg font-light text-[var(--color-text)]">{event.prizePool || "—"}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest mb-1 uppercase">Net after Prizes</p>
                  <p className="text-lg font-light text-[var(--color-text)]">{event.prizePool ? `₹${(totalCollected - parseInt(event.prizePool.replace(/[^0-9]/g, '') || '0')).toLocaleString()}` : `₹${totalCollected.toLocaleString()}`}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={pageItem}>
            <MicroLabel>Transaction Log</MicroLabel>
            {event.registrations.filter(r => r.transactionId).length === 0 ? (
              <p className="text-[var(--color-text-faint)] text-sm font-mono p-12 text-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">No transactions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {event.registrations.filter(r => r.transactionId).map(r => {
                  const se = event.subEvents.find(s => s.id === r.subEventId)
                  return (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs ${r.status === "PAID" ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : r.status === "PENDING" ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-300'}`}>
                          {r.status === "PAID" ? <Check className="w-5 h-5" /> : r.status === "PENDING" ? <Clock className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{r.userName}</p>
                          <p className="text-[10px] font-mono text-[var(--color-text-faint)] uppercase tracking-tight">{se?.name} • {r.paymentMethod} • ID: {r.transactionId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-medium text-[var(--color-text)]">₹{event.price}</p>
                        <p className="text-[10px] font-mono text-[var(--color-text-faint)] mt-1">{r.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
      </div>
    </>
  )
}
