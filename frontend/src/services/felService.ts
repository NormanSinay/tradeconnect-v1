/**
 * @fileoverview felService.ts - Servicio FEL para TradeConnect
 * @description Servicio que maneja la validación de NIT y CUI para facturación electrónica en Guatemala.
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
import api from './api';
import { apiService } from './api';

export interface NitValidationResponse {
  success: boolean;
  data?: {
    nit: string;
    name: string;
    address?: string;
    isValid: boolean;
  };
  message?: string;
}

export interface CuiValidationResponse {
  success: boolean;
  data?: {
    cui: string;
    name: string;
    isValid: boolean;
  };
  message?: string;
}

class FELService {
  /**
   * Validate NIT (Tax Identification Number) with SAT Guatemala
   */
  async validateNit(nit: string): Promise<NitValidationResponse> {
    try {
      const response = await apiService.post('/fel/validate-nit', { nit });
      return {
        success: response.success || false,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error('Error validating NIT:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al validar NIT',
      };
    }
  }

  /**
   * Validate CUI (Personal ID Number) for Guatemala
   */
  async validateCui(cui: string): Promise<CuiValidationResponse> {
    try {
      const response = await apiService.post('/fel/validate-cui', { cui });
      return {
        success: response.success || false,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error('Error validating CUI:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al validar CUI',
      };
    }
  }

  /**
   * Format NIT to standard format: XXXX-XXXXXX-XXX-X
   */
  formatNit(nit: string): string {
    // Remove all non-digit characters
    const cleaned = nit.replace(/\D/g, '');

    if (cleaned.length !== 14) {
      return nit; // Return original if invalid length
    }

    // Format: XXXX-XXXXXX-XXX-X
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 10)}-${cleaned.slice(10, 13)}-${cleaned.slice(13)}`;
  }

  /**
   * Format CUI to standard format (13 digits)
   */
  formatCui(cui: string): string {
    // Remove all non-digit characters
    const cleaned = cui.replace(/\D/g, '');

    if (cleaned.length !== 13) {
      return cui; // Return original if invalid length
    }

    return cleaned;
  }

  /**
   * Validate NIT format (client-side)
   */
  isValidNitFormat(nit: string): boolean {
    const cleaned = nit.replace(/\D/g, '');
    return cleaned.length === 14;
  }

  /**
   * Validate CUI format (client-side)
   */
  isValidCuiFormat(cui: string): boolean {
    const cleaned = cui.replace(/\D/g, '');
    return cleaned.length === 13;
  }
}

export const felService = new FELService();
