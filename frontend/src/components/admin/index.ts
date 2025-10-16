// Admin Components Barrel Export
// Created: 2025-10-14
// Purpose: Centralized exports for all admin components

export { default as AdminSidebar } from './AdminSidebar';
export { default as DashboardKPIs } from './DashboardKPIs';
export { default as DashboardCharts } from './DashboardCharts';
export { default as EventsTable } from './EventsTable';
export { default as EventFormWizard } from './EventFormWizard';
export { default as RegistrationsTable } from './RegistrationsTable';
export { default as ReportsGenerator } from './ReportsGenerator';

// Export types
export type { KPIData } from './DashboardKPIs';
export type { ChartData } from './DashboardCharts';
export type { Event } from './EventsTable';
export type { Registration } from './RegistrationsTable';
