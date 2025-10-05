'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'min_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Precio mínimo del evento (floor price para descuentos)'
    });

    // Índice para consultas de precio mínimo
    await queryInterface.addIndex('events', ['min_price'], {
      name: 'events_min_price_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('events', 'events_min_price_index');
    await queryInterface.removeColumn('events', 'min_price');
  }
};