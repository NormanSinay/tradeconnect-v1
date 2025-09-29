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
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Nombre del usuario'
      },
      lastName: {
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
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el email está verificado'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la cuenta está activa'
      },
      is2FAEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si 2FA está habilitado'
      },
      otpCode: {
        type: Sequelize.STRING(6),
        allowNull: true,
        comment: 'Código OTP actual para 2FA'
      },
      otpExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiración del código OTP'
      },
      otpAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos fallidos de OTP'
      },
      failedLoginAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos fallidos de login'
      },
      lastFailedLogin: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha del último intento fallido de login'
      },
      isAccountLocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la cuenta está bloqueada'
      },
      accountLockedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando se bloqueó la cuenta'
      },
      lockExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando expira el bloqueo'
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha del último login exitoso'
      },
      lastLoginIP: {
        type: Sequelize.INET,
        allowNull: true,
        comment: 'IP del último login'
      },
      passwordChangedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha del último cambio de contraseña'
      },
      emailVerificationToken: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Token para verificación de email'
      },
      emailVerificationExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiración del token de verificación de email'
      },
      passwordResetToken: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Token para reset de contraseña'
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiración del token de reset de contraseña'
      },
      marketingAccepted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Aceptó emails de marketing'
      },
      termsAcceptedAt: {
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
      },
      deletedAt: {
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

    await queryInterface.addIndex('users', ['isActive'], {
      name: 'users_is_active_index'
    });

    await queryInterface.addIndex('users', ['lastLoginAt'], {
      name: 'users_last_login_at_index'
    });

    await queryInterface.addIndex('users', ['createdAt'], {
      name: 'users_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
