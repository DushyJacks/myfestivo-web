import { initializeApp, getApps } from "firebase/app"
import { getAuth as firebaseGetAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

let firebaseApp: any = null
let firebaseAuth: any = null
let firebaseDb: any = null

function ensureFirebaseInitialized() {
  if (firebaseApp) return

  // Skip if env vars not available (development/staging without proper config)
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    if (typeof window !== 'undefined') {
      console.warn('Firebase API key not configured. Firebase features will be unavailable.')
    }
    return
  }

  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }

    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    firebaseAuth = firebaseGetAuth(firebaseApp)
    firebaseDb = getFirestore(firebaseApp)

    // Persist session in localStorage so reloads don't log the user out.
    // Token auto-refreshes every ~1 hour; session stays valid until explicit sign-out.
    if (typeof window !== 'undefined') {
      setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {
        // Silently ignore — default is already LOCAL in most environments
      })
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error)
  }
}

// Lazy getters - initialize only when accessed
export function auth() {
  ensureFirebaseInitialized()
  return firebaseAuth
}

export function db() {
  ensureFirebaseInitialized()
  return firebaseDb
}

export default firebaseApp
