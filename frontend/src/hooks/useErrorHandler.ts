import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorMessage: string;
  errorCode?: string;
  errorDetails?: any;
}

interface UseErrorHandlerReturn {
  errorState: ErrorState;
  handleError: (error: unknown, customMessage?: string) => void;
  clearError: () => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    errorMessage?: string
  ) => (...args: T) => Promise<R | undefined>;
  logError: (error: unknown, context?: string) => void;
}

/**
 * Hook personalizado para manejo centralizado de errores
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorMessage: ''
  });

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error('Error handled:', error);

    let errorMessage = customMessage || 'Ha ocurrido un error inesperado';
    let errorCode: string | undefined;
    let errorDetails: any;

    if (error instanceof Error) {
      // Errores de red
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        errorCode = 'NETWORK_ERROR';
      }
      // Errores de API con códigos específicos
      else if (error.message.includes('401') || error.message.includes('Sesión expirada')) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        errorCode = 'UNAUTHORIZED';
        // Redirigir al login si es necesario
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      else if (error.message.includes('403') || error.message.includes('permisos')) {
        errorMessage = 'No tienes permisos para realizar esta acción.';
        errorCode = 'FORBIDDEN';
      }
      else if (error.message.includes('404') || error.message.includes('no encontrado')) {
        errorMessage = 'Recurso no encontrado.';
        errorCode = 'NOT_FOUND';
      }
      else if (error.message.includes('409') || error.message.includes('Conflicto')) {
        errorMessage = error.message;
        errorCode = 'CONFLICT';
      }
      else if (error.message.includes('422') || error.message.includes('no cumple')) {
        errorMessage = error.message;
        errorCode = 'VALIDATION_ERROR';
      }
      else if (error.message.includes('500') || error.message.includes('interno del servidor')) {
        errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
        errorCode = 'INTERNAL_SERVER_ERROR';
      }
      else if (error.message.includes('400') || error.message.includes('Datos')) {
        errorMessage = error.message;
        errorCode = 'BAD_REQUEST';
      }
      else {
        errorMessage = error.message;
        errorCode = 'UNKNOWN_ERROR';
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
      errorCode = 'STRING_ERROR';
    } else if (typeof error === 'object' && error !== null) {
      // Manejar errores de API estructurados
      const apiError = error as any;
      if (apiError.message) {
        errorMessage = apiError.message;
      }
      if (apiError.error) {
        errorCode = apiError.error;
      }
      if (apiError.details) {
        errorDetails = apiError.details;
      }
    }

    setErrorState({
      hasError: true,
      error: error instanceof Error ? error : new Error(String(error)),
      errorMessage,
      errorCode,
      errorDetails
    });

    toast.error(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorMessage: ''
    });
  }, []);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    errorMessage?: string
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        clearError();
        return await fn(...args);
      } catch (error) {
        handleError(error, errorMessage);
        return undefined;
      }
    };
  }, [handleError, clearError]);

  const logError = useCallback((error: unknown, context?: string) => {
    const timestamp = new Date().toISOString();
    const contextInfo = context ? ` [${context}]` : '';

    console.group(`🚨 Error Log${contextInfo} - ${timestamp}`);
    console.error('Error:', error);

    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }

    // Log additional context information
    if (typeof window !== 'undefined') {
      console.log('User Agent:', navigator.userAgent);
      console.log('URL:', window.location.href);
      console.log('Timestamp:', timestamp);
    }

    console.groupEnd();

    // Aquí se podría enviar a un servicio de logging externo
    // logToExternalService(error, context, timestamp);
  }, []);

  return {
    errorState,
    handleError,
    clearError,
    withErrorHandling,
    logError
  };
};