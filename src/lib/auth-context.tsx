"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { auth as getAuthInstance, db as getDb } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
} from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"

const SESSION_KEY = "mf_session_start"
const SESSION_MAX_MS = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds

function recordSessionStart() {
  try { localStorage.setItem(SESSION_KEY, Date.now().toString()) } catch {}
}

function clearSessionStart() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}

function isSessionExpired(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false // no timestamp → don't force-logout (legacy sessions)
    const elapsed = Date.now() - parseInt(raw, 10)
    return elapsed > SESSION_MAX_MS
  } catch {
    return false
  }
}

export type UserRole = "student" | "admin" | "faculty"

export interface FriendRequest {
  from: string  // email
  fromName: string
  timestamp: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  college: string
  rollNo: string
  department: string
  year: string
  phone: string
  bio: string
  avatarColor: string
  avatarUrl: string
  collegeEmail: string
  collegeEmailVerified: boolean
  friends: string[]
  friendRequestsIn: FriendRequest[]
  friendRequestsOut: string[]
  registeredEvents: string[]
  hostedEvents: string[]
  coordinatingEvents: string[]
  /** True once the user has accepted Privacy Policy + T&C (persisted in Firestore for cross-device sync) */
  termsAccepted?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (data: SignupData) => Promise<boolean>
  logout: () => void
  deleteAccount: () => Promise<void>
  addFriend: (gmail: string) => void
  removeFriend: (gmail: string) => void
  updateProfile: (updates: Partial<User>) => void
  linkCollegeEmail: (prefix: string, domain: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  sendFriendRequest: (email: string) => Promise<boolean>
  acceptFriendRequest: (email: string) => Promise<void>
  declineFriendRequest: (email: string) => Promise<void>
  /** Writes termsAccepted: true to the user's Firestore doc + local state (cross-device sync) */
  acceptTerms: () => Promise<void>
}

interface SignupData {
  name: string
  email: string
  password: string
  role: UserRole
  college: string
  rollNo: string
  department: string
  year: string
  phone: string
}

const AuthContext = createContext<AuthContextType | null>(null)

const AVATAR_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

function pickColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const googleProvider = new GoogleAuthProvider()

const legacyDeptMap: Record<string, string> = {
  "Computer Science": "BSc CS",
  "Cyber Security": "BSc Cyber Security",
  "AI/ML": "BSc AI/ML",
}

// Standard college names — anything not in this list is treated as legacy and defaulted to the primary campus
const STANDARD_COLLEGES = new Set([
  "SRMIST, Ramapuram",
  "SRMIST, Kattankulathur",
  "SRMIST, Vadapalani",
  "SRMIST, Tiruchirappalli",
])
const DEFAULT_COLLEGE = "SRMIST, Ramapuram"

/** Normalise college string: legacy / free-text values → standard campus name. */
function normalizeCollege(college: string | undefined): string {
  if (!college || !college.trim()) return ""
  return STANDARD_COLLEGES.has(college.trim()) ? college.trim() : DEFAULT_COLLEGE
}

async function fetchUserProfile(uid: string): Promise<User | null> {
  const db = getDb()
  if (!db) return null
  const snap = await getDoc(doc(db, "users", uid))
  if (snap.exists()) {
    const data = snap.data()
    // Derive role: faculty detection from year field
    const isFaculty = data.year === "Faculty/Staff" || data.year === "Faculty" || data.role === "faculty"
    const role: UserRole = data.role === "admin" ? "admin" : isFaculty ? "faculty" : "student"
    return {
      ...data,
      role,
      department: data.department ? (legacyDeptMap[data.department] || data.department) : "",
      college: normalizeCollege(data.college),
      avatarUrl: data.avatarUrl || "",
      friendRequestsIn: data.friendRequestsIn || [],
      friendRequestsOut: data.friendRequestsOut || [],
      friends: data.friends || [],
    } as User
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const authInstance = getAuthInstance()
    if (!authInstance) {
      console.warn("[AuthProvider] Firebase Auth not initialized — skipping. Check your .env.local")
      setIsLoading(false)
      return
    }

    // Safety net: if onAuthStateChanged hasn't fired within 5 s (e.g. Firebase
    // Auth iframe is blocked or very slow), unblock the app and treat as signed-out.
    // This prevents the entire loading chain from hanging indefinitely.
    const fallbackTimer = setTimeout(() => setIsLoading(false), 5000)

    const unsub = onAuthStateChanged(authInstance, async (firebaseUser) => {
      clearTimeout(fallbackTimer) // auth resolved — cancel the fallback
      if (firebaseUser) {
        // ── 3-day absolute session timeout ────────────────────
        if (isSessionExpired()) {
          clearSessionStart()
          await signOut(authInstance)
          setUser(null)
          setIsLoading(false)
          return
        }
        const profile = await fetchUserProfile(firebaseUser.uid)
        setUser(profile)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })
    return () => { unsub(); clearTimeout(fallbackTimer) }
  }, [])


  const persistProfile = async (u: User) => {
    const db = getDb()
    if (!db) return
    setUser(u)
    await setDoc(doc(db, "users", u.id), u, { merge: true })
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    const authInstance = getAuthInstance()
    if (!authInstance) throw new Error("Firebase is not configured. Ensure NEXT_PUBLIC_FIREBASE_* environment variables are added to Netlify Site Settings and trigger a new deploy.")
    try {
      const cred = await signInWithEmailAndPassword(authInstance, email, password)
      const profile = await fetchUserProfile(cred.user.uid)
      if (profile) {
        recordSessionStart()
        setUser(profile)
        return true
      }
      return false
    } catch (err: any) {
      throw err
    }
  }

  const signup = async (data: SignupData): Promise<boolean> => {
    const authInstance = getAuthInstance()
    if (!authInstance) throw new Error("Firebase is not configured. Ensure NEXT_PUBLIC_FIREBASE_* environment variables are added to Netlify Site Settings and trigger a new deploy.")
    const db = getDb()
    if (!db) throw new Error("Firebase Firestore is not configured. Ensure NEXT_PUBLIC_FIREBASE_* environment variables are added to Netlify Site Settings and trigger a new deploy.")
    try {
      const cred = await createUserWithEmailAndPassword(authInstance, data.email, data.password)
      const newUser: User = {
        id: cred.user.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        college: data.college,
        rollNo: data.rollNo,
        department: data.department,
        year: data.year,
        phone: data.phone || "",
        bio: "",
        avatarColor: pickColor(data.name),
        avatarUrl: "",
        collegeEmail: "",
        collegeEmailVerified: false,
        friends: [],
        friendRequestsIn: [],
        friendRequestsOut: [],
        registeredEvents: [],
        hostedEvents: [],
        coordinatingEvents: [],
        termsAccepted: true, // inline checkboxes on signup form enforce acceptance
      }

      await setDoc(doc(db, "users", cred.user.uid), newUser)
      setUser(newUser)
      return true
    } catch (err: any) {
      throw err
    }
  }

  const logout = async () => {
    const authInstance = getAuthInstance()
    if (authInstance) await signOut(authInstance)
    clearSessionStart()
    setUser(null)
  }

  const deleteAccount = async (): Promise<void> => {
    const authInstance = getAuthInstance()
    const db = getDb()
    if (!authInstance?.currentUser || !user) throw new Error("Not authenticated")
    // Delete Firestore document
    if (db) await deleteDoc(doc(db, "users", user.id))
    // Delete Firebase Auth user
    await deleteUser(authInstance.currentUser)
    clearSessionStart()
    setUser(null)
  }

  /** Persist terms acceptance to Firestore so it syncs across all devices */
  const acceptTerms = async (): Promise<void> => {
    const db = getDb()
    if (!db || !user) return
    try {
      await updateDoc(doc(db, "users", user.id), { termsAccepted: true })
      setUser({ ...user, termsAccepted: true })
    } catch {}
  }

  const signInWithGoogle = async (): Promise<boolean> => {
    const authInstance = getAuthInstance()
    if (!authInstance) throw new Error("Firebase is not configured. Ensure NEXT_PUBLIC_FIREBASE_* environment variables are added to Netlify Site Settings and trigger a new deploy.")
    const db = getDb()
    if (!db) throw new Error("Firebase Firestore is not configured. Ensure NEXT_PUBLIC_FIREBASE_* environment variables are added to Netlify Site Settings and trigger a new deploy.")
    try {
      const cred = await signInWithPopup(authInstance, googleProvider)
      const existing = await fetchUserProfile(cred.user.uid)
      if (existing) {
        recordSessionStart()
        setUser(existing)
        return true
      }
      // First-time Google sign-in — create profile
      const newUser: User = {
        id: cred.user.uid,
        name: cred.user.displayName || "User",
        email: cred.user.email || "",
        role: "student",
        college: "",
        rollNo: "",
        department: "",
        year: "",
        phone: cred.user.phoneNumber || "",
        bio: "",
        avatarColor: pickColor(cred.user.displayName || "User"),
        avatarUrl: cred.user.photoURL || "",
        collegeEmail: "",
        collegeEmailVerified: false,
        friends: [],
        friendRequestsIn: [],
        friendRequestsOut: [],
        registeredEvents: [],
        hostedEvents: [],
        coordinatingEvents: [],
        termsAccepted: false, // GlobalTermsModal will prompt them after first sign-in
      }
      await setDoc(doc(db, "users", cred.user.uid), newUser)
      recordSessionStart()
      setUser(newUser)
      return true
    } catch (err: any) {
      throw err
    }
  }

  const addFriend = async (gmail: string) => {
    if (user && !user.friends.includes(gmail)) {
      const updated = { ...user, friends: [...user.friends, gmail] }
      await persistProfile(updated)
    }
  }

  const removeFriend = async (gmail: string) => {
    if (user) {
      const updated = { ...user, friends: user.friends.filter((f) => f !== gmail) }
      await persistProfile(updated)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates }
      await persistProfile(updated)
    }
  }

