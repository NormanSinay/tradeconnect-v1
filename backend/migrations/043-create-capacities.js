'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('capacities', {
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
      total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Capacidad total del evento'
      },
      available_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Capacidad disponible actual (calculada)'
      },
      blocked_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Capacidad bloqueada temporalmente'
      },
      overbooking_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Porcentaje de overbooking permitido (0-50%)'
      },
      overbooking_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si el overbooking está habilitado'
      },
      waitlist_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la lista de espera está habilitada'
      },
      lock_timeout_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15,
        comment: 'Tiempo de bloqueo temporal en minutos (5-60)'
      },
      alert_thresholds: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: { low: 80, medium: 90, high: 95 },
        comment: 'Umbrales de alerta de ocupación (%)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la configuración está activa'
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
    await queryInterface.addIndex('capacities', ['event_id'], {
      name: 'capacities_event_id_index',
      unique: true
    });

    await queryInterface.addIndex('capacities', ['is_active'], {
      name: 'capacities_is_active_index'
    });

    await queryInterface.addIndex('capacities', ['created_by'], {
      name: 'capacities_created_by_index'
    });

    await queryInterface.addIndex('capacities', ['created_at'], {
      name: 'capacities_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('capacities');
  }
};