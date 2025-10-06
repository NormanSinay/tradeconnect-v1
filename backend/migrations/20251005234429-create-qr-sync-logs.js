'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('qr_sync_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      qr_code_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'qr_codes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Referencia al código QR sincronizado'
      },
      sync_status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'failed', 'conflict'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado de la sincronización'
      },
      blockchain_tx_hash: {
        type: Sequelize.STRING(66),
        allowNull: true,
        comment: 'Hash de transacción de blockchain resultante de la sincronización'
      },
      synced_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando se completó la sincronización'
      },
      sync_attempt_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos de sincronización realizados'
      },
      last_sync_error: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Último error de sincronización (si aplica)'
      },
      conflict_resolution: {
        type: Sequelize.ENUM('offline_wins', 'online_wins', 'manual_merge', 'discarded'),
        allowNull: true,
        comment: 'Cómo se resolvió el conflicto (si hubo)'
      },
      offline_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos registrados en modo offline'
      },
      online_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos existentes en el servidor online'
      },
      resolved_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos finales después de resolución de conflicto'
      },
      device_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Identificador único del dispositivo que realizó la sincronización'
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Información del dispositivo (tipo, OS, versión app)'
      },
      batch_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'ID del lote de sincronización (para agrupar registros relacionados)'
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'normal',
        comment: 'Prioridad de sincronización'
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
        comment: 'Usuario que inició la sincronización'
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
        comment: 'Usuario que actualizó el registro de sincronización'
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
    await queryInterface.addIndex('qr_sync_logs', ['qr_code_id'], {
      name: 'qr_sync_logs_qr_code_id_index'
    });

    await queryInterface.addIndex('qr_sync_logs', ['sync_status'], {
      name: 'qr_sync_logs_sync_status_index'
    });

    await queryInterface.addIndex('qr_sync_logs', ['synced_at'], {
      name: 'qr_sync_logs_synced_at_index'
    });

    await queryInterface.addIndex('qr_sync_logs', ['device_id'], {
      name: 'qr_sync_logs_device_id_index'
    });

    await queryInterface.addIndex('qr_sync_logs', ['batch_id'], {
      name: 'qr_sync_logs_batch_id_index'
    });

    await queryInterface.addIndex('qr_sync_logs', ['priority'], {
      name: 'qr_sync_logs_priority_index'
    });

    await queryInterface.addIndex('qr_sync_logs', ['created_by'], {
      name: 'qr_sync_logs_created_by_index'
    });

    // Índices compuestos para consultas comunes
    await queryInterface.addIndex('qr_sync_logs', ['qr_code_id', 'sync_status'], {
      name: 'qr_sync_logs_qr_status_index'
    });

    await queryInterface.addIndex('qr_sync_logs', ['device_id', 'synced_at'], {
      name: 'qr_sync_logs_device_synced_index'
    });

    await queryInterface.addIndex('qr_sync_logs', ['batch_id', 'sync_status'], {
      name: 'qr_sync_logs_batch_status_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('qr_sync_logs');
  }
};
