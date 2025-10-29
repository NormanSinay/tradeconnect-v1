/**
 * @fileoverview Rutas de API para gestión de inscripciones
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas REST para el módulo de inscripciones
 *
 * Archivo: backend/src/routes/registrations.ts
 */

import { Router } from 'express';
import { registrationController } from '../controllers/registrationController';
import { authenticateToken } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiting';

const router = Router();

/**
 * @swagger
 * /api/registrations:
 *   post:
 *     tags: [Registrations]
 *     summary: Crear inscripción individual
 *     description: Crea una nueva inscripción individual a un evento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIndividualRegistrationRequest'
 *     responses:
 *       201:
 *         description: Inscripción creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 *       409:
 *         description: Conflicto (evento lleno, email duplicado, etc.)
 */
router.post(
  '/',
  authenticateToken,
  generalLimiter,
  registrationController.createIndividualRegistration.bind(registrationController)
);

/**
 * @swagger
 * /api/registrations:
 *   get:
 *     tags: [Registrations]
 *     summary: Listar inscripciones
 *     description: Obtiene una lista paginada de inscripciones con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de evento
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [BORRADOR, PENDIENTE_PAGO, PAGADO, CONFIRMADO, CANCELADO, EXPIRADO, REEMBOLSADO]
 *         description: Filtrar por estados
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre, apellido, email o código
 *     responses:
 *       200:
 *         description: Lista de inscripciones obtenida exitosamente
 *       401:
 *         description: No autorizado
 */
router.get(
  '/',
  authenticateToken,
  generalLimiter,
  registrationController.getRegistrations.bind(registrationController)
);

/**
 * @swagger
 * /api/registrations/{id}:
 *   get:
 *     tags: [Registrations]
 *     summary: Obtener inscripción por ID
 *     description: Obtiene los detalles de una inscripción específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 *     responses:
 *       200:
 *         description: Inscripción obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para ver esta inscripción
 *       404:
 *         description: Inscripción no encontrada
 */
router.get(
  '/:id',
  authenticateToken,
  generalLimiter,
  registrationController.getRegistrationById.bind(registrationController)
);

/**
 * @swagger
 * /api/registrations/{id}:
 *   put:
 *     tags: [Registrations]
 *     summary: Actualizar inscripción
 *     description: Actualiza los datos de una inscripción existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRegistrationRequest'
 *     responses:
 *       200:
 *         description: Inscripción actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para actualizar esta inscripción
 *       404:
 *         description: Inscripción no encontrada
 *       409:
 *         description: Estado no permite actualización
 */
router.put(
  '/:id',
  authenticateToken,
  generalLimiter,
  registrationController.updateRegistration.bind(registrationController)
);

/**
 * @swagger
 * /api/registrations/{id}/cancel:
 *   post:
 *     tags: [Registrations]
 *     summary: Cancelar inscripción
 *     description: Cancela una inscripción y procesa reembolso si aplica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón de la cancelación
 *                 example: "Cambio de planes"
 *     responses:
 *       200:
 *         description: Inscripción cancelada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para cancelar esta inscripción
 *       404:
 *         description: Inscripción no encontrada
 *       409:
 *         description: Estado no permite cancelación
 */
router.post(
  '/:id/cancel',
  authenticateToken,
  generalLimiter,
  registrationController.cancelRegistration.bind(registrationController)
);

/**
 * @swagger
 * /api/registrations/validate-affiliation:
 *   post:
 *     tags: [Registrations]
 *     summary: Validar datos de afiliación
 *     description: Valida NIT, CUI y otros datos fiscales guatemaltecos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nit:
 *                 type: string
 *                 description: NIT a validar
 *                 example: "12345678-9"
 *               cui:
 *                 type: string
 *                 description: CUI a validar
 *                 example: "1234567890123"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email a validar
 *                 example: "usuario@email.com"
 *               phone:
 *                 type: string
 *                 description: Teléfono a validar
 *                 example: "+502 5555-1234"
 *     responses:
 *       200:
 *         description: Validación completada
 *       401:
 *         description: No autorizado
 */
router.post(
  '/validate-affiliation',
  authenticateToken,
  generalLimiter,
  registrationController.validateAffiliation.bind(registrationController)
);

export default router;
