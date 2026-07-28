import { useEffect, useRef, useState, useCallback } from "react"
import jsQR from "jsqr"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import { X, Camera, RefreshCw, ShieldAlert, SwitchCamera } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [permState, setPermState] = useState<"checking" | "granted" | "denied" | "prompt">("checking")
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    cancelAnimationFrame(animFrameRef.current)
    // Clear srcObject so the video element fully releases the camera
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    stopCamera()

    // Guard: camera API requires a secure context (HTTPS) and a modern browser
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        "Camera API is not available. Please ensure you are accessing the site over HTTPS and using a supported browser."
      )
      return
    }

    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

      const constraints = {
        video: isMobile
          ? {
              facingMode: { ideal: facingMode }, // Prefer selected camera on mobile
            }
          : {
              facingMode: facingMode === "environment" ? "user" : facingMode, // Front camera on desktop/laptop
            },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      streamRef.current = stream
      setPermState("granted")

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Video play error:", e))
          tick()
        }
      }
    } catch (err: any) {
      console.error({
        name: err.name,
        message: err.message,
        constraint: err.constraint,
        stack: err.stack,
      })
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setPermState("denied")
        setError("Camera access was denied. Please allow camera access in your browser/device settings and try again.")
      } else if (err?.name === "NotFoundError") {
        setError("No camera found on this device.")
      } else {
        setError(`Could not start camera: ${err?.message || "Unknown error"}. Make sure no other app is using it and try again.`)
      }
    }
  }, [stopCamera, facingMode])

  const tick = useCallback(() => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
      canvasRef.current
    ) {
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
          return
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(tick)
  }, [onScan])

  // Restart camera on mount and whenever facingMode changes
  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [facingMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchCamera = () => {
    setFacingMode(prev => (prev === "environment" ? "user" : "environment"))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 relative flex flex-col items-center">
        <Button onClick={onClose} variant="ghost" className="absolute top-4 right-4 text-white/50 hover:text-white" size="icon">
          <X className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-light mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" /> Scan QR Code
        </h2>

        {error ? (
          <div className="w-full space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-center space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto opacity-70" />
              <p className="font-mono text-sm">{error}</p>
            </div>
            {permState !== "denied" && (
              <Button
                onClick={startCamera}
                className="w-full bg-white text-black hover:bg-white/90 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            )}
            {permState === "denied" && (
              <p className="text-[11px] text-white/30 font-mono text-center">
                Open your browser settings → Site Settings → Camera → Allow.
              </p>
            )}
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-white/10 w-full aspect-square bg-black mb-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 pointer-events-none border-[3px] border-green-500/30 m-8 rounded-xl" />
            {/* Switch Camera button — overlaid bottom-right of the video */}
            <Button
              onClick={switchCamera}
              variant="ghost"
              size="icon"
              title={facingMode === "environment" ? "Switch to front camera" : "Switch to rear camera"}
              className="absolute bottom-3 right-3 bg-black/50 text-white hover:bg-black/70 rounded-full w-10 h-10 backdrop-blur-sm border border-white/10"
            >
              <SwitchCamera className="w-5 h-5" />
            </Button>
          </div>
        )}
        <p className="text-xs text-white/40 font-mono text-center mt-2">Position the QR code within the frame.</p>
      </GlassCard>
    </div>
  )
}
