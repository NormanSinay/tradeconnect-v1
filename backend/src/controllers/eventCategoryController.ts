/**
 * @fileoverview Controlador de Categorías y Tipos de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de categorías y tipos de eventos
 *
 * Archivo: backend/src/controllers/eventCategoryController.ts
 */

import { Request, Response } from 'express';
import { EventCategoryService } from '../services/eventCategoryService';
import { successResponse, errorResponse } from '../utils/common.utils';
import { logger } from '../utils/logger';

export class EventCategoryController {
  // ====================================================================
  // CONTROLADORES DE CATEGORÍAS
  // ====================================================================

  /**
   * Obtiene todas las categorías con paginación
   */
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = '1',
        limit = '20',
        search,
        isActive
      } = req.query;

      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string,
        isActive: isActive === undefined ? undefined : isActive === 'true'
      };

      const result = await EventCategoryService.getCategories(options);

      res.json(successResponse(result, 'Categorías obtenidas exitosamente'));
    } catch (error) {
      logger.error('Error getting categories', { error, query: req.query });
      res.status(500).json(errorResponse('Error al obtener categorías'));
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  static async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id, 10);

      if (isNaN(categoryId)) {
        res.status(400).json(errorResponse('ID de categoría inválido'));
        return;
      }

      const category = await EventCategoryService.getCategoryById(categoryId);

      if (!category) {
        res.status(404).json(errorResponse('Categoría no encontrada'));
        return;
      }

      res.json(successResponse(category, 'Categoría obtenida exitosamente'));
    } catch (error) {
      logger.error('Error getting category by ID', { error, id: req.params.id });
      res.status(500).json(errorResponse('Error al obtener categoría'));
    }
  }

  /**
   * Crea una nueva categoría
   */
  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, displayName, description } = req.body;

      const category = await EventCategoryService.createCategory({
        name,
        displayName,
        description
      });

      res.status(201).json(successResponse(category, 'Categoría creada exitosamente'));
    } catch (error) {
      logger.error('Error creating category', { error, body: req.body });

      if (error instanceof Error && error.message.includes('Ya existe')) {
        res.status(409).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al crear categoría'));
    }
  }

  /**
   * Actualiza una categoría
   */
  static async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id, 10);

      if (isNaN(categoryId)) {
        res.status(400).json(errorResponse('ID de categoría inválido'));
        return;
      }

      const { displayName, description, isActive } = req.body;

      const category = await EventCategoryService.updateCategory(categoryId, {
        displayName,
        description,
        isActive
      });

      res.json(successResponse(category, 'Categoría actualizada exitosamente'));
    } catch (error) {
      logger.error('Error updating category', { error, id: req.params.id, body: req.body });

      if (error instanceof Error && error.message.includes('no encontrada')) {
        res.status(404).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al actualizar categoría'));
    }
  }

  /**
   * Elimina una categoría
   */
  static async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id, 10);

      if (isNaN(categoryId)) {
        res.status(400).json(errorResponse('ID de categoría inválido'));
        return;
      }

      await EventCategoryService.deleteCategory(categoryId);

      res.json(successResponse(null, 'Categoría eliminada exitosamente'));
    } catch (error) {
      logger.error('Error deleting category', { error, id: req.params.id });

      if (error instanceof Error && error.message.includes('no encontrada')) {
        res.status(404).json(errorResponse(error.message));
        return;
      }

      if (error instanceof Error && error.message.includes('tiene eventos asociados')) {
        res.status(409).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al eliminar categoría'));
    }
  }

  /**
   * Obtiene categorías activas (con caché)
   */
  static async getActiveCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await EventCategoryService.getActiveCategories();
      res.json(successResponse(categories, 'Categorías activas obtenidas exitosamente'));
    } catch (error) {
      logger.error('Error getting active categories', { error });
      res.status(500).json(errorResponse('Error al obtener categorías activas'));
    }
  }

  // ====================================================================
  // CONTROLADORES DE TIPOS DE EVENTOS
  // ====================================================================

  /**
   * Obtiene todos los tipos con paginación
   */
  static async getTypes(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = '1',
        limit = '20',
        search,
        isActive
      } = req.query;

      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string,
        isActive: isActive === undefined ? undefined : isActive === 'true'
      };

      const result = await EventCategoryService.getTypes(options);

      res.json(successResponse(result, 'Tipos de eventos obtenidos exitosamente'));
    } catch (error) {
      logger.error('Error getting types', { error, query: req.query });
      res.status(500).json(errorResponse('Error al obtener tipos de eventos'));
    }
  }

  /**
   * Obtiene un tipo por ID
   */
  static async getTypeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const typeId = parseInt(id, 10);

      if (isNaN(typeId)) {
        res.status(400).json(errorResponse('ID de tipo inválido'));
        return;
      }

      const type = await EventCategoryService.getTypeById(typeId);

      if (!type) {
        res.status(404).json(errorResponse('Tipo de evento no encontrado'));
        return;
      }

      res.json(successResponse(type, 'Tipo de evento obtenido exitosamente'));
    } catch (error) {
      logger.error('Error getting type by ID', { error, id: req.params.id });
      res.status(500).json(errorResponse('Error al obtener tipo de evento'));
    }
  }

  /**
   * Crea un nuevo tipo de evento
   */
  static async createType(req: Request, res: Response): Promise<void> {
    try {
      const { name, displayName, description } = req.body;

      const type = await EventCategoryService.createType({
        name,
        displayName,
        description
      });

      res.status(201).json(successResponse(type, 'Tipo de evento creado exitosamente'));
    } catch (error) {
      logger.error('Error creating type', { error, body: req.body });

      if (error instanceof Error && error.message.includes('Ya existe')) {
        res.status(409).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al crear tipo de evento'));
    }
  }

  /**
   * Actualiza un tipo de evento
   */
  static async updateType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const typeId = parseInt(id, 10);

      if (isNaN(typeId)) {
        res.status(400).json(errorResponse('ID de tipo inválido'));
        return;
      }

      const { displayName, description, isActive } = req.body;

      const type = await EventCategoryService.updateType(typeId, {
        displayName,
        description,
        isActive
      });

      res.json(successResponse(type, 'Tipo de evento actualizado exitosamente'));
    } catch (error) {
      logger.error('Error updating type', { error, id: req.params.id, body: req.body });

      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al actualizar tipo de evento'));
    }
  }

  /**
   * Elimina un tipo de evento
   */
  static async deleteType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const typeId = parseInt(id, 10);

      if (isNaN(typeId)) {
        res.status(400).json(errorResponse('ID de tipo inválido'));
        return;
      }

      await EventCategoryService.deleteType(typeId);

      res.json(successResponse(null, 'Tipo de evento eliminado exitosamente'));
    } catch (error) {
      logger.error('Error deleting type', { error, id: req.params.id });

      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json(errorResponse(error.message));
        return;
      }

      if (error instanceof Error && error.message.includes('tiene eventos asociados')) {
        res.status(409).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al eliminar tipo de evento'));
    }
  }

  /**
   * Obtiene tipos activos (con caché)
   */
  static async getActiveTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await EventCategoryService.getActiveTypes();
      res.json(successResponse(types, 'Tipos activos obtenidos exitosamente'));
    } catch (error) {
      logger.error('Error getting active types', { error });
      res.status(500).json(errorResponse('Error al obtener tipos activos'));
    }
  }
}
