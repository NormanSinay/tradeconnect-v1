'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('banners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Título del banner'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del banner'
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'URL de la imagen del banner'
      },
      link_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL de destino al hacer clic en el banner'
      },
      position: {
        type: Sequelize.ENUM('header', 'sidebar', 'footer', 'homepage', 'event-page'),
        allowNull: false,
        comment: 'Posición donde se muestra el banner'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el banner está activo'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de inicio de visualización del banner'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de fin de visualización del banner'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad de ordenamiento (mayor = más prioritario)'
      },
      target_audience: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Audiencia objetivo (array de strings)'
      },
      click_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de clics en el banner'
      },
      view_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de visualizaciones del banner'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del banner'
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices
    await queryInterface.addIndex('banners', ['position'], {
      name: 'banners_position_index'
    });

    await queryInterface.addIndex('banners', ['is_active'], {
      name: 'banners_is_active_index'
    });

    await queryInterface.addIndex('banners', ['priority'], {
      name: 'banners_priority_index'
    });

    await queryInterface.addIndex('banners', ['start_date'], {
      name: 'banners_start_date_index'
    });

    await queryInterface.addIndex('banners', ['end_date'], {
      name: 'banners_end_date_index'
    });

    await queryInterface.addIndex('banners', ['created_at'], {
      name: 'banners_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('banners');
  }
};
