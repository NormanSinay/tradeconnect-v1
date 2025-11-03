/**
 * @fileoverview Servicio para operaciones específicas del dashboard de usuario
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicios para consumir APIs del dashboard de usuario
 */

import { useAuthStore } from '@/stores/authStore';

export interface UserEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  price: number;
  capacity: number;
  registered: number;
  category: string;
  image?: string;
  status: 'available' | 'full' | 'cancelled';
}

export interface UserRegistration {
  id: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  amount: number;
  registrationDate: string;
  qrCode?: string;
  certificateUrl?: string;
}

export interface UserCertificate {
  id: number;
  eventTitle: string;
  eventDate: string;
  issueDate: string;
  certificateNumber: string;
  status: 'issued' | 'pending' | 'expired';
  downloadUrl?: string;
  verificationUrl?: string;
}

export interface QrCodeData {
  id: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  qrCode: string;
  status: 'active' | 'used' | 'expired';
  generatedDate: string;
  downloadCount: number;
}

export interface EvaluationData {
  id: number;
  eventTitle: string;
  eventDate: string;
  status: 'pending' | 'completed';
  submittedAt?: string;
  rating?: number;
  comments?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

/**
 * Servicio para operaciones del dashboard de usuario
 */
export class UserDashboardService {
  private static readonly BASE_URL = '/api/v1/user';

  /**
   * Obtener eventos disponibles para el usuario
   */
  static async getAvailableEvents(filters?: {
    category?: string;
    modality?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<UserEvent[]> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.modality) queryParams.append('modality', filters.modality);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const response = await fetch(`${this.BASE_URL}/events?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<UserEvent[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo eventos disponibles');
    }

    return data.data || [];
  }

  /**
   * Obtener inscripciones del usuario
   */
  static async getUserRegistrations(): Promise<UserRegistration[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/registrations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<UserRegistration[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo inscripciones');
    }

    return data.data || [];
  }

  /**
   * Obtener certificados del usuario
   */
  static async getUserCertificates(): Promise<UserCertificate[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/certificates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<UserCertificate[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo certificados');
    }

    return data.data || [];
  }

  /**
   * Obtener códigos QR del usuario
   */
  static async getUserQrCodes(): Promise<QrCodeData[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/qr-codes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<QrCodeData[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo códigos QR');
    }

    return data.data || [];
  }

  /**
   * Obtener evaluaciones del usuario
   */
  static async getUserEvaluations(): Promise<EvaluationData[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/evaluations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<EvaluationData[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo evaluaciones');
    }

    return data.data || [];
  }

  /**
   * Enviar evaluación de evento
   */
  static async submitEvaluation(evaluationId: number, rating: number, comments?: string): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/evaluations/${evaluationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ rating, comments }),
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error enviando evaluación');
    }
  }

  /**
   * Inscribirse a un evento
   */
  static async registerForEvent(eventId: number): Promise<UserRegistration> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<UserRegistration> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error inscribiéndose al evento');
    }

    return data.data!;
  }

  /**
   * Descargar código QR
   */
  static async downloadQrCode(qrId: number): Promise<Blob> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/qr-codes/${qrId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error descargando código QR');
    }

    return response.blob();
  }

  /**
   * Descargar certificado
   */
  static async downloadCertificate(certificateId: number): Promise<Blob> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/certificates/${certificateId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error descargando certificado');
    }

    return response.blob();
  }
}