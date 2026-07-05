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
  ListTodo, QrCode, CheckSquare, Clock, DollarSign, Megaphone,
  Pencil, PlusCircle, CalendarDays, Users
} from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const { events, updateTaskStatus } = useEvents()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "hosted" | "registered" | "tasks">("overview")
  const [showQR, setShowQR] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
    else if (!isLoading && user && user.role === "admin") router.push("/admin")
  }, [user, isLoading, router])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!user) return null

  const registeredEvents = events.filter(e => e.registrations.some(r => r.userEmail === user.email))
  const hostedEvents = events.filter(e => e.organizerEmail === user.email)
  const coordinatingEvents = events.filter(e => e.subEvents.some(se => se.coordinators.some(c => c.email === user.email)))

  const myTasks = events.flatMap(e =>
    e.tasks.filter(t => t.assignedTo === user.email || t.assignedTo === user.collegeEmail).map(t => ({ ...t, eventTitle: e.title, eventId: e.id }))
  )
  const pendingTasks = myTasks.filter(t => t.status !== "DONE")

  const myAnnouncements = events.filter(e => e.registrations.some(r => r.userEmail === user.email)).flatMap(e =>
    e.announcements.slice(0, 3).map(a => ({ ...a, eventTitle: e.title, eventId: e.id }))
  ).slice(0, 5)

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "registered" as const, label: "My Tickets", icon: QrCode },
    { id: "hosted" as const, label: "Hosted", icon: PlusCircle },
    { id: "tasks" as const, label: `Tasks${pendingTasks.length > 0 ? ` (${pendingTasks.length})` : ''}`, icon: ListTodo },
  ]

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeItem="dashboard" />

      <main className="flex-1 md:ml-[72px] lg:ml-[260px] pb-20 md:pb-0">
        <PageTransition className="p-6 lg:p-10 max-w-6xl mx-auto">
          <motion.div variants={pageItem} className="mb-10">
            <MicroLabel>Student Dashboard</MicroLabel>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight">Hey, {user.name.split(" ")[0]}.</h1>
          </motion.div>

          <motion.div variants={pageItem} className="flex gap-1 mb-10 border-b dark:border-white/[0.08] border-[rgba(179,136,255,0.15)] overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#B388FF] border-[#B388FF]"
                    : "dark:text-white/40 text-[#6B6480] border-transparent hover:text-[#B388FF]/70"
                }`}>
                <tab.icon className="w-4 h-4" strokeWidth={1.5} />{tab.label}
              </button>
            ))}
          </motion.div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <motion.div variants={pageItem} className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{registeredEvents.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Registered</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{hostedEvents.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Hosted</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{coordinatingEvents.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Coordinating</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1 text-yellow-400">{pendingTasks.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Pending Tasks</div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-3xl font-light mb-1">{user.friends.length}</div>
                  <div className="text-[11px] font-mono tracking-widest uppercase text-white/40">Friends</div>
                </GlassCard>
              </motion.div>

              <motion.div variants={pageItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <Link href="/events">
                  <GlassCard className="p-6 hover:scale-[1.01] transition-transform cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div><h3 className="font-medium mb-1">Browse Events</h3><p className="text-sm text-white/40">Find and register for upcoming events</p></div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
                <Link href="/events/create">
                  <GlassCard className="p-6 hover:scale-[1.01] transition-transform cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div><h3 className="font-medium mb-1">Host New Event</h3><p className="text-sm text-white/40">Create and manage your own event</p></div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>

              {myAnnouncements.length > 0 && (
                <motion.div variants={pageItem} className="mb-10">
                  <MicroLabel>Latest Announcements</MicroLabel>
                  <div className="space-y-2">
                    {myAnnouncements.map(a => (
                      <Link key={a.id} href={`/events/${a.eventId}`}>
                        <GlassCard className="p-4 hover:bg-white/[0.04] transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Megaphone className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-medium">{a.title}</span>
                                <span className="text-[9px] font-mono text-white/30 border border-white/10 px-1 rounded">{a.eventTitle}</span>
                              </div>
                              <p className="text-xs text-white/50 line-clamp-1">{a.message}</p>
                              <p className="text-[9px] font-mono text-white/20 mt-1">{a.timestamp}</p>
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {pendingTasks.length > 0 && (
                <motion.div variants={pageItem} className="mb-10">
                  <MicroLabel>Assigned Tasks</MicroLabel>
                  <div className="space-y-2">
                    {pendingTasks.slice(0, 5).map(t => (
                      <Link key={t.id} href={`/events/${t.eventId}`}>
                        <GlassCard className="p-4 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${t.status === "IN_PROGRESS" ? 'bg-yellow-500/10' : 'bg-white/[0.05]'}`}>
                            {t.status === "IN_PROGRESS" ? <Clock className="w-4 h-4 text-yellow-400" /> : <CheckSquare className="w-4 h-4 text-white/30" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{t.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-white/30">{t.eventTitle}</span>
                              {t.deadline && <span className={`text-[10px] font-mono flex items-center gap-0.5 ${new Date(t.deadline) < new Date() ? 'text-red-400' : 'text-white/30'}`}><CalendarDays className="w-3 h-3" /> {t.deadline}</span>}
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${t.status === "IN_PROGRESS" ? "border-yellow-500/30 text-yellow-400" : "border-white/20 text-white/40"}`}>{t.status.replace("_", " ")}</span>
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
                  <p className="font-mono text-white/20 text-lg mb-4">No tickets yet</p>
                  <Link href="/events"><Button className="bg-white text-black hover:bg-white/90">Browse Events</Button></Link>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {registeredEvents.map(evt => {
                    const myRegs = evt.registrations.filter(r => r.userEmail === user.email)
                    return (
                      <GlassCard key={evt.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium mb-1">{evt.title}</h3>
                            <p className="text-xs font-mono text-white/40">{evt.date} &mdash; {evt.venue}</p>
                          </div>
                          <Link href={`/events/${evt.id}`}>
                            <Button variant="outline" className="border-white/20 text-white text-xs">View Event</Button>
                          </Link>
                        </div>
                        {myRegs.map(reg => {
                          const subEvt = evt.subEvents.find(se => se.id === reg.subEventId)
                          const isOpen = showQR === reg.id
                          return (
                            <div key={reg.id} className="mb-3 p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm">{subEvt?.name || "Sub-Event"}</p>
                                    {reg.teamName && <p className="text-xs text-white/40">Team: {reg.teamName}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono text-[10px] px-2 py-0.5 border rounded ${reg.status === "PAID" ? "border-green-500/30 text-green-400" : reg.status === "PENDING" ? "border-yellow-500/30 text-yellow-400" : "border-white/20 text-white/40"}`}>
                                    {reg.status === "PAID" ? "REGISTERED" : reg.status}
                                  </span>
                                  {reg.checkedIn && <span className="text-[10px] font-mono text-green-400 flex items-center gap-1"><CheckSquare className="w-3 h-3" />Checked In</span>}
                                  <button onClick={() => setShowQR(isOpen ? null : reg.id)} aria-label={isOpen ? "Hide QR pass" : "Show QR pass"} className="flex items-center gap-1 text-xs text-white/50 hover:text-white border border-white/20 rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                                    <QrCode className="w-3 h-3" aria-hidden="true" />{isOpen ? "Hide" : "QR Pass"}
                                  </button>
                                </div>
                              </div>
                              {isOpen && (
                                <div className="mt-4 flex flex-col items-center pt-4 border-t border-white/[0.06]">
                                  <div className="p-4 bg-white rounded-lg mb-3">
                                    <QRCodeSVG value={`MYFESTIVO:${evt.id}:${reg.subEventId}:${reg.id}`} size={160} />
                                  </div>
                                  <p className="text-[10px] font-mono text-white/40">{reg.id}</p>
                                  <p className="text-[10px] font-mono text-white/30">Show this at check-in</p>
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
                <Link href="/events/create"><Button className="bg-white text-black hover:bg-white/90 text-sm"><PlusCircle className="w-4 h-4 mr-2" />New Event</Button></Link>
              </div>
              {hostedEvents.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="font-mono text-white/20 text-lg mb-4">No events hosted yet</p>
                  <Link href="/events/create"><Button className="bg-white text-black hover:bg-white/90">Host Your First Event</Button></Link>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {hostedEvents.map(evt => (
                    <GlassCard key={evt.id} className="p-6 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium mb-1">{evt.title}</h3>
                          <p className="text-xs font-mono text-white/40 mb-2">{evt.date}</p>
                          <div className="flex gap-4 text-xs text-white/50">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{evt.registeredCount} registrations</span>
                            <span>{evt.subEvents.length} sub-events</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{(evt.registrations.filter(r => r.status === "PAID").length * evt.price).toLocaleString()}</span>
                            <span className="flex items-center gap-1"><ListTodo className="w-3 h-3" />{evt.tasks.filter(t => t.status !== "DONE").length} tasks</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <Link href={`/events/${evt.id}/edit`}>
                            <Button variant="outline" className="border-white/20 text-white text-xs h-8 px-3 hover:bg-white/10">
                              <Pencil className="w-3 h-3 mr-1.5" />Edit
                            </Button>
                          </Link>
                          <Link href={`/events/${evt.id}`}>
                            <Button variant="ghost" className="text-white/50 hover:text-white text-xs h-8 px-3">
                              View<ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
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
                  <p className="font-mono text-white/20 text-lg mb-4">No tasks assigned</p>
                  <p className="text-sm text-white/30">Tasks assigned to you by event organizers will appear here.</p>
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
    </div>
  )
}

