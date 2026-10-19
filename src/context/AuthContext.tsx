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

export const checkIsAdminEmail = (email?: string | null): boolean => {
  if (!email) return false
  const configured = (import.meta.env.VITE_ADMIN_EMAIL || 'levixfashions@gmail.com').toLowerCase().trim()
  const lower = email.toLowerCase().trim()
  if (configured && lower === configured) return true
  if (lower === 'levixfashions@gmail.com') return true
  return false
}

interface AuthContextType {
  currentUser: User | null
  userProfile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  isDemoAuth: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, displayName: string) => Promise<void>
  loginWithGoogle: () => Promise<boolean>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>
  saveAddress: (address: Omit<SavedAddress, 'id'>, editId?: string) => Promise<void>
  deleteAddress: (id: string) => Promise<void>
  setDefaultAddress: (id: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      // Only permit initial local flag if Firebase is NOT configured (demo/offline dev mode)
      return !isFirebaseConfigured && localStorage.getItem('levix_admin_auth') === 'true'
    } catch {
      return false
    }
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      if (!isFirebaseConfigured && localStorage.getItem('levix_admin_auth') === 'true') {
        return {
          uid: 'admin-owner',
          email: 'levixfashions@gmail.com',
          displayName: 'Levix Admin',
          role: 'admin',
          addresses: [],
          createdAt: new Date().toISOString(),
        }
      }
    } catch {}
    return null
  })
  const [loading, setLoading] = useState<boolean>(true)
  const isDemoAuth = Boolean(!isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user)
        if (user) {
          const isAuthorizedAdmin = checkIsAdminEmail(user.email)

          if (isAuthorizedAdmin) {
            setIsAdmin(true)
            try {
              localStorage.setItem('levix_admin_auth', 'true')
            } catch {}
          }

          let profile: UserProfile | null = null
          try {
            profile = await getUserProfile(user.uid)
          } catch (profileErr) {
            console.warn('Profile fetch note:', profileErr)
          }

          if (!profile) {
            profile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || (isAuthorizedAdmin ? 'Levix Admin' : 'Customer'),
              role: isAuthorizedAdmin ? 'admin' : 'customer',
              addresses: [],
              createdAt: new Date().toISOString(),
            }
            saveUserProfile(profile).catch(() => {})
          }

          let isCustomClaimAdmin = false
          try {
            const tokenResult = await user.getIdTokenResult()
            isCustomClaimAdmin = Boolean(tokenResult.claims.admin)
          } catch {}

          const adminStatus = isAuthorizedAdmin || isCustomClaimAdmin || profile.role === 'admin'
          setIsAdmin(adminStatus)
          setUserProfile({ ...profile, role: adminStatus ? 'admin' : 'customer' })

          if (adminStatus) {
            try {
              localStorage.setItem('levix_admin_auth', 'true')
            } catch {}
          }
        } else {
          // If no active Firebase user, clear profile and admin privileges
          setUserProfile(null)
          setIsAdmin(false)
          try {
            localStorage.removeItem('levix_admin_auth')
          } catch {}
        }
      } catch (err) {
        console.warn('onAuthStateChanged error handled safely:', err)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication is not configured.')
    }
    const res = await signInWithEmailAndPassword(auth, email, pass)
    const isUserAdmin = checkIsAdminEmail(res.user.email)
    if (isUserAdmin) {
      setIsAdmin(true)
      try {
        localStorage.setItem('levix_admin_auth', 'true')
      } catch {}
    }
    return isUserAdmin
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
    const isUserAdmin = checkIsAdminEmail(res.user.email)
    const newProfile: UserProfile = {
      uid: res.user.uid,
      email,
      displayName,
      role: isUserAdmin ? 'admin' : 'customer',
      addresses: [],
      createdAt: new Date().toISOString(),
    }
    await saveUserProfile(newProfile)
    setUserProfile(newProfile)
    if (isUserAdmin) {
      setIsAdmin(true)
      try {
        localStorage.setItem('levix_admin_auth', 'true')
      } catch {}
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication is not configured.')
    }
    const res = await signInWithPopup(auth, googleProvider)
    const isUserAdmin = checkIsAdminEmail(res.user.email)
    if (isUserAdmin) {
      setIsAdmin(true)
      try {
        localStorage.setItem('levix_admin_auth', 'true')
      } catch {}
    }
    return isUserAdmin
  }

  const logout = async () => {
    try {
      localStorage.removeItem('levix_admin_auth')
      localStorage.removeItem('levix_demo_user')
    } catch {}
    if (auth && isFirebaseConfigured) {
      try {
        await firebaseSignOut(auth)
      } catch {}
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
