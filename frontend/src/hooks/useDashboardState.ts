import { useState, useCallback, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { DashboardService } from '@/services/dashboardService';
import { BarChart3, Users, Calendar, DollarSign, FileText, Megaphone, Ticket, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  activeEvents: number;
  totalCourses: number;
  totalRevenue: number;
  userSatisfaction: number;
  incidentReports: number;
}

interface NavigationItem {
  id: string;
  icon: any;
  label: string;
  enabled: boolean;
}

interface QuickAction {
  icon: any;
  title: string;
  desc: string;
  action: () => void;
  enabled: boolean;
}

/**
 * Hook personalizado para manejar el estado del dashboard administrativo
 * Centraliza la lógica de estado, permisos y acciones del dashboard
 */
export const useDashboardState = () => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  // Estados principales
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeEvents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    userSatisfaction: 0,
    incidentReports: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados derivados memoizados
  const navigationItems = useMemo<NavigationItem[]>(() => [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard Principal', enabled: true },
    { id: 'usuarios', icon: Users, label: 'Gestión de Usuarios', enabled: permissions.canManageUsers },
    { id: 'events', icon: Calendar, label: 'Gestión de Eventos', enabled: permissions.canManageEvents },
    { id: 'finance', icon: DollarSign, label: 'Gestión Financiera', enabled: permissions.canManageFinance },
    { id: 'content', icon: FileText, label: 'Gestión de Contenido', enabled: permissions.canManageContent },
    { id: 'marketing', icon: Megaphone, label: 'Gestión de Marketing', enabled: permissions.canManageMarketing },
    { id: 'advanced-coupons', icon: Ticket, label: 'Gestión de Cupones', enabled: permissions.canManageMarketing },
    { id: 'analytics', icon: TrendingUp, label: 'Analítica', enabled: true }
  ].filter(item => item.enabled !== false), [permissions]);

  const quickActions = useMemo<QuickAction[]>(() => [
    {
      icon: Users,
      title: 'Crear Usuario',
      desc: 'Agregar nuevo usuario',
      action: () => {
        setActiveTab('usuarios');
        toast.success('Redirigiendo a gestión de usuarios');
      },
      enabled: permissions.canManageUsers
    },
    {
      icon: Calendar,
      title: 'Crear Evento',
      desc: 'Publicar nuevo evento',
      action: () => {
        setActiveTab('events');
        toast.success('Redirigiendo a gestión de eventos');
      },
      enabled: permissions.canManageEvents
    },
    {
      icon: TrendingUp,
      title: 'Ver Analítica',
      desc: 'Revisar métricas detalladas',
      action: () => {
        setActiveTab('analytics');
        toast.success('Cargando analítica del sistema');
      },
      enabled: true
    },
    {
      icon: FileText,
      title: 'Gestionar Contenido',
      desc: 'Administrar páginas y artículos',
      action: () => {
        setActiveTab('content');
        toast.success('Redirigiendo a gestión de contenido');
      },
      enabled: permissions.canManageContent
    }
  ].filter(item => item.enabled !== false), [permissions, setActiveTab]);

  // Funciones de carga de datos
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const loadData = withErrorHandling(async () => {
        const [systemMetrics, salesReport] = await Promise.all([
          DashboardService.getSystemMetrics(),
          DashboardService.getSalesReport()
        ]);

        setStats({
          totalUsers: systemMetrics.totalUsers || 0,
          activeEvents: systemMetrics.activeEvents || 0,
          totalCourses: systemMetrics.totalCourses || 0,
          totalRevenue: salesReport.totalRevenue || 0,
          userSatisfaction: systemMetrics.userSatisfaction || 0,
          incidentReports: systemMetrics.incidentReports || 0
        });
      }, 'Error al cargar los datos del dashboard');

      await loadData();
    } catch (error) {
      console.error('Error in loadDashboardData:', error);
      setStats({
        totalUsers: 0,
        activeEvents: 0,
        totalCourses: 0,
        totalRevenue: 0,
        userSatisfaction: 0,
        incidentReports: 0
      });
    } finally {
      setLoading(false);
    }
  }, [withErrorHandling]);

  // Funciones de formateo
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  }, []);

  return {
    // Estados
    activeTab,
    setActiveTab,
    stats,
    loading,

    // Datos derivados
    navigationItems,
    quickActions,

    // Funciones
    loadDashboardData,
    formatCurrency
  };
};