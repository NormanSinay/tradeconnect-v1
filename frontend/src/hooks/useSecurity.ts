import { useState, useEffect, useCallback } from 'react'
import { rateLimiter, validateInput, sanitizeInput, sanitizeHtml } from '@/utils/security'
import { showToast } from '@/utils/toast'

interface SecurityHookReturn {
  // Input validation
  validateField: (fieldName: string, value: string, rules: ValidationRules) => ValidationResult
  sanitizeInput: (input: string) => string
  sanitizeHtml: (html: string) => string

  // Rate limiting
  isRateLimited: (endpoint: string) => boolean
  getRateLimitStatus: (endpoint: string) => { allowed: boolean; remaining: number }

  // Security monitoring
  securityEvents: SecurityEvent[]
  logSecurityEvent: (event: Omit<SecurityEvent, 'timestamp'>) => void
  clearSecurityEvents: () => void

  // Suspicious activity detection
  suspiciousActivityCount: number
  reportSuspiciousActivity: (activity: string, details?: any) => void
}

interface ValidationRules {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean
  type?: 'email' | 'phone' | 'nit' | 'url' | 'creditCard' | 'text'
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

interface SecurityEvent {
  type: 'validation_error' | 'rate_limit' | 'suspicious_activity' | 'csrf_error' | 'xss_attempt'
  message: string
  details?: any
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export const useSecurity = (): SecurityHookReturn => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [suspiciousActivityCount, setSuspiciousActivityCount] = useState(0)

  // Input validation with comprehensive rules
  const validateField = useCallback((
    fieldName: string,
    value: string,
    rules: ValidationRules
  ): ValidationResult => {
    const errors: string[] = []
    let isValid = true

    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
      errors.push(`${fieldName} es requerido`)
      isValid = false
    }

    // Skip other validations if empty and not required
    if (!value && !rules.required) {
      return { isValid: true, errors: [] }
    }

    const trimmedValue = value.trim()

    // Length validations
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      errors.push(`${fieldName} debe tener al menos ${rules.minLength} caracteres`)
      isValid = false
    }

    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      errors.push(`${fieldName} no puede tener más de ${rules.maxLength} caracteres`)
      isValid = false
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(trimmedValue)) {
      errors.push(`${fieldName} tiene un formato inválido`)
      isValid = false
    }

    // Type-specific validation
    if (rules.type) {
      let typeValid = true
      switch (rules.type) {
        case 'email':
          typeValid = validateInput.email(trimmedValue)
          if (!typeValid) errors.push('Correo electrónico inválido')
          break
        case 'phone':
          typeValid = validateInput.phone(trimmedValue)
          if (!typeValid) errors.push('Número de teléfono inválido')
          break
        case 'nit':
          typeValid = validateInput.nit(trimmedValue)
          if (!typeValid) errors.push('NIT inválido')
          break
        case 'url':
          typeValid = validateInput.url(trimmedValue)
          if (!typeValid) errors.push('URL inválida')
          break
        case 'creditCard':
          typeValid = validateInput.creditCard(trimmedValue.replace(/[\s-]/g, ''))
          if (!typeValid) errors.push('Número de tarjeta inválido')
          break
      }
      if (!typeValid) isValid = false
    }

    // Custom validation
    if (rules.custom && !rules.custom(trimmedValue)) {
      errors.push(`${fieldName} no cumple con los criterios requeridos`)
      isValid = false
    }

    // Log validation errors for security monitoring
    if (!isValid) {
      logSecurityEvent({
        type: 'validation_error',
        message: `Validation failed for field: ${fieldName}`,
        details: { fieldName, value: trimmedValue, rules, errors },
        severity: 'low'
      })
    }

    return { isValid, errors }
  }, [])

  // Security event logging
  const logSecurityEvent = useCallback((event: Omit<SecurityEvent, 'timestamp'>) => {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    }

    setSecurityEvents(prev => {
      const updated = [securityEvent, ...prev]
      // Keep only last 100 events
      return updated.slice(0, 100)
    })

    // Show toast for high/critical severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      showToast.error(`Alerta de seguridad: ${event.message}`)
    }
  }, [])

  // Suspicious activity reporting
  const reportSuspiciousActivity = useCallback((activity: string, details?: any) => {
    setSuspiciousActivityCount(prev => prev + 1)

    logSecurityEvent({
      type: 'suspicious_activity',
      message: `Suspicious activity detected: ${activity}`,
      details,
      severity: 'medium'
    })

    // Could send to monitoring service
    console.warn('Suspicious activity reported:', { activity, details })
  }, [logSecurityEvent])

  // Clear security events
  const clearSecurityEvents = useCallback(() => {
    setSecurityEvents([])
    setSuspiciousActivityCount(0)
  }, [])

  // Rate limiting checks
  const isRateLimited = useCallback((endpoint: string): boolean => {
    return !rateLimiter.isAllowed(endpoint)
  }, [])

  const getRateLimitStatus = useCallback((endpoint: string) => {
    return {
      allowed: rateLimiter.isAllowed(endpoint),
      remaining: rateLimiter.getRemainingAttempts(endpoint)
    }
  }, [])

  // Monitor for suspicious patterns
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      // Detect potential localStorage tampering
      if (e.key?.includes('auth') || e.key?.includes('token')) {
        reportSuspiciousActivity('localStorage modification detected', {
          key: e.key,
          oldValue: e.oldValue ? '[REDACTED]' : null,
          newValue: e.newValue ? '[REDACTED]' : null
        })
      }
    }

    const handleBeforeUnload = () => {
      // Clear sensitive data on page unload
      sessionStorage.clear()
    }

    window.addEventListener('storage', handleStorageEvent)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('storage', handleStorageEvent)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [reportSuspiciousActivity])

  return {
    validateField,
    sanitizeInput,
    sanitizeHtml,
    isRateLimited,
    getRateLimitStatus,
    securityEvents,
    logSecurityEvent,
    clearSecurityEvents,
    suspiciousActivityCount,
    reportSuspiciousActivity
  }
}

export default useSecurity