import React, { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useSpeakerDashboardState } from '@/hooks/useSpeakerDashboardState';

// Lazy loading para componentes pesados
const AssignedEventsTab = lazy(() => import('@/components/dashboard/AssignedEventsTab'));
const SpeakerMaterialsTab = lazy(() => import('@/components/dashboard/SpeakerMaterialsTab'));
const SpeakerProfileTab = lazy(() => import('@/components/dashboard/SpeakerProfileTab'));
const SpeakerNotificationsTab = lazy(() => import('@/components/dashboard/SpeakerNotificationsTab'));
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, Mic } from 'lucide-react';
import toast from 'react-hot-toast';


const DashboardSpeakerPage: React.FC = React.memo(() => {
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
    formatCurrency,
    formatRating
  } = useSpeakerDashboardState();

  // Verificar permisos de speaker
  useEffect(() => {
    if (!permissions.isSpeaker) {
      toast.error('No tienes permisos para acceder al dashboard de Speaker');
      window.location.href = '/dashboard';
      return;
    }
    loadDashboardData();
  }, [user, permissions.isSpeaker, loadDashboardData]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
              <h1 className="text-2xl font-bold text-purple-600">TradeConnect</h1>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">SPEAKER</Badge>
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
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 border-b border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  <Mic className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Speaker</h3>
                <p className="text-purple-600 font-semibold">Speaker</p>
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
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
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
            {activeTab === 'assigned-events' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-purple-600 mb-2">Dashboard Speaker</h1>
                  <p className="text-gray-600">Vista general y métricas de tus eventos</p>
                </div>

                {/* Alertas del Sistema - Solo mostrar si hay datos reales */}
                {stats.unreadNotifications > 0 && (
                  <Alert className="mb-8 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>⚠️ Notificaciones:</strong> Tienes {stats.unreadNotifications} notificaciones sin leer.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Eventos Asignados</p>
                          <p className="text-2xl font-bold text-purple-600">{stats.totalEvents.toLocaleString()}</p>
                          {stats.totalEvents > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              Eventos activos
                            </p>
                          )}
                        </div>
                        <Calendar className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Eventos Próximos</p>
                          <p className="text-2xl font-bold text-purple-600">{stats.upcomingEvents}</p>
                          {stats.upcomingEvents > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              Próximos eventos
                            </p>
                          )}
                        </div>
                        <Calendar className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Ganancias Totales</p>
                          <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalEarnings)}</p>
                          {stats.totalEarnings > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Datos actualizados
                            </p>
                          )}
                        </div>
                        <AlertTriangle className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                          <p className="text-2xl font-bold text-purple-600">{stats.averageRating > 0 ? `${formatRating(stats.averageRating)} ⭐` : 'N/A'}</p>
                          {stats.averageRating > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Datos actualizados
                            </p>
                          )}
                        </div>
                        <AlertTriangle className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Acciones Rápidas */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {quickActions.map((item, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={item.action}>
                        <CardContent className="p-6 text-center">
                          <item.icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assigned-events' && permissions.isSpeaker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-purple-600 mb-2">Eventos Asignados</h1>
                  <p className="text-gray-600">Gestiona tus eventos asignados como speaker</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Cargando eventos asignados...</span>
                  </div>
                }>
                  <AssignedEventsTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'materials' && permissions.isSpeaker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-purple-600 mb-2">Material de Speaker</h1>
                  <p className="text-gray-600">Gestiona tus presentaciones y materiales</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Cargando materiales...</span>
                  </div>
                }>
                  <SpeakerMaterialsTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'profile' && permissions.isSpeaker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-purple-600 mb-2">Perfil de Speaker</h1>
                  <p className="text-gray-600">Actualiza tu información personal y profesional</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Cargando perfil...</span>
                  </div>
                }>
                  <SpeakerProfileTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'notifications' && permissions.isSpeaker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-purple-600 mb-2">Notificaciones</h1>
                  <p className="text-gray-600">Revisa tus mensajes y alertas importantes</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Cargando notificaciones...</span>
                  </div>
                }>
                  <SpeakerNotificationsTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
});

DashboardSpeakerPage.displayName = 'DashboardSpeakerPage';

export default DashboardSpeakerPage;