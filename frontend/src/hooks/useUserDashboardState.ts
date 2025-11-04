import { useState, useCallback, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { UserService, UserStats } from '@/services/userService';
import { DashboardService } from '@/services/dashboardService';
import { UserDashboardService } from '@/services/userDashboardService';
import {
  Calendar,
  CheckCircle,
  Award,
  Clock,
  QrCode,
  Star,
  BookOpen,
  CreditCard,
  Download,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserDashboardStats extends UserStats {
  availableEvents: number;
  pendingPayments: number;
  qrCodesGenerated: number;
  completedEvaluations: number;
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
 * Hook personalizado para manejar el estado del dashboard de usuario regular
 * Centraliza la lógica de estado, permisos y acciones del dashboard de usuario
 */
export const useUserDashboardState = () => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  // Estados principales
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<UserDashboardStats>({
    activeEvents: 0,
    completedEvents: 0,
    certificates: 0,
    trainingHours: 0,
    availableEvents: 0,
    pendingPayments: 0,
    qrCodesGenerated: 0,
    completedEvaluations: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados derivados memoizados
  const navigationItems = useMemo<NavigationItem[]>(() => [
    { id: 'overview', icon: BookOpen, label: 'Vista General', enabled: true },
    { id: 'events', icon: Calendar, label: 'Catálogo de Eventos', enabled: permissions.canViewEvents },
    { id: 'registrations', icon: CreditCard, label: 'Mis Inscripciones', enabled: true },
    { id: 'certificates', icon: Award, label: 'Mis Certificados', enabled: true },
    { id: 'qr-codes', icon: QrCode, label: 'Códigos QR', enabled: true },
    { id: 'evaluations', icon: Star, label: 'Evaluaciones', enabled: true }
  ].filter(item => item.enabled !== false), [permissions]);

  const quickActions = useMemo<QuickAction[]>(() => [
    {
      icon: Calendar,
      title: 'Explorar Eventos',
      desc: 'Ver catálogo disponible',
      action: () => setActiveTab('events'),
      enabled: permissions.canViewEvents
    },
    {
      icon: CreditCard,
      title: 'Ver Inscripciones',
      desc: 'Mis registros activos',
      action: () => setActiveTab('registrations'),
      enabled: true
    },
    {
      icon: Download,
      title: 'Descargar QR',
      desc: 'Códigos de acceso',
      action: () => setActiveTab('qr-codes'),
      enabled: true
    },
    {
      icon: Star,
      title: 'Evaluar Eventos',
      desc: 'Dar feedback',
      action: () => setActiveTab('evaluations'),
      enabled: true
    }
  ].filter(item => item.enabled !== false), [permissions]);

  // Funciones de carga de datos
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [userStats, availableEvents, userRegistrations, userCertificates, userQrCodes, userEvaluations] = await Promise.all([
        UserService.getUserStats().catch(() => ({
          activeEvents: 0,
          completedEvents: 0,
          certificates: 0,
          trainingHours: 0
        })),
        UserDashboardService.getAvailableEvents().catch(() => []),
        UserDashboardService.getUserRegistrations().catch(() => []),
        UserDashboardService.getUserCertificates().catch(() => []),
        UserDashboardService.getUserQrCodes().catch(() => []),
        UserDashboardService.getUserEvaluations().catch(() => [])
      ]);

      setStats({
        ...userStats,
        availableEvents: availableEvents.length,
        pendingPayments: userRegistrations.filter(r => r.paymentStatus === 'pending').length,
        qrCodesGenerated: userQrCodes.length,
        completedEvaluations: userEvaluations.filter(e => e.status === 'completed').length
      });
    } catch (error) {
      console.error('Error in loadDashboardData:', error);
      setStats({
        activeEvents: 0,
        completedEvents: 0,
        certificates: 0,
        trainingHours: 0,
        availableEvents: 0,
        pendingPayments: 0,
        qrCodesGenerated: 0,
        completedEvaluations: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Funciones de formateo
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  }, []);

  const formatHours = useCallback((hours: number) => {
    return `${hours}h`;
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
    formatCurrency,
    formatHours
  };
};