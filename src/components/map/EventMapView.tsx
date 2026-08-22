"use client"

import { useEffect, useRef } from "react"

interface EventMapViewProps {
  lat: number
  lng: number
  venueName: string
}

/**
 * EventMapView — read-only OpenStreetMap tile via Leaflet.
 * Loaded client-side only (Leaflet requires browser APIs).
 */
export function EventMapView({ lat, lng, venueName }: EventMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    let isMounted = true
    if (!containerRef.current || mapRef.current) return

    // Dynamically import Leaflet so it never runs on the server
    ;(async () => {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")
      if (!isMounted) return

      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${venueName}</b>`)
        .openPopup()

      mapRef.current = map
    })()

    return () => {
      isMounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      style={{ height: "220px", width: "100%" }}
      className="rounded-lg overflow-hidden border border-white/[0.08]"
    />
  )
}
