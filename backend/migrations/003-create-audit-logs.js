'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del usuario que realizó la acción (opcional)'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Acción realizada'
      },
      resource: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Recurso afectado'
      },
      resource_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'ID específico del recurso'
      },
      old_values: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Valores anteriores (JSON)'
      },
      new_values: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Valores nuevos (JSON)'
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: false,
        comment: 'Dirección IP del cliente'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'User-Agent del navegador'
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Información adicional (JSON)'
      },
      severity: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'low',
        comment: 'Nivel de severidad del evento'
      },
      status: {
        type: Sequelize.ENUM('success', 'failure', 'warning'),
        allowNull: false,
        defaultValue: 'success',
        comment: 'Estado del evento'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del evento'
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
      }
    });

    // Índices
    await queryInterface.addIndex('audit_logs', ['user_id'], {
      name: 'audit_logs_user_id_index'
    });

    await queryInterface.addIndex('audit_logs', ['action'], {
      name: 'audit_logs_action_index'
    });

    await queryInterface.addIndex('audit_logs', ['resource'], {
      name: 'audit_logs_resource_index'
    });

    await queryInterface.addIndex('audit_logs', ['resource_id'], {
      name: 'audit_logs_resource_id_index'
    });

    await queryInterface.addIndex('audit_logs', ['severity'], {
      name: 'audit_logs_severity_index'
    });

    await queryInterface.addIndex('audit_logs', ['status'], {
      name: 'audit_logs_status_index'
    });

    await queryInterface.addIndex('audit_logs', ['created_at'], {
      name: 'audit_logs_created_at_index'
    });

    await queryInterface.addIndex('audit_logs', ['ip_address'], {
      name: 'audit_logs_ip_address_index'
    });

    // Índice compuesto para consultas comunes
    await queryInterface.addIndex('audit_logs', ['resource', 'action'], {
      name: 'audit_logs_resource_action_index'
    });

    await queryInterface.addIndex('audit_logs', ['user_id', 'created_at'], {
      name: 'audit_logs_user_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('audit_logs');
  }
};