import React, { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useDashboardState } from '@/hooks/useDashboardState';

// Lazy loading para componentes pesados
const AdvancedUserManagementTab = lazy(() => import('@/components/dashboard/AdvancedUserManagementTab'));
const EventManagementTab = lazy(() => import('@/components/dashboard/EventManagementTab'));
const FinanceManagementTab = lazy(() => import('@/components/dashboard/FinanceManagementTab'));
const AnalyticsTab = lazy(() => import('@/components/dashboard/AnalyticsTab'));
const AdvancedCouponsTab = lazy(() => import('@/components/dashboard/AdvancedCouponsTab'));
const ContentManagementTab = lazy(() => import('@/components/dashboard/ContentManagementTab'));
const MarketingManagementTab = lazy(() => import('@/components/dashboard/MarketingManagementTab'));
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';


const DashboardAdminPage: React.FC = React.memo(() => {
  const { user } = useAuthStore();
  const permissions = usePermissions();
  const {
    activeTab,
    setActiveTab,
    stats,
    loading,
    navigationItems,
    quickActions,
    loadDashboardData,
    formatCurrency
  } = useDashboardState();

  // Verificar permisos de admin
  useEffect(() => {
    if (!permissions.canManageUsers) {
      toast.error('No tienes permisos para acceder al dashboard de Administrador');
      window.location.href = '/dashboard';
      return;
    }
    loadDashboardData();
  }, [user, permissions.canManageUsers, loadDashboardData]);


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
              <Badge variant="secondary" className="text-xs">ADMIN</Badge>
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
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  A
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Administrador</h3>
                <p className="text-blue-600 font-semibold">Administrador</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {navigationItems.map((item) => (
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
                  <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Administrador</h1>
                  <p className="text-gray-600">Vista general y métricas de la plataforma</p>
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
                    {quickActions.map((item, index) => (
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
                  <p className="text-gray-600">Administrar usuarios del sistema</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Cargando gestión de usuarios...</span>
                  </div>
                }>
                  <AdvancedUserManagementTab activeTab={activeTab} />
                </Suspense>
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
                  <p className="text-gray-600">Administrar eventos de la plataforma</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Cargando gestión de eventos...</span>
                  </div>
                }>
                  <EventManagementTab activeTab={activeTab} />
                </Suspense>
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
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Cargando gestión financiera...</span>
                  </div>
                }>
                  <FinanceManagementTab activeTab={activeTab} />
                </Suspense>
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
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Cargando analítica...</span>
                  </div>
                }>
                  <AnalyticsTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'content' && permissions.canManageContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Cargando gestión de contenido...</span>
                  </div>
                }>
                  <ContentManagementTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'marketing' && permissions.canManageMarketing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Cargando gestión de marketing...</span>
                  </div>
                }>
                  <MarketingManagementTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

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
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Cargando cupones avanzados...</span>
                  </div>
                }>
                  <AdvancedCouponsTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
});

DashboardAdminPage.displayName = 'DashboardAdminPage';

export default DashboardAdminPage;