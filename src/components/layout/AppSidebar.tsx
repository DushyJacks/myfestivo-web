"use client"

import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Compass, Calendar, PlusCircle, LogOut, User, Users, House, Loader2 } from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"


interface AppSidebarProps {
  activeItem?: "browse" | "dashboard" | "host" | "friends" | "profile"
}

export function AppSidebar({ activeItem }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [showConfirm, setShowConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleConfirmSignOut() {
    setSigningOut(true)
    await logout()
    setSigningOut(false)
    setShowConfirm(false)
  }

  // Auto-detect active item from pathname if not provided
  const active = activeItem || (
    pathname.startsWith("/dashboard") ? "dashboard" :
    pathname.startsWith("/profile") ? "profile" :
    pathname.startsWith("/friends") ? "friends" :
    pathname.startsWith("/events/create") ? "host" :
    "browse"
  )

  const navItems = [
    { id: "browse" as const,     label: "Browse Events", href: "/events",        icon: Compass   },
    { id: "dashboard" as const,  label: "Dashboard",     href: "/dashboard",     icon: Calendar  },
    { id: "host" as const,       label: "Host Event",    href: "/events/create", icon: PlusCircle},
    { id: "friends" as const,    label: "Friends",       href: "/friends",       icon: Users     },
    { id: "profile" as const,    label: "Profile",       href: "/profile",       icon: User      },
  ]

  const visibleNavItems = navItems.filter(item => {
    if (item.id !== "browse" && !user) return false
    if (user?.role === "admin" && item.id !== "browse") return false
    return true
  })

  // ── Theme-aware active item styles ──────────────────────────────────────
  const activeClass = "bg-[var(--color-accent-low)] text-[var(--color-accent)] border-[var(--color-accent)]/30"
  const inactiveClass = "text-[var(--color-text-muted)] hover:bg-[var(--color-accent-low)] hover:text-[var(--color-accent)] border-transparent"

  return (
    <>
      {/* ═══ DESKTOP SIDEBAR (hidden on mobile) ══════════════════════════════ */}
      <aside
        className="
          hidden md:flex
          w-[72px] lg:w-[260px]
          border-r border-[var(--glass-border)]
          glass-surface
          flex-col justify-between
          py-6 fixed h-screen z-40 overflow-y-auto
          transition-colors duration-300
        "
        aria-label="Main navigation"
      >
        <div>
          {/* Logo */}
          <Link href="/" className="hidden lg:block px-5 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto" width={100} height={32} loading="lazy" decoding="async" />
          </Link>
          <Link href="/" className="block lg:hidden px-5 mb-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto mx-auto" width={100} height={32} loading="lazy" decoding="async" />
          </Link>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 px-3" aria-label="Main navigation links">
            {visibleNavItems.map(item => {
              const isActive = active === item.id
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg
                    transition-all duration-200 touch-target focus-ring border
                    ${isActive ? activeClass : inactiveClass}
                  `}
                >
                  <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span className="hidden lg:inline text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="px-3 space-y-2">
          {/* Theme Toggle */}
          <div className="flex justify-center lg:justify-start px-1 mb-2">
            <ThemeToggle />
          </div>

          {user ? (
            <>
              {/* User info */}
              <div className={`flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg
                bg-[var(--color-surface-2)]
                border-[var(--glass-border)] border`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-[var(--color-text)]"
                  style={{ background: "linear-gradient(135deg, #B388FF, #7C5CBF)" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-text)] truncate font-medium">{user.name}</p>
                  <p className="text-[10px] font-mono text-[var(--color-text-faint)] truncate">{user.email}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => setShowConfirm(true)}
                aria-label="Sign out"
                className="flex items-center justify-center lg:justify-start gap-3 p-3 w-full rounded-lg
                  hover:bg-red-500/10 transition-colors text-[var(--color-text-faint)]
                  hover:text-red-400 touch-target focus-ring border border-transparent"
              >
                <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span className="hidden lg:inline text-sm">Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              aria-label="Sign in to MyFestivo"
              className="flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg
                hover:bg-[var(--color-accent-low)] text-[var(--color-text-muted)]
                hover:text-[var(--color-accent)] transition-colors touch-target focus-ring border border-transparent"
            >
              <User className="w-5 h-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span className="hidden lg:inline text-sm">Sign In</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ═══ MOBILE BOTTOM NAV (visible only on mobile) ══════════════════════ */}
      <nav
        className="
          md:hidden fixed bottom-0 left-0 right-0 z-50
          glass-surface
          pb-safe
        "
        aria-label="Mobile navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-1 py-2">
          {/* Landing page breadcrumb — always visible on mobile */}
          <Link
            href="/"
            aria-label="Go to MyFestivo home"
            className={`flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-xl transition-all duration-200 min-w-[40px] ${
              pathname === "/" ? "text-[var(--color-accent)]" : "text-[var(--color-text-faint)]"
            }`}
          >
            <House
              className={`w-5 h-5 transition-transform duration-200 ${pathname === "/" ? "scale-110" : ""}`}
              strokeWidth={pathname === "/" ? 2 : 1.5}
              aria-hidden="true"
            />
            <span className="text-[8px] font-medium tracking-wide">Home</span>
            {pathname === "/" && <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />}
          </Link>

          {visibleNavItems.map(item => {
            const isActive = active === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-xl transition-all duration-200 min-w-[40px] ${
                  isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-faint)]"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                  strokeWidth={isActive ? 2 : 1.5}
                  aria-hidden="true"
                />
                <span className="text-[8px] font-medium tracking-wide">
                  {item.id === "browse" ? "Events" : item.id === "dashboard" ? "Dash" : item.id === "host" ? "Host" : item.id === "friends" ? "Friends" : "Profile"}
                </span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ═══ SIGN-OUT CONFIRMATION MODAL ══════════════════════════════════════ */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            key="signout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => !signingOut && setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <GlassCard className="p-6 border border-[var(--color-border)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-surface-2)]">
                    <LogOut className="w-5 h-5 text-[var(--color-text-muted)]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-text)]">Sign Out?</h2>
                    <p className="text-xs text-[var(--color-text-faint)]">You can sign back in anytime</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={signingOut}
                    className="px-4 py-2 rounded-md text-xs border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-focus)] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSignOut}
                    disabled={signingOut}
                    className="px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 bg-white hover:bg-[#B388FF] text-black"
                  >
                    {signingOut && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Yes, Sign Out
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
