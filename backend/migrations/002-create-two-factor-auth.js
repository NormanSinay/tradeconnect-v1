'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('two_factor_auth', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del usuario'
      },
      secret: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Secret para TOTP'
      },
      backupCodes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Códigos de respaldo hasheados (JSON)'
      },
      method: {
        type: Sequelize.ENUM('totp', 'sms', 'email'),
        allowNull: false,
        defaultValue: 'totp',
        comment: 'Método de 2FA utilizado'
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Número de teléfono para SMS 2FA'
      },
      emailAddress: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Email alternativo para 2FA'
      },
      isEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si 2FA está habilitado'
      },
      isLocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si está bloqueado por intentos fallidos'
      },
      failedAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos fallidos'
      },
      lastUsedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Última vez que se usó 2FA'
      },
      lockedUntil: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha hasta la que está bloqueado'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización'
      }
    });

    // Índices
    await queryInterface.addIndex('two_factor_auth', ['userId'], {
      unique: true,
      name: 'two_factor_auth_user_id_unique'
    });

    await queryInterface.addIndex('two_factor_auth', ['isEnabled'], {
      name: 'two_factor_auth_is_enabled_index'
    });

    await queryInterface.addIndex('two_factor_auth', ['method'], {
      name: 'two_factor_auth_method_index'
    });

    await queryInterface.addIndex('two_factor_auth', ['isLocked'], {
      name: 'two_factor_auth_is_locked_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('two_factor_auth');
  }
};