"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface TimeInputProps {
  value: string // 24h format "HH:mm"
  onChange: (val: string) => void
  className?: string
}

export function TimeInput({ value, onChange, className }: TimeInputProps) {
  // Parse 24h value to 12h format for the UI
  const { hour12, minute, ampm } = useMemo(() => {
    if (!value) return { hour12: "12", minute: "00", ampm: "PM" }
    const [hStr, mStr] = value.split(":")
    const h = parseInt(hStr || "12", 10)
    const ampm = h >= 12 ? "PM" : "AM"
    const hour12 = h % 12 === 0 ? 12 : h % 12
    return {
      hour12: String(hour12).padStart(2, "0"),
      minute: mStr || "00",
      ampm
    }
  }, [value])

  const handleChange = (newH12: string, newMin: string, newAmPm: string) => {
    let h24 = parseInt(newH12, 10)
    if (newAmPm === "PM" && h24 !== 12) {
      h24 += 12
    } else if (newAmPm === "AM" && h24 === 12) {
      h24 = 0
    }
    const h24Str = String(h24).padStart(2, "0")
    onChange(`${h24Str}:${newMin}`)
  }

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
  // Provide minutes in 5-minute increments for cleaner UI, or all 60. Let's do 5 min increments.
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"))

  const selectClasses = "bg-transparent text-white outline-none text-sm appearance-none cursor-pointer py-2 hover:text-white/80 focus:text-white focus:bg-[#1a1a1a]"

  return (
    <div className={cn("flex items-center bg-white/[0.03] border border-white/[0.08] rounded-md focus-within:border-white/20 transition-colors h-11 px-2 gap-1", className)}>
      <select 
        value={hour12} 
        onChange={(e) => handleChange(e.target.value, minute, ampm)}
        className={cn(selectClasses, "pl-2")}
      >
        {hours.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      
      <span className="text-white/30 font-bold">:</span>
      
      <select 
        value={minute} 
        onChange={(e) => handleChange(hour12, e.target.value, ampm)}
        className={selectClasses}
      >
        {minutes.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      
      <select 
        value={ampm} 
        onChange={(e) => handleChange(hour12, minute, e.target.value)}
        className={cn(selectClasses, "pr-2 font-medium text-white/70")}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}
