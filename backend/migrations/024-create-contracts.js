'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contracts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contract_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Número único del contrato (CTR-YYYY-NNNN)'
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
        comment: 'Referencia al speaker'
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
        comment: 'Referencia al evento'
      },
      agreed_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto acordado en Quetzales'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ',
        comment: 'Moneda del contrato'
      },
      payment_terms: {
        type: Sequelize.ENUM('full_payment', 'advance_payment', 'installments'),
        allowNull: false,
        defaultValue: 'full_payment',
        comment: 'Forma de pago'
      },
      advance_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Porcentaje de anticipo si aplica'
      },
      advance_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Monto del anticipo calculado'
      },
      terms_conditions: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Términos y condiciones específicos'
      },
      custom_clauses: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Cláusulas personalizadas (array de strings)'
      },
      status: {
        type: Sequelize.ENUM('draft', 'sent', 'signed', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
        comment: 'Estado del contrato'
      },
      signed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de firma del contrato'
      },
      contract_file: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ruta del archivo PDF del contrato firmado'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón de rechazo si aplica'
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón de cancelación si aplica'
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Referencia a la plantilla usada (si se implementa)'
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
        comment: 'Usuario que creó el contrato'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que aprobó el contrato'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de aprobación'
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
    await queryInterface.addIndex('contracts', ['contract_number'], {
      name: 'contracts_contract_number_index',
      unique: true
    });

    await queryInterface.addIndex('contracts', ['speaker_id'], {
      name: 'contracts_speaker_id_index'
    });

    await queryInterface.addIndex('contracts', ['event_id'], {
      name: 'contracts_event_id_index'
    });

    await queryInterface.addIndex('contracts', ['status'], {
      name: 'contracts_status_index'
    });

    await queryInterface.addIndex('contracts', ['signed_at'], {
      name: 'contracts_signed_at_index'
    });

    await queryInterface.addIndex('contracts', ['created_by'], {
      name: 'contracts_created_by_index'
    });

    await queryInterface.addIndex('contracts', ['approved_by'], {
      name: 'contracts_approved_by_index'
    });

    await queryInterface.addIndex('contracts', ['created_at'], {
      name: 'contracts_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contracts');
  }
};