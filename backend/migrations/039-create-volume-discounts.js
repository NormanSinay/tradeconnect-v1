'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('volume_discounts', {
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
        comment: 'Evento al que aplica el descuento por volumen'
      },
      min_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Cantidad mínima para aplicar el descuento'
      },
      max_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Cantidad máxima para este nivel (null = sin límite superior)'
      },
      discount_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Porcentaje de descuento (0-100)'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descripción del nivel de descuento'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado del descuento por volumen'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad si hay múltiples niveles aplicables'
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
    await queryInterface.addIndex('volume_discounts', ['event_id'], {
      name: 'volume_discounts_event_id_index'
    });

    await queryInterface.addIndex('volume_discounts', ['min_quantity'], {
      name: 'volume_discounts_min_quantity_index'
    });

    await queryInterface.addIndex('volume_discounts', ['is_active'], {
      name: 'volume_discounts_is_active_index'
    });

    await queryInterface.addIndex('volume_discounts', ['priority'], {
      name: 'volume_discounts_priority_index'
    });

    await queryInterface.addIndex('volume_discounts', ['created_by'], {
      name: 'volume_discounts_created_by_index'
    });

    // Índice compuesto para consultas eficientes
    await queryInterface.addIndex('volume_discounts', ['event_id', 'is_active', 'min_quantity'], {
      name: 'volume_discounts_event_active_quantity_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('volume_discounts');
  }
};