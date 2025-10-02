'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('speaker_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      payment_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Número único del pago (PAY-YYYY-NNNN)'
      },
      contract_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'contracts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Referencia al contrato'
      },
      speaker_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'speakers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Referencia al speaker (redundante pero útil para queries)'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto del pago en Quetzales'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ',
        comment: 'Moneda del pago'
      },
      payment_type: {
        type: Sequelize.ENUM('advance', 'final', 'installment'),
        allowNull: false,
        defaultValue: 'final',
        comment: 'Tipo de pago'
      },
      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha programada del pago'
      },
      actual_payment_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha real del pago'
      },
      payment_method: {
        type: Sequelize.ENUM('bank_transfer', 'check', 'cash', 'paypal', 'other'),
        allowNull: false,
        defaultValue: 'bank_transfer',
        comment: 'Método de pago'
      },
      reference_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Referencia bancaria o número de transacción'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado del pago'
      },
      isr_withheld: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Monto de ISR retenido'
      },
      isr_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Porcentaje de ISR aplicado (5% o 7%)'
      },
      net_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Monto neto después de retenciones'
      },
      receipt_file: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ruta del comprobante de pago'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales del pago'
      },
      processed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que procesó el pago'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de procesamiento'
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
        comment: 'Usuario que creó el registro de pago'
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
    await queryInterface.addIndex('speaker_payments', ['payment_number'], {
      name: 'speaker_payments_payment_number_index',
      unique: true
    });

    await queryInterface.addIndex('speaker_payments', ['contract_id'], {
      name: 'speaker_payments_contract_id_index'
    });

    await queryInterface.addIndex('speaker_payments', ['speaker_id'], {
      name: 'speaker_payments_speaker_id_index'
    });

    await queryInterface.addIndex('speaker_payments', ['status'], {
      name: 'speaker_payments_status_index'
    });

    await queryInterface.addIndex('speaker_payments', ['scheduled_date'], {
      name: 'speaker_payments_scheduled_date_index'
    });

    await queryInterface.addIndex('speaker_payments', ['actual_payment_date'], {
      name: 'speaker_payments_actual_payment_date_index'
    });

    await queryInterface.addIndex('speaker_payments', ['payment_method'], {
      name: 'speaker_payments_payment_method_index'
    });

    await queryInterface.addIndex('speaker_payments', ['processed_by'], {
      name: 'speaker_payments_processed_by_index'
    });

    await queryInterface.addIndex('speaker_payments', ['created_by'], {
      name: 'speaker_payments_created_by_index'
    });

    await queryInterface.addIndex('speaker_payments', ['created_at'], {
      name: 'speaker_payments_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('speaker_payments');
  }
};