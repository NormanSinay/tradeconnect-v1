'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Contenido del comentario'
      },
      article_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del artículo al que pertenece el comentario',
        references: {
          model: 'articles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del autor del comentario',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del comentario padre (para respuestas anidadas)',
        references: {
          model: 'comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'spam'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado del comentario'
      },
      is_approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el comentario está aprobado'
      },
      like_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de likes del comentario'
      },
      dislike_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de dislikes del comentario'
      },
      reported_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de reportes del comentario'
      },
      author_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre del autor (si es invitado)'
      },
      author_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Email del autor (si es invitado)'
      },
      author_website: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Sitio web del autor (si es invitado)'
      },
      author_ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP del autor del comentario'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent del navegador del autor'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del comentario'
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
    await queryInterface.addIndex('comments', ['article_id'], {
      name: 'comments_article_id_index'
    });

    await queryInterface.addIndex('comments', ['author_id'], {
      name: 'comments_author_id_index'
    });

    await queryInterface.addIndex('comments', ['parent_id'], {
      name: 'comments_parent_id_index'
    });

    await queryInterface.addIndex('comments', ['status'], {
      name: 'comments_status_index'
    });

    await queryInterface.addIndex('comments', ['is_approved'], {
      name: 'comments_is_approved_index'
    });

    await queryInterface.addIndex('comments', ['created_at'], {
      name: 'comments_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  }
};
