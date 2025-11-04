/**
 * @fileoverview Middleware de Autorización para Speakers en TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Middleware específico para control de acceso de speakers
 *
 * Archivo: backend/src/middleware/speakerAuth.ts
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS, PERMISSIONS, UserRole } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Middleware para verificar que el usuario tenga rol de speaker
 */
export const requireSpeakerRole = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Usuario no autenticado',
      error: 'UNAUTHENTICATED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  const userRoles = req.user.roles;
  const isSpeaker = userRoles.includes('speaker' as UserRole);

  if (!isSpeaker) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Se requiere rol de speaker para acceder a esta funcionalidad',
      error: 'SPEAKER_ROLE_REQUIRED',
      userRoles,
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

/**
 * Middleware para verificar permisos específicos de speaker
 */
export const requireSpeakerPermission = (...requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userPermissions = req.user.permissions;
    const hasRequiredPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission as any)
    );

    if (!hasRequiredPermission) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Permisos insuficientes para funcionalidad de speaker',
        error: 'INSUFFICIENT_SPEAKER_PERMISSION',
        requiredPermissions,
        userPermissions,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para acceso al dashboard de speaker
 */
export const speakerDashboardAccess = [
  requireSpeakerRole,
  requireSpeakerPermission(PERMISSIONS.CAN_ACCESS_SPEAKER_DASHBOARD)
];

/**
 * Middleware para gestión del perfil de speaker
 */
export const speakerProfileManagement = [
  requireSpeakerRole,
  requireSpeakerPermission(PERMISSIONS.CAN_MANAGE_SPEAKER_PROFILE)
];

/**
 * Middleware para ver eventos asignados
 */
export const speakerAssignedEvents = [
  requireSpeakerRole,
  requireSpeakerPermission(PERMISSIONS.CAN_VIEW_ASSIGNED_EVENTS)
];

/**
 * Middleware para gestionar materiales de speaker
 */
export const speakerMaterialsManagement = [
  requireSpeakerRole,
  requireSpeakerPermission(PERMISSIONS.CAN_MANAGE_SPEAKER_MATERIALS)
];

/**
 * Middleware para ver notificaciones de speaker
 */
export const speakerNotifications = [
  requireSpeakerRole,
  requireSpeakerPermission(PERMISSIONS.CAN_VIEW_SPEAKER_NOTIFICATIONS)
];

/**
 * Middleware para actualizar disponibilidad de speaker
 */
export const speakerAvailabilityUpdate = [
  requireSpeakerRole,
  requireSpeakerPermission(PERMISSIONS.CAN_UPDATE_SPEAKER_AVAILABILITY)
];

/**
 * Middleware para ver pagos de speaker
 */
export const speakerPaymentsView = [
  requireSpeakerRole,
  requireSpeakerPermission(PERMISSIONS.CAN_VIEW_SPEAKER_PAYMENTS)
];

/**
 * Middleware para gestionar evaluaciones de speaker
 */
export const speakerEvaluationsManagement = [
  requireSpeakerRole,
  requireSpeakerPermission(PERMISSIONS.CAN_MANAGE_SPEAKER_EVALUATIONS)
];

/**
 * Middleware compuesto para rutas generales de speaker
 */
export const speakerAuth = [
  requireSpeakerRole
];

/**
 * Middleware para verificar que el speaker sea el propietario del recurso
 * o tenga permisos administrativos
 */
export const requireSpeakerOwnershipOrAdmin = (speakerIdParam: string = 'speakerId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userId = req.user.id;
    const speakerId = req.params[speakerIdParam];

    // Si es el mismo speaker, permitir
    if (speakerId && userId.toString() === speakerId.toString()) {
      next();
      return;
    }

    // Si tiene permisos administrativos, permitir
    const userRoles = req.user.roles;
    const isAdmin = userRoles.some(role =>
      ['super_admin', 'admin', 'manager'].includes(role)
    );

    if (isAdmin) {
      next();
      return;
    }

    // Si es speaker y tiene permisos específicos, verificar
    const isSpeaker = userRoles.includes('speaker' as UserRole);
    if (isSpeaker) {
      // Speakers solo pueden acceder a sus propios recursos
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'No puedes acceder a recursos de otros speakers',
        error: 'SPEAKER_ACCESS_DENIED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso de speaker',
      error: 'ACCESS_DENIED',
      timestamp: new Date().toISOString()
    });
  };
};