'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('qr_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      event_registration_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'event_registrations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Referencia a la inscripción del evento'
      },
      qr_data: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Datos encriptados del QR (registrationId, eventId, participantId, hash, timestamp)'
      },
      qr_hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: 'Hash SHA-256 del contenido del QR para verificación'
      },
      status: {
        type: Sequelize.ENUM('active', 'used', 'expired', 'invalidated'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Estado del código QR'
      },
      generated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de generación del QR'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración del QR'
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando se usó el QR'
      },
      invalidated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de invalidación del QR'
      },
      blockchain_tx_hash: {
        type: Sequelize.STRING(66),
        allowNull: true,
        comment: 'Hash de transacción de blockchain donde se registró el QR'
      },
      invalidation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón de invalidación del QR'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que generó el QR'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que actualizó el QR'
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

    // Índices para performance
    await queryInterface.addIndex('qr_codes', ['event_registration_id'], {
      name: 'qr_codes_event_registration_id_index'
    });

    await queryInterface.addIndex('qr_codes', ['qr_hash'], {
      name: 'qr_codes_qr_hash_index',
      unique: true
    });

    await queryInterface.addIndex('qr_codes', ['status'], {
      name: 'qr_codes_status_index'
    });

    await queryInterface.addIndex('qr_codes', ['generated_at'], {
      name: 'qr_codes_generated_at_index'
    });

    await queryInterface.addIndex('qr_codes', ['expires_at'], {
      name: 'qr_codes_expires_at_index'
    });

    await queryInterface.addIndex('qr_codes', ['blockchain_tx_hash'], {
      name: 'qr_codes_blockchain_tx_hash_index'
    });

    await queryInterface.addIndex('qr_codes', ['created_by'], {
      name: 'qr_codes_created_by_index'
    });

    // Índice compuesto para consultas comunes
    await queryInterface.addIndex('qr_codes', ['event_registration_id', 'status'], {
      name: 'qr_codes_registration_status_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('qr_codes');
  }
};
