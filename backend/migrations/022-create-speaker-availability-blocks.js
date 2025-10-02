'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('speaker_availability_blocks', {
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
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de inicio del bloqueo'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de fin del bloqueo'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón del bloqueo (vacaciones, otro evento, etc.)'
      },
      is_recurring: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es un bloqueo recurrente'
      },
      recurrence_pattern: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        allowNull: true,
        comment: 'Patrón de recurrencia si aplica'
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
        comment: 'Usuario que creó el bloqueo'
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
      }
    });

    // Índices
    await queryInterface.addIndex('speaker_availability_blocks', ['speaker_id'], {
      name: 'speaker_availability_blocks_speaker_id_index'
    });

    await queryInterface.addIndex('speaker_availability_blocks', ['start_date'], {
      name: 'speaker_availability_blocks_start_date_index'
    });

    await queryInterface.addIndex('speaker_availability_blocks', ['end_date'], {
      name: 'speaker_availability_blocks_end_date_index'
    });

    await queryInterface.addIndex('speaker_availability_blocks', ['is_recurring'], {
      name: 'speaker_availability_blocks_is_recurring_index'
    });

    await queryInterface.addIndex('speaker_availability_blocks', ['created_by'], {
      name: 'speaker_availability_blocks_created_by_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('speaker_availability_blocks');
  }
};