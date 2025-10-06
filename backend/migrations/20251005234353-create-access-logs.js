'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Referencia al evento'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Referencia al usuario que intentó acceder (null si no identificado)'
      },
      qr_code_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'qr_codes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Referencia al código QR usado (null para acceso manual)'
      },
      access_type: {
        type: Sequelize.ENUM('qr_scan', 'manual_entry', 'backup_code', 'failed_attempt', 'api_access'),
        allowNull: false,
        comment: 'Tipo de intento de acceso'
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp del intento de acceso'
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: true,
        comment: 'IP del dispositivo que realizó el intento'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent del navegador/dispositivo'
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Información del dispositivo (tipo, OS, browser)'
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Geolocalización aproximada (país, ciudad, región)'
      },
      result: {
        type: Sequelize.ENUM('success', 'failed', 'blocked', 'expired', 'invalid', 'duplicate', 'rate_limited'),
        allowNull: false,
        comment: 'Resultado del intento de acceso'
      },
      failure_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón detallada del fallo (solo para result = failed)'
      },
      scanned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario staff que realizó el escaneo/verificación'
      },
      access_point: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre/identificador del punto de acceso'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales del intento de acceso'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del intento de acceso'
      },
      severity: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'low',
        comment: 'Nivel de severidad del evento'
      },
      is_suspicious: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el intento parece sospechoso'
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
    await queryInterface.addIndex('access_logs', ['event_id'], {
      name: 'access_logs_event_id_index'
    });

    await queryInterface.addIndex('access_logs', ['user_id'], {
      name: 'access_logs_user_id_index'
    });

    await queryInterface.addIndex('access_logs', ['qr_code_id'], {
      name: 'access_logs_qr_code_id_index'
    });

    await queryInterface.addIndex('access_logs', ['access_type'], {
      name: 'access_logs_access_type_index'
    });

    await queryInterface.addIndex('access_logs', ['timestamp'], {
      name: 'access_logs_timestamp_index'
    });

    await queryInterface.addIndex('access_logs', ['result'], {
      name: 'access_logs_result_index'
    });

    await queryInterface.addIndex('access_logs', ['scanned_by'], {
      name: 'access_logs_scanned_by_index'
    });

    await queryInterface.addIndex('access_logs', ['severity'], {
      name: 'access_logs_severity_index'
    });

    await queryInterface.addIndex('access_logs', ['is_suspicious'], {
      name: 'access_logs_is_suspicious_index'
    });

    // Índices compuestos para consultas comunes
    await queryInterface.addIndex('access_logs', ['event_id', 'timestamp'], {
      name: 'access_logs_event_timestamp_index'
    });

    await queryInterface.addIndex('access_logs', ['event_id', 'result'], {
      name: 'access_logs_event_result_index'
    });

    await queryInterface.addIndex('access_logs', ['user_id', 'timestamp'], {
      name: 'access_logs_user_timestamp_index'
    });

    await queryInterface.addIndex('access_logs', ['event_id', 'is_suspicious'], {
      name: 'access_logs_event_suspicious_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('access_logs');
  }
};
