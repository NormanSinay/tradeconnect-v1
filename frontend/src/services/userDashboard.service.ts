// ====================================================================
// SERVICIO DE DASHBOARD DE USUARIO
// ====================================================================
// @fileoverview Servicio para gestión del dashboard del usuario
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'

export interface DashboardStats {
  upcomingEvents: number
  totalCertificates: number
  activeQRCodes: number
  pendingPayments: number
  unreadNotifications: number
}

export interface UpcomingEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

export interface RecentActivity {
  id: string
  type: 'registration' | 'payment' | 'certificate' | 'notification'
  title: string
  description: string
  date: string
  status?: 'success' | 'pending' | 'failed'
}

export interface UserDashboardData {
  stats: DashboardStats
  upcomingEvents: UpcomingEvent[]
  recentActivity: RecentActivity[]
}

/**
 * Servicio para gestión del dashboard del usuario
 * Proporciona métodos para obtener estadísticas, eventos próximos y actividad reciente
 */
export class UserDashboardService {
  private readonly baseUrl = '/user/dashboard'

  /**
   * Obtiene todas las estadísticas del dashboard del usuario
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error)
      throw error
    }
  }

  /**
   * Obtiene los eventos próximos del usuario
   */
  async getUpcomingEvents(): Promise<UpcomingEvent[]> {
    try {
      const response = await api.get(`${this.baseUrl}/upcoming-events`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo eventos próximos:', error)
      throw error
    }
  }

  /**
   * Obtiene la actividad reciente del usuario
   */
  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const response = await api.get(`${this.baseUrl}/recent-activity`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error)
      throw error
    }
  }

  /**
   * Obtiene todos los datos del dashboard en una sola llamada
   */
  async getDashboardData(): Promise<UserDashboardData> {
    try {
      const response = await api.get(`${this.baseUrl}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo datos del dashboard:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const userDashboardService = new UserDashboardService()