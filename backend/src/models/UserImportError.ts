/**
 * @fileoverview Modelo de UserImportError para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad UserImportError con validaciones y métodos
 *
 * Archivo: backend/src/models/UserImportError.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  Index,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { UserImport } from './UserImport';
import { User } from './User';

/**
 * Tipos de errores posibles en la importación
 */
export type UserImportErrorType =
  | 'validation_error'
  | 'duplicate_email'
  | 'duplicate_nit'
  | 'duplicate_cui'
  | 'invalid_format'
  | 'missing_required_field'
  | 'database_error'
  | 'unknown_error';

/**
 * Atributos del modelo UserImportError
 */
export interface UserImportErrorAttributes {
  id?: number;
  userImportId: number;
  rowNumber: number;
  rawData: any;
  errorType: UserImportErrorType;
  errorMessage: string;
  fieldName?: string;
  fieldValue?: string;
  suggestedFix?: string;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de user import error
 */
export interface UserImportErrorCreationAttributes extends Omit<UserImportErrorAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserImportError:
 *       type: object
 *       required:
 *         - userImportId
 *         - rowNumber
 *         - rawData
 *         - errorType
 *         - errorMessage
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del error
 *           example: 1
 *         userImportId:
 *           type: integer
 *           description: ID de la importación relacionada
 *           example: 1
 *         rowNumber:
 *           type: integer
 *           description: Número de fila en el archivo original
 *           example: 5
 *         rawData:
 *           type: object
 *           description: Datos crudos de la fila que falló
 *         errorType:
 *           type: string
 *           enum: [validation_error, duplicate_email, duplicate_nit, duplicate_cui, invalid_format, missing_required_field, database_error, unknown_error]
 *           description: Tipo de error encontrado
 *         errorMessage:
 *           type: string
 *           description: Mensaje descriptivo del error
 *           example: "El email ya está registrado"
 *         fieldName:
 *           type: string
 *           description: Nombre del campo que causó el error
 *           example: "email"
 *         fieldValue:
 *           type: string
 *           description: Valor del campo que causó el error
 *           example: "usuario@ejemplo.com"
 *         suggestedFix:
 *           type: string
 *           description: Sugerencia para corregir el error
 *           example: "Use un email diferente o actualice el registro existente"
 *         isResolved:
 *           type: boolean
 *           description: Si el error ha sido resuelto
 *           default: false
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se resolvió el error
 *         resolvedBy:
 *           type: integer
 *           description: ID del usuario que resolvió el error
 */

@Table({
  tableName: 'user_import_errors',
  modelName: 'UserImportError',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_import_id']
    },
    {
      fields: ['error_type']
    },
    {
      fields: ['is_resolved']
    },
    {
      fields: ['resolved_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class UserImportError extends Model<UserImportErrorAttributes, UserImportErrorCreationAttributes> implements UserImportErrorAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => UserImport)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la importación relacionada'
  })
  declare userImportId: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [1],
      msg: 'El número de fila debe ser mayor o igual a 1'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de fila en el archivo original (1-based)'
  })
  declare rowNumber: number;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Datos crudos de la fila que falló'
  })
  declare rawData: any;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['validation_error', 'duplicate_email', 'duplicate_nit', 'duplicate_cui', 'invalid_format', 'missing_required_field', 'database_error', 'unknown_error']],
      msg: 'El tipo de error debe ser válido'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('validation_error', 'duplicate_email', 'duplicate_nit', 'duplicate_cui', 'invalid_format', 'missing_required_field', 'database_error', 'unknown_error'),
    comment: 'Tipo de error encontrado'
  })
  declare errorType: UserImportErrorType;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El mensaje de error es requerido'
    },
    len: {
      args: [1, 1000],
      msg: 'El mensaje de error no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje descriptivo del error'
  })
  declare errorMessage: string;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El nombre del campo no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del campo que causó el error (si aplica)'
  })
  declare fieldName?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Valor del campo que causó el error (si aplica)'
  })
  declare fieldValue?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Sugerencia para corregir el error'
  })
  declare suggestedFix?: string;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el error ha sido resuelto'
  })
  declare isResolved: boolean;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se resolvió el error'
  })
  declare resolvedAt?: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que resolvió el error'
  })
  declare resolvedBy?: number;

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

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)'
  })
  declare deletedAt?: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => UserImport, 'userImportId')
  declare userImport: UserImport;

  @BelongsTo(() => User, 'resolvedBy')
  declare resolver: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Marca el error como resuelto
   */
  public async markAsResolved(resolverId?: number): Promise<void> {
    this.isResolved = true;
    this.resolvedAt = new Date();
    if (resolverId) {
      this.resolvedBy = resolverId;
    }
    await this.save();
  }

  /**
   * Obtiene una descripción legible del tipo de error
   */
  public get errorTypeDescription(): string {
    const descriptions = {
      validation_error: 'Error de validación',
      duplicate_email: 'Email duplicado',
      duplicate_nit: 'NIT duplicado',
      duplicate_cui: 'CUI duplicado',
      invalid_format: 'Formato inválido',
      missing_required_field: 'Campo requerido faltante',
      database_error: 'Error de base de datos',
      unknown_error: 'Error desconocido'
    };
    return descriptions[this.errorType] || 'Error desconocido';
  }

  /**
   * Verifica si el error puede ser corregido automáticamente
   */
  public get isAutoFixable(): boolean {
    return ['duplicate_email', 'duplicate_nit', 'duplicate_cui'].includes(this.errorType);
  }

  /**
   * Serializa para respuesta pública
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      userImportId: this.userImportId,
      rowNumber: this.rowNumber,
      errorType: this.errorType,
      errorTypeDescription: this.errorTypeDescription,
      errorMessage: this.errorMessage,
      fieldName: this.fieldName,
      fieldValue: this.fieldValue,
      suggestedFix: this.suggestedFix,
      isResolved: this.isResolved,
      resolvedAt: this.resolvedAt,
      resolvedBy: this.resolvedBy,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa para respuesta detallada (incluye datos crudos)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      rawData: this.rawData
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca errores por importación
   */
  static async findByUserImport(userImportId: number): Promise<UserImportError[]> {
    return this.findAll({
      where: { userImportId },
      order: [['rowNumber', 'ASC']]
    });
  }

  /**
   * Busca errores por tipo
   */
  static async findByErrorType(errorType: UserImportErrorType): Promise<UserImportError[]> {
    return this.findAll({
      where: { errorType },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca errores no resueltos
   */
  static async findUnresolved(): Promise<UserImportError[]> {
    return this.findAll({
      where: { isResolved: false },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca errores no resueltos por importación
   */
  static async findUnresolvedByUserImport(userImportId: number): Promise<UserImportError[]> {
    return this.findAll({
      where: {
        userImportId,
        isResolved: false
      },
      order: [['rowNumber', 'ASC']]
    });
  }

  /**
   * Cuenta errores por tipo para una importación
   */
  static async countErrorsByType(userImportId: number): Promise<Record<UserImportErrorType, number>> {
    const errors = await this.findAll({
      where: { userImportId },
      attributes: ['errorType']
    });

    const counts: Record<UserImportErrorType, number> = {
      validation_error: 0,
      duplicate_email: 0,
      duplicate_nit: 0,
      duplicate_cui: 0,
      invalid_format: 0,
      missing_required_field: 0,
      database_error: 0,
      unknown_error: 0
    };

    errors.forEach(error => {
      counts[error.errorType]++;
    });

    return counts;
  }

  /**
   * Crea múltiples errores de una vez
   */
  static async bulkCreateErrors(
    userImportId: number,
    errors: Array<Omit<UserImportErrorCreationAttributes, 'userImportId'>>
  ): Promise<UserImportError[]> {
    const errorsWithImportId = errors.map(error => ({
      ...error,
      userImportId
    }));

    return this.bulkCreate(errorsWithImportId);
  }
}