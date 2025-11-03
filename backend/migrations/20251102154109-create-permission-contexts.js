'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permission_contexts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del contexto'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre técnico único del contexto'
      },
      display_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre visible del contexto'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del contexto'
      },
      context_type: {
        type: Sequelize.ENUM('global', 'organization', 'department', 'project', 'team', 'personal', 'event', 'group'),
        allowNull: false,
        comment: 'Tipo de contexto de permisos'
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del contexto padre para jerarquías',
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
        comment: 'Indica si el contexto está activo'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del contexto'
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
    await queryInterface.addIndex('permission_contexts', ['context_type']);
    await queryInterface.addIndex('permission_contexts', ['parent_id']);
    await queryInterface.addIndex('permission_contexts', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permission_contexts');
  }
};
