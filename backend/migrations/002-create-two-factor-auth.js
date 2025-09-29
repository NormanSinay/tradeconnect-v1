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
      user_id: {
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
      backup_codes: {
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
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Número de teléfono para SMS 2FA'
      },
      email_address: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Email alternativo para 2FA'
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si 2FA está habilitado'
      },
      is_locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si está bloqueado por intentos fallidos'
      },
      failed_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos fallidos'
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Última vez que se usó 2FA'
      },
      locked_until: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha hasta la que está bloqueado'
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
      }
    });

    // Índices
    await queryInterface.addIndex('two_factor_auth', ['user_id'], {
      unique: true,
      name: 'two_factor_auth_user_id_unique'
    });

    await queryInterface.addIndex('two_factor_auth', ['is_enabled'], {
      name: 'two_factor_auth_is_enabled_index'
    });

    await queryInterface.addIndex('two_factor_auth', ['method'], {
      name: 'two_factor_auth_method_index'
    });

    await queryInterface.addIndex('two_factor_auth', ['is_locked'], {
      name: 'two_factor_auth_is_locked_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('two_factor_auth');
  }
};