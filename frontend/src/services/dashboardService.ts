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
  phone?: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  is2faEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  title: string;
  shortDescription?: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  virtualLocation?: string;
  isVirtual: boolean;
  price: number;
  currency: string;
  capacity?: number;
  registeredCount: number;
  availableSpots?: number;
  tags?: string[];
  eventType: {
    id: number;
    name: string;
    displayName: string;
  };
  eventCategory: {
    id: number;
    name: string;
    displayName: string;
  };
  eventStatus: {
    id: number;
    name: string;
    displayName: string;
    color?: string;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
  };
  cancelledAt?: string;
  cancellationReason?: string;
  minAge?: number;
  maxAge?: number;
  requirements?: string;
  agenda?: Array<{
    id?: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    speaker?: string;
    location?: string;
  }>;
  metadata?: any;
}

export interface CreateEventData {
  title: string;
  description?: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  location?: string;
  virtualLocation?: string;
  isVirtual?: boolean;
  price?: number;
  currency?: string;
  capacity?: number;
  minAge?: number;
  maxAge?: number;
  tags?: string[];
  requirements?: string;
  agenda?: Array<{
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    speaker?: string;
    location?: string;
  }>;
  metadata?: any;
  eventTypeId: number;
  eventCategoryId: number;
  eventStatusId?: number;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  shortDescription?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  virtualLocation?: string;
  isVirtual?: boolean;
  price?: number;
  currency?: string;
  capacity?: number;
  minAge?: number;
  maxAge?: number;
  tags?: string[];
  requirements?: string;
  agenda?: Array<{
    id?: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    speaker?: string;
    location?: string;
  }>;
  metadata?: any;
  eventTypeId?: number;
  eventCategoryId?: number;
  eventStatusId?: number;
}

export interface EventMedia {
  id: number;
  eventId: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  formattedSize: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  altText?: string;
  description?: string;
  isFeatured: boolean;
  sortOrder: number;
  dimensions?: {
    width: number;
    height: number;
  };
  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };
  uploadedBy: number;
  uploadedAt: string;
}

export interface EventStats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  cancelledRegistrations: number;
  attendedCount: number;
  noShowCount: number;
  revenue: number;
  capacityUtilization: number;
  averageRating?: number;
  feedbackCount?: number;
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

export interface FinancialStats {
  totalRevenue: number;
  totalCommissions: number;
  totalRefunds: number;
  netProfit: number;
  transactionCount: number;
  averageTransactionValue: number;
  topGateways: Array<{
    gateway: string;
    revenue: number;
    percentage: number;
  }>;
  topEvents: Array<{
    eventId: number;
    eventTitle: string;
    revenue: number;
  }>;
  monthlyGrowth: number;
}

export interface CommissionData {
  gateway: string;
  amount: number;
  fee: number;
  netAmount: number;
  commissionRate: number;
  fixedFee: number;
}

export interface FinancialReport {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    total: number;
    byGateway: Record<string, number>;
    byEvent: Record<string, number>;
    byCurrency: Record<string, number>;
  };
  expenses: {
    total: number;
    commissions: number;
    refunds: number;
    byGateway: Record<string, number>;
  };
  netProfit: number;
  transactionCount: number;
  averageTransactionValue: number;
}

export interface FinancialKPIs {
  roi: number;
  profitMargin: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  churnRate: number;
  conversionRate: number;
  averageOrderValue: number;
  monthlyRecurringRevenue: number;
}

export interface TrendData {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  transactionCount: number;
  growthRate: number;
}

export interface RefundRequest {
  registrationId: number;
  daysBeforeEvent: number;
  refundPercentage: number;
  reason: string;
  conditions?: string[];
}

