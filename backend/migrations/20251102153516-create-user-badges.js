'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_badges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único de la relación user-badge'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del usuario que ganó el badge'
      },
      badge_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'badges',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del badge ganado'
      },
      earned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha cuando el usuario ganó el badge'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales de la obtención del badge'
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

    // Crear índices únicos y compuestos
    await queryInterface.addIndex('user_badges', ['user_id', 'badge_id'], {
      unique: true,
      name: 'user_badges_user_badge_unique',
      where: { deleted_at: null }
    });
    await queryInterface.addIndex('user_badges', ['user_id'], {
      name: 'user_badges_user_id'
    });
    await queryInterface.addIndex('user_badges', ['badge_id'], {
      name: 'user_badges_badge_id'
    });
    await queryInterface.addIndex('user_badges', ['earned_at'], {
      name: 'user_badges_earned_at'
    });
    await queryInterface.addIndex('user_badges', ['created_at'], {
      name: 'user_badges_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices
    await queryInterface.removeIndex('user_badges', 'user_badges_user_badge_unique');
    await queryInterface.removeIndex('user_badges', 'user_badges_user_id');
    await queryInterface.removeIndex('user_badges', 'user_badges_badge_id');
    await queryInterface.removeIndex('user_badges', 'user_badges_earned_at');
    await queryInterface.removeIndex('user_badges', 'user_badges_created_at');

    // Eliminar tabla
    await queryInterface.dropTable('user_badges');
  }
};
