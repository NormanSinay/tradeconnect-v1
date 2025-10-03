'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cart_sessions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      sessionId: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
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
      deviceFingerprint: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Fingerprint del dispositivo para sincronización'
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'Dirección IP del usuario'
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      lastActivity: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('cart_sessions', ['sessionId'], {
      unique: true,
      name: 'idx_cart_sessions_session'
    });
    await queryInterface.addIndex('cart_sessions', ['userId'], {
      name: 'idx_cart_sessions_user'
    });
    await queryInterface.addIndex('cart_sessions', ['deviceFingerprint'], {
      name: 'idx_cart_sessions_fingerprint'
    });
    await queryInterface.addIndex('cart_sessions', ['expiresAt'], {
      name: 'idx_cart_sessions_expires'
    });
    await queryInterface.addIndex('cart_sessions', ['isActive'], {
      name: 'idx_cart_sessions_active'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cart_sessions');
  }
};