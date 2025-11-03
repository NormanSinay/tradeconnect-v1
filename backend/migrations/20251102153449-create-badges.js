'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('badges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del badge'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre único del badge'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del badge'
      },
      icon_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL del ícono del badge'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Color del badge en formato hexadecimal'
      },
      category: {
        type: Sequelize.ENUM('achievement', 'milestone', 'loyalty', 'special', 'seasonal'),
        allowNull: false,
        comment: 'Categoría del badge'
      },
      rarity: {
        type: Sequelize.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
        allowNull: false,
        comment: 'Rareza del badge'
      },
      points_required: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Puntos de lealtad requeridos para obtener el badge'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el badge está activo y disponible'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del badge'
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Crear índices
    await queryInterface.addIndex('badges', ['category'], {
      name: 'badges_category'
    });
    await queryInterface.addIndex('badges', ['rarity'], {
      name: 'badges_rarity'
    });
    await queryInterface.addIndex('badges', ['points_required'], {
      name: 'badges_points_required'
    });
    await queryInterface.addIndex('badges', ['is_active'], {
      name: 'badges_is_active'
    });
    await queryInterface.addIndex('badges', ['created_at'], {
      name: 'badges_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices
    await queryInterface.removeIndex('badges', 'badges_category');
    await queryInterface.removeIndex('badges', 'badges_rarity');
    await queryInterface.removeIndex('badges', 'badges_points_required');
    await queryInterface.removeIndex('badges', 'badges_is_active');
    await queryInterface.removeIndex('badges', 'badges_created_at');

    // Eliminar tabla
    await queryInterface.dropTable('badges');
  }
};
