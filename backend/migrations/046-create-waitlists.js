'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('waitlists', {
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
        comment: 'Referencia al evento'
      },
      access_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'access_types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Tipo de acceso específico (opcional)'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Usuario en lista de espera'
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Posición en la cola (1 = primero)'
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'NOTIFIED', 'CONFIRMED', 'EXPIRED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
        comment: 'Estado de la entrada en lista de espera'
      },
      notified_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de notificación de disponibilidad'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración de la oferta'
      },
      confirmed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de confirmación'
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de cancelación'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales (preferencias, notas, etc.)'
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
    await queryInterface.addIndex('waitlists', ['event_id'], {
      name: 'waitlists_event_id_index'
    });

    await queryInterface.addIndex('waitlists', ['access_type_id'], {
      name: 'waitlists_access_type_id_index'
    });

    await queryInterface.addIndex('waitlists', ['user_id'], {
      name: 'waitlists_user_id_index'
    });

    await queryInterface.addIndex('waitlists', ['status'], {
      name: 'waitlists_status_index'
    });

    await queryInterface.addIndex('waitlists', ['position'], {
      name: 'waitlists_position_index'
    });

    await queryInterface.addIndex('waitlists', ['event_id', 'status'], {
      name: 'waitlists_event_status_index'
    });

    await queryInterface.addIndex('waitlists', ['expires_at'], {
      name: 'waitlists_expires_at_index'
    });

    await queryInterface.addIndex('waitlists', ['created_at'], {
      name: 'waitlists_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('waitlists');
  }
};