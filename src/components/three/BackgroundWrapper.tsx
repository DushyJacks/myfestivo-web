"use client"

import dynamic from 'next/dynamic'
import { useTheme } from '@/lib/theme-context'
import { useEffect, useState } from 'react'

// Lazy load Three.js - only on client side
const Background3D = dynamic(
  () => import('@/components/three/Background3D').then(mod => ({
    default: mod.Background3D
  })),
  {
    loading: () => <div className="fixed inset-0 bg-[var(--color-bg)]" />,
    ssr: false
  }
)

export function BackgroundWrapper() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Only render the 3D background in dark mode — it's a dark-themed scene
  if (!mounted || resolvedTheme !== 'dark') {
    return null
  }

  return <Background3D />
}
