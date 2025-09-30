'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_duplications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      source_event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID del evento original'
      },
      duplicated_event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID del evento duplicado'
      },
      duplicated_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que realizó la duplicación'
      },
      duplicated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha y hora de la duplicación'
      },
      modifications: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Modificaciones realizadas al evento duplicado'
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
    await queryInterface.addIndex('event_duplications', ['source_event_id'], {
      name: 'event_duplications_source_event_id_index'
    });

    await queryInterface.addIndex('event_duplications', ['duplicated_event_id'], {
      unique: true,
      name: 'event_duplications_duplicated_event_id_unique'
    });

    await queryInterface.addIndex('event_duplications', ['duplicated_by'], {
      name: 'event_duplications_duplicated_by_index'
    });

    await queryInterface.addIndex('event_duplications', ['duplicated_at'], {
      name: 'event_duplications_duplicated_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_duplications');
  }
};