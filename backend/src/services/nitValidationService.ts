/**
 * @fileoverview Servicio de Validación de NIT para TradeConnect FEL
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para validación de NITs con SAT de Guatemala
 */

import axios, { AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { NitValidation } from '../models/NitValidation';
import { FelAuditLog } from '../models/FelAuditLog';
import { ApiResponse } from '../types/global.types';

/**
 * Configuración del servicio de validación de NIT
 */
interface NitValidationConfig {
  satUrl: string;
  apiKey?: string;
  timeout: number;
  cacheEnabled: boolean;
  cacheDurationHours: number;
}

/**
 * Respuesta de validación de NIT del SAT
 */
interface SatNitResponse {
  nit: string;
  nombre: string;
  valido: boolean;
  activo: boolean;
  direccion?: string;
  actividad_economica?: string;
  regimen_tributario?: string;
  fecha_ultima_actualizacion?: string;
}

/**
 * Servicio para validación de NITs
 */
export class NitValidationService {
  private config: NitValidationConfig;

  constructor() {
    this.config = {
      satUrl: process.env.SAT_NIT_VALIDATION_URL || 'https://consulta-nits.sat.gob.gt',
      apiKey: process.env.SAT_API_KEY,
      timeout: parseInt(process.env.SAT_TIMEOUT || '30000'),
      cacheEnabled: process.env.SAT_CACHE_ENABLED !== 'false',
      cacheDurationHours: parseInt(process.env.SAT_CACHE_DURATION_HOURS || '24')
    };
  }

  /**
   * Valida un NIT con el SAT
   */
  async validateNit(nit: string, forceRefresh: boolean = false): Promise<ApiResponse<NitValidation>> {
    try {
      // Limpiar NIT (remover guiones y espacios)
      const cleanNit = nit.replace(/[-\s]/g, '');

      // Validar formato básico
      if (!this.isValidNitFormat(cleanNit)) {
        return {
          success: false,
          message: 'Formato de NIT inválido',
          error: 'INVALID_NIT_FORMAT',
          timestamp: new Date().toISOString()
        };
      }

      // Formatear NIT con guión verificador
      const formattedNit = this.formatNit(cleanNit);

      // Verificar caché si está habilitado y no se fuerza refresh
      if (this.config.cacheEnabled && !forceRefresh) {
        const cachedResult = await NitValidation.getValidNit(formattedNit);
        if (cachedResult) {
          logger.info('NIT validation from cache', { nit: formattedNit });

          // Registrar en auditoría
          await FelAuditLog.logOperation({
            operationType: 'nit_validation',
            result: 'success',
            operationId: `nit_cache_${Date.now()}`,
            responseData: {
              nit: formattedNit,
              cached: true,
              status: cachedResult.status
            }
          });

          return {
            success: true,
            message: 'NIT validado desde caché',
            data: cachedResult,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Consultar SAT
      const satResponse = await this.querySat(cleanNit);

      // Crear o actualizar registro de validación
      const validation = await this.saveValidationResult(formattedNit, satResponse);

      // Registrar en auditoría
      await FelAuditLog.logOperation({
        operationType: 'nit_validation',
        result: satResponse.valido ? 'success' : 'failure',
        operationId: `nit_sat_${Date.now()}`,
        responseData: {
          nit: formattedNit,
          valido: satResponse.valido,
          activo: satResponse.activo,
          nombre: satResponse.nombre
        },
        processingTime: 0 // TODO: Calcular tiempo real
      });

      const message = satResponse.valido
        ? 'NIT validado exitosamente'
        : 'NIT no válido o no encontrado';

      return {
        success: true,
        message,
        data: validation,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('NIT validation error', {
        nit,
        error: error?.message || 'Unknown error'
      });

      // Registrar error en auditoría
      await FelAuditLog.logOperation({
        operationType: 'nit_validation',
        result: 'failure',
        operationId: `nit_error_${Date.now()}`,
        errorMessage: error?.message || 'Unknown error',
        responseData: { nit }
      });

      return {
        success: false,
        message: 'Error al validar NIT',
        error: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Consulta el NIT en el servicio del SAT
   */
  private async querySat(cleanNit: string): Promise<SatNitResponse> {
    const url = `${this.config.satUrl}/consultar/${cleanNit}`;

    logger.info('Querying SAT for NIT', { nit: cleanNit, url });

    const headers: any = {
      'Accept': 'application/json',
      'User-Agent': 'TradeConnect-FEL/1.0'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response: AxiosResponse<SatNitResponse> = await axios.get(url, {
        headers,
        timeout: this.config.timeout
      });

      return response.data;

    } catch (error: any) {
      // Si el SAT no está disponible, intentar con datos mock para desarrollo
      if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true') {
        logger.warn('SAT not available, using mock data', { nit: cleanNit });
        return this.getMockSatResponse(cleanNit);
      }

      throw error;
    }
  }

  /**
   * Guarda el resultado de validación en la base de datos
   */
  private async saveValidationResult(nit: string, satResponse: SatNitResponse): Promise<NitValidation> {
    // Buscar validación existente
    let validation = await NitValidation.findByNit(nit);

    if (validation) {
      // Actualizar validación existente
      await validation.updateValidation(
        satResponse.valido ? (satResponse.activo ? 'valid' : 'inactive') : 'not_found',
        {
          name: satResponse.nombre,
          address: satResponse.direccion,
          activity: satResponse.actividad_economica,
          taxRegime: satResponse.regimen_tributario,
          errorMessage: satResponse.valido ? undefined : 'NIT no válido o no encontrado'
        }
      );
    } else {
      // Crear nueva validación
      validation = await NitValidation.create({
        nit,
        status: satResponse.valido ? (satResponse.activo ? 'valid' : 'inactive') : 'not_found',
        name: satResponse.nombre,
        address: satResponse.direccion,
        activity: satResponse.actividad_economica,
        taxRegime: satResponse.regimen_tributario,
        lastValidationAt: new Date(),
        expiresAt: new Date(Date.now() + (this.config.cacheDurationHours * 60 * 60 * 1000)),
        validationSource: 'SAT',
        errorMessage: satResponse.valido ? undefined : 'NIT no válido o no encontrado',
        retryCount: 0
      });
    }

    return validation;
  }

  /**
   * Valida el formato básico de un NIT
   */
  private isValidNitFormat(nit: string): boolean {
    // NIT debe tener 8 dígitos + 1 dígito verificador (9 dígitos total)
    if (!/^\d{9}$/.test(nit)) {
      return false;
    }

    // Validar dígito verificador usando algoritmo del SAT
    return this.validateNitChecksum(nit);
  }

  /**
   * Valida el dígito verificador del NIT usando algoritmo del SAT
   */
  private validateNitChecksum(nit: string): boolean {
    const digits = nit.split('').map(Number);
    const checkDigit = digits.pop()!;

    // Pesos para cada posición (del último al primero, excluyendo dígito verificador)
    const weights = [2, 3, 4, 5, 6, 7, 8, 9];
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * weights[i];
    }

    const mod = sum % 11;
    const calculatedCheck = mod === 0 ? 0 : 11 - mod;

    return calculatedCheck === checkDigit;
  }

  /**
   * Formatea un NIT con guión verificador
   */
  private formatNit(cleanNit: string): string {
    if (cleanNit.length === 9) {
      return `${cleanNit.slice(0, 8)}-${cleanNit.slice(8)}`;
    }
    return cleanNit;
  }

  /**
   * Genera respuesta mock para desarrollo
   */
  private getMockSatResponse(cleanNit: string): SatNitResponse {
    // NITs de prueba conocidos
    const mockData: Record<string, SatNitResponse> = {
      '123456781': { // NIT válido de ejemplo
        nit: cleanNit,
        nombre: 'EMPRESA DE EJEMPLO S.A.',
        valido: true,
        activo: true,
        direccion: 'Ciudad de Guatemala',
        actividad_economica: 'Servicios Profesionales',
        regimen_tributario: 'General'
      },
      '876543210': { // NIT inactivo
        nit: cleanNit,
        nombre: 'EMPRESA INACTIVA S.A.',
        valido: true,
        activo: false,
        direccion: 'Ciudad de Guatemala',
        actividad_economica: 'Comercio',
        regimen_tributario: 'General'
      }
    };

    return mockData[cleanNit] || {
      nit: cleanNit,
      nombre: '',
      valido: false,
      activo: false
    };
  }

  /**
   * Limpia validaciones expiradas
   */
  async cleanupExpiredValidations(): Promise<ApiResponse<number>> {
    try {
      const deletedCount = await NitValidation.cleanExpiredValidations();

      logger.info('Expired NIT validations cleaned', { count: deletedCount });

      return {
        success: true,
        message: `${deletedCount} validaciones expiradas limpiadas`,
        data: deletedCount,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error cleaning expired validations', {
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error al limpiar validaciones expiradas',
        error: 'CLEANUP_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de validaciones
   */
  async getValidationStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await NitValidation.getValidationStats();

      return {
        success: true,
        message: 'Estadísticas de validaciones obtenidas',
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error getting validation stats', {
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error al obtener estadísticas de validaciones',
        error: 'STATS_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verifica si el servicio SAT está disponible
   */
  async checkSatHealth(): Promise<ApiResponse<boolean>> {
    try {
      const startTime = Date.now();

      // Intentar una consulta simple para verificar conectividad
      await axios.get(`${this.config.satUrl}/health`, {
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: 'Servicio SAT disponible',
        data: true,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('SAT health check failed', {
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Servicio SAT no disponible',
        data: false,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Instancia singleton del servicio de validación de NIT
 */
let nitValidationServiceInstance: NitValidationService | null = null;

/**
 * Factory para obtener instancia del servicio de validación de NIT
 */
export function getNitValidationService(): NitValidationService {
  if (!nitValidationServiceInstance) {
    nitValidationServiceInstance = new NitValidationService();
  }

  return nitValidationServiceInstance;
}

export const nitValidationService = getNitValidationService();
