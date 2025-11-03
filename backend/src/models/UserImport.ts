/**
 * @fileoverview Modelo de UserImport para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad UserImport con validaciones y métodos
 *
 * Archivo: backend/src/models/UserImport.ts
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
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { User } from './User';
import { Role } from './Role';
import { UserImportError } from './UserImportError';

/**
 * Estados posibles de una importación
 */
export type UserImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Tipos de importación disponibles
 */
export type UserImportType = 'create' | 'update' | 'create_update';

/**
 * Atributos del modelo UserImport
 */
export interface UserImportAttributes {
  id?: number;
  filename: string;
  originalFilename: string;
  filePath?: string;
  fileSize?: number;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  status: UserImportStatus;
  importType: UserImportType;
  skipDuplicates: boolean;
  sendWelcomeEmails: boolean;
  assignedRoleId?: number;
  createdBy: number;
  startedAt?: Date;
  completedAt?: Date;
  processingTimeMs?: number;
  errorMessage?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de user import
 */
export interface UserImportCreationAttributes extends Omit<UserImportAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserImport:
 *       type: object
 *       required:
 *         - filename
 *         - originalFilename
 *         - totalRows
 *         - status
 *         - importType
 *         - skipDuplicates
 *         - sendWelcomeEmails
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la importación
 *           example: 1
 *         filename:
 *           type: string
 *           description: Nombre del archivo importado
 *           example: "users_import_20251102.csv"
 *         originalFilename:
 *           type: string
 *           description: Nombre original del archivo
 *           example: "usuarios.csv"
 *         filePath:
 *           type: string
 *           description: Ruta del archivo en el servidor
 *         fileSize:
 *           type: integer
 *           description: Tamaño del archivo en bytes
 *           example: 1024
 *         totalRows:
 *           type: integer
 *           description: Total de filas en el archivo
 *           example: 100
 *         processedRows:
 *           type: integer
 *           description: Filas procesadas exitosamente
 *           example: 95
 *         failedRows:
 *           type: integer
 *           description: Filas con errores
 *           example: 5
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled]
 *           description: Estado del proceso de importación
 *         importType:
 *           type: string
 *           enum: [create, update, create_update]
 *           description: Tipo de importación
 *         skipDuplicates:
 *           type: boolean
 *           description: Si se deben omitir duplicados
 *         sendWelcomeEmails:
 *           type: boolean
 *           description: Si se deben enviar emails de bienvenida
 *         assignedRoleId:
 *           type: integer
 *           description: ID del rol a asignar
 *         createdBy:
 *           type: integer
 *           description: ID del usuario que realizó la importación
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio del procesamiento
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de finalización
 *         processingTimeMs:
 *           type: integer
 *           description: Tiempo de procesamiento en ms
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error general
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 */

