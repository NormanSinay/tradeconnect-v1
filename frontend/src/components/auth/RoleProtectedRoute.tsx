import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
  requireAuth?: boolean;
}

/**
 * Componente para proteger rutas basado en roles específicos
 * Verifica autenticación y permisos de rol antes de renderizar el contenido
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login',
  requireAuth = true
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const permissions = usePermissions();

  useEffect(() => {
    // Verificar autenticación si es requerida
    if (requireAuth && !isAuthenticated) {
      toast.error('Debes iniciar sesión para acceder a esta página');
      window.location.href = fallbackPath;
      return;
    }

    // Verificar permisos de rol si está autenticado
    if (isAuthenticated && user) {
      const hasRequiredRole = allowedRoles.includes(user.role);

      if (!hasRequiredRole) {
        toast.error('No tienes permisos para acceder a esta página');

        // Redirigir según el rol actual del usuario
        switch (user.role) {
          case 'super_admin':
            window.location.href = '/dashboard/super-admin';
            break;
          case 'admin':
            window.location.href = '/dashboard/admin';
            break;
          case 'user':
            window.location.href = '/dashboard/user';
            break;
          case 'participant':
            window.location.href = '/dashboard/participant';
            break;
          case 'client':
            window.location.href = '/dashboard/client';
            break;
          default:
            window.location.href = '/dashboard';
        }
        return;
      }
    }
  }, [isAuthenticated, user, allowedRoles, fallbackPath, requireAuth]);

  // Mostrar loading mientras se verifica
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22]"></div>
      </div>
    );
  }

  // Verificar permisos si está autenticado
  if (isAuthenticated && user) {
    const hasRequiredRole = allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando permisos...</p>
          </div>
        </div>
      );
    }
  }

  // Renderizar contenido si pasa todas las validaciones
  return <>{children}</>;
};

export default RoleProtectedRoute;