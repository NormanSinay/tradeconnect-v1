'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Modificar las columnas participation_start y participation_end para que sean opcionales
    await queryInterface.changeColumn('speaker_events', 'participation_start', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha y hora de inicio de participación (opcional)'
    });

    await queryInterface.changeColumn('speaker_events', 'participation_end', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha y hora de fin de participación (opcional)'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios (hacer las columnas requeridas nuevamente)
    await queryInterface.changeColumn('speaker_events', 'participation_start', {
      type: Sequelize.DATE,
      allowNull: false,
      comment: 'Fecha y hora de inicio de participación'
    });

    await queryInterface.changeColumn('speaker_events', 'participation_end', {
      type: Sequelize.DATE,
      allowNull: false,
      comment: 'Fecha y hora de fin de participación'
    });
  }
};
