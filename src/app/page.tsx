"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  Zap, Building2, MessageSquare, Users, Shield, ArrowRight,
  Calendar, Trophy, QrCode, X, Mail, ChevronDown
} from "lucide-react"


const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const modalBg = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalPanel = {
  hidden: { opacity: 0, y: 60, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  exit: { opacity: 0, y: 40, scale: 0.96, transition: { duration: 0.25 } },
}

type ModalType = "features" | "about" | "contact" | null

export default function LandingPage() {
  const { user } = useAuth()
  const heroRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [modal, setModal] = useState<ModalType>(null)

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }

  const closeModal = () => setModal(null)

  return (
    <div className="scroll-smooth min-h-screen bg-black">
      {/* ═══ NAVBAR ═══ */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-10 z-50 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="MyFestivo" className="h-10 w-auto" width={120} height={40} />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-white/40">
          <button onClick={() => setModal("features")} className="hover:text-white transition-colors">Features</button>
          <button onClick={() => setModal("about")} className="hover:text-white transition-colors">About</button>
          <Link href="/events" className="hover:text-white transition-colors">Events</Link>
          <button onClick={() => setModal("contact")} className="hover:text-white transition-colors">Contact</button>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: user.avatarColor || "#3B82F6" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-white/70 hidden sm:inline">{user.name}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-white/70 hover:text-white text-sm h-9 px-4 rounded-md transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-black hover:bg-white/90 text-sm font-medium h-9 px-5 rounded-md transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative h-screen flex items-end overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 pb-28 px-8 md:px-16 max-w-5xl">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p variants={fadeUp} className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-6">
              The Event Operating System
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-[52px] md:text-[80px] lg:text-[96px] font-extralight leading-[0.95] tracking-tight mb-8">
              Your events.
              <br />
              <span className="text-white/40">One place.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base md:text-lg text-white/40 mb-12 max-w-lg leading-relaxed">
              Built for college events that actually happen. Host, participate, coordinate — all from one platform.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                href={user ? "/events" : "/signup"}
                className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 font-medium h-12 px-8 text-sm rounded-md transition-colors"
              >
                {user ? "Go to Events" : "Create Account"} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center border border-white/20 text-white/70 hover:bg-white/[0.05] h-12 px-8 text-sm rounded-md transition-colors"
              >
                Browse Events
              </Link>
              <button onClick={() => setModal("features")} className="text-[11px] font-mono tracking-widest text-white/30 hover:text-white/60 transition-colors h-12 px-4 flex items-center gap-1">
                What we offer <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <button onClick={() => scrollTo(ctaRef)} className="text-white/20 hover:text-white/40 transition-colors" aria-label="Scroll to call to action section">
            <ChevronDown className="w-6 h-6" aria-hidden="true" />
          </button>
        </motion.div>
      </section>

      {/* ═══ CTA ═══ */}
      <section ref={ctaRef} className="py-32 px-8 md:px-16 border-t border-white/[0.06]">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extralight tracking-tight mb-6">
            Ready to run your<br />next event?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base text-white/40 mb-10 max-w-md mx-auto">
            Join hundreds of student organizers who&apos;ve switched to MyFestivo. It takes 30 seconds to get started.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Link
              href={user ? "/events/create" : "/signup"}
              className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 font-medium h-12 px-10 text-sm rounded-md transition-colors"
            >
              {user ? "Create Event" : "Get Started Free"} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button onClick={() => setModal("contact")} className="h-12 px-6 text-sm text-white/40 hover:text-white font-mono tracking-widest uppercase transition-colors border border-white/[0.08] hover:border-white/20 rounded-md flex items-center gap-2">
              <Mail className="w-4 h-4" /> Contact Us
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06] py-12 px-8 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="mb-3">
              <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto" width={100} height={32} />
            </div>
            <p className="text-xs text-white/30 max-w-xs">The event operating system for colleges. Built with care in Chennai, India.</p>
            <a href="mailto:myfestivo@gmail.com" className="mt-3 flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors font-mono">
              <Mail className="w-3.5 h-3.5" />
              myfestivo@gmail.com
            </a>
          </div>
          <div className="flex gap-12 text-[11px] font-mono tracking-widest uppercase">
            <div className="space-y-3">
              <p className="text-white/20 mb-4">Platform</p>
              <Link href="/events" className="block text-white/40 hover:text-white transition-colors">Events</Link>
              <Link href="/signup" className="block text-white/40 hover:text-white transition-colors">Sign Up</Link>
              <Link href="/login" className="block text-white/40 hover:text-white transition-colors">Sign In</Link>
            </div>
            <div className="space-y-3">
              <p className="text-white/20 mb-4">Company</p>
              <button onClick={() => setModal("about")} className="block text-white/40 hover:text-white transition-colors">About</button>
              <button onClick={() => setModal("features")} className="block text-white/40 hover:text-white transition-colors">Features</button>
              <button onClick={() => setModal("contact")} className="block text-white/40 hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/[0.04] text-[10px] font-mono text-white/20 tracking-widest">
          © {new Date().getFullYear()} MyFestivo. All rights reserved.
        </div>
      </footer>

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {modal && (
          <motion.div
            key="modal-backdrop"
            variants={modalBg}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
            onClick={closeModal}
          >
            <motion.div
              key="modal-panel"
              variants={modalPanel}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0a0a0a] border border-white/[0.08] rounded-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                aria-label="Close modal"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4 text-white/60" aria-hidden="true" />
              </button>

              {/* ── Features Modal ── */}
              {modal === "features" && (
                <div className="p-8 md:p-12">
                  <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">What we offer</p>
                  <h2 className="text-3xl md:text-4xl font-extralight tracking-tight mb-10">
                    Everything you need<br /><span className="text-white/30">to run college events.</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { icon: Zap, title: "Instant Event Creation", desc: "Create events with sub-events, prizes, rules, and coordinators in minutes. Go from idea to published in one flow.", num: "01" },
                      { icon: Building2, title: "College Domain Lock", desc: "Restrict events to your institution. Only verified @college.edu emails can access intra-college events.", num: "02" },
                      { icon: MessageSquare, title: "Real-time Chat", desc: "Dedicated chatrooms per event and sub-event. Coordinate with teams, ask questions, get instant answers.", num: "03" },
                      { icon: Users, title: "Team Registration", desc: "Build teams during registration. Invite friends by email, set team size limits, manage rosters.", num: "04" },
                      { icon: QrCode, title: "QR Check-in", desc: "Every participant gets a unique QR pass. Scan at entry for instant verification — no paper lists.", num: "05" },
                      { icon: Trophy, title: "Prize Management", desc: "Display prize pools and manage payments — all from the host dashboard.", num: "06" },
                    ].map((f) => (
                      <div
                        key={f.num}
                        className="relative p-6 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-300 group"
                      >
                        <span className="text-[10px] font-mono text-white/15 tracking-widest absolute top-4 right-4">{f.num}</span>
                        <f.icon className="w-5 h-5 text-white/50 mb-4 group-hover:text-white transition-colors" strokeWidth={1.5} />
                        <h3 className="text-base font-medium mb-2 tracking-tight">{f.title}</h3>
                        <p className="text-sm text-white/35 leading-relaxed group-hover:text-white/50 transition-colors">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── About Modal ── */}
              {modal === "about" && (
                <div className="p-8 md:p-12">
                  <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">About Us</p>
                  <h2 className="text-3xl md:text-4xl font-extralight tracking-tight mb-8">
                    Built by students,<br /><span className="text-white/30">for students.</span>
                  </h2>
                  <div className="space-y-5 mb-10">
                    <p className="text-base text-white/40 leading-relaxed">
                      MyFestivo was born out of frustration. Every college fest meant scattered WhatsApp groups,
                      messy Google Forms, lost registrations, and zero coordination between sub-events.
                      We built the platform we wished existed.
                    </p>
                    <p className="text-base text-white/40 leading-relaxed">
                      Our mission is simple: make college event management effortless. From a hackathon with 500
                      participants to an intimate departmental workshop with 20 — MyFestivo scales with you.
                      Real-time chat, automated reminders, QR check-ins, and secure college-domain locking
                      are just the beginning.
                    </p>
                    <p className="text-base text-white/40 leading-relaxed">
                      We&apos;re a team of engineers and designers from SRM Institute of Science and Technology,
                      united by the belief that college life deserves better tools. MyFestivo is open to every
                      institution — invite your college today.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { icon: Shield, title: "Privacy First", desc: "College-domain verification ensures only authorized students access your events. Your data stays yours." },
                      { icon: Zap, title: "Zero Friction", desc: "No downloads, no plugins. Everything runs in the browser. Create an event in under 3 minutes." },
                      { icon: Calendar, title: "Always Evolving", desc: "We ship weekly. New features and improvements based on real feedback from student organizers." },
                    ].map((v) => (
                      <div key={v.title} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.01]">
                        <v.icon className="w-5 h-5 text-white/50 mb-3" strokeWidth={1.5} />
                        <h3 className="text-sm font-medium mb-2">{v.title}</h3>
                        <p className="text-xs text-white/35 leading-relaxed">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Contact Modal ── */}
              {modal === "contact" && (
                <div className="p-8 md:p-12">
                  <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">Get in touch</p>
                  <h2 className="text-3xl md:text-4xl font-extralight tracking-tight mb-4">
                    Contact Us
                  </h2>
                  <p className="text-base text-white/40 mb-10 max-w-lg leading-relaxed">
                    Have questions, want to partner with us, or need help setting up your college event? We&apos;d love to hear from you.
                  </p>
                  <div className="space-y-4">
                    <a
                      href="mailto:myfestivo@gmail.com"
                      className="flex items-center gap-5 p-6 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.16] transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Email</p>
                        <p className="text-white/80 font-medium group-hover:text-white transition-colors">myfestivo@gmail.com</p>
                        <p className="text-xs text-white/30 mt-0.5">We usually respond within 24 hours</p>
                      </div>
                    </a>
                    <div className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.01]">
                      <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-3">Operated by</p>
                      <p className="text-white/60 text-sm leading-relaxed">
                        MyFestivo Team — SRM Institute of Science and Technology, Chennai, India
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
