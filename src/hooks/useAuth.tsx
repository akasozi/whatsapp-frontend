'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthTokens, LoginCredentials } from '@/types'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (token) {
          // For now, we'll just set a mock user since we don't have a /me endpoint
          // In a real implementation, you'd have an endpoint to get current user info
          setUser({
            id: 1,
            phone_number: '0000000000',
            email: 'admin@example.com',
            full_name: 'System Administrator',
            role: 'ADMIN',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('access_token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('useAuth: Starting login process')
      setIsLoading(true)
      console.log('useAuth: Calling apiClient.login')
      const tokens = await apiClient.login(credentials)
      console.log('useAuth: Login API call successful, got tokens')

      // For now, we'll set a mock user since we don't have a /me endpoint
      // In a real implementation, you'd get user info from the login response or a separate /me endpoint
      const mockUser: User = {
        id: 1,
        phone_number: '0000000000',
        email: credentials.email,
        full_name: 'System Administrator',
        role: 'ADMIN',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setUser(mockUser)
      console.log('useAuth: User state set, showing success toast')
      toast.success('Logged in successfully!')
    } catch (error: any) {
      console.error('useAuth: Login failed:', error)
      toast.error(error.response?.data?.detail || 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
      console.log('useAuth: Login process finished')
    }
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
    toast.success('Logged out successfully!')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}