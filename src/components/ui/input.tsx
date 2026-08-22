import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 text-base text-[var(--color-text)] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus-visible:border-[var(--color-border-focus)] focus-visible:ring-3 focus-visible:ring-[var(--color-border-focus)]/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[var(--color-surface)]/80 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm md:h-10 touch:p-3",
        className
      )}
      {...props}
    />
  )
}

export { Input }
