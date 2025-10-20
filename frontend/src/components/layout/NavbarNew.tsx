/**
 * @fileoverview NavbarNew Component - Arquitectura React/Astro + Tailwind CSS + shadcn/ui
 *
 * Arquitectura recomendada para migración:
 * React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui (componentes UI)
 * → Tailwind CSS (estilos) → Radix UI (primitivos accesibles) → Lucide Icons (iconos)
 *
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Componente de navegación mejorado con navegación responsiva,
 * autenticación integrada, carrito de compras y búsqueda de eventos.
 * Compatible con SSR de Astro y optimizado para performance.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  User as PersonIcon,
  LogOut as LogoutIcon,
  LayoutDashboard as DashboardIcon,
  Calendar as EventIcon,
  GraduationCap as SchoolIcon,
  Building as BusinessIcon,
  Users as ManageAccountsIcon,
  BarChart3 as AssessmentIcon,
  Home as HomeIcon,
  Mail as ContactIcon,
  CalendarDays as CalendarIcon,
  QrCode as QrCodeIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';
import LanguageSelectorNew from '@/components/common/LanguageSelectorNew';
import MiniCart from '@/components/cart/MiniCart';

const NavbarNew: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemsCount = cart?.totalItems || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Inicio', href: '/', icon: HomeIcon },
        { label: 'Eventos', href: '/events', icon: EventIcon },
        { label: 'Contacto', href: '/contact', icon: ContactIcon },
      ];
    }

    const commonLinks = [
      { label: 'Inicio', href: '/', icon: HomeIcon },
      { label: 'Eventos', href: '/events', icon: EventIcon },
    ];

    if (user.roles?.some(role => ['super_admin', 'admin', 'manager'].includes(role))) {
      return [
        ...commonLinks,
        { label: 'Dashboard', href: '/admin/dashboard', icon: DashboardIcon },
      ];
    }

    if (user.roles?.includes('speaker')) {
      return [
        ...commonLinks,
        { label: 'Mis Eventos', href: '/speaker/events', icon: EventIcon },
        { label: 'Mi Perfil', href: '/speaker/profile', icon: PersonIcon },
      ];
    }

    if (user.roles?.includes('operator')) {
      return [
        ...commonLinks,
        { label: 'Check-in', href: '/operator/checkin', icon: QrCodeIcon },
      ];
    }

    return commonLinks;
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-primary-600 font-bold text-xl hover:text-primary-700 transition-colors no-underline"
            >
              <BusinessIcon className="text-2xl" />
              <span className="hidden sm:inline">TradeConnect</span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && !isTablet && (
              <div className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors no-underline ${
                      location.pathname === link.href
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    <link.icon className="text-base" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar"
              >
                <SearchIcon className="h-5 w-5" />
              </Button>

              {/* Language Selector */}
              {!isMobile && <LanguageSelectorNew />}

              {/* Cart */}
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCartOpen(true)}
                  className="relative"
                  aria-label="Carrito"
                >
                  <CartIcon className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              )}

              {/* User Menu / Login */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-100 text-primary-700">
                          {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer flex items-center">
                        <PersonIcon className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile/events" className="cursor-pointer flex items-center">
                        <EventIcon className="mr-2 h-4 w-4" />
                        Mis Eventos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile/certificates" className="cursor-pointer flex items-center">
                        <SchoolIcon className="mr-2 h-4 w-4" />
                        Mis Certificados
                      </Link>
                    </DropdownMenuItem>
                    {user.roles?.some(role => ['super_admin', 'admin'].includes(role)) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin/dashboard" className="cursor-pointer flex items-center">
                            <DashboardIcon className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-error">
                      <LogoutIcon className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  {!isMobile && (
                    <>
                      <Button variant="ghost" asChild>
                        <Link to="/auth/login">Iniciar Sesión</Link>
                      </Button>
                      <Button asChild>
                        <Link to="/auth/register">Registrarse</Link>
                      </Button>
                    </>
                  )}
                  {isMobile && (
                    <Button asChild size="sm">
                      <Link to="/auth/login">Acceder</Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              {(isMobile || isTablet) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Menú"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {(isMobile || isTablet) && mobileMenuOpen && (
            <div className="py-4 border-t border-gray-200">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors no-underline ${
                      location.pathname === link.href
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <link.icon className="text-lg" />
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <>
                    <div className="border-t border-gray-200 my-2" />
                    <Link
                      to="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 no-underline"
                    >
                      <PersonIcon className="text-lg" />
                      Iniciar Sesión
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </nav>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Buscar Eventos</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex gap-2">
              <Input
                type="search"
                placeholder="Buscar por nombre, categoría, ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit">
                <SearchIcon className="mr-2" />
                Buscar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <MiniCart anchorEl={null} onClose={() => setCartOpen(false)} onOpen={() => {}} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NavbarNew;
