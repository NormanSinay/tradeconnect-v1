/**
 * @fileoverview Utilidades comunes del sistema TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Funciones utilitarias reutilizables para toda la aplicación
 */

import crypto from 'crypto';
import { ApiResponse, PaginatedResponse } from '../types/global.types';

// ====================================================================
// FUNCIONES DE GENERACIÓN DE IDENTIFICADORES
// ====================================================================

/**
 * Genera un UUID v4 estándar
 * @returns UUID v4 como string
 * @example
 * const id = generateUUID();
 * // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Genera un hash MD5 de un string
 * @param data - String a hashear
 * @returns Hash MD5 en hexadecimal
 * @example
 * const hash = generateMD5('password123');
 * // "482c811da5d5b4bc6d497ffa98491e38"
 */
export const generateMD5 = (data: string): string => {
  return crypto.createHash('md5').update(data).digest('hex');
};

/**
 * Genera un hash SHA256 de un string
 * @param data - String a hashear
 * @returns Hash SHA256 en hexadecimal
 * @example
 * const hash = generateSHA256('sensitive_data');
 * // "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
 */
export const generateSHA256 = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Genera un código alfanumérico aleatorio
 * @param length - Longitud del código (default: 8)
 * @returns Código alfanumérico en mayúsculas
 * @example
 * const code = generateAlphanumericCode(6);
 * // "A7B9C2"
 */
export const generateAlphanumericCode = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// ====================================================================
// FUNCIONES DE FORMATEO DE RESPUESTAS API
// ====================================================================

/**
 * Formatea una respuesta exitosa de la API
 * @param data - Datos a incluir en la respuesta
 * @param message - Mensaje descriptivo (default: 'Success')
 * @returns Respuesta formateada
 * @example
 * return res.json(successResponse(userData, 'Usuario creado exitosamente'));
 */
export const successResponse = <T>(
  data: T,
  message = 'Success'
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Formatea una respuesta de error de la API
 * @param message - Mensaje de error
 * @param error - Detalles adicionales del error (opcional)
 * @returns Respuesta de error formateada
 * @example
 * return res.status(400).json(errorResponse('Email ya está en uso'));
 */
export const errorResponse = (
  message: string,
  error?: string
): ApiResponse => {
  return {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString()
  };
};

/**
 * Formatea una respuesta paginada de la API
 * @param data - Array de datos
 * @param page - Página actual
 * @param limit - Elementos por página
 * @param total - Total de elementos
 * @param message - Mensaje descriptivo (default: 'Success')
 * @returns Respuesta paginada formateada
 * @example
 * return res.json(paginatedResponse(events, 1, 20, 150, 'Eventos obtenidos'));
 */
export const paginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message = 'Success'
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    },
    timestamp: new Date().toISOString()
  };
};

// ====================================================================
// FUNCIONES DE VALIDACIÓN
// ====================================================================

/**
 * Valida si un string es un email válido
 * @param email - Email a validar
 * @returns true si es válido, false en caso contrario
 * @example
 * const isValid = isValidEmail('usuario@example.com'); // true
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

/**
 * Valida si un string es un NIT guatemalteco válido
 * Formatos aceptados: 12345678, 1234567-8, 12345678-9
 * @param nit - NIT a validar
 * @returns true si es válido, false en caso contrario
 * @example
 * const isValid = isValidNIT('12345678'); // true
 * const isValid2 = isValidNIT('1234567-8'); // true
 */
export const isValidNIT = (nit: string): boolean => {
  // Eliminar guiones y espacios
  const cleanNIT = nit.replace(/[-\s]/g, '');
  
  // Debe tener entre 8 y 13 dígitos
  if (!/^\d{8,13}$/.test(cleanNIT)) {
    return false;
  }
  
  // Validación básica de formato guatemalteco
  return cleanNIT.length >= 8 && cleanNIT.length <= 13;
};

/**
 * Valida si un string es un CUI guatemalteco válido
 * Formato: 13 dígitos exactos
 * @param cui - CUI a validar
 * @returns true si es válido, false en caso contrario
 * @example
 * const isValid = isValidCUI('1234567890123'); // true
 */
