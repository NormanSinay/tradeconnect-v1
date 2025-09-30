'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_media', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del evento asociado'
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre del archivo en el servidor'
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre original del archivo'
      },
      mimetype: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Tipo MIME del archivo'
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Tamaño del archivo en bytes'
      },
      path: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Ruta completa del archivo en el servidor'
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'URL pública del archivo'
      },
      type: {
        type: Sequelize.ENUM('image', 'video', 'document', 'audio', 'other'),
        allowNull: false,
        defaultValue: 'image',
        comment: 'Tipo de medio'
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Texto alternativo para accesibilidad'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del archivo'
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es la imagen destacada del evento'
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Orden de visualización'
      },
      dimensions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dimensiones del archivo (ancho, alto para imágenes)'
      },
      thumbnails: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'URLs de thumbnails generadas'
      },
      uploaded_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que subió el archivo'
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha y hora de subida'
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
    await queryInterface.addIndex('event_media', ['event_id'], {
      name: 'event_media_event_id_index'
    });

    await queryInterface.addIndex('event_media', ['type'], {
      name: 'event_media_type_index'
    });

    await queryInterface.addIndex('event_media', ['is_featured'], {
      name: 'event_media_is_featured_index'
    });

    await queryInterface.addIndex('event_media', ['uploaded_by'], {
      name: 'event_media_uploaded_by_index'
    });

    await queryInterface.addIndex('event_media', ['uploaded_at'], {
      name: 'event_media_uploaded_at_index'
    });

    await queryInterface.addIndex('event_media', ['sort_order'], {
      name: 'event_media_sort_order_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_media');
  }
};