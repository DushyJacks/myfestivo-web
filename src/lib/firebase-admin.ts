/**
 * Firebase Admin SDK Integration
 * 
 * NOTE: This file provides utilities for admin operations.
 * For full Firebase Admin features, install firebase-admin:
 * npm install firebase-admin
 * 
 * For now, we use Firestore directly with client SDK for admin checks.
 */

import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { db as getDb } from './firebase'

/**
 * Check if user is admin by looking up their Firestore document
 * The role field should be set to 'admin' in the users collection
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const usersRef = collection(getDb(), 'users')
    const q = query(usersRef, where('__name__', '==', uid))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return false
    }

    const userData = querySnapshot.docs[0].data()
    return userData.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * List of admin email addresses (fallback)
 * This can be used if Firestore check fails
 */
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
].filter(Boolean).flatMap(emails => emails.split(',').map(e => e.trim()))

/**
 * Check if email is admin (fallback method)
 */
export function isEmailAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email)
}

/**
 * NOTE: For production, use Firebase Admin SDK to set custom claims:
 * 
 * 1. Install firebase-admin:
 *    npm install firebase-admin
 * 
 * 2. In your backend (Node.js/Cloud Functions):
 *    import * as admin from 'firebase-admin'
 *    await admin.auth().setCustomUserClaims(uid, { admin: true })
 * 
 * 3. Then verify custom claims in your endpoints with:
 *    const decodedToken = await admin.auth().verifyIdToken(token)
 *    if (decodedToken.admin) { ... }
 */

