/**
 * @fileoverview AdminLayout - Layout dedicado para panel de administración
 * @description Proporciona interfaz dedicada para Super Admins sin distracciones del sitio público
 *
 * Arquitectura:
 * - React (componentes interactivos) → Estado de autenticación, navegación
 * - Astro (routing y SSR) → Compatible con SSR, navegación del lado cliente
 * - shadcn/ui (componentes UI) → Button, Avatar, Badge, DropdownMenu para interfaz consistente
 * - Tailwind CSS (estilos) → Estilos utilitarios para layout responsivo
 * - Radix UI (primitivos accesibles) → Primitivos en shadcn/ui
 * - Lucide Icons (iconos) → Iconos modernos y consistentes
 *
 * @version 2.0.0
 * @since 2024
 * @author TradeConnect Team
 */

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut as LogoutIcon,
  User as PersonIcon,
  Home as HomeIcon,
  Building as BusinessIcon,
} from 'lucide-react';

/**
 * AdminLayout - Layout especial para Super Admins sin navbar público
 * Proporciona acceso completo a todas las funcionalidades administrativas
 * desde una vista dedicada sin distracciones del sitio público
 */
const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoToPublicSite = () => {
    navigate('/');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Admin Header - Minimal y profesional */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-3 flex-1">
              <BusinessIcon className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  TradeConnect
                </h1>
                <p className="text-xs text-white/90">
                  Panel de Administración
                </p>
              </div>
            </div>

            {/* User info y rol */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </span>
                <Badge variant="secondary" className="bg-white/20 text-white text-xs h-5">
                  {user?.roles?.[0] === 'super_admin' ? 'Super Admin' : user?.roles?.[0]}
                </Badge>
              </div>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                    <Avatar className="h-10 w-10 bg-white/20 border-2 border-white/30">
                      <AvatarFallback className="text-white">
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  {/* User info in menu (mobile) */}
                  <div className="md:hidden px-4 py-3 border-b">
                    <p className="text-sm font-bold">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs h-5">
                        {user?.roles?.[0] === 'super_admin' ? 'Super Admin' : user?.roles?.[0]}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenuItem onClick={handleGoToProfile}>
                    <PersonIcon className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleGoToPublicSite}>
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Ir al Sitio Público
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogoutIcon className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Sin navbar, solo el contenido administrativo */}
      <main className="flex-1 flex flex-col mt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
