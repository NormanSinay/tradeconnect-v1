import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  FaSignOutAlt,
  FaUser,
  FaHome,
  FaBriefcase,
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * AdminLayout - Layout especial para Super Admins sin navbar público
 * Proporciona acceso completo a todas las funcionalidades administrativas
 * desde una vista dedicada sin distracciones del sitio público
 */
const AdminLayoutNew: React.FC = () => {
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

  const getRoleBadge = () => {
    const roleLabels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      operator: 'Operator',
    };
    return roleLabels[user?.role || ''] || user?.role;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin Header - Minimal y profesional */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary-600 shadow-md">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <FaBriefcase className="text-3xl text-white" />
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
            <div className="flex items-center gap-3">
              {/* User info - Hidden on mobile */}
              <div className="hidden md:flex flex-col items-end mr-2">
                <p className="text-sm font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-none text-xs h-5"
                >
                  {getRoleBadge()}
                </Badge>
              </div>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-full p-0 hover:bg-white/10"
                  >
                    <Avatar className="h-10 w-10 border-2 border-white/30">
                      <AvatarImage src={user?.avatar} alt={user?.firstName} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {getRoleBadge()}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleGoToProfile}
                    className="cursor-pointer"
                  >
                    <FaUser className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleGoToPublicSite}
                    className="cursor-pointer"
                  >
                    <FaHome className="mr-2 h-4 w-4" />
                    Ir al Sitio Público
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-error"
                  >
                    <FaSignOutAlt className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content con padding top para el header fixed */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayoutNew;
