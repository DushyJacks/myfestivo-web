import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import { X, Camera } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let animationFrameId: number

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Video play error:", e))
            requestAnimationFrame(tick)
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Camera access denied or unavailable. Please enable permissions.")
      }
    }

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        
        if (ctx) {
          canvas.height = video.videoHeight
          canvas.width = video.videoWidth
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          })
          
          if (code) {
             onScan(code.data)
             return // Stop scanning once we found one
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick)
    }

    startCamera()

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
      cancelAnimationFrame(animationFrameId)
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 relative flex flex-col items-center">
        <Button onClick={onClose} variant="ghost" className="absolute top-4 right-4 text-white/50 hover:text-white" size="icon">
          <X className="w-5 h-5"/>
        </Button>
        <h2 className="text-xl font-light mb-4 flex items-center gap-2"><Camera className="w-5 h-5" /> Scan QR Code</h2>
        
        {error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-center font-mono text-sm">
            {error}
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-white/10 w-full aspect-square bg-black mb-4">
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 pointer-events-none border-[3px] border-green-500/30 m-8 rounded-xl" />
          </div>
        )}
        <p className="text-xs text-white/40 font-mono text-center">Position the QR code within the frame.</p>
      </GlassCard>
    </div>
  )
}
