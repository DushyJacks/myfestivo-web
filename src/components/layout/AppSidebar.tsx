"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass, Calendar, PlusCircle, LogOut, User
} from "lucide-react"

interface AppSidebarProps {
  activeItem?: "browse" | "dashboard" | "host" | "profile"
}

export function AppSidebar({ activeItem }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  // Auto-detect active item from pathname if not provided
  const active = activeItem || (
    pathname.startsWith("/dashboard") ? "dashboard" :
    pathname.startsWith("/profile") ? "profile" :
    pathname.startsWith("/events/create") ? "host" :
    "browse"
  )

  const navItems = [
    { id: "browse" as const, label: "Browse Events", href: "/events", icon: Compass },
    { id: "dashboard" as const, label: "Dashboard", href: "/dashboard", icon: Calendar },
    { id: "host" as const, label: "Host Event", href: "/events/create", icon: PlusCircle },
    { id: "profile" as const, label: "Profile", href: "/profile", icon: User },
  ]

  return (
    <aside className="w-[72px] lg:w-[260px] border-r border-white/[0.06] bg-black/60 backdrop-blur-md flex flex-col justify-between py-6 fixed h-screen z-40">
      <div>
        <Link href="/" className="hidden lg:block px-5 mb-8">
          <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto" />
        </Link>
        <Link href="/" className="block lg:hidden px-5 mb-8 text-center">
          <img src="/logo.png" alt="MyFestivo" className="h-8 w-auto mx-auto" />
        </Link>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map(item => {
            // Only show dashboard/host/profile if logged in
            if (item.id !== "browse" && !user) return null
            // Admin users don't see student nav
            if (user?.role === "admin" && item.id !== "browse") return null

            const isActive = active === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-white/[0.05] text-white"
                    : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                <span className="hidden lg:inline text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="px-3 space-y-2">
        {user ? (
          <>
            <div className="flex items-center gap-3 p-3 rounded-md bg-white/[0.03] border border-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:block flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user.name}</p>
                <p className="text-[10px] font-mono text-white/40 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 p-3 w-full rounded-md hover:bg-red-500/10 transition-colors text-white/40 hover:text-red-400"
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="hidden lg:inline text-sm">Sign Out</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 p-3 rounded-md hover:bg-white/[0.05] text-white/50 hover:text-white transition-colors"
          >
            <User className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span className="hidden lg:inline text-sm">Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
