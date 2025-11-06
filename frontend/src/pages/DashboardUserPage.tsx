import React, { lazy, Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserDashboardState } from '@/hooks/useUserDashboardState';
import EventRegistrationFlow from '@/components/ui/event-registration-flow';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useState, useEffect } from 'react';
import { UserDashboardService, UserEvent } from '@/services/userDashboardService';

// Lazy loading para componentes pesados
const EventCatalogTab = lazy(() => import('@/components/dashboard/user/EventCatalogTab'));
const RegistrationTab = lazy(() => import('@/components/dashboard/user/RegistrationTab'));
const PersonalDashboardTab = lazy(() => import('@/components/dashboard/user/PersonalDashboardTab'));
const QrDownloadTab = lazy(() => import('@/components/dashboard/user/QrDownloadTab'));
const PostEventEvaluationTab = lazy(() => import('@/components/dashboard/user/PostEventEvaluationTab'));

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
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
  Eye,
  User,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';


const DashboardUserPage: React.FC = React.memo(() => {
  const { user } = useAuthStore();
  const permissions = usePermissions();
  const { trackPageView, trackDashboardInteraction } = useAnalytics();
  const {
    activeTab,
    setActiveTab,
    stats,
    loading,
    navigationItems,
    quickActions,
    loadDashboardData,
    formatCurrency,
    formatHours
  } = useUserDashboardState();

  // Estado para el flujo de registro de eventos
  const [registrationFlowOpen, setRegistrationFlowOpen] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<UserEvent | null>(null);

  // Estado para el colapso del sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Verificar permisos de usuario regular y track analytics
  useEffect(() => {
    if (!permissions.canViewEvents) {
      toast.error('No tienes permisos para acceder al dashboard de Usuario');
      window.location.href = '/login';
      return;
    }
    loadDashboardData();

    // Track page view
    trackPageView('/dashboard/user', {
      userRole: user?.role,
      dashboard: 'user'
    });
  }, [user, permissions.canViewEvents, loadDashboardData, trackPageView]);

  // Check for return URL with event registration hash
  useEffect(() => {
    if (window.location.hash.startsWith('#register-event-')) {
      const eventId = parseInt(window.location.hash.replace('#register-event-', ''));
      if (eventId) {
        // Load the event details and open registration flow
        loadEventForRegistration(eventId);
      }
    }
  }, []);

  // Function to load event for registration
  const loadEventForRegistration = async (eventId: number) => {
    try {
      const events = await UserDashboardService.getAvailableEvents();
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEventForRegistration(event);
        setRegistrationFlowOpen(true);
        // Clear the hash
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (error) {
      console.error('Error loading event for registration:', error);
      toast.error('Error al cargar el evento para registro');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4CAF50]"></div>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="mr-2"
                title={sidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
              >
                {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </Button>
              <h1 className="text-2xl font-bold text-[#6B1E22]">TradeConnect</h1>
              <Badge variant="secondary" className="text-xs bg-[#4CAF50] text-white">USER</Badge>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-700">
                  <User className="w-4 h-4 inline mr-1" />
                  {user.firstName} {user.lastName}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => {
                useAuthStore.getState().logout();
                window.location.href = '/login';
              }}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar - Isla fija como en el diseño original */}
        <aside className={`fixed left-6 top-24 bottom-6 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-0 opacity-0 -left-80' : 'w-72 opacity-100'
        }`}>
          <div className="h-full flex flex-col">
            {/* User Card */}
            <div className="bg-gradient-to-br from-[#6B1E22]/5 to-[#6B1E22]/10 p-6 border-b border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#6B1E22] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-[#6B1E22] font-semibold text-sm">{user?.email}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        trackDashboardInteraction('user', 'tab_change', {
                          fromTab: activeTab,
                          toTab: item.id
                        });
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-[#6B1E22] text-white shadow-md'
                          : 'text-gray-700 hover:bg-[#6B1E22]/10 hover:text-[#6B1E22]'
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
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-6' : 'ml-80'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Dashboard Usuario</h1>
                  <p className="text-gray-600">Tu centro de control personal en TradeConnect</p>
                </div>

                {/* Alertas del Sistema - Solo mostrar si hay datos reales */}
                {stats.pendingPayments > 0 && (
                  <Alert className="mb-8 border-yellow-200 bg-yellow-50">
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription>
                      <strong>⚠️ Pagos Pendientes:</strong> Tienes {stats.pendingPayments} pago(s) pendiente(s) de procesamiento.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Eventos Activos</p>
                          <p className="text-2xl font-bold text-[#4CAF50]">{stats.activeEvents}</p>
                          {stats.activeEvents > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Inscrito
                            </p>
                          )}
                        </div>
                        <Calendar className="w-8 h-8 text-[#4CAF50]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Eventos Completados</p>
                          <p className="text-2xl font-bold text-[#4CAF50]">{stats.completedEvents}</p>
                          {stats.completedEvents > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Finalizados
                            </p>
                          )}
                        </div>
                        <CheckCircle className="w-8 h-8 text-[#4CAF50]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Certificados</p>
                          <p className="text-2xl font-bold text-[#4CAF50]">{stats.certificates}</p>
                          {stats.certificates > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <Award className="w-3 h-3 mr-1" />
                              Obtenidos
                            </p>
                          )}
                        </div>
                        <Award className="w-8 h-8 text-[#4CAF50]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Horas de Formación</p>
                          <p className="text-2xl font-bold text-[#4CAF50]">{formatHours(stats.trainingHours)}</p>
                          {stats.trainingHours > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              Acumuladas
                            </p>
                          )}
                        </div>
                        <Clock className="w-8 h-8 text-[#4CAF50]" />
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
                          <item.icon className="w-8 h-8 text-[#4CAF50] mx-auto mb-3" />
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && permissions.canViewEvents && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Catálogo de Eventos</h1>
                  <p className="text-gray-600">Explora y descubre eventos disponibles</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
                    <span className="ml-3 text-gray-600">Cargando catálogo de eventos...</span>
                  </div>
                }>
                  <EventCatalogTab
                    activeTab={activeTab}
                    onRegisterEvent={(event) => {
                      setSelectedEventForRegistration(event);
                      setRegistrationFlowOpen(true);
                    }}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'registrations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Mis Inscripciones</h1>
                  <p className="text-gray-600">Gestiona tus registros y pagos</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
                    <span className="ml-3 text-gray-600">Cargando inscripciones...</span>
                  </div>
                }>
                  <RegistrationTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'certificates' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Mis Certificados</h1>
                  <p className="text-gray-600">Visualiza y descarga tus certificados</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
                    <span className="ml-3 text-gray-600">Cargando certificados...</span>
                  </div>
                }>
                  <PersonalDashboardTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'qr-codes' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Códigos QR</h1>
                  <p className="text-gray-600">Descarga tus códigos de acceso</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
                    <span className="ml-3 text-gray-600">Cargando códigos QR...</span>
                  </div>
                }>
                  <QrDownloadTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'evaluations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Evaluaciones Post-Evento</h1>
                  <p className="text-gray-600">Comparte tu experiencia y feedback</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
                    <span className="ml-3 text-gray-600">Cargando evaluaciones...</span>
                  </div>
                }>
                  <PostEventEvaluationTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Event Registration Flow */}
      {selectedEventForRegistration && (
        <EventRegistrationFlow
          isOpen={registrationFlowOpen}
          onClose={() => {
            setRegistrationFlowOpen(false);
            setSelectedEventForRegistration(null);
            // Reload dashboard data to update stats
            loadDashboardData();
          }}
          event={selectedEventForRegistration}
        />
      )}
    </div>
  );
});

DashboardUserPage.displayName = 'DashboardUserPage';

export default DashboardUserPage;