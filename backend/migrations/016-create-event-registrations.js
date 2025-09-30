'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_registrations', {
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
        onDelete: 'RESTRICT',
        comment: 'ID del evento'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID del usuario registrado'
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'cancelled', 'attended', 'no_show'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado de la inscripción'
      },
      registration_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos adicionales de la inscripción'
      },
      registration_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Número único de inscripción'
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'paid', 'refunded', 'cancelled'),
        allowNull: true,
        comment: 'Estado del pago (si aplica)'
      },
      payment_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Monto pagado'
      },
      payment_reference: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Referencia del pago'
      },
      check_in_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Hora de check-in al evento'
      },
      check_out_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Hora de check-out del evento'
      },
      registered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha y hora de inscripción'
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora de cancelación'
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
      }
    });

    // Índices
    await queryInterface.addIndex('event_registrations', ['event_id'], {
      name: 'event_registrations_event_id_index'
    });

    await queryInterface.addIndex('event_registrations', ['user_id'], {
      name: 'event_registrations_user_id_index'
    });

    await queryInterface.addIndex('event_registrations', ['status'], {
      name: 'event_registrations_status_index'
    });

    await queryInterface.addIndex('event_registrations', ['registration_number'], {
      unique: true,
      name: 'event_registrations_registration_number_unique'
    });

    await queryInterface.addIndex('event_registrations', ['payment_status'], {
      name: 'event_registrations_payment_status_index'
    });

    await queryInterface.addIndex('event_registrations', ['registered_at'], {
      name: 'event_registrations_registered_at_index'
    });

    await queryInterface.addIndex('event_registrations', ['check_in_time'], {
      name: 'event_registrations_check_in_time_index'
    });

    // Restricción única para evitar duplicados
    await queryInterface.addIndex('event_registrations', ['event_id', 'user_id'], {
      unique: true,
      name: 'event_registrations_event_user_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_registrations');
  }
};