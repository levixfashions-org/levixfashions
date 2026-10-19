import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBf7yXNESX0tM311-Ld5qG7Xrpp7RkK5ko',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'levix-fb261.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'levix-fb261',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'levix-fb261.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '50160210193',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:50160210193:web:2acc681095ea6b0b7b3cb0',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_')
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
const googleProvider = new GoogleAuthProvider()

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
  } catch (error) {
    console.warn('Firebase initialization warning:', error)
  }
} else {
  console.info('LEVIX: Running with Local Persistence & Hybrid Firestore mode. Set VITE_FIREBASE_* in .env to connect to live Firebase.')
}

export { app, auth, db, googleProvider }
