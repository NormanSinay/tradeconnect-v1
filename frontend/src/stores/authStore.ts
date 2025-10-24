import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string | number
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, recaptchaToken?: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  forgotPassword: (email: string, recaptchaToken?: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  setLoading: (loading: boolean) => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  nit?: string
  cui?: string
  termsAccepted: boolean
  marketingAccepted?: boolean
  recaptchaToken?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, recaptchaToken?: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password, recaptchaToken }),
          })
    
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Credenciales inválidas')
          }
    
          const data = await response.json()

          // Log para debug
          console.log('Respuesta del login:', data)

          // Log para debug
          console.log('Respuesta del login:', data)

          // Extraer datos del usuario
          const userData = data.data?.user || data.user
          const tokenData = data.data?.tokens?.accessToken || data.token || data.accessToken

          console.log('Usuario extraído:', userData)
          console.log('Token extraído:', tokenData ? `${tokenData.substring(0, 20)}...` : 'null')

          // Crear objeto user consistente
          const user = {
            id: userData.id || userData.userId,
            email: userData.email,
            name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'user'
          }

          set({
            user,
            token: tokenData,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userData.email,
              password: userData.password,
              confirmPassword: userData.confirmPassword,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              nit: userData.nit,
              cui: userData.cui,
              termsAccepted: userData.termsAccepted,
              marketingAccepted: userData.marketingAccepted,
              recaptchaToken: userData.recaptchaToken,
            }),
          })
    
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Error al registrar usuario')
          }
    
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      forgotPassword: async (email: string, recaptchaToken?: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/v1/auth/forgot-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, recaptchaToken }),
          })
    
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Error al enviar email de recuperación')
          }
    
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      verifyEmail: async (code: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/v1/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: code }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Código de verificación inválido')
          }

          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)