'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único de la quest'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Título de la quest'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Descripción detallada de la quest'
      },
      type: {
        type: Sequelize.ENUM('achievement', 'challenge', 'daily', 'weekly', 'event', 'social'),
        allowNull: false,
        comment: 'Tipo de quest'
      },
      category: {
        type: Sequelize.ENUM('learning', 'social', 'commerce', 'engagement', 'loyalty'),
        allowNull: false,
        comment: 'Categoría de la quest'
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard', 'expert'),
        allowNull: false,
        comment: 'Dificultad de la quest'
      },
      points_reward: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Puntos de lealtad otorgados al completar'
      },
      experience_reward: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Experiencia otorgada al completar'
      },
      badge_reward: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre del badge otorgado al completar'
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Requisitos para desbloquear la quest'
      },
      objectives: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Lista de objetivos a completar'
      },
      time_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Límite de tiempo en minutos'
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Máximo número de intentos permitidos'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la quest está activa'
      },
      is_repeatable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la quest puede repetirse'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de inicio de disponibilidad'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de fin de disponibilidad'
      },
      prerequisites: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'IDs de quests requeridas como prerrequisitos'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales de la quest'
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
    await queryInterface.addIndex('quests', ['type']);
    await queryInterface.addIndex('quests', ['category']);
    await queryInterface.addIndex('quests', ['difficulty']);
    await queryInterface.addIndex('quests', ['is_active']);
    await queryInterface.addIndex('quests', ['is_repeatable']);
    await queryInterface.addIndex('quests', ['start_date']);
    await queryInterface.addIndex('quests', ['end_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('quests');
  }
};
