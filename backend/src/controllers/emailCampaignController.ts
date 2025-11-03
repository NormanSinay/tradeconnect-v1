/**
 * @fileoverview Controlador de Campañas de Email para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de campañas de email marketing automatizadas
 *
 * Archivo: backend/src/controllers/emailCampaignController.ts
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { emailService } from '../services/emailService';
import { EmailCampaign } from '../models/EmailCampaign';
import { CampaignRecipient } from '../models/CampaignRecipient';
import { CampaignSchedule } from '../models/CampaignSchedule';
import { CampaignEmail } from '../models/CampaignEmail';
import {
  EmailCampaignStatus,
  EmailCampaignType
} from '../models/EmailCampaign';
import {
  CampaignRecipientStatus
} from '../models/CampaignRecipient';
import {
  CampaignScheduleStatus,
  CampaignScheduleFrequency
} from '../models/CampaignSchedule';
import { HTTP_STATUS, PERMISSIONS } from '../utils/constants';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Controlador para manejo de campañas de email
 */
export class EmailCampaignController {

  /**
   * @swagger
   * /api/v1/campaigns:
   *   get:
   *     tags: [Email Campaigns]
   *     summary: Obtener campañas de email
   *     description: Obtiene la lista de campañas de email con filtros opcionales
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: status
   *         in: query
   *         schema:
   *           type: string
   *           enum: [DRAFT, SCHEDULED, SENDING, SENT, PAUSED, CANCELLED, FAILED]
   *       - name: type
   *         in: query
   *         schema:
   *           type: string
   *           enum: [MARKETING, NEWSLETTER, PROMOTIONAL, TRANSACTIONAL, WELCOME, REENGAGEMENT, AUTOMATED]
   *       - name: limit
   *         in: query
   *         schema:
   *           type: integer
   *           default: 20
   *       - name: offset
   *         in: query
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: Campañas obtenidas exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getCampaigns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as EmailCampaignStatus,
        type: req.query.type as EmailCampaignType,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const campaigns = await EmailCampaign.findAll({
        where: filters.status ? { status: filters.status } : {},
        include: [{
          model: require('../models/User').User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }],
        limit: filters.limit,
        offset: filters.offset,
        order: [['createdAt', 'DESC']]
      });

      const total = await EmailCampaign.count({
        where: filters.status ? { status: filters.status } : {}
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Campañas obtenidas exitosamente',
        data: {
          campaigns,
          pagination: {
            total,
            limit: filters.limit,
            offset: filters.offset,
            hasNext: (filters.offset + filters.limit) < total,
            hasPrev: filters.offset > 0
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getCampaigns controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns:
   *   post:
   *     tags: [Email Campaigns]
   *     summary: Crear campaña de email
   *     description: Crea una nueva campaña de email
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - subject
   *               - fromName
   *               - fromEmail
   *             properties:
   *               name:
   *                 type: string
   *               subject:
   *                 type: string
   *               fromName:
   *                 type: string
   *               fromEmail:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [MARKETING, NEWSLETTER, PROMOTIONAL, TRANSACTIONAL, WELCOME, REENGAGEMENT, AUTOMATED]
   *               templateId:
   *                 type: integer
   *               templateCode:
   *                 type: string
   *               scheduledAt:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Campaña creada exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async createCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const campaignData = {
        ...req.body,
        createdBy: req.user!.id,
        status: req.body.scheduledAt ? EmailCampaignStatus.SCHEDULED : EmailCampaignStatus.DRAFT
      };

      const campaign = await EmailCampaign.create(campaignData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Campaña creada exitosamente',
        data: { campaign },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en createCampaign controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}:
   *   get:
   *     tags: [Email Campaigns]
   *     summary: Obtener campaña por ID
   *     description: Obtiene los detalles de una campaña específica
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Campaña obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await EmailCampaign.findByPk(campaignId, {
        include: [
          {
            model: require('../models/User').User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: require('../models/EmailTemplate').EmailTemplate,
            as: 'template'
          }
        ]
      });

      if (!campaign) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaña no encontrada',
          error: 'CAMPAIGN_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Campaña obtenida exitosamente',
        data: { campaign },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getCampaign controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}:
   *   put:
   *     tags: [Email Campaigns]
   *     summary: Actualizar campaña de email
   *     description: Actualiza una campaña de email existente
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               subject:
   *                 type: string
   *               scheduledAt:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       200:
   *         description: Campaña actualizada exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async updateCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const campaignId = parseInt(req.params.id);
      const campaign = await EmailCampaign.findByPk(campaignId);

      if (!campaign) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaña no encontrada',
          error: 'CAMPAIGN_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!campaign.canEdit) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'La campaña no puede ser editada en su estado actual',
          error: 'CAMPAIGN_NOT_EDITABLE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData = {
        ...req.body,
        updatedBy: req.user!.id
      };

      await campaign.update(updateData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Campaña actualizada exitosamente',
        data: { campaign },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en updateCampaign controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}:
   *   delete:
   *     tags: [Email Campaigns]
   *     summary: Eliminar campaña de email
   *     description: Elimina una campaña de email (soft delete)
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Campaña eliminada exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async deleteCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES); // Usar permiso existente temporalmente

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const campaignId = parseInt(req.params.id);
      const campaign = await EmailCampaign.findByPk(campaignId);

      if (!campaign) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaña no encontrada',
          error: 'CAMPAIGN_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await campaign.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Campaña eliminada exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en deleteCampaign controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}/send:
   *   post:
   *     tags: [Email Campaigns]
   *     summary: Enviar campaña de email
   *     description: Inicia el envío de una campaña de email
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               batchSize:
   *                 type: integer
   *                 default: 50
   *               delayBetweenBatches:
   *                 type: integer
   *                 default: 1000
   *     responses:
   *       200:
   *         description: Campaña enviada exitosamente
   *       400:
   *         description: Campaña no puede ser enviada
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async sendCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES); // Usar permiso existente temporalmente

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const campaignId = parseInt(req.params.id);
      const { batchSize = 50, delayBetweenBatches = 1000 } = req.body;

      const result = await emailService.sendCampaign({
        campaignId,
        batchSize,
        delayBetweenBatches
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Campaña enviada exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en sendCampaign controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}/pause:
   *   post:
   *     tags: [Email Campaigns]
   *     summary: Pausar campaña de email
   *     description: Pausa el envío de una campaña de email
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Campaña pausada exitosamente
   *       400:
   *         description: Campaña no puede ser pausada
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async pauseCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES); // Usar permiso existente temporalmente

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const campaignId = parseInt(req.params.id);
      const campaign = await EmailCampaign.findByPk(campaignId);

      if (!campaign) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaña no encontrada',
          error: 'CAMPAIGN_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (campaign.status !== EmailCampaignStatus.SENDING) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'La campaña no está en estado de envío',
          error: 'CAMPAIGN_NOT_SENDING',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await campaign.markAsPaused();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Campaña pausada exitosamente',
        data: { campaign },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en pauseCampaign controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}/cancel:
   *   post:
   *     tags: [Email Campaigns]
   *     summary: Cancelar campaña de email
   *     description: Cancela el envío de una campaña de email
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Campaña cancelada exitosamente
   *       400:
   *         description: Campaña no puede ser cancelada
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async cancelCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES); // Usar permiso existente temporalmente

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const campaignId = parseInt(req.params.id);
      const campaign = await EmailCampaign.findByPk(campaignId);

      if (!campaign) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaña no encontrada',
          error: 'CAMPAIGN_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (![EmailCampaignStatus.DRAFT, EmailCampaignStatus.SCHEDULED, EmailCampaignStatus.SENDING, EmailCampaignStatus.PAUSED].includes(campaign.status)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'La campaña no puede ser cancelada en su estado actual',
          error: 'CAMPAIGN_NOT_CANCELLABLE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await campaign.markAsCancelled();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Campaña cancelada exitosamente',
        data: { campaign },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en cancelCampaign controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}/recipients:
   *   get:
   *     tags: [Email Campaigns]
   *     summary: Obtener destinatarios de campaña
   *     description: Obtiene la lista de destinatarios de una campaña
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *       - name: status
   *         in: query
   *         schema:
   *           type: string
   *           enum: [PENDING, SENT, DELIVERED, OPENED, CLICKED, BOUNCED, COMPLAINED, UNSUBSCRIBED, SKIPPED]
   *       - name: limit
   *         in: query
   *         schema:
   *           type: integer
   *           default: 50
   *       - name: offset
   *         in: query
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: Destinatarios obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getCampaignRecipients(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id);
      const filters = {
        status: req.query.status as CampaignRecipientStatus,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const whereClause: any = { campaignId };
      if (filters.status) {
        whereClause.status = filters.status;
      }

      const recipients = await CampaignRecipient.findAll({
        where: whereClause,
        include: [{
          model: require('../models/User').User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }],
        limit: filters.limit,
        offset: filters.offset,
        order: [['createdAt', 'ASC']]
      });

      const total = await CampaignRecipient.count({ where: whereClause });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Destinatarios obtenidos exitosamente',
        data: {
          recipients,
          pagination: {
            total,
            limit: filters.limit,
            offset: filters.offset,
            hasNext: (filters.offset + filters.limit) < total,
            hasPrev: filters.offset > 0
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getCampaignRecipients controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}/recipients:
   *   post:
   *     tags: [Email Campaigns]
   *     summary: Agregar destinatarios a campaña
   *     description: Agrega destinatarios a una campaña de email
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               recipients:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - email
   *                   properties:
   *                     email:
   *                       type: string
   *                     firstName:
   *                       type: string
   *                     lastName:
   *                       type: string
   *                     variables:
   *                       type: object
   *     responses:
   *       200:
   *         description: Destinatarios agregados exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async addCampaignRecipients(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const campaignId = parseInt(req.params.id);
      const campaign = await EmailCampaign.findByPk(campaignId);

      if (!campaign) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaña no encontrada',
          error: 'CAMPAIGN_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!campaign.canEdit) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No se pueden agregar destinatarios a esta campaña',
          error: 'CAMPAIGN_NOT_EDITABLE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { recipients } = req.body;
      const addedRecipients = [];
      let skippedCount = 0;

      for (const recipientData of recipients) {
        // Verificar si el email ya existe en la campaña
        const existing = await CampaignRecipient.findByCampaignAndEmail(campaignId, recipientData.email);
        if (existing) {
          skippedCount++;
          continue;
        }

        const recipient = await CampaignRecipient.create({
          campaignId,
          email: recipientData.email,
          firstName: recipientData.firstName,
          lastName: recipientData.lastName,
          variables: recipientData.variables || {},
          status: CampaignRecipientStatus.PENDING,
          retryCount: 0,
          maxRetries: 3
        });

        addedRecipients.push(recipient);
      }

      // Actualizar contador de destinatarios en la campaña
      await campaign.update({
        totalRecipients: campaign.totalRecipients + addedRecipients.length
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `${addedRecipients.length} destinatarios agregados exitosamente${skippedCount > 0 ? `, ${skippedCount} omitidos (ya existían)` : ''}`,
        data: {
          added: addedRecipients.length,
          skipped: skippedCount,
          recipients: addedRecipients
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en addCampaignRecipients controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}/stats:
   *   get:
   *     tags: [Email Campaigns]
   *     summary: Obtener estadísticas de campaña
   *     description: Obtiene estadísticas detalladas de una campaña de email
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getCampaignStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await EmailCampaign.findByPk(campaignId);

      if (!campaign) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaña no encontrada',
          error: 'CAMPAIGN_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const recipientStats = await CampaignRecipient.getEngagementStats(campaignId);
      const emailStats = await CampaignEmail.getDetailedStats(campaignId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          campaign: {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            sentAt: campaign.sentAt,
            completedAt: campaign.completedAt
          },
          recipients: recipientStats,
          emails: emailStats
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getCampaignStats controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}/test:
   *   post:
   *     tags: [Email Campaigns]
   *     summary: Enviar email de prueba
   *     description: Envía un email de prueba de la campaña
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - testEmails
   *             properties:
   *               testEmails:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Email de prueba enviado exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async sendTestEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const campaignId = parseInt(req.params.id);
      const campaign = await EmailCampaign.findByPk(campaignId, {
        include: [{
          model: require('../models/EmailTemplate').EmailTemplate,
          as: 'template'
        }]
      });

      if (!campaign) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaña no encontrada',
          error: 'CAMPAIGN_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { testEmails } = req.body;

      for (const email of testEmails) {
        const testVariables = {
          recipient_email: email,
          recipient_first_name: 'Usuario',
          recipient_last_name: 'de Prueba',
          campaign_name: campaign.name,
          test_mode: true
        };

        await emailService.sendCampaignEmail({
          campaignId,
          recipientId: 0, // ID temporal para pruebas
          to: email,
          templateCode: campaign.templateCode || 'DEFAULT_CAMPAIGN',
          variables: testVariables
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Email de prueba enviado a ${testEmails.length} destinatarios`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en sendTestEmail controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/{id}/schedule:
   *   post:
   *     tags: [Email Campaigns]
   *     summary: Programar campaña
   *     description: Crea una programación automática para la campaña
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - frequency
   *               - startDate
   *             properties:
   *               frequency:
   *                 type: string
   *                 enum: [ONCE, DAILY, WEEKLY, MONTHLY, CUSTOM]
   *               startDate:
   *                 type: string
   *                 format: date-time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *               timezone:
   *                 type: string
   *                 default: "America/Guatemala"
   *     responses:
   *       201:
   *         description: Programación creada exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Campaña no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async scheduleCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const campaignId = parseInt(req.params.id);
      const campaign = await EmailCampaign.findByPk(campaignId);

      if (!campaign) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Campaña no encontrada',
          error: 'CAMPAIGN_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const scheduleData = {
        ...req.body,
        campaignId,
        createdBy: req.user!.id,
        name: `Programación para ${campaign.name}`
      };

      const schedule = await CampaignSchedule.create(scheduleData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Programación creada exitosamente',
        data: { schedule },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en scheduleCampaign controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/campaigns/stats:
   *   get:
   *     tags: [Email Campaigns]
   *     summary: Obtener estadísticas generales
   *     description: Obtiene estadísticas generales de todas las campañas
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getGeneralStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const campaignStats = await EmailCampaign.getCampaignStats();
      const scheduleStats = await CampaignSchedule.getScheduleStats();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Estadísticas generales obtenidas exitosamente',
        data: {
          campaigns: campaignStats,
          schedules: scheduleStats
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getGeneralStats controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const emailCampaignController = new EmailCampaignController();