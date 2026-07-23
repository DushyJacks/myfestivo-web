import { useEffect } from "react"
import { MainEvent } from "@/lib/events-context"
import { sendEventReminder } from "@/lib/notifications"

/**
 * Custom hook to set up automatic event reminders
 * Schedules notifications for 24h and 1h before event time
 */
export function useEventReminders(event: MainEvent | null) {
  useEffect(() => {
    if (!event || !event.date) return

    // Parse event date
    const eventDate = new Date(event.date)
    const now = new Date()

    // Get registered participant emails
    const participantEmails = [...new Set(event.registrations.map(r => r.userEmail))]

    if (participantEmails.length === 0) return

    // Calculate reminder times
    const timeUntilEvent = eventDate.getTime() - now.getTime()
    const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60)

    const reminders: Array<{
      type: "24h" | "1h"
      hoursBeforeEvent: number
      label: string
    }> = [
      { type: "24h", hoursBeforeEvent: 24, label: "24 hours" },
      { type: "1h", hoursBeforeEvent: 1, label: "1 hour" },
    ]

    // Set up reminder timeouts
    const timeoutIds: number[] = []

    reminders.forEach(({ type, hoursBeforeEvent, label }) => {
      const timeUntilReminder = timeUntilEvent - hoursBeforeEvent * 60 * 60 * 1000

      // Only set reminder if it's still in the future
      if (timeUntilReminder > 0) {
        const timeoutId = window.setTimeout(async () => {
          console.log(`Sending ${label} reminder for event: ${event.title}`)
          try {
            await sendEventReminder(event.id, event.title, type, participantEmails)
          } catch (error) {
            console.error(`Error sending ${label} reminder:`, error)
          }
        }, timeUntilReminder)

        timeoutIds.push(timeoutId)
      }
    })

    // Also check if we should send immediate reminders
    if (hoursUntilEvent < 24 && hoursUntilEvent > 0) {
      // Event is within 24 hours, send the 24h reminder immediately
      console.log("Event within 24 hours, sending reminder immediately")
      sendEventReminder(event.id, event.title, "24h", participantEmails).catch(error => {
        console.error("Error sending immediate 24h reminder:", error)
      })
    }

    if (hoursUntilEvent < 1 && hoursUntilEvent > 0) {
      // Event within 1 hour, send the 1h reminder immediately
      console.log("Event within 1 hour, sending reminder immediately")
      sendEventReminder(event.id, event.title, "1h", participantEmails).catch(error => {
        console.error("Error sending immediate 1h reminder:", error)
      })
    }

    // Cleanup timeouts on unmount
    return () => {
      timeoutIds.forEach(id => window.clearTimeout(id))
    }
  }, [event])
}

/**
 * Hook to set up reminders for a specific task deadline
 */
export function useTaskReminders(eventId: string, eventTitle: string, taskTitle: string, deadline: string) {
  useEffect(() => {
    if (!deadline) return

    const deadlineDate = new Date(deadline)
    const now = new Date()
    const timeUntilDeadline = deadlineDate.getTime() - now.getTime()

    // Set reminder for 1 day before deadline
    const oneDayBeforeMs = 1 * 24 * 60 * 60 * 1000
    const timeUntilReminder = timeUntilDeadline - oneDayBeforeMs

    if (timeUntilReminder > 0) {
      const timeoutId = window.setTimeout(() => {
        const notification = new Notification(`📋 Task Due Tomorrow: ${taskTitle}`, {
          body: `"${taskTitle}" in ${eventTitle} is due tomorrow`,
          icon: "/icons/notification-icon.png",
          tag: `task-reminder-${eventId}`,
          data: {
            eventId,
            url: `/events/${eventId}`,
          },
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
          window.location.href = `/events/${eventId}`
        }
      }, timeUntilReminder)

      return () => window.clearTimeout(timeoutId)
    }
  }, [eventId, eventTitle, taskTitle, deadline])
}
