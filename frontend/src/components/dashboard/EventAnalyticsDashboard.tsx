import React, { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Target, BarChart3, PieChart, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventAnalyticsDashboardProps {
  filters: {
    dateRange: {
      startDate: string;
      endDate: string;
    };
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
  totalRegistrations: number;
  totalRevenue: number;
  averageAttendanceRate: number;
  conversionRate: number;
  topEvents: Array<{
    id: number;
    title: string;
    registrations: number;
    revenue: number;
    attendanceRate: number;
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
  registrationTrends: Array<{
    date: string;
    registrations: number;
    revenue: number;
  }>;
  attendanceTrends: Array<{
    date: string;
    attended: number;
    registered: number;
  }>;
}

const EventAnalyticsDashboard: React.FC<EventAnalyticsDashboardProps> = ({
  filters,
  permissions,
  withErrorHandling
}) => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        // Obtener datos de analytics usando el servicio
        const analyticsResult = await DashboardService.getEventAnalytics({
          startDate: filters.dateRange.startDate,
          endDate: filters.dateRange.endDate,
          eventId: filters.eventId,
          eventTypeId: filters.eventTypeId,
          eventCategoryId: filters.eventCategoryId,
        });

        // Obtener métricas del sistema
        const systemMetrics = await DashboardService.getSystemMetrics();

        // Combinar datos
        const combinedData: AnalyticsData = {
          totalEvents: systemMetrics.totalEvents || 0,
          totalRegistrations: systemMetrics.totalRegistrations || 0,
          totalRevenue: systemMetrics.totalRevenue || 0,
          averageAttendanceRate: systemMetrics.averageAttendanceRate || 0,
          conversionRate: analyticsResult.conversionRate || 0,
          topEvents: analyticsResult.topEvents || [],
          eventsByStatus: analyticsResult.eventsByStatus || [],
          revenueByCategory: analyticsResult.revenueByCategory || [],
          registrationTrends: analyticsResult.registrationTrends || [],
          attendanceTrends: analyticsResult.attendanceTrends || [],
        };

        setAnalyticsData(combinedData);
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
    return `${(value * 100).toFixed(1)}%`;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }> = ({ title, value, change, icon, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500 mr-1" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}
                <span className={`text-sm ${
                  trend === 'up' ? 'text-green-500' :
                  trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Cargando analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No se pudieron cargar los datos de analytics. Intente nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Eventos"
          value={analyticsData.totalEvents}
          icon={<Calendar className="h-8 w-8" />}
        />
        <MetricCard
          title="Total Inscripciones"
          value={analyticsData.totalRegistrations}
          icon={<Users className="h-8 w-8" />}
        />
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(analyticsData.totalRevenue)}
          icon={<DollarSign className="h-8 w-8" />}
        />
        <MetricCard
          title="Tasa de Asistencia"
          value={formatPercentage(analyticsData.averageAttendanceRate)}
          icon={<Target className="h-8 w-8" />}
        />
      </div>

      {/* Gráficos y análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Eventos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.eventsByStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      status.status === 'published' ? 'default' :
                      status.status === 'completed' ? 'secondary' :
                      status.status === 'cancelled' ? 'destructive' : 'outline'
                    }>
                      {status.status}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {status.count} eventos
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPercentage(status.percentage)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ingresos por categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ingresos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.revenueByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrency(category.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage(category.percentage)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos más populares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Eventos Más Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topEvents.slice(0, 5).map((event, index) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{event.registrations} inscritos</span>
                        <span>{formatCurrency(event.revenue)} ingresos</span>
                        <span>{formatPercentage(event.attendanceRate)} asistencia</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de inscripciones */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Inscripciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData.registrationTrends.slice(-7).map((trend, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm">
                    {new Date(trend.date).toLocaleDateString('es-GT')}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{trend.registrations}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatCurrency(trend.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendencia de asistencia */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData.attendanceTrends.slice(-7).map((trend, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm">
                    {new Date(trend.date).toLocaleDateString('es-GT')}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {trend.attended}/{trend.registered}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatPercentage(trend.registered > 0 ? trend.attended / trend.registered : 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón de actualizar */}
      <div className="flex justify-center">
        <Button onClick={loadAnalyticsData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar Datos
        </Button>
      </div>
    </div>
  );
};

export default EventAnalyticsDashboard;