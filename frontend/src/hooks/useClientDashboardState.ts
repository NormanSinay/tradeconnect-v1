import { useState, useCallback, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { UserService, UserStats } from '@/services/userService';
import { DashboardService } from '@/services/dashboardService';
import { ClientDashboardService } from '@/services/clientDashboardService';
import {
  Briefcase,
  CreditCard,
  FileText,
  Award,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ClientDashboardStats extends UserStats {
  clientRegistrations: number;
  clientPayments: number;
  clientFelInvoices: number;
  clientCertificates: number;
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
 * Hook personalizado para manejar el estado del dashboard de cliente
 * Centraliza la lógica de estado, permisos y acciones del dashboard de cliente
 */
export const useClientDashboardState = () => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  // Estados principales
  const [activeTab, setActiveTab] = useState('client-registrations');
  const [stats, setStats] = useState<ClientDashboardStats>({
    activeEvents: 0,
    completedEvents: 0,
    certificates: 0,
    trainingHours: 0,
    clientRegistrations: 0,
    clientPayments: 0,
    clientFelInvoices: 0,
    clientCertificates: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados derivados memoizados
  const navigationItems = useMemo<NavigationItem[]>(() => [
    { id: 'client-registrations', icon: Calendar, label: 'Mis Inscripciones', enabled: true },
    { id: 'client-payments', icon: CreditCard, label: 'Mis Pagos', enabled: true },
    { id: 'client-fel', icon: FileText, label: 'Facturas FEL', enabled: true },
    { id: 'client-certificates', icon: Award, label: 'Mis Certificados', enabled: true }
  ].filter(item => item.enabled !== false), [permissions]);

  const quickActions = useMemo<QuickAction[]>(() => [
    {
      icon: Calendar,
      title: 'Nueva Inscripción',
      desc: 'Inscribirme a eventos',
      action: () => setActiveTab('client-registrations'),
      enabled: true
    },
    {
      icon: CreditCard,
      title: 'Ver Pagos',
      desc: 'Historial de pagos',
      action: () => setActiveTab('client-payments'),
      enabled: true
    },
    {
      icon: FileText,
      title: 'Facturas FEL',
      desc: 'Mis facturas electrónicas',
      action: () => setActiveTab('client-fel'),
      enabled: true
    },
    {
      icon: Award,
      title: 'Certificados',
      desc: 'Mis certificados obtenidos',
      action: () => setActiveTab('client-certificates'),
      enabled: true
    }
  ].filter(item => item.enabled !== false), [permissions]);

  // Funciones de carga de datos
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const loadData = withErrorHandling(async () => {
        const [userStats, clientRegistrations, clientPayments, clientFelInvoices, clientCertificates] = await Promise.all([
          UserService.getUserStats(),
          ClientDashboardService.getClientRegistrations().catch(() => []),
          ClientDashboardService.getClientPayments().catch(() => []),
          ClientDashboardService.getClientFelInvoices().catch(() => []),
          ClientDashboardService.getClientCertificates().catch(() => [])
        ]);

        setStats({
          ...userStats,
          clientRegistrations: clientRegistrations.length,
          clientPayments: clientPayments.filter(p => p.status === 'completed').length,
          clientFelInvoices: clientFelInvoices.filter(i => i.status === 'issued').length,
          clientCertificates: clientCertificates.filter(c => c.status === 'issued').length
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
        clientRegistrations: 0,
        clientPayments: 0,
        clientFelInvoices: 0,
        clientCertificates: 0
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