export interface BulkRefundRequest {
  payments: string[];
  reason: string;
  description?: string;
  policy?: {
    daysBeforeEvent: number;
    refundPercentage: number;
    reason: string;
    conditions: string[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
  details?: any[]; // Para detalles de validación o errores adicionales
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
   * Obtener lista de eventos con filtros avanzados
   */
  static async getEvents(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    eventTypeId?: number;
    eventCategoryId?: number;
    isVirtual?: boolean;
    priceMin?: number;
    priceMax?: number;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    tags?: string[];
    location?: string;
    sortBy?: 'startDate' | 'endDate' | 'title' | 'price' | 'createdAt' | 'publishedAt';
    sortOrder?: 'ASC' | 'DESC';
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
    if (params.eventTypeId) queryParams.append('eventTypeId', params.eventTypeId.toString());
    if (params.eventCategoryId) queryParams.append('eventCategoryId', params.eventCategoryId.toString());
    if (params.isVirtual !== undefined) queryParams.append('isVirtual', params.isVirtual.toString());
    if (params.priceMin !== undefined) queryParams.append('priceMin', params.priceMin.toString());
    if (params.priceMax !== undefined) queryParams.append('priceMax', params.priceMax.toString());
    if (params.startDateFrom) queryParams.append('startDateFrom', params.startDateFrom);
    if (params.startDateTo) queryParams.append('startDateTo', params.startDateTo);
    if (params.endDateFrom) queryParams.append('endDateFrom', params.endDateFrom);
    if (params.endDateTo) queryParams.append('endDateTo', params.endDateTo);
    if (params.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
    if (params.location) queryParams.append('location', params.location);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

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
   * Crear nuevo evento
   */
  static async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      const { token } = useAuthStore.getState();

      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch(`${this.BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData: ApiResponse<any> = await response.json().catch(() => ({}));

        // Manejo específico de errores comunes
        switch (response.status) {
          case 400:
            if (errorData.details && Array.isArray(errorData.details)) {
              const validationErrors = errorData.details.map((d: any) => d.msg || d.message).join(', ');
              throw new Error(`Errores de validación: ${validationErrors}`);
            }
            throw new Error(errorData.message || 'Datos del evento inválidos. Verifica la información proporcionada.');
          case 401:
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          case 403:
            throw new Error('No tienes permisos para crear eventos.');
          case 409:
            throw new Error('Ya existe un evento con este título. Elige un título diferente.');
          case 422:
            throw new Error('Los datos proporcionados no cumplen con los requisitos del sistema.');
          case 500:
            throw new Error('Error interno del servidor. Inténtalo más tarde.');
          default:
            throw new Error(errorData.message || `Error inesperado (${response.status}): ${response.statusText}`);
        }
      }

      const data: ApiResponse<Event> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error desconocido al crear el evento');
      }

      if (!data.data) {
        throw new Error('No se recibió información del evento creado');
      }

      return data.data;
    } catch (error) {
      // Logging para debugging
      console.error('Error en createEvent:', error);

      // Re-throw para que el componente maneje el error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al crear el evento');
    }
  }

  /**
   * Obtener evento por ID
   */
  static async getEventById(eventId: number): Promise<Event> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<Event> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo evento');
    }

    return data.data!;
  }

  /**
   * Actualizar evento existente
   */
  static async updateEvent(eventId: number, eventData: UpdateEventData): Promise<Event> {
    try {
      if (!eventId || eventId <= 0) {
        throw new Error('ID de evento inválido');
      }

      const { token } = useAuthStore.getState();

      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch(`${this.BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData: ApiResponse<any> = await response.json().catch(() => ({}));

        // Manejo específico de errores comunes
        switch (response.status) {
          case 400:
            if (errorData.details && Array.isArray(errorData.details)) {
              const validationErrors = errorData.details.map((d: any) => d.msg || d.message).join(', ');
              throw new Error(`Errores de validación: ${validationErrors}`);
            }
            throw new Error(errorData.message || 'Datos del evento inválidos. Verifica la información proporcionada.');
          case 401:
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          case 403:
            throw new Error('No tienes permisos para editar este evento.');
          case 404:
            throw new Error('Evento no encontrado. Es posible que haya sido eliminado.');
          case 409:
            throw new Error('Conflicto al actualizar el evento. Es posible que otro usuario lo haya modificado.');
          case 422:
            throw new Error('Los datos proporcionados no cumplen con los requisitos del sistema.');
          case 500:
            throw new Error('Error interno del servidor. Inténtalo más tarde.');
          default:
            throw new Error(errorData.message || `Error inesperado (${response.status}): ${response.statusText}`);
        }
      }

      const data: ApiResponse<Event> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error desconocido al actualizar el evento');
      }

      if (!data.data) {
        throw new Error('No se recibió información del evento actualizado');
      }

      return data.data;
    } catch (error) {
      // Logging para debugging
      console.error('Error en updateEvent:', error);

      // Re-throw para que el componente maneje el error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al actualizar el evento');
    }
  }

  /**
   * Eliminar evento (soft delete)
   */
  static async deleteEvent(eventId: number): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // Handle different response types
    const contentType = response.headers.get('content-type');

    // Si la respuesta es exitosa (2xx), retornar
    if (response.ok) {
      // Intentar parsear JSON si hay content-type JSON
      if (contentType && contentType.includes('application/json')) {
        try {
          await response.json();
        } catch (error) {
          // Ignorar errores de parseo en respuestas exitosas
        }
      }
      return;
    }

    // Manejar errores (4xx, 5xx)
    let errorMessage = 'Error eliminando evento';

    if (contentType && contentType.includes('application/json')) {
      try {
        const data: ApiResponse<any> = await response.json();
        errorMessage = data.message || errorMessage;
        // Si hay detalles de validación, agregarlos
        if (data.details && Array.isArray(data.details)) {
          const validationErrors = data.details.map((d: any) => d.msg || d.message).join(', ');
          errorMessage = `${errorMessage}: ${validationErrors}`;
        }
      } catch (jsonError) {
        // Si falla el parseo JSON, intentar obtener texto plano
        try {
          const text = await response.text();
          errorMessage = text || `Error ${response.status}: ${response.statusText}`;
        } catch (textError) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
    } else {
      // Si no es JSON, intentar obtener el texto
      try {
        const text = await response.text();
        errorMessage = text || `Error ${response.status}: ${response.statusText}`;
      } catch (textError) {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
    }

    throw new Error(errorMessage);
  }

  /**
   * Publicar evento
   */
  static async publishEvent(eventId: number, publishData?: {
    notifySubscribers?: boolean;
    notificationMessage?: string;
  }): Promise<Event> {
    try {
      if (!eventId || eventId <= 0) {
        throw new Error('ID de evento inválido');
      }

      const { token } = useAuthStore.getState();

      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch(`${this.BASE_URL}/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(publishData || {}),
      });

      if (!response.ok) {
        const errorData: ApiResponse<any> = await response.json().catch(() => ({}));

        // Manejo específico de errores comunes
        switch (response.status) {
          case 400:
            throw new Error(errorData.message || 'El evento no está listo para ser publicado. Verifica que toda la información requerida esté completa.');
          case 401:
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          case 403:
            throw new Error('No tienes permisos para publicar este evento.');
          case 404:
            throw new Error('Evento no encontrado. Es posible que haya sido eliminado.');
          case 409:
            throw new Error('El evento ya está publicado o en un estado que no permite publicación.');
          case 422:
            throw new Error('El evento no cumple con los requisitos para ser publicado.');
          case 500:
            throw new Error('Error interno del servidor. Inténtalo más tarde.');
          default:
            throw new Error(errorData.message || `Error inesperado (${response.status}): ${response.statusText}`);
        }
      }

      const data: ApiResponse<Event> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error desconocido al publicar el evento');
      }

      if (!data.data) {
        throw new Error('No se recibió información del evento publicado');
      }

      return data.data;
    } catch (error) {
      // Logging para debugging
      console.error('Error en publishEvent:', error);

      // Re-throw para que el componente maneje el error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al publicar el evento');
    }
  }

  /**
     * Cambiar estado del evento (cancelar, completar, posponer, etc.)
     */
    static async updateEventStatus(eventId: number, action: 'cancel' | 'complete' | 'postpone' | 'archive' | 'ongoing', reason?: string): Promise<Event> {
      try {
        if (!eventId || eventId <= 0) {
          throw new Error('ID de evento inválido');
        }

        const validActions = ['cancel', 'complete', 'postpone', 'archive', 'ongoing'];
        if (!validActions.includes(action)) {
          throw new Error('Acción de cambio de estado inválida');
        }

        const { token } = useAuthStore.getState();

        if (!token) {
          throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
        }

        const response = await fetch(`${this.BASE_URL}/events/${eventId}/status?action=${action}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          const errorData: ApiResponse<any> = await response.json().catch(() => ({}));

          // Manejo específico de errores comunes
          switch (response.status) {
            case 400:
              if (action === 'cancel' && !reason?.trim()) {
                throw new Error('Se requiere una razón para cancelar el evento.');
              }
              throw new Error(errorData.message || `Acción "${action}" inválida para el estado actual del evento.`);
            case 401:
              throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            case 403:
              throw new Error('No tienes permisos para cambiar el estado de este evento.');
            case 404:
              throw new Error('Evento no encontrado. Es posible que haya sido eliminado.');
            case 409:
              throw new Error(`No se puede cambiar el estado del evento. Es posible que ya esté en estado "${action}" o tenga restricciones.`);
            case 422:
              throw new Error('El cambio de estado no cumple con las reglas del sistema.');
            case 500:
              throw new Error('Error interno del servidor. Inténtalo más tarde.');
            default:
              throw new Error(errorData.message || `Error inesperado (${response.status}): ${response.statusText}`);
          }
        }

        const data: ApiResponse<Event> = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Error desconocido al cambiar el estado del evento');
        }

        if (!data.data) {
          throw new Error('No se recibió información del evento actualizado');
        }

        return data.data;
      } catch (error) {
        // Logging para debugging
        console.error('Error en updateEventStatus:', error);

        // Re-throw para que el componente maneje el error
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Error desconocido al cambiar el estado del evento');
      }
    }

  /**
   * Duplicar evento
   */
  static async duplicateEvent(eventId: number, modifications?: {
    title?: string;
    startDate?: string;
    endDate?: string;
    price?: number;
  }): Promise<{
    originalEvent: Event;
    duplicatedEvent: Event;
  }> {
    try {
      if (!eventId || eventId <= 0) {
        throw new Error('ID de evento inválido');
      }

      const { token } = useAuthStore.getState();

      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const response = await fetch(`${this.BASE_URL}/events/${eventId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(modifications || {}),
      });

      if (!response.ok) {
        const errorData: ApiResponse<any> = await response.json().catch(() => ({}));

        // Manejo específico de errores comunes
        switch (response.status) {
          case 400:
            if (errorData.details && Array.isArray(errorData.details)) {
              const validationErrors = errorData.details.map((d: any) => d.msg || d.message).join(', ');
              throw new Error(`Errores de validación: ${validationErrors}`);
            }
            throw new Error(errorData.message || 'Datos de duplicación inválidos.');
          case 401:
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          case 403:
            throw new Error('No tienes permisos para duplicar este evento.');
          case 404:
            throw new Error('Evento original no encontrado. Es posible que haya sido eliminado.');
          case 409:
            throw new Error('Ya existe un evento con el título especificado. Elige un título diferente.');
          case 422:
            throw new Error('Los datos proporcionados no cumplen con los requisitos del sistema.');
          case 500:
            throw new Error('Error interno del servidor. Inténtalo más tarde.');
          default:
            throw new Error(errorData.message || `Error inesperado (${response.status}): ${response.statusText}`);
        }
      }

      const data: ApiResponse<{
        originalEvent: Event;
        duplicatedEvent: Event;
      }> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error desconocido al duplicar el evento');
      }

      if (!data.data || !data.data.originalEvent || !data.data.duplicatedEvent) {
        throw new Error('No se recibió información completa de los eventos');
      }

      return data.data;
    } catch (error) {
      // Logging para debugging
      console.error('Error en duplicateEvent:', error);

      // Re-throw para que el componente maneje el error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al duplicar el evento');
    }
  }

  /**
   * Subir archivos multimedia al evento
   */
  static async uploadEventMedia(eventId: number, files: FileList | File[], mediaData?: {
    type?: 'image' | 'video' | 'document' | 'audio' | 'other';
    altText?: string;
    description?: string;
    isFeatured?: boolean;
    sortOrder?: number;
  }[]): Promise<EventMedia[]> {
    try {
      if (!eventId || eventId <= 0) {
        throw new Error('ID de evento inválido');
      }

      if (!files || (files instanceof FileList && files.length === 0) || (Array.isArray(files) && files.length === 0)) {
        throw new Error('No se seleccionaron archivos para subir');
      }

      const { token } = useAuthStore.getState();

      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const formData = new FormData();

      // Agregar archivos
      if (files instanceof FileList) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      } else {
        files.forEach(file => {
          formData.append('files', file);
        });
      }

      // Agregar metadatos si se proporcionan
      if (mediaData) {
        mediaData.forEach((data, index) => {
          if (data.type) formData.append(`mediaData[${index}][type]`, data.type);
          if (data.altText) formData.append(`mediaData[${index}][altText]`, data.altText);
          if (data.description) formData.append(`mediaData[${index}][description]`, data.description);
          if (data.isFeatured !== undefined) formData.append(`mediaData[${index}][isFeatured]`, data.isFeatured.toString());
          if (data.sortOrder !== undefined) formData.append(`mediaData[${index}][sortOrder]`, data.sortOrder.toString());
        });
      }

      const response = await fetch(`${this.BASE_URL}/events/${eventId}/upload-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData: ApiResponse<any> = await response.json().catch(() => ({}));

        // Manejo específico de errores comunes
        switch (response.status) {
          case 400:
            if (errorData.details && Array.isArray(errorData.details)) {
              const validationErrors = errorData.details.map((d: any) => d.msg || d.message).join(', ');
              throw new Error(`Errores de validación de archivos: ${validationErrors}`);
            }
            throw new Error(errorData.message || 'Los archivos no cumplen con los requisitos. Verifica el tipo, tamaño y formato.');
          case 401:
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          case 403:
            throw new Error('No tienes permisos para subir archivos a este evento.');
          case 404:
            throw new Error('Evento no encontrado. Es posible que haya sido eliminado.');
          case 413:
            throw new Error('Los archivos son demasiado grandes. Reduce el tamaño o cantidad de archivos.');
          case 415:
            throw new Error('Tipo de archivo no soportado. Solo se permiten imágenes, videos y documentos.');
          case 422:
            throw new Error('Los archivos no pudieron procesarse correctamente.');
          case 500:
            throw new Error('Error interno del servidor. Inténtalo más tarde.');
          default:
            throw new Error(errorData.message || `Error inesperado (${response.status}): ${response.statusText}`);
        }
      }

      const data: ApiResponse<EventMedia[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error desconocido al subir archivos multimedia');
      }

      if (!data.data) {
        throw new Error('No se recibió información de los archivos subidos');
      }

      return data.data;
    } catch (error) {
      // Logging para debugging
      console.error('Error en uploadEventMedia:', error);

      // Re-throw para que el componente maneje el error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido al subir archivos multimedia');
    }
  }

  /**
   * Obtener archivos multimedia del evento
   */
  static async getEventMedia(eventId: number): Promise<EventMedia[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}/media`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<EventMedia[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo archivos multimedia');
    }

    return data.data!;
  }

  /**
   * Eliminar archivo multimedia del evento
   */
  static async deleteEventMedia(eventId: number, mediaId: number): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}/media/${mediaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // Handle different response types
    const contentType = response.headers.get('content-type');

    // Si la respuesta es exitosa (2xx), retornar
    if (response.ok) {
      // Intentar parsear JSON si hay content-type JSON
      if (contentType && contentType.includes('application/json')) {
        try {
          await response.json();
        } catch (error) {
          // Ignorar errores de parseo en respuestas exitosas
        }
      }
      return;
    }

    // Manejar errores (4xx, 5xx)
    let errorMessage = 'Error eliminando archivo multimedia';

    if (contentType && contentType.includes('application/json')) {
      try {
        const data: ApiResponse<any> = await response.json();
        errorMessage = data.message || errorMessage;
        // Si hay detalles de validación, agregarlos
        if (data.details && Array.isArray(data.details)) {
          const validationErrors = data.details.map((d: any) => d.msg || d.message).join(', ');
          errorMessage = `${errorMessage}: ${validationErrors}`;
        }
      } catch (jsonError) {
        // Si falla el parseo JSON, intentar obtener texto plano
        try {
          const text = await response.text();
          errorMessage = text || `Error ${response.status}: ${response.statusText}`;
        } catch (textError) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
    } else {
      // Si no es JSON, intentar obtener el texto
      try {
        const text = await response.text();
        errorMessage = text || `Error ${response.status}: ${response.statusText}`;
      } catch (textError) {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
    }

    throw new Error(errorMessage);
  }

  /**
   * Obtener estadísticas de un evento específico
   */
  static async getEventStats(eventId: number): Promise<EventStats> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/event-reports/events/${eventId}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<EventStats> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo estadísticas del evento');
    }

    return data.data!;
  }

  /**
   * Obtener analytics de un evento específico
   */
  static async getEventAnalytics(eventId: number): Promise<any> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/event-reports/events/${eventId}/analytics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo analytics del evento');
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
    totalUsers: number;
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
   * Crear nuevo usuario
   */
  static async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creando usuario');
    }

    return data.data!;
  }

  /**
   * Actualizar usuario existente
   */
  static async updateUser(userId: number, userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    isActive: boolean;
    updatedAt: string;
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 400) {
        throw new Error('Datos de entrada inválidos. Verifica la información proporcionada.');
      }
      throw new Error(data.message || 'Error actualizando usuario');
    }

    return data.data!;
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

    // Handle different response types
    const contentType = response.headers.get('content-type');

    // Si la respuesta es exitosa (2xx), retornar
    if (response.ok) {
      // Intentar parsear JSON si hay content-type JSON
      if (contentType && contentType.includes('application/json')) {
        try {
          await response.json();
        } catch (error) {
          // Ignorar errores de parseo en respuestas exitosas
        }
      }
      return;
    }

    // Manejar errores (4xx, 5xx)
    let errorMessage = 'Error eliminando usuario';

    if (contentType && contentType.includes('application/json')) {
      try {
        const data: ApiResponse<any> = await response.json();
        errorMessage = data.message || errorMessage;
        // Si hay detalles de validación, agregarlos
        if (data.details && Array.isArray(data.details)) {
          const validationErrors = data.details.map((d: any) => d.msg || d.message).join(', ');
          errorMessage = `${errorMessage}: ${validationErrors}`;
        }
      } catch (jsonError) {
        // Si falla el parseo JSON, intentar obtener texto plano
        try {
          const text = await response.text();
          errorMessage = text || `Error ${response.status}: ${response.statusText}`;
        } catch (textError) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
    } else {
      // Si no es JSON, intentar obtener el texto
      try {
        const text = await response.text();
        errorMessage = text || `Error ${response.status}: ${response.statusText}`;
      } catch (textError) {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
    }

    throw new Error(errorMessage);
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
   * Obtener configuración pública del sistema (sin autenticación)
   */
  static async getPublicSystemConfig(): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/system/config/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo configuración pública del sistema');
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
   * Crear nueva configuración del sistema
   */
  static async createSystemConfig(configData: {
    key: string;
    value: any;
    category: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<any> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(configData),
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creando configuración del sistema');
    }

    return data.data!;
  }

  /**
   * Obtener configuración por clave
   */
  static async getSystemConfigByKey(key: string): Promise<any> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config/${key}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo configuración por clave');
    }

    return data.data!;
  }

  /**
   * Actualizar configuración específica por clave
   */
  static async updateSystemConfigByKey(key: string, updateData: {
    value?: any;
    description?: string;
    isPublic?: boolean;
    isActive?: boolean;
  }): Promise<any> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config/${key}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updateData),
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error actualizando configuración por clave');
    }

    return data.data!;
  }

  /**
   * Eliminar configuración por clave
   */
  static async deleteSystemConfig(key: string): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config/${key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData: ApiResponse<any> = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error eliminando configuración');
    }
  }

  /**
   * Obtener configuraciones por categoría
   */
  static async getSystemConfigsByCategory(category: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    configs: any[];
    pagination: any;
  }> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${this.BASE_URL}/system/config/category/${category}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo configuraciones por categoría');
    }

    return data.data!;
  }

  /**
   * Obtener todas las configuraciones con filtros
   */
  static async getAllSystemConfigs(params: {
    page?: number;
    limit?: number;
    category?: string;
    isPublic?: boolean;
    isActive?: boolean;
    search?: string;
  } = {}): Promise<{
    configs: any[];
    pagination: any;
  }> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.isPublic !== undefined) queryParams.append('isPublic', params.isPublic.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);

    const response = await fetch(`${this.BASE_URL}/system/config/all?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo todas las configuraciones');
    }

    return data.data!;
  }

