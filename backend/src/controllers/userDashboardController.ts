/**
 * @fileoverview Controlador del Dashboard de Usuario para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controlador para operaciones del dashboard de usuario
 *
 * Archivo: backend/src/controllers/userDashboardController.ts
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
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
import { EventStatus } from '../models/EventStatus';
import { Speaker } from '../models/Speaker';
import { SpeakerEvent } from '../models/SpeakerEvent';

// Mapeo de categorías en inglés a español
const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'finance': 'Finanzas',
  'education': 'Educación',
  'marketing': 'Marketing',
  'technology': 'Tecnología',
  'innovation': 'Innovación',
  'management': 'Administración',
  'sales': 'Ventas',
  'leadership': 'Liderazgo',
  'hr': 'Recursos Humanos',
  'business': 'Negocios',
  'health': 'Salud',
  'legal': 'Legal',
  'general': 'General'
};

/**
 * Obtener eventos disponibles para el usuario
 */
export const getAvailableEvents = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { category, modality, dateFrom, dateTo, page = 1, limit = 12, search } = req.query;

    // Construir filtros
    const where: any = {
      published_at: {
        [Op.not]: null // Solo eventos publicados
      }
    };

    // Filtro por categoría
    if (category && category !== '') {
      where['$eventCategory.name$'] = category;
    }

    // Filtro por modalidad
    if (modality && modality !== '') {
      where.is_virtual = modality === 'virtual';
    }

    // Filtro por búsqueda
    if (search && search !== '') {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      where.start_date = {};
      if (dateFrom) {
        where.start_date[Op.gte] = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.start_date[Op.lte] = new Date(dateTo as string);
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
        },
        {
          model: EventStatus,
          as: 'eventStatus',
          attributes: ['name', 'description']
        },
        {
          model: Speaker,
          as: 'speakers',
          through: { attributes: [] },
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      limit: Number(limit),
      offset,
      order: [['start_date', 'ASC']]
    });

    // Formatear eventos para el frontend
    const formattedEvents = events.map((event: any) => {
      const startDate = event.start_date ? new Date(event.start_date) : null;
      const capacity = event.capacity || 0;
      const registered = event.registered_count || 0;

      // Determinar modalidad: usar is_virtual primero, luego eventType
      let modality: 'virtual' | 'presencial' | 'hibrido' = 'presencial';

      // Primero verificar eventType para detectar híbridos
      if (event.eventType?.name) {
        const typeName = event.eventType.name.toLowerCase();
        if (typeName.includes('híbrido') || typeName.includes('hibrido') || typeName.includes('hybrid')) {
          modality = 'hibrido';
        } else if (event.is_virtual) {
          modality = 'virtual';
        } else {
          modality = 'presencial';
        }
      } else {
        // Si no hay eventType, usar is_virtual
        modality = event.is_virtual ? 'virtual' : 'presencial';
      }

      // Determinar ubicación según modalidad
      let location = event.location || 'Por definir';
      if (modality === 'virtual') {
        location = event.virtual_location || 'Plataforma virtual';
      } else if (modality === 'hibrido') {
        location = `${event.location || 'Presencial'} / ${event.virtual_location || 'Virtual'}`;
      }

      // Traducir categoría
      const categoryName = event.eventCategory?.name || 'general';
      const translatedCategory = CATEGORY_TRANSLATIONS[categoryName.toLowerCase()] || categoryName;

      // Formatear speakers
      const speakers = event.speakers?.map((speaker: any) => ({
        id: speaker.id,
        fullName: `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim()
      })) || [];

      return {
        id: event.id,
        title: event.title,
        description: event.description || event.short_description || '',
        date: event.start_date,
        time: startDate ? startDate.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : '00:00',
        location: location,
        modality: modality,
        price: event.price || event.min_price || 0,
        capacity: capacity,
        registered: registered,
        category: translatedCategory,
        image: event.metadata?.imageUrl || null,
        status: registered >= capacity ? 'full' : 'available',
        speakers: speakers
      };
    });

    return res.json(successResponse(formattedEvents, 'Eventos obtenidos exitosamente'));
  } catch (error: any) {
    console.error('Error getting available events:', error);
    return res.status(500).json(errorResponse('Error obteniendo eventos disponibles', error.message));
  }
};

/**
 * Obtener inscripciones del usuario
 */
export const getUserRegistrations = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Usuario no autenticado', 'UNAUTHORIZED'));
    }

    // Buscar en la tabla Registration (no EventRegistration)
    const registrations = await Registration.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          as: 'event',
          required: true,
          include: [
            {
              model: EventCategory,
              as: 'eventCategory',
              required: false
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Formatear registraciones para el frontend
    const formattedRegistrations = registrations.map((reg: any) => {
      const event = reg.event;
      const startDate = event.startDate ? new Date(event.startDate) : null;

      // Determinar modalidad del evento
      let modality: 'virtual' | 'presencial' | 'hibrido' = 'presencial';
      if (event.eventType?.name) {
        const typeName = event.eventType.name.toLowerCase();
        if (typeName.includes('híbrido') || typeName.includes('hibrido') || typeName.includes('hybrid')) {
          modality = 'hibrido';
        } else if (event.isVirtual) {
          modality = 'virtual';
        }
      } else if (event.isVirtual) {
        modality = 'virtual';
      }

      // Mapear estados de Registration a los que espera el frontend
      let status = 'pending';
      if (reg.status === 'PAGADO' || reg.status === 'CONFIRMADO') {
        status = 'confirmed';
      } else if (reg.status === 'CANCELADO') {
        status = 'cancelled';
      } else if (reg.status === 'PENDIENTE_PAGO') {
        status = 'pending';
      }

      // Mapear estado de pago
      let paymentStatus = 'pending';
      if (reg.status === 'PAGADO') {
        paymentStatus = 'paid';
      } else if (reg.status === 'REEMBOLSADO') {
        paymentStatus = 'refunded';
      }

      return {
        id: reg.id,
        eventTitle: event.title || 'Evento sin título',
        eventDate: event.startDate,
        eventTime: startDate ? startDate.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : '00:00',
        location: event.location || event.virtualLocation || 'Por definir',
        modality: modality,
        status: status,
        paymentStatus: paymentStatus,
        amount: reg.finalPrice || 0,
        registrationDate: reg.createdAt,
        registrationCode: reg.registrationCode,
        qrCode: null, // Se generará cuando el pago esté confirmado
        certificateUrl: null
      };
    });

    return res.json(successResponse(formattedRegistrations, 'Inscripciones obtenidas exitosamente'));
  } catch (error: any) {
    console.error('Error getting user registrations:', error);
    return res.status(500).json(errorResponse('Error obteniendo inscripciones', error.message));
  }
};

/**
 * Obtener certificados del usuario
 */
export const getUserCertificates = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
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
export const getUserQrCodes = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
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
export const getUserEvaluations = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
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
export const registerForEvent = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
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
      status: 'confirmed', // Cambiar a confirmado inmediatamente
      paymentStatus: event.price > 0 ? 'pending' : 'paid', // Si es gratuito, marcar como pagado
      paymentAmount: event.price || 0
    });

    // Actualizar contador de registrados en el evento
    await event.increment('registeredCount', { by: 1 });
    await event.reload(); // Recargar para obtener el valor actualizado

    return res.status(201).json(successResponse({
      id: registration.id,
      eventTitle: event.title,
      eventDate: event.startDate,
      eventTime: event.startDate, // Usar startDate como fallback
      location: event.location,
      modality: event.isVirtual ? 'virtual' : 'presencial', // Determinar basado en isVirtual
      status: registration.status,
      paymentStatus: registration.paymentStatus,
      amount: registration.paymentAmount,
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
export const submitEvaluation = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
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
export const downloadQrCode = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
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

    // Retornar el QR code como blob/imagen
    // Por ahora retornar el hash del QR code
    return res.json(successResponse({ qrHash: qrCode.qrHash, qrData: qrCode.qrData }, 'Código QR obtenido exitosamente'));
  } catch (error: any) {
    console.error('Error downloading QR code:', error);
    return res.status(500).json(errorResponse('Error descargando código QR', error.message));
  }
};

/**
 * Descargar certificado
 */
export const downloadCertificate = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
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
      pdfUrl: certificate.pdfUrl,
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
