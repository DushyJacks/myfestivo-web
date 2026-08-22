"use client"

import { useAuth } from "@/lib/auth-context"
import { useEvents } from "@/lib/events-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { GlassCard } from "@/components/ui/GlassCard"
import { MicroLabel } from "@/components/ui/MicroLabel"
import { PageTransition, pageItem } from "@/components/animation/PageTransition"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QRCodeSVG } from "qrcode.react"
import { TaskBoard } from "@/components/event/TaskBoard"
import {
  ChevronRight, Ticket, BarChart3,
  ListTodo, QrCode, CheckSquare, Clock, DollarSign,
  Pencil, PlusCircle, CalendarDays, Users
} from "lucide-react"
import { formatDateDisplay, formatTimeDisplay } from "@/lib/utils"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const { events, updateTaskStatus, acceptTeamRequest, rejectTeamRequest } = useEvents()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "hosted" | "registered" | "tasks">("overview")
  const [showQR, setShowQR] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    action: "accept" | "decline"
    eventId: string
    regId: string
    email: string
    eventTitle: string
    seName: string
    teamName: string
  } | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
    else if (!isLoading && user && user.role === "admin") router.push("/admin")
  }, [user, isLoading, router])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!user) return null

  const registeredEvents = events.filter(e => e.registrations.some(r => r.status !== "DRAFT" && (r.userEmail === user.email || r.teamMembers?.includes(user.email))))
  const hostedEvents = events.filter(e => e.organizerEmail === user.email)
  const coordinatingEvents = events.filter(e => e.subEvents.some(se => se.coordinators.some(c => c.email === user.email)))

  const myTasks = events.flatMap(e =>
    e.tasks.filter(t => t.assignedTo === user.email || t.assignedTo === user.collegeEmail).map(t => ({ ...t, eventTitle: e.title, eventId: e.id }))
  )
  const pendingTasks = myTasks.filter(t => t.status !== "DONE")

  const teamRequests = events.flatMap(e => 
    e.registrations
      .filter(r => r.pendingMembers?.includes(user.email))
      .map(r => ({ event: e, registration: r }))
  )


  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "registered" as const, label: "My Tickets", icon: QrCode },
    { id: "hosted" as const, label: "Hosted", icon: PlusCircle },
    { id: "tasks" as const, label: `Tasks${pendingTasks.length > 0 ? ` (${pendingTasks.length})` : ''}`, icon: ListTodo },
  ]

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <AppSidebar activeItem="dashboard" />

      <main className="flex-1 md:ml-[72px] lg:ml-[260px] pb-20 md:pb-0 min-w-0">
        <PageTransition className="p-6 lg:p-10 max-w-6xl mx-auto">
          <motion.div variants={pageItem} className="mb-10">
            <MicroLabel>Student Dashboard</MicroLabel>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight">Hey, {user.name.split(" ")[0]}.</h1>
          </motion.div>

          <motion.div variants={pageItem} className="flex gap-1 mb-10 border-b dark:border-[var(--color-border)] border-[rgba(179,136,255,0.15)] overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#B388FF] border-[#B388FF]"
                    : "dark:text-[var(--color-text-faint)] text-[#6B6480] border-transparent hover:text-[#B388FF]/70"
                }`}>
                <tab.icon className="w-4 h-4" strokeWidth={1.5} />{tab.label}
              </button>
            ))}
          </motion.div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <motion.div variants={pageItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{registeredEvents.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--color-text-muted)]">Registered</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{hostedEvents.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--color-text-muted)]">Hosted</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{coordinatingEvents.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--color-text-muted)]">Coordinating</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1 text-yellow-400">{pendingTasks.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--color-text-muted)]">Pending Tasks</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{user.friends.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--color-text-muted)]">Friends</div>
                </GlassCard>
              </motion.div>

              <motion.div variants={pageItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <Link href="/events">
                  <GlassCard className="p-6 hover:scale-[1.01] transition-transform cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div><h3 className="font-medium mb-1">Browse Events</h3><p className="text-sm text-[var(--color-text-muted)]">Find and register for upcoming events</p></div>
                      <ChevronRight className="w-5 h-5 text-[var(--color-text-faint)] group-hover:text-[var(--color-text-muted)] transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
                <Link href="/events/create">
                  <GlassCard className="p-6 hover:scale-[1.01] transition-transform cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div><h3 className="font-medium mb-1">Host New Event</h3><p className="text-sm text-[var(--color-text-muted)]">Create and manage your own event</p></div>
                      <ChevronRight className="w-5 h-5 text-[var(--color-text-faint)] group-hover:text-[var(--color-text-muted)] transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
              {teamRequests.length > 0 && (
                <motion.div variants={pageItem} className="mb-10">
                  <MicroLabel>Team Invitations</MicroLabel>
                  <div className="space-y-2">
                      {teamRequests.map(({ event, registration: r }) => {
                      const se = event.subEvents.find(s => s.id === r.subEventId)
                      return (
                        <GlassCard key={r.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-sm">{event.title} - {se?.name}</h3>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Invited by {r.userName} ({r.teamName})</p>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-8 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setConfirmDialog({ action: "decline", eventId: event.id, regId: r.id, email: user.email, eventTitle: event.title, seName: se?.name || "", teamName: r.teamName || "" })}>Decline</Button>
                            <Button size="sm" className="flex-1 sm:flex-none h-8 bg-[#B388FF] text-black hover:bg-[#B388FF]/90" onClick={() => setConfirmDialog({ action: "accept", eventId: event.id, regId: r.id, email: user.email, eventTitle: event.title, seName: se?.name || "", teamName: r.teamName || "" })}>Accept</Button>
                          </div>
                        </GlassCard>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {pendingTasks.length > 0 && (
                <motion.div variants={pageItem} className="mb-10">
                  <MicroLabel>Assigned Tasks</MicroLabel>
                  <div className="space-y-2">
                    {pendingTasks.slice(0, 5).map(t => (
                      <Link key={t.id} href={`/events/${t.eventId}`}>
                        <GlassCard className="p-4 hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${t.status === "IN_PROGRESS" ? 'bg-yellow-500/10' : 'bg-[var(--color-surface-3)]'}`}>
                            {t.status === "IN_PROGRESS" ? <Clock className="w-4 h-4 text-yellow-400" /> : <CheckSquare className="w-4 h-4 text-[var(--color-text-faint)]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{t.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{t.eventTitle}</span>
                              {t.deadline && <span className={`text-[10px] font-mono flex items-center gap-0.5 ${new Date(t.deadline) < new Date() ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}><CalendarDays className="w-3 h-3" /> {t.deadline}</span>}
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${t.status === "IN_PROGRESS" ? "border-yellow-500/30 text-yellow-400" : "border-[var(--color-border)] text-[var(--color-text-faint)]"}`}>{t.status.replace("_", " ")}</span>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* MY TICKETS */}
          {activeTab === "registered" && (
            <motion.div variants={pageItem}>
              <MicroLabel>My Tickets & QR Passes</MicroLabel>
              {registeredEvents.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="font-mono text-[var(--color-text-faint)] text-lg mb-4">No tickets yet</p>
                  <Link href="/events"><Button className="bg-white text-black hover:bg-[#B388FF]">Browse Events</Button></Link>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {registeredEvents.map(evt => {
                    const myRegs = evt.registrations.filter(r => r.status !== "DRAFT" && (r.userEmail === user.email || r.teamMembers?.includes(user.email)))
                    return (
                      <GlassCard key={evt.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium mb-1">{evt.title}</h3>
                            <p className="text-xs font-mono text-[var(--color-text-muted)]">{formatDateDisplay(evt.date)}{evt.hasTime && evt.time ? ` at ${formatTimeDisplay(evt.time)}` : ''} &mdash; {evt.venue}</p>
                          </div>
                          <Link href={`/events/${evt.id}`}>
                            <Button variant="outline" className="border-[var(--color-border)] text-[var(--color-text)] text-xs">View Event</Button>
                          </Link>
                        </div>
                        {myRegs.map(reg => {
                          const subEvt = evt.subEvents.find(se => se.id === reg.subEventId)
                          const isOpen = showQR === reg.id
                          return (
                            <div key={reg.id} className="mb-3 p-3 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm">{subEvt?.name || "Sub-Event"}</p>
                                    {reg.teamName && <p className="text-xs text-[var(--color-text-faint)]">Team: {reg.teamName}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono text-[10px] px-2 py-0.5 border rounded ${reg.status === "PAID" || reg.status === "FREE" ? "border-[var(--color-success)]/30 text-[var(--color-success)]" : reg.status === "PENDING" ? "border-yellow-500/30 text-yellow-400" : "border-[var(--color-border)] text-[var(--color-text-faint)]"}`}>
                                    {reg.status === "PAID" || reg.status === "FREE" ? "REGISTERED" : reg.status}
                                  </span>
                                  {reg.checkedIn && <span className="text-[10px] font-mono text-[var(--color-success)] flex items-center gap-1"><CheckSquare className="w-3 h-3" />Checked In</span>}
                                  <button onClick={() => setShowQR(isOpen ? null : reg.id)} aria-label={isOpen ? "Hide QR pass" : "Show QR pass"} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                                    <QrCode className="w-3 h-3" aria-hidden="true" />{isOpen ? "Hide" : "QR Pass"}
                                  </button>
                                </div>
                              </div>
                              {isOpen && (
                                <div className="mt-4 flex flex-col items-center pt-4 border-t border-[var(--color-border)]">
                                  <div className="p-4 bg-white rounded-lg mb-3">
                                    <QRCodeSVG value={`MYFESTIVO:${evt.id}:${reg.subEventId}:${reg.id}`} size={160} />
                                  </div>
                                  <p className="text-[10px] font-mono text-[var(--color-text-muted)]">{reg.id}</p>
                                  <p className="text-[10px] font-mono text-[var(--color-text-muted)]">Show this at check-in</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </GlassCard>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* HOSTED */}
          {activeTab === "hosted" && (
            <motion.div variants={pageItem}>
              <div className="flex justify-between items-center mb-6">
                <MicroLabel className="mb-0">Events You Hosted</MicroLabel>
                <Link href="/events/create"><Button className="bg-white text-black hover:bg-[#B388FF] text-sm"><PlusCircle className="w-4 h-4 mr-2" />New Event</Button></Link>
              </div>
              {hostedEvents.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="font-mono text-[var(--color-text-faint)] text-lg mb-4">No events hosted yet</p>
                  <Link href="/events/create"><Button className="bg-white text-black hover:bg-[#B388FF]">Host Your First Event</Button></Link>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {hostedEvents.map(evt => (
                    <GlassCard key={evt.id} className="p-5 transition-colors">
                      {/* Top row: title + date */}
                      <div className="mb-3">
                        <h3 className="text-base font-semibold truncate mb-0.5">{evt.title}</h3>
                        <p className="text-[11px] font-mono text-[var(--color-text-muted)]">{formatDateDisplay(evt.date)}{(evt as any).hasTime && (evt as any).time ? ` at ${formatTimeDisplay((evt as any).time)}` : ''}</p>
                      </div>

                      {/* Stats — 2×2 grid on mobile, single row on sm+ */}
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-text-muted)] mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 shrink-0" />
                          <span>{evt.registrations.filter(r => r.status !== "DRAFT").length} registrations</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 shrink-0" />
                          <span>{evt.subEvents.length} sub-events</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 shrink-0" />
                          <span>₹{(evt.registrations.filter(r => r.status === "PAID").length * evt.price).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <ListTodo className="w-3 h-3 shrink-0" />
                          <span>{evt.tasks.filter(t => t.status !== "DONE").length} open tasks</span>
                        </span>
                      </div>

                      {/* Action buttons — stack on mobile, row on sm+ */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                        <Link href={`/events/${evt.id}/edit`} className="flex-1 sm:flex-none">
                          <Button variant="outline" className="w-full sm:w-auto border-[var(--color-border)] text-[var(--color-text)] text-xs h-9 px-4 hover:bg-[var(--color-surface-3)]">
                            <Pencil className="w-3 h-3 mr-1.5" />Edit
                          </Button>
                        </Link>
                        <Link href={`/events/${evt.id}`} className="flex-1 sm:flex-none">
                          <Button variant="ghost" className="w-full sm:w-auto text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs h-9 px-4">
                            View<ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TASKS */}
          {activeTab === "tasks" && (
            <motion.div variants={pageItem}>
              <MicroLabel>My Assigned Tasks</MicroLabel>
              {myTasks.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="font-mono text-[var(--color-text-faint)] text-lg mb-4">No tasks assigned</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Tasks assigned to you by event organizers will appear here.</p>
                </GlassCard>
              ) : (
                <TaskBoard
                  tasks={myTasks}
                  onTasksReorder={(reorderedTasks, status) => {
                    // Find the event and update task status/order
                    const tasksWithoutEventMeta = reorderedTasks.map(({ eventTitle, eventId, ...task }) => task)
                    // Group by event and update each event's tasks
                    const eventTaskMap = new Map<string, typeof tasksWithoutEventMeta>()
                    reorderedTasks.forEach(task => {
                      if (!eventTaskMap.has(task.eventId)) {
                        eventTaskMap.set(task.eventId, [])
                      }
                      const { eventTitle, eventId, ...taskData } = task
                      eventTaskMap.get(task.eventId)?.push(taskData)
                    })
                    // Update each event with its reordered tasks
                    eventTaskMap.forEach((tasks, eventId) => {
                      // Since we're just reordering visually, we'd update the status if changed
                      tasks.forEach(task => {
                        if (task.status !== myTasks.find(mt => mt.id === task.id)?.status) {
                          updateTaskStatus(eventId, task.id, task.status)
                        }
                      })
                    })
                  }}
                />
              )}
            </motion.div>
          )}

          {/* Friends moved to /friends \u2014 accessible via sidebar */}
        </PageTransition>
      </main>

      {/* Confirmation Dialog for Team Invitations */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-surface)]/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0A0A0A] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <h2 className="text-xl font-medium mb-2">Confirm {confirmDialog.action === "accept" ? "Acceptance" : "Decline"}</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                Are you sure you want to {confirmDialog.action} the invitation for <strong>{confirmDialog.eventTitle}</strong> ({confirmDialog.seName}) from team <strong>{confirmDialog.teamName}</strong>?
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" className="border-[var(--color-border)]" onClick={() => setConfirmDialog(null)}>
                  Cancel
                </Button>
                {confirmDialog.action === "accept" ? (
                  <Button
                    className="bg-[#B388FF] text-black hover:bg-[#B388FF]/90"
                    onClick={() => {
                      acceptTeamRequest(confirmDialog.eventId, confirmDialog.regId, confirmDialog.email)
                      setConfirmDialog(null)
                    }}
                  >
                    Accept Invitation
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      rejectTeamRequest(confirmDialog.eventId, confirmDialog.regId, confirmDialog.email)
                      setConfirmDialog(null)
                    }}
                  >
                    Decline Invitation
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

