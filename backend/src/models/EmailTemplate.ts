/**
 * @fileoverview Modelo de Plantilla de Email para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para plantillas HTML de emails
 *
 * Archivo: backend/src/models/EmailTemplate.ts
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
  Default,
  Unique,
  Validate,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript';
import {
  EmailTemplateAttributes,
  EmailTemplateCreationAttributes,
  EmailTemplateType
} from '../types/notification.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailTemplate:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - subject
 *         - htmlContent
 *         - type
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la plantilla
 *           example: 1
 *         code:
 *           type: string
 *           description: Código único identificador
 *           example: "INSCRIPCION_CONFIRMADA"
 *         name:
 *           type: string
 *           description: Nombre descriptivo
 *           example: "Confirmación de Inscripción"
 *         subject:
 *           type: string
 *           description: Asunto del email
 *           example: "¡Bienvenido! Tu inscripción ha sido confirmada"
 *         htmlContent:
 *           type: string
 *           description: Contenido HTML de la plantilla
 *         textContent:
 *           type: string
 *           description: Versión texto plano
 *         variables:
 *           type: object
 *           description: Variables disponibles en la plantilla
 *         type:
 *           type: string
 *           enum: [TRANSACTIONAL, PROMOTIONAL, OPERATIONAL]
 *           description: Tipo de plantilla
 *         active:
 *           type: boolean
 *           description: Si la plantilla está activa
 *           default: true
 *         version:
 *           type: integer
 *           description: Versión de la plantilla
 *           default: 1
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *         updatedBy:
 *           type: integer
 *           description: ID del usuario que actualizó
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
  tableName: 'email_templates',
  modelName: 'EmailTemplate',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['code'],
      where: { deleted_at: null },
      name: 'idx_email_templates_code_unique'
    },
    {
      fields: ['type'],
      name: 'idx_email_templates_type'
    },
    {
      fields: ['active'],
      name: 'idx_email_templates_active'
    },
    {
      fields: ['created_at'],
      name: 'idx_email_templates_created_at'
    },
    {
      fields: ['code', 'active'],
      name: 'idx_email_templates_code_active'
    }
  ]
})
export class EmailTemplate extends Model<EmailTemplateAttributes, EmailTemplateCreationAttributes> implements EmailTemplateAttributes {
  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El código de la plantilla es requerido'
    },
    len: {
      args: [3, 100],
      msg: 'El código debe tener entre 3 y 100 caracteres'
    },
    is: {
      args: /^[A-Z_]+$/,
      msg: 'El código solo puede contener letras mayúsculas y guiones bajos'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Código único identificador de la plantilla'
  })
  declare code: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la plantilla es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre descriptivo de la plantilla'
  })
  declare name: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El asunto del email es requerido'
    },
    len: {
      args: [1, 200],
      msg: 'El asunto debe tener máximo 200 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(200),
    comment: 'Asunto del email con soporte para variables'
  })
  declare subject: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El contenido HTML es requerido'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Contenido HTML de la plantilla'
  })
  declare htmlContent: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Versión texto plano del email (fallback)'
  })
  declare textContent?: string;

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Variables disponibles en la plantilla con sus validaciones'
  })
  declare variables: Record<string, any>;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(EmailTemplateType)),
    comment: 'Tipo de plantilla (transaccional, promocional, operacional)'
  })
  declare type: EmailTemplateType;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la plantilla está activa'
  })
  declare active: boolean;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    comment: 'Versión de la plantilla (autoincremental)'
  })
  declare version: number;

  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que creó la plantilla'
  })
  declare createdBy?: number;

  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que actualizó la plantilla'
  })
  declare updatedBy?: number;

  @CreatedAt
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
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateTemplate(template: EmailTemplate): Promise<void> {
    // Validar que el código esté en mayúsculas
    if (template.code) {
      template.code = template.code.toUpperCase();
    }

    // Validar sintaxis HTML básica
    if (template.htmlContent) {
      await template.validateHtmlContent();
    }

    // Validar variables en el contenido
    if (template.htmlContent && template.variables) {
      await template.validateVariables();
    }
  }

  @BeforeUpdate
  static async incrementVersion(template: EmailTemplate): Promise<void> {
    // Incrementar versión al actualizar
    if (template.changed()) {
      template.version += 1;
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Valida la sintaxis HTML del contenido
   */
  private async validateHtmlContent(): Promise<void> {
    // Validación básica de HTML (se puede extender con librerías como cheerio)
    const html = this.htmlContent;

    // Verificar tags de apertura y cierre básicos
    const openTags = html.match(/<[^/][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^>]+>/g) || [];

    if (openTags.length < closeTags.length) {
      throw new Error('La plantilla contiene tags HTML sin cerrar');
    }

    // Verificar que no contenga JavaScript
    if (html.includes('<script') || html.includes('javascript:')) {
      throw new Error('La plantilla no puede contener JavaScript por seguridad');
    }
  }

  /**
   * Valida que las variables usadas en el contenido estén declaradas
   */
  private async validateVariables(): Promise<void> {
    const content = this.htmlContent + (this.subject || '');
    const usedVariables = this.extractVariablesFromContent(content);
    const declaredVariables = Object.keys(this.variables || {});

    const undeclared = usedVariables.filter(v => !declaredVariables.includes(v));

    if (undeclared.length > 0) {
      throw new Error(`Variables no declaradas en la plantilla: ${undeclared.join(', ')}`);
    }
  }

  /**
   * Extrae variables del contenido usando regex
   */
  private extractVariablesFromContent(content: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }

    return [...new Set(matches)]; // Remover duplicados
  }

  /**
   * Renderiza la plantilla con variables
   */
  public render(variables: Record<string, any>): { subject: string; html: string; text?: string } {
    let renderedSubject = this.subject;
    let renderedHtml = this.htmlContent;
    let renderedText = this.textContent;

    // Reemplazar variables en subject
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      const stringValue = String(value || '');
      renderedSubject = renderedSubject.replace(regex, stringValue);
    }

    // Reemplazar variables en HTML
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      const stringValue = String(value || '');
      renderedHtml = renderedHtml.replace(regex, stringValue);
    }

    // Reemplazar variables en texto plano si existe
    if (renderedText) {
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        const stringValue = String(value || '');
        renderedText = renderedText.replace(regex, stringValue);
      }
    }

    return {
      subject: renderedSubject,
      html: renderedHtml,
      text: renderedText
    };
  }

  /**
   * Obtiene preview de la plantilla con datos de ejemplo
   */
  public getPreview(sampleData?: Record<string, any>): { subject: string; html: string; text?: string } {
    const defaultData: Record<string, any> = {
      user_name: 'Juan Pérez',
      user_email: 'juan@example.com',
      event_name: 'Conferencia Tech 2024',
      event_date: '2024-12-15',
      company_name: 'TradeConnect',
      current_year: new Date().getFullYear(),
      ...sampleData
    };

    return this.render(defaultData);
  }

  /**
   * Serializa para respuesta de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      subject: this.subject,
      htmlContent: this.htmlContent,
      textContent: this.textContent,
      variables: this.variables,
      type: this.type,
      active: this.active,
      version: this.version,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca plantilla activa por código
   */
  static async findActiveByCode(code: string): Promise<EmailTemplate | null> {
    return this.findOne({
      where: {
        code: code.toUpperCase(),
        active: true
      }
    });
  }

  /**
   * Obtiene todas las plantillas activas
   */
  static async findActiveTemplates(type?: EmailTemplateType): Promise<EmailTemplate[]> {
    const where: any = { active: true };
    if (type) {
      where.type = type;
    }

    return this.findAll({
      where,
      order: [['name', 'ASC']]
    });
  }

  /**
   * Valida si un código ya existe
   */
  static async isCodeTaken(code: string, excludeId?: number): Promise<boolean> {
    const where: any = {
      code: code.toUpperCase()
    };

    if (excludeId) {
      where.id = { [require('sequelize').Op.ne]: excludeId };
    }

    const template = await this.findOne({ where, paranoid: false });
    return !!template;
  }

  /**
   * Obtiene estadísticas de uso de plantillas
   */
  static async getUsageStats(startDate?: Date, endDate?: Date): Promise<Array<{
    templateId: number;
    code: string;
    name: string;
    usageCount: number;
  }>> {
    // Esta consulta requeriría JOIN con la tabla notifications
    // Por simplicidad, retornamos estructura básica
    const templates = await this.findAll({
      where: { active: true },
      attributes: ['id', 'code', 'name'],
      order: [['name', 'ASC']]
    });

    // En implementación real, contar usos desde notifications
    return templates.map(template => ({
      templateId: template.id,
      code: template.code,
      name: template.name,
      usageCount: 0 // TODO: Implementar conteo real
    }));
  }

  /**
   * Crea una nueva versión de plantilla
   */
  static async createNewVersion(
    baseTemplateId: number,
    updates: Partial<EmailTemplateCreationAttributes>,
    updatedBy: number
  ): Promise<EmailTemplate> {
    const baseTemplate = await this.findByPk(baseTemplateId);
    if (!baseTemplate) {
      throw new Error('Plantilla base no encontrada');
    }

    const newTemplate = await this.create({
      ...baseTemplate.toJSON(),
      ...updates,
      createdAt: undefined,
      updatedAt: undefined,
      deletedAt: undefined,
      version: baseTemplate.version + 1,
      updatedBy
    } as EmailTemplateCreationAttributes);

    return newTemplate;
  }
}