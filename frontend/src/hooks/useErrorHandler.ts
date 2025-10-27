import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorMessage: string;
}

interface UseErrorHandlerReturn {
  errorState: ErrorState;
  handleError: (error: unknown, customMessage?: string) => void;
  clearError: () => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    errorMessage?: string
  ) => (...args: T) => Promise<R | undefined>;
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

    if (error instanceof Error) {
      // Errores de red
      if (error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }
      // Errores de API
      else if (error.message.includes('401')) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        // Redirigir al login si es necesario
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      else if (error.message.includes('403')) {
        errorMessage = 'No tienes permisos para realizar esta acción.';
      }
      else if (error.message.includes('404')) {
        errorMessage = 'Recurso no encontrado.';
      }
      else if (error.message.includes('500')) {
        errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
      }
      else {
        errorMessage = error.message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    setErrorState({
      hasError: true,
      error: error instanceof Error ? error : new Error(String(error)),
      errorMessage
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

  return {
    errorState,
    handleError,
    clearError,
    withErrorHandling
  };
};