/**
 * @fileoverview Servicio para operaciones específicas del dashboard de cliente
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicios para consumir APIs del dashboard de cliente
 */

import { useAuthStore } from '@/stores/authStore';

export interface ClientRegistration {
  id: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  registrationDate: string;
  amount: number;
}

export interface ClientPayment {
  id: number;
  eventTitle: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  invoiceNumber?: string;
}

export interface ClientFelInvoice {
  id: number;
  invoiceNumber: string;
  eventTitle: string;
  issueDate: string;
  amount: number;
  status: 'issued' | 'pending' | 'cancelled';
  downloadUrl?: string;
  felUuid: string;
  felSerie: string;
  felNumber: string;
}

export interface ClientCertificate {
  id: number;
  eventTitle: string;
  eventDate: string;
  issueDate: string;
  certificateNumber: string;
  status: 'issued' | 'pending' | 'expired';
  downloadUrl?: string;
  verificationUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

/**
 * Servicio para operaciones del dashboard de cliente
 */
export class ClientDashboardService {
  private static readonly BASE_URL = '/api/v1/client';

  /**
   * Obtener inscripciones del cliente
   */
  static async getClientRegistrations(): Promise<ClientRegistration[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/registrations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<ClientRegistration[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo inscripciones');
    }

    return data.data || [];
  }

  /**
   * Obtener historial de pagos del cliente
   */
  static async getClientPayments(): Promise<ClientPayment[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<ClientPayment[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo historial de pagos');
    }

    return data.data || [];
  }

  /**
   * Obtener facturas FEL del cliente
   */
  static async getClientFelInvoices(): Promise<ClientFelInvoice[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/fel-invoices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<ClientFelInvoice[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo facturas FEL');
    }

    return data.data || [];
  }

  /**
   * Obtener certificados del cliente
   */
  static async getClientCertificates(): Promise<ClientCertificate[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/certificates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<ClientCertificate[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo certificados');
    }

    return data.data || [];
  }

  /**
   * Descargar factura FEL
   */
  static async downloadFelInvoice(invoiceId: number): Promise<Blob> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/fel-invoices/${invoiceId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error descargando factura FEL');
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

  /**
   * Verificar factura FEL
   */
  static async verifyFelInvoice(felUuid: string): Promise<{
    isValid: boolean;
    details: any;
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/fel-invoices/verify/${felUuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error verificando factura FEL');
    }

    return data.data!;
  }

  /**
   * Verificar certificado
   */
  static async verifyCertificate(certificateNumber: string): Promise<{
    isValid: boolean;
    details: any;
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/certificates/verify/${certificateNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error verificando certificado');
    }

    return data.data!;
  }

  /**
   * Crear nueva inscripción
   */
  static async createRegistration(eventId: number): Promise<ClientRegistration> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ eventId }),
    });

    const data: ApiResponse<ClientRegistration> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creando inscripción');
    }

    return data.data!;
  }

  /**
   * Obtener resumen financiero del cliente
   */
  static async getFinancialSummary(): Promise<{
    totalSpent: number;
    totalInvoices: number;
    pendingPayments: number;
    lastPaymentDate?: string;
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/financial-summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo resumen financiero');
    }

    return data.data!;
  }
}