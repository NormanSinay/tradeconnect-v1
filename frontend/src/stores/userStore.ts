import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Interfaces para el estado del usuario
interface UserStats {
  activeEvents: number
  completedEvents: number
  certificates: number
  trainingHours: number
}

interface UserEvent {
  id: number
  title: string
  date: string
  time?: string
  modality: 'virtual' | 'presencial' | 'hibrido'
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  type: 'event' | 'course'
  progress?: number
  image?: string
  description?: string
  location?: string
}

interface UserCertificate {
  id: number
  title: string
  eventName: string
  issueDate: string
  verificationCode: string
  duration: string
  status: 'issued' | 'pending' | 'expired'
  downloadUrl?: string
}

interface UserPreferences {
  notifications: {
    email: boolean
    eventReminders: boolean
    courseUpdates: boolean
    promotional: boolean
    newsletter: boolean
  }
  security: {
    twoFactorEnabled: boolean
  }
  privacy: {
    profileVisible: boolean
    showEmail: boolean
    showCourses: boolean
    showCertificates: boolean
  }
}

interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  position?: string
  bio?: string
  interests?: string
  avatar?: string
  nit?: string
  cui?: string
  role: string
  memberSince: string
  isActive: boolean
  emailVerified: boolean
  twoFactorEnabled: boolean
}

interface UserState {
  // Estado del perfil
  profile: UserProfile | null
  stats: UserStats | null
  preferences: UserPreferences | null

  // Estado de eventos y cursos
  upcomingEvents: UserEvent[]
  activeCourses: UserEvent[]
  completedEvents: UserEvent[]
  pastEvents: UserEvent[]

  // Estado de certificados
  certificates: UserCertificate[]

  // Estado de carga y errores
  isLoading: boolean
  error: string | null

  // Acciones
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  fetchStats: () => Promise<void>
  fetchEvents: () => Promise<void>
  fetchCertificates: () => Promise<void>
  fetchPreferences: () => Promise<void>
  updatePreferences: (preferences: UserPreferences) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  enable2FA: () => Promise<{ qrCode: string; secret: string }>
  disable2FA: (code: string) => Promise<void>
  verify2FA: (code: string) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearData: () => void
}

