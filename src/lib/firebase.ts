import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCFG1SNWfez77o-KoWOkYnn6D1D86d_BPI",
  authDomain: "myfestivo.firebaseapp.com",
  projectId: "myfestivo",
  storageBucket: "myfestivo.firebasestorage.app",
  messagingSenderId: "56147733860",
  appId: "1:56147733860:web:d1ded45a63df30de691e71",
  measurementId: "G-CLLF8QR316",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
