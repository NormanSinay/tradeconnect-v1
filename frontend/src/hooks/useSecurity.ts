import { useCallback, useEffect, useState } from 'react';
import { securityUtils } from '@/utils/security';

export const useSecurity = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Generate CSRF token on mount
  useEffect(() => {
    setCsrfToken(securityUtils.generateCSRFToken());
  }, []);

  // Rate limiting hook
  const useRateLimit = (maxRequests: number = 5, windowMs: number = 60000) => {
    const [rateLimiter] = useState(() =>
      securityUtils.createRateLimiter(maxRequests, windowMs)
    );

    const checkLimit = useCallback(() => {
      return rateLimiter.checkLimit();
    }, [rateLimiter]);

    const resetLimit = useCallback(() => {
      rateLimiter.reset();
    }, [rateLimiter]);

    return { checkLimit, resetLimit };
  };

  // Secure storage hook
  const useSecureStorage = () => {
    const setItem = useCallback(<T,>(key: string, value: T) => {
      securityUtils.secureStorage.set(key, value);
    }, []);

    const getItem = useCallback(<T,>(key: string): T | null => {
      return securityUtils.secureStorage.get<T>(key);
    }, []);

    const removeItem = useCallback((key: string) => {
      securityUtils.secureStorage.remove(key);
    }, []);

    const clearAll = useCallback(() => {
      securityUtils.secureStorage.clear();
    }, []);

    return { setItem, getItem, removeItem, clearAll };
  };

  // Session management hook
  const useSessionManager = () => {
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
      const cleanup = securityUtils.sessionManager.startInactivityTimer(
        15 * 60 * 1000, // 15 minutes
        () => {
          setIsActive(false);
          setSessionExpired(true);
        }
      );

      return cleanup;
    }, []);

    const setSessionData = useCallback(<T,>(key: string, data: T) => {
      securityUtils.sessionManager.setSessionData(key, data);
    }, []);

    const getSessionData = useCallback(<T,>(key: string): T | null => {
      return securityUtils.sessionManager.getSessionData<T>(key);
    }, []);

    const clearSessionData = useCallback((key?: string) => {
      securityUtils.sessionManager.clearSessionData(key);
    }, []);

    return {
      isActive,
      sessionExpired,
      setSessionData,
      getSessionData,
      clearSessionData,
    };
  };

  // Input validation hook
  const useInputValidation = () => {
    const validateEmail = useCallback((email: string): boolean => {
      return securityUtils.isValidEmail(email);
    }, []);

    const validatePassword = useCallback((password: string) => {
      return securityUtils.validatePasswordStrength(password);
    }, []);

    const validateUrl = useCallback((url: string): boolean => {
      return securityUtils.isValidUrl(url);
    }, []);

    const sanitizeInput = useCallback((input: string): string => {
      return securityUtils.sanitizeInput(input);
    }, []);

    const sanitizeHTML = useCallback((html: string): string => {
      return securityUtils.sanitizeHTML(html);
    }, []);

    return {
      validateEmail,
      validatePassword,
      validateUrl,
      sanitizeInput,
      sanitizeHTML,
    };
  };

  // File validation hook
  const useFileValidation = () => {
    const validateFile = useCallback((
      file: File,
      options?: {
        maxSize?: number;
        allowedTypes?: string[];
        allowedExtensions?: string[];
      }
    ) => {
      return securityUtils.validateFileUpload(file, options);
    }, []);

    return { validateFile };
  };

  // Error reporting hook
  const useErrorReporting = () => {
    const reportError = useCallback((error: Error, context?: any) => {
      securityUtils.errorReporter.reportError(error, context);
    }, []);

    const reportSecurityIssue = useCallback((issue: {
      type: 'xss' | 'csrf' | 'injection' | 'other';
      description: string;
      data?: any;
    }) => {
      securityUtils.errorReporter.reportSecurityIssue(issue);
    }, []);

    return { reportError, reportSecurityIssue };
  };

  // CSP generation hook
  const useCSP = () => {
    const generateCSP = useCallback((options?: Parameters<typeof securityUtils.generateCSP>[0]) => {
      return securityUtils.generateCSP(options);
    }, []);

    return { generateCSP };
  };

  return {
    csrfToken,
    sessionExpired,
    useRateLimit,
    useSecureStorage,
    useSessionManager,
    useInputValidation,
    useFileValidation,
    useErrorReporting,
    useCSP,
  };
};