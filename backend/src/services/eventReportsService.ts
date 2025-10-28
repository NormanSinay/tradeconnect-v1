import { Op } from 'sequelize';
import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';
import { Event, EventStatus, EventRegistration, AuditLog } from '../models';

export class EventReportsService {
  private static readonly CACHE_PREFIX = 'event_reports';

  /**
   * Obtiene métricas generales del sistema de eventos
   */
  static async getSystemMetrics(): Promise<{
    totalEvents: number;
    activeEvents: number;
    totalRegistrations: number;
    totalRevenue: number;
    averageAttendanceRate: number;
    totalCourses: number;
    userSatisfaction: number;
    incidentReports: number;
  }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:system_metrics`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener métricas existentes
      const totalEvents = await Event.count();
      const activeEvents = await Event.count({
        include: [{
          model: EventStatus,
          where: { name: 'published' }
        }]
      });

      const totalRegistrations = await EventRegistration.count();
      const totalRevenueResult = await EventRegistration.sum('paymentAmount', {
        where: { paymentStatus: 'paid' }
      }) || 0;

      // Calcular tasa de asistencia promedio
      const eventsWithAttendance = await Event.findAll({
        where: { endDate: { [Op.lt]: new Date() } }
      });

      let totalAttendanceRate = 0;
      let eventsWithData = 0;

      for (const event of eventsWithAttendance) {
        const registrations = await EventRegistration.findAll({
          where: { eventId: event.id }
        });
        const attendees = registrations.filter((r: EventRegistration) => r.status === 'attended').length;
        if (registrations.length > 0) {
          totalAttendanceRate += (attendees / registrations.length) * 100;
          eventsWithData += 1;
        }
      }

      const averageAttendanceRate = eventsWithData > 0 ? totalAttendanceRate / eventsWithData : 0;

      // === NUEVAS MÉTRICAS ===

      // Total de cursos (por ahora 0, ya que no hay modelo de cursos)
      const totalCourses = 0;

      // Satisfacción de usuarios (simulada basada en asistencia y reseñas)
      // En un futuro esto vendría de un sistema de reseñas/encuestas
      const userSatisfaction = averageAttendanceRate > 0 ? Math.min(100, averageAttendanceRate + 10) : 0;

      // Reportes de incidentes (contar logs de auditoría críticos)
      const recentIncidents = await AuditLog.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
          },
          action: {
            [Op.in]: ['login_failed', 'access_denied', 'security_violation', 'rate_limit_exceeded']
          }
        }
      });

      const metrics = {
        totalEvents,
        activeEvents,
        totalRegistrations,
        totalRevenue: totalRevenueResult,
        averageAttendanceRate,
        totalCourses,
        userSatisfaction: Math.round(userSatisfaction * 100) / 100, // Redondear a 2 decimales
        incidentReports: recentIncidents
      };

      // Guardar en caché por 15 minutos
      await cacheRedis.setex(cacheKey, 900, JSON.stringify(metrics));

      return metrics;
    } catch (error) {
      logger.error('Error getting system metrics', { error });
      throw error;
    }
  }

  /**
   * Genera reporte de ventas
   */
  static async generateSalesReport(filters: any): Promise<any> {
    try {
      // Implementación básica del reporte de ventas
      const totalEvents = await Event.count();
      const totalRevenue = await EventRegistration.sum('paymentAmount', {
        where: { paymentStatus: 'paid' }
      }) || 0;
      const totalRegistrations = await EventRegistration.count();
      const paidRegistrations = await EventRegistration.count({
        where: { paymentStatus: 'paid' }
      });

      return {
        totalEvents,
        totalRevenue,
        totalRegistrations,
        paidRegistrations,
        averagePrice: paidRegistrations > 0 ? totalRevenue / paidRegistrations : 0,
        topEvents: [],
        revenueByCategory: []
      };
    } catch (error) {
      logger.error('Error generating sales report', { error });
      throw error;
    }
  }

  /**
   * Genera reporte de asistencia
   */
  static async generateAttendanceReport(filters: any): Promise<any> {
    try {
      // Implementación básica del reporte de asistencia
      const totalEvents = await Event.count();
      const totalAttendees = await EventRegistration.count({
        where: { status: 'attended' }
      });

      return {
        totalEvents,
        totalAttendees,
        averageAttendance: totalEvents > 0 ? totalAttendees / totalEvents : 0,
        attendanceRate: totalEvents > 0 ? (totalAttendees / totalEvents) * 100 : 0,
        topAttendedEvents: [],
        attendanceByCategory: []
      };
    } catch (error) {
      logger.error('Error generating attendance report', { error });
      throw error;
    }
  }

  /**
   * Genera analytics de un evento específico
   */
  static async generateEventAnalytics(eventId: number): Promise<any> {
    try {
      const event = await Event.findByPk(eventId);
      if (!event) {
        throw new Error('Evento no encontrado');
      }

      const registrations = await EventRegistration.count({
        where: { eventId }
      });

      const attendees = await EventRegistration.count({
        where: { eventId, status: 'attended' }
      });

      return {
        eventId,
        eventTitle: event.title,
        totalRegistrations: registrations,
        attendees,
        attendanceRate: registrations > 0 ? (attendees / registrations) * 100 : 0
      };
    } catch (error) {
      logger.error('Error generating event analytics', { error, eventId });
      throw error;
    }
  }
}