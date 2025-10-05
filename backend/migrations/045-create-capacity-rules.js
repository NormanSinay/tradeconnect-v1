'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('capacity_rules', {
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
        comment: 'Referencia al evento'
      },
      type: {
        type: Sequelize.ENUM('GLOBAL', 'DATE_SPECIFIC', 'SESSION_SPECIFIC', 'ACCESS_TYPE_SPECIFIC'),
        allowNull: false,
        comment: 'Tipo de regla de capacidad'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre descriptivo de la regla'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada de la regla'
      },
      conditions: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
        comment: 'Condiciones para aplicar la regla'
      },
      actions: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
        comment: 'Acciones a ejecutar cuando se cumple la regla'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la regla está activa'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad de la regla (mayor número = mayor prioridad)'
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
        comment: 'Usuario que creó la regla'
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
    await queryInterface.addIndex('capacity_rules', ['event_id'], {
      name: 'capacity_rules_event_id_index'
    });

    await queryInterface.addIndex('capacity_rules', ['type'], {
      name: 'capacity_rules_type_index'
    });

    await queryInterface.addIndex('capacity_rules', ['is_active'], {
      name: 'capacity_rules_is_active_index'
    });

    await queryInterface.addIndex('capacity_rules', ['priority'], {
      name: 'capacity_rules_priority_index'
    });

    await queryInterface.addIndex('capacity_rules', ['created_by'], {
      name: 'capacity_rules_created_by_index'
    });

    await queryInterface.addIndex('capacity_rules', ['created_at'], {
      name: 'capacity_rules_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('capacity_rules');
  }
};