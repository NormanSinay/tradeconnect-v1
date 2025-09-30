/**
 * @fileoverview Servicio de Reportes y Analytics para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para generación de reportes y analytics de eventos
 *
 * Archivo: backend/src/services/eventReportsService.ts
 */

import { Op, fn, col, literal } from 'sequelize';
import { Event } from '../models/Event';
import { EventRegistration } from '../models/EventRegistration';
import { EventCategory } from '../models/EventCategory';
import { EventType } from '../models/EventType';
import { EventStatus } from '../models/EventStatus';
import { User } from '../models/User';
import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface ReportFilters extends DateRange {
  eventId?: number;
  categoryId?: number;
  typeId?: number;
  status?: string;
  organizerId?: number;
}

export interface SalesReport {
  totalEvents: number;
  totalRevenue: number;
  totalRegistrations: number;
  paidRegistrations: number;
  averagePrice: number;
  topEvents: Array<{
    eventId: number;
    eventTitle: string;
    revenue: number;
    registrations: number;
  }>;
  revenueByCategory: Array<{
    categoryId: number;
    categoryName: string;
    revenue: number;
    events: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    registrations: number;
  }>;
}

export interface AttendanceReport {
  totalEvents: number;
  totalAttendees: number;
  averageAttendance: number;
  attendanceRate: number;
  topAttendedEvents: Array<{
    eventId: number;
    eventTitle: string;
    totalRegistrations: number;
    attendees: number;
    attendanceRate: number;
  }>;
  attendanceByCategory: Array<{
    categoryId: number;
    categoryName: string;
    totalAttendees: number;
    averageAttendance: number;
  }>;
  checkInTrends: Array<{
    hour: number;
    checkIns: number;
  }>;
}

export interface EventAnalytics {
  eventId: number;
  eventTitle: string;
  status: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  registrations: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    attended: number;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
    averageTicketPrice: number;
  };
  attendance: {
    checkedIn: number;
    checkedOut: number;
    averageDuration: number;
    attendanceRate: number;
  };
  demographics: {
    ageGroups: Array<{
      range: string;
      count: number;
    }>;
    genderDistribution: Array<{
      gender: string;
      count: number;
    }>;
  };
  timeline: Array<{
    date: string;
    registrations: number;
    revenue: number;
  }>;
}

export class EventReportsService {
  private static readonly CACHE_TTL = 1800; // 30 minutes
  private static readonly CACHE_PREFIX = 'event_reports';

  // ====================================================================
  // REPORTES DE VENTAS
  // ====================================================================

