import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MiniCart from '@/components/cart/MiniCart';
import LanguageSelector from '@/components/common/LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';

const Navbar: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { t } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [cartMenuAnchor, setCartMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check user roles
  const adminRoles = ['super_admin', 'admin', 'manager'];
  const isAdmin = isAuthenticated && user?.roles?.some(role => adminRoles.includes(role));
  const isSpeaker = isAuthenticated && user?.roles?.includes('speaker');
  const isOperator = isAuthenticated && user?.roles?.includes('operator');
  const isRegularUser = isAuthenticated && user?.roles?.some(role =>
    ['user', 'participant', 'client'].includes(role)
  );

  // Dynamic navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { label: t('nav.home'), path: '/', icon: <HomeIcon className="h-4 w-4" /> },
    ];

    // Add role-specific items
    if (isSpeaker) {
      return [
        ...baseItems,
        { label: 'Mis Eventos', path: '/speaker/events', icon: <EventIcon className="h-4 w-4" /> },
        { label: 'Mi Agenda', path: '/speaker/schedule', icon: <CalendarIcon className="h-4 w-4" /> },
        { label: 'Contacto', path: '/contact', icon: <ContactIcon className="h-4 w-4" /> },
      ];
    }

    if (isOperator) {
      return [
        ...baseItems,
        { label: 'Eventos', path: '/events', icon: <EventIcon className="h-4 w-4" /> },
        { label: 'Check-in QR', path: '/operator/checkin', icon: <QrCodeIcon className="h-4 w-4" /> },
        { label: 'Contacto', path: '/contact', icon: <ContactIcon className="h-4 w-4" /> },
      ];
    }

    if (isAdmin) {
      return [
        ...baseItems,
        { label: 'Eventos', path: '/events', icon: <EventIcon className="h-4 w-4" /> },
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon className="h-4 w-4" /> },
        { label: 'Contacto', path: '/contact', icon: <ContactIcon className="h-4 w-4" /> },
      ];
    }

    if (isRegularUser) {
      return [
        ...baseItems,
        { label: 'Eventos', path: '/events', icon: <EventIcon className="h-4 w-4" /> },
        { label: 'Mis Certificados', path: '/certificates', icon: <SchoolIcon className="h-4 w-4" /> },
        { label: 'Contacto', path: '/contact', icon: <ContactIcon className="h-4 w-4" /> },
      ];
    }

    // Not authenticated or no specific role
    return [
      ...baseItems,
      { label: 'Eventos', path: '/events', icon: <EventIcon className="h-4 w-4" /> },
      { label: 'Contacto', path: '/contact', icon: <ContactIcon className="h-4 w-4" /> },
    ];
  };

  const navigationItems = getNavigationItems();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartItemCount = cart?.totalItems || 0;

  return (
    <>
      {/* Fixed Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
          : 'bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity"
            >
              <BusinessIcon className="h-7 w-7" />
              <span>TradeConnect</span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex-1 flex justify-center items-center space-x-2 lg:space-x-4">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    asChild
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    size={isTablet ? "sm" : "default"}
                    className={`${
                      location.pathname === item.path
                        ? 'border-b-2 border-primary'
                        : ''
                    } ${isTablet ? 'text-sm px-3' : ''}`}
                  >
                    <Link to={item.path} className="flex items-center space-x-2">
                      {item.icon}
                      <span className={isTablet && item.label.length > 8 ? 'hidden' : ''}>
                        {item.label}
                      </span>
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            {/* Search Bar */}
            <div className={`flex-1 max-w-md mx-4 ${isMobile ? 'hidden' : 'block'}`}>
              <form onSubmit={handleSearch} className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('events.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Language Selector - Hide on mobile */}
              {!isMobile && <LanguageSelector />}

              {/* Mini Cart */}
              <MiniCart
                anchorEl={cartMenuAnchor}
                onClose={() => setCartMenuAnchor(null)}
                onOpen={(event) => setCartMenuAnchor(event.currentTarget)}
              />

              {/* Profile/Login */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    {/* Common profile option for all users */}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <PersonIcon className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>

                    {/* Speaker-specific menu items */}
                    {isSpeaker && [
                      <DropdownMenuItem key="speaker-events" asChild>
                        <Link to="/speaker/events" className="flex items-center">
                          <EventIcon className="mr-2 h-4 w-4" />
                          Mis Eventos
                        </Link>
                      </DropdownMenuItem>,
                      <DropdownMenuItem key="speaker-schedule" asChild>
                        <Link to="/speaker/schedule" className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Mi Agenda
                        </Link>
                      </DropdownMenuItem>,
                      <DropdownMenuItem key="speaker-profile" asChild>
                        <Link to="/speaker/profile" className="flex items-center">
                          <PersonIcon className="mr-2 h-4 w-4" />
                          Perfil de Speaker
                        </Link>
                      </DropdownMenuItem>
                    ]}

                    {/* Operator-specific menu items */}
                    {isOperator && (
                      <DropdownMenuItem asChild>
                        <Link to="/operator/checkin" className="flex items-center">
                          <QrCodeIcon className="mr-2 h-4 w-4" />
                          Check-in QR
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Regular user menu items */}
                    {isRegularUser && !isAdmin && !isSpeaker && (
                      <DropdownMenuItem asChild>
                        <Link to="/certificates" className="flex items-center">
                          <SchoolIcon className="mr-2 h-4 w-4" />
                          Mis Certificados
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Admin Menu Items - Only visible for admin users */}
                    {isAdmin && [
                      <DropdownMenuSeparator key="admin-separator" />,
                      <DropdownMenuItem key="admin-dashboard" asChild>
                        <Link to="/dashboard?tab=0" className="flex items-center">
                          <DashboardIcon className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>,
                      <DropdownMenuItem key="admin-events" asChild>
                        <Link to="/dashboard?tab=1" className="flex items-center">
                          <EventIcon className="mr-2 h-4 w-4" />
                          Gestión de Eventos
                        </Link>
                      </DropdownMenuItem>,
                      <DropdownMenuItem key="admin-users" asChild>
                        <Link to="/dashboard?tab=2" className="flex items-center">
                          <ManageAccountsIcon className="mr-2 h-4 w-4" />
                          Gestión de Usuarios
                        </Link>
                      </DropdownMenuItem>,
                      <DropdownMenuItem key="admin-reports" asChild>
                        <Link to="/dashboard?tab=3" className="flex items-center">
                          <AssessmentIcon className="mr-2 h-4 w-4" />
                          Reportes
                        </Link>
                      </DropdownMenuItem>
                    ]}

                    {/* Logout - always visible */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                      <LogoutIcon className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                  <Button asChild variant="outline" size={isTablet ? "sm" : "default"}>
                    <Link to="/login">{t('nav.login')}</Link>
                  </Button>
                  <Button asChild size={isTablet ? "sm" : "default"}>
                    <Link to="/register">{t('nav.register')}</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MenuIcon className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="flex flex-col space-y-4 mt-6">
                      {/* Mobile Search */}
                      <form onSubmit={handleSearch} className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder={t('events.search')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </form>

                      {/* Navigation Items */}
                      <div className="space-y-2">
                        {navigationItems.map((item) => (
                          <Button
                            key={item.path}
                            asChild
                            variant={location.pathname === item.path ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Link to={item.path} className="flex items-center space-x-3">
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          </Button>
                        ))}
                      </div>

                      {/* Language selector in mobile menu */}
                      <div className="border-t pt-4">
                        <LanguageSelector />
                      </div>

                      {!isAuthenticated && (
                        <div className="border-t pt-4 space-y-2">
                          <Button asChild variant="outline" className="w-full">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                              <PersonIcon className="mr-2 h-4 w-4" />
                              {t('nav.login')}
                            </Link>
                          </Button>
                          <Button asChild className="w-full">
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                              <PersonIcon className="mr-2 h-4 w-4" />
                              {t('nav.register')}
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};

