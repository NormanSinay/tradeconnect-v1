'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del usuario'
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
      assigned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del usuario que asignó el rol'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración del rol (opcional)'
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
    await queryInterface.addIndex('user_roles', ['user_id'], {
      name: 'user_roles_user_id_index'
    });

    await queryInterface.addIndex('user_roles', ['role_id'], {
      name: 'user_roles_role_id_index'
    });

    await queryInterface.addIndex('user_roles', ['assigned_by'], {
      name: 'user_roles_assigned_by_index'
    });

    await queryInterface.addIndex('user_roles', ['is_active'], {
      name: 'user_roles_is_active_index'
    });

    await queryInterface.addIndex('user_roles', ['expires_at'], {
      name: 'user_roles_expires_at_index'
    });

    // Índice único compuesto para evitar duplicados activos
    await queryInterface.addIndex('user_roles', ['user_id', 'role_id'], {
      unique: true,
      where: { is_active: true },
      name: 'user_roles_user_role_active_unique'
    });

    // Índice compuesto para consultas comunes
    await queryInterface.addIndex('user_roles', ['user_id', 'is_active'], {
      name: 'user_roles_user_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_roles');
  }
};