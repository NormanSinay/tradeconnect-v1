/**
 * @fileoverview AdminSidebar - Componente de navegación lateral para panel de administración
 *
 * Arquitectura Recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @version 1.0.0
 * @author TradeConnect Team
 * @license MIT
 */

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard as DashboardIcon,
  Calendar as EventIcon,
  Users as PeopleIcon,
  FileText as RegistrationsIcon,
  BarChart3 as ReportsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Tag,
  Trophy,
  CreditCard,
  Gift,
  QrCode,
  Award,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const isMobile = false; // Simplified for now

  // Menu items configuration
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon className="h-4 w-4" />,
      path: '/admin/dashboard',
    },
    {
      title: 'Eventos y Cursos',
      icon: <EventIcon className="h-4 w-4" />,
      path: '/admin/events',
      children: [
        { title: 'Todos los Eventos', icon: <CalendarDays className="h-4 w-4" />, path: '/admin/events' },
        { title: 'Categorías', icon: <Tag className="h-4 w-4" />, path: '/admin/events/categories' },
        { title: 'Speakers', icon: <Trophy className="h-4 w-4" />, path: '/admin/events/speakers' },
      ],
    },
    {
      title: 'Usuarios',
      icon: <PeopleIcon className="h-4 w-4" />,
      path: '/admin/users',
      roles: ['admin', 'super_admin'],
    },
    {
      title: 'Inscripciones',
      icon: <RegistrationsIcon className="h-4 w-4" />,
      path: '/admin/registrations',
    },
    {
      title: 'Pagos',
      icon: <CreditCard className="h-4 w-4" />,
      path: '/admin/payments',
      roles: ['admin', 'super_admin', 'manager'],
    },
    {
      title: 'Promociones',
      icon: <Gift className="h-4 w-4" />,
      path: '/admin/promotions',
    },
    {
      title: 'QR & Acceso',
      icon: <QrCode className="h-4 w-4" />,
      path: '/admin/qr-access',
    },
    {
      title: 'Certificados',
      icon: <Award className="h-4 w-4" />,
      path: '/admin/certificates',
    },
    {
      title: 'Reportes',
      icon: <ReportsIcon className="h-4 w-4" />,
      path: '/admin/reports',
    },
    {
      title: 'Configuración',
      icon: <SettingsIcon className="h-4 w-4" />,
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
        <div className="block p-0">
          <Button
            variant={active ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-12 px-2.5",
              active && "bg-primary/10 border-l-4 border-primary",
              depth > 0 && "pl-4"
            )}
            asChild={!hasChildren}
            onClick={hasChildren ? () => handleExpandClick(item.title) : undefined}
          >
            {hasChildren ? (
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center min-w-0 mr-3">
                  {item.icon}
                </div>
                <span className={cn("flex-1 text-left", !open && "hidden")}>
                  {item.title}
                </span>
                {hasChildren && open && (
                  isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </div>
            ) : (
              <Link to={item.path} className="flex items-center w-full">
                <div className="flex items-center justify-center min-w-0 mr-3">
                  {item.icon}
                </div>
                <span className={cn("flex-1 text-left", !open && "hidden")}>
                  {item.title}
                </span>
              </Link>
            )}
          </Button>
        </div>

        {hasChildren && isExpanded && open && (
          <div className="pl-4">
            {item.children!.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-bold whitespace-nowrap">
                TradeConnect
              </h2>
              <p className="text-xs opacity-90">
                Panel de Administración
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/10">
            {open ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <Separator />

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {filteredMenuItems.map((item) => renderMenuItem(item))}
      </div>

      <Separator />

      {/* Footer */}
      <div className={cn("p-2 text-center", !open && "hidden")}>
        <p className="text-xs text-muted-foreground">
          TradeConnect v1.0
        </p>
        <p className="text-xs text-muted-foreground block">
          © 2025 Todos los derechos reservados
        </p>
      </div>
    </div>
  );

  return (
    <Sheet open={isMobile ? open : true} onOpenChange={onClose}>
      <SheetContent side="left" className={cn("p-0", open ? "w-70" : "w-16")}>
        {drawerContent}
      </SheetContent>
    </Sheet>
  );
};

export default AdminSidebar;