// Función helper para hacer requests autenticados
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  // Obtener el token del authStore usando zustand
  const authStorage = localStorage.getItem('auth-storage')
  const token = authStorage ? JSON.parse(authStorage).state?.token : null

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  })
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      profile: null,
      stats: null,
      preferences: null,
      upcomingEvents: [],
      activeCourses: [],
      completedEvents: [],
      pastEvents: [],
      certificates: [],
      isLoading: false,
      error: null,

      // Acciones
      fetchProfile: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await authenticatedFetch('/api/v1/users/profile')
          if (!response.ok) {
            throw new Error('Error al obtener el perfil')
          }
          const data = await response.json()

          // Transformar datos del backend al formato del store
          const userData = data.data?.user || data.user || data
          const profile: UserProfile = {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            company: userData.company,
            position: userData.position,
            bio: userData.bio,
            interests: userData.interests,
            avatar: userData.avatar,
            nit: userData.nit,
            cui: userData.cui,
            role: userData.role,
            memberSince: new Date(userData.createdAt).toLocaleDateString('es-GT', {
              year: 'numeric',
              month: 'long'
            }),
            isActive: userData.isActive,
            emailVerified: userData.emailVerified,
            twoFactorEnabled: userData.twoFactorEnabled,
          }

          set({ profile, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authenticatedFetch('/api/v1/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Error al actualizar el perfil')
          }

          // Actualizar el perfil local
          const currentProfile = get().profile
          if (currentProfile) {
            set({
              profile: { ...currentProfile, ...profileData },
              isLoading: false
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
          throw error
        }
      },

      fetchStats: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await authenticatedFetch('/api/v1/users/stats')
          if (!response.ok) {
            throw new Error('Error al obtener estadísticas')
          }
          const data = await response.json()

          console.log('Respuesta de estadísticas:', data)
          set({ stats: data.data || data, isLoading: false })
        } catch (error) {
          // Fallback a datos mock si falla la API
          const mockStats: UserStats = {
            activeEvents: 3,
            completedEvents: 8,
            certificates: 6,
            trainingHours: 42,
          }
          set({ stats: mockStats, isLoading: false })
        }
      },

      fetchEvents: async () => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implementar endpoints reales cuando estén disponibles en el backend
          // const eventsResponse = await authenticatedFetch('/api/events')
          // if (!eventsResponse.ok) {
          //   throw new Error('Error al obtener eventos')
          // }
          // const eventsData = await eventsResponse.json()

          // Usar datos mock por ahora - reemplazar con respuesta real del backend
          const mockUpcomingEvents: UserEvent[] = [
            {
              id: 1,
              title: 'Taller de Marketing Digital',
              date: '2023-10-25',
              time: '14:00 - 18:00',
              modality: 'virtual',
              status: 'confirmed',
              type: 'event',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              description: 'Aprende estrategias efectivas de marketing digital para impulsar tu negocio.',
            },
            {
              id: 2,
              title: 'Conferencia Innovación',
              date: '2023-11-05',
              time: '09:00 - 17:00',
              modality: 'presencial',
              status: 'confirmed',
              type: 'event',
              image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              description: 'Evento anual que reúne a los principales líderes empresariales.',
            },
          ]

          const mockActiveCourses: UserEvent[] = [
            {
              id: 3,
              title: 'Curso de Gestión Empresarial',
              date: '2023-10-28',
              modality: 'virtual',
              status: 'confirmed',
              type: 'course',
              progress: 65,
              image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              description: 'Curso completo sobre gestión y administración empresarial.',
            },
            {
              id: 4,
              title: 'Diplomado en Liderazgo',
              date: '2023-10-30',
              modality: 'virtual',
              status: 'confirmed',
              type: 'course',
              progress: 30,
              image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              description: 'Desarrolla habilidades de liderazgo para gestionar equipos.',
            },
          ]

          const mockPastEvents: UserEvent[] = [
            {
              id: 5,
              title: 'Taller de Finanzas Personales',
              date: '2023-08-15',
              modality: 'virtual',
              status: 'completed',
              type: 'event',
            },
            {
              id: 6,
              title: 'Conferencia de Tecnología',
              date: '2023-07-22',
              modality: 'virtual',
              status: 'completed',
              type: 'event',
            },
            {
              id: 7,
              title: 'Curso de Ventas',
              date: '2023-06-10',
              modality: 'presencial',
              status: 'completed',
              type: 'course',
            },
          ]

          set({
            upcomingEvents: mockUpcomingEvents,
            activeCourses: mockActiveCourses,
            pastEvents: mockPastEvents,
            isLoading: false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
        }
      },

      fetchCertificates: async () => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implementar endpoint real cuando esté disponible en el backend
          // const response = await authenticatedFetch('/api/certificates/users/me')
          // if (!response.ok) {
          //   throw new Error('Error al obtener certificados')
          // }
          // const data = await response.json()

          // Usar datos mock por ahora - reemplazar con respuesta real del backend
          const mockCertificates: UserCertificate[] = [
            {
              id: 1,
              title: 'Taller de Finanzas Personales',
              eventName: 'Taller de Finanzas Personales',
              issueDate: '2023-08-20',
              verificationCode: 'TC-CERT-2023-ABCD1234',
              duration: '16 horas',
              status: 'issued',
            },
            {
              id: 2,
              title: 'Conferencia de Tecnología',
              eventName: 'Conferencia de Tecnología',
              issueDate: '2023-07-25',
              verificationCode: 'TC-CERT-2023-EFGH5678',
              duration: '8 horas',
              status: 'issued',
            },
            {
              id: 3,
              title: 'Curso de Ventas',
              eventName: 'Curso de Ventas',
              issueDate: '2023-06-15',
              verificationCode: 'TC-CERT-2023-IJKL9012',
              duration: '24 horas',
              status: 'issued',
            },
          ]

          set({ certificates: mockCertificates, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
        }
      },

      fetchPreferences: async () => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implementar endpoint real cuando esté disponible en el backend
          // const response = await authenticatedFetch('/api/v1/user/preferences')
          // if (!response.ok) {
          //   throw new Error('Error al obtener preferencias')
          // }
          // const data = await response.json()

          // Usar datos mock por ahora - reemplazar con respuesta real del backend
          const mockPreferences: UserPreferences = {
            notifications: {
              email: true,
              eventReminders: true,
              courseUpdates: true,
              promotional: false,
              newsletter: true,
            },
            security: {
              twoFactorEnabled: false,
            },
            privacy: {
              profileVisible: true,
              showEmail: false,
              showCourses: true,
              showCertificates: true,
            },
          }

          set({ preferences: mockPreferences, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
        }
      },

      updatePreferences: async (preferences) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implementar endpoint real cuando esté disponible en el backend
          // const response = await authenticatedFetch('/api/v1/user/preferences', {
          //   method: 'PUT',
          //   body: JSON.stringify(preferences),
          // })
          // if (!response.ok) {
          //   const errorData = await response.json()
          //   throw new Error(errorData.message || 'Error al actualizar preferencias')
          // }

          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 1000))

          set({ preferences, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
          throw error
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authenticatedFetch('/api/v1/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({
              currentPassword,
              newPassword,
              confirmPassword: newPassword,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Error al cambiar la contraseña')
          }

          set({ isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
          throw error
        }
      },

      enable2FA: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await authenticatedFetch('/api/v1/auth/2fa/enable', {
            method: 'POST',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Error al habilitar 2FA')
          }

          const data = await response.json()
          set({ isLoading: false })
          return data.data
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
          throw error
        }
      },

      disable2FA: async (code) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authenticatedFetch('/api/v1/auth/2fa/disable', {
            method: 'POST',
            body: JSON.stringify({ code }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Error al deshabilitar 2FA')
          }

          // Actualizar el perfil local
          const currentProfile = get().profile
          if (currentProfile) {
            set({
              profile: { ...currentProfile, twoFactorEnabled: false },
              isLoading: false
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
          throw error
        }
      },

      verify2FA: async (code) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authenticatedFetch('/api/v1/auth/2fa/verify', {
            method: 'POST',
            body: JSON.stringify({ code }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Código 2FA inválido')
          }

          set({ isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          })
          throw error
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      clearData: () => set({
        profile: null,
        stats: null,
        preferences: null,
        upcomingEvents: [],
        activeCourses: [],
        completedEvents: [],
        pastEvents: [],
        certificates: [],
        error: null,
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
      }),
    }
  )
)