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
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { styled, alpha } from '@mui/material/styles';

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
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
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

  const navigationItems = [
    { label: 'Inicio', path: '/', icon: <EventIcon /> },
    { label: 'Eventos', path: '/events', icon: <EventIcon /> },
    { label: 'Speakers', path: '/speakers', icon: <PersonIcon /> },
    { label: 'Catálogo', path: '/catalog', icon: <SchoolIcon /> },
    ...(isAuthenticated && user?.role === 'admin' ? [{ label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> }] : []),
  ];

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
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
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
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
            <form onSubmit={handleSearch}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Buscar eventos..."
                  inputProps={{ 'aria-label': 'search' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Search>
            </form>
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Cart */}
            <IconButton
              component={Link}
              to="/cart"
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(107, 30, 34, 0.1)',
                },
              }}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <CartIcon />
              </Badge>
            </IconButton>

            {/* Profile/Login */}
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(107, 30, 34, 0.1)',
                    },
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
                      minWidth: 200,
                    },
                  }}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleProfileMenuClose}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Mi Perfil
                  </MenuItem>
                  <MenuItem component={Link} to="/certificates" onClick={handleProfileMenuClose}>
                    <SchoolIcon sx={{ mr: 1 }} />
                    Mis Certificados
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={{
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  Registrarse
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
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  selected={location.pathname === item.path}
                >
                  {item.icon}
                  <ListItemText primary={item.label} sx={{ ml: 2 }} />
                </ListItemButton>
              </ListItem>
            ))}

            {!isAuthenticated && (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <PersonIcon />
                    <ListItemText primary="Iniciar Sesión" sx={{ ml: 2 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <PersonIcon />
                    <ListItemText primary="Registrarse" sx={{ ml: 2 }} />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Box sx={{ height: 64 }} />
    </>
  );
};

export default Navbar;