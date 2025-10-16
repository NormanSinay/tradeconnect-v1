import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Divider,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Assignment as RegistrationsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  EventNote,
  Category,
  EmojiEvents,
  Payment,
  CardGiftcard,
  QrCode,
  CardMembership,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  path: string;
  roles?: string[];
  children?: MenuItem[];
}

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth?: number;
  userRole?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  open,
  onClose,
  drawerWidth = 280,
  userRole = 'admin',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  // Menu items configuration
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
    },
    {
      title: 'Eventos y Cursos',
      icon: <EventIcon />,
      path: '/admin/events',
      children: [
        { title: 'Todos los Eventos', icon: <EventNote />, path: '/admin/events' },
        { title: 'Categorías', icon: <Category />, path: '/admin/events/categories' },
        { title: 'Speakers', icon: <EmojiEvents />, path: '/admin/events/speakers' },
      ],
    },
    {
      title: 'Usuarios',
      icon: <PeopleIcon />,
      path: '/admin/users',
      roles: ['admin', 'super_admin'],
    },
    {
      title: 'Inscripciones',
      icon: <RegistrationsIcon />,
      path: '/admin/registrations',
    },
    {
      title: 'Pagos',
      icon: <Payment />,
      path: '/admin/payments',
      roles: ['admin', 'super_admin', 'manager'],
    },
    {
      title: 'Promociones',
      icon: <CardGiftcard />,
      path: '/admin/promotions',
    },
    {
      title: 'QR & Acceso',
      icon: <QrCode />,
      path: '/admin/qr-access',
    },
    {
      title: 'Certificados',
      icon: <CardMembership />,
      path: '/admin/certificates',
    },
    {
      title: 'Reportes',
      icon: <ReportsIcon />,
      path: '/admin/reports',
    },
    {
      title: 'Configuración',
      icon: <SettingsIcon />,
      path: '/admin/settings',
      roles: ['admin', 'super_admin'],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(userRole);
  });

  const handleExpandClick = (title: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.title];
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={hasChildren ? 'div' : Link}
            to={hasChildren ? undefined : item.path}
            onClick={hasChildren ? () => handleExpandClick(item.title) : undefined}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              pl: depth > 0 ? 4 : 2.5,
              backgroundColor: active ? `${theme.palette.primary.main}15` : 'transparent',
              borderLeft: active ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              '&:hover': {
                backgroundColor: active
                  ? `${theme.palette.primary.main}25`
                  : theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: active ? theme.palette.primary.main : theme.palette.text.secondary,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              sx={{
                opacity: open ? 1 : 0,
                color: active ? theme.palette.primary.main : theme.palette.text.primary,
                '& .MuiTypography-root': {
                  fontWeight: active ? 600 : 400,
                },
              }}
            />
            {hasChildren && open && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={!!(isExpanded && open)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box component={"div" as any} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: [1],
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        }}
      >
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                TradeConnect
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Panel de Administración
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
        {!isMobile && (
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Toolbar>

      <Divider />

      {/* Menu Items */}
      <List sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 2 }}>
        {filteredMenuItems.map((item) => renderMenuItem(item))}
      </List>

      <Divider />

      {/* Footer */}
      <Box
        component={"div" as any}
        sx={{
          p: 2,
          textAlign: 'center',
          display: open ? 'block' : 'none',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          TradeConnect v1.0
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          © 2025 Todos los derechos reservados
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: open ? drawerWidth : theme.spacing(9),
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : theme.spacing(9),
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          boxShadow: theme.shadows[3],
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AdminSidebar;
