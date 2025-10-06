'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
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
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Referencia al participante'
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
        comment: 'Referencia al código QR usado (null para asistencia manual)'
      },
      check_in_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp de entrada al evento'
      },
      check_out_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp de salida del evento (opcional)'
      },
      access_point: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre/identificador del punto de acceso'
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
        comment: 'Usuario staff que realizó el escaneo'
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Información del dispositivo que realizó el escaneo'
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: true,
        comment: 'IP del dispositivo que realizó el escaneo'
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Geolocalización del punto de acceso (lat, lng, accuracy)'
      },
      method: {
        type: Sequelize.ENUM('qr', 'manual', 'backup', 'offline'),
        allowNull: false,
        defaultValue: 'qr',
        comment: 'Método de registro de asistencia'
      },
      status: {
        type: Sequelize.ENUM('checked_in', 'checked_out', 'cancelled'),
        allowNull: false,
        defaultValue: 'checked_in',
        comment: 'Estado de la asistencia'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre la asistencia'
      },
      is_offline_sync: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el registro fue sincronizado desde modo offline'
      },
      synced_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de sincronización offline'
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
    await queryInterface.addIndex('attendances', ['event_id'], {
      name: 'attendances_event_id_index'
    });

    await queryInterface.addIndex('attendances', ['user_id'], {
      name: 'attendances_user_id_index'
    });

    await queryInterface.addIndex('attendances', ['qr_code_id'], {
      name: 'attendances_qr_code_id_index'
    });

    await queryInterface.addIndex('attendances', ['check_in_time'], {
      name: 'attendances_check_in_time_index'
    });

    await queryInterface.addIndex('attendances', ['scanned_by'], {
      name: 'attendances_scanned_by_index'
    });

    await queryInterface.addIndex('attendances', ['method'], {
      name: 'attendances_method_index'
    });

    await queryInterface.addIndex('attendances', ['status'], {
      name: 'attendances_status_index'
    });

    await queryInterface.addIndex('attendances', ['is_offline_sync'], {
      name: 'attendances_is_offline_sync_index'
    });

    // Índices compuestos para consultas comunes
    await queryInterface.addIndex('attendances', ['event_id', 'user_id'], {
      name: 'attendances_event_user_index',
      unique: true,
      where: { deleted_at: null }
    });

    await queryInterface.addIndex('attendances', ['event_id', 'check_in_time'], {
      name: 'attendances_event_checkin_index'
    });

    await queryInterface.addIndex('attendances', ['event_id', 'status'], {
      name: 'attendances_event_status_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attendances');
  }
};