@Table({
  tableName: 'user_imports',
  modelName: 'UserImport',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['assigned_role_id']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class UserImport extends Model<UserImportAttributes, UserImportCreationAttributes> implements UserImportAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre del archivo es requerido'
    },
    len: {
      args: [1, 255],
      msg: 'El nombre del archivo no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre del archivo importado'
  })
  declare filename: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre original del archivo es requerido'
    },
    len: {
      args: [1, 255],
      msg: 'El nombre original del archivo no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre original del archivo'
  })
  declare originalFilename: string;

  @Validate({
    isUrl: {
      msg: 'La ruta del archivo debe ser una URL válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Ruta del archivo en el servidor'
  })
  declare filePath?: string;

  @Validate({
    min: {
      args: [0],
      msg: 'El tamaño del archivo debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Tamaño del archivo en bytes'
  })
  declare fileSize?: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El total de filas debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Total de filas en el archivo'
  })
  declare totalRows: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'Las filas procesadas deben ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Filas procesadas exitosamente'
  })
  declare processedRows: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'Las filas fallidas deben ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Filas con errores'
  })
  declare failedRows: number;

  @AllowNull(false)
  @Default('pending')
  @Validate({
    isIn: {
      args: [['pending', 'processing', 'completed', 'failed', 'cancelled']],
      msg: 'El estado debe ser: pending, processing, completed, failed o cancelled'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
    comment: 'Estado del proceso de importación'
  })
  declare status: UserImportStatus;

  @AllowNull(false)
  @Default('create')
  @Validate({
    isIn: {
      args: [['create', 'update', 'create_update']],
      msg: 'El tipo de importación debe ser: create, update o create_update'
    }
  })
  @Column({
    type: DataType.ENUM('create', 'update', 'create_update'),
    comment: 'Tipo de importación: crear, actualizar o crear/actualizar'
  })
  declare importType: UserImportType;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se deben omitir duplicados'
  })
  declare skipDuplicates: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se deben enviar emails de bienvenida'
  })
  declare sendWelcomeEmails: boolean;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del rol a asignar a los usuarios importados'
  })
  declare assignedRoleId?: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que realizó la importación'
  })
  declare createdBy: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de inicio del procesamiento'
  })
  declare startedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de finalización del procesamiento'
  })
  declare completedAt?: Date;

  @Validate({
    min: {
      args: [0],
      msg: 'El tiempo de procesamiento debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Tiempo de procesamiento en milisegundos'
  })
  declare processingTimeMs?: number;

  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error general si falló la importación'
  })
  declare errorMessage?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales de la importación'
  })
  declare metadata?: any;

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

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => Role, 'assignedRoleId')
  declare assignedRole: Role;

  @HasMany(() => UserImportError)
  declare errors: UserImportError[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la importación está en progreso
   */
  public get isInProgress(): boolean {
    return this.status === 'processing';
  }

  /**
   * Verifica si la importación está completada
   */
  public get isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Verifica si la importación falló
   */
  public get isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * Calcula el porcentaje de progreso
   */
  public get progressPercentage(): number {
    if (this.totalRows === 0) return 0;
    return Math.round(((this.processedRows + this.failedRows) / this.totalRows) * 100);
  }

  /**
   * Obtiene el tiempo de procesamiento formateado
   */
  public get formattedProcessingTime(): string {
    if (!this.processingTimeMs) return 'N/A';

    const seconds = Math.floor(this.processingTimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  /**
   * Inicia el procesamiento de la importación
   */
  public async startProcessing(): Promise<void> {
    this.status = 'processing';
    this.startedAt = new Date();
    await this.save();
  }

  /**
   * Completa el procesamiento de la importación
   */
  public async completeProcessing(): Promise<void> {
    this.status = 'completed';
    this.completedAt = new Date();
    if (this.startedAt) {
      this.processingTimeMs = this.completedAt.getTime() - this.startedAt.getTime();
    }
    await this.save();
  }

  /**
   * Marca la importación como fallida
   */
  public async failProcessing(errorMessage?: string): Promise<void> {
    this.status = 'failed';
    this.completedAt = new Date();
    if (errorMessage) {
      this.errorMessage = errorMessage;
    }
    if (this.startedAt) {
      this.processingTimeMs = new Date().getTime() - this.startedAt.getTime();
    }
    await this.save();
  }

  /**
   * Cancela la importación
   */
  public async cancelProcessing(): Promise<void> {
    this.status = 'cancelled';
    this.completedAt = new Date();
    if (this.startedAt) {
      this.processingTimeMs = new Date().getTime() - this.startedAt.getTime();
    }
    await this.save();
  }

  /**
   * Incrementa el contador de filas procesadas
   */
  public async incrementProcessedRows(count: number = 1): Promise<void> {
    this.processedRows += count;
    await this.save();
  }

  /**
   * Incrementa el contador de filas fallidas
   */
  public async incrementFailedRows(count: number = 1): Promise<void> {
    this.failedRows += count;
    await this.save();
  }

  /**
   * Serializa para respuesta pública
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      filename: this.filename,
      originalFilename: this.originalFilename,
      fileSize: this.fileSize,
      totalRows: this.totalRows,
      processedRows: this.processedRows,
      failedRows: this.failedRows,
      status: this.status,
      importType: this.importType,
      skipDuplicates: this.skipDuplicates,
      sendWelcomeEmails: this.sendWelcomeEmails,
      assignedRoleId: this.assignedRoleId,
      createdBy: this.createdBy,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      processingTimeMs: this.processingTimeMs,
      progressPercentage: this.progressPercentage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Serializa para respuesta detallada
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      errorMessage: this.errorMessage,
      metadata: this.metadata
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca importaciones por estado
   */
  static async findByStatus(status: UserImportStatus): Promise<UserImport[]> {
    return this.findAll({
      where: { status },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca importaciones por usuario creador
   */
  static async findByCreator(userId: number): Promise<UserImport[]> {
    return this.findAll({
      where: { createdBy: userId },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca importaciones en progreso
   */
  static async findInProgress(): Promise<UserImport[]> {
    return this.findAll({
      where: { status: 'processing' },
      order: [['startedAt', 'ASC']]
    });
  }

  /**
   * Busca importaciones completadas en las últimas 24 horas
   */
  static async findCompletedLast24Hours(): Promise<UserImport[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return this.findAll({
      where: {
        status: 'completed',
        completedAt: {
          $gte: yesterday
        }
      },
      order: [['completedAt', 'DESC']]
    });
  }

  /**
   * Obtiene estadísticas de importaciones
   */
  static async getImportStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
    totalUsersImported: number;
  }> {
    const [results] = await this.sequelize!.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as in_progress,
        SUM(processed_rows) as total_users_imported
      FROM user_imports
      WHERE deleted_at IS NULL
    `) as [any[], any];

    const stats = results[0] as any;
    return {
      total: parseInt(stats.total) || 0,
      completed: parseInt(stats.completed) || 0,
      failed: parseInt(stats.failed) || 0,
      inProgress: parseInt(stats.in_progress) || 0,
      totalUsersImported: parseInt(stats.total_users_imported) || 0
    };
  }
}