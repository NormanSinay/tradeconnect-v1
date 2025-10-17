import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Chip } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Toaster } from 'react-hot-toast';

/**
 * AdminLayout - Layout especial para Super Admins sin navbar público
 * Proporciona acceso completo a todas las funcionalidades administrativas
 * desde una vista dedicada sin distracciones del sitio público
 */
const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null);

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

  const handleGoToPublicSite = () => {
    handleProfileMenuClose();
    navigate('/');
  };

  const handleGoToProfile = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  return (
    <Box
      component="div"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Admin Header - Minimal y profesional */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'primary.main',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          {/* Logo y título */}
          <Box
            component="div"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexGrow: 1,
            }}
          >
            <BusinessIcon sx={{ fontSize: 32 }} />
            <Box component="div">
              <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                TradeConnect
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Panel de Administración
              </Typography>
            </Box>
          </Box>

          {/* User info y rol */}
          <Box
            component="div"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              component="div"
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                alignItems: 'flex-end',
                mr: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Chip
                label={user?.roles?.[0] === 'super_admin' ? 'Super Admin' : user?.roles?.[0]}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            </Box>

            {/* Profile button */}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>

            {/* Profile Menu */}
            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 220,
                },
              }}
            >
              {/* User info in menu (mobile) */}
              <Box
                component="div"
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
                <Box component="div" sx={{ mt: 0.5 }}>
                  <Chip
                    label={user?.roles?.[0] === 'super_admin' ? 'Super Admin' : user?.roles?.[0]}
                    size="small"
                    color="primary"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              </Box>

              <MenuItem onClick={handleGoToProfile}>
                <PersonIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Mi Perfil
              </MenuItem>

              <MenuItem onClick={handleGoToPublicSite}>
                <HomeIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Ir al Sitio Público
              </MenuItem>

              <MenuItem
                onClick={handleLogout}
                sx={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  mt: 1,
                  pt: 1.5,
                  color: 'error.main',
                }}
              >
                <LogoutIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content - Sin navbar, solo el contenido administrativo */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          mt: 8, // Espacio para el AppBar fijo
        }}
      >
        <Outlet />
      </Box>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Box>
  );
};

export default AdminLayout;
