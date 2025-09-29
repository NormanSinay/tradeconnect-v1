'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        comment: 'Identificador único de la sesión'
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
        comment: 'ID del usuario propietario de la sesión'
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: false,
        comment: 'Dirección IP del cliente'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'User-Agent del navegador'
      },
      device_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'unknown',
        comment: 'Tipo de dispositivo detectado'
      },
      device_os: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Unknown OS',
        comment: 'Sistema operativo detectado'
      },
      device_browser: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Unknown Browser',
        comment: 'Navegador detectado'
      },
      location_country: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'País detectado por geolocalización IP'
      },
      location_city: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Ciudad detectada por geolocalización IP'
      },
      location_region: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Región detectada por geolocalización IP'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la sesión está activa'
      },
      is_current: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es la sesión actual del request'
      },
      last_activity: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Última actividad registrada'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de expiración de la sesión'
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Token de refresco para la sesión'
      },
      refresh_token_expires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración del refresh token'
      },
      login_method: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'password',
        comment: 'Método de autenticación utilizado'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación de la sesión'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de última actualización'
      }
    });

    // Índices
    await queryInterface.addIndex('sessions', ['session_id'], {
      unique: true,
      name: 'sessions_session_id_unique'
    });

    await queryInterface.addIndex('sessions', ['user_id'], {
      name: 'sessions_user_id_index'
    });

    await queryInterface.addIndex('sessions', ['ip_address'], {
      name: 'sessions_ip_address_index'
    });

    await queryInterface.addIndex('sessions', ['is_active'], {
      name: 'sessions_is_active_index'
    });

    await queryInterface.addIndex('sessions', ['last_activity'], {
      name: 'sessions_last_activity_index'
    });

    await queryInterface.addIndex('sessions', ['expires_at'], {
      name: 'sessions_expires_at_index'
    });

    await queryInterface.addIndex('sessions', ['created_at'], {
      name: 'sessions_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sessions');
  }
};