  const linkCollegeEmail = async (prefix: string, domain: string): Promise<boolean> => {
    if (!user) return false
    const fullEmail = `${prefix}@${domain}`
    await persistProfile({ ...user, collegeEmail: fullEmail, collegeEmailVerified: true })
    return true
  }

  const sendFriendRequest = async (email: string): Promise<boolean> => {
    if (!user || email === user.email) return false
    if (user.friends.includes(email)) return false
    if (user.friendRequestsOut.includes(email)) return false
    // Find the target user by email
    const q = query(collection(getDb(), "users"), where("email", "==", email))
    const snap = await getDocs(q)
    if (snap.empty) return false
    const targetDoc = snap.docs[0]
    const targetUser = targetDoc.data() as User
    // Add to target's incoming requests
    const updatedTarget = {
      ...targetUser,
      friendRequestsIn: [...(targetUser.friendRequestsIn || []), { from: user.email, fromName: user.name, timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") }],
    }
    await setDoc(doc(getDb(), "users", targetDoc.id), updatedTarget, { merge: true })
    // Add to our outgoing
    await persistProfile({ ...user, friendRequestsOut: [...user.friendRequestsOut, email] })
    return true
  }

  const acceptFriendRequest = async (email: string): Promise<void> => {
    if (!user) return
    // Add to our friends, remove from incoming
    const updated = {
      ...user,
      friends: [...user.friends, email],
      friendRequestsIn: user.friendRequestsIn.filter(r => r.from !== email),
    }
    await persistProfile(updated)
    // Add us to their friends, remove from their outgoing
    const q = query(collection(getDb(), "users"), where("email", "==", email))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const td = snap.docs[0]
      const tu = td.data() as User
      await setDoc(doc(getDb(), "users", td.id), {
        ...tu,
        friends: [...(tu.friends || []), user.email],
        friendRequestsOut: (tu.friendRequestsOut || []).filter((e: string) => e !== user.email),
      }, { merge: true })
    }
  }

  const declineFriendRequest = async (email: string): Promise<void> => {
    if (!user) return
    const updated = {
      ...user,
      friendRequestsIn: user.friendRequestsIn.filter(r => r.from !== email),
    }
    await persistProfile(updated)
    // Remove from their outgoing
    const q = query(collection(getDb(), "users"), where("email", "==", email))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const td = snap.docs[0]
      const tu = td.data() as User
      await setDoc(doc(getDb(), "users", td.id), {
        ...tu,
        friendRequestsOut: (tu.friendRequestsOut || []).filter((e: string) => e !== user.email),
      }, { merge: true })
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, deleteAccount, addFriend, removeFriend, updateProfile, linkCollegeEmail, signInWithGoogle, sendFriendRequest, acceptFriendRequest, declineFriendRequest, acceptTerms }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
