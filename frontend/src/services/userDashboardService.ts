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

export interface AccessType {
  id: number;
  eventId: number;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  currency: string;
  capacity?: number;
  availableCapacity?: number;
  benefits: string[];
  restrictions: string[];
  isActive: boolean;
  priority: number;
}

export interface RegistrationData {
  eventId: number;
  accessTypeId?: number;
  participantType: 'individual' | 'empresa';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nit?: string;
  cui?: string;
  companyName?: string;
  position?: string;
  customFields?: Record<string, any>;
}

export interface RegistrationResponse {
  registrationId: number;
  registrationCode: string;
  status: string;
  totalAmount: number;
  reservationExpiresAt: Date;
  capacityLockId?: number;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  details?: Record<string, any>;
}

export interface PaymentGateway {
  id: string;
  name: string;
  displayName: string;
  description: string;
  logo?: string;
  fee: number;
  feeType: 'percentage' | 'fixed';
  currency: string;
  isActive: boolean;
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies: string[];
}

export interface PaymentIntentData {
  id: string;
  transactionId: string;
  registrationId: number;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  redirectUrl?: string;
  clientSecret?: string;
  expiresAt: Date;
}

export interface PaymentStatusData {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId: string;
  amount: number;
  currency: string;
  gatewayTransactionId?: string;
  errorMessage?: string;
  completedAt?: Date;
}

export interface QRCodeResponse {
  id: number;
  qrCode: string;
  qrData: string;
  status: string;
  registrationId: number;
  eventId: number;
  expiresAt?: Date;
  generatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
  details?: any;
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
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<UserEvent[]> {
    const { token } = useAuthStore.getState();

    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.modality) queryParams.append('modality', filters.modality);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.search) queryParams.append('search', filters.search);

    const url = `${UserDashboardService.BASE_URL}/events?${queryParams}`;

    const response = await fetch(url, {
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

    const response = await fetch(`${UserDashboardService.BASE_URL}/registrations`, {
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

    const response = await fetch(`${UserDashboardService.BASE_URL}/certificates`, {
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

    const response = await fetch(`${UserDashboardService.BASE_URL}/qr-codes`, {
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

    const response = await fetch(`${UserDashboardService.BASE_URL}/evaluations`, {
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

    const response = await fetch(`${UserDashboardService.BASE_URL}/evaluations/${evaluationId}`, {
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

    const response = await fetch(`${UserDashboardService.BASE_URL}/events/${eventId}/register`, {
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

    const response = await fetch(`${UserDashboardService.BASE_URL}/qr-codes/${qrId}/download`, {
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

    const response = await fetch(`${UserDashboardService.BASE_URL}/certificates/${certificateId}/download`, {
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

  // ====================================================================
  // NUEVOS MÉTODOS PARA FLUJO DE REGISTRO MEJORADO
  // ====================================================================

  /**
   * Obtener tipos de acceso para un evento
   */
  static async getEventAccessTypes(eventId: number): Promise<AccessType[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`/api/v1/events/${eventId}/access-types`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<AccessType[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo tipos de acceso');
    }

    return data.data || [];
  }

  /**
   * Crear una inscripción individual
   */
  static async createRegistration(registrationData: RegistrationData): Promise<RegistrationResponse> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`/api/v1/registrations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(registrationData),
    });

    const data: ApiResponse<RegistrationResponse> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creando inscripción');
    }

    return data.data!;
  }

  /**
   * Validar un campo específico en tiempo real
   */
  static async validateField(
    field: string,
    value: string,
    eventId?: number
  ): Promise<ValidationResult> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`/api/v1/registrations/validate-affiliation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ [field]: value }),
    });

    const data: ApiResponse<ValidationResult> = await response.json();

    if (!response.ok) {
      return {
        isValid: false,
        message: data.message || 'Error validando campo',
      };
    }

    return data.data || { isValid: true };
  }

  /**
   * Obtener gateways de pago disponibles
   */
  static async getPaymentGateways(eventId?: number): Promise<PaymentGateway[]> {
    const { token } = useAuthStore.getState();

    const url = eventId
      ? `/api/v1/payments/gateways?eventId=${eventId}`
      : `/api/v1/payments/gateways`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<PaymentGateway[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo gateways de pago');
    }

    return data.data || [];
  }

  /**
   * Crear intento de pago
   */
  static async createPaymentIntent(
    registrationId: number,
    gateway: string
  ): Promise<PaymentIntentData> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`/api/v1/payments/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        registrationId,
        gateway,
      }),
    });

    const data: ApiResponse<PaymentIntentData> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creando intento de pago');
    }

    return data.data!;
  }

  /**
   * Verificar estado de pago
   */
  static async checkPaymentStatus(transactionId: string): Promise<PaymentStatusData> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`/api/v1/payments/${transactionId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<PaymentStatusData> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error verificando estado de pago');
    }

    return data.data!;
  }

  /**
   * Obtener código QR de una inscripción
   */
  static async getRegistrationQR(registrationId: number): Promise<QRCodeResponse> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`/api/v1/qr/registration/${registrationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<QRCodeResponse> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo código QR');
    }

    return data.data!;
  }

  /**
   * Generar código QR para una inscripción
   */
  static async generateQRCode(registrationId: number): Promise<QRCodeResponse> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`/api/v1/qr/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ registrationId }),
    });

    const data: ApiResponse<QRCodeResponse> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error generando código QR');
    }

    return data.data!;
  }

  /**
   * Obtener detalles de una inscripción
   */
  static async getRegistrationDetails(registrationId: number): Promise<any> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`/api/v1/registrations/${registrationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo detalles de inscripción');
    }

    return data.data!;
  }
}