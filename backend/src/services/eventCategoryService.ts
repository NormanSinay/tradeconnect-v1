/**
 * @fileoverview Servicio de Categorías de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de categorías de eventos
 *
 * Archivo: backend/src/services/eventCategoryService.ts
 */

import { Transaction } from 'sequelize';
import { EventCategory, EventCategoryAttributes, EventCategoryCreationAttributes } from '../models/EventCategory';
import { EventType, EventTypeAttributes, EventTypeCreationAttributes } from '../models/EventType';
import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';
import { eventService } from './eventService';

export interface CreateCategoryData {
  name: string;
  displayName: string;
  description?: string;
}

export interface UpdateCategoryData {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateTypeData {
  name: string;
  displayName: string;
  description?: string;
}

export interface UpdateTypeData {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class EventCategoryService {
  private static readonly CACHE_TTL = 300; // 5 minutes
  private static readonly CACHE_PREFIX = 'event_categories';

  // ====================================================================
  // GESTIÓN DE CATEGORÍAS
  // ====================================================================

  /**
   * Crea una nueva categoría de evento
   */
  static async createCategory(data: CreateCategoryData, transaction?: Transaction): Promise<EventCategory> {
    try {
      logger.info('Creating new event category', { data });

      // Validar que el nombre no exista
      const existingCategory = await EventCategory.findByName(data.name);
      if (existingCategory) {
        throw new Error('Ya existe una categoría con ese nombre');
      }

      const category = await EventCategory.create({
        name: data.name.toLowerCase(),
        displayName: data.displayName,
        description: data.description,
        isActive: true
      }, { transaction });

      // Limpiar caché
      await this.clearCategoriesCache();

      // Emitir evento
      eventService.getEventEmitter().emit('EventCategoryCreated', {
        categoryId: category.id,
        categoryName: category.name,
        timestamp: new Date()
      });

      logger.info('Event category created successfully', { categoryId: category.id });
      return category;
    } catch (error) {
      logger.error('Error creating event category', { error, data });
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías con paginación
   */
  static async getCategories(options: PaginationOptions = {}): Promise<PaginatedResult<EventCategory>> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        isActive
      } = options;

      const offset = (page - 1) * limit;
      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.$or = [
          { name: { $iLike: `%${search}%` } },
          { displayName: { $iLike: `%${search}%` } },
          { description: { $iLike: `%${search}%` } }
        ];
      }

      const { rows: categories, count: total } = await EventCategory.findAndCountAll({
        where,
        limit,
        offset,
        order: [['displayName', 'ASC']]
      });

      const pages = Math.ceil(total / limit);

