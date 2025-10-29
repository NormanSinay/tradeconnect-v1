/**
 * @fileoverview Rutas de API para gestión del carrito de compras
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas REST para el módulo de carrito
 *
 * Archivo: backend/src/routes/cart.ts
 */

import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiting';

const router = Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Obtener carrito actual
 *     description: Obtiene el carrito de compras del usuario actual o por sesión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: ID de sesión del carrito (alternativo a autenticación)
 *         required: false
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: ID de sesión alternativo como parámetro query
 *         required: false
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *       400:
 *         description: Se requiere userId o sessionId
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Carrito no encontrado
 */
router.get(
  '/',
  authenticateToken,
  generalLimiter,
  cartController.getCart.bind(cartController)
);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     tags: [Cart]
 *     summary: Agregar item al carrito
 *     description: Agrega un nuevo item al carrito de compras
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: ID de sesión del carrito (alternativo a autenticación)
 *         required: false
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: ID de sesión alternativo como parámetro query
 *         required: false
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItemRequest'
 *     responses:
 *       201:
 *         description: Item agregado exitosamente
 *       400:
 *         description: Datos inválidos o se requiere userId/sessionId
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 *       409:
 *         description: Evento sin disponibilidad
 */
router.post(
  '/add',
  authenticateToken,
  generalLimiter,
  cartController.addItem.bind(cartController)
);

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     tags: [Cart]
 *     summary: Actualizar item del carrito
 *     description: Actualiza la cantidad o datos de un item en el carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: ID de sesión del carrito (alternativo a autenticación)
 *         required: false
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: ID de sesión alternativo como parámetro query
 *         required: false
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartUpdateRequest'
 *     responses:
 *       200:
 *         description: Item actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Item actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/CartResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos inválidos o se requiere userId/sessionId
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Item no encontrado
 */
router.put(
  '/update',
  authenticateToken,
  generalLimiter,
  cartController.updateItem.bind(cartController)
);

/**
 * @swagger
 * /api/cart/remove/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remover item del carrito
 *     description: Elimina un item específico del carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: ID de sesión del carrito (alternativo a autenticación)
 *         required: false
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: ID de sesión alternativo como parámetro query
 *         required: false
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item a remover
 *     responses:
 *       200:
 *         description: Item removido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Item removido del carrito exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/CartResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Se requiere userId o sessionId
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Item no encontrado
 */
router.delete(
  '/remove/:itemId',
  authenticateToken,
  generalLimiter,
  cartController.removeItem.bind(cartController)
);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     tags: [Cart]
 *     summary: Limpiar carrito
 *     description: Elimina todos los items del carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: ID de sesión del carrito (alternativo a autenticación)
 *         required: false
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: ID de sesión alternativo como parámetro query
 *         required: false
 *     responses:
 *       200:
 *         description: Carrito limpiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Carrito limpiado exitosamente"
 *                 data:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Se requiere userId o sessionId
 *       401:
 *         description: No autorizado
 */
router.delete(
  '/clear',
  authenticateToken,
  generalLimiter,
  cartController.clearCart.bind(cartController)
);

/**
 * @swagger
 * /api/cart/apply-promo:
 *   post:
 *     tags: [Cart]
 *     summary: Aplicar código promocional
 *     description: Aplica un código promocional al carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: ID de sesión del carrito (alternativo a autenticación)
 *         required: false
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: ID de sesión alternativo como parámetro query
 *         required: false
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromoCodeRequest'
 *     responses:
 *       200:
 *         description: Código promocional aplicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Código promocional aplicado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/CartResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Código promocional inválido o se requiere userId/sessionId
 *       401:
 *         description: No autorizado
 */
router.post(
  '/apply-promo',
  authenticateToken,
  generalLimiter,
  cartController.applyPromoCode.bind(cartController)
);

/**
 * @swagger
 * /api/cart/calculate:
 *   get:
 *     tags: [Cart]
 *     summary: Calcular totales del carrito
 *     description: Recalcula los totales del carrito sin modificarlo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: ID de sesión del carrito (alternativo a autenticación)
 *         required: false
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: ID de sesión alternativo como parámetro query
 *         required: false
 *     responses:
 *       200:
 *         description: Cálculo completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cálculo completado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     subtotal:
 *                       type: number
 *                       example: 150.00
 *                     discountAmount:
 *                       type: number
 *                       example: 15.00
 *                     total:
 *                       type: number
 *                       example: 135.00
 *                     currency:
 *                       type: string
 *                       example: "GTQ"
 *                     appliedDiscounts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "promo"
 *                           description:
 *                             type: string
 *                             example: "Código promocional: DESCUENTO20"
 *                           amount:
 *                             type: number
 *                             example: 15.00
 *                           percentage:
 *                             type: number
 *                             example: 10
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Se requiere userId o sessionId
 *       401:
 *         description: No autorizado
 */
router.get(
  '/calculate',
  authenticateToken,
  generalLimiter,
  cartController.calculateCart.bind(cartController)
);

export default router;