  /**
   * Genera reporte de ventas
   */
  static async generateSalesReport(filters: ReportFilters = {}): Promise<SalesReport> {
    try {
      logger.info('Generating sales report', { filters });

      const cacheKey = `${this.CACHE_PREFIX}:sales:${JSON.stringify(filters)}`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const whereClause: any = {};
      const registrationWhere: any = {};

      // Aplicar filtros
      if (filters.startDate || filters.endDate) {
        whereClause.startDate = {};
        if (filters.startDate) whereClause.startDate[Op.gte] = filters.startDate;
        if (filters.endDate) whereClause.startDate[Op.lte] = filters.endDate;
      }

      if (filters.categoryId) {
        whereClause.eventCategoryId = filters.categoryId;
      }

      if (filters.typeId) {
        whereClause.eventTypeId = filters.typeId;
      }

      if (filters.status) {
        whereClause.eventStatusId = filters.status;
      }

      if (filters.organizerId) {
        whereClause.organizerId = filters.organizerId;
      }

      if (filters.eventId) {
        registrationWhere.eventId = filters.eventId;
      }

      // Obtener eventos
      const events = await Event.findAll({
        where: whereClause,
        include: [
          { model: EventCategory, as: 'eventCategory' },
          { model: EventType, as: 'eventType' }
        ]
      });

      // Obtener inscripciones
      const registrations = await EventRegistration.findAll({
        where: registrationWhere,
        include: [
          {
            model: Event,
            where: whereClause,
            required: true
          }
        ]
      });

      // Calcular métricas
      const totalEvents = events.length;
      const totalRegistrations = registrations.length;
      const paidRegistrations = registrations.filter(r => r.paymentStatus === 'paid').length;
      const totalRevenue = registrations
        .filter(r => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + (r.paymentAmount || 0), 0);

      const averagePrice = paidRegistrations > 0 ? totalRevenue / paidRegistrations : 0;

      // Top eventos por revenue
      const eventRevenueMap = new Map<number, { title: string; revenue: number; registrations: number }>();

      registrations.forEach(reg => {
        if (reg.paymentStatus === 'paid') {
          const existing = eventRevenueMap.get(reg.eventId) || { title: reg.event?.title || '', revenue: 0, registrations: 0 };
          existing.revenue += reg.paymentAmount || 0;
          existing.registrations += 1;
          eventRevenueMap.set(reg.eventId, existing);
        }
      });

      const topEvents = Array.from(eventRevenueMap.entries())
        .map(([eventId, data]) => ({
          eventId,
          eventTitle: data.title,
          revenue: data.revenue,
          registrations: data.registrations
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Revenue por categoría
      const categoryRevenueMap = new Map<number, { name: string; revenue: number; events: number }>();

      events.forEach(event => {
        const categoryId = event.eventCategoryId;
        const categoryName = event.eventCategory?.displayName || '';
        const existing = categoryRevenueMap.get(categoryId) || { name: categoryName, revenue: 0, events: 0 };

        // Calcular revenue para esta categoría
        const categoryRegistrations = registrations.filter(r => r.eventId === event.id && r.paymentStatus === 'paid');
        const categoryRevenue = categoryRegistrations.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);

        existing.revenue += categoryRevenue;
        existing.events += 1;
        categoryRevenueMap.set(categoryId, existing);
      });

      const revenueByCategory = Array.from(categoryRevenueMap.entries())
        .map(([categoryId, data]) => ({
          categoryId,
          categoryName: data.name,
          revenue: data.revenue,
          events: data.events
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // Revenue diario (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyRevenueMap = new Map<string, { revenue: number; registrations: number }>();

      registrations
        .filter(r => r.registeredAt >= thirtyDaysAgo && r.paymentStatus === 'paid')
        .forEach(reg => {
          const date = reg.registeredAt.toISOString().split('T')[0];
          const existing = dailyRevenueMap.get(date) || { revenue: 0, registrations: 0 };
          existing.revenue += reg.paymentAmount || 0;
          existing.registrations += 1;
          dailyRevenueMap.set(date, existing);
        });

      const dailyRevenue = Array.from(dailyRevenueMap.entries())
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          registrations: data.registrations
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const report: SalesReport = {
        totalEvents,
        totalRevenue,
        totalRegistrations,
        paidRegistrations,
        averagePrice,
        topEvents,
        revenueByCategory,
        dailyRevenue
      };

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(report));

      logger.info('Sales report generated successfully');
      return report;
    } catch (error) {
      logger.error('Error generating sales report', { error, filters });
      throw error;
    }
  }

  // ====================================================================
  // REPORTES DE ASISTENCIA
  // ====================================================================

  /**
   * Genera reporte de asistencia
   */
  static async generateAttendanceReport(filters: ReportFilters = {}): Promise<AttendanceReport> {
    try {
      logger.info('Generating attendance report', { filters });

      const cacheKey = `${this.CACHE_PREFIX}:attendance:${JSON.stringify(filters)}`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const whereClause: any = {};

      // Aplicar filtros
      if (filters.startDate || filters.endDate) {
        whereClause.startDate = {};
        if (filters.startDate) whereClause.startDate[Op.gte] = filters.startDate;
        if (filters.endDate) whereClause.startDate[Op.lte] = filters.endDate;
      }

      if (filters.categoryId) {
        whereClause.eventCategoryId = filters.categoryId;
      }

      if (filters.typeId) {
        whereClause.eventTypeId = filters.typeId;
      }

      if (filters.status) {
        whereClause.eventStatusId = filters.status;
      }

      // Obtener eventos finalizados
      const events = await Event.findAll({
        where: {
          ...whereClause,
          endDate: { [Op.lt]: new Date() } // Solo eventos finalizados
        },
        include: [
          { model: EventCategory, as: 'eventCategory' },
          { model: EventType, as: 'eventType' }
        ]
      });

      // Obtener todas las inscripciones de estos eventos
      const eventIds = events.map(e => e.id);
      const registrations = await EventRegistration.findAll({
        where: { eventId: eventIds },
        include: [
          {
            model: Event,
            include: [
              { model: EventCategory, as: 'eventCategory' }
            ]
          }
        ]
      });

      // Calcular métricas
      const totalEvents = events.length;
      const totalAttendees = registrations.filter(r => r.status === 'attended').length;
      const totalRegistrations = registrations.length;
      const averageAttendance = totalEvents > 0 ? totalAttendees / totalEvents : 0;
      const attendanceRate = totalRegistrations > 0 ? (totalAttendees / totalRegistrations) * 100 : 0;

      // Top eventos por asistencia
      const eventAttendanceMap = new Map<number, {
        title: string;
        totalRegistrations: number;
        attendees: number;
      }>();

      registrations.forEach(reg => {
        const existing = eventAttendanceMap.get(reg.eventId) || {
          title: reg.event?.title || '',
          totalRegistrations: 0,
          attendees: 0
        };
        existing.totalRegistrations += 1;
        if (reg.status === 'attended') {
          existing.attendees += 1;
        }
        eventAttendanceMap.set(reg.eventId, existing);
      });

      const topAttendedEvents = Array.from(eventAttendanceMap.entries())
        .map(([eventId, data]) => ({
          eventId,
          eventTitle: data.title,
          totalRegistrations: data.totalRegistrations,
          attendees: data.attendees,
          attendanceRate: data.totalRegistrations > 0 ? (data.attendees / data.totalRegistrations) * 100 : 0
        }))
        .sort((a, b) => b.attendees - a.attendees)
        .slice(0, 10);

      // Asistencia por categoría
      const categoryAttendanceMap = new Map<number, {
        name: string;
        totalAttendees: number;
        eventCount: number;
      }>();

      events.forEach(event => {
        const categoryId = event.eventCategoryId;
        const categoryName = event.eventCategory?.displayName || '';
        const eventAttendees = registrations.filter(r => r.eventId === event.id && r.status === 'attended').length;

        const existing = categoryAttendanceMap.get(categoryId) || {
          name: categoryName,
          totalAttendees: 0,
          eventCount: 0
        };

        existing.totalAttendees += eventAttendees;
        existing.eventCount += 1;
        categoryAttendanceMap.set(categoryId, existing);
      });

      const attendanceByCategory = Array.from(categoryAttendanceMap.entries())
        .map(([categoryId, data]) => ({
          categoryId,
          categoryName: data.name,
          totalAttendees: data.totalAttendees,
          averageAttendance: data.eventCount > 0 ? data.totalAttendees / data.eventCount : 0
        }))
        .sort((a, b) => b.totalAttendees - a.totalAttendees);

      // Tendencias de check-in por hora
      const checkInTrendsMap = new Map<number, number>();

      registrations
        .filter(r => r.checkInTime)
        .forEach(reg => {
          const hour = reg.checkInTime!.getHours();
          checkInTrendsMap.set(hour, (checkInTrendsMap.get(hour) || 0) + 1);
        });

      const checkInTrends = Array.from(checkInTrendsMap.entries())
        .map(([hour, checkIns]) => ({ hour, checkIns }))
        .sort((a, b) => a.hour - b.hour);

      const report: AttendanceReport = {
        totalEvents,
        totalAttendees,
        averageAttendance,
        attendanceRate,
        topAttendedEvents,
        attendanceByCategory,
        checkInTrends
      };

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(report));

      logger.info('Attendance report generated successfully');
      return report;
    } catch (error) {
      logger.error('Error generating attendance report', { error, filters });
      throw error;
    }
  }

  // ====================================================================
  // ANALYTICS DE EVENTO INDIVIDUAL
  // ====================================================================

  /**
   * Genera analytics detallados de un evento específico
   */
  static async generateEventAnalytics(eventId: number): Promise<EventAnalytics> {
    try {
      logger.info('Generating event analytics', { eventId });

      const cacheKey = `${this.CACHE_PREFIX}:analytics:${eventId}`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener evento con todas las relaciones
      const event = await Event.findByPk(eventId, {
        include: [
          { model: EventCategory, as: 'eventCategory' },
          { model: EventType, as: 'eventType' },
          { model: EventStatus, as: 'eventStatus' }
        ]
      });

      if (!event) {
        throw new Error('Evento no encontrado');
      }

      // Obtener todas las inscripciones
      const registrations = await EventRegistration.findAll({
        where: { eventId },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'dateOfBirth', 'gender']
          }
        ],
        order: [['registeredAt', 'ASC']]
      });

      // Calcular estadísticas de inscripciones
      const registrationStats = {
        total: registrations.length,
        confirmed: registrations.filter(r => r.status === 'confirmed').length,
        pending: registrations.filter(r => r.status === 'pending').length,
        cancelled: registrations.filter(r => r.status === 'cancelled').length,
        attended: registrations.filter(r => r.status === 'attended').length
      };

      // Calcular estadísticas de revenue
      const paidRegistrations = registrations.filter(r => r.paymentStatus === 'paid');
      const totalRevenue = paidRegistrations.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);
      const averageTicketPrice = paidRegistrations.length > 0 ? totalRevenue / paidRegistrations.length : 0;

      const revenueStats = {
        total: totalRevenue,
        paid: paidRegistrations.length,
        pending: registrations.filter(r => r.paymentStatus === 'pending').length,
        averageTicketPrice
      };

      // Calcular estadísticas de asistencia
      const checkedIn = registrations.filter(r => r.checkInTime).length;
      const checkedOut = registrations.filter(r => r.checkOutTime).length;
      const attendanceRate = registrationStats.total > 0 ? (checkedIn / registrationStats.total) * 100 : 0;

      // Calcular duración promedio de asistencia
      const durations = registrations
        .filter(r => r.checkInTime && r.checkOutTime)
        .map(r => r.checkOutTime!.getTime() - r.checkInTime!.getTime());

      const averageDuration = durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

      const attendanceStats = {
        checkedIn,
        checkedOut,
        averageDuration,
        attendanceRate
      };

      // Calcular demografía (simplificada - sin datos personales específicos)
      const demographics = {
        ageGroups: [], // No disponible en el modelo actual
        genderDistribution: [] // No disponible en el modelo actual
      };

      // Timeline de registros y revenue
      const timelineMap = new Map<string, { registrations: number; revenue: number }>();

      registrations.forEach(reg => {
        const date = reg.registeredAt.toISOString().split('T')[0];
        const existing = timelineMap.get(date) || { registrations: 0, revenue: 0 };
        existing.registrations += 1;
        if (reg.paymentStatus === 'paid') {
          existing.revenue += reg.paymentAmount || 0;
        }
        timelineMap.set(date, existing);
      });

      const timeline = Array.from(timelineMap.entries())
        .map(([date, data]) => ({
          date,
          registrations: data.registrations,
          revenue: data.revenue
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const analytics: EventAnalytics = {
        eventId,
        eventTitle: event.title,
        status: event.eventStatus?.name || '',
        startDate: event.startDate,
        endDate: event.endDate,
        capacity: event.capacity || 0,
        registrations: registrationStats,
        revenue: revenueStats,
        attendance: attendanceStats,
        demographics,
        timeline
      };

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(analytics));

      logger.info('Event analytics generated successfully', { eventId });
      return analytics;
    } catch (error) {
      logger.error('Error generating event analytics', { error, eventId });
      throw error;
    }
  }

  // ====================================================================
  // UTILIDADES DE CACHÉ
  // ====================================================================

  /**
   * Limpia el caché de reportes
   */
  static async clearReportsCache(): Promise<void> {
    try {
      const keys = await cacheRedis.keys(`${this.CACHE_PREFIX}:*`);
      if (keys.length > 0) {
        await cacheRedis.del(keys);
      }
    } catch (error) {
      logger.error('Error clearing reports cache', { error });
    }
  }

  /**
   * Obtiene métricas generales del sistema de eventos
   */
  static async getSystemMetrics(): Promise<{
    totalEvents: number;
    activeEvents: number;
    totalRegistrations: number;
    totalRevenue: number;
    averageAttendanceRate: number;
  }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:system_metrics`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener métricas
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

      const metrics = {
        totalEvents,
        activeEvents,
        totalRegistrations,
        totalRevenue: totalRevenueResult,
        averageAttendanceRate
      };

      // Guardar en caché por 15 minutos
      await cacheRedis.setex(cacheKey, 900, JSON.stringify(metrics));

      return metrics;
    } catch (error) {
      logger.error('Error getting system metrics', { error });
      throw error;
    }
  }
}