"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  Zap, Building2, MessageSquare, Users, Shield, ArrowRight,
  Calendar, Trophy, QrCode, ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

export default function LandingPage() {
  const { user } = useAuth()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const gridOpacity = useTransform(scrollYProgress, [0, 0.15], [0.05, 0.02])

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="scroll-smooth">
      {/* ═══ NAVBAR ═══ */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-10 z-50 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
          MyFestivo
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-white/40">
          <button onClick={() => scrollTo(featuresRef)} className="hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollTo(aboutRef)} className="hover:text-white transition-colors">About</button>
          <Link href="/events" className="hover:text-white transition-colors">Events</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" />
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
              <Link href="/login">
                <Button variant="ghost" className="text-white/70 hover:text-white text-sm h-9">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-white/90 text-sm font-medium h-9 px-5">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative h-screen flex items-end overflow-hidden">
        {/* Animated grid background */}
        <motion.div
          style={{ opacity: gridOpacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }} />
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 pb-28 px-8 md:px-16 max-w-5xl"
        >
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
              <Link href={user ? "/events" : "/signup"}>
                <Button className="bg-white text-black hover:bg-white/90 font-medium h-12 px-8 text-sm gap-2">
                  {user ? "Go to Events" : "Create Account"} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="border-white/20 text-white/70 hover:bg-white/[0.05] h-12 px-8 text-sm">
                  Browse Events
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <button onClick={() => scrollTo(featuresRef)} className="text-white/20 hover:text-white/40 transition-colors">
            <ChevronDown className="w-6 h-6" />
          </button>
        </motion.div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <section className="border-t border-b border-white/[0.06] overflow-hidden whitespace-nowrap py-4 bg-black/40 backdrop-blur-md">
        <div className="animate-marquee inline-block text-[10px] font-mono tracking-[0.3em] uppercase text-white/30">
          <span className="mx-10">SRM Institute of Science and Technology</span>
          <span className="mx-10">Indian Institute of Technology</span>
          <span className="mx-10">National Institute of Technology</span>
          <span className="mx-10">Birla Institute of Technology</span>
          <span className="mx-10">Delhi University</span>
          <span className="mx-10">Vellore Institute of Technology</span>
          <span className="mx-10">SRM Institute of Science and Technology</span>
          <span className="mx-10">Indian Institute of Technology</span>
          <span className="mx-10">National Institute of Technology</span>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section ref={featuresRef} className="py-32 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-4">
              What we offer
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extralight tracking-tight mb-20">
              Everything you need<br /><span className="text-white/30">to run college events.</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Instant Event Creation", desc: "Create events with sub-events, prizes, rules, and coordinators in minutes. Go from idea to published in one flow.", num: "01" },
              { icon: Building2, title: "College Domain Lock", desc: "Restrict events to your institution. Only verified @college.edu emails can access intra-college events.", num: "02" },
              { icon: MessageSquare, title: "Real-time Chat", desc: "Dedicated chatrooms per event and sub-event. Coordinate with teams, ask questions, get instant answers.", num: "03" },
              { icon: Users, title: "Team Registration", desc: "Build teams during registration. Invite friends by email, set team size limits, manage rosters.", num: "04" },
              { icon: QrCode, title: "QR Check-in", desc: "Every participant gets a unique QR pass. Scan at entry for instant verification — no paper lists.", num: "05" },
              { icon: Trophy, title: "Prize & Automation", desc: "Display prize pools, send automated reminders, and manage payments — all from the host dashboard.", num: "06" },
            ].map((f) => (
              <motion.div
                key={f.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="group relative p-8 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-500"
              >
                <span className="text-[10px] font-mono text-white/15 tracking-widest absolute top-5 right-5">{f.num}</span>
                <f.icon className="w-5 h-5 text-white/60 mb-5 group-hover:text-white transition-colors" strokeWidth={1.5} />
                <h3 className="text-lg font-medium mb-3 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed group-hover:text-white/50 transition-colors">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS PARALLAX ═══ */}
      <section className="relative py-28 border-t border-b border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-[150px]" />
        </div>
        <div className="max-w-6xl mx-auto px-8 md:px-16 relative z-10">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "100+", label: "Events Hosted" },
              { value: "5K+", label: "Participants" },
              { value: "50+", label: "Colleges" },
              { value: "99%", label: "Uptime" },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp}>
                <p className="text-4xl md:text-5xl font-extralight tracking-tight mb-2">{s.value}</p>
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ ABOUT US ═══ */}
      <section ref={aboutRef} className="py-32 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-4">
              About Us
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extralight tracking-tight mb-8">
              Built by students,<br /><span className="text-white/30">for students.</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="max-w-3xl">
              <p className="text-base text-white/40 leading-relaxed mb-6">
                MyFestivo was born out of frustration. Every college fest meant scattered WhatsApp groups,
                messy Google Forms, lost registrations, and zero coordination between sub-events.
                We built the platform we wished existed.
              </p>
              <p className="text-base text-white/40 leading-relaxed mb-6">
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
            </motion.div>
          </motion.div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              { icon: Shield, title: "Privacy First", desc: "College-domain verification ensures only authorized students access your events. Your data stays yours." },
              { icon: Zap, title: "Zero Friction", desc: "No downloads, no plugins. Everything runs in the browser. Create an event in under 3 minutes." },
              { icon: Calendar, title: "Always Evolving", desc: "We ship weekly. New features, integrations, and improvements based on real feedback from student organizers." },
            ].map((v) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.01]"
              >
                <v.icon className="w-5 h-5 text-white/50 mb-4" strokeWidth={1.5} />
                <h3 className="text-base font-medium mb-2">{v.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 px-8 md:px-16 border-t border-white/[0.06]">
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
            <Link href={user ? "/events/create" : "/signup"}>
              <Button className="bg-white text-black hover:bg-white/90 font-medium h-12 px-10 text-sm gap-2">
                {user ? "Create Event" : "Get Started Free"} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06] py-12 px-8 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="mb-3">
              <span className="text-lg font-semibold tracking-tight text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>MyFestivo</span>
            </div>
            <p className="text-xs text-white/30 max-w-xs">The event operating system for colleges. Built with care in Chennai, India.</p>
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
              <button onClick={() => scrollTo(aboutRef)} className="block text-white/40 hover:text-white transition-colors">About</button>
              <button onClick={() => scrollTo(featuresRef)} className="block text-white/40 hover:text-white transition-colors">Features</button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/[0.04] text-[10px] font-mono text-white/20 tracking-widest">
          © {new Date().getFullYear()} MyFestivo. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
