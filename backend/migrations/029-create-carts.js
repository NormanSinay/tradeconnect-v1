'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      sessionId: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'ID de sesión único para el carrito'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      totalItems: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      promoCode: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      promoDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de expiración del carrito (24 horas)'
      },
      lastActivity: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      isAbandoned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      abandonedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Índices para optimización
    await queryInterface.addIndex('carts', ['sessionId'], {
      unique: true,
      name: 'idx_carts_session'
    });
    await queryInterface.addIndex('carts', ['userId'], {
      name: 'idx_carts_user'
    });
    await queryInterface.addIndex('carts', ['expiresAt'], {
      name: 'idx_carts_expires'
    });
    await queryInterface.addIndex('carts', ['isAbandoned'], {
      name: 'idx_carts_abandoned'
    });
    await queryInterface.addIndex('carts', ['lastActivity'], {
      name: 'idx_carts_activity'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('carts');
  }
};