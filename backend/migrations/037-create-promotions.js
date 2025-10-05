'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promotions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre interno de la promoción'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada de la promoción'
      },
      type: {
        type: Sequelize.ENUM('GENERAL', 'EVENT_SPECIFIC', 'CATEGORY_SPECIFIC', 'MEMBERSHIP'),
        allowNull: false,
        defaultValue: 'GENERAL',
        comment: 'Tipo de promoción'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado de la promoción'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de inicio de la promoción'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de fin de la promoción'
      },
      // Restricciones de elegibilidad
      event_ids: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'IDs de eventos específicos (si type=EVENT_SPECIFIC)'
      },
      category_ids: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'IDs de categorías permitidas (si type=CATEGORY_SPECIFIC)'
      },
      min_purchase_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Monto mínimo de compra requerido'
      },
      user_types: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tipos de usuario permitidos (individual, empresa, member)'
      },
      // Configuración de combinación
      is_stackable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si puede combinarse con otras promociones'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad para resolución de conflictos (mayor = más prioritario)'
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
        comment: 'Usuario que creó la promoción'
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
        comment: 'Usuario que actualizó la promoción'
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
    await queryInterface.addIndex('promotions', ['type'], {
      name: 'promotions_type_index'
    });

    await queryInterface.addIndex('promotions', ['is_active'], {
      name: 'promotions_is_active_index'
    });

    await queryInterface.addIndex('promotions', ['start_date'], {
      name: 'promotions_start_date_index'
    });

    await queryInterface.addIndex('promotions', ['end_date'], {
      name: 'promotions_end_date_index'
    });

    await queryInterface.addIndex('promotions', ['priority'], {
      name: 'promotions_priority_index'
    });

    await queryInterface.addIndex('promotions', ['created_by'], {
      name: 'promotions_created_by_index'
    });

    await queryInterface.addIndex('promotions', ['created_at'], {
      name: 'promotions_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promotions');
  }
};