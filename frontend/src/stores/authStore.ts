import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { encryptPassword } from '@/utils/encryption'

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
  login: (email: string, password: string, turnstileToken?: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  forgotPassword: (email: string, turnstileToken?: string) => Promise<void>
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
  turnstileToken?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, turnstileToken?: string) => {
        set({ isLoading: true })
        try {
          // La contraseña se envía en texto plano - el backend la compara con bcrypt
          // NO encriptar aquí porque el backend espera texto plano

          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              email,
              password, // Enviar contraseña en texto plano
              turnstileToken
            }),
          })
    
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Credenciales inválidas')
          }
    
          const data = await response.json()

          // Log para debug (solo en desarrollo)
          if (import.meta.env.DEV) {
            console.log('Respuesta del login:', data)
          }

          // Extraer datos del usuario y token
          const userData = data.data?.user || data.user
          const tokenData = data.data?.accessToken || data.data?.tokens?.accessToken || data.token || data.accessToken

          // Logs de debug solo en desarrollo
          if (import.meta.env.DEV) {
            console.log('Usuario extraído:', userData)
            console.log('Token extraído:', tokenData ? `${tokenData.substring(0, 20)}...` : 'null')
          }

          // Crear objeto user consistente
          // El backend envía roles como array, tomar el primer rol o 'user' por defecto
          const primaryRole = Array.isArray(userData.roles) && userData.roles.length > 0
            ? userData.roles[0]
            : userData.role || 'user'

          const user = {
            id: userData.id || userData.userId,
            email: userData.email,
            name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: primaryRole
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
          // Encriptar las contraseñas antes de enviar
          const encryptedPassword = encryptPassword(userData.password)
          const encryptedConfirmPassword = encryptPassword(userData.confirmPassword)

          // Logs de encriptación solo en desarrollo
          if (import.meta.env.DEV) {
            console.log('Contraseñas encriptadas correctamente para registro')
          }

          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userData.email,
              password: encryptedPassword, // Enviar contraseña encriptada
              confirmPassword: encryptedConfirmPassword, // Enviar confirmación encriptada
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              nit: userData.nit,
              cui: userData.cui,
              termsAccepted: userData.termsAccepted,
              marketingAccepted: userData.marketingAccepted,
              turnstileToken: userData.turnstileToken,
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
        // Limpiar localStorage explícitamente
        localStorage.removeItem('auth-storage');
    
        // Limpiar cualquier otro dato de autenticación
        localStorage.removeItem('persist:root');
    
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
    
        // Pequeño delay para asegurar que el estado se actualice
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      },

      forgotPassword: async (email: string, turnstileToken?: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, turnstileToken }),
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
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
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