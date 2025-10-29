import React, { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventAnalyticsDashboardProps {
  filters: {
    dateRange: { startDate: string; endDate: string };
    eventTypeId?: number;
    eventCategoryId?: number;
    eventStatus?: string;
    eventId?: number;
  };
  permissions: any;
  withErrorHandling: any;
}

interface AnalyticsData {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  averageAttendanceRate: number;
  topEvents: Array<{
    id: number;
    title: string;
    registrations: number;
    revenue: number;
  }>;
  eventsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    events: number;
    registrations: number;
    revenue: number;
  }>;
}

const EventAnalyticsDashboard: React.FC<EventAnalyticsDashboardProps> = ({
  filters,
  permissions,
  withErrorHandling
}) => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [chartType, setChartType] = useState<'events' | 'revenue' | 'registrations'>('events');

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        // Aquí irían las llamadas reales a las APIs de analytics
        // Por ahora simulamos datos
        const mockData: AnalyticsData = {
          totalEvents: 156,
          activeEvents: 89,
          totalRegistrations: 2847,
          totalRevenue: 245680,
          averageAttendanceRate: 78.5,
          topEvents: [
            { id: 1, title: 'Conferencia Innovación 2023', registrations: 245, revenue: 61250 },
            { id: 2, title: 'Taller Marketing Digital', registrations: 89, revenue: 10680 },
            { id: 3, title: 'Networking Empresarial', registrations: 156, revenue: 7800 },
          ],
          eventsByStatus: [
            { status: 'published', count: 89, percentage: 57.1 },
            { status: 'completed', count: 45, percentage: 28.8 },
            { status: 'draft', count: 22, percentage: 14.1 },
          ],
          revenueByCategory: [
            { category: 'Conferencias', revenue: 125680, percentage: 51.2 },
            { category: 'Talleres', revenue: 78450, percentage: 31.9 },
            { category: 'Cursos', revenue: 41550, percentage: 16.9 },
          ],
          monthlyTrends: [
            { month: 'Ene', events: 12, registrations: 245, revenue: 18500 },
            { month: 'Feb', events: 15, registrations: 289, revenue: 22100 },
            { month: 'Mar', events: 18, registrations: 334, revenue: 25600 },
            { month: 'Abr', events: 22, registrations: 412, revenue: 31500 },
            { month: 'May', events: 25, registrations: 467, revenue: 35800 },
            { month: 'Jun', events: 28, registrations: 523, revenue: 40100 },
          ]
        };

        setAnalyticsData(mockData);
      }, 'Error cargando datos de analytics');

      await loadData();
    } catch (error) {
      console.error('Error in loadAnalyticsData:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const exportAnalytics = () => {
    // Implementar exportación de analytics
    toast.success('Exportando datos de analytics...');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error cargando datos de analytics. Inténtalo nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.activeEvents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inscripciones</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalRegistrations.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="events">Eventos por Mes</SelectItem>
              <SelectItem value="revenue">Ingresos por Mes</SelectItem>
              <SelectItem value="registrations">Inscripciones por Mes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAnalyticsData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendencias Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {chartType === 'events' && 'Gráfico de eventos por mes'}
                  {chartType === 'revenue' && 'Gráfico de ingresos por mes'}
                  {chartType === 'registrations' && 'Gráfico de inscripciones por mes'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  (Implementación pendiente - requiere librería de gráficos)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eventos más populares */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topEvents.map((event, index) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-600">
                      {event.registrations} inscripciones • {formatCurrency(event.revenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos por estado */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.eventsByStatus.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm capitalize">{status.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{status.count}</span>
                    <span className="text-sm text-gray-600 ml-2">({formatPercentage(status.percentage)})</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ingresos por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.revenueByCategory.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(category.revenue)}</span>
                    <span className="text-sm text-gray-600 ml-2">({formatPercentage(category.percentage)})</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métrica adicional */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatPercentage(analyticsData.averageAttendanceRate)}
            </div>
            <p className="text-gray-600">Tasa Promedio de Asistencia</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventAnalyticsDashboard;