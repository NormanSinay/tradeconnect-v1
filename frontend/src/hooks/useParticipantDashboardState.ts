import { useState, useCallback, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { UserService, UserStats } from '@/services/userService';
import { DashboardService } from '@/services/dashboardService';
import { ParticipantDashboardService } from '@/services/participantDashboardService';
import {
  Users,
  CheckCircle,
  Award,
  QrCode,
  Star,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ParticipantDashboardStats extends UserStats {
  activeParticipation: number;
  attendanceValidated: number;
  certificatesReceived: number;
  pendingEvaluations: number;
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
 * Hook personalizado para manejar el estado del dashboard de participante
 * Centraliza la lógica de estado, permisos y acciones del dashboard de participante
 */
export const useParticipantDashboardState = () => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  // Estados principales
  const [activeTab, setActiveTab] = useState('active-participation');
  const [stats, setStats] = useState<ParticipantDashboardStats>({
    activeEvents: 0,
    completedEvents: 0,
    certificates: 0,
    trainingHours: 0,
    activeParticipation: 0,
    attendanceValidated: 0,
    certificatesReceived: 0,
    pendingEvaluations: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados derivados memoizados
  const navigationItems = useMemo<NavigationItem[]>(() => [
    { id: 'active-participation', icon: Users, label: 'Participación Activa', enabled: true },
    { id: 'attendance-validation', icon: CheckCircle, label: 'Validación de Asistencia', enabled: true },
    { id: 'certificates', icon: Award, label: 'Recepción de Certificados', enabled: true },
    { id: 'evaluations', icon: Star, label: 'Encuestas de Satisfacción', enabled: true }
  ].filter(item => item.enabled !== false), [permissions]);

  const quickActions = useMemo<QuickAction[]>(() => [
    {
      icon: QrCode,
      title: 'Validar Asistencia',
      desc: 'Escanear código QR',
      action: () => setActiveTab('attendance-validation'),
      enabled: true
    },
    {
      icon: Award,
      title: 'Mis Certificados',
      desc: 'Ver certificados recibidos',
      action: () => setActiveTab('certificates'),
      enabled: true
    },
    {
      icon: Star,
      title: 'Evaluar Eventos',
      desc: 'Completar encuestas',
      action: () => setActiveTab('evaluations'),
      enabled: true
    },
    {
      icon: Calendar,
      title: 'Mi Participación',
      desc: 'Eventos activos',
      action: () => setActiveTab('active-participation'),
      enabled: true
    }
  ].filter(item => item.enabled !== false), [permissions]);

  // Funciones de carga de datos
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const loadData = withErrorHandling(async () => {
        const [userStats, activeParticipation, attendanceHistory, availableCertificates, pendingSurveys] = await Promise.all([
          UserService.getUserStats(),
          ParticipantDashboardService.getActiveParticipation().catch(() => []),
          ParticipantDashboardService.getAttendanceHistory().catch(() => []),
          ParticipantDashboardService.getAvailableCertificates().catch(() => []),
          ParticipantDashboardService.getPendingSurveys().catch(() => [])
        ]);

        setStats({
          ...userStats,
          activeParticipation: activeParticipation.length,
          attendanceValidated: attendanceHistory.filter(a => a.status === 'valid').length,
          certificatesReceived: availableCertificates.filter(c => c.status === 'issued').length,
          pendingEvaluations: pendingSurveys.length
        });
      }, 'Error al cargar los datos del dashboard');

      await loadData();
    } catch (error) {
      console.error('Error in loadDashboardData:', error);
      setStats({
        activeEvents: 0,
        completedEvents: 0,
        certificates: 0,
        trainingHours: 0,
        activeParticipation: 0,
        attendanceValidated: 0,
        certificatesReceived: 0,
        pendingEvaluations: 0
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