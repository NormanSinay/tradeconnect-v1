'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('speaker_events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      speaker_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'speakers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Referencia al speaker'
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
      role: {
        type: Sequelize.ENUM('keynote_speaker', 'panelist', 'facilitator', 'moderator', 'guest'),
        allowNull: false,
        defaultValue: 'guest',
        comment: 'Rol del speaker en el evento'
      },
      participation_start: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de inicio de participación'
      },
      participation_end: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de fin de participación'
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Duración en minutos de la participación'
      },
      modality: {
        type: Sequelize.ENUM('presential', 'virtual', 'hybrid'),
        allowNull: false,
        defaultValue: 'presential',
        comment: 'Modalidad de participación'
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Orden de aparición si hay múltiples speakers'
      },
      status: {
        type: Sequelize.ENUM('tentative', 'confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'tentative',
        comment: 'Estado de la asignación'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas internas sobre la participación'
      },
      confirmed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de confirmación del speaker'
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de cancelación'
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón de cancelación'
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
        comment: 'Usuario que creó la asignación'
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
        comment: 'Usuario que actualizó la asignación'
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
    await queryInterface.addIndex('speaker_events', ['speaker_id'], {
      name: 'speaker_events_speaker_id_index'
    });

    await queryInterface.addIndex('speaker_events', ['event_id'], {
      name: 'speaker_events_event_id_index'
    });

    await queryInterface.addIndex('speaker_events', ['role'], {
      name: 'speaker_events_role_index'
    });

    await queryInterface.addIndex('speaker_events', ['status'], {
      name: 'speaker_events_status_index'
    });

    await queryInterface.addIndex('speaker_events', ['participation_start'], {
      name: 'speaker_events_participation_start_index'
    });

    await queryInterface.addIndex('speaker_events', ['participation_end'], {
      name: 'speaker_events_participation_end_index'
    });

    await queryInterface.addIndex('speaker_events', ['modality'], {
      name: 'speaker_events_modality_index'
    });

    await queryInterface.addIndex('speaker_events', ['confirmed_at'], {
      name: 'speaker_events_confirmed_at_index'
    });

    await queryInterface.addIndex('speaker_events', ['created_by'], {
      name: 'speaker_events_created_by_index'
    });

    // Índice único compuesto para evitar asignaciones duplicadas activas
    await queryInterface.addIndex('speaker_events', ['speaker_id', 'event_id'], {
      name: 'speaker_events_unique_active_index',
      unique: true,
      where: {
        deleted_at: null
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('speaker_events');
  }
};