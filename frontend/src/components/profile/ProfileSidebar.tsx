import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Calendar,
  GraduationCap,
  Receipt,
  Settings,
  Lock,
  Shield,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfileSection =
  | 'profile'
  | 'events'
  | 'certificates'
  | 'payment-history'
  | 'settings'
  | 'change-password'
  | '2fa';

interface ProfileSidebarProps {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface MenuItem {
  id: ProfileSection;
  label: string;
  icon: React.ReactElement;
}

const menuItems: MenuItem[] = [
  {
    id: 'profile',
    label: 'Mi Perfil',
    icon: <Person />,
  },
  {
    id: 'events',
    label: 'Mis Eventos',
    icon: <Event />,
  },
  {
    id: 'certificates',
    label: 'Certificados',
    icon: <School />,
  },
  {
    id: 'payment-history',
    label: 'Historial de Pagos',
    icon: <Receipt />,
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: <Settings />,
  },
  {
    id: 'change-password',
    label: 'Cambiar Contraseña',
    icon: <Lock />,
  },
  {
    id: '2fa',
    label: 'Autenticación 2FA',
    icon: <Shield />,
  },
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeSection,
  onSectionChange,
  mobileOpen = false,
  onMobileClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSectionClick = (section: ProfileSection) => {
    onSectionChange(section);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <Box component={"div" as any} sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      {/* Mobile Header */}
      {isMobile && (
        <Box
          component={"div" as any}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Mi Perfil
          </Typography>
          <IconButton onClick={onMobileClose} edge="end">
            <Close />
          </IconButton>
        </Box>
      )}

      {/* Menu Items */}
      <List sx={{ py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeSection === item.id}
              onClick={() => handleSectionClick(item.id)}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: activeSection === item.id ? 'inherit' : 'action.active',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: activeSection === item.id ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop permanent sidebar
  return (
    <Box
      component={"div" as any}
      sx={{
        position: 'sticky',
        top: 80,
        height: 'fit-content',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default ProfileSidebar;
