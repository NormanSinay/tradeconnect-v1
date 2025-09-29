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

// Agregar modelos a la instancia de Sequelize
sequelize.addModels([
  Permission,
  Role,
  User,
  RolePermission,
  UserRole,
  Session,
  AuditLog,
  TwoFactorAuth
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
  TwoFactorAuth
};

// Exportar por defecto
export default sequelize;