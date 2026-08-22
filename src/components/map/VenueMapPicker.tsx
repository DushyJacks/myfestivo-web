"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

interface VenueMapPickerProps {
  /** Current lat. undefined = no pin yet. */
  lat?: number
  lng?: number
  onSelect: (lat: number, lng: number) => void
}

/**
 * VenueMapPicker — interactive Leaflet map for create/edit event forms.
 * Click anywhere on the map to drop a pin and capture coordinates.
 * Loaded client-side only.
 */
export function VenueMapPicker({ lat, lng, onSelect }: VenueMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let isMounted = true
    if (!containerRef.current || mapRef.current) return

    ;(async () => {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")
      if (!isMounted) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const initialCenter: [number, number] = lat && lng ? [lat, lng] : [13.0827, 80.2707] // Default: Chennai
      const map = L.map(containerRef.current!, {
        center: initialCenter,
        zoom: lat && lng ? 16 : 12,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Drop a marker wherever the user clicks
      const placeMarker = (latlng: { lat: number; lng: number }) => {
        if (markerRef.current) {
          markerRef.current.setLatLng(latlng)
        } else {
          markerRef.current = L.marker(latlng, { draggable: true }).addTo(map)
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current.getLatLng()
            onSelect(pos.lat, pos.lng)
          })
        }
        onSelect(latlng.lat, latlng.lng)
      }

      // If coordinates already exist, place the initial marker
      if (lat && lng) placeMarker({ lat, lng })

      map.on("click", (e: any) => placeMarker(e.latlng))

      mapRef.current = map
    })()

    return () => {
      isMounted = false
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When lat/lng prop changes externally (e.g. after geocoding), re-center + update marker
  useEffect(() => {
    if (!mapRef.current || lat === undefined || lng === undefined) return
    ;(async () => {
      const L = (await import("leaflet")).default
      mapRef.current.setView([lat, lng], 16)
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current)
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current.getLatLng()
          onSelect(pos.lat, pos.lng)
        })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      )
      const results = await res.json()
      if (results.length > 0) {
        const { lat: rLat, lon: rLng } = results[0]
        onSelect(parseFloat(rLat), parseFloat(rLng))
      }
    } catch {
      // Silent fail — user can still click manually
    }
    setSearching(false)
  }

  return (
    <div className="space-y-2">
      {/* Geocode search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search for a place on the map…"
            className="w-full h-8 bg-white/[0.03] border border-white/[0.08] text-white text-xs rounded-md pl-8 pr-3 outline-none focus:border-white/20 placeholder:text-white/20 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="h-8 px-3 text-[10px] font-mono text-black bg-white rounded-md hover:bg-white/90 disabled:opacity-40 transition-colors"
        >
          {searching ? "…" : "Search"}
        </button>
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        style={{ height: "260px", width: "100%" }}
        className="rounded-lg overflow-hidden border border-white/[0.08]"
      />

      {lat !== undefined && lng !== undefined ? (
        <p className="text-[10px] font-mono text-white/30 text-right">
          📍 {lat.toFixed(5)}, {lng.toFixed(5)} — drag the pin to adjust
        </p>
      ) : (
        <p className="text-[10px] font-mono text-white/20 text-center">
          Click on the map or search above to pin the venue location.
        </p>
      )}
    </div>
  )
}
