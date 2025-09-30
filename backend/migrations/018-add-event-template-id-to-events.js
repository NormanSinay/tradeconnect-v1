'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'event_template_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'event_templates',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Referencia a la plantilla usada para crear el evento (opcional)'
    });

    // Agregar índice
    await queryInterface.addIndex('events', ['event_template_id'], {
      name: 'events_event_template_id_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('events', 'events_event_template_id_index');
    await queryInterface.removeColumn('events', 'event_template_id');
  }
};