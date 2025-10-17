import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputBase,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  ManageAccounts as ManageAccountsIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
  ContactMail as ContactIcon,
  CalendarToday as CalendarIcon,
  QrCodeScanner as QrCodeIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { styled, alpha } from '@mui/material/styles';
import MiniCart from '@/components/cart/MiniCart';
import LanguageSelector from '@/components/common/LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const GlassmorphismAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  transition: 'all 0.3s ease-in-out',
}));

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
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
      { label: t('nav.home'), path: '/', icon: <HomeIcon /> },
    ];

    // Add role-specific items
    if (isSpeaker) {
      return [
        ...baseItems,
        { label: 'Mis Eventos', path: '/speaker/events', icon: <EventIcon /> },
        { label: 'Mi Agenda', path: '/speaker/schedule', icon: <CalendarIcon /> },
        { label: 'Contacto', path: '/contact', icon: <ContactIcon /> },
      ];
    }

    if (isOperator) {
      return [
        ...baseItems,
        { label: 'Eventos', path: '/events', icon: <EventIcon /> },
        { label: 'Check-in QR', path: '/operator/checkin', icon: <QrCodeIcon /> },
        { label: 'Contacto', path: '/contact', icon: <ContactIcon /> },
      ];
    }

    if (isAdmin) {
      return [
        ...baseItems,
        { label: 'Eventos', path: '/events', icon: <EventIcon /> },
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { label: 'Contacto', path: '/contact', icon: <ContactIcon /> },
      ];
    }

    if (isRegularUser) {
      return [
        ...baseItems,
        { label: 'Eventos', path: '/events', icon: <EventIcon /> },
        { label: 'Mis Certificados', path: '/certificates', icon: <SchoolIcon /> },
        { label: 'Contacto', path: '/contact', icon: <ContactIcon /> },
      ];
    }

    // Not authenticated or no specific role
    return [
      ...baseItems,
      { label: 'Eventos', path: '/events', icon: <EventIcon /> },
      { label: 'Contacto', path: '/contact', icon: <ContactIcon /> },
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
      <GlassmorphismAppBar
        position="fixed"
        sx={{
          background: isScrolled
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: isScrolled
            ? '0 4px 20px rgba(0, 0, 0, 0.1)'
            : '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 0,
              mr: 4,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <BusinessIcon sx={{ fontSize: 28 }} />
            TradeConnect
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box component={"div" as any} sx={{
              flexGrow: 1,
              display: 'flex',
              gap: isTablet ? 1 : 2,
              // Tablet responsive
              ...(isTablet && {
                '& .MuiButton-root': {
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  '& .MuiButton-startIcon': {
                    marginRight: '4px',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1rem',
                    },
                  },
                },
              }),
            }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    borderBottom: location.pathname === item.path ? 2 : 0,
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(107, 30, 34, 0.1)',
                    },
                    // Responsive text
                    display: isTablet && item.label.length > 8 ? 'none' : 'flex',
                    [theme.breakpoints.down('lg')]: {
                      '& .MuiButton-startIcon': {
                        marginRight: '4px',
                      },
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Search Bar */}
          <Box component={"div" as any} sx={{
            flexGrow: 1,
            maxWidth: isTablet ? 300 : 400,
            // Hide search on mobile, show only on tablet+
            display: isMobile ? 'none' : 'block',
          }}>
            <form onSubmit={handleSearch}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder={t('events.search')}
                  inputProps={{ 'aria-label': 'search' }}
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </Search>
            </form>
          </Box>

          {/* Right Side Actions */}
          <Box component={"div" as any} sx={{
            display: 'flex',
            alignItems: 'center',
            gap: isTablet ? 0.5 : 1,
          }}>
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
              <>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(107, 30, 34, 0.1)',
                    },
                    // Smaller on tablet
                    ...(isTablet && {
                      padding: '8px',
                      '& .MuiAvatar-root': {
                        width: 28,
                        height: 28,
                      },
                    }),
                  }}
                >
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                  >
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={profileMenuAnchor}
                  open={Boolean(profileMenuAnchor)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: isTablet ? 180 : 220,
                    },
                  }}
                >
                  {/* Common profile option for all users */}
                  <MenuItem component={Link} to="/profile" onClick={handleProfileMenuClose}>
                    <PersonIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                    Mi Perfil
                  </MenuItem>

                  {/* Speaker-specific menu items */}
                  {isSpeaker && [
                    <MenuItem key="speaker-events" component={Link} to="/speaker/events" onClick={handleProfileMenuClose}>
                      <EventIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                      Mis Eventos
                    </MenuItem>,
                    <MenuItem key="speaker-schedule" component={Link} to="/speaker/schedule" onClick={handleProfileMenuClose}>
                      <CalendarIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                      Mi Agenda
                    </MenuItem>,
                    <MenuItem key="speaker-profile" component={Link} to="/speaker/profile" onClick={handleProfileMenuClose}>
                      <PersonIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                      Perfil de Speaker
                    </MenuItem>
                  ]}

                  {/* Operator-specific menu items */}
                  {isOperator && (
                    <MenuItem component={Link} to="/operator/checkin" onClick={handleProfileMenuClose}>
                      <QrCodeIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                      Check-in QR
                    </MenuItem>
                  )}

                  {/* Regular user menu items */}
                  {isRegularUser && !isAdmin && !isSpeaker && (
                    <MenuItem component={Link} to="/certificates" onClick={handleProfileMenuClose}>
                      <SchoolIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                      Mis Certificados
                    </MenuItem>
                  )}

                  {/* Admin Menu Items - Only visible for admin users */}
                  {isAdmin && [
                    <MenuItem
                      key="admin-dashboard"
                      component={Link}
                      to="/dashboard?tab=0"
                      onClick={handleProfileMenuClose}
                      sx={{
                        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                        mt: 1,
                        pt: 1.5
                      }}
                    >
                      <DashboardIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                      Dashboard
                    </MenuItem>,
                    <MenuItem key="admin-events" component={Link} to="/dashboard?tab=1" onClick={handleProfileMenuClose}>
                      <EventIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                      Gestión de Eventos
                    </MenuItem>,
                    <MenuItem key="admin-users" component={Link} to="/dashboard?tab=2" onClick={handleProfileMenuClose}>
                      <ManageAccountsIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                      Gestión de Usuarios
                    </MenuItem>,
                    <MenuItem key="admin-reports" component={Link} to="/dashboard?tab=3" onClick={handleProfileMenuClose}>
                      <AssessmentIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                      Reportes
                    </MenuItem>
                  ]}

                  {/* Logout - always visible */}
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                      mt: 1,
                      pt: 1.5
                    }}
                  >
                    <LogoutIcon sx={{ mr: 1, fontSize: isTablet ? '1rem' : '1.2rem' }} />
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box component={"div" as any} sx={{
                display: 'flex',
                gap: isTablet ? 0.5 : 1,
                // Stack vertically on mobile, hide register button
                ...(isMobile && {
                  flexDirection: 'column',
                  gap: 0,
                  '& .MuiButton-root': {
                    display: 'none',
                  },
                  '& .MuiButton-root:first-of-type': {
                    display: 'flex',
                  },
                }),
              }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size={isTablet ? "small" : "medium"}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                    // Smaller text on tablet
                    fontSize: isTablet ? '0.8rem' : '0.875rem',
                    padding: isTablet ? '4px 12px' : '6px 16px',
                  }}
                >
                  {t('nav.login')}
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size={isTablet ? "small" : "medium"}
                  sx={{
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    // Smaller text on tablet
                    fontSize: isTablet ? '0.8rem' : '0.875rem',
                    padding: isTablet ? '4px 12px' : '6px 16px',
                  }}
                >
                  {t('nav.register')}
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(107, 30, 34, 0.1)',
                  },
                  padding: '8px',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </GlassmorphismAppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: '280px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          },
        }}
      >
        <Box component={"div" as any} sx={{ width: '100%', pt: 2 }}>
          {/* Mobile Search */}
          <Box component={"div" as any} sx={{ px: 2, pb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('events.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Box>

          <List sx={{ pt: 1 }}>
            {navigationItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  selected={location.pathname === item.path}
                  sx={{
                    py: 1.5,
                    px: 3,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(107, 30, 34, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(107, 30, 34, 0.15)',
                      },
                    },
                  }}
                >
                  <Box component={"div" as any} sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '1rem',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            {/* Language selector in mobile menu */}
            <ListItem sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', mt: 1 }}>
              <Box component={"div" as any} sx={{ width: '100%', px: 1 }}>
                <LanguageSelector />
              </Box>
            </ListItem>

            {!isAuthenticated && (
              <>
                <ListItem disablePadding sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', mt: 1 }}>
                  <ListItemButton
                    component={Link}
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{ py: 1.5, px: 3 }}
                  >
                    <PersonIcon sx={{ mr: 2 }} />
                    <ListItemText primary={t('nav.login')} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{ py: 1.5, px: 3 }}
                  >
                    <PersonIcon sx={{ mr: 2 }} />
                    <ListItemText primary={t('nav.register')} />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Box component={"div" as any} sx={{ height: 64 }} />
    </>
  );
};

export default Navbar;