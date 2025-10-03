'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('abandoned_carts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cartId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sessionId: {
        type: Sequelize.STRING(100),
        allowNull: false
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
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      totalItems: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      totalValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      cartData: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Snapshot completo del carrito abandonado'
      },
      abandonedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      lastActivity: {
        type: Sequelize.DATE,
        allowNull: false
      },
      recoveryAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lastRecoveryAttempt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      recoveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      recoveryMethod: {
        type: Sequelize.ENUM('email', 'sms', 'push', 'manual'),
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      deviceType: {
        type: Sequelize.ENUM('desktop', 'mobile', 'tablet', 'unknown'),
        allowNull: true
      },
      browser: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      referrer: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      utmSource: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      utmMedium: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      utmCampaign: {
        type: Sequelize.STRING(100),
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
    await queryInterface.addIndex('abandoned_carts', ['cartId'], {
      name: 'idx_abandoned_carts_cart'
    });
    await queryInterface.addIndex('abandoned_carts', ['sessionId'], {
      name: 'idx_abandoned_carts_session'
    });
    await queryInterface.addIndex('abandoned_carts', ['userId'], {
      name: 'idx_abandoned_carts_user'
    });
    await queryInterface.addIndex('abandoned_carts', ['email'], {
      name: 'idx_abandoned_carts_email'
    });
    await queryInterface.addIndex('abandoned_carts', ['abandonedAt'], {
      name: 'idx_abandoned_carts_abandoned'
    });
    await queryInterface.addIndex('abandoned_carts', ['recoveredAt'], {
      name: 'idx_abandoned_carts_recovered'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('abandoned_carts');
  }
};