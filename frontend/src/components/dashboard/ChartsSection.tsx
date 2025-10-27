import React, { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface ChartsSectionProps {
  activeTab: string;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ activeTab }) => {
  const [userActivityData, setUserActivityData] = useState<ChartData | null>(null);
  const [revenueData, setRevenueData] = useState<ChartData | null>(null);
  const [popularEventsData, setPopularEventsData] = useState<ChartData | null>(null);
  const [systemPerformanceData, setSystemPerformanceData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadChartData();
    }
  }, [activeTab]);

  const loadChartData = async () => {
    try {
      setLoading(true);

      // Cargar datos de actividad de usuarios (últimos 30 días)
      const userActivity = await DashboardService.getUserActivityData();
      setUserActivityData({
        labels: userActivity.labels,
        datasets: [{
          label: 'Usuarios Activos',
          data: userActivity.data,
          backgroundColor: 'rgba(107, 30, 34, 0.6)',
          borderColor: 'rgba(107, 30, 34, 1)',
          borderWidth: 1
        }]
      });

      // Cargar datos de ingresos por categoría
      const revenue = await DashboardService.getRevenueByCategory();
      setRevenueData({
        labels: revenue.labels,
        datasets: [{
          label: 'Ingresos (Q)',
          data: revenue.data,
          backgroundColor: [
            'rgba(107, 30, 34, 0.6)',
            'rgba(44, 90, 160, 0.6)',
            'rgba(40, 167, 69, 0.6)',
            'rgba(255, 193, 7, 0.6)',
            'rgba(220, 53, 69, 0.6)'
          ],
          borderWidth: 1
        }]
      });

      // Cargar datos de eventos más populares
      const popularEvents = await DashboardService.getPopularEventsData();
      setPopularEventsData({
        labels: popularEvents.labels,
        datasets: [{
          label: 'Inscripciones',
          data: popularEvents.data,
          backgroundColor: 'rgba(44, 90, 160, 0.6)',
          borderColor: 'rgba(44, 90, 160, 1)',
          borderWidth: 1
        }]
      });

      // Cargar datos de rendimiento del sistema
      const systemPerformance = await DashboardService.getSystemPerformanceData();
      setSystemPerformanceData({
        labels: systemPerformance.labels,
        datasets: [{
          label: 'Tiempo de Respuesta (ms)',
          data: systemPerformance.responseTime,
          backgroundColor: 'rgba(40, 167, 69, 0.6)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1
        }, {
          label: 'Uptime (%)',
          data: systemPerformance.uptime,
          backgroundColor: 'rgba(255, 193, 7, 0.6)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 1
        }]
      });

    } catch (error) {
      console.error('Error loading chart data:', error);
      // Fallback con datos simulados
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Datos simulados para cuando las APIs no estén disponibles
    setUserActivityData({
      labels: ['Día 1', 'Día 5', 'Día 10', 'Día 15', 'Día 20', 'Día 25', 'Día 30'],
      datasets: [{
        label: 'Usuarios Activos',
        data: [120, 150, 180, 200, 220, 250, 280],
        backgroundColor: 'rgba(107, 30, 34, 0.6)',
        borderColor: 'rgba(107, 30, 34, 1)',
        borderWidth: 1
      }]
    });

    setRevenueData({
      labels: ['Eventos', 'Cursos', 'Certificaciones', 'Suscripciones', 'Otros'],
      datasets: [{
        label: 'Ingresos (Q)',
        data: [150000, 75000, 25000, 15000, 10000],
        backgroundColor: [
          'rgba(107, 30, 34, 0.6)',
          'rgba(44, 90, 160, 0.6)',
          'rgba(40, 167, 69, 0.6)',
          'rgba(255, 193, 7, 0.6)',
          'rgba(220, 53, 69, 0.6)'
        ],
        borderWidth: 1
      }]
    });

    setPopularEventsData({
      labels: ['Conferencia Innovación', 'Taller Marketing', 'Networking Empresarial', 'Seminario Liderazgo', 'Curso Finanzas'],
      datasets: [{
        label: 'Inscripciones',
        data: [245, 89, 156, 78, 67],
        backgroundColor: 'rgba(44, 90, 160, 0.6)',
        borderColor: 'rgba(44, 90, 160, 1)',
        borderWidth: 1
      }]
    });

    setSystemPerformanceData({
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      datasets: [{
        label: 'Tiempo de Respuesta (ms)',
        data: [120, 95, 110, 85, 100, 90, 105],
        backgroundColor: 'rgba(40, 167, 69, 0.6)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1
      }, {
        label: 'Uptime (%)',
        data: [99.9, 99.8, 99.9, 99.7, 99.9, 99.8, 99.9],
        backgroundColor: 'rgba(255, 193, 7, 0.6)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1
      }]
    });
  };

  const renderChart = (data: ChartData | null, title: string, icon: React.ReactNode) => {
    if (loading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!data) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              No hay datos disponibles
            </div>
          </CardContent>
        </Card>
      );
    }

    // Renderizado simplificado de gráficos (en producción usar Chart.js o Recharts)
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Gráfico interactivo - {data.datasets[0].label}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.labels.length} puntos de datos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (activeTab !== 'dashboard') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {renderChart(
        userActivityData,
        'Actividad de Usuarios',
        <Users className="w-5 h-5" />
      )}

      {renderChart(
        revenueData,
        'Ingresos por Categoría',
        <DollarSign className="w-5 h-5" />
      )}

      {renderChart(
        popularEventsData,
        'Eventos Más Populares',
        <TrendingUp className="w-5 h-5" />
      )}

      {renderChart(
        systemPerformanceData,
        'Rendimiento del Sistema',
        <BarChart3 className="w-5 h-5" />
      )}
    </motion.div>
  );
};

export default ChartsSection;