  /**
   * Obtener configuración completa del sistema
   */
  static async getFullSystemConfig(): Promise<any> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config/full`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo configuración completa del sistema');
    }

    return data.data!;
  }

  /**
   * Obtener estadísticas de configuración
   */
  static async getSystemConfigStats(): Promise<any> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo estadísticas de configuración');
    }

    return data.data!;
  }

  /**
   * Inicializar configuración por defecto
   */
  static async initializeDefaultSystemConfig(): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error inicializando configuración por defecto');
    }
  }

  /**
   * Crear configuraciones de forma masiva
   */
  static async bulkCreateSystemConfigs(configs: Array<{
    key: string;
    value: any;
    category: string;
    description?: string;
    isPublic?: boolean;
  }>): Promise<any> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/system/config/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ configs }),
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creando configuraciones masivamente');
    }

    return data.data!;
  }

  /**
   * Obtener logs de auditoría
   */
  static async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    resource?: string;
    resourceId?: string;
    ipAddress?: string;
    location?: string;
    sortBy?: 'createdAt' | 'action' | 'userId' | 'resource';
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<{ auditLogs: AuditLog[]; pagination: any }> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.action) queryParams.append('action', params.action);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.resource) queryParams.append('resource', params.resource);
    if (params.resourceId) queryParams.append('resourceId', params.resourceId);
    if (params.ipAddress) queryParams.append('ipAddress', params.ipAddress);
    if (params.location) queryParams.append('location', params.location);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.BASE_URL}/audit?${queryParams}`, {
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
   * Obtener estadísticas de auditoría
   */
  static async getAuditStats(params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  } = {}): Promise<{
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsByUser: Record<string, number>;
    logsByResource: Record<string, number>;
    logsByDate: Record<string, number>;
    topUsers: Array<{ userId: string; count: number; user?: any }>;
    topActions: Array<{ action: string; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
    recentActivity: AuditLog[];
  }> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.userId) queryParams.append('userId', params.userId);

