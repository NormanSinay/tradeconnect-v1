/**
 * @fileoverview Servicio para operaciones específicas del dashboard de participante
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicios para consumir APIs del dashboard de participante
 */

import { useAuthStore } from '@/stores/authStore';

export interface ParticipantEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  status: 'active' | 'upcoming' | 'completed';
  attendanceValidated: boolean;
  certificateAvailable: boolean;
  evaluationRequired: boolean;
  evaluationCompleted: boolean;
}

export interface AttendanceRecord {
  id: number;
  eventTitle: string;
  eventDate: string;
  checkInTime: string;
  checkInMethod: 'qr' | 'manual';
  location: string;
  validatedBy: string;
  status: 'valid' | 'pending' | 'invalid';
}

export interface ParticipantCertificate {
  id: number;
  eventTitle: string;
  eventDate: string;
  issueDate: string;
  certificateNumber: string;
  status: 'available' | 'pending' | 'issued';
  downloadUrl?: string;
  verificationUrl?: string;
}

export interface SatisfactionSurvey {
  id: number;
  eventTitle: string;
  eventDate: string;
  status: 'pending' | 'completed';
  submittedAt?: string;
  questions: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: number;
  question: string;
  type: 'rating' | 'text' | 'multiple_choice';
  required: boolean;
  options?: string[];
  answer?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

/**
 * Servicio para operaciones del dashboard de participante
 */
export class ParticipantDashboardService {
  private static readonly BASE_URL = '/api/v1/participant';

  /**
   * Obtener eventos activos del participante
   */
  static async getActiveParticipation(): Promise<ParticipantEvent[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/active-events`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<ParticipantEvent[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo participación activa');
    }

    return data.data || [];
  }

  /**
   * Validar asistencia con QR
   */
  static async validateAttendance(qrCode: string, eventId: number, location?: string): Promise<AttendanceRecord> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/validate-attendance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ qrCode, eventId, location }),
    });

    const data: ApiResponse<AttendanceRecord> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error validando asistencia');
    }

    return data.data!;
  }

  /**
   * Obtener historial de asistencia
   */
  static async getAttendanceHistory(): Promise<AttendanceRecord[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/attendance-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<AttendanceRecord[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo historial de asistencia');
    }

    return data.data || [];
  }

  /**
   * Obtener certificados disponibles
   */
  static async getAvailableCertificates(): Promise<ParticipantCertificate[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/certificates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<ParticipantCertificate[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo certificados');
    }

    return data.data || [];
  }

  /**
   * Obtener encuestas de satisfacción pendientes
   */
  static async getPendingSurveys(): Promise<SatisfactionSurvey[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/surveys/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<SatisfactionSurvey[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo encuestas pendientes');
    }

    return data.data || [];
  }

  /**
   * Enviar encuesta de satisfacción
   */
  static async submitSatisfactionSurvey(surveyId: number, answers: { [questionId: number]: any }): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/surveys/${surveyId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ answers }),
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error enviando encuesta');
    }
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

  /**
   * Verificar estado de participación en evento
   */
  static async checkParticipationStatus(eventId: number): Promise<{
    isParticipant: boolean;
    attendanceValidated: boolean;
    certificateAvailable: boolean;
    evaluationRequired: boolean;
    evaluationCompleted: boolean;
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error verificando estado de participación');
    }

    return data.data!;
  }
}