import { initializeApp, getApps } from "firebase/app"
import { getAuth as firebaseGetAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

let firebaseApp: any = null
let firebaseAuth: any = null
let firebaseDb: any = null

function ensureFirebaseInitialized() {
  if (firebaseApp) return

  // Skip if env vars not available (e.g., during Netlify build)
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error("Firebase API key not configured")
  }

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
