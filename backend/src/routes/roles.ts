/**
 * @fileoverview Rutas para gestión de roles del sistema
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para obtener y gestionar roles del sistema
 */

import { Router, Request, Response } from 'express';
import { query } from 'express-validator';
import { authenticated } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { HTTP_STATUS } from '../utils/constants';

const router = Router();

// Rate limiter para consultas de roles
const rolesLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Listar roles del sistema
 *     description: Obtiene lista paginada de roles del sistema con filtros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Roles obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticated, rolesLimiter, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('search').optional().isString().isLength({ min: 1, max: 255 }).withMessage('Búsqueda debe ser una cadena de 1-255 caracteres'),
  query('isActive').optional().isBoolean().withMessage('isActive debe ser un booleano')
], async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    // Importar modelos dinámicamente para evitar dependencias circulares
    const { Role, Permission, User } = await import('../models');

    // Construir consulta base
    let whereClause: any = {};
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    if (search) {
      whereClause = {
        ...whereClause,
        [require('sequelize').Op.or]: [
          { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { displayName: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
        ]
      };
    }

    // Obtener roles con paginación
    const { rows: roles, count: total } = await Role.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'displayName', 'description', 'resource', 'action', 'isActive', 'isSystem'],
          through: { attributes: [] } // Excluir atributos de la tabla intermedia
        }
      ],
      attributes: ['id', 'name', 'displayName', 'description', 'isActive', 'isSystem', 'level', 'color', 'icon', 'createdAt', 'updatedAt'],
      order: [['level', 'DESC'], ['name', 'ASC']],
      limit: parseInt(limit as string),
      offset: (parseInt(page as string) - 1) * parseInt(limit as string)
    });

    // Obtener conteo de usuarios por rol
    const rolesWithUserCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.count({
          include: [{
            model: require('../models').Role,
            as: 'roles',
            where: { name: role.name },
            through: { attributes: [] }
          }],
          distinct: true
        });

        return {
          id: role.id,
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          isActive: role.isActive,
          isSystem: role.isSystem,
          level: role.level,
          color: role.color,
          icon: role.icon,
          userCount,
          permissions: role.permissions || [],
          createdAt: role.createdAt,
          updatedAt: role.updatedAt
        };
      })
    );

    // Calcular información de paginación
    const totalPages = Math.ceil(total / parseInt(limit as string));
    const hasNext = parseInt(page as string) < totalPages;
    const hasPrev = parseInt(page as string) > 1;

    res.json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      data: {
        roles: rolesWithUserCount,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
          hasNext,
          hasPrev
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo roles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al obtener roles',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;