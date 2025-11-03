'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('levels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del nivel'
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'Número del nivel'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del nivel'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del nivel'
      },
      experience_required: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Experiencia requerida para alcanzar este nivel'
      },
      total_experience_required: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Experiencia total acumulada requerida para este nivel'
      },
      rewards: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Recompensas otorgadas al alcanzar el nivel'
      },
      bonuses: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Bonificaciones permanentes del nivel'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el nivel está activo'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Color del nivel en formato hexadecimal'
      },
      icon_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL del ícono del nivel'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del nivel'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de actualización'
      }
    });

    // Crear índices
    await queryInterface.addIndex('levels', ['experience_required']);
    await queryInterface.addIndex('levels', ['total_experience_required']);
    await queryInterface.addIndex('levels', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('levels');
  }
};
