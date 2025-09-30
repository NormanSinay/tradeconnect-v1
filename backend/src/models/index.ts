/**
 * @fileoverview Inicialización de modelos Sequelize TypeScript
 * @version 1.0.0
 * @author TradeConnect Team
 */

// Importar la instancia de Sequelize
import sequelize from '../config/database';

// Importar todos los modelos
import { Permission } from './Permission';
import { Role } from './Role';
import { User } from './User';
import { RolePermission } from './RolePermission';
import { UserRole } from './UserRole';
import { Session } from './Session';
import { AuditLog } from './AuditLog';
import { TwoFactorAuth } from './TwoFactorAuth';

// Importar modelos de eventos
import { EventType } from './EventType';
import { EventCategory } from './EventCategory';
import { EventStatus } from './EventStatus';
import { Event } from './Event';
import { EventTemplate } from './EventTemplate';
import { EventDuplication } from './EventDuplication';
import { EventRegistration } from './EventRegistration';
import { EventMedia } from './EventMedia';

// Agregar modelos a la instancia de Sequelize
sequelize.addModels([
  Permission,
  Role,
  User,
  RolePermission,
  UserRole,
  Session,
  AuditLog,
  TwoFactorAuth,
  // Modelos de eventos
  EventType,
  EventCategory,
  EventStatus,
  Event,
  EventTemplate,
  EventDuplication,
  EventRegistration,
  EventMedia
]);

// Exportar modelos y sequelize
export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  UserRole,
  Session,
  AuditLog,
  TwoFactorAuth,
  // Modelos de eventos
  EventType,
  EventCategory,
  EventStatus,
  Event,
  EventTemplate,
  EventDuplication,
  EventRegistration,
  EventMedia
};

// Exportar por defecto
export default sequelize;