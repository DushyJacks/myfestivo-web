import { cn } from "@/lib/utils"

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

/**
 * PageHeader — consistent heading block for all pages.
 * Includes optional eyebrow label, title, description, and a slot for actions.
 */
export function PageHeader({ eyebrow, title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {eyebrow && (
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--color-text-faint)] mb-2">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl md:text-4xl font-light tracking-tight text-[var(--color-text)]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm md:text-base text-[var(--color-text-muted)] max-w-lg leading-relaxed">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  )
}
