// ====================================================================
// SERVICIO DE DASHBOARD ADMINISTRATIVO
// ====================================================================
// @fileoverview Servicio para gestión de KPIs, métricas y estadísticas del dashboard
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  DashboardKPI,
  PerformanceMetric,
  SystemStats,
  DashboardSummary,
  DashboardAlert,
  LineChartData,
  BarChartData,
  PieChartData,
  ChartConfig,
  RevenueReport,
  UserReport,
  EventReport,
  DashboardFilters,
  AnalyticsQueryParams,
  AnalyticsResult,
  TimePeriod,
  MetricType,
  ExportFormat,
  RefreshInterval,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión del dashboard administrativo
 * Proporciona métodos para obtener KPIs, métricas, estadísticas y reportes
 */
export class AdminDashboardService {
  private readonly baseUrl = '/admin/dashboard'

  // ====================================================================
  // KPIs Y MÉTRICAS PRINCIPALES
  // ====================================================================

  /**
   * Obtiene los KPIs principales del dashboard
   */
  async getKPIs(filters?: DashboardFilters): Promise<DashboardKPI[]> {
    try {
      const response = await api.get(`${this.baseUrl}/kpis`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo KPIs:', error)
      throw error
    }
  }

  /**
   * Obtiene métricas de rendimiento del sistema
   */
  async getPerformanceMetrics(
    timePeriod: TimePeriod = 'last_30_days' as TimePeriod
  ): Promise<PerformanceMetric[]> {
    try {
      const response = await api.get(
        `${this.baseUrl}/performance`,
        {
          params: { timePeriod },
        }
      )
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo métricas de rendimiento:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas del sistema
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await api.get(`${this.baseUrl}/system-stats`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas del sistema:', error)
      throw error
    }
  }

  /**
   * Obtiene resumen general del dashboard
   */
  async getDashboardSummary(
    filters?: DashboardFilters
  ): Promise<DashboardSummary> {
    try {
      const response = await api.get(
        `${this.baseUrl}/summary`,
        {
          params: filters,
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo resumen del dashboard:', error)
      throw error
    }
  }

  // ====================================================================
  // ALERTAS Y NOTIFICACIONES
  // ====================================================================

  /**
   * Obtiene alertas activas del dashboard
   */
  async getAlerts(
    filters?: { priority?: string[]; dismissed?: boolean }
  ): Promise<DashboardAlert[]> {
    try {
      const response = await api.get(
        `${this.baseUrl}/alerts`,
        {
          params: filters,
        }
      )
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo alertas:', error)
      throw error
    }
  }

  /**
   * Marca una alerta como descartada
   */
  async dismissAlert(alertId: string): Promise<AdminOperationResult> {
    try {
      const response = await api.patch(
        `${this.baseUrl}/alerts/${alertId}/dismiss`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error descartando alerta:', error)
      throw error
    }
  }

  // ====================================================================
  // DATOS PARA GRÁFICOS
  // ====================================================================

  /**
   * Obtiene datos para gráficos de línea
   */
  async getLineChartData(
    metricType: MetricType,
    config: ChartConfig
  ): Promise<LineChartData> {
    try {
      const response = await api.get(
        `${this.baseUrl}/charts/line`,
        {
          params: { metricType, ...config },
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo datos de gráfico de línea:', error)
      throw error
    }
  }

  /**
   * Obtiene datos para gráficos de barras
   */
  async getBarChartData(
    metricType: MetricType,
    config: ChartConfig
  ): Promise<BarChartData> {
    try {
      const response = await api.get(
        `${this.baseUrl}/charts/bar`,
        {
          params: { metricType, ...config },
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo datos de gráfico de barras:', error)
      throw error
    }
  }

  /**
   * Obtiene datos para gráficos circulares
   */
  async getPieChartData(
    metricType: MetricType,
    config: ChartConfig
  ): Promise<PieChartData> {
    try {
      const response = await api.get(
        `${this.baseUrl}/charts/pie`,
        {
          params: { metricType, ...config },
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo datos de gráfico circular:', error)
      throw error
    }
  }

  // ====================================================================
  // REPORTES
  // ====================================================================

  /**
   * Obtiene reporte de ingresos
   */
  async getRevenueReport(
    filters: DashboardFilters
  ): Promise<RevenueReport> {
    try {
      const response = await api.get(
        `${this.baseUrl}/reports/revenue`,
        {
          params: filters,
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de ingresos:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte de usuarios
   */
  async getUserReport(
    filters: DashboardFilters
  ): Promise<UserReport> {
    try {
      const response = await api.get(
        `${this.baseUrl}/reports/users`,
        {
          params: filters,
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de usuarios:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte de eventos
   */
  async getEventReport(
    filters: DashboardFilters
  ): Promise<EventReport> {
    try {
      const response = await api.get(
        `${this.baseUrl}/reports/events`,
        {
          params: filters,
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de eventos:', error)
      throw error
    }
  }

  // ====================================================================
  // ANALYTICS Y CONSULTAS AVANZADAS
  // ====================================================================

  /**
   * Ejecuta consultas de analytics personalizadas
   */
  async executeAnalyticsQuery(
    params: AnalyticsQueryParams
  ): Promise<AnalyticsResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/analytics/query`,
        params
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error ejecutando consulta de analytics:', error)
      throw error
    }
  }

  /**
   * Obtiene métricas en tiempo real
   */
  async getRealTimeMetrics(): Promise<PerformanceMetric[]> {
    try {
      const response = await api.get(
        `${this.baseUrl}/realtime/metrics`
      )
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo métricas en tiempo real:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN DE DATOS
  // ====================================================================

  /**
   * Exporta datos del dashboard en diferentes formatos
   */
  async exportDashboardData(
    format: ExportFormat,
    filters?: DashboardFilters
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando datos del dashboard:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN Y PREFERENCIAS
  // ====================================================================

  /**
   * Actualiza el intervalo de refresco del dashboard
   */
  async updateRefreshInterval(
    interval: RefreshInterval
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.patch(
        `${this.baseUrl}/settings/refresh-interval`,
        { interval }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando intervalo de refresco:', error)
      throw error
    }
  }

  /**
   * Obtiene configuración actual del dashboard
   */
  async getDashboardConfig(): Promise<{
    refreshInterval: RefreshInterval
    defaultFilters: DashboardFilters
    enabledCharts: string[]
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/settings`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuración del dashboard:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminDashboardService = new AdminDashboardService()