/**
 * @fileoverview Servicio para operaciones de checkout e integración de pagos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicios para proceso de checkout, pagos y generación de QR
 */

import { useAuthStore } from '@/stores/authStore';
import { CartItem } from '@/types';

export interface AccessType {
  id: number;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  capacity: number;
  sold: number;
  available: boolean;
}

export interface CheckoutData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nit?: string;
    cui?: string;
  };
  items: CheckoutItem[];
  paymentMethod: 'paypal' | 'stripe' | 'neonet' | 'bam';
  billingAddress?: {
    address: string;
    city: string;
    country: string;
    zipCode: string;
  };
}

export interface CheckoutItem {
  eventId: number;
  eventTitle: string;
  accessTypeId: number;
  accessTypeName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  qrCode?: string;
  registrationId?: number;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

/**
 * Servicio para operaciones de checkout
 */
export class CheckoutService {
  private static readonly BASE_URL = '/api/v1/checkout';

  /**
   * Obtener tipos de acceso disponibles para un evento
   */
  static async getEventAccessTypes(eventId: number): Promise<AccessType[]> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/events/${eventId}/access-types`, {
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
   * Crear sesión de checkout
   */
  static async createCheckoutSession(checkoutData: CheckoutData): Promise<{
    sessionId: string;
    paymentUrl?: string;
    clientSecret?: string;
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/create-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(checkoutData),
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creando sesión de checkout');
    }

    return data.data!;
  }

  /**
   * Procesar pago con PayPal
   */
  static async processPayPalPayment(sessionId: string, paypalOrderId: string): Promise<PaymentResult> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/paypal/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId, paypalOrderId }),
    });

    const data: ApiResponse<PaymentResult> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error procesando pago PayPal');
    }

    return data.data!;
  }

  /**
   * Procesar pago con Stripe
   */
  static async processStripePayment(sessionId: string, paymentMethodId: string): Promise<PaymentResult> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/stripe/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId, paymentMethodId }),
    });

    const data: ApiResponse<PaymentResult> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error procesando pago Stripe');
    }

    return data.data!;
  }

  /**
   * Procesar pago con NeoNet
   */
  static async processNeoNetPayment(sessionId: string, neoNetToken: string): Promise<PaymentResult> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/neonet/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId, neoNetToken }),
    });

    const data: ApiResponse<PaymentResult> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error procesando pago NeoNet');
    }

    return data.data!;
  }

  /**
   * Procesar pago con BAM
   */
  static async processBamPayment(sessionId: string, bamToken: string): Promise<PaymentResult> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/bam/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId, bamToken }),
    });

    const data: ApiResponse<PaymentResult> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error procesando pago BAM');
    }

    return data.data!;
  }

  /**
   * Confirmar checkout completado
   */
  static async confirmCheckout(sessionId: string): Promise<{
    registrationId: number;
    qrCode: string;
    certificates: any[];
  }> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/confirm/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error confirmando checkout');
    }

    return data.data!;
  }

  /**
   * Cancelar sesión de checkout
   */
  static async cancelCheckout(sessionId: string): Promise<void> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/cancel/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<void> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error cancelando checkout');
    }
  }

  /**
   * Obtener configuración de PayPal
   */
  static async getPayPalConfig(): Promise<{
    clientId: string;
    environment: 'sandbox' | 'production';
  }> {
    const response = await fetch(`${this.BASE_URL}/paypal/config`, {
      method: 'GET',
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo configuración PayPal');
    }

    return data.data!;
  }

  /**
   * Obtener configuración de Stripe
   */
  static async getStripeConfig(): Promise<{
    publishableKey: string;
  }> {
    const response = await fetch(`${this.BASE_URL}/stripe/config`, {
      method: 'GET',
      credentials: 'include',
    });

    const data: ApiResponse<any> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo configuración Stripe');
    }

    return data.data!;
  }

  /**
   * Calcular total del carrito
   */
  static calculateTotal(items: CheckoutItem[]): number {
    return items.reduce((total, item) => total + item.total, 0);
  }

  /**
   * Validar datos de checkout
   */
  static validateCheckoutData(data: CheckoutData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar información personal
    if (!data.personalInfo.firstName?.trim()) errors.push('Nombre es requerido');
    if (!data.personalInfo.lastName?.trim()) errors.push('Apellido es requerido');
    if (!data.personalInfo.email?.trim()) errors.push('Email es requerido');
    if (!data.personalInfo.phone?.trim()) errors.push('Teléfono es requerido');

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.personalInfo.email && !emailRegex.test(data.personalInfo.email)) {
      errors.push('Email no es válido');
    }

    // Validar items
    if (!data.items || data.items.length === 0) {
      errors.push('Debe seleccionar al menos un item');
    }

    // Validar método de pago
    if (!data.paymentMethod) {
      errors.push('Debe seleccionar un método de pago');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}