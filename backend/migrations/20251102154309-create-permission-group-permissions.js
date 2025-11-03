'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permission_group_permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único de la relación grupo-permiso'
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del grupo de permisos',
        references: {
          model: 'permission_groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del permiso',
        references: {
          model: 'permissions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Crear índices únicos y compuestos
    await queryInterface.addIndex('permission_group_permissions', ['group_id']);
    await queryInterface.addIndex('permission_group_permissions', ['permission_id']);
    await queryInterface.addIndex('permission_group_permissions', ['group_id', 'permission_id'], {
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permission_group_permissions');
  }
};
