import { db as getDb } from "./firebase"
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"

/**
 * Notification service for handling web and mobile push notifications
 */

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, string>
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

/**
 * Send a browser notification immediately
 */
export async function sendBrowserNotification(
  payload: NotificationPayload
): Promise<Notification | null> {
  try {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported")
      return null
    }

    if (Notification.permission !== "granted") {
      const granted = await requestNotificationPermission()
      if (!granted) return null
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/icons/notification-icon.png",
      badge: payload.badge || "/icons/notification-badge.png",
      tag: payload.tag || "myfestivo-notification",
      data: payload.data,
      requireInteraction: true,
    })

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
      if (payload.data?.url) {
        window.location.href = payload.data.url
      }
    }

    return notification
  } catch (error) {
    console.error("Error sending notification:", error)
    return null
  }
}

/**
 * Send event reminder notifications
 */
export async function sendEventReminder(
  eventId: string,
  eventTitle: string,
  reminderType: "24h" | "1h" | "started",
  registrationEmails: string[]
): Promise<void> {
  try {
    const messages: Record<string, NotificationPayload> = {
      "24h": {
        title: `⏰ Event Reminder: ${eventTitle}`,
        body: "Your event starts in 24 hours! Make sure you're prepared.",
        tag: `event-reminder-24h-${eventId}`,
        data: {
          eventId,
          type: "event-reminder",
          url: `/events/${eventId}`,
        },
      },
      "1h": {
        title: `🎉 Starting Soon: ${eventTitle}`,
        body: "The event starts in 1 hour. Get ready!",
        tag: `event-reminder-1h-${eventId}`,
        data: {
          eventId,
          type: "event-reminder",
          url: `/events/${eventId}`,
        },
      },
      started: {
        title: `🎊 Event Started: ${eventTitle}`,
        body: "The event has started. Join us now!",
        tag: `event-reminder-started-${eventId}`,
        data: {
          eventId,
          type: "event-started",
          url: `/events/${eventId}`,
        },
      },
    }

    const payload = messages[reminderType]
    if (!payload) return

    // Send to all registered participants
    for (const email of registrationEmails) {
      await sendBrowserNotification(payload)
      // Log notification in database
      await logNotification(eventId, email, payload.title, payload.body)
    }
  } catch (error) {
    console.error("Error sending event reminder:", error)
  }
}

/**
 * Send registration confirmation notification
 */
export async function sendRegistrationConfirmation(
  eventId: string,
  eventTitle: string,
  participantEmail: string,
  subEventName: string
): Promise<void> {
  try {
    const payload: NotificationPayload = {
      title: "✅ Registration Confirmed!",
      body: `You've successfully registered for ${subEventName} in ${eventTitle}`,
      tag: `registration-${eventId}-${participantEmail}`,
      data: {
        eventId,
        type: "registration-confirmed",
        url: `/events/${eventId}`,
      },
    }

    await sendBrowserNotification(payload)
    await logNotification(eventId, participantEmail, payload.title, payload.body)
  } catch (error) {
    console.error("Error sending registration confirmation:", error)
  }
}

/**
 * Send payment confirmation notification
 */
export async function sendPaymentConfirmation(
  eventId: string,
  eventTitle: string,
  participantEmail: string,
  amount: number
): Promise<void> {
  try {
    const payload: NotificationPayload = {
      title: "💳 Payment Confirmed",
      body: `Payment of ₹${amount} confirmed for ${eventTitle}`,
      tag: `payment-${eventId}-${participantEmail}`,
      data: {
        eventId,
        type: "payment-confirmed",
        url: `/events/${eventId}`,
      },
    }

    await sendBrowserNotification(payload)
    await logNotification(eventId, participantEmail, payload.title, payload.body)
  } catch (error) {
    console.error("Error sending payment confirmation:", error)
  }
}

/**
 * Send task assignment notification
 */
export async function sendTaskAssignment(
  eventId: string,
  eventTitle: string,
  assigneeEmail: string,
  taskTitle: string,
  deadline: string
): Promise<void> {
  try {
    const payload: NotificationPayload = {
      title: "📋 New Task Assigned",
      body: `"${taskTitle}" - ${eventTitle} (Due: ${deadline})`,
      tag: `task-${eventId}-${assigneeEmail}`,
      data: {
        eventId,
        type: "task-assigned",
        url: `/events/${eventId}`,
      },
    }

    await sendBrowserNotification(payload)
    await logNotification(eventId, assigneeEmail, payload.title, payload.body)
  } catch (error) {
    console.error("Error sending task assignment:", error)
  }
}

/**
 * Send announcement notification
 */
export async function sendAnnouncementNotification(
  eventId: string,
  eventTitle: string,
  registeredEmails: string[],
  announcementTitle: string,
  announcementMsg: string
): Promise<void> {
  try {
    for (const email of registeredEmails) {
      const payload: NotificationPayload = {
        title: `📢 ${eventTitle}: ${announcementTitle}`,
        body: announcementMsg.substring(0, 100),
        tag: `announcement-${eventId}`,
        data: {
          eventId,
          type: "announcement",
          url: `/events/${eventId}`,
        },
      }

      await sendBrowserNotification(payload)
      await logNotification(eventId, email, payload.title, payload.body)
    }
  } catch (error) {
    console.error("Error sending announcement notification:", error)
  }
}

/**
 * Send chat message notification
 */
export async function sendChatNotification(
  eventId: string,
  eventTitle: string,
  recipientEmails: string[],
  senderName: string,
  message: string
): Promise<void> {
  try {
    for (const email of recipientEmails) {
      const payload: NotificationPayload = {
        title: `💬 ${senderName} in ${eventTitle}`,
        body: message.substring(0, 100),
        tag: `chat-${eventId}`,
        data: {
          eventId,
          type: "chat-message",
          url: `/events/${eventId}`,
        },
      }

      await sendBrowserNotification(payload)
    }
  } catch (error) {
    console.error("Error sending chat notification:", error)
  }
}

/**
 * Log notification in database for history tracking
 */
async function logNotification(
  eventId: string,
  recipientEmail: string,
  title: string,
  message: string
): Promise<void> {
  try {
    const eventRef = doc(getDb(), "events", eventId)
    const eventSnap = await getDoc(eventRef)

    if (!eventSnap.exists()) return

    const logs = eventSnap.data()?.automationLogs || []
    const newLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      ruleId: "notification-log",
      ruleName: "Push Notification Sent",
      recipientEmail,
      message: `${title}: ${message}`,
      timestamp: new Date().toISOString(),
    }

    await updateDoc(eventRef, {
      automationLogs: [...logs, newLog],
    })
  } catch (error) {
    console.error("Error logging notification:", error)
  }
}

/**
 * Set up service worker for background notifications (optional for advanced features)
 */
export async function registerServiceWorker(): Promise<void> {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })
      console.log("Service Worker registered:", registration)
    } catch (error) {
      console.log("Service Worker registration failed:", error)
    }
  }
}

/**
 * Schedule a notification to be sent at a specific time
 */
export async function scheduleNotification(
  payload: NotificationPayload,
  scheduledTime: Date
): Promise<void> {
  const timeUntilScheduled = scheduledTime.getTime() - Date.now()

  if (timeUntilScheduled < 0) {
    // Send immediately if time has passed
    await sendBrowserNotification(payload)
    return
  }

  // Schedule notification
  setTimeout(() => {
    sendBrowserNotification(payload)
  }, timeUntilScheduled)
}
