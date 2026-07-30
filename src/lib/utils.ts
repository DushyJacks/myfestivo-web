import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert internal yyyy-mm-dd date string to display format dd-mm-yyyy.
 * Returns the original string unchanged if it can't be parsed.
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return ""
  const parts = dateStr.split("-")
  if (parts.length === 3 && parts[0].length === 4) {
    // yyyy-mm-dd → dd-mm-yyyy
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

/**
 * Convert 24-hour time string (HH:MM) to 12-hour AM/PM format.
 * Returns empty string if input is empty/undefined.
 */
export function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return ""
  const [h, m] = timeStr.split(":")
  if (!h || !m) return timeStr
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${String(hour12).padStart(2, "0")}:${m} ${ampm}`
}

/**
 * Compress image file to reduce base64 size for Firebase storage
 * Resizes to max 800x600 and reduces quality to 0.7 (JPEG)
 */
export async function compressImage(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to JPEG with quality setting to reduce size
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}
