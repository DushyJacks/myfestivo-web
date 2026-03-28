export function MicroLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-mono tracking-[0.2em] uppercase text-white/40 mb-3 ${className || ""}`}>
      {children}
    </p>
  )
}
