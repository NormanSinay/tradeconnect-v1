'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('early_bird_discounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Evento al que aplica el descuento early bird'
      },
      days_before_event: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Días antes del evento para aplicar el descuento'
      },
      discount_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Porcentaje de descuento (0-100)'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descripción del descuento early bird'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado del descuento early bird'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad si hay múltiples niveles aplicables'
      },
      // Configuración automática
      auto_apply: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si se aplica automáticamente en el checkout'
      },
      // Auditoría
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que creó el descuento'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que actualizó el descuento'
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
    await queryInterface.addIndex('early_bird_discounts', ['event_id'], {
      name: 'early_bird_discounts_event_id_index'
    });

    await queryInterface.addIndex('early_bird_discounts', ['days_before_event'], {
      name: 'early_bird_discounts_days_before_index'
    });

    await queryInterface.addIndex('early_bird_discounts', ['is_active'], {
      name: 'early_bird_discounts_is_active_index'
    });

    await queryInterface.addIndex('early_bird_discounts', ['priority'], {
      name: 'early_bird_discounts_priority_index'
    });

    await queryInterface.addIndex('early_bird_discounts', ['created_by'], {
      name: 'early_bird_discounts_created_by_index'
    });

    // Índice compuesto para consultas eficientes
    await queryInterface.addIndex('early_bird_discounts', ['event_id', 'is_active', 'days_before_event'], {
      name: 'early_bird_discounts_event_active_days_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('early_bird_discounts');
  }
};