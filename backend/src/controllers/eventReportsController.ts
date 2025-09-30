/**
 * @fileoverview Controlador de Reportes y Analytics para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de reportes y analytics de eventos
 *
 * Archivo: backend/src/controllers/eventReportsController.ts
 */

import { Request, Response } from 'express';
import { EventReportsService } from '../services/eventReportsService';
import { successResponse, errorResponse } from '../utils/common.utils';
import { logger } from '../utils/logger';

export class EventReportsController {
  // ====================================================================
  // REPORTES DE VENTAS
  // ====================================================================

  /**
   * Genera reporte de ventas
   */
  static async getSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        eventId,
        categoryId,
        typeId,
        status,
        organizerId
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        eventId: eventId ? parseInt(eventId as string, 10) : undefined,
        categoryId: categoryId ? parseInt(categoryId as string, 10) : undefined,
        typeId: typeId ? parseInt(typeId as string, 10) : undefined,
        status: status as string,
        organizerId: organizerId ? parseInt(organizerId as string, 10) : undefined
      };

      const report = await EventReportsService.generateSalesReport(filters);

      res.json(successResponse(report, 'Reporte de ventas generado exitosamente'));
    } catch (error) {
      logger.error('Error getting sales report', { error, query: req.query });
      res.status(500).json(errorResponse('Error al generar reporte de ventas'));
    }
  }

  // ====================================================================
  // REPORTES DE ASISTENCIA
  // ====================================================================

  /**
   * Genera reporte de asistencia
   */
  static async getAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        eventId,
        categoryId,
        typeId,
        status,
        organizerId
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        eventId: eventId ? parseInt(eventId as string, 10) : undefined,
        categoryId: categoryId ? parseInt(categoryId as string, 10) : undefined,
        typeId: typeId ? parseInt(typeId as string, 10) : undefined,
        status: status as string,
        organizerId: organizerId ? parseInt(organizerId as string, 10) : undefined
      };

      const report = await EventReportsService.generateAttendanceReport(filters);

      res.json(successResponse(report, 'Reporte de asistencia generado exitosamente'));
    } catch (error) {
      logger.error('Error getting attendance report', { error, query: req.query });
      res.status(500).json(errorResponse('Error al generar reporte de asistencia'));
    }
  }

  // ====================================================================
  // ANALYTICS DE EVENTOS
  // ====================================================================

  /**
   * Genera analytics de un evento específico
   */
  static async getEventAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId || isNaN(parseInt(eventId, 10))) {
        res.status(400).json(errorResponse('ID de evento inválido'));
        return;
      }

      const analytics = await EventReportsService.generateEventAnalytics(parseInt(eventId, 10));

      res.json(successResponse(analytics, 'Analytics del evento generados exitosamente'));
    } catch (error) {
      logger.error('Error getting event analytics', { error, eventId: req.params.eventId });

      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al generar analytics del evento'));
    }
  }

  // ====================================================================
  // MÉTRICAS DEL SISTEMA
  // ====================================================================

  /**
   * Obtiene métricas generales del sistema
   */
  static async getSystemMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await EventReportsService.getSystemMetrics();

      res.json(successResponse(metrics, 'Métricas del sistema obtenidas exitosamente'));
    } catch (error) {
      logger.error('Error getting system metrics', { error });
      res.status(500).json(errorResponse('Error al obtener métricas del sistema'));
    }
  }

  // ====================================================================
  // EXPORTACIÓN DE REPORTES
  // ====================================================================

  /**
   * Exporta reporte de ventas en formato CSV
   */
  static async exportSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        eventId,
        categoryId,
        typeId,
        status,
        organizerId
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        eventId: eventId ? parseInt(eventId as string, 10) : undefined,
        categoryId: categoryId ? parseInt(categoryId as string, 10) : undefined,
        typeId: typeId ? parseInt(typeId as string, 10) : undefined,
        status: status as string,
        organizerId: organizerId ? parseInt(organizerId as string, 10) : undefined
      };

      const report = await EventReportsService.generateSalesReport(filters);

      // Generar CSV
      const csvHeader = 'Métrica,Valor\n';
      const csvData = [
        `Total de Eventos,${report.totalEvents}`,
        `Ingresos Totales,${report.totalRevenue}`,
        `Total de Inscripciones,${report.totalRegistrations}`,
        `Inscripciones Pagadas,${report.paidRegistrations}`,
        `Precio Promedio,${report.averagePrice}`,
        '',
        'Top Eventos por Ingresos',
        'ID,Título,Ingresos,Inscripciones'
      ];

      report.topEvents.forEach(event => {
        csvData.push(`${event.eventId},"${event.eventTitle}",${event.revenue},${event.registrations}`);
      });

      csvData.push('', 'Ingresos por Categoría', 'ID,Categoría,Ingresos,Eventos');
      report.revenueByCategory.forEach(cat => {
        csvData.push(`${cat.categoryId},"${cat.categoryName}",${cat.revenue},${cat.events}`);
      });

      const csv = csvHeader + csvData.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sales-report.csv"');
      res.send(csv);
    } catch (error) {
      logger.error('Error exporting sales report', { error, query: req.query });
      res.status(500).json(errorResponse('Error al exportar reporte de ventas'));
    }
  }

  /**
   * Exporta reporte de asistencia en formato CSV
   */
  static async exportAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        eventId,
        categoryId,
        typeId,
        status,
        organizerId
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        eventId: eventId ? parseInt(eventId as string, 10) : undefined,
        categoryId: categoryId ? parseInt(categoryId as string, 10) : undefined,
        typeId: typeId ? parseInt(typeId as string, 10) : undefined,
        status: status as string,
        organizerId: organizerId ? parseInt(organizerId as string, 10) : undefined
      };

      const report = await EventReportsService.generateAttendanceReport(filters);

      // Generar CSV
      const csvHeader = 'Métrica,Valor\n';
      const csvData = [
        `Total de Eventos,${report.totalEvents}`,
        `Total de Asistentes,${report.totalAttendees}`,
        `Asistencia Promedio,${report.averageAttendance}`,
        `Tasa de Asistencia,${report.attendanceRate}%`,
        '',
        'Top Eventos por Asistencia',
        'ID,Título,Inscripciones,Asistentes,Tasa de Asistencia'
      ];

      report.topAttendedEvents.forEach(event => {
        csvData.push(`${event.eventId},"${event.eventTitle}",${event.totalRegistrations},${event.attendees},${event.attendanceRate.toFixed(2)}%`);
      });

      csvData.push('', 'Asistencia por Categoría', 'ID,Categoría,Asistentes,Promedio');
      report.attendanceByCategory.forEach(cat => {
        csvData.push(`${cat.categoryId},"${cat.categoryName}",${cat.totalAttendees},${cat.averageAttendance.toFixed(2)}`);
      });

      const csv = csvHeader + csvData.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.csv"');
      res.send(csv);
    } catch (error) {
      logger.error('Error exporting attendance report', { error, query: req.query });
      res.status(500).json(errorResponse('Error al exportar reporte de asistencia'));
    }
  }
}