import { cn } from "@/lib/utils"

export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)]",
        // Border — theme-aware
        "dark:border-white/[0.06] border-[rgba(179,136,255,0.15)]",
        "border",
        // Background — theme-aware
        "dark:bg-white/[0.03] bg-white/70",
        // Backdrop
        "backdrop-blur-[20px] saturate-[1.8]",
        // Shadow — purple glow in dark, soft violet in light
        "dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "shadow-[0_4px_24px_rgba(131,103,200,0.10),inset_0_1px_0_rgba(255,255,255,0.80)]",
        // Hover purple glow
        "transition-shadow duration-300",
        "hover:dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(179,136,255,0.12),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "hover:shadow-[0_4px_24px_rgba(131,103,200,0.18),inset_0_1px_0_rgba(255,255,255,0.80)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
