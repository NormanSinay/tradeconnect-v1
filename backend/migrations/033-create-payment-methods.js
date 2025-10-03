'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_methods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        comment: 'ID del usuario propietario del método de pago'
      },
      gateway: {
        type: Sequelize.ENUM('paypal', 'stripe', 'neonet', 'bam'),
        allowNull: false,
        comment: 'Pasarela de pago que tokenizó el método'
      },
      gateway_token_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Token único de la pasarela (NUNCA mostrar en logs o respuestas)'
      },
      type: {
        type: Sequelize.ENUM('credit_card', 'debit_card', 'bank_account'),
        allowNull: false,
        comment: 'Tipo de método de pago'
      },
      card_last_four: {
        type: Sequelize.STRING(4),
        allowNull: true,
        comment: 'Últimos 4 dígitos de la tarjeta (para mostrar al usuario)'
      },
      card_brand: {
        type: Sequelize.ENUM('visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb'),
        allowNull: true,
        comment: 'Marca de la tarjeta de crédito'
      },
      card_expiry_month: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Mes de expiración de la tarjeta (1-12)'
      },
      card_expiry_year: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Año de expiración de la tarjeta (4 dígitos)'
      },
      bank_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre del banco para cuentas bancarias'
      },
      account_last_four: {
        type: Sequelize.STRING(4),
        allowNull: true,
        comment: 'Últimos 4 dígitos de la cuenta bancaria'
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si este es el método de pago por defecto del usuario'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el método de pago está activo'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Metadatos adicionales del método de pago'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación del método de pago'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de última actualización'
      }
    });

    // Índices
    await queryInterface.addIndex('payment_methods', ['gateway', 'gateway_token_id'], {
      unique: true,
      name: 'payment_methods_gateway_token_unique'
    });

    await queryInterface.addIndex('payment_methods', ['user_id'], {
      name: 'payment_methods_user_id_index'
    });

    await queryInterface.addIndex('payment_methods', ['gateway'], {
      name: 'payment_methods_gateway_index'
    });

    await queryInterface.addIndex('payment_methods', ['type'], {
      name: 'payment_methods_type_index'
    });

    await queryInterface.addIndex('payment_methods', ['is_default'], {
      name: 'payment_methods_is_default_index'
    });

    await queryInterface.addIndex('payment_methods', ['is_active'], {
      name: 'payment_methods_is_active_index'
    });

    await queryInterface.addIndex('payment_methods', ['created_at'], {
      name: 'payment_methods_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_methods');
  }
};