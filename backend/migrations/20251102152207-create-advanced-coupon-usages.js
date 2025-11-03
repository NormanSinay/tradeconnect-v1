'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('advanced_coupon_usages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del uso del cupón'
      },
      advanced_coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del cupón avanzado usado',
        references: {
          model: 'advanced_coupons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del usuario que usó el cupón',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      order_id: {
        type: Sequelize.STRING(255),
        comment: 'ID de la orden donde se aplicó el cupón'
      },
      status: {
        type: Sequelize.ENUM('APPLIED', 'CANCELLED', 'REFUNDED'),
        allowNull: false,
        defaultValue: 'APPLIED',
        comment: 'Estado del uso del cupón'
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto del descuento aplicado'
      },
      original_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto original antes del descuento'
      },
      final_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto final después del descuento'
      },
      context: {
        type: Sequelize.JSON,
        comment: 'Contexto adicional del uso del cupón'
      },
      applied_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha cuando se aplicó el cupón'
      },
      cancelled_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se canceló el uso'
      },
      refunded_at: {
        type: Sequelize.DATE,
        comment: 'Fecha cuando se reembolsó el descuento'
      },
      notes: {
        type: Sequelize.TEXT,
        comment: 'Notas adicionales sobre el uso'
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
      }
    });

    // Índices para optimización
    await queryInterface.addIndex('advanced_coupon_usages', ['advanced_coupon_id']);
    await queryInterface.addIndex('advanced_coupon_usages', ['user_id']);
    await queryInterface.addIndex('advanced_coupon_usages', ['order_id']);
    await queryInterface.addIndex('advanced_coupon_usages', ['status']);
    await queryInterface.addIndex('advanced_coupon_usages', ['applied_at']);
    await queryInterface.addIndex('advanced_coupon_usages', ['advanced_coupon_id', 'user_id']);
    await queryInterface.addIndex('advanced_coupon_usages', ['advanced_coupon_id', 'status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('advanced_coupon_usages');
  }
};
