import { cn } from "@/lib/utils"

/**
 * GlassPanel — elevated glassmorphic container for modals, filter panels, floating controls.
 * Slightly more prominent than GlassCard with stronger blur and glow.
 */
export function GlassPanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-panel",
        "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
