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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Users, Calendar, BookOpen, DollarSign, TrendingUp, AlertTriangle, Settings, Search, Plus, BarChart3, FileText, Megaphone, UserCheck, Ticket, Database, HardDrive, Cloud, Download, Trash2 } from 'lucide-react';
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

  // Estados para backup del sistema
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [backupOptions, setBackupOptions] = useState({
    includeUsers: true,
    includeEvents: true,
    includePayments: true,
    includeLogs: false,
    includeFiles: true,
    compressionLevel: 'medium',
    destination: 'local', // 'local', 'cloud', 'both'
    retentionDays: 30,
    encryptionEnabled: true,
    autoDelete: false
  });

  // Estados para gestión de backups
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [showBackupHistory, setShowBackupHistory] = useState(false);

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

  // Función para ejecutar backup del sistema
  const handleSystemBackup = useCallback(async () => {
    if (!permissions.canManageSystem) {
      toast.error('No tienes permisos para realizar backups del sistema');
      return;
    }

    try {
      setBackupStatus('running');
      setBackupProgress(0);

      // Simular progreso del backup
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setBackupStatus('completed');

            // Crear entrada en el historial
            const newBackup = {
              id: Date.now(),
              name: `Backup_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}`,
              createdAt: new Date().toISOString(),
              size: `${(Math.random() * 500 + 100).toFixed(1)} MB`,
              destination: backupOptions.destination,
              status: 'completed',
              compressionLevel: backupOptions.compressionLevel,
              includes: Object.entries(backupOptions)
                .filter(([key, value]) => key.startsWith('include') && value === true)
                .map(([key]) => key.replace('include', '').toLowerCase())
                .join(', ')
            };

            setBackupHistory(prev => [newBackup, ...prev.slice(0, 9)]); // Mantener últimos 10

            toast.success(`Backup completado. Archivo: ${newBackup.name}`);
            setTimeout(() => {
              setShowBackupModal(false);
              setBackupStatus('idle');
              setBackupProgress(0);
            }, 2000);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Aquí iría la llamada real al backend
      // await DashboardService.createSystemBackup(backupOptions);

    } catch (error) {
      setBackupStatus('failed');
      toast.error('Error al crear el backup del sistema');
      console.error('Backup error:', error);
    }
  }, [permissions.canManageSystem, backupOptions]);

  // Función para descargar backup
  const handleDownloadBackup = useCallback((backup: any) => {
    // Simular descarga
    toast.success(`Descargando ${backup.name}...`);
    // Aquí iría la lógica real de descarga
    // window.open(`/api/backups/download/${backup.id}`, '_blank');
  }, []);

  // Función para eliminar backup
  const handleDeleteBackup = useCallback((backupId: number) => {
    setBackupHistory(prev => prev.filter(b => b.id !== backupId));
    toast.success('Backup eliminado exitosamente');
  }, []);


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
                          <p className="text-sm font-medium text-gray-600">Eventos Creados</p>
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
                      {
                        icon: Plus,
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
                        icon: BookOpen,
                        title: 'Crear Curso',
                        desc: 'Publicar nuevo curso',
                        action: () => {
                          toast.success('Funcionalidad de cursos próximamente disponible');
                        },
                        enabled: false
                      },
                      {
                        icon: TrendingUp,
                        title: 'Generar Reporte',
                        desc: 'Crear reporte personalizado',
                        action: () => {
                          setActiveTab('analytics');
                          toast.success('Generando reporte personalizado');
                        },
                        enabled: true
                      },
                      {
                        icon: Database,
                        title: 'Backup Sistema',
                        desc: 'Realizar copia de seguridad',
                        action: () => {
                          setShowBackupModal(true);
                        },
                        enabled: permissions.canManageSystem
                      },
                      {
                        icon: Search,
                        title: 'Ver Auditoría',
                        desc: 'Revisar logs del sistema',
                        action: () => {
                          setActiveTab('auditoria');
                          toast.success('Cargando logs de auditoría');
                        },
                        enabled: permissions.canViewAuditLogs
                      }
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

      {/* Modal de Backup del Sistema */}
      <Dialog open={showBackupModal} onOpenChange={setShowBackupModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Database className="h-5 w-5" />
              Backup del Sistema
            </DialogTitle>
            <DialogDescription>
              Configure y ejecute una copia de seguridad completa del sistema TradeConnect.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Opciones de backup */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Datos a incluir en el backup</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBackupHistory(!showBackupHistory)}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Historial
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeUsers"
                    checked={backupOptions.includeUsers}
                    onCheckedChange={(checked) =>
                      setBackupOptions(prev => ({ ...prev, includeUsers: !!checked }))
                    }
                  />
                  <label htmlFor="includeUsers" className="text-sm font-medium">
                    Usuarios y perfiles
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeEvents"
                    checked={backupOptions.includeEvents}
                    onCheckedChange={(checked) =>
                      setBackupOptions(prev => ({ ...prev, includeEvents: !!checked }))
                    }
                  />
                  <label htmlFor="includeEvents" className="text-sm font-medium">
                    Eventos y configuraciones
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includePayments"
                    checked={backupOptions.includePayments}
                    onCheckedChange={(checked) =>
                      setBackupOptions(prev => ({ ...prev, includePayments: !!checked }))
                    }
                  />
                  <label htmlFor="includePayments" className="text-sm font-medium">
                    Pagos y transacciones
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeLogs"
                    checked={backupOptions.includeLogs}
                    onCheckedChange={(checked) =>
                      setBackupOptions(prev => ({ ...prev, includeLogs: !!checked }))
                    }
                  />
                  <label htmlFor="includeLogs" className="text-sm font-medium">
                    Logs de auditoría
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeFiles"
                    checked={backupOptions.includeFiles}
                    onCheckedChange={(checked) =>
                      setBackupOptions(prev => ({ ...prev, includeFiles: !!checked }))
                    }
                  />
                  <label htmlFor="includeFiles" className="text-sm font-medium">
                    Archivos y documentos
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nivel de compresión:</label>
                  <Select
                    value={backupOptions.compressionLevel}
                    onValueChange={(value) =>
                      setBackupOptions(prev => ({ ...prev, compressionLevel: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bajo (Más rápido)</SelectItem>
                      <SelectItem value="medium">Medio (Recomendado)</SelectItem>
                      <SelectItem value="high">Alto (Más compacto)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Destino del backup:</label>
                  <Select
                    value={backupOptions.destination}
                    onValueChange={(value) =>
                      setBackupOptions(prev => ({ ...prev, destination: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Solo Local</SelectItem>
                      <SelectItem value="cloud">Solo Nube</SelectItem>
                      <SelectItem value="both">Local + Nube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Retención (días):</label>
                  <Select
                    value={backupOptions.retentionDays.toString()}
                    onValueChange={(value) =>
                      setBackupOptions(prev => ({ ...prev, retentionDays: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                      <SelectItem value="365">1 año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="encryptionEnabled"
                    checked={backupOptions.encryptionEnabled}
                    onCheckedChange={(checked) =>
                      setBackupOptions(prev => ({ ...prev, encryptionEnabled: !!checked }))
                    }
                  />
                  <label htmlFor="encryptionEnabled" className="text-sm font-medium">
                    Encriptar backup
                  </label>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            {backupStatus !== 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del backup</span>
                  <span>{Math.round(backupProgress)}%</span>
                </div>
                <Progress value={backupProgress} className="h-2" />

                <div className="text-sm text-gray-600">
                  {backupStatus === 'running' && 'Creando copia de seguridad...'}
                  {backupStatus === 'completed' && 'Backup completado exitosamente'}
                  {backupStatus === 'failed' && 'Error al crear el backup'}
                </div>
              </div>
            )}

            {/* Información del backup */}
            <Alert>
              <HardDrive className="h-4 w-4" />
              <AlertDescription>
                <strong>Información del backup:</strong> El proceso puede tardar varios minutos dependiendo
                del volumen de datos. Se recomienda no cerrar esta ventana durante el proceso.
                <br />
                <strong>Destino:</strong> {
                  backupOptions.destination === 'local' ? 'Solo servidor local' :
                  backupOptions.destination === 'cloud' ? 'Solo nube (AWS S3)' :
                  'Servidor local + Nube (AWS S3)'
                }
              </AlertDescription>
            </Alert>

            {/* Historial de backups */}
            {showBackupHistory && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Historial de Backups
                </h4>

                {backupHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay backups realizados aún.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {backupHistory.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{backup.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(backup.createdAt).toLocaleString('es-GT')} • {backup.size} • {backup.includes}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadBackup(backup)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBackupModal(false)}
                disabled={backupStatus === 'running'}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSystemBackup}
                disabled={backupStatus === 'running' || !Object.values(backupOptions).some(v => typeof v === 'boolean' ? v : true)}
                className="bg-primary hover:bg-primary/90"
              >
                {backupStatus === 'running' ? (
                  <>
                    <Database className="w-4 h-4 mr-2 animate-spin" />
                    Creando Backup...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Iniciar Backup
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardSuperAdminPage;