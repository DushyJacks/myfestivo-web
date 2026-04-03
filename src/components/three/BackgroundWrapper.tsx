"use client"

import dynamic from 'next/dynamic'

// Lazy load Three.js - only on client side
const Background3D = dynamic(
  () => import('@/components/three/Background3D').then(mod => ({
    default: mod.Background3D
  })),
  {
    loading: () => <div className="absolute inset-0 bg-black" />,
    ssr: false
  }
)

export function BackgroundWrapper() {
  return <Background3D />
}
