"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Calendar, PlusCircle, LogOut, User, Users } from "lucide-react"


interface AppSidebarProps {
  activeItem?: "browse" | "dashboard" | "host" | "friends" | "profile"
}

export function AppSidebar({ activeItem }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

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

  // ── Shared active item style ──────────────────────────────────────────
  const activeClass = "bg-[rgba(179,136,255,0.12)] text-[#B388FF] border-[rgba(179,136,255,0.30)]"
  const inactiveClass = "dark:text-white/50 text-[#6B6480] hover:bg-[rgba(179,136,255,0.08)] hover:text-[#B388FF] border-transparent"

  return (
    <>
      {/* ═══ DESKTOP SIDEBAR (hidden on mobile) ══════════════════════════════ */}
      <aside
        className="
          hidden md:flex
          w-[72px] lg:w-[260px]
          border-r dark:border-white/[0.06] border-[rgba(179,136,255,0.15)]
          dark:bg-black/60 bg-white/80
          backdrop-blur-md
          flex-col justify-between
          py-6 fixed h-screen z-40 overflow-y-auto
          transition-colors duration-300
        "
        aria-label="Main navigation"
      >
        <div>
          {/* Logo */}
          <Link href="/" className="hidden lg:block px-5 mb-8">
            <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto" />
          </Link>
          <Link href="/" className="block lg:hidden px-5 mb-8 text-center">
            <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto mx-auto" />
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
          {user ? (
            <>
              {/* User info */}
              <div className={`flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg
                dark:bg-white/[0.03] bg-[rgba(179,136,255,0.06)]
                dark:border-white/[0.06] border-[rgba(179,136,255,0.15)] border`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                  style={{ background: "linear-gradient(135deg, #B388FF, #7C5CBF)" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block flex-1 min-w-0">
                  <p className="text-sm dark:text-white text-[#1A1625] truncate font-medium">{user.name}</p>
                  <p className="text-[10px] font-mono dark:text-white/40 text-[#6B6480] truncate">{user.email}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                aria-label="Sign out"
                className="flex items-center justify-center lg:justify-start gap-3 p-3 w-full rounded-lg
                  hover:bg-red-500/10 transition-colors dark:text-white/40 text-[#6B6480]
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
                hover:bg-[rgba(179,136,255,0.08)] dark:text-white/50 text-[#6B6480]
                hover:text-[#B388FF] transition-colors touch-target focus-ring border border-transparent"
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
          dark:bg-black/90 bg-white/95
          backdrop-blur-xl
          dark:border-t dark:border-white/[0.06] border-t border-[rgba(179,136,255,0.15)]
          pb-safe
        "
        aria-label="Mobile navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {visibleNavItems.slice(0, 5).map(item => {
            const isActive = active === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                  isActive
                    ? "text-[#B388FF]"
                    : "dark:text-white/40 text-[#6B6480]"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                  strokeWidth={isActive ? 2 : 1.5}
                  aria-hidden="true"
                />
                <span className="text-[9px] font-medium tracking-wide">
                  {item.label.split(" ")[0]}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#B388FF] mt-0.5" />
                )}
              </Link>
            )
          })}

        </div>
      </nav>
    </>
  )
}
