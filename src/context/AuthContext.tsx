import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  type User,
} from 'firebase/auth'
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase'
import { getUserProfile, saveUserProfile } from '../lib/firestore'
import type { UserProfile, SavedAddress } from '../types/user'

interface AuthContextType {
  currentUser: User | null
  userProfile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  isDemoAuth: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>
  saveAddress: (address: Omit<SavedAddress, 'id'>, editId?: string) => Promise<void>
  deleteAddress: (id: string) => Promise<void>
  setDefaultAddress: (id: string) => Promise<void>
  loginDemoAdmin: () => void
  loginDemoCustomer: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_ADMIN_PROFILE: UserProfile = {
  uid: 'demo-admin-uid',
  email: 'admin@levix.in',
  displayName: 'LEVIX Administrator',
  role: 'admin',
  addresses: [],
}

const DEMO_CUSTOMER_PROFILE: UserProfile = {
  uid: 'demo-customer-uid',
  email: 'customer@levix.in',
  displayName: 'Mohan Sharma',
  phone: '+91 98765 43210',
  role: 'customer',
  addresses: [
    {
      id: 'addr-default-1',
      fullName: 'Mohan Sharma',
      email: 'customer@levix.in',
      phone: '+91 98765 43210',
      street: '42, Indiranagar 100ft Road',
      apartment: 'Apt 4B',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      isDefault: true,
    },
  ],
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Check if demo user was active
    const savedDemo = localStorage.getItem('levix_demo_user')
    if (savedDemo === 'admin') return DEMO_ADMIN_PROFILE
    if (savedDemo === 'customer') return DEMO_CUSTOMER_PROFILE
    return null
  })
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('levix_demo_user') === 'admin'
  })
  const [loading, setLoading] = useState<boolean>(true)
  const isDemoAuth = Boolean(!isFirebaseConfigured || userProfile?.uid.startsWith('demo-'))

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        // Fetch or create profile
        let profile = await getUserProfile(user.uid)
        if (!profile) {
          profile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
            role: 'customer',
            addresses: [],
            createdAt: new Date().toISOString(),
          }
          await saveUserProfile(profile)
        }

        // Check admin privilege: Custom Claim or admin email
        const tokenResult = await user.getIdTokenResult(true)
        const isCustomClaimAdmin = Boolean(tokenResult.claims.admin)
        const isAdminEmail = user.email?.toLowerCase().includes('admin') || user.email === 'admin@levix.in'

        const adminStatus = isCustomClaimAdmin || isAdminEmail || profile.role === 'admin'
        setIsAdmin(adminStatus)
        setUserProfile({ ...profile, role: adminStatus ? 'admin' : 'customer' })
      } else {
        // Check if demo session is active
        const savedDemo = localStorage.getItem('levix_demo_user')
        if (savedDemo === 'admin') {
          setUserProfile(DEMO_ADMIN_PROFILE)
          setIsAdmin(true)
        } else if (savedDemo === 'customer') {
          setUserProfile(DEMO_CUSTOMER_PROFILE)
          setIsAdmin(false)
        } else {
          setUserProfile(null)
          setIsAdmin(false)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, pass: string) => {
    if (email === 'admin@levix.in' || (!isFirebaseConfigured && email.includes('admin'))) {
      loginDemoAdmin()
      return
    }
    if (!isFirebaseConfigured || !auth) {
      loginDemoCustomer()
      return
    }
    await signInWithEmailAndPassword(auth, email, pass)
  }

  const register = async (email: string, pass: string, displayName: string) => {
    if (!isFirebaseConfigured || !auth) {
      const demoProfile: UserProfile = {
        uid: `usr-${Date.now()}`,
        email,
        displayName,
        role: 'customer',
        addresses: [],
      }
      setUserProfile(demoProfile)
      setIsAdmin(false)
      localStorage.setItem('levix_demo_user', 'customer')
      return
    }
    const res = await createUserWithEmailAndPassword(auth, email, pass)
    const newProfile: UserProfile = {
      uid: res.user.uid,
      email,
      displayName,
      role: 'customer',
      addresses: [],
      createdAt: new Date().toISOString(),
    }
    await saveUserProfile(newProfile)
    setUserProfile(newProfile)
  }

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      loginDemoCustomer()
      return
    }
    await signInWithPopup(auth, googleProvider)
  }

  const logout = async () => {
    localStorage.removeItem('levix_demo_user')
    if (auth && isFirebaseConfigured) {
      await firebaseSignOut(auth)
    }
    setCurrentUser(null)
    setUserProfile(null)
    setIsAdmin(false)
  }

  const resetPassword = async (email: string) => {
    if (auth && isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email)
    }
  }

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!userProfile) return
    const updated = { ...userProfile, ...data, updatedAt: new Date().toISOString() }
    setUserProfile(updated)
    if (isFirebaseConfigured && db && !userProfile.uid.startsWith('demo-')) {
      await saveUserProfile(updated)
    }
  }

  const saveAddress = async (address: Omit<SavedAddress, 'id'>, editId?: string) => {
    if (!userProfile) return
    const currentAddresses = userProfile.addresses || []
    let updatedAddresses: SavedAddress[]

    if (editId) {
      updatedAddresses = currentAddresses.map((addr) =>
        addr.id === editId
          ? { ...address, id: editId, isDefault: address.isDefault }
          : address.isDefault
          ? { ...addr, isDefault: false }
          : addr
      )
    } else {
      const newAddress: SavedAddress = {
        ...address,
        id: `addr-${Date.now()}`,
        isDefault: currentAddresses.length === 0 || address.isDefault,
      }
      updatedAddresses = address.isDefault
        ? currentAddresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
        : [...currentAddresses, newAddress]
    }

    await updateProfileData({ addresses: updatedAddresses })
  }

  const deleteAddress = async (id: string) => {
    if (!userProfile) return
    const updated = (userProfile.addresses || []).filter((a) => a.id !== id)
    await updateProfileData({ addresses: updated })
  }

  const setDefaultAddress = async (id: string) => {
    if (!userProfile) return
    const updated = (userProfile.addresses || []).map((a) => ({
      ...a,
      isDefault: a.id === id,
    }))
    await updateProfileData({ addresses: updated })
  }

  const loginDemoAdmin = () => {
    localStorage.setItem('levix_demo_user', 'admin')
    setUserProfile(DEMO_ADMIN_PROFILE)
    setIsAdmin(true)
  }

  const loginDemoCustomer = () => {
    localStorage.setItem('levix_demo_user', 'customer')
    setUserProfile(DEMO_CUSTOMER_PROFILE)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        isDemoAuth,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateProfileData,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
        loginDemoAdmin,
        loginDemoCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
