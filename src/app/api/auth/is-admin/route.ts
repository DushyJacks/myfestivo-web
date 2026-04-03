import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Check if user is admin by looking up their Firestore document
 */
async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users')
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
 * Check if email is admin (fallback method)
 */
function isEmailAdmin(email: string): boolean {
  const adminEmails = [
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
  ].filter(Boolean).flatMap(emails => emails.split(',').map(e => e.trim()))
  
  return adminEmails.includes(email)
}

/**
 * Check if user is admin
 * GET /api/auth/is-admin?uid=user-id
 * or POST with auth context
 * 
 * Returns:
 * { isAdmin: boolean, uid?: string }
 */
export async function GET(request: NextRequest) {
  try {
    // Get uid from query parameters
    const uid = request.nextUrl.searchParams.get('uid')
    
    if (!uid) {
      return NextResponse.json(
        { error: 'Missing uid parameter', isAdmin: false },
        { status: 400 }
      )
    }

    // Check if user is admin via Firestore
    const isAdmin = await isUserAdmin(uid)

    return NextResponse.json(
      { isAdmin, uid },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', isAdmin: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, email } = body

    if (!uid && !email) {
      return NextResponse.json(
        { error: 'Missing uid or email', isAdmin: false },
        { status: 400 }
      )
    }

    // Check by UID first (Firestore)
    if (uid) {
      const isAdmin = await isUserAdmin(uid)
      if (isAdmin) {
        return NextResponse.json({ isAdmin: true, uid }, { status: 200 })
      }
    }

    // Fallback to email check
    if (email) {
      const isAdmin = isEmailAdmin(email)
      return NextResponse.json({ isAdmin, email }, { status: 200 })
    }

    return NextResponse.json(
      { isAdmin: false },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', isAdmin: false },
      { status: 500 }
    )
  }
}
