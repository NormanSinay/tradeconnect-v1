'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promotional_ads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Título del anuncio promocional'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del anuncio promocional'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Contenido completo del anuncio promocional'
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL de la imagen del anuncio'
      },
      video_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL del video del anuncio'
      },
      link_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL de destino del anuncio'
      },
      ad_type: {
        type: Sequelize.ENUM('banner', 'video', 'text', 'sponsored', 'popup'),
        allowNull: false,
        comment: 'Tipo de anuncio promocional'
      },
      target_platform: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Plataformas objetivo (array de strings)'
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Presupuesto del anuncio promocional'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ',
        comment: 'Moneda del presupuesto'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el anuncio está activo'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de inicio de la campaña'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de fin de la campaña'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad de ordenamiento'
      },
      target_audience: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Audiencia objetivo (array de strings)'
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Ubicación geográfica objetivo'
      },
      age_range: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Rango de edad objetivo (ej: "18-35")'
      },
      interests: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Intereses objetivo (array de strings)'
      },
      click_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de clics en el anuncio'
      },
      view_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de visualizaciones del anuncio'
      },
      conversion_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de conversiones del anuncio'
      },
      cost_per_click: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Costo por clic'
      },
      cost_per_view: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Costo por visualización'
      },
      total_spent: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total gastado en la campaña'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del anuncio'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Usuario que creó el anuncio'
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
    await queryInterface.addIndex('promotional_ads', ['ad_type'], {
      name: 'promotional_ads_ad_type_index'
    });

    await queryInterface.addIndex('promotional_ads', ['is_active'], {
      name: 'promotional_ads_is_active_index'
    });

    await queryInterface.addIndex('promotional_ads', ['priority'], {
      name: 'promotional_ads_priority_index'
    });

    await queryInterface.addIndex('promotional_ads', ['start_date'], {
      name: 'promotional_ads_start_date_index'
    });

    await queryInterface.addIndex('promotional_ads', ['end_date'], {
      name: 'promotional_ads_end_date_index'
    });

    await queryInterface.addIndex('promotional_ads', ['created_by'], {
      name: 'promotional_ads_created_by_index'
    });

    await queryInterface.addIndex('promotional_ads', ['created_at'], {
      name: 'promotional_ads_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promotional_ads');
  }
};
