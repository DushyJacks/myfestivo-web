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
      className={cn(
        // Match the same visual language as <Input> from input.tsx, using theme vars
        "h-10 w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]",
        "px-2.5 py-1 text-sm text-[var(--color-text)] transition-colors outline-none",
        // Date-specific: let color-scheme follow the document theme
        "[color-scheme:inherit]",
        // Focus ring
        "focus-visible:border-[var(--color-border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]/20",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      style={style}
      {...props}
    />
  )
}

export { NativeDateInput }
