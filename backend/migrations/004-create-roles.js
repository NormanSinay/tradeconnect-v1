'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Nombre técnico del rol'
      },
      display_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre visible del rol'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descripción del rol'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el rol está activo'
      },
      is_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es un rol del sistema (no eliminable)'
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Nivel jerárquico del rol (1-10, donde 10 es el más alto)'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Color hexadecimal para la interfaz'
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Icono para la interfaz'
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
    await queryInterface.addIndex('roles', ['name'], {
      unique: true,
      name: 'roles_name_unique'
    });

    await queryInterface.addIndex('roles', ['is_active'], {
      name: 'roles_is_active_index'
    });

    await queryInterface.addIndex('roles', ['level'], {
      name: 'roles_level_index'
    });

    await queryInterface.addIndex('roles', ['is_system'], {
      name: 'roles_is_system_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
  }
};