export const isValidCUI = (cui: string): boolean => {
  // Eliminar espacios
  const cleanCUI = cui.replace(/\s/g, '');
  
  // Debe tener exactamente 13 dígitos
  if (!/^\d{13}$/.test(cleanCUI)) {
    return false;
  }
  
  return true;
};

/**
 * Valida si un string es un número de teléfono guatemalteco válido
 * Formatos: +502 1234-5678, 502 1234-5678, 1234-5678, 12345678
 * @param phone - Teléfono a validar
 * @returns true si es válido, false en caso contrario
 * @example
 * const isValid = isValidGuatemalaPhone('+502 1234-5678'); // true
 */
export const isValidGuatemalaPhone = (phone: string): boolean => {
  // Eliminar espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Formatos guatemaltecos válidos:
  // 8 dígitos: 12345678
  // 11 dígitos con código país: 50212345678
  if (/^(\d{8}|502\d{8})$/.test(cleanPhone)) {
    return true;
  }
  
  return false;
};

/**
 * Valida si una fecha está en el futuro
 * @param date - Fecha a validar
 * @returns true si está en el futuro, false en caso contrario
 * @example
 * const isFuture = isDateInFuture(new Date('2025-12-31')); // true
 */
export const isDateInFuture = (date: Date): boolean => {
  return date.getTime() > Date.now();
};

/**
 * Valida si una fecha está dentro de un rango
 * @param date - Fecha a validar
 * @param startDate - Fecha inicial del rango
 * @param endDate - Fecha final del rango
 * @returns true si está en el rango, false en caso contrario
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const dateTime = date.getTime();
  return dateTime >= startDate.getTime() && dateTime <= endDate.getTime();
};

// ====================================================================
// FUNCIONES DE SANITIZACIÓN Y SEGURIDAD
// ====================================================================

/**
 * Sanitiza un string para evitar inyección XSS
 * @param str - String a sanitizar
 * @returns String sanitizado
 * @example
 * const safe = sanitizeString('<script>alert("xss")</script>');
 * // 'scriptalert("xss")/script'
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, '') // Remover < y >
    .trim()
    .substring(0, 1000); // Limitar longitud
};

/**
 * Sanitiza un objeto eliminando propiedades peligrosas
 * @param obj - Objeto a sanitizar
 * @returns Objeto sanitizado
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized: any = {};
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !dangerousKeys.includes(key)) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }
  
  return sanitized;
};

// ====================================================================
// FUNCIONES DE CODIFICACIÓN Y DECODIFICACIÓN
// ====================================================================

/**
 * Convierte un objeto a Base64
 * @param obj - Objeto a codificar
 * @returns String en Base64
 * @example
 * const encoded = objectToBase64({name: 'Juan', age: 30});
 */
export const objectToBase64 = (obj: any): string => {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
};

/**
 * Convierte de Base64 a objeto
 * @param base64 - String en Base64
 * @returns Objeto decodificado
 * @example
 * const decoded = base64ToObject('eyJuYW1lIjoiSnVhbiIsImFnZSI6MzB9');
 */
export const base64ToObject = (base64: string): any => {
  try {
    return JSON.parse(Buffer.from(base64, 'base64').toString());
  } catch (error) {
    throw new Error('Invalid Base64 string or JSON format');
  }
};

/**
 * Codifica un string a Base64 URL-safe
 * @param str - String a codificar
 * @returns String en Base64 URL-safe
 */
