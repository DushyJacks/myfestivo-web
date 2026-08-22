"use client"

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'

function FloatingShapes() {
  const mesh = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    mesh.current.rotation.x += delta * 0.002
    mesh.current.rotation.y += delta * 0.001
  })
  return (
    <mesh ref={mesh} position={[3, 1, -4]}>
      <icosahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial 
        color="#111111" 
        wireframe={true} 
        emissive="#0D0D0D" 
      />
    </mesh>
  )
}

function FloatingShapes2() {
  const mesh = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    mesh.current.rotation.x += delta * 0.002
    mesh.current.rotation.y += delta * 0.001
  })
  return (
    <mesh ref={mesh} position={[-4, -2, -6]}>
      <torusGeometry args={[1.5, 0.4, 16, 50]} />
      <meshStandardMaterial 
        color="#111111" 
        wireframe={false} 
        emissive="#0D0D0D" 
      />
    </mesh>
  )
}

function FloatingShapes3() {
  const mesh = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    mesh.current.rotation.x -= delta * 0.003
    mesh.current.rotation.z += delta * 0.001
  })
  return (
    <mesh ref={mesh} position={[5, -3, -8]}>
      <dodecahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial 
        color="#151515" 
        wireframe={true} 
        emissive="#1A1A1A" 
      />
    </mesh>
  )
}

function Particles({ count }: { count: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 50
    }
    return arr
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#ffffff" 
        transparent 
        opacity={0.3} 
        sizeAttenuation 
      />
    </points>
  )
}

export function Background3D() {
  // ── isMobile must live in state (useEffect) to avoid SSR/hydration mismatch ──
  const [isMobile, setIsMobile] = useState(false)
  // ── Gracefully degrade when WebGL context is lost (mobile GPU pressure / desktop reload) ──
  const [webGLFailed, setWebGLFailed] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  const particleCount = isMobile ? 300 : 800

  // Fallback: solid black background — identical visually, zero GPU cost
  if (webGLFailed) {
    return <div className="fixed inset-0 z-0 bg-[var(--color-surface-2)]" />
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[var(--color-surface-2)]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          alpha: false,
          antialias: !isMobile,
          powerPreference: isMobile ? "low-power" : "high-performance",
        }}
        style={{ background: "#000000" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 1)
          // Listen for WebGL context loss (common on mobile mid-session or forced reload)
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            setWebGLFailed(true)
          }, { once: true })
        }}
      >
        <ambientLight intensity={0.2} />
        <FloatingShapes />
        <FloatingShapes2 />
        <FloatingShapes3 />
        <Particles count={particleCount} />
      </Canvas>
    </div>
  )
}