      return {
        data: categories,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      logger.error('Error getting categories', { error, options });
      throw error;
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  static async getCategoryById(id: number): Promise<EventCategory | null> {
    try {
      const category = await EventCategory.findByPk(id);
      return category;
    } catch (error) {
      logger.error('Error getting category by ID', { error, id });
      throw error;
    }
  }

  /**
   * Actualiza una categoría
   */
  static async updateCategory(id: number, data: UpdateCategoryData, transaction?: Transaction): Promise<EventCategory> {
    try {
      logger.info('Updating event category', { id, data });

      const category = await EventCategory.findByPk(id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      await category.update(data, { transaction });

      // Limpiar caché
      await this.clearCategoriesCache();

      // Emitir evento
      eventService.getEventEmitter().emit('EventCategoryUpdated', {
        categoryId: id,
        changes: data,
        timestamp: new Date()
      });

      logger.info('Event category updated successfully', { categoryId: id });
      return category;
    } catch (error) {
      logger.error('Error updating event category', { error, id, data });
      throw error;
    }
  }

  /**
   * Elimina una categoría (soft delete)
   */
  static async deleteCategory(id: number, transaction?: Transaction): Promise<void> {
    try {
      logger.info('Deleting event category', { id });

      const category = await EventCategory.findByPk(id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar si tiene eventos asociados
      const eventsCount = await category.$count('events');
      if (eventsCount > 0) {
        throw new Error('No se puede eliminar la categoría porque tiene eventos asociados');
      }

      await category.update({ isActive: false }, { transaction });

      // Limpiar caché
      await this.clearCategoriesCache();

      // Emitir evento
      eventService.getEventEmitter().emit('EventCategoryDeleted', {
        categoryId: id,
        categoryName: category.name,
        timestamp: new Date()
      });

      logger.info('Event category deleted successfully', { categoryId: id });
    } catch (error) {
      logger.error('Error deleting event category', { error, id });
      throw error;
    }
  }

  /**
   * Obtiene categorías activas (con caché)
   */
  static async getActiveCategories(): Promise<EventCategory[]> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:active`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const categories = await EventCategory.findActiveCategories();

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(categories));

      return categories;
    } catch (error) {
      logger.error('Error getting active categories', { error });
      // Fallback sin caché
      return EventCategory.findActiveCategories();
    }
  }

  // ====================================================================
  // GESTIÓN DE TIPOS DE EVENTOS
  // ====================================================================

  /**
   * Crea un nuevo tipo de evento
   */
  static async createType(data: CreateTypeData, transaction?: Transaction): Promise<EventType> {
    try {
      logger.info('Creating new event type', { data });

      // Validar que el nombre no exista
      const existingType = await EventType.findByName(data.name);
      if (existingType) {
        throw new Error('Ya existe un tipo de evento con ese nombre');
      }

      const type = await EventType.create({
        name: data.name.toLowerCase(),
        displayName: data.displayName,
        description: data.description,
        isActive: true
      }, { transaction });

      // Limpiar caché
      await this.clearTypesCache();

      // Emitir evento
      eventService.getEventEmitter().emit('EventTypeCreated', {
        typeId: type.id,
        typeName: type.name,
        timestamp: new Date()
      });

      logger.info('Event type created successfully', { typeId: type.id });
      return type;
    } catch (error) {
      logger.error('Error creating event type', { error, data });
      throw error;
    }
  }

  /**
   * Obtiene todos los tipos con paginación
   */
  static async getTypes(options: PaginationOptions = {}): Promise<PaginatedResult<EventType>> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        isActive
      } = options;

      const offset = (page - 1) * limit;
      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.$or = [
          { name: { $iLike: `%${search}%` } },
          { displayName: { $iLike: `%${search}%` } },
          { description: { $iLike: `%${search}%` } }
        ];
      }

      const { rows: types, count: total } = await EventType.findAndCountAll({
        where,
        limit,
        offset,
        order: [['displayName', 'ASC']]
      });

      const pages = Math.ceil(total / limit);

      return {
        data: types,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      logger.error('Error getting types', { error, options });
      throw error;
    }
  }

  /**
   * Obtiene un tipo por ID
   */
  static async getTypeById(id: number): Promise<EventType | null> {
    try {
      const type = await EventType.findByPk(id);
      return type;
    } catch (error) {
      logger.error('Error getting type by ID', { error, id });
      throw error;
    }
  }

  /**
   * Actualiza un tipo de evento
   */
  static async updateType(id: number, data: UpdateTypeData, transaction?: Transaction): Promise<EventType> {
    try {
      logger.info('Updating event type', { id, data });

      const type = await EventType.findByPk(id);
      if (!type) {
        throw new Error('Tipo de evento no encontrado');
      }

      await type.update(data, { transaction });

      // Limpiar caché
      await this.clearTypesCache();

      // Emitir evento
      eventService.getEventEmitter().emit('EventTypeUpdated', {
        typeId: id,
        changes: data,
        timestamp: new Date()
      });

      logger.info('Event type updated successfully', { typeId: id });
      return type;
    } catch (error) {
      logger.error('Error updating event type', { error, id, data });
      throw error;
    }
  }

  /**
   * Elimina un tipo de evento (soft delete)
   */
  static async deleteType(id: number, transaction?: Transaction): Promise<void> {
    try {
      logger.info('Deleting event type', { id });

      const type = await EventType.findByPk(id);
      if (!type) {
        throw new Error('Tipo de evento no encontrado');
      }

      // Verificar si tiene eventos asociados
      const eventsCount = await type.$count('events');
      if (eventsCount > 0) {
        throw new Error('No se puede eliminar el tipo porque tiene eventos asociados');
      }

      await type.update({ isActive: false }, { transaction });

      // Limpiar caché
      await this.clearTypesCache();

      // Emitir evento
      eventService.getEventEmitter().emit('EventTypeDeleted', {
        typeId: id,
        typeName: type.name,
        timestamp: new Date()
      });

      logger.info('Event type deleted successfully', { typeId: id });
    } catch (error) {
      logger.error('Error deleting event type', { error, id });
      throw error;
    }
  }

  /**
   * Obtiene tipos activos (con caché)
   */
  static async getActiveTypes(): Promise<EventType[]> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:types:active`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const types = await EventType.findActiveTypes();

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(types));

      return types;
    } catch (error) {
      logger.error('Error getting active types', { error });
      // Fallback sin caché
      return EventType.findActiveTypes();
    }
  }

  // ====================================================================
  // UTILIDADES DE CACHÉ
  // ====================================================================

  /**
   * Limpia el caché de categorías
   */
  private static async clearCategoriesCache(): Promise<void> {
    try {
      const keys = await cacheRedis.keys(`${this.CACHE_PREFIX}:*`);
      if (keys.length > 0) {
        await cacheRedis.del(keys);
      }
    } catch (error) {
      logger.error('Error clearing categories cache', { error });
    }
  }

  /**
   * Limpia el caché de tipos
   */
  private static async clearTypesCache(): Promise<void> {
    try {
      const keys = await cacheRedis.keys(`${this.CACHE_PREFIX}:types:*`);
      if (keys.length > 0) {
        await cacheRedis.del(keys);
      }
    } catch (error) {
      logger.error('Error clearing types cache', { error });
    }
  }
}