import { cn } from "@/lib/utils"

export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)]",
        // Border
        "border border-white/[0.06]",
        // Background
        "bg-white/[0.03]",
        // Backdrop — with -webkit- prefix for iOS ≤ 17
        "backdrop-blur-[20px] saturate-[1.8]",
        // Shadow — purple glow
        "shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]",
        // Hover purple glow
        "transition-shadow duration-300",
        "hover:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(179,136,255,0.12),inset_0_1px_0_rgba(255,255,255,0.05)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
