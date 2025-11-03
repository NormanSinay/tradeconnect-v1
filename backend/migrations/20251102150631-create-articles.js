'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('articles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Título del artículo'
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Slug único del artículo para URLs'
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Extracto breve del artículo'
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        comment: 'Contenido completo del artículo en formato HTML/Markdown'
      },
      featured_image: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL de la imagen destacada del artículo'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
        comment: 'Estado del artículo'
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de publicación del artículo'
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del autor del artículo',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID de la categoría del artículo',
        references: {
          model: 'article_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      view_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de visualizaciones del artículo'
      },
      like_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de likes del artículo'
      },
      share_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de compartidos del artículo'
      },
      seo_title: {
        type: Sequelize.STRING(60),
        allowNull: true,
        comment: 'Título SEO personalizado'
      },
      seo_description: {
        type: Sequelize.STRING(160),
        allowNull: true,
        comment: 'Descripción SEO del artículo'
      },
      seo_keywords: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Palabras clave SEO (array de strings)'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del artículo'
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
    await queryInterface.addIndex('articles', ['slug'], {
      name: 'articles_slug_index',
      unique: true
    });

    await queryInterface.addIndex('articles', ['status'], {
      name: 'articles_status_index'
    });

    await queryInterface.addIndex('articles', ['author_id'], {
      name: 'articles_author_id_index'
    });

    await queryInterface.addIndex('articles', ['category_id'], {
      name: 'articles_category_id_index'
    });

    await queryInterface.addIndex('articles', ['published_at'], {
      name: 'articles_published_at_index'
    });

    await queryInterface.addIndex('articles', ['created_at'], {
      name: 'articles_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('articles');
  }
};
