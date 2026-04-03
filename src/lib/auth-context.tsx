"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { AuthInstance as auth, db } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

export type UserRole = "student" | "admin"

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
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (data: SignupData) => Promise<boolean>
  logout: () => void
  addFriend: (gmail: string) => void
  removeFriend: (gmail: string) => void
  updateProfile: (updates: Partial<User>) => void
  linkCollegeEmail: (prefix: string, domain: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  sendFriendRequest: (email: string) => Promise<boolean>
  acceptFriendRequest: (email: string) => Promise<void>
  declineFriendRequest: (email: string) => Promise<void>
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
}

const AuthContext = createContext<AuthContextType | null>(null)

const AVATAR_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

function pickColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const googleProvider = new GoogleAuthProvider()

async function fetchUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid))
  if (snap.exists()) {
    const data = snap.data()
    return {
      ...data,
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
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid)
        setUser(profile)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const persistProfile = async (u: User) => {
    setUser(u)
    await setDoc(doc(db, "users", u.id), u, { merge: true })
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const profile = await fetchUserProfile(cred.user.uid)
      if (profile) {
        setUser(profile)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password)

      const newUser: User = {
        id: cred.user.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        college: data.college,
        rollNo: data.rollNo,
        department: data.department,
        year: data.year,
        phone: "",
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
      }

      await setDoc(doc(db, "users", cred.user.uid), newUser)
      setUser(newUser)
      return true
    } catch {
      return false
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      const existing = await fetchUserProfile(cred.user.uid)
      if (existing) {
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
      }
      await setDoc(doc(db, "users", cred.user.uid), newUser)
      setUser(newUser)
      return true
    } catch {
      return false
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
    const q = query(collection(db, "users"), where("email", "==", email))
    const snap = await getDocs(q)
    if (snap.empty) return false
    const targetDoc = snap.docs[0]
    const targetUser = targetDoc.data() as User
    // Add to target's incoming requests
    const updatedTarget = {
      ...targetUser,
      friendRequestsIn: [...(targetUser.friendRequestsIn || []), { from: user.email, fromName: user.name, timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") }],
    }
    await setDoc(doc(db, "users", targetDoc.id), updatedTarget, { merge: true })
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
    const q = query(collection(db, "users"), where("email", "==", email))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const td = snap.docs[0]
      const tu = td.data() as User
      await setDoc(doc(db, "users", td.id), {
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
    const q = query(collection(db, "users"), where("email", "==", email))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const td = snap.docs[0]
      const tu = td.data() as User
      await setDoc(doc(db, "users", td.id), {
        ...tu,
        friendRequestsOut: (tu.friendRequestsOut || []).filter((e: string) => e !== user.email),
      }, { merge: true })
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, addFriend, removeFriend, updateProfile, linkCollegeEmail, signInWithGoogle, sendFriendRequest, acceptFriendRequest, declineFriendRequest }}
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
