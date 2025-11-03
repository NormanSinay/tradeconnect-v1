'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permission_groups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del grupo de permisos'
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Nombre técnico único del grupo de permisos'
      },
      display_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre visible del grupo de permisos'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descripción del grupo de permisos'
      },
      category: {
        type: Sequelize.ENUM('system', 'security', 'content', 'commerce', 'analytics', 'communication', 'events', 'users', 'reports'),
        allowNull: false,
        comment: 'Categoría del grupo de permisos'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el grupo está activo'
      },
      is_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es un grupo del sistema (no eliminable)'
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Orden de visualización del grupo'
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Icono del grupo para UI'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Color del grupo en formato hexadecimal'
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
    await queryInterface.addIndex('permission_groups', ['category']);
    await queryInterface.addIndex('permission_groups', ['is_active']);
    await queryInterface.addIndex('permission_groups', ['is_system']);
    await queryInterface.addIndex('permission_groups', ['order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permission_groups');
  }
};
