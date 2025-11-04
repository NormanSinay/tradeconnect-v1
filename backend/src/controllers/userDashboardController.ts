/**
 * @fileoverview Controlador del Dashboard de Usuario para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controlador para operaciones del dashboard de usuario
 *
 * Archivo: backend/src/controllers/userDashboardController.ts
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/common.utils';
import { Op } from 'sequelize';
import { Event } from '../models/Event';
import { EventRegistration } from '../models/EventRegistration';
import { Certificate } from '../models/Certificate';
import { QRCode } from '../models/QRCode';
import { Registration } from '../models/Registration';
import { User } from '../models/User';
import { EventCategory } from '../models/EventCategory';
import { EventType } from '../models/EventType';

/**
 * Obtener eventos disponibles para el usuario
 */
export const getAvailableEvents = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { category, modality, dateFrom, dateTo, page = 1, limit = 12 } = req.query;

    // Construir filtros
    const where: any = {
      isPublished: true,
      status: 'open' // Solo eventos abiertos a inscripciones
    };

    // Filtro por categoría
    if (category && category !== '') {
      where['$EventCategory.name$'] = category;
    }

    // Filtro por modalidad
    if (modality && modality !== '') {
      where.modality = modality;
    }

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) {
        where.startDate[Op.gte] = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.startDate[Op.lte] = new Date(dateTo as string);
      }
    }

    // Paginación
    const offset = (Number(page) - 1) * Number(limit);

    const { rows: events, count: total } = await Event.findAndCountAll({
      where,
      include: [
        {
          model: EventCategory,
          as: 'eventCategory',
          attributes: ['name']
        },
        {
          model: EventType,
          as: 'eventType',
          attributes: ['name']
        }
      ],
      limit: Number(limit),
      offset,
      order: [['startDate', 'ASC']]
    });

    // Formatear eventos para el frontend
    const formattedEvents = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.startDate,
      time: event.startTime,
      location: event.location,
      modality: event.modality,
      price: event.price,
      capacity: event.maxCapacity || 0,
      registered: event.currentRegistrations || 0,
      category: event.eventCategory?.name || 'Sin categoría',
      image: event.imageUrl,
      status: event.currentRegistrations >= event.maxCapacity ? 'full' : 'available'
    }));

    return res.json(successResponse(formattedEvents, 'Eventos obtenidos exitosamente'));
  } catch (error: any) {
    console.error('Error getting available events:', error);
    return res.status(500).json(errorResponse('Error obteniendo eventos disponibles', error.message));
  }
};

/**
 * Obtener inscripciones del usuario
 */
export const getUserRegistrations = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Usuario no autenticado', 'UNAUTHORIZED'));
    }

    const registrations = await EventRegistration.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            {
              model: EventCategory,
              as: 'eventCategory'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Formatear registraciones para el frontend
    const formattedRegistrations = registrations.map((reg: any) => ({
      id: reg.id,
      eventTitle: reg.event?.title || 'Evento sin título',
      eventDate: reg.event?.startDate,
      eventTime: reg.event?.startTime,
      location: reg.event?.location,
      modality: reg.event?.modality,
      status: reg.status,
      paymentStatus: reg.paymentStatus || 'pending',
      amount: reg.amount || 0,
      registrationDate: reg.createdAt,
      qrCode: reg.qrCode,
      certificateUrl: reg.certificateUrl
    }));

    return res.json(successResponse(formattedRegistrations, 'Inscripciones obtenidas exitosamente'));
  } catch (error: any) {
    console.error('Error getting user registrations:', error);
    return res.status(500).json(errorResponse('Error obteniendo inscripciones', error.message));
  }
};

/**
 * Obtener certificados del usuario
 */
export const getUserCertificates = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Usuario no autenticado', 'UNAUTHORIZED'));
    }

    const certificates = await Certificate.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['title', 'startDate']
        }
      ],
      order: [['issuedAt', 'DESC']]
    });

    // Formatear certificados para el frontend
    const formattedCertificates = certificates.map((cert: any) => ({
      id: cert.id,
      eventTitle: cert.event?.title || 'Evento sin título',
      eventDate: cert.event?.startDate,
      issueDate: cert.issuedAt,
      certificateNumber: cert.certificateNumber,
      status: cert.status,
      downloadUrl: cert.pdfUrl,
      verificationUrl: `/api/v1/certificates/verify/${cert.certificateNumber}`
    }));

    return res.json(successResponse(formattedCertificates, 'Certificados obtenidos exitosamente'));
  } catch (error: any) {
    console.error('Error getting user certificates:', error);
    return res.status(500).json(errorResponse('Error obteniendo certificados', error.message));
  }
};

/**
 * Obtener códigos QR del usuario
 */
