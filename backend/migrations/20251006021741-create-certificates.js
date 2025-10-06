'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('certificates', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        comment: 'ID único del certificado'
      },
      certificate_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Número único del certificado (ej: CERT-2025-001234)'
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del evento'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del usuario/participante'
      },
      registration_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID de la inscripción'
      },
      template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del template usado'
      },
      certificate_type: {
        type: Sequelize.ENUM('attendance', 'completion', 'achievement'),
        allowNull: false,
        defaultValue: 'attendance',
        comment: 'Tipo de certificado'
      },
      status: {
        type: Sequelize.ENUM('active', 'revoked', 'expired'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Estado del certificado'
      },
      issued_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de emisión del certificado'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración del certificado'
      },
      pdf_hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: 'Hash SHA-256 del archivo PDF'
      },
      pdf_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL del archivo PDF'
      },
      pdf_size_bytes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tamaño del archivo PDF en bytes'
      },
      qr_code: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Código QR en formato base64 o URL'
      },
      qr_hash: {
        type: Sequelize.STRING(64),
        allowNull: true,
        comment: 'Hash del código QR para verificación'
      },
      blockchain_tx_hash: {
        type: Sequelize.STRING(66),
        allowNull: true,
        comment: 'Hash de transacción de blockchain'
      },
      blockchain_block_number: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Número del bloque donde se registró'
      },
      blockchain_network: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'sepolia_testnet',
        comment: 'Red blockchain usada'
      },
      blockchain_contract_address: {
        type: Sequelize.STRING(42),
        allowNull: true,
        comment: 'Dirección del contrato inteligente'
      },
      blockchain_gas_used: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Gas utilizado en la transacción'
      },
      blockchain_gas_price: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
        comment: 'Precio del gas en wei/gwei'
      },
      blockchain_total_cost: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
        comment: 'Costo total de gas en ETH'
      },
      blockchain_confirmations: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Número de confirmaciones en blockchain'
      },
      participant_data: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Datos del participante (nombre, DPI, email, etc.)'
      },
      event_data: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Datos del evento (nombre, fecha, duración, etc.)'
      },
      certificate_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos adicionales del certificado'
      },
      eligibility_criteria: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Criterios de elegibilidad cumplidos'
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de revocación'
      },
      revoked_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Usuario que revocó el certificado'
      },
      revocation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Motivo de la revocación'
      },
      download_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de veces descargado'
      },
      last_downloaded_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Última fecha de descarga'
      },
      verification_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de verificaciones realizadas'
      },
      last_verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Última fecha de verificación'
      },
      email_sent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si se envió por email'
      },
      email_sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de envío por email'
      },
      email_resend_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de reenvíos por email'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Usuario que creó el certificado'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Usuario que actualizó el certificado'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de creación'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices
    await queryInterface.addIndex('certificates', ['certificate_number'], { unique: true });
    await queryInterface.addIndex('certificates', ['event_id']);
    await queryInterface.addIndex('certificates', ['user_id']);
    await queryInterface.addIndex('certificates', ['registration_id']);
    await queryInterface.addIndex('certificates', ['template_id']);
    await queryInterface.addIndex('certificates', ['status']);
    await queryInterface.addIndex('certificates', ['pdf_hash']);
    await queryInterface.addIndex('certificates', ['blockchain_tx_hash']);
    await queryInterface.addIndex('certificates', ['issued_at']);
    await queryInterface.addIndex('certificates', ['created_by']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('certificates');
  }
};
