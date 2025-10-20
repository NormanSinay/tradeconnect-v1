import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, LoginForm, RegisterForm, ApiResponse } from '@/types'
import { api } from '@/services/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginForm) => Promise<ApiResponse<User>>
  register: (userData: RegisterForm) => Promise<ApiResponse<User>>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<ApiResponse<User>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        // Verify token with backend
        const response = await api.get('/auth/me')
        if (response.data.success) {
          setUser(response.data.data as User)
        } else {
          localStorage.removeItem('authToken')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginForm): Promise<ApiResponse<User>> => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/login', credentials)

      if (response.data.success && response.data.data) {
        const userData = response.data.data as User
        setUser(userData)

        // Store token if provided
         if ((response.data as any).token) {
           localStorage.setItem('authToken', (response.data as any).token)
         }

        return { success: true, data: userData }
      }

      return { success: false, error: response.data.error || 'Login failed' }
    } catch (error: any) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Network error occurred'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterForm): Promise<ApiResponse<User>> => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/register', userData)

      if (response.data.success && response.data.data) {
        const newUser = response.data.data as User
        setUser(newUser)

        // Store token if provided
        if ((response.data as any).token) {
          localStorage.setItem('authToken', (response.data as any).token)
        }

        return { success: true, data: newUser }
      }

      return { success: false, error: response.data.error || 'Registration failed' }
    } catch (error: any) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Network error occurred'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
    // Clear any other auth-related data
    localStorage.removeItem('userPreferences')
  }

  const updateProfile = async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      setIsLoading(true)
      const response = await api.put('/auth/profile', userData)

      if (response.data.success && response.data.data) {
        const updatedUser = response.data.data as User
        setUser(updatedUser)
        return { success: true, data: updatedUser }
      }

      return { success: false, error: response.data.error || 'Profile update failed' }
    } catch (error: any) {
      console.error('Profile update error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Network error occurred'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}