"use client"

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
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
  // Reduce particle count and disable antialiasing on mobile for performance
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const particleCount = isMobile ? 300 : 800

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black">
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
