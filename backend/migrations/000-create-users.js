'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Email único del usuario'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Contraseña hasheada'
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Nombre del usuario'
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Apellido del usuario'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Teléfono del usuario (formato Guatemala)'
      },
      avatar: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL del avatar del usuario'
      },
      nit: {
        type: Sequelize.STRING(15),
        allowNull: true,
        comment: 'NIT guatemalteco'
      },
      cui: {
        type: Sequelize.STRING(13),
        allowNull: true,
        comment: 'CUI guatemalteco'
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el email está verificado'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la cuenta está activa'
      },
      is_2fa_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si 2FA está habilitado'
      },
      otp_code: {
        type: Sequelize.STRING(6),
        allowNull: true,
        comment: 'Código OTP actual para 2FA'
      },
      otp_expires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiración del código OTP'
      },
      otp_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos fallidos de OTP'
      },
      failed_login_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos fallidos de login'
      },
      last_failed_login: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha del último intento fallido de login'
      },
      is_account_locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la cuenta está bloqueada'
      },
      account_locked_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando se bloqueó la cuenta'
      },
      lock_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando expira el bloqueo'
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha del último login exitoso'
      },
      last_login_ip: {
        type: Sequelize.INET,
        allowNull: true,
        comment: 'IP del último login'
      },
      password_changed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha del último cambio de contraseña'
      },
      email_verification_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Token para verificación de email'
      },
      email_verification_expires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiración del token de verificación de email'
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Token para reset de contraseña'
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiración del token de reset de contraseña'
      },
      marketing_accepted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Aceptó emails de marketing'
      },
      terms_accepted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de aceptación de términos y condiciones'
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'America/Guatemala',
        comment: 'Zona horaria del usuario'
      },
      locale: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: 'es',
        comment: 'Idioma preferido'
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });

    await queryInterface.addIndex('users', ['nit'], {
      where: { nit: { [Sequelize.Op.ne]: null } },
      name: 'users_nit_index'
    });

    await queryInterface.addIndex('users', ['cui'], {
      where: { cui: { [Sequelize.Op.ne]: null } },
      name: 'users_cui_index'
    });

    await queryInterface.addIndex('users', ['is_active'], {
      name: 'users_is_active_index'
    });

    await queryInterface.addIndex('users', ['last_login_at'], {
      name: 'users_last_login_at_index'
    });

    await queryInterface.addIndex('users', ['created_at'], {
      name: 'users_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
