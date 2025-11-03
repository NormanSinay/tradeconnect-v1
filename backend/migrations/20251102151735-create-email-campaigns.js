'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla email_campaigns
    await queryInterface.createTable('email_campaigns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre de la campaña de email'
      },
      description: {
        type: Sequelize.TEXT,
        comment: 'Descripción de la campaña'
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'CANCELLED', 'FAILED'),
        allowNull: false,
        defaultValue: 'DRAFT',
        comment: 'Estado actual de la campaña'
      },
      type: {
        type: Sequelize.ENUM('MARKETING', 'NEWSLETTER', 'PROMOTIONAL', 'TRANSACTIONAL', 'WELCOME', 'REENGAGEMENT', 'AUTOMATED'),
        allowNull: false,
        comment: 'Tipo de campaña de email'
      },
      template_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'email_templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID de la plantilla de email utilizada'
      },
      template_code: {
        type: Sequelize.STRING(100),
        comment: 'Código de la plantilla utilizada'
      },
      subject: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Asunto del email de la campaña'
      },
      preview_text: {
        type: Sequelize.STRING(255),
        comment: 'Texto de preview del email'
      },
      from_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del remitente'
      },
      from_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email del remitente'
      },
      reply_to_email: {
        type: Sequelize.STRING(255),
        comment: 'Email de respuesta (Reply-To)'
      },
      scheduled_at: {
        type: Sequelize.DATE,
        comment: 'Fecha programada para el envío de la campaña'
      },
      sent_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando inició el envío'
      },
      completed_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se completó el envío'
      },
      total_recipients: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Total de destinatarios de la campaña'
      },
      sent_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de emails enviados'
      },
      delivered_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de emails entregados'
      },
      opened_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de emails abiertos'
      },
      clicked_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de clicks en enlaces'
      },
      bounced_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de emails rebotados'
      },
      unsubscribed_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de desuscripciones'
      },
      complained_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de quejas de spam'
      },
      segmentation_rules: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Reglas de segmentación para filtrar destinatarios'
      },
      variables: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Variables globales de la campaña'
      },
      tags: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: 'Tags para categorizar la campaña'
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: 'Prioridad de envío (1-10, mayor número = mayor prioridad)'
      },
      batch_size: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
        comment: 'Tamaño del lote para envío por lotes'
      },
      send_rate_per_hour: {
        type: Sequelize.INTEGER,
        defaultValue: 1000,
        comment: 'Límite de emails por hora para evitar bloqueos'
      },
      track_opens: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si se debe rastrear aperturas de email'
      },
      track_clicks: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si se debe rastrear clicks en enlaces'
      },
      respect_user_preferences: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si se deben respetar las preferencias de notificación del usuario'
      },
      test_recipients: {
        type: Sequelize.JSONB,
        comment: 'Lista de emails para envío de prueba'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del usuario que creó la campaña'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del usuario que actualizó la campaña'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Crear índices para email_campaigns
    await queryInterface.addIndex('email_campaigns', ['status'], {
      name: 'idx_email_campaigns_status'
    });
    await queryInterface.addIndex('email_campaigns', ['type'], {
      name: 'idx_email_campaigns_type'
    });
    await queryInterface.addIndex('email_campaigns', ['scheduled_at'], {
      name: 'idx_email_campaigns_scheduled_at'
    });
    await queryInterface.addIndex('email_campaigns', ['sent_at'], {
      name: 'idx_email_campaigns_sent_at'
    });
    await queryInterface.addIndex('email_campaigns', ['created_by'], {
      name: 'idx_email_campaigns_created_by'
    });
    await queryInterface.addIndex('email_campaigns', ['template_code'], {
      name: 'idx_email_campaigns_template_code'
    });
    await queryInterface.addIndex('email_campaigns', ['created_at'], {
      name: 'idx_email_campaigns_created_at'
    });
    await queryInterface.addIndex('email_campaigns', ['status', 'scheduled_at'], {
      name: 'idx_email_campaigns_status_scheduled'
    });

    // Crear tabla campaign_recipients
    await queryInterface.createTable('campaign_recipients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'email_campaigns',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la campaña de email'
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del usuario destinatario (opcional para emails externos)'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email del destinatario'
      },
      first_name: {
        type: Sequelize.STRING(100),
        comment: 'Nombre del destinatario'
      },
      last_name: {
        type: Sequelize.STRING(100),
        comment: 'Apellido del destinatario'
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED', 'SKIPPED'),
        allowNull: false,
        defaultValue: 'PENDING',
        comment: 'Estado del destinatario en la campaña'
      },
      sent_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se envió el email'
      },
      delivered_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se entregó el email'
      },
      opened_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de la última apertura del email'
      },
      first_opened_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de la primera apertura del email'
      },
      clicked_at: {
        type: Sequelize.DATE,
        comment: 'Fecha del último click en enlace'
      },
      bounced_at: {
        type: Sequelize.DATE,
        comment: 'Fecha del rebote del email'
      },
      complained_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de la queja de spam'
      },
      unsubscribed_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de desuscripción'
      },
      variables: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Variables personalizadas para este destinatario'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Metadatos adicionales del destinatario'
      },
      error_message: {
        type: Sequelize.TEXT,
        comment: 'Mensaje de error si el envío falló'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de reintentos realizados'
      },
      max_retries: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
        comment: 'Máximo número de reintentos permitidos'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Crear índices únicos y de búsqueda para campaign_recipients
    await queryInterface.addIndex('campaign_recipients', ['campaign_id', 'email'], {
      unique: true,
      name: 'idx_campaign_recipients_campaign_email_unique'
    });
    await queryInterface.addIndex('campaign_recipients', ['campaign_id'], {
      name: 'idx_campaign_recipients_campaign_id'
    });
    await queryInterface.addIndex('campaign_recipients', ['user_id'], {
      name: 'idx_campaign_recipients_user_id'
    });
    await queryInterface.addIndex('campaign_recipients', ['email'], {
      name: 'idx_campaign_recipients_email'
    });
    await queryInterface.addIndex('campaign_recipients', ['status'], {
      name: 'idx_campaign_recipients_status'
    });
    await queryInterface.addIndex('campaign_recipients', ['sent_at'], {
      name: 'idx_campaign_recipients_sent_at'
    });
    await queryInterface.addIndex('campaign_recipients', ['opened_at'], {
      name: 'idx_campaign_recipients_opened_at'
    });
    await queryInterface.addIndex('campaign_recipients', ['clicked_at'], {
      name: 'idx_campaign_recipients_clicked_at'
    });
    await queryInterface.addIndex('campaign_recipients', ['campaign_id', 'status'], {
      name: 'idx_campaign_recipients_campaign_status'
    });
    await queryInterface.addIndex('campaign_recipients', ['created_at'], {
      name: 'idx_campaign_recipients_created_at'
    });

    // Crear tabla campaign_emails
    await queryInterface.createTable('campaign_emails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'email_campaigns',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la campaña de email'
      },
      recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'campaign_recipients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del destinatario de la campaña'
      },
      message_id: {
        type: Sequelize.STRING(255),
        comment: 'ID único del mensaje para tracking SMTP'
      },
      status: {
        type: Sequelize.ENUM('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'FAILED'),
        allowNull: false,
        defaultValue: 'QUEUED',
        comment: 'Estado actual del email en la campaña'
      },
      sent_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se envió el email'
      },
      delivered_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se entregó el email'
      },
      opened_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de la última apertura del email'
      },
      first_opened_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de la primera apertura del email'
      },
      clicked_at: {
        type: Sequelize.DATE,
        comment: 'Fecha del último click en enlace'
      },
      bounced_at: {
        type: Sequelize.DATE,
        comment: 'Fecha del rebote del email'
      },
      complained_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de la queja de spam'
      },
      failed_at: {
        type: Sequelize.DATE,
        comment: 'Fecha del fallo de envío'
      },
      error_message: {
        type: Sequelize.TEXT,
        comment: 'Mensaje de error si el envío falló'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de reintentos realizados'
      },
      max_retries: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
        comment: 'Máximo número de reintentos permitidos'
      },
      ip_address: {
        type: Sequelize.INET,
        comment: 'IP del destinatario que realizó la actividad'
      },
      user_agent: {
        type: Sequelize.TEXT,
        comment: 'User agent del destinatario'
      },
      open_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número total de aperturas del email'
      },
      click_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número total de clicks en enlaces'
      },
      last_activity_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de la última actividad (apertura/click)'
      },
      events: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: 'Historial de eventos del email (aperturas, clicks, etc.)'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Metadatos adicionales del email'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Crear índices únicos y de búsqueda para campaign_emails
    await queryInterface.addIndex('campaign_emails', ['campaign_id', 'recipient_id'], {
      unique: true,
      name: 'idx_campaign_emails_campaign_recipient_unique'
    });
    await queryInterface.addIndex('campaign_emails', ['campaign_id'], {
      name: 'idx_campaign_emails_campaign_id'
    });
    await queryInterface.addIndex('campaign_emails', ['recipient_id'], {
      name: 'idx_campaign_emails_recipient_id'
    });
    await queryInterface.addIndex('campaign_emails', ['message_id'], {
      name: 'idx_campaign_emails_message_id'
    });
    await queryInterface.addIndex('campaign_emails', ['status'], {
      name: 'idx_campaign_emails_status'
    });
    await queryInterface.addIndex('campaign_emails', ['sent_at'], {
      name: 'idx_campaign_emails_sent_at'
    });
    await queryInterface.addIndex('campaign_emails', ['opened_at'], {
      name: 'idx_campaign_emails_opened_at'
    });
    await queryInterface.addIndex('campaign_emails', ['clicked_at'], {
      name: 'idx_campaign_emails_clicked_at'
    });
    await queryInterface.addIndex('campaign_emails', ['last_activity_at'], {
      name: 'idx_campaign_emails_last_activity_at'
    });
    await queryInterface.addIndex('campaign_emails', ['campaign_id', 'status'], {
      name: 'idx_campaign_emails_campaign_status'
    });
    await queryInterface.addIndex('campaign_emails', ['created_at'], {
      name: 'idx_campaign_emails_created_at'
    });

    // Crear tabla campaign_schedules
    await queryInterface.createTable('campaign_schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'email_campaigns',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la campaña de email a programar'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre descriptivo de la programación'
      },
      description: {
        type: Sequelize.TEXT,
        comment: 'Descripción detallada de la programación'
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
        comment: 'Estado actual de la programación'
      },
      frequency: {
        type: Sequelize.ENUM('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'),
        allowNull: false,
        comment: 'Frecuencia de ejecución de la campaña'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de inicio de la programación'
      },
      end_date: {
        type: Sequelize.DATE,
        comment: 'Fecha de fin de la programación (opcional)'
      },
      next_run_at: {
        type: Sequelize.DATE,
        comment: 'Próxima ejecución programada'
      },
      last_run_at: {
        type: Sequelize.DATE,
        comment: 'Última ejecución realizada'
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'America/Guatemala',
        comment: 'Zona horaria para calcular las ejecuciones'
      },
      daily_time: {
        type: Sequelize.STRING(5),
        comment: 'Hora del día para envíos diarios (HH:MM)'
      },
      weekly_days: {
        type: Sequelize.JSONB,
        comment: 'Días de la semana para envíos semanales'
      },
      weekly_time: {
        type: Sequelize.STRING(5),
        comment: 'Hora de la semana para envíos semanales (HH:MM)'
      },
      monthly_day: {
        type: Sequelize.INTEGER,
        comment: 'Día del mes para envíos mensuales (1-31)'
      },
      monthly_time: {
        type: Sequelize.STRING(5),
        comment: 'Hora del mes para envíos mensuales (HH:MM)'
      },
      cron_expression: {
        type: Sequelize.STRING(100),
        comment: 'Expresión cron para frecuencias personalizadas'
      },
      max_executions: {
        type: Sequelize.INTEGER,
        comment: 'Máximo número de ejecuciones permitidas'
      },
      execution_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Número de ejecuciones realizadas'
      },
      conditions: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Condiciones adicionales para determinar si ejecutar'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: 'Metadatos adicionales de la programación'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del usuario que creó la programación'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del usuario que actualizó la programación'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Crear índices para campaign_schedules
    await queryInterface.addIndex('campaign_schedules', ['campaign_id'], {
      name: 'idx_campaign_schedules_campaign_id'
    });
    await queryInterface.addIndex('campaign_schedules', ['status'], {
      name: 'idx_campaign_schedules_status'
    });
    await queryInterface.addIndex('campaign_schedules', ['frequency'], {
      name: 'idx_campaign_schedules_frequency'
    });
    await queryInterface.addIndex('campaign_schedules', ['next_run_at'], {
      name: 'idx_campaign_schedules_next_run_at'
    });
    await queryInterface.addIndex('campaign_schedules', ['last_run_at'], {
      name: 'idx_campaign_schedules_last_run_at'
    });
    await queryInterface.addIndex('campaign_schedules', ['start_date'], {
      name: 'idx_campaign_schedules_start_date'
    });
    await queryInterface.addIndex('campaign_schedules', ['end_date'], {
      name: 'idx_campaign_schedules_end_date'
    });
    await queryInterface.addIndex('campaign_schedules', ['created_by'], {
      name: 'idx_campaign_schedules_created_by'
    });
    await queryInterface.addIndex('campaign_schedules', ['created_at'], {
      name: 'idx_campaign_schedules_created_at'
    });
    await queryInterface.addIndex('campaign_schedules', ['status', 'next_run_at'], {
      name: 'idx_campaign_schedules_status_next_run'
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices y tablas en orden inverso
    await queryInterface.dropTable('campaign_schedules');
    await queryInterface.dropTable('campaign_emails');
    await queryInterface.dropTable('campaign_recipients');
    await queryInterface.dropTable('email_campaigns');
  }
};
