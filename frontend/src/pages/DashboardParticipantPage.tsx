import React, { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useParticipantDashboardState } from '@/hooks/useParticipantDashboardState';
import { useAnalytics } from '@/hooks/useAnalytics';

// Lazy loading para componentes pesados
const ActiveParticipantTab = lazy(() => import('@/components/dashboard/participant/ActiveParticipantTab'));
const AttendanceValidationTab = lazy(() => import('@/components/dashboard/participant/AttendanceValidationTab'));
const CertificateReceptionTab = lazy(() => import('@/components/dashboard/participant/CertificateReceptionTab'));
const SatisfactionSurveyTab = lazy(() => import('@/components/dashboard/participant/SatisfactionSurveyTab'));

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
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


const DashboardParticipantPage: React.FC = React.memo(() => {
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
  } = useParticipantDashboardState();

  // Verificar permisos de participante y track analytics
  useEffect(() => {
    if (!permissions.isParticipant) {
      toast.error('No tienes permisos para acceder al dashboard de Participante');
      window.location.href = '/login';
      return;
    }
    loadDashboardData();

    // Track page view
    trackPageView('/dashboard/participant', {
      userRole: user?.role,
      dashboard: 'participant'
    });
  }, [user, permissions.isParticipant, loadDashboardData, trackPageView]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#607D8B]"></div>
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
              <h1 className="text-2xl font-bold text-[#6B1E22]">TradeConnect</h1>
              <Badge variant="secondary" className="text-xs bg-[#607D8B] text-white">PARTICIPANT</Badge>
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
            <div className="bg-gradient-to-br from-[#607D8B]/5 to-[#607D8B]/10 p-6 border-b border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#607D8B] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  P
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Participante</h3>
                <p className="text-[#607D8B] font-semibold">Participante Activo</p>
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
                          ? 'bg-[#607D8B] text-white shadow-md'
                          : 'text-gray-700 hover:bg-[#607D8B]/10 hover:text-[#607D8B]'
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
            {activeTab === 'active-participation' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Participación Activa</h1>
                  <p className="text-gray-600">Estado activo como participante en eventos</p>
                </div>

                {/* Alertas del Sistema - Solo mostrar si hay datos reales */}
                {stats.pendingEvaluations > 0 && (
                  <Alert className="mb-8 border-yellow-200 bg-yellow-50">
                    <Star className="h-4 w-4" />
                    <AlertDescription>
                      <strong>📝 Evaluaciones Pendientes:</strong> Tienes {stats.pendingEvaluations} evaluación(es) pendiente(s) de completar.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Participación Activa</p>
                          <p className="text-2xl font-bold text-[#607D8B]">{stats.activeParticipation}</p>
                          {stats.activeParticipation > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Eventos activos
                            </p>
                          )}
                        </div>
                        <Users className="w-8 h-8 text-[#607D8B]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Asistencia Validada</p>
                          <p className="text-2xl font-bold text-[#607D8B]">{stats.attendanceValidated}</p>
                          {stats.attendanceValidated > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Check-ins realizados
                            </p>
                          )}
                        </div>
                        <CheckCircle className="w-8 h-8 text-[#607D8B]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Certificados Recibidos</p>
                          <p className="text-2xl font-bold text-[#607D8B]">{stats.certificatesReceived}</p>
                          {stats.certificatesReceived > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <Award className="w-3 h-3 mr-1" />
                              Emitidos
                            </p>
                          )}
                        </div>
                        <Award className="w-8 h-8 text-[#607D8B]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Evaluaciones Pendientes</p>
                          <p className="text-2xl font-bold text-[#607D8B]">{stats.pendingEvaluations}</p>
                          {stats.pendingEvaluations > 0 && (
                            <p className="text-xs text-yellow-600 flex items-center mt-1">
                              <Star className="w-3 h-3 mr-1" />
                              Requiere atención
                            </p>
                          )}
                        </div>
                        <Star className="w-8 h-8 text-[#607D8B]" />
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
                          <item.icon className="w-8 h-8 text-[#607D8B] mx-auto mb-3" />
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'active-participation' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#607D8B]"></div>
                    <span className="ml-3 text-gray-600">Cargando participación activa...</span>
                  </div>
                }>
                  <ActiveParticipantTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'attendance-validation' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Validación de Asistencia</h1>
                  <p className="text-gray-600">Validar asistencia durante eventos</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#607D8B]"></div>
                    <span className="ml-3 text-gray-600">Cargando validación de asistencia...</span>
                  </div>
                }>
                  <AttendanceValidationTab activeTab={activeTab} />
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
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Recepción de Certificados</h1>
                  <p className="text-gray-600">Recibir y gestionar certificados post-evento</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#607D8B]"></div>
                    <span className="ml-3 text-gray-600">Cargando recepción de certificados...</span>
                  </div>
                }>
                  <CertificateReceptionTab activeTab={activeTab} />
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
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Encuestas de Satisfacción</h1>
                  <p className="text-gray-600">Completar evaluaciones post-evento</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#607D8B]"></div>
                    <span className="ml-3 text-gray-600">Cargando encuestas de satisfacción...</span>
                  </div>
                }>
                  <SatisfactionSurveyTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
});

DashboardParticipantPage.displayName = 'DashboardParticipantPage';

export default DashboardParticipantPage;