import React, { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useClientDashboardState } from '@/hooks/useClientDashboardState';
import { useAnalytics } from '@/hooks/useAnalytics';

// Lazy loading para componentes pesados
const ClientRegistrationTab = lazy(() => import('@/components/dashboard/client/ClientRegistrationTab'));
const ClientPaymentsTab = lazy(() => import('@/components/dashboard/client/ClientPaymentsTab'));
const ClientFelTab = lazy(() => import('@/components/dashboard/client/ClientFelTab'));
const ClientCertificatesTab = lazy(() => import('@/components/dashboard/client/ClientCertificatesTab'));

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import {
  FileText,
  CreditCard,
  Receipt,
  Award,
  Calendar,
  DollarSign,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';


const DashboardClientPage: React.FC = React.memo(() => {
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
  } = useClientDashboardState();

  // Verificar permisos de cliente y track analytics
  useEffect(() => {
    if (!permissions.canViewEvents) {
      toast.error('No tienes permisos para acceder al dashboard de Cliente');
      window.location.href = '/login';
      return;
    }
    loadDashboardData();

    // Track page view
    trackPageView('/dashboard/client', {
      userRole: user?.role,
      dashboard: 'client'
    });
  }, [user, permissions.canViewEvents, loadDashboardData, trackPageView]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#795548]"></div>
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
              <Badge variant="secondary" className="text-xs bg-[#795548] text-white">CLIENT</Badge>
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
            <div className="bg-gradient-to-br from-[#795548]/5 to-[#795548]/10 p-6 border-b border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#795548] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  C
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Cliente</h3>
                <p className="text-[#795548] font-semibold">Cliente</p>
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
                          ? 'bg-[#795548] text-white shadow-md'
                          : 'text-gray-700 hover:bg-[#795548]/10 hover:text-[#795548]'
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
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Dashboard Cliente</h1>
                  <p className="text-gray-600">Gestión de tus servicios y transacciones</p>
                </div>

                {/* Alertas del Sistema - Solo mostrar si hay datos reales */}
                {stats.clientFelInvoices > 0 && (
                  <Alert className="mb-8 border-blue-200 bg-blue-50">
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>📄 Información:</strong> Tienes {stats.clientFelInvoices} factura(s) FEL disponible(s) para descarga.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Mis Inscripciones</p>
                          <p className="text-2xl font-bold text-[#795548]">{stats.clientRegistrations}</p>
                          {stats.clientRegistrations > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Activas
                            </p>
                          )}
                        </div>
                        <Calendar className="w-8 h-8 text-[#795548]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pagos Realizados</p>
                          <p className="text-2xl font-bold text-[#795548]">{stats.clientPayments}</p>
                          {stats.clientPayments > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Procesados
                            </p>
                          )}
                        </div>
                        <CreditCard className="w-8 h-8 text-[#795548]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Facturas FEL</p>
                          <p className="text-2xl font-bold text-[#795548]">{stats.clientFelInvoices}</p>
                          {stats.clientFelInvoices > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <FileText className="w-3 h-3 mr-1" />
                              Disponibles
                            </p>
                          )}
                        </div>
                        <FileText className="w-8 h-8 text-[#795548]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Certificados</p>
                          <p className="text-2xl font-bold text-[#795548]">{stats.clientCertificates}</p>
                          {stats.clientCertificates > 0 && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                              <Award className="w-3 h-3 mr-1" />
                              Obtenidos
                            </p>
                          )}
                        </div>
                        <Award className="w-8 h-8 text-[#795548]" />
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
                          <item.icon className="w-8 h-8 text-[#795548] mx-auto mb-3" />
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'client-registrations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Mis Inscripciones</h1>
                  <p className="text-gray-600">Historial de tus registros a eventos</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#795548]"></div>
                    <span className="ml-3 text-gray-600">Cargando inscripciones...</span>
                  </div>
                }>
                  <ClientRegistrationTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'client-payments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Mis Pagos</h1>
                  <p className="text-gray-600">Historial completo de tus transacciones</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#795548]"></div>
                    <span className="ml-3 text-gray-600">Cargando pagos...</span>
                  </div>
                }>
                  <ClientPaymentsTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'client-fel' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Facturas FEL</h1>
                  <p className="text-gray-600">Tus comprobantes fiscales electrónicos</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#795548]"></div>
                    <span className="ml-3 text-gray-600">Cargando facturas...</span>
                  </div>
                }>
                  <ClientFelTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'client-certificates' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#6B1E22] mb-2">Certificados</h1>
                  <p className="text-gray-600">Descarga tus certificados de participación</p>
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#795548]"></div>
                    <span className="ml-3 text-gray-600">Cargando certificados...</span>
                  </div>
                }>
                  <ClientCertificatesTab activeTab={activeTab} />
                </Suspense>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
});

DashboardClientPage.displayName = 'DashboardClientPage';

export default DashboardClientPage;