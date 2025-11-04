/**
 * @fileoverview Servicio para operaciones específicas del dashboard de speaker
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicios para consumir APIs del dashboard de speaker
 */

import { useAuthStore } from '@/stores/authStore';

export interface SpeakerAssignedEvent {
   id: number;
   speakerId: number;
   eventId: number;
   eventTitle: string;
   eventStartDate: string;
   eventEndDate: string;
   location: string;
   modality: 'presential' | 'virtual' | 'hybrid';
   status: 'tentative' | 'confirmed' | 'cancelled' | 'completed';
   role: 'keynote_speaker' | 'panelist' | 'facilitator' | 'moderator' | 'guest';
   participationStart: string;
   participationEnd: string;
   durationMinutes?: number;
   confirmedAt?: string;
   cancelledAt?: string;
   cancellationReason?: string;
   notes?: string;
   order?: number;
   createdAt: string;
 }

export interface SpeakerMaterial {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'presentation' | 'document' | 'video' | 'audio' | 'other';
  uploadedAt: string;
  eventId?: number;
  eventTitle?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface SpeakerNotification {
  id: number;
  title: string;
  message: string;
  type: 'event_invitation' | 'event_reminder' | 'payment' | 'evaluation' | 'system';
  read: boolean;
  createdAt: string;
  eventId?: number;
  eventTitle?: string;
}

export interface SpeakerStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalEarnings: number;
  averageRating: number;
  totalMaterials: number;
  unreadNotifications: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

/**
 * Servicio para operaciones del dashboard de speaker
 */
export class SpeakerDashboardService {
  private static readonly BASE_URL = '/api/v1/speaker';

  /**
   * Obtener estadísticas del speaker
   */
  static async getSpeakerStats(): Promise<SpeakerStats> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<SpeakerStats> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo estadísticas del speaker');
    }

    return data.data!;
  }

  /**
   * Obtener eventos asignados al speaker
   */
  static async getAssignedEvents(options: {
    status?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<SpeakerAssignedEvent[]> {
    const { token } = useAuthStore.getState();
    const { status, limit = 20, offset = 0 } = options;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (status && status.length > 0) {
      params.append('status', status.join(','));
    }

    const response = await fetch(`${this.BASE_URL}/events?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<{ events: SpeakerAssignedEvent[]; pagination: any }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo eventos asignados');
    }

    return data.data?.events || [];
  }

  /**
   * Obtener material del speaker
   */
  static async getSpeakerMaterials(options: {
    eventId?: number;
    status?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<SpeakerMaterial[]> {
    const { token } = useAuthStore.getState();
    const { eventId, status, limit = 20, offset = 0 } = options;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (eventId) params.append('eventId', eventId.toString());
    if (status && status.length > 0) {
      params.append('status', status.join(','));
    }

    const response = await fetch(`${this.BASE_URL}/materials?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<SpeakerMaterial[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo materiales del speaker');
    }

    return data.data || [];
  }

  /**
   * Obtener notificaciones del speaker
   */
  static async getSpeakerNotifications(options: {
    read?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<SpeakerNotification[]> {
    const { token } = useAuthStore.getState();
    const { read, limit = 20, offset = 0 } = options;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (read !== undefined) params.append('read', read.toString());

    const response = await fetch(`${this.BASE_URL}/notifications?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<SpeakerNotification[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo notificaciones del speaker');
    }

    return data.data || [];
  }

  /**
   * Confirmar participación en evento
   */
  static async confirmEventParticipation(eventId: number): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status: 'confirmed' }),
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error confirmando participación en evento');
    }
  }

  /**
   * Cancelar participación en evento
   */
  static async cancelEventParticipation(eventId: number, reason?: string): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status: 'cancelled', reason }),
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error cancelando participación en evento');
    }
  }

  /**
   * Ver detalles completos de un evento
   */
  static async getEventDetails(eventId: number): Promise<SpeakerAssignedEvent> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<SpeakerAssignedEvent> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo detalles del evento');
    }

    return data.data!;
  }

  /**
   * Subir material para evento
   */
  static async uploadMaterial(eventId: number, formData: FormData): Promise<SpeakerMaterial> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/materials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data: ApiResponse<SpeakerMaterial> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error subiendo material');
    }

    return data.data!;
  }

  /**
   * Actualizar estado de material
   */
  static async updateMaterialStatus(materialId: number, status: 'draft' | 'published' | 'archived'): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/materials/${materialId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error actualizando estado del material');
    }
  }

  /**
   * Eliminar material
   */
  static async deleteMaterial(materialId: number): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/materials/${materialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error eliminando material');
    }
  }

  /**
   * Actualizar perfil del speaker
   */
  static async updateSpeakerProfile(profileData: Partial<{
    shortBio: string;
    fullBio: string;
    linkedinUrl: string;
    twitterUrl: string;
    websiteUrl: string;
    phone: string;
    country: string;
    specialties: string[];
    languages: string[];
    experience: string;
    availability: 'available' | 'limited' | 'unavailable';
  }>): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error actualizando perfil del speaker');
    }
  }

  /**
   * Obtener especialidades disponibles
   */
  static async getAvailableSpecialties(): Promise<{ id: number; name: string }[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/specialties`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<{ id: number; name: string }[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo especialidades');
    }

    return data.data || [];
  }

  /**
   * Crear bloqueo de disponibilidad
   */
  static async createAvailabilityBlock(blockData: {
    startDate: string;
    endDate: string;
    reason?: string;
    isRecurring?: boolean;
    recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/availability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(blockData),
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creando bloqueo de disponibilidad');
    }
  }

  /**
   * Obtener bloques de disponibilidad
   */
  static async getAvailabilityBlocks(): Promise<any[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/availability`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo bloques de disponibilidad');
    }

    return data.data || [];
  }

  /**
   * Marcar notificación como leída
   */
  static async markNotificationAsRead(notificationId: number): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error marcando notificación como leída');
    }
  }

  /**
   * Marcar múltiples notificaciones como leídas
   */
  static async markMultipleNotificationsAsRead(notificationIds: number[]): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/notifications/mark-read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ notificationIds }),
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error marcando notificaciones como leídas');
    }
  }

  /**
   * Ejecutar acción rápida desde notificación
   */
  static async executeNotificationAction(notificationId: number, action: string, actionData?: any): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/notifications/${notificationId}/action`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ action, actionData }),
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error ejecutando acción de notificación');
    }
  }

  /**
   * Obtener eventos próximos (próximos 30 días)
   */
  static async getUpcomingEvents(): Promise<SpeakerAssignedEvent[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/upcoming-events`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<SpeakerAssignedEvent[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo eventos próximos');
    }

    return data.data || [];
  }
}