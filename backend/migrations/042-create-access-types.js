'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_types', {
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
        comment: 'Nombre interno único del tipo de acceso'
      },
      display_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre para mostrar en la interfaz'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del tipo de acceso'
      },
      short_description: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Descripción corta para listados'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Categoría del tipo de acceso (premium, standard, etc.)'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Color para identificación visual (formato #RRGGBB)'
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Icono del tipo de acceso (nombre de clase CSS o URL)'
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
        comment: 'Estado del tipo de acceso'
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si es el tipo de acceso por defecto para nuevos eventos'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad del tipo de acceso (mayor número = mayor prioridad)'
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Orden de visualización en listas'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del tipo de acceso'
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
        comment: 'Usuario que creó el tipo de acceso'
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
    await queryInterface.addIndex('access_types', ['name'], {
      name: 'access_types_name_index',
      unique: true
    });

    await queryInterface.addIndex('access_types', ['category'], {
      name: 'access_types_category_index'
    });

    await queryInterface.addIndex('access_types', ['status'], {
      name: 'access_types_status_index'
    });

    await queryInterface.addIndex('access_types', ['is_default'], {
      name: 'access_types_is_default_index'
    });

    await queryInterface.addIndex('access_types', ['priority'], {
      name: 'access_types_priority_index'
    });

    await queryInterface.addIndex('access_types', ['display_order'], {
      name: 'access_types_display_order_index'
    });

    await queryInterface.addIndex('access_types', ['created_by'], {
      name: 'access_types_created_by_index'
    });

    await queryInterface.addIndex('access_types', ['created_at'], {
      name: 'access_types_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('access_types');
  }
};