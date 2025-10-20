/**
 * @fileoverview certificateService.ts - Servicio de certificados para TradeConnect
 * @description Servicio que maneja la generación, descarga y verificación de certificados blockchain.
 *
 * Arquitectura recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @author TradeConnect Team
 * @version 1.0.0
 */
import { apiService } from './api';
import type { ApiResponse, Certificate, CertificateTemplate } from '@/types';

/**
 * Certificate verification result
 */
export interface CertificateVerification {
  valid: boolean;
  certificate?: Certificate;
  blockchainVerified?: boolean;
  message?: string;
}

/**
 * Certificate Service
 * Handles certificate generation, download, and verification
 */
export const certificateService = {
  /**
   * Get user's certificates
   * @param params - Query parameters
   * @returns Promise<ApiResponse<Certificate[]>>
   */
  getCertificates: async (params?: any): Promise<ApiResponse<Certificate[]>> => {
    return apiService.get<Certificate[]>('/certificates', { params });
  },

  /**
   * Get certificate by ID
   * @param id - Certificate ID
   * @returns Promise<ApiResponse<Certificate>>
   */
  getCertificateById: async (id: number): Promise<ApiResponse<Certificate>> => {
    return apiService.get<Certificate>(`/certificates/${id}`);
  },

  /**
   * Download certificate PDF
   * @param id - Certificate ID
   * @returns Promise<Blob> - PDF file
   */
  downloadCertificate: async (id: number): Promise<Blob> => {
    const response = await apiService.get(`/certificates/${id}/download`, {
      responseType: 'blob',
    });
    return response.data as any;
  },

  /**
   * Verify certificate authenticity by hash
   * @param hash - Certificate hash
   * @returns Promise<ApiResponse<CertificateVerification>>
   */
  verifyCertificate: async (hash: string): Promise<ApiResponse<CertificateVerification>> => {
    return apiService.get<CertificateVerification>(`/certificates/verify/${hash}`);
  },

  /**
   * Verify certificate by blockchain transaction hash
   * @param txHash - Blockchain transaction hash
   * @returns Promise<ApiResponse<CertificateVerification>>
   */
  verifyByBlockchain: async (txHash: string): Promise<ApiResponse<CertificateVerification>> => {
    return apiService.get<CertificateVerification>(`/certificates/verify/blockchain/${txHash}`);
  },

  /**
   * Get available certificate templates
   * @returns Promise<ApiResponse<CertificateTemplate[]>>
   */
  getCertificateTemplates: async (): Promise<ApiResponse<CertificateTemplate[]>> => {
    return apiService.get<CertificateTemplate[]>('/certificate-templates');
  },

  /**
   * Get certificate template by ID
   * @param id - Template ID
   * @returns Promise<ApiResponse<CertificateTemplate>>
   */
  getTemplateById: async (id: number): Promise<ApiResponse<CertificateTemplate>> => {
    return apiService.get<CertificateTemplate>(`/certificate-templates/${id}`);
  },

  /**
   * Request certificate generation (if not auto-generated)
   * @param registrationId - Registration ID
   * @param templateId - Certificate template ID (optional)
   * @returns Promise<ApiResponse<Certificate>>
   */
  requestCertificate: async (
    registrationId: number,
    templateId?: number
  ): Promise<ApiResponse<Certificate>> => {
    return apiService.post<Certificate>('/certificates/generate', {
      registrationId,
      templateId,
    });
  },

  /**
   * Get certificate QR code
   * @param id - Certificate ID
   * @returns Promise<Blob> - QR code image
   */
  getCertificateQRCode: async (id: number): Promise<Blob> => {
    const response = await apiService.get(`/certificates/${id}/qr-code`, {
      responseType: 'blob',
    });
    return response.data as any;
  },

  /**
   * Share certificate via email
   * @param id - Certificate ID
   * @param email - Recipient email
   * @returns Promise<ApiResponse<void>>
   */
  shareCertificate: async (id: number, email: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>(`/certificates/${id}/share`, { email });
  },

  /**
   * Get certificate validation log
   * @param id - Certificate ID
   * @returns Promise<ApiResponse<any[]>>
   */
  getValidationLog: async (id: number): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>(`/certificates/${id}/validation-log`);
  },

  /**
   * Revoke certificate (admin only)
   * @param id - Certificate ID
   * @param reason - Revocation reason
   * @returns Promise<ApiResponse<Certificate>>
   */
  revokeCertificate: async (id: number, reason: string): Promise<ApiResponse<Certificate>> => {
    return apiService.post<Certificate>(`/certificates/${id}/revoke`, { reason });
  },

  /**
   * Regenerate certificate
   * @param id - Certificate ID
   * @returns Promise<ApiResponse<Certificate>>
   */
  regenerateCertificate: async (id: number): Promise<ApiResponse<Certificate>> => {
    return apiService.post<Certificate>(`/certificates/${id}/regenerate`);
  },
};

export default certificateService;
