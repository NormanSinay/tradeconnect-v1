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
      roleId: {
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
      permissionId: {
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
      assignedBy: {
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
      isActive: {
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización'
      }
    });

    // Índices
    await queryInterface.addIndex('role_permissions', ['roleId'], {
      name: 'role_permissions_role_id_index'
    });

    await queryInterface.addIndex('role_permissions', ['permissionId'], {
      name: 'role_permissions_permission_id_index'
    });

    await queryInterface.addIndex('role_permissions', ['assignedBy'], {
      name: 'role_permissions_assigned_by_index'
    });

    await queryInterface.addIndex('role_permissions', ['isActive'], {
      name: 'role_permissions_is_active_index'
    });

    // Índice único compuesto para evitar duplicados activos
    await queryInterface.addIndex('role_permissions', ['roleId', 'permissionId'], {
      unique: true,
      where: { isActive: true },
      name: 'role_permissions_role_permission_active_unique'
    });

    // Índice compuesto para consultas comunes
    await queryInterface.addIndex('role_permissions', ['roleId', 'isActive'], {
      name: 'role_permissions_role_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('role_permissions');
  }
};