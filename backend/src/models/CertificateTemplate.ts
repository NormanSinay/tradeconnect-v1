/**
 * @fileoverview Modelo de Template de Certificado para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad CertificateTemplate con validaciones y métodos
 *
 * Archivo: backend/src/models/CertificateTemplate.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './User';
import { Certificate } from './Certificate';
import {
  CertificateTemplateAttributes,
  CertificateTemplateConfiguration,
} from '../types/certificate.types';

/**
 * Interface para creación de template de certificado
 */
export interface CertificateTemplateCreationAttributes
  extends Omit<
    CertificateTemplateAttributes,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
  > {}

/**
 * @swagger
 * components:
 *   schemas:
 *     CertificateTemplate:
 *       type: object
 *       required:
 *         - name
 *         - eventTypes
 *         - htmlTemplate
 *         - requiredVariables
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del template
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         name:
 *           type: string
 *           description: Nombre del template
 *           example: "Certificado Estándar de Asistencia"
 *         eventTypes:
 *           type: array
 *           items:
 *             type: string
 *           description: Tipos de evento para los que aplica
 *           example: ["conference", "workshop"]
 *         active:
 *           type: boolean
 *           description: Si el template está activo
 *           default: true
 *         version:
 *           type: string
 *           description: Versión del template
 *           default: "1.0.0"
 *         htmlTemplate:
 *           type: text
 *           description: Template HTML del certificado
 *         cssStyles:
 *           type: text
 *           description: Estilos CSS del template
 *         requiredVariables:
 *           type: array
 *           items:
 *             type: string
 *           description: Variables requeridas en el template
 *         configuration:
 *           type: object
 *           description: Configuración adicional del template
 *         logoUrl:
 *           type: string
 *           description: URL del logo institucional
 *         signatureUrl:
 *           type: string
 *           description: URL de la firma digital
 *         backgroundColor:
 *           type: string
 *           description: Color de fondo
 *           default: "#FFFFFF"
 *         textColor:
 *           type: string
 *           description: Color del texto
 *           default: "#000000"
 *         borderColor:
 *           type: string
 *           description: Color del borde
 *           default: "#000000"
 *         createdBy:
 *           type: integer
 *           description: Usuario que creó el template
 *         updatedBy:
 *           type: integer
 *           description: Usuario que actualizó el template
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
  tableName: 'certificate_templates',
  modelName: 'CertificateTemplate',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['active'],
    },
    {
      fields: ['event_types'],
      using: 'GIN',
    },
    {
      fields: ['created_by'],
    },
    {
      fields: ['name'],
      unique: false,
    },
  ],
})
export class CertificateTemplate
  extends Model<
    CertificateTemplateAttributes,
    CertificateTemplateCreationAttributes
  >
  implements CertificateTemplateAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    comment: 'ID único del template de certificado',
  })
  declare id: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre del template es requerido',
    },
    len: {
      args: [1, 255],
      msg: 'El nombre debe tener entre 1 y 255 caracteres',
    },
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre del template',
  })
  declare name: string;

  @AllowNull(false)
  @Default([])
  @Column({
    type: DataType.JSON,
    comment: 'Tipos de evento para los que aplica este template',
  })
  declare eventTypes: string[];

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el template está activo',
  })
  declare active: boolean;

  @AllowNull(false)
  @Default('1.0.0')
  @Validate({
    is: {
      args: /^\d+\.\d+\.\d+$/,
      msg: 'La versión debe tener formato semántico (ej: 1.0.0)',
    },
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Versión del template',
  })
  declare version: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El template HTML es requerido',
    },
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Template HTML del certificado',
  })
  declare htmlTemplate: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Estilos CSS del template',
  })
  declare cssStyles?: string;

  @AllowNull(false)
  @Default([])
  @Column({
    type: DataType.JSON,
    comment: 'Variables requeridas en el template',
  })
  declare requiredVariables: string[];

  @Column({
    type: DataType.JSON,
    comment: 'Configuración adicional (orientación, márgenes, etc.)',
  })
  declare configuration?: CertificateTemplateConfiguration;

  @Validate({
    isUrl: {
      msg: 'La URL del logo debe ser válida',
    },
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'URL del logo institucional',
  })
  declare logoUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de la firma debe ser válida',
    },
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'URL de la firma digital',
  })
  declare signatureUrl?: string;

  @AllowNull(false)
  @Default('#FFFFFF')
  @Validate({
    is: {
      args: /^#[0-9A-Fa-f]{6}$/,
      msg: 'El color de fondo debe ser un código hexadecimal válido',
    },
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color de fondo del certificado',
  })
  declare backgroundColor: string;

  @AllowNull(false)
  @Default('#000000')
  @Validate({
    is: {
      args: /^#[0-9A-Fa-f]{6}$/,
      msg: 'El color del texto debe ser un código hexadecimal válido',
    },
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color del texto',
  })
  declare textColor: string;

  @AllowNull(false)
  @Default('#000000')
  @Validate({
    is: {
      args: /^#[0-9A-Fa-f]{6}$/,
      msg: 'El color del borde debe ser un código hexadecimal válido',
    },
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color del borde',
  })
  declare borderColor: string;

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el template',
  })
  declare createdBy?: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó el template',
  })
  declare updatedBy?: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación',
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de actualización',
  })
  declare updatedAt: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)',
  })
  declare deletedAt?: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => User, {
    foreignKey: 'createdBy',
    as: 'creator',
  })
  declare creator?: User;

  @BelongsTo(() => User, {
    foreignKey: 'updatedBy',
    as: 'updater',
  })
  declare updater?: User;

  @HasMany(() => Certificate, {
    foreignKey: 'templateId',
    as: 'certificates',
  })
  declare certificates?: Certificate[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el template está activo
   */
  public get isActive(): boolean {
    return this.active && !this.deletedAt;
  }

  /**
   * Verifica si el template aplica a un tipo de evento específico
   */
  public appliesToEventType(eventType: string): boolean {
    return this.eventTypes.includes(eventType) || this.eventTypes.includes('*');
  }

  /**
   * Valida que el template tenga todas las variables requeridas
   */
  public validateRequiredVariables(availableVariables: string[]): {
    isValid: boolean;
    missing: string[];
  } {
    const missing = this.requiredVariables.filter(
      variable => !availableVariables.includes(variable)
    );
    return {
      isValid: missing.length === 0,
      missing,
    };
  }

  /**
   * Obtiene la configuración completa del template
   */
  public getFullConfiguration(): CertificateTemplateConfiguration {
    return {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
      ...this.configuration,
    };
  }

  /**
   * Serializa el template para respuestas de API
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      name: this.name,
      eventTypes: this.eventTypes,
      active: this.active,
      version: this.version,
      requiredVariables: this.requiredVariables,
      configuration: this.getFullConfiguration(),
      logoUrl: this.logoUrl,
      signatureUrl: this.signatureUrl,
      backgroundColor: this.backgroundColor,
      textColor: this.textColor,
      borderColor: this.borderColor,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Serializa con datos completos para edición
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      htmlTemplate: this.htmlTemplate,
      cssStyles: this.cssStyles,
      creator: this.creator?.toPublicJSON(),
      updater: this.updater?.toPublicJSON(),
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca templates activos para un tipo de evento
   */
  static async findActiveForEventType(
    eventType: string
  ): Promise<CertificateTemplate[]> {
    return this.findAll({
      where: {
        active: true,
        eventTypes: {
          [require('sequelize').Op.contains]: [eventType],
        },
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Busca el template por defecto para un tipo de evento
   */
  static async findDefaultForEventType(
    eventType: string
  ): Promise<CertificateTemplate | null> {
    const templates = await this.findActiveForEventType(eventType);
    return templates.length > 0 ? templates[0] : null;
  }

  /**
   * Valida formato de color hexadecimal
   */
  static validateHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  /**
   * Crea un template por defecto
   */
  static async createDefaultTemplate(): Promise<CertificateTemplate> {
    const defaultHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 40px 0; color: #333;">
  <div style="max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; text-align: center; padding: 50px 40px;">
    
    <div style="background: linear-gradient(90deg, #007BFF, #00C6FF); color: white; padding: 15px 30px; border-radius: 10px 10px 0 0;">
      <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px;">CERTIFICADO DE ASISTENCIA</h1>
    </div>

    <div style="padding: 30px;">
      <p style="font-size: 18px; margin: 25px 0;">Se certifica que</p>

      <h2 style="color: #0066cc; font-size: 24px; margin: 20px 0; font-weight: bold;">
        {{participante.nombre_completo}}
      </h2>

      <p style="font-size: 16px; margin: 20px 0;">ha participado en el evento</p>

      <h3 style="color: #333; font-size: 22px; margin: 20px 0; font-weight: 600;">
        {{evento.nombre}}
      </h3>

      <p style="font-size: 15px; margin: 15px 0; color: #555;">
        Realizado del <strong>{{evento.fecha_inicio}}</strong> al <strong>{{evento.fecha_fin}}</strong>
      </p>

      <p style="font-size: 15px; margin: 10px 0; color: #555;">
        Con una duración de <strong>{{evento.duracion_horas}}</strong> horas
      </p>

      <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">

      <div style="font-size: 13px; color: #666; line-height: 1.5;">
        <p>Número de certificado: <strong>{{certificado.numero}}</strong></p>
        <p>Fecha de emisión: <strong>{{certificado.fecha_emision}}</strong></p>
      </div>
    </div>

    <div style="background: #f1f1f1; text-align: center; padding: 12px; font-size: 12px; color: #777; border-radius: 0 0 10px 10px;">
      © {{currentYear}} TradeConnect. Todos los derechos reservados.
    </div>

  </div>
</div>

    `;

    return this.create({
      name: 'Certificado Estándar',
      eventTypes: ['conference', 'workshop', 'seminar'],
      active: true,
      version: '1.0.0',
      htmlTemplate: defaultHtml,
      requiredVariables: [
        'participante.nombre_completo',
        'evento.nombre',
        'evento.fecha_inicio',
        'evento.fecha_fin',
        'evento.duracion_horas',
        'certificado.numero',
        'certificado.fecha_emision',
      ],
      configuration: {
        orientation: 'landscape',
        pageSize: 'A4',
        margins: { top: 20, bottom: 20, left: 20, right: 20 },
      },
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      borderColor: '#000000',
    });
  }
}
