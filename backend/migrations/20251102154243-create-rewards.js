'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rewards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único de la recompensa'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre técnico único de la recompensa'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Título visible de la recompensa'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Descripción detallada de la recompensa'
      },
      type: {
        type: Sequelize.ENUM('discount', 'badge', 'title', 'access', 'physical', 'digital', 'experience'),
        allowNull: false,
        comment: 'Tipo de recompensa'
      },
      category: {
        type: Sequelize.ENUM('loyalty', 'achievement', 'seasonal', 'promotional', 'special'),
        allowNull: false,
        comment: 'Categoría de la recompensa'
      },
      value: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Valor específico de la recompensa'
      },
      cost: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Costo en puntos de lealtad para canjear'
      },
      rarity: {
        type: Sequelize.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
        allowNull: false,
        comment: 'Rareza de la recompensa'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la recompensa está activa'
      },
      is_limited: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la recompensa tiene límite de canjes'
      },
      max_claims: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Máximo número de canjes permitidos'
      },
      claims_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número actual de canjes realizados'
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
      conditions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Condiciones adicionales para canjear'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales de la recompensa'
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
    await queryInterface.addIndex('rewards', ['type']);
    await queryInterface.addIndex('rewards', ['category']);
    await queryInterface.addIndex('rewards', ['rarity']);
    await queryInterface.addIndex('rewards', ['cost']);
    await queryInterface.addIndex('rewards', ['is_active']);
    await queryInterface.addIndex('rewards', ['is_limited']);
    await queryInterface.addIndex('rewards', ['start_date']);
    await queryInterface.addIndex('rewards', ['end_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rewards');
  }
};
