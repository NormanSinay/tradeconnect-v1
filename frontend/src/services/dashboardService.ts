/**
 * @fileoverview Servicio para gestión del dashboard de super admin
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicios para consumir APIs del dashboard administrativo
 */

import { useAuthStore } from '@/stores/authStore';

export interface DashboardStats {
  totalUsers: number;
  activeEvents: number;
  totalCourses: number;
  totalRevenue: number;
  userSatisfaction: number;
  incidentReports: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Event {
  id: string;
  title: string;
  organizer: string;
  startDate: string;
  registrations: number;
  status: string;
  revenue: number;
}

export interface Transaction {
  id: string;
  date: string;
  user: string;
  concept: string;
  method: string;
  amount: number;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

export interface AuditLog {
  id: number;
  userId: string;
  action: string;
  description: string;
  ipAddress: string;
  location?: string;
  metadata?: any;
  createdAt: string;
}

export class DashboardService {
  private static readonly BASE_URL = '/api/v1';

  /**
   * Obtener estadísticas generales del dashboard
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<DashboardStats> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo estadísticas del dashboard');
    }

    return data.data!;
  }

  /**
   * Obtener lista de usuarios con paginación y filtros
   */
  static async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {}): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await fetch(`${this.BASE_URL}/users?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<{
      users: User[];
      pagination: any;
    }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo usuarios');
    }

    return data.data!;
  }

  /**
   * Obtener lista de eventos con filtros
   */
  static async getEvents(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<{
    events: Event[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const response = await fetch(`${this.BASE_URL}/events?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<{
      events: Event[];
      pagination: any;
    }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo eventos');
    }

    return data.data!;
  }

  /**
   * Obtener transacciones financieras
   */
  static async getTransactions(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  } = {}): Promise<{
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.status) queryParams.append('status', params.status);

    const response = await fetch(`${this.BASE_URL}/payments?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<{
      transactions: Transaction[];
      pagination: any;
    }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo transacciones');
    }

    return data.data!;
  }

  /**
   * Obtener métricas del sistema usando la API de reportes
   */
  static async getSystemMetrics(): Promise<{
    totalEvents: number;
    activeEvents: number;
    totalRegistrations: number;
    totalRevenue: number;
    averageAttendanceRate: number;
    totalCourses: number;
    userSatisfaction: number;
    incidentReports: number;
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/event-reports/system/metrics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo métricas del sistema');
    }

    return data.data!;
  }

  /**
   * Obtener reporte de ventas
   */
  static async getSalesReport(params: {
    startDate?: string;
    endDate?: string;
    eventId?: string;
  } = {}): Promise<any> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.eventId) queryParams.append('eventId', params.eventId);

    const response = await fetch(`${this.BASE_URL}/event-reports/sales?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo reporte de ventas');
    }

    return data.data!;
  }

  /**
   * Obtener reporte de asistencia
   */
  static async getAttendanceReport(params: {
    startDate?: string;
    endDate?: string;
    eventId?: string;
  } = {}): Promise<any> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.eventId) queryParams.append('eventId', params.eventId);

    const response = await fetch(`${this.BASE_URL}/event-reports/attendance?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo reporte de asistencia');
    }

    return data.data!;
  }

  /**
   * Actualizar estado de usuario
   */
  static async updateUserStatus(userId: number, isActive: boolean): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error actualizando usuario');
    }
  }

  /**
   * Eliminar usuario
   */
  static async deleteUser(userId: number): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error eliminando usuario');
    }
  }

  /**
   * Obtener configuración del sistema
   */
  static async getSystemConfig(): Promise<any> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo configuración del sistema');
    }

    return data.data!;
  }

  /**
   * Actualizar configuración del sistema
   */
  static async updateSystemConfig(config: any): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(config),
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error actualizando configuración del sistema');
    }
  }

  /**
   * Obtener logs de auditoría
   */
  static async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
  } = {}): Promise<{ auditLogs: AuditLog[]; pagination: any }> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.action) queryParams.append('action', params.action);
    if (params.userId) queryParams.append('userId', params.userId);

    const response = await fetch(`${this.BASE_URL}/admin/audit?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<{ auditLogs: AuditLog[]; pagination: any }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo logs de auditoría');
    }

    return data.data!;
  }

  /**
   * Obtener datos de actividad de usuarios para gráficos
   */
  static async getUserActivityData(): Promise<{ labels: string[]; data: number[] }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/analytics/user-activity`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo datos de actividad');
    }

    return data.data!;
  }

  /**
   * Obtener ingresos por categoría para gráficos
   */
  static async getRevenueByCategory(): Promise<{ labels: string[]; data: number[] }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/analytics/revenue-by-category`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo datos de ingresos');
    }

    return data.data!;
  }

  /**
   * Obtener datos de eventos populares para gráficos
   */
  static async getPopularEventsData(): Promise<{ labels: string[]; data: number[] }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/analytics/popular-events`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo datos de eventos populares');
    }

    return data.data!;
  }

  /**
   * Obtener datos de rendimiento del sistema para gráficos
   */
  static async getSystemPerformanceData(): Promise<{
    labels: string[];
    responseTime: number[];
    uptime: number[];
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/analytics/system-performance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo datos de rendimiento');
    }

    return data.data!;
  }
}