"use client"

import { useTheme } from "@/lib/theme-context"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // next-themes requires mounting before reading theme to avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Render placeholder to avoid layout shift
    return (
      <div className={cn("flex items-center gap-1 p-1 rounded-full bg-muted/50", className)}>
        {themes.map((t) => (
          <div key={t.value} className="w-8 h-8 rounded-full" />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-full",
        "bg-[var(--color-surface-2)] border border-[var(--glass-border)]",
        className
      )}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themes.map((t) => {
        const isActive = theme === t.value
        return (
          <button
            key={t.value}
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${t.label} theme`}
            onClick={() => setTheme(t.value)}
            className={cn(
              "relative flex items-center justify-center w-8 h-8 rounded-full",
              "transition-all duration-200 focus-ring",
              isActive
                ? "bg-[var(--color-accent)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent-low)]"
            )}
          >
            <t.icon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
