import DOMPurify from 'isomorphic-dompurify';

// Security utilities for React/Astro architecture
// Compatible with: React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui → Tailwind CSS → Radix UI → React Icons

export const securityUtils = {
  // Input sanitization
  sanitizeInput: (input: string): string => {
    if (typeof input !== 'string') return '';

    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },

  // HTML sanitization using DOMPurify
  sanitizeHTML: (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  },

  // URL validation
  isValidUrl: (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  },

  // Email validation with additional security checks
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) return false;

    // Additional security checks
    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const localPart = parts[0];
    const domainPart = parts[1];

    // Check for suspicious patterns
    if (!localPart || !domainPart) return false;
    if (localPart.length > 64 || domainPart.length > 253) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (domainPart.includes('..')) return false;

    return true;
  },

  // Password strength validation
  validatePasswordStrength: (password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Debe tener al menos 8 caracteres');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Debe contener al menos una letra mayúscula');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Debe contener al menos una letra minúscula');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Debe contener al menos un número');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Debe contener al menos un carácter especial');
    }

    // Common password check
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push('Esta contraseña es muy común, elige una más segura');
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  },

  // CSRF token generation
  generateCSRFToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Content Security Policy helper
  generateCSP: (options: {
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    connectSrc?: string[];
    fontSrc?: string[];
    objectSrc?: string[];
    mediaSrc?: string[];
    frameSrc?: string[];
  } = {}): string => {
    const {
      defaultSrc = ["'self'"],
      scriptSrc = ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc = ["'self'", "'unsafe-inline'"],
      imgSrc = ["'self'", 'data:', 'https:'],
      connectSrc = ["'self'"],
      fontSrc = ["'self'", 'https://fonts.gstatic.com'],
      objectSrc = ["'none'"],
      mediaSrc = ["'self'"],
      frameSrc = ["'none'"],
    } = options;

    const directives = [
      `default-src ${defaultSrc.join(' ')}`,
      `script-src ${scriptSrc.join(' ')}`,
      `style-src ${styleSrc.join(' ')}`,
      `img-src ${imgSrc.join(' ')}`,
      `connect-src ${connectSrc.join(' ')}`,
      `font-src ${fontSrc.join(' ')}`,
      `object-src ${objectSrc.join(' ')}`,
      `media-src ${mediaSrc.join(' ')}`,
      `frame-src ${frameSrc.join(' ')}`,
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ];

    return directives.join('; ');
  },

  // Rate limiting helper (client-side)
  createRateLimiter: (maxRequests: number, windowMs: number) => {
    const requests: number[] = [];

    return {
      checkLimit: (): boolean => {
        const now = Date.now();
        // Remove old requests outside the window
        while (requests.length > 0 && requests[0]! < now - windowMs) {
          requests.shift();
        }

        if (requests.length >= maxRequests) {
          return false; // Rate limit exceeded
        }

        requests.push(now);
        return true;
      },

      reset: (): void => {
        requests.length = 0;
      },
    };
  },

  // Secure local storage wrapper
  secureStorage: {
    set: (key: string, value: any): void => {
      try {
        const encrypted = btoa(JSON.stringify(value));
        localStorage.setItem(`secure_${key}`, encrypted);
      } catch (error) {
        console.error('Error storing secure data:', error);
      }
    },

    get: <T = any>(key: string): T | null => {
      try {
        const encrypted = localStorage.getItem(`secure_${key}`);
        if (!encrypted) return null;
        return JSON.parse(atob(encrypted));
      } catch (error) {
        console.error('Error retrieving secure data:', error);
        return null;
      }
    },

    remove: (key: string): void => {
      localStorage.removeItem(`secure_${key}`);
    },

    clear: (): void => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('secure_')) {
          localStorage.removeItem(key);
        }
      });
    },
  },

  // XSS prevention for dynamic content (Astro SSR compatible)
  escapeHtml: (text: string): string => {
    // Check if running in browser environment (Astro SSR compatibility)
    if (typeof document === 'undefined') {
      // Server-side: use a simple HTML entity encoding
      return text
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // Client-side: use DOM-based escaping
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // SQL injection prevention (client-side validation)
  sanitizeSQLInput: (input: string): string => {
    // Remove SQL injection patterns
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .trim();
  },

  // File upload validation
  validateFileUpload: (file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): { isValid: boolean; error?: string } => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'],
    } = options;

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `El archivo es demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB permitido.`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
      };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `Extensión de archivo no permitida. Extensiones permitidas: ${allowedExtensions.join(', ')}`,
      };
    }

    return { isValid: true };
  },

  // Session management (React/Astro compatible)
  sessionManager: {
    // Auto-logout after inactivity
    startInactivityTimer: (timeoutMs: number = 30 * 60 * 1000, callback: () => void): (() => void) => {
      // Check if running in browser environment (Astro SSR compatibility)
      if (typeof document === 'undefined' || typeof window === 'undefined') {
        return () => {}; // Return empty cleanup function for SSR
      }

      let timeoutId: NodeJS.Timeout;

      const resetTimer = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(callback, timeoutMs);
      };

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });

      resetTimer(); // Start the timer

      // Return cleanup function
      return () => {
        clearTimeout(timeoutId);
        events.forEach(event => {
          document.removeEventListener(event, resetTimer, true);
        });
      };
    },

    // Secure session storage
    setSessionData: (key: string, data: any): void => {
      try {
        const sessionData = {
          data,
          timestamp: Date.now(),
          expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        };
        sessionStorage.setItem(`session_${key}`, JSON.stringify(sessionData));
      } catch (error) {
        console.error('Error storing session data:', error);
      }
    },

    getSessionData: <T = any>(key: string): T | null => {
      try {
        const stored = sessionStorage.getItem(`session_${key}`);
        if (!stored) return null;

        const sessionData = JSON.parse(stored);
        if (Date.now() > sessionData.expires) {
          sessionStorage.removeItem(`session_${key}`);
          return null;
        }

        return sessionData.data;
      } catch (error) {
        console.error('Error retrieving session data:', error);
        return null;
      }
    },

    clearSessionData: (key?: string): void => {
      if (key) {
        sessionStorage.removeItem(`session_${key}`);
      } else {
        // Clear all session data
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('session_')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    },
  },

  // Error reporting (React/Astro compatible)
  errorReporter: {
    reportError: (error: Error, context?: any): void => {
      // Enhanced error context for React/Astro architecture
      const errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        context,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'SSR',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
        environment: import.meta.env.MODE,
        framework: 'React/Astro',
      };

      console.error('Application Error:', errorData);

      // In production, send to error reporting service
      if (import.meta.env.PROD) {
        // Example: send to Sentry, LogRocket, etc.
        // errorReportingService.captureError(errorData);
      }
    },

    reportSecurityIssue: (issue: {
      type: 'xss' | 'csrf' | 'injection' | 'other';
      description: string;
      data?: any;
    }): void => {
      console.warn('Security Issue Detected:', issue);

      if (import.meta.env.PROD) {
        // Send security issue to monitoring service
        // securityMonitoringService.reportIssue(issue);
      }
    },
  },
};