/**
 * @fileoverview Modelo de Permission para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para gestión de permisos del sistema
 *
 * Archivo: backend/src/models/Permission.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  HasMany,
  CreatedAt,
  UpdatedAt,
  Index,
  Unique,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { Permission as PermissionType } from '../utils/constants';
import { Role } from './Role';
import { RolePermission } from './RolePermission';

/**
 * Atributos del modelo Permission
 */
export interface PermissionAttributes {
  id?: number;
  name: PermissionType;
  displayName: string;
  description?: string;
  resource: string;
  action: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de permiso
 */
export interface PermissionCreationAttributes extends Omit<PermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *         - resource
 *         - action
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del permiso
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre técnico del permiso
 *           enum: [create_user, read_user, update_user, delete_user, ...]
 *           example: create_user
 *         displayName:
 *           type: string
 *           description: Nombre visible del permiso
 *           example: Crear Usuario
 *         description:
 *           type: string
 *           description: Descripción detallada del permiso
 *           example: Permite crear nuevos usuarios en el sistema
 *         resource:
 *           type: string
 *           description: Recurso al que aplica el permiso
 *           example: user
 *         action:
 *           type: string
 *           description: Acción permitida sobre el recurso
 *           example: create
 *         isActive:
 *           type: boolean
 *           description: Si el permiso está activo
 *           default: true
 *         isSystem:
 *           type: boolean
 *           description: Si es un permiso del sistema (no eliminable)
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 */

@Table({
  tableName: 'permissions',
  modelName: 'Permission',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['resource', 'action']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_system']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre del permiso es requerido'
    },
    isIn: {
      args: [Object.values(require('../utils/constants').PERMISSIONS)],
      msg: 'El nombre del permiso debe ser uno de los valores permitidos'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre técnico del permiso'
  })
  declare name: PermissionType;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre visible es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre visible debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre visible del permiso'
  })
  declare displayName: string;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'La descripción no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Descripción detallada del permiso'
  })
  declare description?: string;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El recurso es requerido'
    },
    len: {
      args: [2, 50],
      msg: 'El recurso debe tener entre 2 y 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Recurso al que aplica el permiso (user, event, payment, etc.)'
  })
  declare resource: string;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'La acción es requerida'
    },
    len: {
      args: [2, 50],
      msg: 'La acción debe tener entre 2 y 50 caracteres'
    },
    isIn: {
      args: [['create', 'read', 'update', 'delete', 'manage', 'view', 'process', 'generate', 'validate', 'verify', 'send', 'export', 'execute']],
      msg: 'La acción debe ser uno de los valores permitidos'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Acción permitida sobre el recurso (create, read, update, delete, etc.)'
  })
  declare action: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el permiso está activo'
  })
  declare isActive: boolean;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es un permiso del sistema (no eliminable)'
  })
  declare isSystem: boolean;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de actualización'
  })
  declare updatedAt: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsToMany(() => Role, () => RolePermission)
  declare roles: Role[];

  @HasMany(() => RolePermission)
  declare rolePermissions: RolePermission[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el permiso puede ser eliminado
   */
  public get canBeDeleted(): boolean {
    return !this.isSystem;
  }

  /**
   * Obtiene la representación completa del permiso
   */
  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      resource: this.resource,
      action: this.action,
      isActive: this.isActive,
      isSystem: this.isSystem,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Obtiene el código completo del permiso (resource:action)
   */
  public get fullCode(): string {
    return `${this.resource}:${this.action}`;
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca permiso por nombre
   */
  static async findByName(name: PermissionType): Promise<Permission | null> {
    return this.findOne({
      where: { name },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });
  }

  /**
   * Busca permisos por recurso
   */
  static async findByResource(resource: string): Promise<Permission[]> {
    return this.findAll({
      where: { resource, isActive: true },
      order: [['action', 'ASC']]
    });
  }

  /**
   * Busca permisos por acción
   */
  static async findByAction(action: string): Promise<Permission[]> {
    return this.findAll({
      where: { action, isActive: true },
      order: [['resource', 'ASC']]
    });
  }

  /**
   * Obtiene todos los permisos activos
   */
  static async getActivePermissions(): Promise<Permission[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });
  }

  /**
   * Obtiene todos los permisos del sistema
   */
  static async getSystemPermissions(): Promise<Permission[]> {
    return this.findAll({
      where: { isSystem: true },
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });
  }

  /**
   * Verifica si un nombre de permiso ya existe
   */
  static async isNameTaken(name: string, excludePermissionId?: number): Promise<boolean> {
    const where: any = { name };

    if (excludePermissionId) {
      where.id = { $ne: excludePermissionId };
    }

    const permission = await this.findOne({ where });
    return !!permission;
  }

  /**
   * Crea permisos del sistema si no existen
   */
  static async seedSystemPermissions(): Promise<void> {
    const { PERMISSIONS } = require('../utils/constants');

    // Mapeo de permisos a recursos y acciones
    const permissionMappings = {
      // Usuarios
      create_user: { resource: 'user', action: 'create' },
      read_user: { resource: 'user', action: 'read' },
      update_user: { resource: 'user', action: 'update' },
      delete_user: { resource: 'user', action: 'delete' },
      manage_user_roles: { resource: 'user', action: 'manage' },
      view_user_audit: { resource: 'user', action: 'view' },

      // Eventos
      create_event: { resource: 'event', action: 'create' },
      read_event: { resource: 'event', action: 'read' },
      update_event: { resource: 'event', action: 'update' },
      delete_event: { resource: 'event', action: 'delete' },
      publish_event: { resource: 'event', action: 'publish' },
      manage_event_capacity: { resource: 'event', action: 'manage' },
      duplicate_event: { resource: 'event', action: 'duplicate' },

      // Speakers
      create_speaker: { resource: 'speaker', action: 'create' },
      read_speaker: { resource: 'speaker', action: 'read' },
      update_speaker: { resource: 'speaker', action: 'update' },
      delete_speaker: { resource: 'speaker', action: 'delete' },
      manage_speaker_contracts: { resource: 'speaker', action: 'manage' },

      // Inscripciones
      create_registration: { resource: 'registration', action: 'create' },
      read_registration: { resource: 'registration', action: 'read' },
      update_registration: { resource: 'registration', action: 'update' },
      delete_registration: { resource: 'registration', action: 'delete' },
      manage_group_registration: { resource: 'registration', action: 'manage' },

      // Pagos
      process_payment: { resource: 'payment', action: 'process' },
      refund_payment: { resource: 'payment', action: 'refund' },
      view_payments: { resource: 'payment', action: 'view' },
      manage_payment_methods: { resource: 'payment', action: 'manage' },
      view_financial_reports: { resource: 'payment', action: 'view' },

      // FEL
      generate_invoice: { resource: 'invoice', action: 'generate' },
      cancel_invoice: { resource: 'invoice', action: 'cancel' },
      view_invoices: { resource: 'invoice', action: 'view' },
      manage_fel_config: { resource: 'fel', action: 'manage' },
      retry_fel_operations: { resource: 'fel', action: 'retry' },

      // Promociones
      create_promotion: { resource: 'promotion', action: 'create' },
      read_promotion: { resource: 'promotion', action: 'read' },
      update_promotion: { resource: 'promotion', action: 'update' },
      delete_promotion: { resource: 'promotion', action: 'delete' },
      apply_discount: { resource: 'promotion', action: 'apply' },

      // QR Codes
      generate_qr: { resource: 'qr', action: 'generate' },
      validate_qr: { resource: 'qr', action: 'validate' },
      manage_access_control: { resource: 'access', action: 'manage' },
      view_attendance: { resource: 'attendance', action: 'view' },

      // Certificados
      generate_certificate: { resource: 'certificate', action: 'generate' },
      view_certificate: { resource: 'certificate', action: 'view' },
      manage_certificate_templates: { resource: 'certificate', action: 'manage' },
      verify_certificate: { resource: 'certificate', action: 'verify' },

      // Notificaciones
      send_notification: { resource: 'notification', action: 'send' },
      manage_email_templates: { resource: 'notification', action: 'manage' },
      view_notification_logs: { resource: 'notification', action: 'view' },

      // Reportes
      view_reports: { resource: 'report', action: 'view' },
      export_reports: { resource: 'report', action: 'export' },
      view_analytics: { resource: 'analytics', action: 'view' },
      manage_dashboards: { resource: 'dashboard', action: 'manage' },

      // Sistema
      manage_system_config: { resource: 'system', action: 'manage' },
      view_audit_logs: { resource: 'audit', action: 'view' },
      manage_integrations: { resource: 'integration', action: 'manage' },

      // Workflows
      create_workflow: { resource: 'workflow', action: 'create' },
      execute_workflow: { resource: 'workflow', action: 'execute' },
      view_workflow_history: { resource: 'workflow', action: 'view' }
    };

    for (const [permissionName, mapping] of Object.entries(permissionMappings)) {
      const existingPermission = await this.findByName(permissionName as PermissionType);
      if (!existingPermission) {
        const displayName = permissionName
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        await this.create({
          name: permissionName as PermissionType,
          displayName,
          description: `Permite ${mapping.action} sobre ${mapping.resource}`,
          resource: mapping.resource,
          action: mapping.action,
          isActive: true,
          isSystem: true
        });
      }
    }
  }

  /**
   * Obtiene estadísticas de permisos
   */
  static async getPermissionStats(): Promise<any> {
    const stats = await this.findAll({
      attributes: [
        'resource',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['resource'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']],
      raw: true
    });

    return stats;
  }
}