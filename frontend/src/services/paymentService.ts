import { apiService } from './api';
import type { ApiResponse, Payment } from '@/types';

/**
 * Payment gateway types
 */
export interface PaymentGatewayResponse {
  transactionId: string;
  status: string;
  redirectUrl?: string;
  gatewayResponse?: any;
}

export interface PaymentMethod {
  id: number;
  gateway: 'paypal' | 'stripe' | 'neonet' | 'bam';
  name: string;
  description?: string;
  isActive: boolean;
  logo?: string;
  processingFee?: number;
}

export interface PaymentProcessData {
  registrationId: number;
  gateway: 'paypal' | 'stripe' | 'neonet' | 'bam';
  amount: number;
  currency: 'GTQ' | 'USD';
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Payment Processing Service
 * Handles payment operations across multiple payment gateways
 */
export const paymentService = {
  /**
   * Process payment through selected gateway
   * @param data - Payment processing data
   * @returns Promise<ApiResponse<PaymentGatewayResponse>>
   */
  processPayment: async (data: PaymentProcessData): Promise<ApiResponse<PaymentGatewayResponse>> => {
    return apiService.post<PaymentGatewayResponse>('/payments/process', data);
  },

  /**
   * Create PayPal payment
   * @param amount - Payment amount
   * @param currency - Currency code (GTQ or USD)
   * @param metadata - Additional metadata
   * @returns Promise<ApiResponse<PaymentGatewayResponse>>
   */
  createPayPalPayment: async (
    amount: number,
    currency: 'GTQ' | 'USD' = 'GTQ',
    metadata?: Record<string, any>
  ): Promise<ApiResponse<PaymentGatewayResponse>> => {
    return apiService.post<PaymentGatewayResponse>('/payments/paypal/create', {
      amount,
      currency,
      ...metadata,
    });
  },

  /**
   * Create Stripe payment intent
   * @param amount - Payment amount
   * @param currency - Currency code (GTQ or USD)
   * @param metadata - Additional metadata
   * @returns Promise<ApiResponse<PaymentGatewayResponse>>
   */
  createStripePayment: async (
    amount: number,
    currency: 'GTQ' | 'USD' = 'GTQ',
    metadata?: Record<string, any>
  ): Promise<ApiResponse<PaymentGatewayResponse>> => {
    return apiService.post<PaymentGatewayResponse>('/payments/stripe/create', {
      amount,
      currency,
      ...metadata,
    });
  },

  /**
   * Create NeoNet payment (Guatemala gateway)
   * @param data - NeoNet payment data
   * @returns Promise<ApiResponse<PaymentGatewayResponse>>
   */
  createNeoNetPayment: async (data: {
    amount: number;
    orderId: string;
    description?: string;
    customerEmail?: string;
  }): Promise<ApiResponse<PaymentGatewayResponse>> => {
    return apiService.post<PaymentGatewayResponse>('/payments/neonet/create', data);
  },

  /**
   * Create BAM payment (Guatemala gateway)
   * @param data - BAM payment data
   * @returns Promise<ApiResponse<PaymentGatewayResponse>>
   */
  createBAMPayment: async (data: {
    amount: number;
    orderId: string;
    description?: string;
    customerEmail?: string;
  }): Promise<ApiResponse<PaymentGatewayResponse>> => {
    return apiService.post<PaymentGatewayResponse>('/payments/bam/create', data);
  },

  /**
   * Get payment status by transaction ID
   * @param transactionId - Transaction ID
   * @returns Promise<ApiResponse<Payment>>
   */
  getPaymentStatus: async (transactionId: string): Promise<ApiResponse<Payment>> => {
    return apiService.get<Payment>(`/payments/${transactionId}/status`);
  },

  /**
   * Get available payment methods
   * @returns Promise<ApiResponse<PaymentMethod[]>>
   */
  getPaymentMethods: async (): Promise<ApiResponse<PaymentMethod[]>> => {
    return apiService.get<PaymentMethod[]>('/payments/methods');
  },

  /**
   * Get user payment history
   * @param params - Query parameters (pagination, filters)
   * @returns Promise<ApiResponse<Payment[]>>
   */
  getPaymentHistory: async (params?: any): Promise<ApiResponse<Payment[]>> => {
    return apiService.get<Payment[]>('/payments/history', { params });
  },

  /**
   * Verify payment webhook
   * @param gateway - Payment gateway
   * @param payload - Webhook payload
   * @returns Promise<ApiResponse<{ verified: boolean }>>
   */
  verifyWebhook: async (
    gateway: string,
    payload: any
  ): Promise<ApiResponse<{ verified: boolean }>> => {
    return apiService.post(`/payments/${gateway}/webhook/verify`, payload);
  },

  /**
   * Request payment refund
   * @param paymentId - Payment ID to refund
   * @param amount - Refund amount (optional, full refund if not specified)
   * @param reason - Refund reason
   * @returns Promise<ApiResponse<Payment>>
   */
  requestRefund: async (
    paymentId: number,
    amount?: number,
    reason?: string
  ): Promise<ApiResponse<Payment>> => {
    return apiService.post<Payment>(`/payments/${paymentId}/refund`, {
      amount,
      reason,
    });
  },

  /**
   * Cancel pending payment
   * @param paymentId - Payment ID to cancel
   * @returns Promise<ApiResponse<Payment>>
   */
  cancelPayment: async (paymentId: number): Promise<ApiResponse<Payment>> => {
    return apiService.post<Payment>(`/payments/${paymentId}/cancel`);
  },

  /**
   * Get payment receipt
   * @param paymentId - Payment ID
   * @returns Promise<Blob> - PDF receipt
   */
  getPaymentReceipt: async (paymentId: number): Promise<Blob> => {
    const response = await apiService.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    return response.data as any;
  },
};

export default paymentService;
