/**
 * @fileoverview Servicio de Validación de CUI para TradeConnect FEL
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para validación de CUIs con RENAP de Guatemala
 */

import axios, { AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { CuiValidation } from '../models/CuiValidation';
import { FelAuditLog } from '../models/FelAuditLog';
import { ApiResponse } from '../types/global.types';

/**
 * Configuración del servicio de validación de CUI
 */
interface CuiValidationConfig {
  renapUrl: string;
  apiKey?: string;
  timeout: number;
  cacheEnabled: boolean;
  cacheDurationHours: number;
}

/**
 * Respuesta de validación de CUI de RENAP
 */
interface RenapCuiResponse {
  cui: string;
  primer_nombre?: string;
  segundo_nombre?: string;
  otros_nombres?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  apellido_casada?: string;
  fecha_nacimiento?: string;
  genero?: string;
  nacionalidad?: string;
  valido: boolean;
  fecha_ultima_actualizacion?: string;
}

/**
 * Servicio para validación de CUIs
 */
export class CuiValidationService {
  private config: CuiValidationConfig;

  constructor() {
    this.config = {
      renapUrl: process.env.RENAP_CUI_VALIDATION_URL || 'https://consulta-cui.renap.gob.gt',
      apiKey: process.env.RENAP_API_KEY,
      timeout: parseInt(process.env.RENAP_TIMEOUT || '30000'),
      cacheEnabled: process.env.RENAP_CACHE_ENABLED !== 'false',
      cacheDurationHours: parseInt(process.env.RENAP_CACHE_DURATION_HOURS || '24')
    };

    logger.info('CUI validation service initialized', {
      renapUrl: this.config.renapUrl,
      cacheEnabled: this.config.cacheEnabled,
      cacheDurationHours: this.config.cacheDurationHours
    });
  }

  /**
   * Valida un CUI con RENAP
   */
  async validateCui(cui: string, forceRefresh: boolean = false): Promise<ApiResponse<CuiValidation>> {
    try {
      // Limpiar CUI (remover espacios)
      const cleanCui = cui.replace(/\s/g, '');

      // Validar formato básico
      if (!this.isValidCuiFormat(cleanCui)) {
        return {
          success: false,
          message: 'Formato de CUI inválido',
          error: 'INVALID_CUI_FORMAT',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar caché si está habilitado y no se fuerza refresh
      if (this.config.cacheEnabled && !forceRefresh) {
        const cachedResult = await CuiValidation.getValidCui(cleanCui);
        if (cachedResult) {
          logger.info('CUI validation from cache', { cui: cleanCui });

          // Registrar en auditoría
          await FelAuditLog.logOperation({
            operationType: 'cui_validation',
            result: 'success',
            operationId: `cui_cache_${Date.now()}`,
            responseData: {
              cui: cleanCui,
              cached: true,
              status: cachedResult.status
            }
          });

          return {
            success: true,
            message: 'CUI validado desde caché',
            data: cachedResult,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Consultar RENAP
      const renapResponse = await this.queryRenap(cleanCui);

      // Crear o actualizar registro de validación
      const validation = await this.saveValidationResult(cleanCui, renapResponse);

      // Registrar en auditoría
      await FelAuditLog.logOperation({
        operationType: 'cui_validation',
        result: renapResponse.valido ? 'success' : 'failure',
        operationId: `cui_renap_${Date.now()}`,
        responseData: {
          cui: cleanCui,
          valido: renapResponse.valido,
          primerNombre: renapResponse.primer_nombre,
          primerApellido: renapResponse.primer_apellido
        },
        processingTime: 0 // TODO: Calcular tiempo real
      });

      const message = renapResponse.valido
        ? 'CUI validado exitosamente'
        : 'CUI no válido o no encontrado';

      return {
        success: true,
        message,
        data: validation,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('CUI validation error', {
        cui,
        error: error?.message || 'Unknown error'
      });

      // Registrar error en auditoría
      await FelAuditLog.logOperation({
        operationType: 'cui_validation',
        result: 'failure',
        operationId: `cui_error_${Date.now()}`,
        errorMessage: error?.message || 'Unknown error',
        responseData: { cui }
      });

      return {
        success: false,
        message: 'Error al validar CUI',
        error: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Consulta el CUI en el servicio de RENAP
   */
  private async queryRenap(cleanCui: string): Promise<RenapCuiResponse> {
    const url = `${this.config.renapUrl}/consultar/${cleanCui}`;

    logger.info('Querying RENAP for CUI', { cui: cleanCui, url });

    const headers: any = {
      'Accept': 'application/json',
      'User-Agent': 'TradeConnect-FEL/1.0'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response: AxiosResponse<RenapCuiResponse> = await axios.get(url, {
        headers,
        timeout: this.config.timeout
      });

      return response.data;

    } catch (error: any) {
      // Si RENAP no está disponible, intentar con datos mock para desarrollo
      if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true') {
        logger.warn('RENAP not available, using mock data', { cui: cleanCui });
        return this.getMockRenapResponse(cleanCui);
      }

      throw error;
    }
  }

  /**
   * Guarda el resultado de validación en la base de datos
   */
  private async saveValidationResult(cui: string, renapResponse: RenapCuiResponse): Promise<CuiValidation> {
    // Construir nombre completo
    const firstName = [renapResponse.primer_nombre, renapResponse.segundo_nombre, renapResponse.otros_nombres]
      .filter(Boolean)
      .join(' ');

    const lastName = [renapResponse.primer_apellido, renapResponse.segundo_apellido, renapResponse.apellido_casada]
      .filter(Boolean)
      .join(' ');

    // Buscar validación existente
    let validation = await CuiValidation.findByCui(cui);

    if (validation) {
      // Actualizar validación existente
      await validation.updateValidation(
        renapResponse.valido ? 'valid' : 'not_found',
        {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          birthDate: renapResponse.fecha_nacimiento ? new Date(renapResponse.fecha_nacimiento) : undefined,
          gender: renapResponse.genero as 'M' | 'F' | undefined,
          nationality: renapResponse.nacionalidad,
          errorMessage: renapResponse.valido ? undefined : 'CUI no válido o no encontrado'
        }
      );
    } else {
      // Crear nueva validación
      validation = await CuiValidation.create({
        cui,
        status: renapResponse.valido ? 'valid' : 'not_found',
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        birthDate: renapResponse.fecha_nacimiento ? new Date(renapResponse.fecha_nacimiento) : undefined,
        gender: renapResponse.genero as 'M' | 'F' | undefined,
        nationality: renapResponse.nacionalidad,
        lastValidationAt: new Date(),
        expiresAt: new Date(Date.now() + (this.config.cacheDurationHours * 60 * 60 * 1000)),
        validationSource: 'RENAP',
        errorMessage: renapResponse.valido ? undefined : 'CUI no válido o no encontrado',
        retryCount: 0
      });
    }

    return validation;
  }

  /**
   * Valida el formato básico de un CUI
   */
  private isValidCuiFormat(cui: string): boolean {
    // CUI debe tener exactamente 13 dígitos
    return /^\d{13}$/.test(cui);
  }

  /**
   * Genera respuesta mock para desarrollo
   */
  private getMockRenapResponse(cleanCui: string): RenapCuiResponse {
    // CUIs de prueba conocidos
    const mockData: Record<string, RenapCuiResponse> = {
      '1234567890123': { // CUI válido de ejemplo
        cui: cleanCui,
        primer_nombre: 'JUAN',
        segundo_nombre: 'CARLOS',
        primer_apellido: 'PEREZ',
        segundo_apellido: 'GARCIA',
        fecha_nacimiento: '1990-05-15',
        genero: 'M',
        nacionalidad: 'Guatemalteca',
        valido: true
      },
      '9876543210987': { // CUI válido mujer
        cui: cleanCui,
        primer_nombre: 'MARIA',
        segundo_nombre: 'JOSEFA',
        primer_apellido: 'LOPEZ',
        segundo_apellido: 'MARTINEZ',
        fecha_nacimiento: '1985-12-03',
        genero: 'F',
        nacionalidad: 'Guatemalteca',
        valido: true
      }
    };

    return mockData[cleanCui] || {
      cui: cleanCui,
      valido: false
    };
  }

  /**
   * Limpia validaciones expiradas
   */
  async cleanupExpiredValidations(): Promise<ApiResponse<number>> {
    try {
      const deletedCount = await CuiValidation.cleanExpiredValidations();

      logger.info('Expired CUI validations cleaned', { count: deletedCount });

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
      const stats = await CuiValidation.getValidationStats();

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
   * Verifica si el servicio RENAP está disponible
   */
  async checkRenapHealth(): Promise<ApiResponse<boolean>> {
    try {
      const startTime = Date.now();

      // Intentar una consulta simple para verificar conectividad
      await axios.get(`${this.config.renapUrl}/health`, {
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: 'Servicio RENAP disponible',
        data: true,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('RENAP health check failed', {
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Servicio RENAP no disponible',
        data: false,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Instancia singleton del servicio de validación de CUI
 */
let cuiValidationServiceInstance: CuiValidationService | null = null;

/**
 * Factory para obtener instancia del servicio de validación de CUI
 */
export function getCuiValidationService(): CuiValidationService {
  if (!cuiValidationServiceInstance) {
    cuiValidationServiceInstance = new CuiValidationService();
  }

  return cuiValidationServiceInstance;
}

export const cuiValidationService = getCuiValidationService();
