"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * NativeDateInput — a plain <input type="date"> styled to match the design system.
 *
 * We intentionally do NOT wrap this in @base-ui/react/input because that
 * component can interfere with the browser's native date picker calendar popup,
 * causing repeated / overlapping dates across month boundaries.
 *
 * Using a raw <input> element lets the browser own the calendar grid completely.
 */
function NativeDateInput({
  className,
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="date"
      data-slot="date-input"
      style={{ colorScheme: "dark", ...style }}
      className={cn(
        // Match the same visual language as <Input> from input.tsx
        "h-10 w-full min-w-0 rounded-lg border border-white/[0.08] bg-white/[0.03]",
        "px-2.5 py-1 text-sm text-white transition-colors outline-none",
        // Date-specific: make the calendar icon visible in dark mode
        "[color-scheme:dark]",
        // Focus ring
        "focus-visible:border-[#B388FF]/50 focus-visible:ring-2 focus-visible:ring-[#B388FF]/20",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { NativeDateInput }
