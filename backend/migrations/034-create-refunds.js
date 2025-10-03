'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refunds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      refund_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'ID único de reembolso generado internamente'
      },
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID del pago asociado al reembolso'
      },
      gateway_refund_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID de reembolso en la pasarela externa'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto del reembolso'
      },
      fee: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Comisión cobrada por el reembolso'
      },
      net_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto neto del reembolso después de deducir comisiones'
      },
      reason: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Razón del reembolso'
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Descripción detallada del reembolso'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado actual del reembolso'
      },
      gateway_response: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Respuesta completa de la pasarela de pago'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Metadatos adicionales del reembolso'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando el reembolso fue procesado'
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
    await queryInterface.addIndex('refunds', ['refund_id'], {
      unique: true,
      name: 'refunds_refund_id_unique'
    });

    await queryInterface.addIndex('refunds', ['payment_id', 'gateway_refund_id'], {
      unique: true,
      where: { gateway_refund_id: { [Sequelize.Op.ne]: null } },
      name: 'refunds_payment_gateway_unique'
    });

    await queryInterface.addIndex('refunds', ['payment_id'], {
      name: 'refunds_payment_id_index'
    });

    await queryInterface.addIndex('refunds', ['status'], {
      name: 'refunds_status_index'
    });

    await queryInterface.addIndex('refunds', ['processed_at'], {
      name: 'refunds_processed_at_index'
    });

    await queryInterface.addIndex('refunds', ['created_at'], {
      name: 'refunds_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refunds');
  }
};