export const getUserQrCodes = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Usuario no autenticado', 'UNAUTHORIZED'));
    }

    // Obtener QR codes con información del evento a través de EventRegistration
    const qrCodes = await QRCode.findAll({
      include: [
        {
          model: EventRegistration,
          as: 'eventRegistration',
          where: { userId },
          required: true,
          include: [
            {
              model: Event,
              as: 'event',
              attributes: ['title', 'startDate', 'startTime', 'location', 'modality']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Formatear QR codes para el frontend con datos reales
    const formattedQrCodes = qrCodes.map((qr: any) => ({
      id: qr.id,
      eventTitle: qr.eventRegistration?.event?.title || 'Sin evento',
      eventDate: qr.eventRegistration?.event?.startDate || null,
      eventTime: qr.eventRegistration?.event?.startTime || '00:00',
      location: qr.eventRegistration?.event?.location || 'Sin ubicación',
      modality: qr.eventRegistration?.event?.modality || 'presencial',
      qrCode: qr.qrHash, // Usar qrHash en lugar de qrCode
      status: qr.status,
      generatedDate: qr.createdAt,
      downloadCount: 0 // Campo no existe en el modelo actual
    }));

    return res.json(successResponse(formattedQrCodes, 'Códigos QR obtenidos exitosamente'));
  } catch (error: any) {
    console.error('Error getting user QR codes:', error);
    return res.status(500).json(errorResponse('Error obteniendo códigos QR', error.message));
  }
};

/**
 * Obtener evaluaciones del usuario
 */
export const getUserEvaluations = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Usuario no autenticado', 'UNAUTHORIZED'));
    }

    // Por ahora retornar array vacío - implementar cuando exista el modelo de evaluaciones
    const evaluations: any[] = [];

    return res.json(successResponse(evaluations, 'Evaluaciones obtenidas exitosamente'));
  } catch (error: any) {
    console.error('Error getting user evaluations:', error);
    return res.status(500).json(errorResponse('Error obteniendo evaluaciones', error.message));
  }
};

/**
 * Inscribirse a un evento
 */
export const registerForEvent = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const eventId = parseInt(req.params.eventId);

    if (!userId) {
      return res.status(401).json(errorResponse('Usuario no autenticado', 'UNAUTHORIZED'));
    }

    // Verificar que el evento existe
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json(errorResponse('Evento no encontrado', 'EVENT_NOT_FOUND'));
    }

    // Verificar si ya está inscrito
    const existingRegistration = await EventRegistration.findOne({
      where: { userId, eventId }
    });

    if (existingRegistration) {
      return res.status(400).json(errorResponse('Ya estás inscrito en este evento', 'ALREADY_REGISTERED'));
    }

    // Crear inscripción
    const registration = await EventRegistration.create({
      userId,
      eventId,
      status: 'pending',
      paymentStatus: 'pending',
      amount: event.price || 0,
      registrationDate: new Date()
    });

    return res.status(201).json(successResponse({
      id: registration.id,
      eventTitle: event.title,
      eventDate: event.startDate,
      eventTime: event.startTime,
      location: event.location,
      modality: event.modality,
      status: registration.status,
      paymentStatus: registration.paymentStatus,
      amount: registration.amount,
      registrationDate: registration.createdAt
    }, 'Inscripción realizada exitosamente'));
  } catch (error: any) {
    console.error('Error registering for event:', error);
    return res.status(500).json(errorResponse('Error inscribiéndose al evento', error.message));
  }
};

/**
 * Enviar evaluación de evento
 */
export const submitEvaluation = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    const evaluationId = parseInt(req.params.evaluationId);
    const { rating, comments } = req.body;

    if (!userId) {
      return res.status(401).json(errorResponse('Usuario no autenticado', 'UNAUTHORIZED'));
    }

    // Implementar cuando exista el modelo de evaluaciones
    return res.json(successResponse(null, 'Evaluación enviada exitosamente'));
  } catch (error: any) {
    console.error('Error submitting evaluation:', error);
    return res.status(500).json(errorResponse('Error enviando evaluación', error.message));
  }
};

/**
 * Descargar código QR
 */
export const downloadQrCode = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const qrId = parseInt(req.params.qrId);

    if (!userId) {
      return res.status(401).json(errorResponse('Usuario no autenticado', 'UNAUTHORIZED'));
    }

    const qrCode = await QRCode.findOne({
      where: { id: qrId },
      include: [
        {
          model: EventRegistration,
          as: 'eventRegistration',
          where: { userId },
          required: true
        }
      ]
    });

    if (!qrCode) {
      return res.status(404).json(errorResponse('Código QR no encontrado', 'QR_NOT_FOUND'));
    }

    // Incrementar contador de descargas
    await qrCode.update({ downloadCount: (qrCode.downloadCount || 0) + 1 });

    // Retornar el QR code como blob/imagen
    // Por ahora retornar el string del QR code
    return res.json(successResponse({ qrCode: qrCode.qrCode }, 'Código QR obtenido exitosamente'));
  } catch (error: any) {
    console.error('Error downloading QR code:', error);
    return res.status(500).json(errorResponse('Error descargando código QR', error.message));
  }
};

/**
 * Descargar certificado
 */
export const downloadCertificate = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const certificateId = parseInt(req.params.certificateId);

    if (!userId) {
      return res.status(401).json(errorResponse('Usuario no autenticado', 'UNAUTHORIZED'));
    }

    const certificate = await Certificate.findOne({
      where: { id: certificateId, userId }
    });

    if (!certificate) {
      return res.status(404).json(errorResponse('Certificado no encontrado', 'CERTIFICATE_NOT_FOUND'));
    }

    // Retornar URL de descarga
    return res.json(successResponse({
      downloadUrl: certificate.downloadUrl,
      certificateNumber: certificate.certificateNumber
    }, 'Certificado obtenido exitosamente'));
  } catch (error: any) {
    console.error('Error downloading certificate:', error);
    return res.status(500).json(errorResponse('Error descargando certificado', error.message));
  }
};

export const userDashboardController = {
  getAvailableEvents,
  getUserRegistrations,
  getUserCertificates,
  getUserQrCodes,
  getUserEvaluations,
  registerForEvent,
  submitEvaluation,
  downloadQrCode,
  downloadCertificate
};
