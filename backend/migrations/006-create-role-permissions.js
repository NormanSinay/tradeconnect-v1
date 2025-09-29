'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del rol'
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del permiso'
      },
      assigned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del usuario que asignó el permiso'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la asignación está activa'
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Razón de la asignación'
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
    await queryInterface.addIndex('role_permissions', ['role_id'], {
      name: 'role_permissions_role_id_index'
    });

    await queryInterface.addIndex('role_permissions', ['permission_id'], {
      name: 'role_permissions_permission_id_index'
    });

    await queryInterface.addIndex('role_permissions', ['assigned_by'], {
      name: 'role_permissions_assigned_by_index'
    });

    await queryInterface.addIndex('role_permissions', ['is_active'], {
      name: 'role_permissions_is_active_index'
    });

    // Índice único compuesto para evitar duplicados activos
    await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], {
      unique: true,
      where: { is_active: true },
      name: 'role_permissions_role_permission_active_unique'
    });

    // Índice compuesto para consultas comunes
    await queryInterface.addIndex('role_permissions', ['role_id', 'is_active'], {
      name: 'role_permissions_role_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('role_permissions');
  }
};