export const encodeBase64Url = (str: string): string => {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Decodifica un string Base64 URL-safe
 * @param str - String en Base64 URL-safe
 * @returns String decodificado
 */
export const decodeBase64Url = (str: string): string => {
  // Restaurar caracteres Base64 estándar
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Agregar padding si es necesario
  while (base64.length % 4) {
    base64 += '=';
  }
  
  return Buffer.from(base64, 'base64').toString();
};

// ====================================================================
// FUNCIONES DE FORMATEO Y LOCALIZACIÓN GUATEMALA
// ====================================================================

/**
 * Formatea una fecha para Guatemala (GMT-6)
 * @param date - Fecha a formatear
 * @param includeTime - Si incluir hora (default: true)
 * @returns Fecha formateada para Guatemala
 * @example
 * const formatted = formatDateGuatemala(new Date());
 * // "31/12/2024, 15:30:45"
 */
export const formatDateGuatemala = (date: Date, includeTime = true): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
    options.hour12 = false; // Formato 24 horas
  }
  
  return date.toLocaleString('es-GT', options);
};

/**
 * Formatea un monto en Quetzales guatemaltecos
 * @param amount - Monto a formatear
 * @param includeSymbol - Si incluir símbolo Q (default: true)
 * @returns Monto formateado
 * @example
 * const formatted = formatCurrencyGTQ(1500.50);
 * // "Q1,500.50"
 */
export const formatCurrencyGTQ = (amount: number, includeSymbol = true): string => {
  const formatted = new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return includeSymbol ? `Q${formatted}` : formatted;
};

/**
 * Formatea un NIT guatemalteco con formato estándar
 * @param nit - NIT a formatear
 * @returns NIT formateado
 * @example
 * const formatted = formatNIT('12345678');
 * // "1234567-8"
 */
export const formatNIT = (nit: string): string => {
  const cleanNIT = nit.replace(/[-\s]/g, '');
  
  if (cleanNIT.length === 8) {
    return `${cleanNIT.substring(0, 7)}-${cleanNIT.substring(7)}`;
  } else if (cleanNIT.length === 9) {
    return `${cleanNIT.substring(0, 8)}-${cleanNIT.substring(8)}`;
  }
  
  return cleanNIT;
};

/**
 * Formatea un teléfono guatemalteco
 * @param phone - Teléfono a formatear
 * @returns Teléfono formateado
 * @example
 * const formatted = formatGuatemalaPhone('50212345678');
 * // "+502 1234-5678"
 */
export const formatGuatemalaPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  if (cleanPhone.length === 8) {
    return `${cleanPhone.substring(0, 4)}-${cleanPhone.substring(4)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('502')) {
    const number = cleanPhone.substring(3);
    return `+502 ${number.substring(0, 4)}-${number.substring(4)}`;
  }
  
  return phone; // Retornar original si no se puede formatear
};

// ====================================================================
// FUNCIONES DE UTILIDADES GENERALES
// ====================================================================

/**
 * Función sleep/delay para async/await
 * @param ms - Milisegundos a esperar
 * @returns Promise que resuelve después del tiempo especificado
 * @example
 * await sleep(1000); // Esperar 1 segundo
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Convierte la primera letra de un string a mayúscula
 * @param str - String a capitalizar
 * @returns String capitalizado
 * @example
 * const capitalized = capitalize('hello world'); // "Hello world"
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convierte un string a slug URL-friendly
 * @param str - String a convertir
 * @returns Slug generado
 * @example
 * const slug = stringToSlug('Hola Mundo! ¿Cómo estás?');
 * // "hola-mundo-como-estas"
 */
export const stringToSlug = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD') // Separar caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios por guiones
    .replace(/-+/g, '-'); // Remover guiones duplicados
};

/**
 * Trunca un string a una longitud específica
 * @param str - String a truncar
 * @param length - Longitud máxima
 * @param suffix - Sufijo a agregar (default: '...')
 * @returns String truncado
 * @example
 * const truncated = truncateString('Este es un texto muy largo', 10);
 * // "Este es un..."
 */
export const truncateString = (str: string, length: number, suffix = '...'): string => {
  if (str.length <= length) {
    return str;
  }
  
  return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Verifica si un objeto está vacío
 * @param obj - Objeto a verificar
 * @returns true si está vacío, false en caso contrario
 */
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Clona profundamente un objeto
 * @param obj - Objeto a clonar
 * @returns Clon del objeto
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj) as any;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as any;
  
  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
};