    const response = await fetch(`${this.BASE_URL}/audit/stats?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo estadísticas de auditoría');
    }

    return data.data!;
  }

  /**
   * Exportar logs de auditoría
   */
  static async exportAuditLogs(params: {
    format: 'csv' | 'excel' | 'json';
    startDate?: string;
    endDate?: string;
    action?: string;
    userId?: string;
    resource?: string;
  }): Promise<Blob> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams({
      format: params.format
    });
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.action) queryParams.append('action', params.action);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.resource) queryParams.append('resource', params.resource);

    const response = await fetch(`${this.BASE_URL}/audit/export?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData: ApiResponse<any> = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error exportando logs de auditoría');
    }

    return await response.blob();
  }

  /**
   * Limpiar logs de auditoría antiguos
   */
  static async cleanupAuditLogs(olderThanDays: number): Promise<{
    deletedCount: number;
    message: string;
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/audit/cleanup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ olderThanDays }),
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error limpiando logs de auditoría');
    }

    return data.data!;
  }

  /**
   * Obtener datos de actividad de usuarios para gráficos
   */
  static async getUserActivityData(): Promise<{ labels: string[]; data: number[] }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/event-reports/analytics/user-activity`, {
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

    const response = await fetch(`${this.BASE_URL}/event-reports/analytics/revenue-by-category`, {
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

    const response = await fetch(`${this.BASE_URL}/event-reports/analytics/popular-events`, {
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

    const response = await fetch(`${this.BASE_URL}/event-reports/analytics/system-performance`, {
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

  /**
   * Obtener inscripciones de un usuario específico (para modal de detalles)
   */
  static async getUserRegistrations(userId: number, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{
    registrations: Array<{
      id: number;
      eventId: number;
      eventTitle: string;
      eventDate: string;
      status: string;
      paymentStatus: string;
      paymentAmount: number;
      registeredAt: string;
    }>;
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
    if (params.status) queryParams.append('status', params.status);

    const response = await fetch(`${this.BASE_URL}/event-registrations/users/${userId}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo inscripciones del usuario');
    }

    return data.data!;
  }

  /**
    * Obtener auditoría de un usuario específico
    */
   static async getUserAudit(userId: number, params: {
     page?: number;
     limit?: number;
   } = {}): Promise<{ logs: any[]; pagination: any }> {
     const { token } = useAuthStore.getState();

     const queryParams = new URLSearchParams();
     if (params.page) queryParams.append('page', params.page.toString());
     if (params.limit) queryParams.append('limit', params.limit.toString());

     const response = await fetch(`${this.BASE_URL}/users/${userId}/audit?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<{ logs: any[]; pagination: any }> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error obteniendo auditoría del usuario');
     }

     return data.data!;
   }

   // ====================================================================
   // MÉTODOS DE GESTIÓN FINANCIERA
   // ====================================================================

   /**
    * Calcular comisiones por pasarela de pago
    */
   static async calculateGatewayCommissions(
     gateway: string,
     amount: number,
     currency: string = 'GTQ'
   ): Promise<CommissionData> {
     const { token } = useAuthStore.getState();

     const queryParams = new URLSearchParams({
       gateway,
       amount: amount.toString(),
       currency
     });

     const response = await fetch(`${this.BASE_URL}/finance/commissions?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<CommissionData> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error calculando comisiones');
     }

     return data.data!;
   }

   /**
    * Obtener comisiones por evento
    */
   static async getEventCommissions(eventId: number): Promise<{
     totalRevenue: number;
     totalCommissions: number;
     netRevenue: number;
     commissionByGateway: Record<string, number>;
   }> {
     const { token } = useAuthStore.getState();

     const response = await fetch(`${this.BASE_URL}/finance/commissions/event/${eventId}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<any> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error obteniendo comisiones del evento');
     }

     return data.data!;
   }

   /**
    * Obtener comisiones por período
    */
   static async getPeriodCommissions(params: {
     startDate: string;
     endDate: string;
     gateway?: string;
   }): Promise<{
     totalRevenue: number;
     totalCommissions: number;
     netRevenue: number;
     commissionByGateway: Record<string, number>;
     commissionByEvent: Record<string, number>;
   }> {
     const { token } = useAuthStore.getState();

     const queryParams = new URLSearchParams({
       startDate: params.startDate,
       endDate: params.endDate
     });
     if (params.gateway) queryParams.append('gateway', params.gateway);

     const response = await fetch(`${this.BASE_URL}/finance/commissions/period?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<any> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error obteniendo comisiones del período');
     }

     return data.data!;
   }

   /**
    * Generar reporte financiero completo
    */
   static async getFinancialReport(params: {
     startDate: string;
     endDate: string;
   }): Promise<FinancialReport> {
     const { token } = useAuthStore.getState();

     const queryParams = new URLSearchParams({
       startDate: params.startDate,
       endDate: params.endDate
     });

     const response = await fetch(`${this.BASE_URL}/finance/reports?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<FinancialReport> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error generando reporte financiero');
     }

     return data.data!;
   }

   /**
    * Calcular KPIs financieros
    */
   static async getFinancialKPIs(params: {
     startDate: string;
     endDate: string;
   }): Promise<FinancialKPIs> {
     const { token } = useAuthStore.getState();

     const queryParams = new URLSearchParams({
       startDate: params.startDate,
       endDate: params.endDate
     });

     const response = await fetch(`${this.BASE_URL}/finance/kpis?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<FinancialKPIs> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error calculando KPIs financieros');
     }

     return data.data!;
   }

   /**
    * Analizar tendencias financieras
    */
   static async getFinancialTrends(params: {
     periods?: number;
     periodType?: 'month' | 'week' | 'day';
   } = {}): Promise<TrendData[]> {
     const { token } = useAuthStore.getState();

     const queryParams = new URLSearchParams();
     if (params.periods) queryParams.append('periods', params.periods.toString());
     if (params.periodType) queryParams.append('periodType', params.periodType);

     const response = await fetch(`${this.BASE_URL}/finance/trends?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<TrendData[]> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error analizando tendencias financieras');
     }

     return data.data!;
   }

   /**
    * Procesar reembolso automático
    */
   static async processAutomaticRefund(refundData: RefundRequest): Promise<any> {
     const { token } = useAuthStore.getState();

     const response = await fetch(`${this.BASE_URL}/finance/refunds/automatic/${refundData.registrationId}`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
       body: JSON.stringify({
         daysBeforeEvent: refundData.daysBeforeEvent,
         refundPercentage: refundData.refundPercentage,
         reason: refundData.reason,
         conditions: refundData.conditions
       }),
     });

     const data: ApiResponse<any> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error procesando reembolso automático');
     }

     return data.data!;
   }

   /**
    * Procesar reembolsos masivos
    */
   static async processBulkRefunds(refundData: BulkRefundRequest): Promise<{
     successful: string[];
     failed: { transactionId: string; error: string }[];
     summary: {
       totalRequested: number;
       successfulCount: number;
       failedCount: number;
       totalRefunded: number;
     };
   }> {
     const { token } = useAuthStore.getState();

     const response = await fetch(`${this.BASE_URL}/finance/refunds/bulk`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
       body: JSON.stringify(refundData),
     });

     const data: ApiResponse<any> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error procesando reembolsos masivos');
     }

     return data.data!;
   }

   /**
    * Listar transacciones con filtros y paginación
    */
   static async getFinancialTransactions(params: {
     page?: number;
     limit?: number;
     startDate?: string;
     endDate?: string;
     gateway?: string;
     status?: string;
     eventId?: number;
     sortBy?: 'createdAt' | 'amount' | 'gateway' | 'status';
     sortOrder?: 'ASC' | 'DESC';
   } = {}): Promise<{
     transactions: Array<{
       id: string;
       transactionId: string;
       amount: number;
       fee: number;
       netAmount: number;
       currency: string;
       gateway: string;
       status: string;
       createdAt: string;
       updatedAt: string;
       registration?: {
         id: number;
         event?: {
           id: number;
           title: string;
         };
         user?: {
           id: number;
           firstName: string;
           lastName: string;
         };
       };
     }>;
     pagination: {
       page: number;
       limit: number;
       total: number;
       totalPages: number;
       hasNext: boolean;
       hasPrev: boolean;
     };
     filters: {
       startDate?: string;
       endDate?: string;
       gateway?: string;
       status?: string;
       eventId?: number;
     };
   }> {
     const { token } = useAuthStore.getState();

     const queryParams = new URLSearchParams();
     if (params.page) queryParams.append('page', params.page.toString());
     if (params.limit) queryParams.append('limit', params.limit.toString());
     if (params.startDate) queryParams.append('startDate', params.startDate);
     if (params.endDate) queryParams.append('endDate', params.endDate);
     if (params.gateway) queryParams.append('gateway', params.gateway);
     if (params.status) queryParams.append('status', params.status);
     if (params.eventId) queryParams.append('eventId', params.eventId.toString());
     if (params.sortBy) queryParams.append('sortBy', params.sortBy);
     if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

     const response = await fetch(`${this.BASE_URL}/finance/transactions?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<any> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error obteniendo transacciones financieras');
     }

     return data.data!;
   }

   /**
    * Obtener estadísticas financieras generales
    */
   static async getFinancialStats(): Promise<FinancialStats> {
     const { token } = useAuthStore.getState();

     const response = await fetch(`${this.BASE_URL}/finance/stats`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<FinancialStats> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error obteniendo estadísticas financieras');
     }

     return data.data!;
   }

   /**
    * Exportar datos financieros
    */
   static async exportFinancialData(params: {
     type: 'transactions' | 'report' | 'commissions';
     startDate?: string;
     endDate?: string;
     format: 'csv' | 'excel' | 'pdf';
   }): Promise<Blob> {
     const { token } = useAuthStore.getState();
 
     const queryParams = new URLSearchParams({
       type: params.type,
       format: params.format
     });
     if (params.startDate) queryParams.append('startDate', params.startDate);
     if (params.endDate) queryParams.append('endDate', params.endDate);
 
     const response = await fetch(`${this.BASE_URL}/finance/export?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
       },
       credentials: 'include',
     });
 
     if (!response.ok) {
       const errorData: ApiResponse<any> = await response.json().catch(() => ({}));
       throw new Error(errorData.message || 'Error exportando datos financieros');
     }
 
     return await response.blob();
   }
 
   // ====================================================================
   // MÉTODOS DE GESTIÓN AVANZADA DE USUARIOS
   // ====================================================================
 
   /**
    * Obtener lista de roles del sistema
    */
   static async getRoles(params: {
     page?: number;
     limit?: number;
     search?: string;
     isActive?: boolean;
   } = {}): Promise<{
     roles: Array<{
       id: number;
       name: string;
       displayName: string;
       description: string;
       isActive: boolean;
       isSystem: boolean;
       level: number;
       color?: string;
       icon?: string;
       userCount: number;
       permissions: Array<{
         id: number;
         name: string;
         displayName: string;
         description: string;
         resource: string;
         action: string;
         isActive: boolean;
         isSystem: boolean;
       }>;
       createdAt: string;
       updatedAt: string;
     }>;
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
     if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
 
     const response = await fetch(`${this.BASE_URL}/roles?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });

     const data: ApiResponse<any> = await response.json();

     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error obteniendo roles');
     }

     return data.data!;
   }
 
   /**
    * Obtener lista de grupos de usuarios
    */
   static async getUserGroups(params: {
     page?: number;
     limit?: number;
     search?: string;
     isActive?: boolean;
   } = {}): Promise<{
     groups: Array<{
       id: number;
       name: string;
       description?: string;
       memberCount: number;
       isActive: boolean;
       createdAt: string;
       updatedAt: string;
       createdBy?: {
         id: number;
         firstName: string;
         lastName: string;
       };
     }>;
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
     if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
 
     const response = await fetch(`${this.BASE_URL}/advanced-users/groups?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });
 
     const data: ApiResponse<any> = await response.json();
 
     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error obteniendo grupos de usuarios');
     }
 
     return data.data!;
   }
 
   /**
    * Obtener sesiones activas de usuarios
    */
   static async getUserSessions(params: {
     page?: number;
     limit?: number;
     userId?: number;
     isActive?: boolean;
     search?: string;
   } = {}): Promise<{
     sessions: Array<{
       id: number;
       userId: number;
       sessionId: string;
       ipAddress: string;
       userAgent: string;
       deviceType?: string;
       deviceOS?: string;
       deviceBrowser?: string;
       locationCountry?: string;
       locationCity?: string;
       locationRegion?: string;
       isActive: boolean;
       isCurrent: boolean;
       lastActivity: string;
       expiresAt: string;
       refreshToken?: string;
       refreshTokenExpires?: string;
       loginMethod?: string;
       createdAt: string;
       updatedAt: string;
       user?: {
         id: number;
         email: string;
         firstName: string;
         lastName: string;
         isActive: boolean;
       };
     }>;
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
     if (params.userId) queryParams.append('userId', params.userId.toString());
     if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
     if (params.search) queryParams.append('search', params.search);
 
     const response = await fetch(`${this.BASE_URL}/advanced-users/sessions?${queryParams}`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
     });
 
     const data: ApiResponse<any> = await response.json();
 
     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error obteniendo sesiones de usuarios');
     }
 
     return data.data!;
   }
 
   /**
    * Crear nuevo rol
    */
   static async createRole(roleData: {
     name: string;
     displayName?: string;
     description?: string;
     permissions?: number[];
     color?: string;
     icon?: string;
   }): Promise<{
     id: number;
     name: string;
     displayName: string;
     description: string;
     isActive: boolean;
     isSystem: boolean;
     level: number;
     color?: string;
     icon?: string;
     createdAt: string;
     updatedAt: string;
   }> {
     const { token } = useAuthStore.getState();
 
     const response = await fetch(`${this.BASE_URL}/advanced-users/roles`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
       body: JSON.stringify(roleData),
     });
 
     const data: ApiResponse<any> = await response.json();
 
     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error creando rol');
     }
 
     return data.data!;
   }
 
   /**
    * Actualizar permisos de un rol
    */
   static async updateRolePermissions(roleId: number, permissions: number[]): Promise<void> {
     const { token } = useAuthStore.getState();
 
     const response = await fetch(`${this.BASE_URL}/advanced-users/roles/${roleId}/permissions`, {
       method: 'PUT',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
       body: JSON.stringify({ permissions }),
     });
 
     const data: ApiResponse<any> = await response.json();
 
     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error actualizando permisos del rol');
     }
   }
 
   /**
    * Crear nuevo grupo de usuarios
    */
   static async createUserGroup(groupData: {
     name: string;
     description?: string;
     userIds?: number[];
   }): Promise<{
     id: number;
     name: string;
     description?: string;
     memberCount: number;
     isActive: boolean;
     createdAt: string;
     updatedAt: string;
   }> {
     const { token } = useAuthStore.getState();
 
     const response = await fetch(`${this.BASE_URL}/advanced-users/groups`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
       body: JSON.stringify(groupData),
     });
 
     const data: ApiResponse<any> = await response.json();
 
     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error creando grupo de usuarios');
     }
 
     return data.data!;
   }
 
   /**
    * Acción masiva sobre usuarios
    */
   static async bulkUserAction(action: string, userIds: number[], options?: any): Promise<{
     successful: number[];
     failed: Array<{ userId: number; error: string }>;
     summary: {
       totalRequested: number;
       successfulCount: number;
       failedCount: number;
     };
   }> {
     const { token } = useAuthStore.getState();
 
     const response = await fetch(`${this.BASE_URL}/advanced-users/bulk-action`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
       body: JSON.stringify({
         action,
         userIds,
         options
       }),
     });
 
     const data: ApiResponse<any> = await response.json();
 
     if (!response.ok || !data.success) {
       throw new Error(data.message || `Error ejecutando acción masiva: ${action}`);
     }
 
     return data.data!;
   }
 
   /**
    * Exportar usuarios
    */
   static async exportUsers(params: {
     format: 'csv' | 'excel' | 'json';
     filters?: {
       role?: string;
       isActive?: boolean;
       groupId?: string;
       startDate?: string;
       endDate?: string;
     };
   }): Promise<{
     data: string;
     filename: string;
     mimeType: string;
   }> {
     const { token } = useAuthStore.getState();
 
     const response = await fetch(`${this.BASE_URL}/advanced-users/export`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       credentials: 'include',
       body: JSON.stringify(params),
     });
 
     const data: ApiResponse<any> = await response.json();
 
     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error exportando usuarios');
     }
 
     return data.data!;
   }
 
   /**
    * Importar usuarios
    */
   static async importUsers(file: FormData, onProgress?: (progress: number) => void): Promise<{
     successful: number;
     failed: number;
     errors: Array<{ row: number; error: string }>;
     preview?: any[];
   }> {
     const { token } = useAuthStore.getState();
 
     const response = await fetch(`${this.BASE_URL}/advanced-users/import`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
       },
       credentials: 'include',
       body: file,
     });
 
     const data: ApiResponse<any> = await response.json();
 
     if (!response.ok || !data.success) {
       throw new Error(data.message || 'Error importando usuarios');
     }
 
     return data.data!;
   }
 }