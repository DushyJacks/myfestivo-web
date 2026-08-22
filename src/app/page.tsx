"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import {
  Zap, Building2, MessageSquare, Users, Shield, ArrowRight,
  Calendar, Trophy, QrCode, X, Mail, ChevronDown, Sparkles
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
    <div className="scroll-smooth min-h-screen bg-[var(--color-bg)] transition-colors duration-300">
      {/* ═══ NAVBAR ═══ */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-10 z-50 glass-surface">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MyFestivo" className="h-10 w-auto" width={120} height={40} loading="eager" decoding="async" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-[var(--color-text-muted)]">
          <button onClick={() => setModal("features")} className="hover:text-[var(--color-text)] transition-colors">Features</button>
          <button onClick={() => setModal("about")} className="hover:text-[var(--color-text)] transition-colors">About</button>
          <Link href="/events" className="hover:text-[var(--color-text)] transition-colors">Events</Link>
          <button onClick={() => setModal("contact")} className="hover:text-[var(--color-text)] transition-colors">Contact</button>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:flex" />
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-3">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)]" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[var(--color-text)]"
                  style={{ backgroundColor: user.avatarColor || "#8B5CF6" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-[var(--color-text-muted)] hidden sm:inline">{user.name}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm h-9 px-4 rounded-md transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-text)] hover:opacity-90 text-sm font-medium h-9 px-5 rounded-md transition-all shadow-md"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ═══ HERO — Soft Glass / Space-Inspired ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background decorations — subtle, space-inspired */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Grid overlay — very subtle */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }} />

          {/* Violet glow orbs */}
          <div className="violet-glow w-[500px] h-[500px] top-[10%] right-[10%]" />
          <div className="violet-glow w-[400px] h-[400px] bottom-[20%] left-[5%] opacity-60" />
          <div className="violet-glow w-[300px] h-[300px] top-[50%] left-[40%] opacity-30" />

          {/* Constellation dots — space-inspired detail */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15%" cy="20%" r="1.5" fill="var(--color-accent)" />
            <circle cx="85%" cy="15%" r="1" fill="var(--color-accent)" />
            <circle cx="70%" cy="40%" r="1.5" fill="var(--color-accent)" />
            <circle cx="25%" cy="65%" r="1" fill="var(--color-accent)" />
            <circle cx="90%" cy="70%" r="2" fill="var(--color-accent)" />
            <circle cx="50%" cy="85%" r="1" fill="var(--color-accent)" />
            <circle cx="35%" cy="35%" r="1.5" fill="var(--color-accent)" />
            <line x1="15%" y1="20%" x2="35%" y2="35%" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.4" />
            <line x1="70%" y1="40%" x2="85%" y2="15%" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.4" />
            <line x1="70%" y1="40%" x2="90%" y2="70%" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.3" />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Content */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent-low)] text-[var(--color-accent)] text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              The Event Operating System
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-[44px] md:text-[64px] lg:text-[72px] font-extralight leading-[1.05] tracking-tight mb-6 text-[var(--color-text)]">
              Your events.
              <br />
              <span className="text-[var(--color-text-muted)]">One place.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base md:text-lg text-[var(--color-text-muted)] mb-10 max-w-lg leading-relaxed">
              Built for college events that actually happen. Host, participate, coordinate — all from one platform.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              {/* Primary CTA */}
              <Link
                href={user ? "/events" : "/signup"}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-text)] hover:opacity-90 font-medium h-12 px-8 text-sm rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                {user ? "Go to Events" : "Create Account"} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              {/* Secondary CTA — glass */}
              <Link
                href="/events"
                className="inline-flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-accent-low)] h-12 px-8 text-sm rounded-lg transition-all"
              >
                Browse Events
              </Link>
              <button onClick={() => setModal("features")} className="text-[11px] font-mono tracking-widest text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors h-12 px-4 flex items-center gap-1">
                What we offer <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right — Abstract Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:flex items-center justify-center relative"
          >
            {/* Orbital rings — space-inspired */}
            <div className="relative w-[380px] h-[380px]">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-[var(--color-accent)]/10 animate-[spin_30s_linear_infinite]" />
              {/* Middle ring */}
              <div className="absolute inset-6 rounded-full border border-[var(--color-accent)]/15 animate-[spin_20s_linear_infinite_reverse]" />
              {/* Inner ring */}
              <div className="absolute inset-12 rounded-full border border-[var(--color-accent)]/20" />

              {/* Center glass card — floating event preview */}
              <div className="absolute inset-16 glass-panel flex flex-col items-center justify-center gap-3 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-[var(--color-text)]" />
                </div>
                <span className="text-sm font-medium text-[var(--color-text)]">MyFestivo</span>
                <span className="text-[10px] text-[var(--color-text-faint)] font-mono tracking-widest">EVENT OS</span>
              </div>

              {/* Orbital dots */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]" />
              <div className="absolute bottom-8 right-0 w-2 h-2 rounded-full bg-[var(--color-accent)]/60" />
              <div className="absolute top-1/3 left-0 w-2 h-2 rounded-full bg-[var(--color-accent)]/40" />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <button onClick={() => scrollTo(ctaRef)} className="text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors" aria-label="Scroll to call to action section">
            <ChevronDown className="w-6 h-6" aria-hidden="true" />
          </button>
        </motion.div>
      </section>

      {/* ═══ CTA ═══ */}
      <section ref={ctaRef} className="py-32 px-8 md:px-16 border-t border-[var(--color-border)]">
        <motion.div
          whileInView="show" viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extralight tracking-tight mb-6 text-[var(--color-text)]">
            Ready to run your<br />next event?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base text-[var(--color-text-muted)] mb-10 max-w-md mx-auto">
            Join hundreds of student organizers who&apos;ve switched to MyFestivo. It takes 30 seconds to get started.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Link
              href={user ? "/events/create" : "/signup"}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-text)] hover:opacity-90 font-medium h-12 px-10 text-sm rounded-lg transition-all shadow-lg"
            >
              {user ? "Create Event" : "Get Started Free"} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button onClick={() => setModal("contact")} className="h-12 px-6 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-mono tracking-widest uppercase transition-colors border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 rounded-lg flex items-center gap-2">
              <Mail className="w-4 h-4" /> Contact Us
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[var(--color-border)] py-12 px-8 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto" width={100} height={32} loading="lazy" decoding="async" />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] max-w-xs">The event operating system for colleges. Built with care in Chennai, India.</p>
            <a href="mailto:myfestivo@gmail.com" className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors font-mono">
              <Mail className="w-3.5 h-3.5" />
              myfestivo@gmail.com
            </a>
          </div>
          <div className="flex gap-12 text-[11px] font-mono tracking-widest uppercase">
            <div className="space-y-3">
              <p className="text-[var(--color-text-muted)] mb-4">Platform</p>
              <Link href="/events" className="block text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Events</Link>
              <Link href="/signup" className="block text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Sign Up</Link>
              <Link href="/login" className="block text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Sign In</Link>
              <Link href="/sitemap-page" className="block text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Site Map</Link>
            </div>
            <div className="space-y-3">
              <p className="text-[var(--color-text-muted)] mb-4">Company</p>
              <button onClick={() => setModal("about")} className="block text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">About</button>
              <button onClick={() => setModal("features")} className="block text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Features</button>
              <button onClick={() => setModal("contact")} className="block text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Contact</button>
            </div>
            <div className="space-y-3">
              <p className="text-[var(--color-text-muted)] mb-4">Legal</p>
              <Link href="/privacy-policy" className="block text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest">
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[var(--color-bg)]/80 backdrop-blur-md"
            onClick={closeModal}
          >
            <motion.div
              key="modal-panel"
              variants={modalPanel}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-panel"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                aria-label="Close modal"
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--color-surface-2)] hover:bg-[var(--color-accent-low)] flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
              </button>

              {/* ── Features Modal ── */}
              {modal === "features" && (
                <div className="p-8 md:p-12">
                  <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--color-text-faint)] mb-3">What we offer</p>
                  <h2 className="text-3xl md:text-4xl font-extralight tracking-tight mb-10 text-[var(--color-text)]">
                    Everything you need<br /><span className="text-[var(--color-text-faint)]">to run college events.</span>
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
                        className="relative p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 hover:bg-[var(--color-accent-low)] hover:border-[var(--color-accent)]/20 transition-all duration-300 group"
                      >
                        <span className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest absolute top-4 right-4">{f.num}</span>
                        <f.icon className="w-5 h-5 text-[var(--color-text-muted)] mb-4 group-hover:text-[var(--color-accent)] transition-colors" strokeWidth={1.5} />
                        <h3 className="text-base font-medium mb-2 tracking-tight text-[var(--color-text)]">{f.title}</h3>
                        <p className="text-sm text-[var(--color-text-faint)] leading-relaxed group-hover:text-[var(--color-text-muted)] transition-colors">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── About Modal ── */}
              {modal === "about" && (
                <div className="p-8 md:p-12">
                  <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--color-text-faint)] mb-3">About Us</p>
                  <h2 className="text-3xl md:text-4xl font-extralight tracking-tight mb-8 text-[var(--color-text)]">
                    Built by students,<br /><span className="text-[var(--color-text-faint)]">for students.</span>
                  </h2>
                  <div className="space-y-5 mb-10">
                    <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
                      MyFestivo was born out of frustration. Every college fest meant scattered WhatsApp groups,
                      messy Google Forms, lost registrations, and zero coordination between sub-events.
                      We built the platform we wished existed.
                    </p>
                    <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
                      Our mission is simple: make college event management effortless. From a hackathon with 500
                      participants to an intimate departmental workshop with 20 — MyFestivo scales with you.
                      Real-time chat, automated reminders, QR check-ins, and secure college-domain locking
                      are just the beginning.
                    </p>
                    <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
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
                      <div key={v.title} className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50">
                        <v.icon className="w-5 h-5 text-[var(--color-text-muted)] mb-3" strokeWidth={1.5} />
                        <h3 className="text-sm font-medium mb-2 text-[var(--color-text)]">{v.title}</h3>
                        <p className="text-xs text-[var(--color-text-faint)] leading-relaxed">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Contact Modal ── */}
              {modal === "contact" && (
                <div className="p-8 md:p-12">
                  <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--color-text-faint)] mb-3">Get in touch</p>
                  <h2 className="text-3xl md:text-4xl font-extralight tracking-tight mb-4 text-[var(--color-text)]">
                    Contact Us
                  </h2>
                  <p className="text-base text-[var(--color-text-muted)] mb-10 max-w-lg leading-relaxed">
                    Have questions, want to partner with us, or need help setting up your college event? We&apos;d love to hear from you.
                  </p>
                  <div className="space-y-4">
                    <a
                      href="mailto:myfestivo@gmail.com"
                      className="flex items-center gap-4 p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 hover:bg-[var(--color-accent-low)] hover:border-[var(--color-accent)]/20 transition-all group overflow-hidden"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-[var(--color-accent)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase mb-1">Email</p>
                        <p className="text-[var(--color-text)] font-medium group-hover:text-[var(--color-accent)] transition-colors break-all">myfestivo@gmail.com</p>
                        <p className="text-xs text-[var(--color-text-faint)] mt-0.5">We usually respond within 24 hours</p>
                      </div>
                    </a>
                    <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50">
                      <p className="text-[10px] font-mono text-[var(--color-text-faint)] tracking-widest uppercase mb-3">Operated by</p>
                      <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
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
