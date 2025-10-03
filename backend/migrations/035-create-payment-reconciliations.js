'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_reconciliations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reconciliation_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'ID único de reconciliación generado internamente'
      },
      gateway: {
        type: Sequelize.ENUM('paypal', 'stripe', 'neonet', 'bam'),
        allowNull: false,
        comment: 'Pasarela de pago reconciliada'
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha de inicio del período de reconciliación'
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha de fin del período de reconciliación'
      },
      total_gateway_transactions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de transacciones reportadas por la pasarela'
      },
      total_local_transactions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de transacciones registradas localmente'
      },
      total_discrepancies: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de discrepancias encontradas'
      },
      discrepancies: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Detalles de las discrepancias encontradas'
      },
      status: {
        type: Sequelize.ENUM('completed', 'failed'),
        allowNull: false,
        comment: 'Estado de la reconciliación'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensaje de error si la reconciliación falló'
      },
      generated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora cuando se generó el reporte de reconciliación'
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
      }
    });

    // Índices
    await queryInterface.addIndex('payment_reconciliations', ['reconciliation_id'], {
      unique: true,
      name: 'payment_reconciliations_reconciliation_id_unique'
    });

    await queryInterface.addIndex('payment_reconciliations', ['gateway'], {
      name: 'payment_reconciliations_gateway_index'
    });

    await queryInterface.addIndex('payment_reconciliations', ['status'], {
      name: 'payment_reconciliations_status_index'
    });

    await queryInterface.addIndex('payment_reconciliations', ['start_date', 'end_date'], {
      name: 'payment_reconciliations_date_range_index'
    });

    await queryInterface.addIndex('payment_reconciliations', ['generated_at'], {
      name: 'payment_reconciliations_generated_at_index'
    });

    await queryInterface.addIndex('payment_reconciliations', ['created_at'], {
      name: 'payment_reconciliations_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_reconciliations');
  }
};