import { cn } from "@/lib/utils"

/**
 * GlassCard — theme-aware glassmorphic card.
 * Uses CSS variables so it automatically adapts to Light/Dark.
 */
export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)]",
        // Border — theme-aware via CSS variable
        "border border-[var(--glass-border)]",
        // Background — translucent, theme-aware
        "bg-[var(--glass-bg)]",
        // Backdrop — with -webkit- prefix for iOS ≤ 17
        "backdrop-blur-[20px] saturate-[1.8]",
        // Shadow — theme-aware via CSS variable
        "shadow-[var(--glass-shadow)]",
        // Inset highlight for depth
        "[box-shadow:var(--glass-shadow),inset_0_1px_0_rgba(255,255,255,0.05)]",
        // Hover glow
        "transition-shadow duration-300",
        "hover:[box-shadow:var(--glass-shadow),0_0_24px_var(--color-accent-low),inset_0_1px_0_rgba(255,255,255,0.05)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
