'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('article_categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre de la categoría'
      },
      slug: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Slug único de la categoría para URLs'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la categoría'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Color representativo de la categoría (hex)'
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Icono de la categoría (FontAwesome class)'
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID de la categoría padre (para jerarquía)',
        references: {
          model: 'article_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Orden de visualización de la categoría'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la categoría está activa'
      },
      seo_title: {
        type: Sequelize.STRING(60),
        allowNull: true,
        comment: 'Título SEO personalizado'
      },
      seo_description: {
        type: Sequelize.STRING(160),
        allowNull: true,
        comment: 'Descripción SEO de la categoría'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales de la categoría'
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
    await queryInterface.addIndex('article_categories', ['slug'], {
      name: 'article_categories_slug_index',
      unique: true
    });

    await queryInterface.addIndex('article_categories', ['parent_id'], {
      name: 'article_categories_parent_id_index'
    });

    await queryInterface.addIndex('article_categories', ['is_active'], {
      name: 'article_categories_is_active_index'
    });

    await queryInterface.addIndex('article_categories', ['order'], {
      name: 'article_categories_order_index'
    });

    await queryInterface.addIndex('article_categories', ['created_at'], {
      name: 'article_categories_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('article_categories');
  }
};
