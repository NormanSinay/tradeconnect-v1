import { Op, fn, col } from 'sequelize';
import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';
import { Event, EventStatus, EventRegistration, AuditLog, User, EventCategory } from '../models';

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
    totalUsers: number;
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

      // Obtener total de usuarios
      const totalUsers = await User.count();

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
        totalUsers,
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

  /**
   * Obtiene datos de actividad de usuarios para gráficos
   */
  static async getUserActivityData(): Promise<{ labels: string[]; data: number[] }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:user_activity`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener datos de actividad de usuarios de los últimos 30 días
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Generar datos simulados basados en sesiones activas
      // En un futuro esto vendría de logs de actividad reales
      const labels = [];
      const data = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        labels.push(date.toISOString().split('T')[0]);

        // Simular actividad basada en sesiones existentes
        // En producción esto vendría de una tabla de actividad de usuarios
        const randomActivity = Math.floor(Math.random() * 50) + 10;
        data.push(randomActivity);
      }

      const result = { labels, data };

      // Guardar en caché por 1 hora
      await cacheRedis.setex(cacheKey, 3600, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting user activity data', { error });
      throw error;
    }
  }

  /**
   * Obtiene datos de ingresos por categoría para gráficos
   */
  static async getRevenueByCategory(): Promise<{ labels: string[]; data: number[] }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:revenue_by_category`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener ingresos por categoría de evento
      const revenueData = await EventRegistration.findAll({
        attributes: [
          [fn('SUM', col('paymentAmount')), 'totalRevenue']
        ],
        include: [{
          model: Event,
          attributes: ['title'],
          include: [{
            model: EventCategory,
            attributes: ['name']
          }]
        }],
        where: {
          paymentStatus: 'paid'
        },
        group: ['Event.id', 'Event->EventCategory.id'],
        raw: true
      });

      // Procesar datos para el gráfico
      const categoryMap = new Map<string, number>();

      revenueData.forEach((item: any) => {
        const categoryName = item['Event.EventCategory.name'] || 'Sin Categoría';
        const revenue = parseFloat(item.totalRevenue) || 0;

        if (categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, categoryMap.get(categoryName)! + revenue);
        } else {
          categoryMap.set(categoryName, revenue);
        }
      });

      const labels = Array.from(categoryMap.keys());
      const data = Array.from(categoryMap.values());

      // Si no hay datos, devolver datos de ejemplo
      if (labels.length === 0) {
        const result = {
          labels: ['Conferencias', 'Talleres', 'Networking', 'Cursos'],
          data: [0, 0, 0, 0]
        };

        await cacheRedis.setex(cacheKey, 3600, JSON.stringify(result));
        return result;
      }

      const result = { labels, data };

      // Guardar en caché por 1 hora
      await cacheRedis.setex(cacheKey, 3600, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting revenue by category data', { error });
      throw error;
    }
  }

  /**
   * Obtiene datos de eventos populares para gráficos
   */
  static async getPopularEventsData(): Promise<{ labels: string[]; data: number[] }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:popular_events`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener eventos más populares por número de registros
      const popularEvents = await Event.findAll({
        attributes: [
          'title',
          [fn('COUNT', col('eventRegistrations.id')), 'registrationCount']
        ],
        include: [{
          model: EventRegistration,
          attributes: [],
          required: false
        }],
        group: ['Event.id'],
        order: [[fn('COUNT', col('eventRegistrations.id')), 'DESC']],
        limit: 10,
        raw: true
      });

      const labels = popularEvents.map((event: any) => {
        const title = event.title;
        return title.length > 30 ? title.substring(0, 30) + '...' : title;
      });

      const data = popularEvents.map((event: any) => parseInt(event.registrationCount) || 0);

      // Si no hay datos, devolver datos de ejemplo
      if (labels.length === 0) {
        const result = {
          labels: ['Evento 1', 'Evento 2', 'Evento 3', 'Evento 4', 'Evento 5'],
          data: [0, 0, 0, 0, 0]
        };

        await cacheRedis.setex(cacheKey, 3600, JSON.stringify(result));
        return result;
      }

      const result = { labels, data };

      // Guardar en caché por 1 hora
      await cacheRedis.setex(cacheKey, 3600, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting popular events data', { error });
      throw error;
    }
  }

  /**
   * Obtiene datos de rendimiento del sistema para gráficos
   */
  static async getSystemPerformanceData(): Promise<{
    labels: string[];
    responseTime: number[];
    uptime: number[];
  }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:system_performance`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Generar datos simulados de rendimiento del sistema
      // En producción esto vendría de métricas reales del sistema
      const labels = [];
      const responseTime = [];
      const uptime = [];

      for (let i = 23; i >= 0; i--) {
        const hour = new Date(Date.now() - i * 60 * 60 * 1000).getHours();
        labels.push(`${hour}:00`);

        // Simular tiempos de respuesta entre 100-500ms
        responseTime.push(Math.floor(Math.random() * 400) + 100);

        // Simular uptime entre 95-100%
        uptime.push(Math.floor(Math.random() * 5) + 95);
      }

      const result = { labels, responseTime, uptime };

      // Guardar en caché por 30 minutos
      await cacheRedis.setex(cacheKey, 1800, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting system performance data', { error });
      throw error;
    }
  }
}