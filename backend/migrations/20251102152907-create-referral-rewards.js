'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('referral_rewards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único de la recompensa'
      },
      referral_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del referido',
        references: {
          model: 'referrals',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del usuario que recibe la recompensa',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      type: {
        type: Sequelize.ENUM('CASH', 'CREDIT', 'DISCOUNT', 'FREE_PRODUCT', 'FREE_SERVICE', 'POINTS', 'BADGE', 'CUSTOM'),
        allowNull: false,
        comment: 'Tipo de recompensa'
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'PROCESSED', 'DELIVERED', 'CANCELLED', 'EXPIRED', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING',
        comment: 'Estado de la recompensa'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        comment: 'Monto/cantidad de la recompensa'
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'GTQ',
        comment: 'Moneda de la recompensa'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Descripción de la recompensa'
      },
      reward_data: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Datos específicos de la recompensa'
      },
      approved_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se aprobó la recompensa'
      },
      processed_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se procesó la recompensa'
      },
      delivered_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se entregó la recompensa'
      },
      expires_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de expiración de la recompensa'
      },
      notes: {
        type: Sequelize.TEXT,
        comment: 'Notas adicionales sobre la recompensa'
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
    await queryInterface.addIndex('referral_rewards', ['referral_id']);
    await queryInterface.addIndex('referral_rewards', ['user_id']);
    await queryInterface.addIndex('referral_rewards', ['type']);
    await queryInterface.addIndex('referral_rewards', ['status']);
    await queryInterface.addIndex('referral_rewards', ['approved_at']);
    await queryInterface.addIndex('referral_rewards', ['processed_at']);
    await queryInterface.addIndex('referral_rewards', ['delivered_at']);
    await queryInterface.addIndex('referral_rewards', ['expires_at']);
    await queryInterface.addIndex('referral_rewards', ['created_at']);
    await queryInterface.addIndex('referral_rewards', ['user_id', 'status']);
    await queryInterface.addIndex('referral_rewards', ['referral_id', 'status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('referral_rewards');
  }
};
