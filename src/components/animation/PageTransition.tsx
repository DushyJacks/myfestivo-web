"use client"

import { motion, Variants } from "framer-motion"
import { useEffect, useState } from "react"

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
}

const item: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, y: 0, 
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } 
  }
}

export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReduced(query.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    query.addEventListener("change", handler)
    return () => query.removeEventListener("change", handler)
  }, [])

  return (
    <motion.div 
      variants={container} 
      initial={prefersReduced ? "show" : "hidden"}
      animate="show" 
      className={className}
      transition={prefersReduced ? { duration: 0 } : undefined}
    >
      {children}
    </motion.div>
  )
}

export { item as pageItem }
