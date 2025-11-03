'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('referral_tracking', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del seguimiento'
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
        onDelete: 'CASCADE'
      },
      event: {
        type: Sequelize.ENUM(
          'CODE_VIEWED',
          'LINK_CLICKED',
          'REGISTRATION_STARTED',
          'REGISTRATION_COMPLETED',
          'PURCHASE_MADE',
          'SUBSCRIPTION_STARTED',
          'EVENT_REGISTERED',
          'EVENT_ATTENDED',
          'QUALIFICATION_TRIGGERED',
          'REWARD_EARNED',
          'CUSTOM_EVENT'
        ),
        allowNull: false,
        comment: 'Tipo de evento de seguimiento'
      },
      user_id: {
        type: Sequelize.INTEGER,
        comment: 'ID del usuario que realizó la acción (opcional)',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      ip_address: {
        type: Sequelize.INET,
        comment: 'Dirección IP del usuario'
      },
      user_agent: {
        type: Sequelize.TEXT,
        comment: 'User agent del navegador/dispositivo'
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Metadatos adicionales del evento'
      },
      event_value: {
        type: Sequelize.DECIMAL(10, 2),
        comment: 'Valor asociado al evento (ej. monto de compra)'
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
    await queryInterface.addIndex('referral_tracking', ['referral_id']);
    await queryInterface.addIndex('referral_tracking', ['event']);
    await queryInterface.addIndex('referral_tracking', ['user_id']);
    await queryInterface.addIndex('referral_tracking', ['created_at']);
    await queryInterface.addIndex('referral_tracking', ['referral_id', 'event']);
    await queryInterface.addIndex('referral_tracking', ['referral_id', 'created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('referral_tracking');
  }
};
