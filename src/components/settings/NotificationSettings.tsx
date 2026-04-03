"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, BellOff, Check, Loader } from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import {
  getNotificationPreference,
  saveNotificationPreference,
  requestNotificationPermission,
} from "@/lib/notifications"

interface NotificationSettingsProps {
  userEmail: string
}

export function NotificationSettings({ userEmail }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState({
    enableBrowser: true,
    enableReminders: true,
    enableChat: true,
    enableAnnouncements: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getNotificationPreference(userEmail)
        setPreferences(prefs)

        // Check notification permission
        if ("Notification" in window) {
          setNotificationPermission(Notification.permission)
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [userEmail])

  const handleSavePreferences = async () => {
    if (!preferences.enableBrowser) {
      // If disabling browser notifications, don't need permission
      setSaving(true)
      try {
        await saveNotificationPreference(userEmail, preferences)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } finally {
        setSaving(false)
      }
    } else {
      // Request permission first
      setSaving(true)
      try {
        const granted = await requestNotificationPermission()
        if (granted) {
          await saveNotificationPreference(userEmail, preferences)
          setSaved(true)
          setNotificationPermission("granted")
          setTimeout(() => setSaved(false), 3000)
        } else {
          alert("Notification permission denied. Please enable it in your browser settings.")
          setPreferences(prev => ({ ...prev, enableBrowser: false }))
        }
      } finally {
        setSaving(false)
      }
    }
  }

  const toggleSetting = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
    setSaved(false)
  }

  const settings = [
    {
      key: "enableBrowser" as const,
      label: "Browser Notifications",
      description: "Receive notifications directly in your browser",
      icon: Bell,
    },
    {
      key: "enableReminders" as const,
      label: "Event Reminders",
      description: "Get reminded 24h and 1h before events start",
      icon: Bell,
    },
    {
      key: "enableChat" as const,
      label: "Chat Messages",
      description: "Notifications for event chat messages",
      icon: Bell,
    },
    {
      key: "enableAnnouncements" as const,
      label: "Announcements",
      description: "Notifications for event announcements",
      icon: Bell,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-5 h-5 animate-spin text-white/40" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.02] to-white/[0.005] p-5">
        <div className="flex items-start gap-3 mb-4">
          <Bell className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white mb-1">Notification Preferences</h3>
            <p className="text-sm text-white/40">
              Choose how you'd like to receive updates about your events
            </p>
          </div>
        </div>

        {notificationPermission === "denied" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <p className="text-sm text-red-300/80">
              Browser notifications are disabled. Please enable them in your browser settings.
            </p>
          </motion.div>
        )}

        <div className="space-y-3">
          {settings.map(({ key, label, description, icon: Icon }) => (
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start justify-between p-3 rounded-lg bg-white/[0.01] border border-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon className="w-4 h-4 text-white/40 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/30">{description}</p>
                </div>
              </div>

              <button
                onClick={() => toggleSetting(key)}
                className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/40 ${
                  preferences[key] ? "bg-green-600" : "bg-white/[0.1]"
                }`}
                aria-label={`Toggle ${label}`}
              >
                <motion.div
                  initial={false}
                  animate={{ x: preferences[key] ? 20 : 2 }}
                  className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
                />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            onClick={handleSavePreferences}
            disabled={saving}
            className="flex-1 bg-white text-black hover:bg-white/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>

          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-300"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </motion.div>
          )}
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Browser Support</p>
          <p className="text-xs text-white/40">
            Your browser {
              "Notification" in window
                ? `supports notifications (${notificationPermission})`
                : "does not support notifications"
            }
          </p>
          {notificationPermission === "granted" && (
            <p className="text-xs text-green-300/80 flex items-center gap-1">
              <Check className="w-3 h-3" /> Notifications enabled
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
