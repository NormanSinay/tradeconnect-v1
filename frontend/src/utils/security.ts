import DOMPurify from 'isomorphic-dompurify'

// Security utilities for frontend
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim()
}

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

// CSRF token generation (client-side)
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Input sanitization for forms
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as T[Extract<keyof T, string>]
    }
  }

  return sanitized
}

// Content Security Policy helpers
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '').substring(0, 16)
}

// Validate file uploads
export const validateFileUpload = (file: File, options: {
  maxSize?: number // in MB
  allowedTypes?: string[]
  allowedExtensions?: string[]
}): { isValid: boolean; error?: string } => {
  // Check file size
  if (options.maxSize) {
    const maxSizeInBytes = options.maxSize * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      return { isValid: false, error: `El archivo es demasiado grande. Máximo ${options.maxSize}MB.` }
    }
  }

  // Check file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de archivo no permitido.' }
  }

  // Check file extension
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !options.allowedExtensions.includes(extension)) {
      return { isValid: false, error: 'Extensión de archivo no permitida.' }
    }
  }

  return { isValid: true }
}

// Secure local storage wrapper
export class SecureStorage {
  private static instance: SecureStorage
  private prefix = 'tradeconnect_secure_'

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage()
    }
    return SecureStorage.instance
  }

  setItem(key: string, value: string, encrypt = false): void {
    const prefixedKey = this.prefix + key
    const dataToStore = encrypt ? this.simpleEncrypt(value) : value
    localStorage.setItem(prefixedKey, dataToStore)
  }

  getItem(key: string, decrypt = false): string | null {
    const prefixedKey = this.prefix + key
    const storedValue = localStorage.getItem(prefixedKey)
    if (!storedValue) return null
    return decrypt ? this.simpleDecrypt(storedValue) : storedValue
  }

  removeItem(key: string): void {
    const prefixedKey = this.prefix + key
    localStorage.removeItem(prefixedKey)
  }

  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  // Simple encryption/decryption (not for sensitive data)
  private simpleEncrypt(text: string): string {
    return btoa(encodeURIComponent(text))
  }

  private simpleDecrypt(encoded: string): string {
    try {
      return decodeURIComponent(atob(encoded))
    } catch {
      return encoded
    }
  }
}

// Rate limiting for API calls
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private limits: Map<string, { maxAttempts: number; windowMs: number }> = new Map()

  setLimit(key: string, maxAttempts: number, windowMs: number): void {
    this.limits.set(key, { maxAttempts, windowMs })
  }

  isAllowed(key: string): boolean {
    const limit = this.limits.get(key)
    if (!limit) return true // No limit set

    const now = Date.now()
    const attempts = this.attempts.get(key) || []

    // Remove old attempts outside the window
    const validAttempts = attempts.filter(timestamp => now - timestamp < limit.windowMs)

    if (validAttempts.length >= limit.maxAttempts) {
      return false
    }

    validAttempts.push(now)
    this.attempts.set(key, validAttempts)

    return true
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }

  getRemainingAttempts(key: string): number {
    const limit = this.limits.get(key)
    if (!limit) return Infinity

    const attempts = this.attempts.get(key) || []
    const validAttempts = attempts.filter(timestamp => Date.now() - timestamp < limit.windowMs)
    return Math.max(0, limit.maxAttempts - validAttempts.length)
  }
}

// Input validation helpers
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  phone: (phone: string): boolean => {
    // Guatemala phone validation
    const phoneRegex = /^(\+502|502|00502)?[1-9]\d{7}$/
    return phoneRegex.test(phone.replace(/[\s-]/g, ''))
  },

  nit: (nit: string): boolean => {
    // Guatemala NIT validation
    const nitRegex = /^\d{4}-\d{6}-\d{3}-\d$/
    return nitRegex.test(nit)
  },

  url: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  creditCard: (cardNumber: string): boolean => {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '')

    // Check if it's all digits
    if (!/^\d+$/.test(cleaned)) return false

    // Check length (13-19 digits for most cards)
    if (cleaned.length < 13 || cleaned.length > 19) return false

    // Luhn algorithm
    let sum = 0
    let shouldDouble = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10)

      if (shouldDouble) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      shouldDouble = !shouldDouble
    }

    return sum % 10 === 0
  },
}

// Export singleton instances
export const secureStorage = SecureStorage.getInstance()
export const rateLimiter = new RateLimiter()

// Initialize default rate limits
rateLimiter.setLimit('login', 5, 15 * 60 * 1000) // 5 attempts per 15 minutes
rateLimiter.setLimit('register', 3, 60 * 60 * 1000) // 3 attempts per hour
rateLimiter.setLimit('api', 100, 60 * 1000) // 100 requests per minute