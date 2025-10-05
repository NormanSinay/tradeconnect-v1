'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_sessions', {
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
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Título de la sesión'
      },
      description: {
        type: Sequelize.TEXT,
        comment: 'Descripción detallada de la sesión'
      },
      session_type: {
        type: Sequelize.ENUM('date', 'time_slot', 'workshop', 'track', 'other'),
        allowNull: false,
        comment: 'Tipo de sesión'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de inicio de la sesión'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de fin de la sesión'
      },
      capacity: {
        type: Sequelize.INTEGER,
        comment: 'Capacidad máxima de la sesión'
      },
      available_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Capacidad disponible actual (calculada)'
      },
      blocked_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Capacidad bloqueada temporalmente'
      },
      location: {
        type: Sequelize.TEXT,
        comment: 'Ubicación física de la sesión'
      },
      virtual_location: {
        type: Sequelize.TEXT,
        comment: 'Enlace para sesiones virtuales'
      },
      is_virtual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la sesión es virtual'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        comment: 'Precio específico de la sesión (null = precio del evento)'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ',
        comment: 'Moneda del precio'
      },
      requirements: {
        type: Sequelize.TEXT,
        comment: 'Requisitos específicos de la sesión'
      },
      metadata: {
        type: Sequelize.JSON,
        comment: 'Metadatos adicionales de la sesión'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la sesión está activa'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Índices
    await queryInterface.addIndex('event_sessions', ['event_id']);
    await queryInterface.addIndex('event_sessions', ['session_type']);
    await queryInterface.addIndex('event_sessions', ['start_date']);
    await queryInterface.addIndex('event_sessions', ['end_date']);
    await queryInterface.addIndex('event_sessions', ['is_active']);
    await queryInterface.addIndex('event_sessions', ['created_by']);
    await queryInterface.addIndex('event_sessions', ['created_at']);

    // Índice único compuesto
    await queryInterface.addIndex('event_sessions', ['event_id', 'title'], {
      unique: true,
      where: {
        deleted_at: null
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_sessions');
  }
};