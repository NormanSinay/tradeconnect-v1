'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('faqs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Categoría de la FAQ (ej: general, eventos, pagos)'
      },
      question: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Pregunta frecuente'
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Respuesta a la pregunta'
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Orden de aparición en la lista'
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la FAQ está publicada'
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
        comment: 'Usuario que creó la FAQ'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Usuario que actualizó la FAQ'
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
    await queryInterface.addIndex('faqs', ['category'], {
      name: 'faqs_category_index'
    });

    await queryInterface.addIndex('faqs', ['is_published'], {
      name: 'faqs_is_published_index'
    });

    await queryInterface.addIndex('faqs', ['order'], {
      name: 'faqs_order_index'
    });

    await queryInterface.addIndex('faqs', ['published_at'], {
      name: 'faqs_published_at_index'
    });

    await queryInterface.addIndex('faqs', ['created_by'], {
      name: 'faqs_created_by_index'
    });

    // Índice compuesto para category + order
    await queryInterface.addIndex('faqs', ['category', 'order'], {
      name: 'faqs_category_order_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('faqs');
  }
};
