'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Título del evento'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del evento'
      },
      short_description: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Descripción corta para listados'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de inicio del evento'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de fin del evento'
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ubicación del evento (dirección, sala, etc.)'
      },
      virtual_location: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Enlace para eventos virtuales'
      },
      is_virtual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es un evento virtual'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Precio del evento (0 = gratuito)'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ',
        comment: 'Moneda del precio'
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Capacidad máxima del evento'
      },
      registered_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número actual de registrados'
      },
      min_age: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Edad mínima requerida'
      },
      max_age: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Edad máxima permitida'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Etiquetas del evento (array de strings)'
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Requisitos para participar'
      },
      agenda: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Agenda del evento (array de sesiones)'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del evento'
      },
      event_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'event_types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Referencia al tipo de evento'
      },
      event_category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'event_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Referencia a la categoría del evento'
      },
      event_status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'event_statuses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Referencia al estado del evento'
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
        comment: 'Usuario que creó el evento'
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de publicación del evento'
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de cancelación del evento'
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón de cancelación'
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
    await queryInterface.addIndex('events', ['title'], {
      name: 'events_title_index'
    });

    await queryInterface.addIndex('events', ['start_date'], {
      name: 'events_start_date_index'
    });

    await queryInterface.addIndex('events', ['end_date'], {
      name: 'events_end_date_index'
    });

    await queryInterface.addIndex('events', ['event_type_id'], {
      name: 'events_event_type_id_index'
    });

    await queryInterface.addIndex('events', ['event_category_id'], {
      name: 'events_event_category_id_index'
    });

    await queryInterface.addIndex('events', ['event_status_id'], {
      name: 'events_event_status_id_index'
    });

    await queryInterface.addIndex('events', ['created_by'], {
      name: 'events_created_by_index'
    });

    await queryInterface.addIndex('events', ['is_virtual'], {
      name: 'events_is_virtual_index'
    });

    await queryInterface.addIndex('events', ['price'], {
      name: 'events_price_index'
    });

    await queryInterface.addIndex('events', ['published_at'], {
      name: 'events_published_at_index'
    });

    await queryInterface.addIndex('events', ['created_at'], {
      name: 'events_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('events');
  }
};