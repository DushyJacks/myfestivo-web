"use client"

import dynamic from "next/dynamic"

/**
 * Client-only wrapper for EventMapView.
 * Use this everywhere Leaflet is displayed (no SSR).
 */
export const EventMapViewDynamic = dynamic(
  () => import("@/components/map/EventMapView").then(m => ({ default: m.EventMapView })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] h-[220px] flex items-center justify-center">
        <span className="text-[10px] font-mono text-white/20 animate-pulse">Loading map…</span>
      </div>
    ),
  }
)

/**
 * Client-only wrapper for VenueMapPicker.
 * Use this in create/edit event forms (no SSR).
 */
export const VenueMapPickerDynamic = dynamic(
  () => import("@/components/map/VenueMapPicker").then(m => ({ default: m.VenueMapPicker })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] h-[260px] flex items-center justify-center">
        <span className="text-[10px] font-mono text-white/20 animate-pulse">Loading map picker…</span>
      </div>
    ),
  }
)
