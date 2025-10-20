/**
 * TradeConnect Frontend Utilities
 *
 * Comprehensive utility functions for the Astro + React + Tailwind/shadcn architecture
 * Provides type-safe utilities for common operations, performance optimization,
 * and development experience enhancement.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to Guatemalan Quetzal (GTQ)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency to USD
 */
export function formatCurrencyUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date to localized string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('es-GT', defaultOptions).format(new Date(date));
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Format relative time (e.g., "hace 2 horas", "en 3 días")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInMinutes = Math.abs(diffInMs) / (1000 * 60);
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;

  const isPast = diffInMs < 0;
  const prefix = isPast ? 'hace' : 'en';

  if (diffInMinutes < 1) return 'ahora mismo';
  if (diffInMinutes < 60) return `${prefix} ${Math.floor(diffInMinutes)} minuto${Math.floor(diffInMinutes) !== 1 ? 's' : ''}`;
  if (diffInHours < 24) return `${prefix} ${Math.floor(diffInHours)} hora${Math.floor(diffInHours) !== 1 ? 's' : ''}`;
  if (diffInDays < 7) return `${prefix} ${Math.floor(diffInDays)} día${Math.floor(diffInDays) !== 1 ? 's' : ''}`;
  if (diffInDays < 30) return `${prefix} ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) !== 1 ? 's' : ''}`;

  return formatDate(date);
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Truncate text by words to specified length
 */
export function truncateWords(text: string, maxWords: number): string {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Generate random ID
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as T;

  const clonedObj = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

/**
 * Get nested object property safely
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}

/**
 * Set nested object property safely
 */
export function set(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.split('.');
  let current: Record<string, any> = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, any>;
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Guatemalan format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+502\s?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('502')) {
    return `+502 ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if running on client side
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if running on server side
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get environment variable safely
 */
export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  if (isClient()) {
    return (import.meta.env as any)[key] || defaultValue;
  }
  return process.env[key] || defaultValue;
}

/**
 * Scroll to element smoothly
 */
export function scrollToElement(elementId: string): void {
  if (!isClient()) return;

  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isClient()) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename: string): void {
  if (!isClient()) return;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get URL search parameters
 */
export function getSearchParams(): URLSearchParams {
  if (!isClient()) return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/**
 * Update URL search parameters
 */
export function updateSearchParams(params: Record<string, string>): void {
  if (!isClient()) return;

  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });

  window.history.replaceState({}, '', url.toString());
}

/**
 * Validate TradeConnect specific formats
 */

/**
 * Validate NIT (Guatemalan tax ID)
 */
export function isValidNIT(nit: string): boolean {
  const nitRegex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;
  return nitRegex.test(nit);
}

/**
 * Validate CUI (Guatemalan personal ID)
 */
export function isValidCUI(cui: string): boolean {
  const cuiRegex = /^\d{13}$/;
  return cuiRegex.test(cui);
}

/**
 * Format NIT
 */
export function formatNIT(nit: string): string {
  const cleaned = nit.replace(/\D/g, '');
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 10)}-${cleaned.slice(10, 13)}-${cleaned.slice(13)}`;
  }
  return nit;
}

/**
 * Format CUI
 */
export function formatCUI(cui: string): string {
  return cui.replace(/\D/g, '').slice(0, 13);
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const today = new Date();
  const target = new Date(date);
  return today.toDateString() === target.toDateString();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: string | Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date);
  return yesterday.toDateString() === target.toDateString();
}

/**
 * Get days difference between two dates
 */
export function getDaysDifference(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Performance utilities
 */

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  fn: () => Promise<T> | T,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (label && isClient()) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Create performance mark
 */
export function markPerformance(name: string): void {
  if (isClient() && 'performance' in window) {
    performance.mark(name);
  }
}

/**
 * Measure performance between marks
 */
export function measurePerformanceMarks(startMark: string, endMark: string): number | null {
  if (!isClient() || !('performance' in window)) return null;

  try {
    performance.mark(endMark);
    const measure = performance.measure(`${startMark}-${endMark}`, startMark, endMark);
    return measure.duration;
  } catch {
    return null;
  }
}
