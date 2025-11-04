import { useState, useCallback, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { SpeakerDashboardService, SpeakerStats } from '@/services/speakerDashboardService';
import {
  Calendar,
  FileText,
  User,
  Bell,
  CheckCircle,
  Upload,
  Edit,
  Eye,
  Star,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

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
 * Hook personalizado para manejar el estado del dashboard de speaker
 * Centraliza la lógica de estado, permisos y acciones del dashboard de speaker
 */
export const useSpeakerDashboardState = () => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  // Estados principales
  const [activeTab, setActiveTab] = useState('assigned-events');
  const [stats, setStats] = useState<SpeakerStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalMaterials: 0,
    unreadNotifications: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados derivados memoizados
  const navigationItems = useMemo<NavigationItem[]>(() => [
    { id: 'assigned-events', icon: Calendar, label: 'Eventos Asignados', enabled: true },
    { id: 'materials', icon: FileText, label: 'Material', enabled: true },
    { id: 'profile', icon: User, label: 'Perfil', enabled: true },
    { id: 'notifications', icon: Bell, label: 'Notificaciones', enabled: true }
  ].filter(item => item.enabled !== false), [permissions]);

  const quickActions = useMemo<QuickAction[]>(() => [
    {
      icon: Eye,
      title: 'Ver Eventos',
      desc: 'Revisar eventos asignados',
      action: () => {
        setActiveTab('assigned-events');
        toast.success('Cargando eventos asignados');
      },
      enabled: true
    },
    {
      icon: Upload,
      title: 'Subir Material',
      desc: 'Agregar presentaciones o documentos',
      action: () => {
        setActiveTab('materials');
        toast.success('Redirigiendo a gestión de materiales');
      },
      enabled: true
    },
    {
      icon: Edit,
      title: 'Actualizar Perfil',
      desc: 'Editar información personal',
      action: () => {
        setActiveTab('profile');
        toast.success('Redirigiendo a perfil de speaker');
      },
      enabled: true
    },
    {
      icon: Bell,
      title: 'Ver Notificaciones',
      desc: 'Revisar mensajes y alertas',
      action: () => {
        setActiveTab('notifications');
        toast.success('Cargando notificaciones');
      },
      enabled: true
    }
  ].filter(item => item.enabled !== false), [permissions]);

  // Funciones de carga de datos
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const loadData = withErrorHandling(async () => {
        const speakerStats = await SpeakerDashboardService.getSpeakerStats();

        setStats({
          totalEvents: speakerStats.totalEvents || 0,
          upcomingEvents: speakerStats.upcomingEvents || 0,
          completedEvents: speakerStats.completedEvents || 0,
          totalEarnings: speakerStats.totalEarnings || 0,
          averageRating: speakerStats.averageRating || 0,
          totalMaterials: speakerStats.totalMaterials || 0,
          unreadNotifications: speakerStats.unreadNotifications || 0
        });
      }, 'Error al cargar los datos del dashboard');

      await loadData();
    } catch (error) {
      console.error('Error in loadDashboardData:', error);
      setStats({
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalMaterials: 0,
        unreadNotifications: 0
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

  const formatRating = useCallback((rating: number) => {
    return rating.toFixed(1);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
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
    formatRating,
    formatDate
  };
};