import React, { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, AlertTriangle, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  userActivity: { labels: string[]; data: number[] };
  revenueByCategory: { labels: string[]; data: number[] };
  popularEvents: { labels: string[]; data: number[] };
  systemPerformance: { labels: string[]; responseTime: number[]; uptime: number[] };
}

const AnalyticsTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { withErrorHandling } = useErrorHandler();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userActivity: { labels: [], data: [] },
    revenueByCategory: { labels: [], data: [] },
    popularEvents: { labels: [], data: [] },
    systemPerformance: { labels: [], responseTime: [], uptime: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalyticsData();
    }
  }, [activeTab]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      const loadData = withErrorHandling(async () => {
        const [
          userActivity,
          revenueByCategory,
          popularEvents,
          systemPerformance
        ] = await Promise.all([
          DashboardService.getUserActivityData(),
          DashboardService.getRevenueByCategory(),
          DashboardService.getPopularEventsData(),
          DashboardService.getSystemPerformanceData()
        ]);

        setAnalyticsData({
          userActivity,
          revenueByCategory,
          popularEvents,
          systemPerformance
        });
      }, 'Error al cargar los datos de analítica');

      await loadData();
    } catch (error) {
      console.error('Error in loadAnalyticsData:', error);
      // Mantener datos vacíos si hay error
      setAnalyticsData({
        userActivity: { labels: [], data: [] },
        revenueByCategory: { labels: [], data: [] },
        popularEvents: { labels: [], data: [] },
        systemPerformance: { labels: [], responseTime: [], uptime: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  const renderUserActivityChart = () => {
    const data = {
      labels: analyticsData.userActivity.labels,
      datasets: [
        {
          label: 'Actividad de Usuarios',
          data: analyticsData.userActivity.data,
          borderColor: 'rgb(107, 30, 34)',
          backgroundColor: 'rgba(107, 30, 34, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Actividad de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRevenueByCategoryChart = () => {
    const data = {
      labels: analyticsData.revenueByCategory.labels,
      datasets: [
        {
          label: 'Ingresos por Categoría',
          data: analyticsData.revenueByCategory.data,
          backgroundColor: [
            'rgba(107, 30, 34, 0.8)',
            'rgba(44, 90, 160, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
          ],
          borderColor: [
            'rgb(107, 30, 34)',
            'rgb(44, 90, 160)',
            'rgb(40, 167, 69)',
            'rgb(255, 193, 7)',
            'rgb(220, 53, 69)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        title: {
          display: false,
        },
      },
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Ingresos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPopularEventsChart = () => {
    const data = {
      labels: analyticsData.popularEvents.labels,
      datasets: [
        {
          label: 'Registros',
          data: analyticsData.popularEvents.data,
          backgroundColor: 'rgba(107, 30, 34, 0.8)',
          borderColor: 'rgb(107, 30, 34)',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Eventos Más Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSystemPerformanceChart = () => {
    const data = {
      labels: analyticsData.systemPerformance.labels,
      datasets: [
        {
          label: 'Tiempo de Respuesta (ms)',
          data: analyticsData.systemPerformance.responseTime,
          borderColor: 'rgb(107, 30, 34)',
          backgroundColor: 'rgba(107, 30, 34, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
        },
        {
          label: 'Uptime (%)',
          data: analyticsData.systemPerformance.uptime,
          borderColor: 'rgb(40, 167, 69)',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          yAxisID: 'y1',
          tension: 0.4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      stacked: false,
      plugins: {
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Tiempo de Respuesta (ms)',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Uptime (%)',
          },
          grid: {
            drawOnChartArea: false,
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Rendimiento del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Alertas de estado */}
      <Alert className="border-blue-200 bg-blue-50">
        <BarChart3 className="h-4 w-4" />
        <AlertDescription>
          <strong>Analítica del Sistema:</strong> Vista detallada de métricas y gráficos de rendimiento.
          Los gráficos se actualizarán automáticamente con datos reales del sistema.
        </AlertDescription>
      </Alert>

      {/* Actividad de Usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderUserActivityChart()}
        {renderRevenueByCategoryChart()}
      </div>

      {/* Eventos Populares y Rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderPopularEventsChart()}
        {renderSystemPerformanceChart()}
      </div>

      {/* Actividad Reciente del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Actividad Reciente del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>La API de auditoría no está implementada aún.</p>
            <p className="text-sm">Esta sección mostrará logs de actividad cuando esté disponible.</p>
          </div>
        </CardContent>
      </Card>

    </motion.div>
  );
};

export default AnalyticsTab;