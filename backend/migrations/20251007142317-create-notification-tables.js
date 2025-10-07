'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla email_templates
    await queryInterface.createTable('email_templates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      html_content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      text_content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      variables: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      type: {
        type: Sequelize.ENUM('TRANSACTIONAL', 'PROMOTIONAL', 'OPERATIONAL'),
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Crear tabla notifications
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('EMAIL', 'POPUP', 'SMS', 'WHATSAPP'),
        allowNull: false
      },
      channel: {
        type: Sequelize.ENUM('EMAIL', 'POPUP', 'SMS', 'WHATSAPP'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      priority: {
        type: Sequelize.ENUM('LOW', 'NORMAL', 'HIGH', 'CRITICAL'),
        allowNull: false,
        defaultValue: 'NORMAL'
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'email_templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      template_code: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      failed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      max_retries: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Crear tabla notification_logs
    await queryInterface.createTable('notification_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      notification_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'notifications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      old_status: {
        type: Sequelize.ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED'),
        allowNull: true
      },
      new_status: {
        type: Sequelize.ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED'),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear tabla notification_rules
    await queryInterface.createTable('notification_rules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      event_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      trigger_condition: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'email_templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      template_code: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      channels: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: ['EMAIL']
      },
      priority: {
        type: Sequelize.ENUM('LOW', 'NORMAL', 'HIGH', 'CRITICAL'),
        allowNull: false,
        defaultValue: 'NORMAL'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      cooldown_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      max_per_user_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Crear tabla user_notification_preferences
    await queryInterface.createTable('user_notification_preferences', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      email_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      sms_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      push_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      marketing_emails: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      transactional_emails: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      operational_emails: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      promotional_emails: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      event_reminders: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      payment_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      certificate_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      system_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      frequency: {
        type: Sequelize.ENUM('immediate', 'daily', 'weekly'),
        allowNull: false,
        defaultValue: 'immediate'
      },
      quiet_hours_start: {
        type: Sequelize.TIME,
        allowNull: true
      },
      quiet_hours_end: {
        type: Sequelize.TIME,
        allowNull: true
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'America/Guatemala'
      },
      unsubscribe_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Crear índices
    await queryInterface.addIndex('email_templates', ['code'], {
      unique: true,
      where: {
        deleted_at: null
      }
    });

    await queryInterface.addIndex('email_templates', ['type']);
    await queryInterface.addIndex('email_templates', ['active']);

    await queryInterface.addIndex('notifications', ['user_id']);
    await queryInterface.addIndex('notifications', ['status']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['channel']);
    await queryInterface.addIndex('notifications', ['priority']);
    await queryInterface.addIndex('notifications', ['scheduled_at']);
    await queryInterface.addIndex('notifications', ['created_at']);

    await queryInterface.addIndex('notification_logs', ['notification_id']);
    await queryInterface.addIndex('notification_logs', ['created_at']);

    await queryInterface.addIndex('notification_rules', ['event_type']);
    await queryInterface.addIndex('notification_rules', ['active']);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices
    await queryInterface.removeIndex('notification_rules', ['active']);
    await queryInterface.removeIndex('notification_rules', ['event_type']);
    await queryInterface.removeIndex('notification_logs', ['created_at']);
    await queryInterface.removeIndex('notification_logs', ['notification_id']);
    await queryInterface.removeIndex('notifications', ['created_at']);
    await queryInterface.removeIndex('notifications', ['scheduled_at']);
    await queryInterface.removeIndex('notifications', ['priority']);
    await queryInterface.removeIndex('notifications', ['channel']);
    await queryInterface.removeIndex('notifications', ['type']);
    await queryInterface.removeIndex('notifications', ['status']);
    await queryInterface.removeIndex('notifications', ['user_id']);
    await queryInterface.removeIndex('email_templates', ['active']);
    await queryInterface.removeIndex('email_templates', ['type']);
    await queryInterface.removeIndex('email_templates', ['code']);

    // Eliminar tablas
    await queryInterface.dropTable('user_notification_preferences');
    await queryInterface.dropTable('notification_rules');
    await queryInterface.dropTable('notification_logs');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('email_templates');
  }
};
