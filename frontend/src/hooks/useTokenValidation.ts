import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { UserService } from '@/services/userService';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para validar tokens y sesiones
 * Verifica expiración automática y maneja renovaciones
 */
export const useTokenValidation = () => {
  const { token, user, logout, isAuthenticated } = useAuthStore();

  // Función para validar token con el backend
  const validateToken = useCallback(async (): Promise<boolean> => {
    if (!token || !isAuthenticated) {
      return false;
    }

    try {
      // Intentar hacer una llamada simple al backend para validar el token
      await UserService.getUserStats();
      return true;
    } catch (error: any) {
      // Si el error es de autenticación, el token es inválido
      if (error.message?.includes('Token') ||
          error.message?.includes('Sesión') ||
          error.message?.includes('expirado') ||
          error.message?.includes('inválido')) {
        return false;
      }

      // Para otros errores, asumir que el token es válido
      return true;
    }
  }, [token, isAuthenticated]);

  // Función para verificar expiración del token JWT
  const isTokenExpired = useCallback((): boolean => {
    if (!token) return true;

    try {
      // Decodificar token JWT (sin verificar firma, solo para obtener exp)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      // Verificar si el token ha expirado (con margen de 5 minutos)
      return payload.exp < (currentTime - 300);
    } catch (error) {
      // Si no se puede decodificar, asumir expirado
      return true;
    }
  }, [token]);

  // Función para renovar token automáticamente
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      // Aquí iría la lógica para renovar el token usando refresh token
      // Por ahora, solo validamos el token actual
      const isValid = await validateToken();

      if (!isValid) {
        // Token inválido, hacer logout
        logout();
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      toast.error('Error de autenticación. Por favor, inicia sesión nuevamente.');
      return false;
    }
  }, [validateToken, logout]);

  // Efecto para validar token periódicamente
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Verificar token inmediatamente
    const checkToken = async () => {
      const tokenExpired = isTokenExpired();

      if (tokenExpired) {
        // Intentar renovar token
        const refreshed = await refreshToken();
        if (!refreshed) {
          return;
        }
      } else {
        // Validar token con backend
        const isValid = await validateToken();
        if (!isValid) {
          logout();
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          return;
        }
      }
    };

    // Verificar inmediatamente
    checkToken();

    // Configurar verificación periódica cada 5 minutos
    const interval = setInterval(checkToken, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token, isTokenExpired, refreshToken, validateToken, logout]);

  // Efecto para validar token cuando cambia la pestaña/visibilidad
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        // Usuario regresó a la pestaña, validar token
        const isValid = await validateToken();
        if (!isValid) {
          logout();
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, validateToken, logout]);

  return {
    validateToken,
    isTokenExpired,
    refreshToken
  };
};