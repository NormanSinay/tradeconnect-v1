import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DashboardService } from '@/services/dashboardService';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import AdvancedUserManagementTab from '@/components/dashboard/AdvancedUserManagementTab';
import EventManagementTab from '@/components/dashboard/EventManagementTab';
import FinanceManagementTab from '@/components/dashboard/FinanceManagementTab';
import SystemManagementTab from '@/components/dashboard/SystemManagementTab';
import AuditLogsTab from '@/components/dashboard/AuditLogsTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import AdvancedCouponsTab from '@/components/dashboard/AdvancedCouponsTab';
import ContentManagementTab from '@/components/dashboard/ContentManagementTab';
import MarketingManagementTab from '@/components/dashboard/MarketingManagementTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Users, Calendar, BookOpen, DollarSign, TrendingUp, AlertTriangle, Settings, Search, Plus, BarChart3, FileText, Megaphone, UserCheck, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  activeEvents: number;
  totalCourses: number;
  totalRevenue: number;
  userSatisfaction: number;
  incidentReports: number;
}


const DashboardSuperAdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();
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

  // Verificar permisos de super admin
  useEffect(() => {
    if (!permissions.canManageSystem) {
      toast.error('No tienes permisos para acceder al dashboard de Super Administrador');
      window.location.href = '/dashboard';
      return;
    }
    loadDashboardData();
  }, [user, permissions.canManageSystem]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar métricas del dashboard usando APIs reales con manejo de errores
      const loadData = withErrorHandling(async () => {
        const [systemMetrics, salesReport] = await Promise.all([
          DashboardService.getSystemMetrics(),
          DashboardService.getSalesReport()
        ]);

        // Calcular estadísticas del dashboard con datos reales
        setStats({
          totalUsers: systemMetrics.totalUsers || 0, // Usar totalUsers del backend
          activeEvents: systemMetrics.activeEvents || 0,
          totalCourses: systemMetrics.totalCourses || 0,
          totalRevenue: salesReport.totalRevenue || 0,
          userSatisfaction: systemMetrics.userSatisfaction || 0,
          incidentReports: systemMetrics.incidentReports || 0
        });
      }, 'Error al cargar los datos del dashboard');

      await loadData();

    } catch (error) {
      // El error ya fue manejado por withErrorHandling
      console.error('Error in loadDashboardData:', error);
      // Mantener valores en 0 si hay error, no usar datos ficticios
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">TradeConnect</h1>
              <Badge variant="destructive" className="text-xs">SUPER ADMIN</Badge>
            </div>


            <Button variant="outline" size="sm" onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar - Isla fija como en el diseño original */}
        <aside className="fixed left-6 top-24 bottom-6 w-72 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="h-full flex flex-col">
            {/* User Card */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 border-b border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  SA
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Admin Master</h3>
                <p className="text-red-600 font-semibold">Super Administrador</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {[
// Dashboard Principal
                  { id: 'dashboard', icon: BarChart3, label: 'Dashboard Principal', enabled: true },
// Gestión de Usuarios Básica
                  { id: 'usuarios', icon: Users, label: 'Gestión de Usuarios', enabled: permissions.canManageUsers },
// Gestión de Eventos
                  { id: 'events', icon: Calendar, label: 'Gestión de Eventos', enabled: permissions.canManageEvents },
// Gestión Financiera
                  { id: 'finance', icon: DollarSign, label: 'Gestión Financiera', enabled: permissions.canManageFinance },
// Gestión de Contenido
                  { id: 'content', icon: FileText, label: 'Gestión de Contenido', enabled: permissions.canManageContent },
// Gestión de Marketing
                  { id: 'marketing', icon: Megaphone, label: 'Gestión de Marketing', enabled: permissions.canManageMarketing },
// Gestión de Cupones Avanzados
                   { id: 'advanced-coupons', icon: Ticket, label: 'Gestión de Cupones', enabled: permissions.canManageMarketing },
// Analítica
                  { id: 'analytics', icon: TrendingUp, label: 'Analítica', enabled: true },
// Configuración del Sistema
                  { id: 'settings', icon: Settings, label: 'Configuración', enabled: permissions.canManageSystem },
// Auditoría y Logs
                  { id: 'auditoria', icon: Search, label: 'Auditoría y Logs', enabled: permissions.canViewAuditLogs }
                ].filter(item => item.enabled !== false).map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-primary text-white shadow-md'
                          : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 ml-80 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Super Administrador</h1>
                  <p className="text-gray-600">Vista general y métricas de toda la plataforma</p>
                </div>

                {/* Alertas del Sistema - Solo mostrar si hay datos reales */}
                {stats.incidentReports > 0 && (
                  <Alert className="mb-8 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>⚠️ Alertas del Sistema:</strong> {stats.incidentReports} incidentes requieren atención.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Usuarios Registrados</p>
                          <p className="text-2xl font-bold text-primary">{stats.totalUsers.toLocaleString()}</p>
                          {stats.totalUsers > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Datos actualizados
                            </p>
                          )}
                        </div>
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Eventos Activos</p>
                          <p className="text-2xl font-bold text-primary">{stats.activeEvents}</p>
                          {stats.activeEvents > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Eventos vigentes
                            </p>
                          )}
                        </div>
                        <Calendar className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                          <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</p>
                          {stats.totalRevenue > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Datos actualizados
                            </p>
                          )}
                        </div>
                        <DollarSign className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Satisfacción Usuarios</p>
                          <p className="text-2xl font-bold text-primary">{stats.userSatisfaction > 0 ? `${stats.userSatisfaction}%` : 'N/A'}</p>
                          {stats.userSatisfaction > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Datos actualizados
                            </p>
                          )}
                        </div>
                        <TrendingUp className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Incidentes Reportados</p>
                          <p className="text-2xl font-bold text-primary">{stats.incidentReports}</p>
                          {stats.incidentReports > 0 && (
                            <p className="text-xs text-red-600 flex items-center mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Requiere atención
                            </p>
                          )}
                        </div>
                        <AlertTriangle className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Acciones Rápidas */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[
                      { icon: Plus, title: 'Crear Usuario', desc: 'Agregar nuevo usuario', action: () => setActiveTab('usuarios'), enabled: permissions.canManageUsers },
                      { icon: Calendar, title: 'Crear Evento', desc: 'Publicar nuevo evento', action: () => toast.success('Funcionalidad en desarrollo'), enabled: permissions.canManageEvents },
                      { icon: BookOpen, title: 'Crear Curso', desc: 'Publicar nuevo curso', action: () => toast.success('Funcionalidad en desarrollo'), enabled: false },
                      { icon: TrendingUp, title: 'Generar Reporte', desc: 'Crear reporte personalizado', action: () => toast.success('Funcionalidad en desarrollo'), enabled: false },
                      { icon: Settings, title: 'Backup Sistema', desc: 'Realizar copia de seguridad', action: () => toast.success('Backup iniciado'), enabled: permissions.canManageSystem },
                      { icon: Search, title: 'Ver Auditoría', desc: 'Revisar logs del sistema', action: () => setActiveTab('auditoria'), enabled: permissions.canViewAuditLogs }
                    ].filter(item => item.enabled !== false).map((item, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={item.action}>
                        <CardContent className="p-6 text-center">
                          <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'usuarios' && permissions.canManageUsers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Gestión de Usuarios</h1>
                  <p className="text-gray-600">Administrar todos los usuarios del sistema</p>
                </div>
                <AdvancedUserManagementTab activeTab={activeTab} />
              </motion.div>
            )}

            {activeTab === 'events' && permissions.canManageEvents && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Gestión de Eventos</h1>
                  <p className="text-gray-600">Administrar todos los eventos de la plataforma</p>
                </div>
                <EventManagementTab activeTab={activeTab} />
              </motion.div>
            )}

            {activeTab === 'finance' && permissions.canManageFinance && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Gestión Financiera</h1>
                  <p className="text-gray-600">Control de ingresos, egresos y transacciones</p>
                </div>
                <FinanceManagementTab activeTab={activeTab} />
              </motion.div>
            )}

            {activeTab === 'settings' && permissions.canManageSystem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Configuración del Sistema</h1>
                  <p className="text-gray-600">Configuración avanzada de la plataforma</p>
                </div>
                <SystemManagementTab activeTab={activeTab} />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Analítica del Sistema</h1>
                  <p className="text-gray-600">Gráficos y estadísticas detalladas de la plataforma</p>
                </div>
                <AnalyticsTab activeTab={activeTab} />
              </motion.div>
            )}

            {activeTab === 'content' && permissions.canManageContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ContentManagementTab activeTab={activeTab} />
              </motion.div>
            )}

            {activeTab === 'marketing' && permissions.canManageMarketing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MarketingManagementTab activeTab={activeTab} />
              </motion.div>
            )}

            {/* Gestión de Usuarios Avanzada - REMOVIDA: Ya integrada en "Gestión de Usuarios" */}
            {/* {activeTab === 'usuarios-avanzados' && permissions.canManageUsers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Gestión de Usuarios Avanzada</h1>
                  <p className="text-gray-600">Herramientas avanzadas para gestión de usuarios, roles y permisos</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">Módulo de Gestión de Usuarios Avanzada - Próximamente</p>
                </div>
              </motion.div>
            )} */}

            {activeTab === 'advanced-coupons' && permissions.canManageMarketing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Cupones Avanzados</h1>
                  <p className="text-gray-600">Gestiona cupones con reglas complejas y condiciones avanzadas</p>
                </div>
                <AdvancedCouponsTab activeTab={activeTab} />
              </motion.div>
            )}

            {activeTab === 'auditoria' && permissions.canViewAuditLogs && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Auditoría y Logs</h1>
                  <p className="text-gray-600">Revisar logs del sistema y actividad de usuarios</p>
                </div>
                <AuditLogsTab activeTab={activeTab} />
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardSuperAdminPage;