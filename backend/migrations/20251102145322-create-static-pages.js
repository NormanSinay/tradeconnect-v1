'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('static_pages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Slug único para la URL de la página'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Título de la página'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Contenido HTML de la página'
      },
      meta_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Meta título para SEO'
      },
      meta_description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Meta descripción para SEO'
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la página está publicada'
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de publicación'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Usuario que creó la página'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Usuario que actualizó la página'
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
    await queryInterface.addIndex('static_pages', ['slug'], {
      unique: true,
      name: 'static_pages_slug_unique'
    });

    await queryInterface.addIndex('static_pages', ['is_published'], {
      name: 'static_pages_is_published_index'
    });

    await queryInterface.addIndex('static_pages', ['published_at'], {
      name: 'static_pages_published_at_index'
    });

    await queryInterface.addIndex('static_pages', ['created_by'], {
      name: 'static_pages_created_by_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('static_pages');
  }
};
