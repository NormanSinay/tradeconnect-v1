'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('achievements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del achievement'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre técnico único del achievement'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Título visible del achievement'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Descripción del achievement'
      },
      icon_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL del ícono del achievement'
      },
      category: {
        type: Sequelize.ENUM('social', 'learning', 'commerce', 'engagement', 'milestone', 'special'),
        allowNull: false,
        comment: 'Categoría del achievement'
      },
      rarity: {
        type: Sequelize.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
        allowNull: false,
        comment: 'Rareza del achievement'
      },
      points_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Puntos de lealtad otorgados'
      },
      experience_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Experiencia otorgada'
      },
      trigger_type: {
        type: Sequelize.ENUM('action', 'milestone', 'streak', 'collection', 'social', 'time_based'),
        allowNull: false,
        comment: 'Tipo de trigger que activa el achievement'
      },
      trigger_conditions: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Condiciones para activar el achievement'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el achievement está activo'
      },
      is_hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es un achievement oculto'
      },
      max_unlocks: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Máximo número de desbloqueos por usuario'
      },
      cooldown_hours: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Horas de cooldown entre desbloqueos'
      },
      prerequisites: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'IDs de achievements requeridos como prerrequisitos'
      },
      rewards: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Recompensas adicionales del achievement'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del achievement'
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
    await queryInterface.addIndex('achievements', ['category']);
    await queryInterface.addIndex('achievements', ['rarity']);
    await queryInterface.addIndex('achievements', ['trigger_type']);
    await queryInterface.addIndex('achievements', ['is_active']);
    await queryInterface.addIndex('achievements', ['is_hidden']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('achievements');
  }
};
