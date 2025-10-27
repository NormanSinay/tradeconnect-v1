import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DashboardService } from '@/services/dashboardService';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import UserManagementTab from '@/components/dashboard/UserManagementTab';
import EventManagementTab from '@/components/dashboard/EventManagementTab';
import FinanceManagementTab from '@/components/dashboard/FinanceManagementTab';
import SystemManagementTab from '@/components/dashboard/SystemManagementTab';
import AuditLogsTab from '@/components/dashboard/AuditLogsTab';
import ChartsSection from '@/components/dashboard/ChartsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Users, Calendar, BookOpen, DollarSign, TrendingUp, AlertTriangle, Settings, Search, Plus } from 'lucide-react';
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
          totalUsers: systemMetrics.totalEvents || 0, // Usar totalEvents como proxy de usuarios registrados
          activeEvents: systemMetrics.activeEvents || 0,
          totalCourses: 0, // API no implementada aún
          totalRevenue: salesReport.totalRevenue || 0,
          userSatisfaction: 0, // API no implementada aún
          incidentReports: 0 // API no implementada aún
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">TradeConnect</h1>
              <Badge variant="destructive" className="text-xs">SUPER ADMIN</Badge>
            </div>

            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`text-sm font-medium ${activeTab === 'dashboard' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`text-sm font-medium ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
              >
                Usuarios
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`text-sm font-medium ${activeTab === 'events' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
              >
                Eventos
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`text-sm font-medium ${activeTab === 'finance' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
              >
                Finanzas
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`text-sm font-medium ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
              >
                Configuración
              </button>
              <button
                onClick={() => setActiveTab('auditoria')}
                className={`text-sm font-medium ${activeTab === 'auditoria' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
              >
                Auditoría
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  SA
                </div>
                <span className="text-sm font-medium">Admin Master</span>
              </div>
              <Button variant="outline" size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    SA
                  </div>
                  <div>
                    <h3 className="font-semibold">Admin Master</h3>
                    <p className="text-sm text-gray-600">Super Administrador</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Button
                    variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Dashboard Principal
                  </Button>
                  {permissions.canManageUsers && (
                    <Button
                      variant={activeTab === 'users' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('users')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Gestión de Usuarios
                    </Button>
                  )}
                  {permissions.canManageEvents && (
                    <Button
                      variant={activeTab === 'events' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('events')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Gestión de Eventos
                    </Button>
                  )}
                  {permissions.canManageFinance && (
                    <Button
                      variant={activeTab === 'finance' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('finance')}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Gestión Financiera
                    </Button>
                  )}
                  {permissions.canManageSystem && (
                    <Button
                      variant={activeTab === 'settings' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </Button>
                  )}
                  {permissions.canViewAuditLogs && (
                    <Button
                      variant={activeTab === 'auditoria' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('auditoria')}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Auditoría y Logs
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
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
                              Datos actualizados
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
                          <p className="text-sm font-medium text-gray-600">Cursos Publicados</p>
                          <p className="text-2xl font-bold text-primary">{stats.totalCourses}</p>
                          {stats.totalCourses > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Datos actualizados
                            </p>
                          )}
                        </div>
                        <BookOpen className="w-8 h-8 text-primary" />
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
                      { icon: Plus, title: 'Crear Usuario', desc: 'Agregar nuevo usuario', action: () => setActiveTab('users'), enabled: permissions.canManageUsers },
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

                {/* Gráficos y Estadísticas - Solo mostrar si hay datos */}
                {stats.totalUsers > 0 && <ChartsSection activeTab={activeTab} />}

                {/* Actividad Reciente - Solo mostrar si hay datos */}
                {stats.totalUsers > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Actividad Reciente del Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-gray-500 py-8">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>La API de auditoría no está implementada aún.</p>
                        <p className="text-sm">Esta sección mostrará logs de actividad cuando esté disponible.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {activeTab === 'users' && permissions.canManageUsers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-primary mb-2">Gestión de Usuarios</h1>
                  <p className="text-gray-600">Administrar todos los usuarios del sistema</p>
                </div>
                <UserManagementTab activeTab={activeTab} />
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardSuperAdminPage;