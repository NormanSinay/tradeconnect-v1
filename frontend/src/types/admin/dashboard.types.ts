/**
 * @fileoverview Tipos TypeScript para el panel administrativo - Dashboard
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para KPIs, métricas y estadísticas del dashboard administrativo
 */

// ====================================================================
// TIPOS DE KPIs Y MÉTRICAS
// ====================================================================

/**
 * KPI principal del dashboard
 */
export interface DashboardKPI {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'currency' | 'percentage' | 'text';
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Métrica de rendimiento
 */
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  target?: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  trend: number[]; // Array de valores históricos
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

/**
 * Estadística general del sistema
 */
export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  publishedEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  conversionRate: number;
  averageTicketPrice: number;
}

// ====================================================================
// TIPOS DE DASHBOARD
// ====================================================================

/**
 * Resumen del dashboard principal
 */
export interface DashboardSummary {
  kpis: DashboardKPI[];
  metrics: PerformanceMetric[];
  stats: SystemStats;
  alerts: DashboardAlert[];
  lastUpdated: Date;
}

/**
 * Alerta del dashboard
 */
export interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  actionRequired?: boolean;
  actionUrl?: string;
}

// ====================================================================
// TIPOS DE GRÁFICOS Y CHARTS
// ====================================================================

/**
 * Datos para gráfico de líneas
 */
export interface LineChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }>;
}

/**
 * Datos para gráfico de barras
 */
export interface BarChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
}

/**
 * Datos para gráfico circular
 */
export interface PieChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
}

/**
 * Configuración de gráfico
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}

// ====================================================================
// TIPOS DE REPORTES Y ANALYTICS
// ====================================================================

/**
 * Reporte de ingresos
 */
export interface RevenueReport {
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  revenueByPaymentMethod: Record<string, number>;
  revenueByEvent: Array<{
    eventId: number;
    eventTitle: string;
    revenue: number;
    transactions: number;
  }>;
  trends: {
    daily: Array<{ date: string; revenue: number; transactions: number }>;
    weekly: Array<{ week: string; revenue: number; transactions: number }>;
    monthly: Array<{ month: string; revenue: number; transactions: number }>;
  };
}

/**
 * Reporte de usuarios
 */
export interface UserReport {
  period: {
    start: Date;
    end: Date;
  };
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  userGrowth: number;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
  usersByRole: Record<string, number>;
  usersByRegion: Record<string, number>;
  topEventsByAttendance: Array<{
    eventId: number;
    eventTitle: string;
    attendees: number;
  }>;
}

/**
 * Reporte de eventos
 */
export interface EventReport {
  period: {
    start: Date;
    end: Date;
  };
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  completedEvents: number;
  totalCapacity: number;
  totalRegistrations: number;
  averageOccupancyRate: number;
  eventsByCategory: Record<string, number>;
  eventsByStatus: Record<string, number>;
  topPerformingEvents: Array<{
    eventId: number;
    title: string;
    registrations: number;
    revenue: number;
    occupancyRate: number;
  }>;
}

// ====================================================================
// TIPOS DE FILTROS Y CONSULTAS
// ====================================================================

/**
 * Filtros para dashboard
 */
export interface DashboardFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  eventIds?: number[];
  userIds?: number[];
  categories?: string[];
  regions?: string[];
  paymentMethods?: string[];
}

/**
 * Parámetros de consulta para analytics
 */
export interface AnalyticsQueryParams {
  period: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days' | 'custom';
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month' | 'year';
  metrics?: string[];
  filters?: DashboardFilters;
}

/**
 * Resultado de consulta de analytics
 */
export interface AnalyticsResult {
  data: any[];
  summary: Record<string, number>;
  trends: Record<string, number[]>;
  comparisons: Record<string, {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  }>;
}

// ====================================================================
// TIPOS UTILITARIOS
// ====================================================================

/**
 * Períodos de tiempo disponibles
 */
export type TimePeriod = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';

/**
 * Tipos de métricas disponibles
 */
export type MetricType = 'revenue' | 'users' | 'events' | 'registrations' | 'conversion' | 'retention' | 'satisfaction';

/**
 * Formatos de exportación
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

/**
 * Intervalos de actualización
 */
export type RefreshInterval = 'manual' | '30s' | '1m' | '5m' | '15m' | '30m' | '1h';