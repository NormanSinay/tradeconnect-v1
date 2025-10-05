/**
 * @fileoverview Modelo de Validación de CUI para TradeConnect FEL
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para validaciones de CUI con RENAP
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';

/**
 * Estados de validación de CUI
 */
export type CuiValidationStatus =
  | 'valid'           // CUI válido
  | 'invalid'         // CUI inválido
  | 'not_found'       // CUI no encontrado en RENAP
  | 'deceased'        // Persona fallecida
  | 'error';          // Error en validación

/**
 * Atributos del modelo Validación de CUI
 */
export interface CuiValidationAttributes {
  id?: number;
  cui: string;
  status: CuiValidationStatus;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  gender?: string;
  nationality?: string;
  lastValidationAt: Date;
  expiresAt: Date;
  validationSource: string;
  errorMessage?: string;
  retryCount: number;
  lastRetryAt?: Date;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de validación de CUI
 */
export interface CuiValidationCreationAttributes extends Omit<CuiValidationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     CuiValidation:
 *       type: object
 *       required:
 *         - cui
 *         - status
 *         - lastValidationAt
 *         - expiresAt
 *         - validationSource
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la validación
 *           example: 1
 *         cui:
 *           type: string
 *           description: CUI validado
 *           example: "1234567890123"
 *         status:
 *           type: string
 *           enum: [valid, invalid, not_found, deceased, error]
 *           description: Estado de la validación
 *           example: "valid"
 *         firstName:
 *           type: string
 *           description: Primer nombre
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           description: Apellidos
 *           example: "Pérez García"
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento
 *         gender:
 *           type: string
 *           description: Género
 *           example: "M"
 *         nationality:
 *           type: string
 *           description: Nacionalidad
 *           example: "Guatemalteca"
 *         lastValidationAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última validación
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración del caché
 *         validationSource:
 *           type: string
 *           description: Fuente de validación (RENAP, etc.)
 *           example: "RENAP"
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error si falló
 *         retryCount:
 *           type: integer
 *           description: Número de reintentos
 *           example: 0
 *         lastRetryAt:
 *           type: string
 *           format: date-time
 *           description: Último reintento
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
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
  tableName: 'cui_validations',
  modelName: 'CuiValidation',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['cui'],
      where: { deleted_at: null }
    },
    {
      fields: ['status']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['last_validation_at']
    },
    {
      fields: ['validation_source']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class CuiValidation extends Model<CuiValidationAttributes, CuiValidationCreationAttributes> implements CuiValidationAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El CUI es requerido'
    },
    len: {
      args: [13, 13],
      msg: 'El CUI debe tener exactamente 13 dígitos'
    },
    isNumeric: {
      msg: 'El CUI debe contener solo números'
    }
  })
  @Column({
    type: DataType.STRING(13),
    comment: 'CUI del ciudadano a validar'
  })
  declare cui: string;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['valid', 'invalid', 'not_found', 'deceased', 'error']],
      msg: 'Estado de validación inválido'
    }
  })
  @Column({
    type: DataType.ENUM('valid', 'invalid', 'not_found', 'deceased', 'error'),
    comment: 'Estado de la validación del CUI'
  })
  declare status: CuiValidationStatus;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El primer nombre no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Primer nombre del ciudadano'
  })
  declare firstName?: string;

  @Validate({
    len: {
      args: [0, 150],
      msg: 'Los apellidos no pueden exceder 150 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(150),
    comment: 'Apellidos del ciudadano'
  })
  declare lastName?: string;

  @Column({
    type: DataType.DATEONLY,
    comment: 'Fecha de nacimiento del ciudadano'
  })
  declare birthDate?: Date;

  @Validate({
    len: {
      args: [0, 1],
      msg: 'El género debe ser M o F'
    },
    isIn: {
      args: [['M', 'F']],
      msg: 'El género debe ser M o F'
    }
  })
  @Column({
    type: DataType.CHAR(1),
    comment: 'Género del ciudadano (M/F)'
  })
  declare gender?: string;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'La nacionalidad no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Nacionalidad del ciudadano'
  })
  declare nationality?: string;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de la última validación con RENAP'
  })
  declare lastValidationAt: Date;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del caché de validación'
  })
  declare expiresAt: Date;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La fuente de validación es requerida'
    },
    len: {
      args: [2, 50],
      msg: 'La fuente de validación debe tener entre 2 y 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Fuente del servicio de validación (RENAP, etc.)'
  })
  declare validationSource: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'El mensaje de error no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error si la validación falló'
  })
  declare errorMessage?: string;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El contador de reintentos no puede ser negativo'
    },
    max: {
      args: [5],
      msg: 'No se permiten más de 5 reintentos'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de reintentos realizados'
  })
  declare retryCount: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha del último reintento'
  })
  declare lastRetryAt?: Date;

  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales de la validación'
  })
  declare metadata?: any;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación del registro'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de última actualización'
  })
  declare updatedAt: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)'
  })
  declare deletedAt?: Date;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la validación está expirada
   */
  public get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si la validación es válida
   */
  public get isValid(): boolean {
    return this.status === 'valid' && !this.isExpired;
  }

  /**
   * Calcula los días restantes hasta expiración
   */
  public get daysUntilExpiration(): number {
    const now = new Date().getTime();
    const expires = this.expiresAt.getTime();
    const diff = expires - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  /**
   * Obtiene el nombre completo
   */
  public get fullName(): string | null {
    if (!this.firstName && !this.lastName) return null;
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  /**
   * Incrementa el contador de reintentos
   */
  public async incrementRetryCount(): Promise<void> {
    this.retryCount += 1;
    this.lastRetryAt = new Date();
    await this.save();
  }

  /**
   * Actualiza la validación con nuevos datos
   */
  public async updateValidation(status: CuiValidationStatus, data?: Partial<Pick<CuiValidationAttributes, 'firstName' | 'lastName' | 'birthDate' | 'gender' | 'nationality' | 'errorMessage'>>): Promise<void> {
    this.status = status;
    this.lastValidationAt = new Date();

    if (data) {
      Object.assign(this, data);
    }

    // Establecer expiración (24 horas para válidos, 1 hora para otros)
    const hours = status === 'valid' ? 24 : 1;
    this.expiresAt = new Date(Date.now() + (hours * 60 * 60 * 1000));

    await this.save();
  }

  /**
   * Serializa la validación de CUI para respuestas de API
   */
  public toCuiValidationJSON(): object {
    return {
      id: this.id,
      cui: this.cui,
      status: this.status,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      birthDate: this.birthDate,
      gender: this.gender,
      nationality: this.nationality,
      lastValidationAt: this.lastValidationAt,
      expiresAt: this.expiresAt,
      validationSource: this.validationSource,
      errorMessage: this.errorMessage,
      retryCount: this.retryCount,
      daysUntilExpiration: this.daysUntilExpiration,
      isValid: this.isValid,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca validación de CUI por CUI
   */
  static async findByCui(cui: string): Promise<CuiValidation | null> {
    return this.findOne({
      where: { cui }
    });
  }

  /**
   * Obtiene validación de CUI válida (no expirada)
   */
  static async getValidCui(cui: string): Promise<CuiValidation | null> {
    return this.findOne({
      where: {
        cui,
        status: 'valid',
        expiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });
  }

  /**
   * Obtiene validaciones expiradas para limpieza
   */
  static async getExpiredValidations(): Promise<CuiValidation[]> {
    return this.findAll({
      where: {
        expiresAt: {
          [require('sequelize').Op.lt]: new Date()
        }
      }
    });
  }

  /**
   * Obtiene estadísticas de validaciones
   */
  static async getValidationStats() {
    const { Op } = require('sequelize');
    const validations = await this.findAll({
      attributes: [
        'status',
        'validationSource',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status', 'validationSource'],
      raw: true
    });

    return validations;
  }

  /**
   * Limpia validaciones expiradas
   */
  static async cleanExpiredValidations(): Promise<number> {
    return await this.destroy({
      where: {
        expiresAt: {
          [require('sequelize').Op.lt]: new Date()
        }
      }
    });
  }
}