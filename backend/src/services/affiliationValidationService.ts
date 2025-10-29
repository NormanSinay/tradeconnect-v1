/**
 * @fileoverview Servicio de Validación de Afiliación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para validación de NITs, CUIs y datos fiscales guatemaltecos
 *
 * Archivo: backend/src/services/affiliationValidationService.ts
 */

import { ApiResponse } from '../types/global.types';
import { TaxValidationResult } from '../types/registration.types';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';

/**
 * Servicio para validación de datos fiscales guatemaltecos
 */
export class AffiliationValidationService {

  // ====================================================================
  // VALIDACIÓN DE NIT GUATEMALTECO
  // ====================================================================

  /**
   * Valida un NIT guatemalteco
   */
  async validateNIT(nit: string): Promise<TaxValidationResult> {
    try {
      // Limpiar el NIT
      const cleanNIT = nit.replace(/[-\s]/g, '');

      // Verificar formato básico
      if (!/^\d{8}\d{1}$/.test(cleanNIT)) {
        return {
          isValid: false,
          message: 'El formato del NIT debe ser 12345678-9 (8 dígitos + dígito verificador)',
          details: {
            nitValid: false
          }
        };
      }

      // Extraer dígitos
      const digits = cleanNIT.split('').map(Number);
      const checkDigit = digits.pop()!;

      // Calcular dígito verificador usando algoritmo módulo 11
      const calculatedCheckDigit = this.calculateNITCheckDigit(digits);

      if (checkDigit !== calculatedCheckDigit) {
        return {
          isValid: false,
          message: 'El dígito verificador del NIT es incorrecto',
          details: {
            nitValid: false,
            expectedCheckDigit: calculatedCheckDigit,
            providedCheckDigit: checkDigit
          }
        };
      }

      // Verificar en caché
      const cacheKey = `nit_validation:${cleanNIT}`;
      const cached = await cacheService.get(cacheKey);

      if (cached && typeof cached === 'string') {
        return JSON.parse(cached);
      }

      // TODO: Consultar API SAT para validación en línea
      // Por ahora, asumimos válido si pasa la validación de formato

      const result: TaxValidationResult = {
        isValid: true,
        message: 'NIT válido',
        details: {
          nitValid: true,
          formattedNIT: `${cleanNIT.slice(0, 8)}-${checkDigit}`
        }
      };

      // Cachear resultado por 30 días
      await cacheService.set(cacheKey, JSON.stringify(result), 30 * 24 * 60 * 60);

      return result;

    } catch (error) {
      logger.error('Error validando NIT:', error);
      return {
        isValid: false,
        message: 'Error interno al validar NIT',
        details: {
          nitValid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Calcula el dígito verificador de un NIT usando algoritmo módulo 11
   */
  private calculateNITCheckDigit(digits: number[]): number {
    const weights = [9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * weights[i];
    }

    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  }

  // ====================================================================
  // VALIDACIÓN DE CUI GUATEMALTECO
  // ====================================================================

  /**
   * Valida un CUI guatemalteco
   */
  async validateCUI(cui: string): Promise<TaxValidationResult> {
    try {
      // Limpiar el CUI
      const cleanCUI = cui.replace(/[-\s]/g, '');

      // Verificar formato básico (13 dígitos)
      if (!/^\d{13}$/.test(cleanCUI)) {
        return {
          isValid: false,
          message: 'El CUI debe tener exactamente 13 dígitos',
          details: {
            cuiValid: false
          }
        };
      }

      const digits = cleanCUI.split('').map(Number);

      // Validar fecha de nacimiento (posiciones 9-14: AAMMDD)
      const birthDateStr = cleanCUI.slice(8, 14);
      const birthDate = this.parseCUIBirthDate(birthDateStr);

      if (!birthDate) {
        return {
          isValid: false,
          message: 'La fecha de nacimiento embebida en el CUI es inválida',
          details: {
            cuiValid: false,
            birthDateStr
          }
        };
      }

      // Validar código de municipio (posiciones 7-10)
      const municipalityCode = parseInt(cleanCUI.slice(6, 10));
      if (municipalityCode < 101 || municipalityCode > 2221) {
        return {
          isValid: false,
          message: 'El código de municipio en el CUI es inválido',
          details: {
            cuiValid: false,
            municipalityCode
          }
        };
      }

      // Calcular dígito verificador
      const calculatedCheckDigit = this.calculateCUICheckDigit(digits.slice(0, 12));
      const providedCheckDigit = digits[12];

      if (calculatedCheckDigit !== providedCheckDigit) {
        return {
          isValid: false,
          message: 'El dígito verificador del CUI es incorrecto',
          details: {
            cuiValid: false,
            expectedCheckDigit: calculatedCheckDigit,
            providedCheckDigit
          }
        };
      }

      // Verificar en caché
      const cacheKey = `cui_validation:${cleanCUI}`;
      const cached = await cacheService.get(cacheKey);

      if (cached && typeof cached === 'string') {
        return JSON.parse(cached);
      }

      const result: TaxValidationResult = {
        isValid: true,
        message: 'CUI válido',
        details: {
          cuiValid: true,
          birthDate: birthDate.toISOString().split('T')[0],
          municipalityCode,
          department: this.getDepartmentFromMunicipality(municipalityCode)
        }
      };

      // Cachear resultado por 30 días
      await cacheService.set(cacheKey, JSON.stringify(result), 30 * 24 * 60 * 60);

      return result;

    } catch (error) {
      logger.error('Error validando CUI:', error);
      return {
        isValid: false,
        message: 'Error interno al validar CUI',
        details: {
          cuiValid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Parsea la fecha de nacimiento desde el CUI
   */
  private parseCUIBirthDate(dateStr: string): Date | null {
    try {
      // Formato AAMMDD
      const year = parseInt(dateStr.slice(0, 2));
      const month = parseInt(dateStr.slice(2, 4)) - 1; // Meses en JS son 0-indexed
      const day = parseInt(dateStr.slice(4, 6));

      // Determinar siglo (19xx o 20xx)
      const currentYear = new Date().getFullYear() % 100;
      const fullYear = year <= currentYear ? 2000 + year : 1900 + year;

      const date = new Date(fullYear, month, day);

      // Verificar que la fecha sea válida
      if (date.getFullYear() !== fullYear ||
          date.getMonth() !== month ||
          date.getDate() !== day) {
        return null;
      }

      // Verificar que no sea una fecha futura
      if (date > new Date()) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  }

  /**
   * Calcula el dígito verificador del CUI
   */
  private calculateCUICheckDigit(digits: number[]): number {
    const weights = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * weights[i];
    }

    const mod = sum % 26;
    return mod;
  }

  /**
   * Obtiene el departamento desde el código de municipio
   */
  private getDepartmentFromMunicipality(municipalityCode: number): string {
    const departmentCodes: Record<number, string> = {
      1: 'Guatemala',
      2: 'El Progreso',
      3: 'Sacatepéquez',
      4: 'Chimaltenango',
      5: 'Escuintla',
      6: 'Santa Rosa',
      7: 'Sololá',
      8: 'Totonicapán',
      9: 'Quetzaltenango',
      10: 'Suchitepéquez',
      11: 'Retalhuleu',
      12: 'San Marcos',
      13: 'Huehuetenango',
      14: 'Quiché',
      15: 'Baja Verapaz',
      16: 'Alta Verapaz',
      17: 'Petén',
      18: 'Izabal',
      19: 'Zacapa',
      20: 'Chiquimula',
      21: 'Jalapa',
      22: 'Jutiapa'
    };

    const departmentCode = Math.floor(municipalityCode / 100);
    return departmentCodes[departmentCode] || 'Desconocido';
  }

  // ====================================================================
  // VALIDACIÓN DE EMAIL
  // ====================================================================

  /**
   * Valida un email con verificación de dominio
   */
  async validateEmail(email: string): Promise<TaxValidationResult> {
    try {
      // Validación básica de formato
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

      if (!emailRegex.test(email)) {
        return {
          isValid: false,
          message: 'El formato del email es inválido',
          details: {
            emailValid: false
          }
        };
      }

      // Verificar en lista negra de dominios temporales
      const domain = email.split('@')[1].toLowerCase();
      const tempDomains = [
        '10minutemail.com',
        'guerrillamail.com',
        'mailinator.com',
        'temp-mail.org',
        'throwaway.email'
      ];

      if (tempDomains.includes(domain)) {
        return {
          isValid: false,
          message: 'No se permiten emails temporales',
          details: {
            emailValid: false,
            tempDomain: true
          }
        };
      }

      // Verificar en caché
      const cacheKey = `email_validation:${email}`;
      const cached = await cacheService.get(cacheKey);

      if (cached && typeof cached === 'string') {
        return JSON.parse(cached);
      }

      // TODO: Verificar registros MX del dominio
      // Por ahora, asumimos válido si pasa las validaciones básicas

      const result: TaxValidationResult = {
        isValid: true,
        message: 'Email válido',
        details: {
          emailValid: true,
          domain
        }
      };

      // Cachear resultado por 1 hora
      await cacheService.set(cacheKey, JSON.stringify(result), 60 * 60);

      return result;

    } catch (error) {
      logger.error('Error validando email:', error);
      return {
        isValid: false,
        message: 'Error interno al validar email',
        details: {
          emailValid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // ====================================================================
  // VALIDACIÓN DE TELÉFONO GUATEMALTECO
  // ====================================================================

  /**
   * Valida un número de teléfono guatemalteco
   */
  async validatePhone(phone: string): Promise<TaxValidationResult> {
    try {
      // Normalizar el teléfono
      let normalizedPhone = phone.replace(/[-\s]/g, '');

      // Agregar código de país si no está presente
      if (normalizedPhone.startsWith('502')) {
        // Ya tiene código de país
      } else if (normalizedPhone.startsWith('+502')) {
        normalizedPhone = normalizedPhone.substring(1);
      } else if (normalizedPhone.length === 8) {
        // Agregar código de país
        normalizedPhone = `502${normalizedPhone}`;
      } else {
        return {
          isValid: false,
          message: 'El teléfono debe tener 8 dígitos locales o incluir el código de país 502',
          details: {
            phoneValid: false
          }
        };
      }

      // Verificar formato final
      if (!/^502\d{8}$/.test(normalizedPhone)) {
        return {
          isValid: false,
          message: 'Formato de teléfono inválido. Use: +502 XXXX-XXXX o 502XXXXXXX',
          details: {
            phoneValid: false
          }
        };
      }

      // Extraer código de área (primeros 4 dígitos después del código de país)
      const areaCode = normalizedPhone.substring(3, 7);
      const validAreaCodes = [
        '1501', '1502', '1503', '1504', '1505', '1506', '1507', '1508', '1509',
        '1601', '1602', '1603', '1604', '1605', '1606', '1607', '1608', '1609',
        '2201', '2202', '2203', '2204', '2205', '2206', '2207', '2208', '2209',
        '3101', '3102', '3103', '3104', '3105', '3106', '3107', '3108', '3109',
        '4101', '4102', '4103', '4104', '4105', '4106', '4107', '4108', '4109',
        '5101', '5102', '5103', '5104', '5105', '5106', '5107', '5108', '5109',
        '6101', '6102', '6103', '6104', '6105', '6106', '6107', '6108', '6109',
        '7101', '7102', '7103', '7104', '7105', '7106', '7107', '7108', '7109',
        '8101', '8102', '8103', '8104', '8105', '8106', '8107', '8108', '8109'
      ];

      if (!validAreaCodes.includes(areaCode)) {
        return {
          isValid: false,
          message: 'El código de área del teléfono no es válido en Guatemala',
          details: {
            phoneValid: false,
            areaCode
          }
        };
      }

      // Verificar en caché
      const cacheKey = `phone_validation:${normalizedPhone}`;
      const cached = await cacheService.get(cacheKey);

      if (cached && typeof cached === 'string') {
        return JSON.parse(cached);
      }

      const result: TaxValidationResult = {
        isValid: true,
        message: 'Teléfono válido',
        details: {
          phoneValid: true,
          formattedPhone: `+${normalizedPhone.slice(0, 3)} ${normalizedPhone.slice(3, 7)}-${normalizedPhone.slice(7)}`,
          areaCode
        }
      };

      // Cachear resultado por 24 horas
      await cacheService.set(cacheKey, JSON.stringify(result), 24 * 60 * 60);

      return result;

    } catch (error) {
      logger.error('Error validando teléfono:', error);
      return {
        isValid: false,
        message: 'Error interno al validar teléfono',
        details: {
          phoneValid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // ====================================================================
  // VALIDACIÓN COMBINADA
  // ====================================================================

  /**
   * Valida datos fiscales completos
   */
  async validateTaxData(nit?: string, cui?: string): Promise<TaxValidationResult> {
    const results = {
      nitValid: true,
      cuiValid: true,
      messages: [] as string[]
    };

    // Validar NIT si se proporciona
    if (nit) {
      const nitResult = await this.validateNIT(nit);
      results.nitValid = nitResult.isValid;
      if (!nitResult.isValid) {
        results.messages.push(`NIT: ${nitResult.message}`);
      }
    }

    // Validar CUI si se proporciona
    if (cui) {
      const cuiResult = await this.validateCUI(cui);
      results.cuiValid = cuiResult.isValid;
      if (!cuiResult.isValid) {
        results.messages.push(`CUI: ${cuiResult.message}`);
      }
    }

    return {
      isValid: results.nitValid && results.cuiValid,
      message: results.messages.length > 0 ? results.messages.join('; ') : 'Datos fiscales válidos',
      details: results
    };
  }

  // ====================================================================
  // CONSULTAS EXTERNAS (SAT)
  // ====================================================================

  /**
   * Consulta NIT en SAT (simulado)
   */
  private async querySAT(nit: string): Promise<any> {
    // TODO: Implementar consulta real a API del SAT
    // Por ahora, simular respuesta

    logger.info(`Consultando NIT ${nit} en SAT (simulado)`);

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simular respuesta exitosa
    return {
      valid: true,
      taxpayerName: 'Empresa Ejemplo S.A.',
      status: 'active'
    };
  }
}

export const affiliationValidationService = new AffiliationValidationService();
