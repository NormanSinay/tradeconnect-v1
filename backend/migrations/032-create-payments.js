'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'ID único de transacción generado internamente'
      },
      registration_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'registrations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID de la inscripción asociada al pago'
      },
      gateway: {
        type: Sequelize.ENUM('paypal', 'stripe', 'neonet', 'bam'),
        allowNull: false,
        comment: 'Pasarela de pago utilizada'
      },
      gateway_transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID de transacción en la pasarela externa'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed', 'expired'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado actual del pago'
      },
      payment_type: {
        type: Sequelize.ENUM('one_time', 'recurring', 'installment', 'deposit'),
        allowNull: false,
        comment: 'Tipo de pago (único, recurrente, cuotas, depósito)'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto del pago en la moneda especificada'
      },
      currency: {
        type: Sequelize.ENUM('GTQ', 'USD'),
        allowNull: false,
        comment: 'Moneda del pago'
      },
      fee: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Comisión cobrada por la pasarela'
      },
      net_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto neto después de deducir comisiones'
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Descripción del pago'
      },
      billing_info: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Información de facturación en formato JSON'
      },
      payment_method: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Información del método de pago (tokenizada, sin datos sensibles)'
      },
      gateway_response: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Respuesta completa de la pasarela de pago'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Metadatos adicionales del pago'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de reintentos realizados'
      },
      last_retry_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha del último reintento'
      },
      confirmed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando el pago fue confirmado'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración del pago (para pagos pendientes)'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación del registro'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de última actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices
    await queryInterface.addIndex('payments', ['transaction_id'], {
      unique: true,
      name: 'payments_transaction_id_unique'
    });

    await queryInterface.addIndex('payments', ['gateway', 'gateway_transaction_id'], {
      unique: true,
      where: { gateway_transaction_id: { [Sequelize.Op.ne]: null } },
      name: 'payments_gateway_transaction_unique'
    });

    await queryInterface.addIndex('payments', ['registration_id'], {
      name: 'payments_registration_id_index'
    });

    await queryInterface.addIndex('payments', ['gateway'], {
      name: 'payments_gateway_index'
    });

    await queryInterface.addIndex('payments', ['status'], {
      name: 'payments_status_index'
    });

    await queryInterface.addIndex('payments', ['payment_type'], {
      name: 'payments_payment_type_index'
    });

    await queryInterface.addIndex('payments', ['created_at'], {
      name: 'payments_created_at_index'
    });

    await queryInterface.addIndex('payments', ['confirmed_at'], {
      name: 'payments_confirmed_at_index'
    });

    await queryInterface.addIndex('payments', ['expires_at'], {
      name: 'payments_expires_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};