'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blockchain_hashes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID de la entidad en la base de datos local (qr_code, attendance, etc.)'
      },
      entity_type: {
        type: Sequelize.ENUM('qr_code', 'attendance', 'certificate', 'event', 'user'),
        allowNull: false,
        comment: 'Tipo de entidad que se registró en blockchain'
      },
      hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: 'Hash SHA-256 del contenido registrado en blockchain'
      },
      tx_hash: {
        type: Sequelize.STRING(66),
        allowNull: true,
        comment: 'Hash de la transacción de blockchain'
      },
      block_number: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Número del bloque donde se confirmó la transacción'
      },
      block_timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp del bloque en blockchain'
      },
      network: {
        type: Sequelize.ENUM('ethereum_mainnet', 'sepolia_testnet', 'goerli_testnet', 'polygon_mainnet', 'polygon_mumbai'),
        allowNull: false,
        defaultValue: 'sepolia_testnet',
        comment: 'Red blockchain donde se registró el hash'
      },
      contract_address: {
        type: Sequelize.STRING(42),
        allowNull: true,
        comment: 'Dirección del smart contract usado'
      },
      gas_used: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Gas utilizado en la transacción'
      },
      gas_price: {
        type: Sequelize.DECIMAL(36, 18),
        allowNull: true,
        comment: 'Precio del gas en wei/gwei'
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'failed', 'orphaned'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado de la transacción en blockchain'
      },
      confirmation_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de confirmaciones de la transacción'
      },
      required_confirmations: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 12,
        comment: 'Número de confirmaciones requeridas'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de reintentos realizados'
      },
      max_retries: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: 'Máximo número de reintentos permitidos'
      },
      last_retry_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha del último intento de registro'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensaje de error si el registro falló'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales de la transacción'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que inició el registro en blockchain'
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
    await queryInterface.addIndex('blockchain_hashes', ['entity_id', 'entity_type'], {
      name: 'blockchain_hashes_entity_index',
      unique: true
    });

    await queryInterface.addIndex('blockchain_hashes', ['hash'], {
      name: 'blockchain_hashes_hash_index'
    });

    await queryInterface.addIndex('blockchain_hashes', ['tx_hash'], {
      name: 'blockchain_hashes_tx_hash_index',
      unique: true
    });

    await queryInterface.addIndex('blockchain_hashes', ['block_number'], {
      name: 'blockchain_hashes_block_number_index'
    });

    await queryInterface.addIndex('blockchain_hashes', ['network'], {
      name: 'blockchain_hashes_network_index'
    });

    await queryInterface.addIndex('blockchain_hashes', ['contract_address'], {
      name: 'blockchain_hashes_contract_address_index'
    });

    await queryInterface.addIndex('blockchain_hashes', ['status'], {
      name: 'blockchain_hashes_status_index'
    });

    await queryInterface.addIndex('blockchain_hashes', ['confirmation_count'], {
      name: 'blockchain_hashes_confirmation_count_index'
    });

    await queryInterface.addIndex('blockchain_hashes', ['created_by'], {
      name: 'blockchain_hashes_created_by_index'
    });

    // Índices compuestos para consultas comunes
    await queryInterface.addIndex('blockchain_hashes', ['entity_type', 'status'], {
      name: 'blockchain_hashes_entity_status_index'
    });

    await queryInterface.addIndex('blockchain_hashes', ['network', 'status'], {
      name: 'blockchain_hashes_network_status_index'
    });

    await queryInterface.addIndex('blockchain_hashes', ['status', 'confirmation_count'], {
      name: 'blockchain_hashes_status_confirmations_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blockchain_hashes');
  }
};
