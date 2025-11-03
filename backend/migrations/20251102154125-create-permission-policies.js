'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permission_policies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único de la política'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre técnico único de la política'
      },
      display_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre visible de la política'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la política'
      },
      policy_type: {
        type: Sequelize.ENUM('time_based', 'location_based', 'role_based', 'context_based', 'resource_based', 'custom'),
        allowNull: false,
        comment: 'Tipo de política de permisos'
      },
      conditions: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Condiciones de evaluación de la política'
      },
      effect: {
        type: Sequelize.ENUM('allow', 'deny'),
        allowNull: false,
        comment: 'Efecto de la política (allow/deny)'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Prioridad de evaluación (0-1000, mayor = más prioritario)'
      },
      context_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del contexto al que aplica la política',
        references: {
          model: 'permission_contexts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la política está activa'
      },
      is_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es una política del sistema'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que creó la política',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración de la política'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de actualización'
      }
    });

    // Crear índices
    await queryInterface.addIndex('permission_policies', ['policy_type']);
    await queryInterface.addIndex('permission_policies', ['effect']);
    await queryInterface.addIndex('permission_policies', ['priority']);
    await queryInterface.addIndex('permission_policies', ['context_id']);
    await queryInterface.addIndex('permission_policies', ['is_active']);
    await queryInterface.addIndex('permission_policies', ['is_system']);
    await queryInterface.addIndex('permission_policies', ['expires_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permission_policies');
  }
};
