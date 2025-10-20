/**
 * @fileoverview Admin Components Barrel Export
 *
 * Arquitectura Recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @version 1.0.0
 * @author TradeConnect Team
 * @license MIT
 * @created 2025-10-14
 * @purpose Centralized exports for all admin components
 */

// Component exports
export { default as AdminSidebar } from './AdminSidebar';
export { default as DashboardKPIs } from './DashboardKPIs';
export { default as DashboardCharts } from './DashboardCharts';
export { default as DashboardPage } from './DashboardPage';
export { default as DebugDashboard } from './DebugDashboard';
export { default as EventsTable } from './EventsTable';
export { default as EventFormWizard } from './EventFormWizard';
export { default as RegistrationsTable } from './RegistrationsTable';
export { default as ReportsGenerator } from './ReportsGenerator';

// Type exports
export type { KPIData } from './DashboardKPIs';
export type { ChartData } from './DashboardCharts';
export type { Event } from './EventsTable';
export type { Registration } from './RegistrationsTable';
