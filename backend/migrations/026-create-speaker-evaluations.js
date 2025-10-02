'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('speaker_evaluations', {
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
        comment: 'Referencia al speaker evaluado'
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
        comment: 'Referencia al evento donde participó'
      },
      evaluator_type: {
        type: Sequelize.ENUM('organizer', 'attendee', 'both'),
        allowNull: false,
        defaultValue: 'organizer',
        comment: 'Tipo de evaluador'
      },
      evaluator_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que realizó la evaluación (si aplica)'
      },
      overall_rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        },
        comment: 'Rating general (1-5 estrellas)'
      },
      criteria_ratings: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Ratings por criterio específico (JSON con dominio_tema, comunicacion, puntualidad, etc.)'
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000]
        },
        comment: 'Comentarios cualitativos (máx. 1000 caracteres)'
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la evaluación es pública'
      },
      evaluation_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de la evaluación'
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
    await queryInterface.addIndex('speaker_evaluations', ['speaker_id'], {
      name: 'speaker_evaluations_speaker_id_index'
    });

    await queryInterface.addIndex('speaker_evaluations', ['event_id'], {
      name: 'speaker_evaluations_event_id_index'
    });

    await queryInterface.addIndex('speaker_evaluations', ['evaluator_id'], {
      name: 'speaker_evaluations_evaluator_id_index'
    });

    await queryInterface.addIndex('speaker_evaluations', ['overall_rating'], {
      name: 'speaker_evaluations_overall_rating_index'
    });

    await queryInterface.addIndex('speaker_evaluations', ['is_public'], {
      name: 'speaker_evaluations_is_public_index'
    });

    await queryInterface.addIndex('speaker_evaluations', ['evaluation_date'], {
      name: 'speaker_evaluations_evaluation_date_index'
    });

    await queryInterface.addIndex('speaker_evaluations', ['created_at'], {
      name: 'speaker_evaluations_created_at_index'
    });

    // Índice único para evitar múltiples evaluaciones del mismo evaluador para el mismo speaker-evento
    await queryInterface.addIndex('speaker_evaluations', ['speaker_id', 'event_id', 'evaluator_id'], {
      name: 'speaker_evaluations_unique_evaluation_index',
      unique: true,
      where: {
        evaluator_id: {
          [Sequelize.Op.ne]: null
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('speaker_evaluations');
  }
};