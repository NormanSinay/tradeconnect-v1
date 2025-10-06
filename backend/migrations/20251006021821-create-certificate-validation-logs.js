'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('certificate_validation_logs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        comment: 'ID único del log de validación'
      },
      certificate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del certificado validado'
      },
      certificate_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Número del certificado validado'
      },
      validation_method: {
        type: Sequelize.ENUM('qr_scan', 'number_lookup', 'hash_lookup'),
        allowNull: false,
        comment: 'Método de validación usado'
      },
      is_valid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: 'Si la validación fue exitosa'
      },
      validation_result: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Resultado detallado de la validación'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'Dirección IP del solicitante'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent del navegador/dispositivo'
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Información de ubicación geográfica'
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Información del dispositivo'
      },
      captcha_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si se verificó CAPTCHA'
      },
      rate_limit_hit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si se alcanzó el límite de tasa'
      },
      response_time_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tiempo de respuesta en milisegundos'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensaje de error si falló la validación'
      },
      blockchain_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        comment: 'Si se verificó en blockchain'
      },
      blockchain_confirmations: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Número de confirmaciones en blockchain al momento de validación'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de la validación'
      }
    });

    // Índices
    await queryInterface.addIndex('certificate_validation_logs', ['certificate_id']);
    await queryInterface.addIndex('certificate_validation_logs', ['certificate_number']);
    await queryInterface.addIndex('certificate_validation_logs', ['validation_method']);
    await queryInterface.addIndex('certificate_validation_logs', ['is_valid']);
    await queryInterface.addIndex('certificate_validation_logs', ['ip_address']);
    await queryInterface.addIndex('certificate_validation_logs', ['created_at']);
    await queryInterface.addIndex('certificate_validation_logs', ['rate_limit_hit']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('certificate_validation_logs');
  }
};
