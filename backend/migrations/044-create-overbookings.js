'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('overbookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Referencia al evento'
      },
      max_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Porcentaje máximo de overbooking permitido (0-100%)'
      },
      current_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Porcentaje actual de overbooking'
      },
      risk_level: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
        defaultValue: 'LOW',
        comment: 'Nivel de riesgo del overbooking'
      },
      auto_actions: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          alertAdmins: true,
          notifyUsers: false,
          offerAlternatives: false
        },
        comment: 'Acciones automáticas cuando se activa overbooking'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la configuración de overbooking está activa'
      },
      activated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando se activó el overbooking'
      },
      deactivated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando se desactivó el overbooking'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales de configuración'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que creó la configuración'
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
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices
    await queryInterface.addIndex('overbookings', ['event_id'], {
      name: 'overbookings_event_id_index',
      unique: true
    });

    await queryInterface.addIndex('overbookings', ['is_active'], {
      name: 'overbookings_is_active_index'
    });

    await queryInterface.addIndex('overbookings', ['risk_level'], {
      name: 'overbookings_risk_level_index'
    });

    await queryInterface.addIndex('overbookings', ['activated_at'], {
      name: 'overbookings_activated_at_index'
    });

    await queryInterface.addIndex('overbookings', ['created_by'], {
      name: 'overbookings_created_by_index'
    });

    await queryInterface.addIndex('overbookings', ['created_at'], {
      name: 'overbookings_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('overbookings');
  }
};