/**
 * @fileoverview Modelo de Validación de NIT para TradeConnect FEL
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para validaciones de NIT con SAT
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
 * Estados de validación de NIT
 */
export type NitValidationStatus =
  | 'valid'           // NIT válido y activo
  | 'invalid'         // NIT inválido
  | 'not_found'       // NIT no encontrado en SAT
  | 'inactive'        // NIT inactivo
  | 'error';          // Error en validación

/**
 * Atributos del modelo Validación de NIT
 */
export interface NitValidationAttributes {
  id?: number;
  nit: string;
  status: NitValidationStatus;
  name?: string;
  address?: string;
  activity?: string;
  taxRegime?: string;
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
 * Interface para creación de validación de NIT
 */
export interface NitValidationCreationAttributes extends Omit<NitValidationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     NitValidation:
 *       type: object
 *       required:
 *         - nit
 *         - status
 *         - lastValidationAt
 *         - expiresAt
 *         - validationSource
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la validación
 *           example: 1
 *         nit:
 *           type: string
 *           description: NIT validado
 *           example: "12345678-9"
 *         status:
 *           type: string
 *           enum: [valid, invalid, not_found, inactive, error]
 *           description: Estado de la validación
 *           example: "valid"
 *         name:
 *           type: string
 *           description: Nombre del contribuyente
 *           example: "Empresa S.A."
 *         address:
 *           type: string
 *           description: Dirección del contribuyente
 *           example: "Ciudad de Guatemala"
 *         activity:
 *           type: string
 *           description: Actividad económica
 *           example: "Servicios Profesionales"
 *         taxRegime:
 *           type: string
 *           description: Régimen tributario
 *           example: "General"
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
 *           description: Fuente de validación (SAT, etc.)
 *           example: "SAT"
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
  tableName: 'nit_validations',
  modelName: 'NitValidation',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['nit'],
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
export class NitValidation extends Model<NitValidationAttributes, NitValidationCreationAttributes> implements NitValidationAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El NIT es requerido'
    },
    len: {
      args: [8, 15],
      msg: 'El NIT debe tener entre 8 y 15 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(15),
    comment: 'NIT del contribuyente a validar'
  })
  declare nit: string;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['valid', 'invalid', 'not_found', 'inactive', 'error']],
      msg: 'Estado de validación inválido'
    }
  })
  @Column({
    type: DataType.ENUM('valid', 'invalid', 'not_found', 'inactive', 'error'),
    comment: 'Estado de la validación del NIT'
  })
  declare status: NitValidationStatus;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'El nombre no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre completo del contribuyente según SAT'
  })
  declare name?: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La dirección no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Dirección fiscal del contribuyente'
  })
  declare address?: string;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'La actividad no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Actividad económica principal'
  })
  declare activity?: string;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El régimen tributario no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Régimen tributario del contribuyente'
  })
  declare taxRegime?: string;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de la última validación con SAT'
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
    comment: 'Fuente del servicio de validación (SAT, etc.)'
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
  public async updateValidation(status: NitValidationStatus, data?: Partial<Pick<NitValidationAttributes, 'name' | 'address' | 'activity' | 'taxRegime' | 'errorMessage'>>): Promise<void> {
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
   * Serializa la validación de NIT para respuestas de API
   */
  public toNitValidationJSON(): object {
    return {
      id: this.id,
      nit: this.nit,
      status: this.status,
      name: this.name,
      address: this.address,
      activity: this.activity,
      taxRegime: this.taxRegime,
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
   * Busca validación de NIT por NIT
   */
  static async findByNit(nit: string): Promise<NitValidation | null> {
    return this.findOne({
      where: { nit }
    });
  }

  /**
   * Obtiene validación de NIT válida (no expirada)
   */
  static async getValidNit(nit: string): Promise<NitValidation | null> {
    return this.findOne({
      where: {
        nit,
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
  static async getExpiredValidations(): Promise<NitValidation[]> {
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