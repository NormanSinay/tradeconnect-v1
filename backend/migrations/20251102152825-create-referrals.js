'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('referrals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del referido'
      },
      referral_code_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del código de referido usado',
        references: {
          model: 'referral_codes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      referrer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del usuario que refiere (referrer)',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      referred_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del usuario referido (referred)',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      type: {
        type: Sequelize.ENUM('REGISTRATION', 'PURCHASE', 'SUBSCRIPTION', 'EVENT_ATTENDANCE', 'CUSTOM'),
        allowNull: false,
        defaultValue: 'REGISTRATION',
        comment: 'Tipo de referido'
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'QUALIFIED', 'COMPLETED', 'CANCELLED', 'EXPIRED'),
        allowNull: false,
        defaultValue: 'PENDING',
        comment: 'Estado del referido'
      },
      qualified_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se calificó el referido'
      },
      completed_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se completó el referido'
      },
      expires_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de expiración del referido'
      },
      conversion_value: {
        type: Sequelize.DECIMAL(10, 2),
        comment: 'Valor de conversión (ej. monto de compra)'
      },
      commission_amount: {
        type: Sequelize.DECIMAL(10, 2),
        comment: 'Monto de comisión calculado'
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Metadatos adicionales del referido'
      },
      notes: {
        type: Sequelize.TEXT,
        comment: 'Notas adicionales sobre el referido'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices para optimización
    await queryInterface.addIndex('referrals', ['referral_code_id']);
    await queryInterface.addIndex('referrals', ['referrer_id']);
    await queryInterface.addIndex('referrals', ['referred_id']);
    await queryInterface.addIndex('referrals', ['type']);
    await queryInterface.addIndex('referrals', ['status']);
    await queryInterface.addIndex('referrals', ['qualified_at']);
    await queryInterface.addIndex('referrals', ['completed_at']);
    await queryInterface.addIndex('referrals', ['expires_at']);
    await queryInterface.addIndex('referrals', ['created_at']);

    // Índice único compuesto para evitar referidos duplicados
    await queryInterface.addIndex('referrals', ['referral_code_id', 'referred_id'], {
      unique: true,
      where: {
        deleted_at: null
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('referrals');
  }
};
