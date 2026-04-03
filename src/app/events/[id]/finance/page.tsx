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

import {
  ArrowLeft, DollarSign, TrendingUp, Users, CheckCircle2,
  Clock, XCircle, CreditCard, BarChart3, PieChart, BadgeCheck
} from "lucide-react"

export default function FinancePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { events, approvePayment, rejectPayment } = useEvents()

  const event = events.find(e => e.id === params.id)

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40 font-mono">Event not found</p>
      </div>
    )
  }

  const isHost = user?.email === event.organizerEmail
  if (!isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 font-mono mb-4">Access denied — hosts only</p>
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" className="border-white/20 text-white text-sm">Back to Event</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Financial calculations
  const totalRegs = event.registrations.length
  const paidRegs = event.registrations.filter(r => r.status === "PAID")
  const pendingRegs = event.registrations.filter(r => r.status === "PENDING")
  const refundedRegs = event.registrations.filter(r => r.status === "REFUNDED")

  const totalRevenue = paidRegs.length * event.price
  const pendingRevenue = pendingRegs.length * event.price
  const refundedAmount = refundedRegs.length * event.price
  const potentialRevenue = totalRegs * event.price
  const collectionRate = totalRegs > 0 ? Math.round((paidRegs.length / totalRegs) * 100) : 0

  // Sub-event breakdown
  const subEventFinance = event.subEvents.map(se => {
    const seRegs = event.registrations.filter(r => r.subEventId === se.id)
    const sePaid = seRegs.filter(r => r.status === "PAID")
    const sePending = seRegs.filter(r => r.status === "PENDING")
    return {
      name: se.name,
      totalRegs: seRegs.length,
      paidCount: sePaid.length,
      pendingCount: sePending.length,
      revenue: sePaid.length * event.price,
    }
  })

  // Payment methods breakdown
  const paymentMethods: Record<string, number> = {}
  paidRegs.forEach(r => {
    const method = r.paymentMethod || "Unknown"
    paymentMethods[method] = (paymentMethods[method] || 0) + 1
  })

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-[72px] lg:left-[260px] right-0 h-16 flex items-center justify-between px-8 z-50 bg-black/60 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <Link href={`/events/${event.id}`} className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="font-medium text-white">{event.title}</span>
            <span className="text-white/30 text-xs ml-2 font-mono">/ Finance</span>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
        <PageTransition>
          <motion.div variants={pageItem} className="mb-10">
            <MicroLabel>Finance Dashboard</MicroLabel>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight">Revenue Overview</h1>
            <p className="text-sm text-white/30 mt-2">Financial breakdown for {event.title}</p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div variants={pageItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-light mb-1 text-green-400">₹{totalRevenue.toLocaleString()}</div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Collected Revenue</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
              <div className="text-3xl font-light mb-1 text-yellow-400">₹{pendingRevenue.toLocaleString()}</div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Pending Revenue</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white/40" />
                </div>
              </div>
              <div className="text-3xl font-light mb-1">{collectionRate}%</div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Collection Rate</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Users className="w-4 h-4 text-white/40" />
                </div>
              </div>
              <div className="text-3xl font-light mb-1">{totalRegs}</div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Total Registrations</div>
            </GlassCard>
          </motion.div>

          {/* Revenue Status Breakdown */}
          <motion.div variants={pageItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <GlassCard className="p-6">
              <MicroLabel>Registration Status</MicroLabel>
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Paid</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-white/60">{paidRegs.length} registrations</span>
                    <span className="text-sm font-mono text-green-400">₹{(paidRegs.length * event.price).toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-green-500/40 rounded-full" style={{ width: `${totalRegs > 0 ? (paidRegs.length / totalRegs) * 100 : 0}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-white/60">{pendingRegs.length} registrations</span>
                    <span className="text-sm font-mono text-yellow-400">₹{(pendingRegs.length * event.price).toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-yellow-500/40 rounded-full" style={{ width: `${totalRegs > 0 ? (pendingRegs.length / totalRegs) * 100 : 0}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm">Refunded</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-white/60">{refundedRegs.length} registrations</span>
                    <span className="text-sm font-mono text-red-400">₹{refundedAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-red-500/40 rounded-full" style={{ width: `${totalRegs > 0 ? (refundedRegs.length / totalRegs) * 100 : 0}%` }} />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <MicroLabel>Revenue Summary</MicroLabel>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                  <span className="text-sm text-white/50">Event Price</span>
                  <span className="text-sm font-mono">{event.price === 0 ? "FREE" : `₹${event.price}`}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                  <span className="text-sm text-white/50">Total Potential</span>
                  <span className="text-sm font-mono text-white/60">₹{potentialRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                  <span className="text-sm text-white/50">Collected</span>
                  <span className="text-sm font-mono text-green-400">₹{totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/[0.06]">
                  <span className="text-sm text-white/50">Pending</span>
                  <span className="text-sm font-mono text-yellow-400">₹{pendingRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-white/50">Refunded</span>
                  <span className="text-sm font-mono text-red-400">-₹{refundedAmount.toLocaleString()}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Sub-Event Finance */}
          {subEventFinance.length > 0 && (
            <motion.div variants={pageItem} className="mb-10">
              <MicroLabel>Sub-Event Breakdown</MicroLabel>
              <div className="overflow-x-auto rounded-xl border border-white/[0.06] mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03] text-white/50">
                      <th className="text-left p-3 font-medium text-[11px] tracking-widest uppercase">Sub-Event</th>
                      <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Total Regs</th>
                      <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Paid</th>
                      <th className="text-center p-3 font-medium text-[11px] tracking-widest uppercase">Pending</th>
                      <th className="text-right p-3 font-medium text-[11px] tracking-widest uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subEventFinance.map((se, i) => (
                      <tr key={se.name} className={`border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                        <td className="p-3 text-white/80">{se.name}</td>
                        <td className="p-3 text-center font-mono text-white/50">{se.totalRegs}</td>
                        <td className="p-3 text-center font-mono text-green-400">{se.paidCount}</td>
                        <td className="p-3 text-center font-mono text-yellow-400">{se.pendingCount}</td>
                        <td className="p-3 text-right font-mono text-white/70">₹{se.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Payment Methods */}
          {Object.keys(paymentMethods).length > 0 && (
            <motion.div variants={pageItem}>
              <MicroLabel>Payment Methods</MicroLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {Object.entries(paymentMethods).map(([method, count]) => (
                  <GlassCard key={method} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-white/30" />
                      <span className="text-xs font-mono text-white/50 uppercase">{method}</span>
                    </div>
                    <div className="text-2xl font-light">{count}</div>
                    <div className="text-[10px] font-mono text-white/30">transactions</div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Transactions */}
          {paidRegs.length > 0 && (
            <motion.div variants={pageItem} className="mt-10">
              <MicroLabel>Recent Transactions</MicroLabel>
              <div className="space-y-2 mt-4">
                {paidRegs.slice(0, 10).map(reg => {
                  const subEvt = event.subEvents.find(se => se.id === reg.subEventId)
                  return (
                    <div key={reg.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white/80">{reg.userName}</p>
                          <p className="text-[10px] font-mono text-white/30">{subEvt?.name || "—"} · {reg.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-green-400">₹{event.price}</p>
                        {reg.transactionId && (
                          <p className="text-[9px] font-mono text-white/20">TX: {reg.transactionId}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Payment Management */}
          <motion.div variants={pageItem} className="mt-10">
            <div className="flex justify-between items-center mb-6">
              <MicroLabel>Payment Management</MicroLabel>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] text-white/50">
                    <th className="text-left p-3 text-[10px] font-mono tracking-widest">Registrant</th>
                    <th className="text-left p-3 text-[10px] font-mono tracking-widest">Sub-Event</th>
                    <th className="text-left p-3 text-[10px] font-mono tracking-widest">Transaction Info</th>
                    <th className="text-right p-3 text-[10px] font-mono tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {event.registrations.map(reg => {
                    const se = event.subEvents.find(s => s.id === reg.subEventId)
                    return (
                      <tr key={reg.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="p-3">
                          <div className="font-medium">{reg.userName}</div>
                          <div className="text-[10px] text-white/30 font-mono italic">{reg.userEmail}</div>
                        </td>
                        <td className="p-3 text-white/60">{se?.name}</td>
                        <td className="p-3">
                          {reg.transactionId ? (
                            <div>
                              <div className="text-[11px] font-mono text-white/80 uppercase">{reg.transactionId}</div>
                              <div className="text-[10px] text-white/40 font-mono">{reg.paymentMethod} • {reg.timestamp}</div>
                            </div>
                          ) : <span className="text-[10px] font-mono text-white/20">NO TRANSACTION</span>}
                        </td>
                        <td className="p-3 text-right">
                          {reg.status === "PENDING" && reg.transactionId && (
                            <div className="flex justify-end gap-2">
                              <Button onClick={() => approvePayment(event.id, reg.id)} className="h-7 px-3 bg-green-500 text-black text-[9px] font-mono uppercase tracking-widest hover:bg-green-400">Approve</Button>
                              <Button onClick={() => rejectPayment(event.id, reg.id)} variant="ghost" className="h-7 px-3 border border-red-500/30 text-red-400 text-[9px] font-mono uppercase tracking-widest hover:bg-red-500/10 hover:text-red-300">Reject</Button>
                            </div>
                          )}
                          {reg.status === "PAID" && <span className="text-green-400 text-[9px] font-mono flex items-center justify-end gap-1"><BadgeCheck className="w-3 h-3" /> VERIFIED</span>}
                          {reg.status === "REFUNDED" && <span className="text-white/20 text-[9px] font-mono flex items-center justify-end gap-1">REJECTED</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </PageTransition>
      </div>
    </>
  )
}
