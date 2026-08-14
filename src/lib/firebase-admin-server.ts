/**
 * Firebase Admin SDK — server-side only.
 *
 * Initialised lazily and attached to globalThis so it survives Next.js
 * module hot-reloads in development without creating duplicate apps.
 *
 * Required environment variables (add to .env.local and Netlify):
 *   FIREBASE_ADMIN_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY   (the full PEM string, include the -----BEGIN/END----- lines)
 *
 * If those variables are absent the module falls back to an uninitialised
 * state and individual helpers will throw descriptive errors.
 */

import type { App } from 'firebase-admin/app'
import type { Auth } from 'firebase-admin/auth'

const g = globalThis as typeof globalThis & { __firebaseAdminApp?: App }

async function getAdminApp(): Promise<App> {
  if (g.__firebaseAdminApp) return g.__firebaseAdminApp

  const { initializeApp, getApps, cert } = await import('firebase-admin/app')

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      '[firebase-admin-server] Missing environment variables. ' +
      'Please set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY ' +
      '(and NEXT_PUBLIC_FIREBASE_PROJECT_ID if not already set) in your .env.local and Netlify settings.'
    )
  }

  // Avoid "already exists" error if Next.js re-evaluates this module
  const existing = getApps().find(a => a.name === 'myfestivo-admin')
  if (existing) {
    g.__firebaseAdminApp = existing
    return existing
  }

  const app = initializeApp(
    { credential: cert({ projectId, clientEmail, privateKey }) },
    'myfestivo-admin'
  )
  g.__firebaseAdminApp = app
  return app
}

/** Returns a Firebase Admin Auth instance */
export async function getAdminAuth(): Promise<Auth> {
  const { getAuth } = await import('firebase-admin/auth')
  const app = await getAdminApp()
  return getAuth(app)
}
