/**
 * @fileoverview Controlador CMS para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de contenido (CMS)
 *
 * Archivo: backend/src/controllers/cmsController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { StaticPage } from '../models/StaticPage';
import { Term } from '../models/Term';
import { Policy } from '../models/Policy';
import { Faq } from '../models/Faq';
import { Banner } from '../models/Banner';
import { PromotionalAd } from '../models/PromotionalAd';
import { Article } from '../models/Article';
import { ArticleCategory } from '../models/ArticleCategory';
import { Tag } from '../models/Tag';
import { Comment } from '../models/Comment';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

/**
 * Controlador para manejo de operaciones CMS
 */
export class CMSController {

  // ====================================================================
  // STATIC PAGES
  // ====================================================================

  /**
   * Obtener todas las páginas estáticas publicadas
   */
  async getPublicStaticPages(req: Request, res: Response): Promise<void> {
    try {
      const pages = await StaticPage.findAll({
        where: { is_published: true },
        attributes: ['id', 'slug', 'title', 'meta_title', 'meta_description', 'published_at'],
        order: [['published_at', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Páginas estáticas obtenidas exitosamente',
        data: pages,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo páginas estáticas públicas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener página estática por slug
   */
  async getPublicStaticPage(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const page = await StaticPage.findOne({
        where: {
          slug,
          is_published: true
        },
        attributes: ['id', 'slug', 'title', 'content', 'meta_title', 'meta_description', 'published_at']
      });

      if (!page) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Página no encontrada',
          error: 'PAGE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Página obtenida exitosamente',
        data: page,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo página estática:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener todas las páginas estáticas (admin)
   */
  async getAllStaticPages(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        search,
        is_published
      } = req.query;

      const where: any = {};
      if (search) {
        where.title = { [Op.iLike]: `%${search}%` };
      }
      if (is_published !== undefined) {
        where.is_published = is_published === 'true';
      }

      const { count, rows } = await StaticPage.findAndCountAll({
        where,
        include: [
          { association: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { association: 'updater', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ],
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['updated_at', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Páginas estáticas obtenidas exitosamente',
        data: {
          pages: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo páginas estáticas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear página estática
   */
  async createStaticPage(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { slug, title, content, meta_title, meta_description, is_published } = req.body;
      const userId = req.user?.id;

      const page = await StaticPage.create({
        slug,
        title,
        content,
        meta_title,
        meta_description,
        is_published: is_published || false,
        published_at: is_published ? new Date() : null,
        created_by: userId,
        updated_by: userId
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Página estática creada exitosamente',
        data: page,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error creando página estática:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'El slug ya existe',
          error: 'SLUG_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar página estática
   */
  async updateStaticPage(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const { slug, title, content, meta_title, meta_description, is_published } = req.body;
      const userId = req.user?.id;

      const page = await StaticPage.findByPk(id);
      if (!page) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Página no encontrada',
          error: 'PAGE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: any = {
        slug,
        title,
        content,
        meta_title,
        meta_description,
        updated_by: userId
      };

      // Si se está publicando por primera vez
      if (is_published && !page.is_published) {
        updateData.is_published = true;
        updateData.published_at = new Date();
      } else if (!is_published && page.is_published) {
        updateData.is_published = false;
        updateData.published_at = null;
      } else {
        updateData.is_published = is_published;
      }

      await page.update(updateData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Página estática actualizada exitosamente',
        data: page,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error actualizando página estática:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'El slug ya existe',
          error: 'SLUG_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar página estática
   */
  async deleteStaticPage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const page = await StaticPage.findByPk(id);
      if (!page) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Página no encontrada',
          error: 'PAGE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await page.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Página estática eliminada exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando página estática:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // TERMS
  // ====================================================================

  /**
   * Obtener términos activos
   */
  async getActiveTerms(req: Request, res: Response): Promise<void> {
    try {
      const terms = await Term.findOne({
        where: { is_active: true },
        include: [
          { association: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { association: 'updater', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ],
        order: [['effective_date', 'DESC']]
      });

      if (!terms) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'No hay términos activos',
          error: 'NO_ACTIVE_TERMS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Términos obtenidos exitosamente',
        data: terms,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo términos activos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener todas las versiones de términos (admin)
   */
  async getAllTerms(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        is_active
      } = req.query;

      const where: any = {};
      if (is_active !== undefined) {
        where.is_active = is_active === 'true';
      }

      const { count, rows } = await Term.findAndCountAll({
        where,
        include: [
          { association: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { association: 'updater', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ],
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['effective_date', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Versiones de términos obtenidas exitosamente',
        data: {
          terms: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo versiones de términos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear nueva versión de términos
   */
  async createTerms(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { version, title, content, is_active, effective_date } = req.body;
      const userId = req.user?.id;

      // Si se está activando esta versión, desactivar las demás
      if (is_active) {
        await Term.update(
          { is_active: false, updated_by: userId },
          { where: { is_active: true } }
        );
      }

      const terms = await Term.create({
        version,
        title,
        content,
        is_active: is_active || false,
        effective_date: new Date(effective_date),
        created_by: userId,
        updated_by: userId
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Versión de términos creada exitosamente',
        data: terms,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error creando versión de términos:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'La versión ya existe',
          error: 'VERSION_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar versión de términos
   */
  async updateTerms(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const { version, title, content, is_active, effective_date } = req.body;
      const userId = req.user?.id;

      const terms = await Term.findByPk(id);
      if (!terms) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Versión de términos no encontrada',
          error: 'TERMS_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Si se está activando esta versión, desactivar las demás
      if (is_active && !terms.is_active) {
        await Term.update(
          { is_active: false, updated_by: userId },
          { where: { is_active: true } }
        );
      }

      await terms.update({
        version,
        title,
        content,
        is_active,
        effective_date: new Date(effective_date),
        updated_by: userId
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Versión de términos actualizada exitosamente',
        data: terms,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error actualizando versión de términos:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'La versión ya existe',
          error: 'VERSION_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar versión de términos
   */
  async deleteTerms(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const terms = await Term.findByPk(id);
      if (!terms) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Versión de términos no encontrada',
          error: 'TERMS_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // No permitir eliminar términos activos
      if (terms.is_active) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No se pueden eliminar términos activos',
          error: 'CANNOT_DELETE_ACTIVE_TERMS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await terms.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Versión de términos eliminada exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando versión de términos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // POLICIES
  // ====================================================================

  /**
   * Obtener política activa por tipo
   */
  async getActivePolicy(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;

      const policy = await Policy.findOne({
        where: { type, is_active: true },
        include: [
          { association: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { association: 'updater', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ],
        order: [['effective_date', 'DESC']]
      });

      if (!policy) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: `No hay política ${type} activa`,
          error: 'NO_ACTIVE_POLICY',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Política obtenida exitosamente',
        data: policy,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo política activa:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener todas las políticas (admin)
   */
  async getAllPolicies(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        type,
        is_active
      } = req.query;

      const where: any = {};
      if (type) {
        where.type = type;
      }
      if (is_active !== undefined) {
        where.is_active = is_active === 'true';
      }

      const { count, rows } = await Policy.findAndCountAll({
        where,
        include: [
          { association: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { association: 'updater', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ],
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['effective_date', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Políticas obtenidas exitosamente',
        data: {
          policies: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo políticas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear nueva versión de política
   */
  async createPolicy(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { type, version, title, content, is_active, effective_date } = req.body;
      const userId = req.user?.id;

      // Si se está activando esta versión, desactivar las demás del mismo tipo
      if (is_active) {
        await Policy.update(
          { is_active: false, updated_by: userId },
          { where: { type, is_active: true } }
        );
      }

      const policy = await Policy.create({
        type,
        version,
        title,
        content,
        is_active: is_active || false,
        effective_date: new Date(effective_date),
        created_by: userId,
        updated_by: userId
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Versión de política creada exitosamente',
        data: policy,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error creando versión de política:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'La versión ya existe para este tipo de política',
          error: 'VERSION_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar versión de política
   */
  async updatePolicy(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const { type, version, title, content, is_active, effective_date } = req.body;
      const userId = req.user?.id;

      const policy = await Policy.findByPk(id);
      if (!policy) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Versión de política no encontrada',
          error: 'POLICY_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Si se está activando esta versión, desactivar las demás del mismo tipo
      if (is_active && !policy.is_active) {
        await Policy.update(
          { is_active: false, updated_by: userId },
          { where: { type, is_active: true } }
        );
      }

      await policy.update({
        type,
        version,
        title,
        content,
        is_active,
        effective_date: new Date(effective_date),
        updated_by: userId
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Versión de política actualizada exitosamente',
        data: policy,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error actualizando versión de política:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'La versión ya existe para este tipo de política',
          error: 'VERSION_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar versión de política
   */
  async deletePolicy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const policy = await Policy.findByPk(id);
      if (!policy) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Versión de política no encontrada',
          error: 'POLICY_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // No permitir eliminar políticas activas
      if (policy.is_active) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No se pueden eliminar políticas activas',
          error: 'CANNOT_DELETE_ACTIVE_POLICY',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await policy.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Versión de política eliminada exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando versión de política:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // FAQS
  // ====================================================================

  /**
   * Obtener FAQs publicadas
   */
  async getPublicFaqs(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;

      const where: any = { is_published: true };
      if (category) {
        where.category = category;
      }

      const faqs = await Faq.findAll({
        where,
        attributes: ['id', 'category', 'question', 'answer', 'order'],
        order: [['category', 'ASC'], ['order', 'ASC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'FAQs obtenidas exitosamente',
        data: faqs,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo FAQs públicas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener categorías de FAQ
   */
  async getFaqCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Faq.findAll({
        where: { is_published: true },
        attributes: ['category'],
        group: ['category'],
        order: [['category', 'ASC']]
      });

      const categoryList = categories.map((cat: any) => cat.category);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Categorías de FAQ obtenidas exitosamente',
        data: categoryList,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo categorías de FAQ:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener todas las FAQs (admin)
   */
  async getAllFaqs(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        category,
        is_published,
        search
      } = req.query;

      const where: any = {};
      if (category) {
        where.category = category;
      }
      if (is_published !== undefined) {
        where.is_published = is_published === 'true';
      }
      if (search) {
        where.question = { [Op.iLike]: `%${search}%` };
      }

      const { count, rows } = await Faq.findAndCountAll({
        where,
        include: [
          { association: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { association: 'updater', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ],
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['category', 'ASC'], ['order', 'ASC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'FAQs obtenidas exitosamente',
        data: {
          faqs: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo FAQs:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear FAQ
   */
  async createFaq(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { category, question, answer, order, is_published } = req.body;
      const userId = req.user?.id;

      const faq = await Faq.create({
        category,
        question,
        answer,
        order: order || 0,
        is_published: is_published || false,
        published_at: is_published ? new Date() : null,
        created_by: userId,
        updated_by: userId
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'FAQ creada exitosamente',
        data: faq,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error creando FAQ:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar FAQ
   */
  async updateFaq(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const { category, question, answer, order, is_published } = req.body;
      const userId = req.user?.id;

      const faq = await Faq.findByPk(id);
      if (!faq) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'FAQ no encontrada',
          error: 'FAQ_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: any = {
        category,
        question,
        answer,
        order,
        updated_by: userId
      };

      // Si se está publicando por primera vez
      if (is_published && !faq.is_published) {
        updateData.is_published = true;
        updateData.published_at = new Date();
      } else if (!is_published && faq.is_published) {
        updateData.is_published = false;
        updateData.published_at = null;
      } else {
        updateData.is_published = is_published;
      }

      await faq.update(updateData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'FAQ actualizada exitosamente',
        data: faq,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error actualizando FAQ:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar FAQ
   */
  async deleteFaq(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const faq = await Faq.findByPk(id);
      if (!faq) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'FAQ no encontrada',
          error: 'FAQ_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await faq.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'FAQ eliminada exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando FAQ:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // BANNERS
  // ====================================================================

  /**
   * Obtener banners activos para mostrar
   */
  async getActiveBanners(req: Request, res: Response): Promise<void> {
    try {
      const { position, limit } = req.query;

      const banners = await Banner.findActiveBanners(
        position as string,
        limit ? parseInt(limit as string) : undefined
      );

      const publicBanners = banners.map(banner => banner.toPublicJSON());

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Banners obtenidos exitosamente',
        data: publicBanners,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo banners activos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener todos los banners (admin)
   */
  async getAllBanners(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        position,
        is_active,
        search
      } = req.query;

      const where: any = {};
      if (position) {
        where.position = position;
      }
      if (is_active !== undefined) {
        where.isActive = is_active === 'true';
      }
      if (search) {
        where.title = { [Op.iLike]: `%${search}%` };
      }

      const { count, rows } = await Banner.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['priority', 'DESC'], ['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Banners obtenidos exitosamente',
        data: {
          banners: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo banners:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear banner
   */
  async createBanner(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        title,
        description,
        imageUrl,
        linkUrl,
        position,
        isActive,
        startDate,
        endDate,
        priority,
        targetAudience,
        metadata
      } = req.body;

      const banner = await Banner.create({
        title,
        description,
        imageUrl,
        linkUrl,
        position,
        isActive: isActive || false,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        priority: priority || 0,
        targetAudience,
        metadata
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Banner creado exitosamente',
        data: banner,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error creando banner:', error);

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de banner inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar banner
   */
  async updateBanner(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const {
        title,
        description,
        imageUrl,
        linkUrl,
        position,
        isActive,
        startDate,
        endDate,
        priority,
        targetAudience,
        metadata
      } = req.body;

      const banner = await Banner.findByPk(id);
      if (!banner) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Banner no encontrado',
          error: 'BANNER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await banner.update({
        title,
        description,
        imageUrl,
        linkUrl,
        position,
        isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        priority,
        targetAudience,
        metadata
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Banner actualizado exitosamente',
        data: banner,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error actualizando banner:', error);

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de banner inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar banner
   */
  async deleteBanner(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const banner = await Banner.findByPk(id);
      if (!banner) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Banner no encontrado',
          error: 'BANNER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await banner.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Banner eliminado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando banner:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Incrementar contador de clics del banner
   */
  async incrementBannerClick(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const banner = await Banner.findByPk(id);
      if (!banner) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Banner no encontrado',
          error: 'BANNER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await banner.incrementClickCount();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Contador de clics incrementado',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error incrementando contador de clics:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Incrementar contador de visualizaciones del banner
   */
  async incrementBannerView(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const banner = await Banner.findByPk(id);
      if (!banner) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Banner no encontrado',
          error: 'BANNER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await banner.incrementViewCount();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Contador de visualizaciones incrementado',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error incrementando contador de visualizaciones:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // ARTICLES
  // ====================================================================

  /**
   * Obtener artículos publicados
   */
  async getPublishedArticles(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        tag,
        search
      } = req.query;

      let where: any = {};
      let include: any[] = [
        { model: require('../models/User').User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: ArticleCategory, as: 'category', attributes: ['id', 'name', 'slug', 'color', 'icon'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug', 'color'], through: { attributes: [] } }
      ];

      // Filtro por categoría
      if (category) {
        where.categoryId = category;
      }

      // Filtro por tag
      if (tag) {
        include.push({
          model: Tag,
          as: 'tags',
          where: { slug: tag },
          attributes: [],
          through: { attributes: [] },
          required: true
        });
      }

      // Búsqueda por título o contenido
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Article.findAndCountAll({
        where: {
          ...where,
          status: 'published',
          publishedAt: { [Op.lte]: new Date() }
        },
        include,
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['publishedAt', 'DESC']],
        distinct: true
      });

      const articles = rows.map(article => article.toPublicJSON());

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Artículos obtenidos exitosamente',
        data: {
          articles,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo artículos publicados:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener artículo por slug
   */
  async getArticleBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const article = await Article.findOne({
        where: { slug, status: 'published' },
        include: [
          { model: require('../models/User').User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: ArticleCategory, as: 'category', attributes: ['id', 'name', 'slug', 'color', 'icon'] },
          { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug', 'color'], through: { attributes: [] } }
        ]
      });

      if (!article) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Artículo no encontrado',
          error: 'ARTICLE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Incrementar contador de visualizaciones
      await article.incrementViewCount();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Artículo obtenido exitosamente',
        data: article.toDetailedJSON(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo artículo:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener comentarios de un artículo
   */
  async getArticleComments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const comments = await Comment.findApprovedByArticle(
        parseInt(id),
        parseInt(limit as string),
        (parseInt(page as string) - 1) * parseInt(limit as string)
      );

      const publicComments = comments.map(comment => comment.toPublicJSON());

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comentarios obtenidos exitosamente',
        data: publicComments,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo comentarios del artículo:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener todas las categorías de artículos activas
   */
  async getActiveArticleCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await ArticleCategory.findActive();

      const publicCategories = categories.map(category => category.toPublicJSON());

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Categorías obtenidas exitosamente',
        data: publicCategories,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo categorías activas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener categoría por slug
   */
  async getArticleCategoryBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const category = await ArticleCategory.findBySlug(slug);

      if (!category) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Categoría no encontrada',
          error: 'CATEGORY_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Categoría obtenida exitosamente',
        data: category.toDetailedJSON(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo categoría:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener tags activos
   */
  async getActiveTags(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50 } = req.query;

      const tags = await Tag.findActive(parseInt(limit as string));

      const publicTags = tags.map(tag => tag.toPublicJSON());

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Tags obtenidos exitosamente',
        data: publicTags,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo tags activos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener todos los artículos (admin)
   */
  async getAllArticles(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        status,
        categoryId,
        authorId,
        search
      } = req.query;

      const where: any = {};

      if (status) {
        where.status = status;
      }
      if (categoryId) {
        where.categoryId = categoryId;
      }
      if (authorId) {
        where.authorId = authorId;
      }
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Article.findAndCountAll({
        where,
        include: [
          { model: require('../models/User').User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: ArticleCategory, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }
        ],
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['updatedAt', 'DESC']],
        distinct: true
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Artículos obtenidos exitosamente',
        data: {
          articles: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo artículos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear artículo
   */
  async createArticle(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status = 'draft',
        publishedAt,
        authorId,
        categoryId,
        seoTitle,
        seoDescription,
        seoKeywords,
        metadata
      } = req.body;

      const article = await Article.create({
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        authorId,
        categoryId,
        seoTitle,
        seoDescription,
        seoKeywords,
        metadata
      });

      // Recargar con asociaciones
      await article.reload({
        include: [
          { model: require('../models/User').User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: ArticleCategory, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }
        ]
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Artículo creado exitosamente',
        data: article,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error creando artículo:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'El slug ya existe',
          error: 'SLUG_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de artículo inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar artículo
   */
  async updateArticle(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status,
        publishedAt,
        authorId,
        categoryId,
        seoTitle,
        seoDescription,
        seoKeywords,
        metadata
      } = req.body;

      const article = await Article.findByPk(id);
      if (!article) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Artículo no encontrado',
          error: 'ARTICLE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await article.update({
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        authorId,
        categoryId,
        seoTitle,
        seoDescription,
        seoKeywords,
        metadata
      });

      // Recargar con asociaciones
      await article.reload({
        include: [
          { model: require('../models/User').User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: ArticleCategory, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }
        ]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Artículo actualizado exitosamente',
        data: article,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error actualizando artículo:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'El slug ya existe',
          error: 'SLUG_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de artículo inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar artículo
   */
  async deleteArticle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const article = await Article.findByPk(id);
      if (!article) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Artículo no encontrado',
          error: 'ARTICLE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await article.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Artículo eliminado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando artículo:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // ARTICLE CATEGORIES
  // ====================================================================

  /**
   * Obtener todas las categorías de artículos (admin)
   */
  async getAllArticleCategories(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        isActive,
        search
      } = req.query;

      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
      }

      const { count, rows } = await ArticleCategory.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['order', 'ASC'], ['name', 'ASC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Categorías obtenidas exitosamente',
        data: {
          categories: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo categorías:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear categoría de artículo
   */
  async createArticleCategory(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        name,
        slug,
        description,
        color,
        icon,
        parentId,
        order = 0,
        isActive = true,
        seoTitle,
        seoDescription,
        metadata
      } = req.body;

      const category = await ArticleCategory.create({
        name,
        slug,
        description,
        color,
        icon,
        parentId,
        order,
        isActive,
        seoTitle,
        seoDescription,
        metadata
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: category,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error creando categoría:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'El slug ya existe',
          error: 'SLUG_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de categoría inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar categoría de artículo
   */
  async updateArticleCategory(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const {
        name,
        slug,
        description,
        color,
        icon,
        parentId,
        order,
        isActive,
        seoTitle,
        seoDescription,
        metadata
      } = req.body;

      const category = await ArticleCategory.findByPk(id);
      if (!category) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Categoría no encontrada',
          error: 'CATEGORY_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await category.update({
        name,
        slug,
        description,
        color,
        icon,
        parentId,
        order,
        isActive,
        seoTitle,
        seoDescription,
        metadata
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: category,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error actualizando categoría:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'El slug ya existe',
          error: 'SLUG_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de categoría inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar categoría de artículo
   */
  async deleteArticleCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await ArticleCategory.findByPk(id);
      if (!category) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Categoría no encontrada',
          error: 'CATEGORY_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await category.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Categoría eliminada exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando categoría:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // TAGS
  // ====================================================================

  /**
   * Obtener todos los tags (admin)
   */
  async getAllTags(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        isActive,
        search
      } = req.query;

      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
      }

      const { count, rows } = await Tag.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['usageCount', 'DESC'], ['name', 'ASC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Tags obtenidos exitosamente',
        data: {
          tags: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo tags:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear tag
   */
  async createTag(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        name,
        slug,
        description,
        color,
        isActive = true,
        seoTitle,
        seoDescription,
        metadata
      } = req.body;

      const tag = await Tag.create({
        name,
        slug,
        description,
        color,
        isActive,
        seoTitle,
        seoDescription,
        metadata
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Tag creado exitosamente',
        data: tag,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error creando tag:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'El slug ya existe',
          error: 'SLUG_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de tag inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar tag
   */
  async updateTag(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const {
        name,
        slug,
        description,
        color,
        isActive,
        seoTitle,
        seoDescription,
        metadata
      } = req.body;

      const tag = await Tag.findByPk(id);
      if (!tag) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Tag no encontrado',
          error: 'TAG_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await tag.update({
        name,
        slug,
        description,
        color,
        isActive,
        seoTitle,
        seoDescription,
        metadata
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Tag actualizado exitosamente',
        data: tag,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error actualizando tag:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'El slug ya existe',
          error: 'SLUG_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de tag inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar tag
   */
  async deleteTag(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const tag = await Tag.findByPk(id);
      if (!tag) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Tag no encontrado',
          error: 'TAG_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await tag.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Tag eliminado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando tag:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // COMMENTS
  // ====================================================================

  /**
   * Obtener todos los comentarios (admin)
   */
  async getAllComments(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        status,
        articleId,
        authorId,
        search
      } = req.query;

      const where: any = {};

      if (status) {
        where.status = status;
      }
      if (articleId) {
        where.articleId = articleId;
      }
      if (authorId) {
        where.authorId = authorId;
      }
      if (search) {
        where.content = { [Op.iLike]: `%${search}%` };
      }

      const { count, rows } = await Comment.findAndCountAll({
        where,
        include: [
          { model: require('../models/User').User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Article, as: 'article', attributes: ['id', 'title', 'slug'] }
        ],
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comentarios obtenidos exitosamente',
        data: {
          comments: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo comentarios:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear comentario
   */
  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        content,
        articleId,
        authorId,
        parentId,
        authorName,
        authorEmail,
        authorWebsite,
        metadata
      } = req.body;

      // Verificar que el artículo existe y está publicado
      const article = await Article.findByPk(articleId);
      if (!article || article.status !== 'published') {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Artículo no encontrado o no disponible para comentarios',
          error: 'ARTICLE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const comment = await Comment.create({
        content,
        articleId,
        authorId,
        parentId,
        status: 'pending', // Comentarios requieren moderación
        authorName,
        authorEmail,
        authorWebsite,
        authorIp: req.ip,
        userAgent: req.get('User-Agent'),
        metadata
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Comentario creado exitosamente y pendiente de moderación',
        data: comment.toPublicJSON(),
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error creando comentario:', error);

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de comentario inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Aprobar comentario
   */
  async approveComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Comentario no encontrado',
          error: 'COMMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await comment.approve();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comentario aprobado exitosamente',
        data: comment.toPublicJSON(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error aprobando comentario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Rechazar comentario
   */
  async rejectComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Comentario no encontrado',
          error: 'COMMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await comment.reject();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comentario rechazado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error rechazando comentario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Marcar comentario como spam
   */
  async markCommentAsSpam(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Comentario no encontrado',
          error: 'COMMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await comment.markAsSpam();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comentario marcado como spam exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error marcando comentario como spam:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar comentario
   */
  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Comentario no encontrado',
          error: 'COMMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await comment.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Comentario eliminado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando comentario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Dar like a comentario
   */
  async likeComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Comentario no encontrado',
          error: 'COMMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await comment.incrementLikeCount();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Like registrado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error dando like al comentario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Dar dislike a comentario
   */
  async dislikeComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Comentario no encontrado',
          error: 'COMMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await comment.incrementDislikeCount();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Dislike registrado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error dando dislike al comentario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Reportar comentario
   */
  async reportComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Comentario no encontrado',
          error: 'COMMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await comment.incrementReportedCount();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Reporte registrado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error reportando comentario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // PROMOTIONAL ADS
  // ====================================================================

  /**
   * Obtener anuncios promocionales activos para mostrar
   */
  async getActivePromotionalAds(req: Request, res: Response): Promise<void> {
    try {
      const { platform, adType, limit } = req.query;

      const ads = await PromotionalAd.findActiveAds(
        platform as string,
        adType as string,
        limit ? parseInt(limit as string) : undefined
      );

      const publicAds = ads.map(ad => ad.toPublicJSON());

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Anuncios promocionales obtenidos exitosamente',
        data: publicAds,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo anuncios promocionales activos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener todos los anuncios promocionales (admin)
   */
  async getAllPromotionalAds(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        adType,
        is_active,
        search
      } = req.query;

      const where: any = {};
      if (adType) {
        where.adType = adType;
      }
      if (is_active !== undefined) {
        where.isActive = is_active === 'true';
      }
      if (search) {
        where.title = { [Op.iLike]: `%${search}%` };
      }

      const { count, rows } = await PromotionalAd.findAndCountAll({
        where,
        include: [
          { association: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ],
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        order: [['priority', 'DESC'], ['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Anuncios promocionales obtenidos exitosamente',
        data: {
          ads: rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit as string)),
            hasNext: parseInt(page as string) * parseInt(limit as string) < count,
            hasPrev: parseInt(page as string) > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo anuncios promocionales:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear anuncio promocional
   */
  async createPromotionalAd(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        title,
        description,
        content,
        imageUrl,
        videoUrl,
        linkUrl,
        adType,
        targetPlatform,
        budget,
        currency,
        isActive,
        startDate,
        endDate,
        priority,
        targetAudience,
        location,
        ageRange,
        interests,
        costPerClick,
        costPerView,
        metadata
      } = req.body;

      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const ad = await PromotionalAd.create({
        title,
        description,
        content,
        imageUrl,
        videoUrl,
        linkUrl,
        adType,
        targetPlatform,
        budget,
        currency: currency || 'GTQ',
        isActive: isActive || false,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        priority: priority || 0,
        targetAudience,
        location,
        ageRange,
        interests,
        costPerClick,
        costPerView,
        createdBy: userId
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Anuncio promocional creado exitosamente',
        data: ad,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error creando anuncio promocional:', error);

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de anuncio inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar anuncio promocional
   */
  async updatePromotionalAd(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const {
        title,
        description,
        content,
        imageUrl,
        videoUrl,
        linkUrl,
        adType,
        targetPlatform,
        budget,
        currency,
        isActive,
        startDate,
        endDate,
        priority,
        targetAudience,
        location,
        ageRange,
        interests,
        costPerClick,
        costPerView,
        metadata
      } = req.body;

      const ad = await PromotionalAd.findByPk(id);
      if (!ad) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Anuncio promocional no encontrado',
          error: 'AD_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await ad.update({
        title,
        description,
        content,
        imageUrl,
        videoUrl,
        linkUrl,
        adType,
        targetPlatform,
        budget,
        currency,
        isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        priority,
        targetAudience,
        location,
        ageRange,
        interests,
        costPerClick,
        costPerView,
        metadata
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Anuncio promocional actualizado exitosamente',
        data: ad,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Error actualizando anuncio promocional:', error);

      if (error.name === 'SequelizeValidationError') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de anuncio inválidos',
          error: 'VALIDATION_ERROR',
          details: error.errors.map((e: any) => ({ field: e.path, message: e.message })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar anuncio promocional
   */
  async deletePromotionalAd(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ad = await PromotionalAd.findByPk(id);
      if (!ad) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Anuncio promocional no encontrado',
          error: 'AD_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await ad.destroy();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Anuncio promocional eliminado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando anuncio promocional:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Incrementar contador de clics del anuncio
   */
  async incrementAdClick(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ad = await PromotionalAd.findByPk(id);
      if (!ad) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Anuncio promocional no encontrado',
          error: 'AD_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await ad.incrementClickCount();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Contador de clics incrementado',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error incrementando contador de clics:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Incrementar contador de visualizaciones del anuncio
   */
  async incrementAdView(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ad = await PromotionalAd.findByPk(id);
      if (!ad) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Anuncio promocional no encontrado',
          error: 'AD_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await ad.incrementViewCount();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Contador de visualizaciones incrementado',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error incrementando contador de visualizaciones:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Incrementar contador de conversiones del anuncio
   */
  async incrementAdConversion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ad = await PromotionalAd.findByPk(id);
      if (!ad) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Anuncio promocional no encontrado',
          error: 'AD_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await ad.incrementConversionCount();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Contador de conversiones incrementado',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error incrementando contador de conversiones:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const cmsController = new CMSController();