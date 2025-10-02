'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('speakers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del speaker'
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Apellido del speaker'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Email del speaker'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Teléfono del speaker'
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'País de origen'
      },
      nit: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'NIT guatemalteco'
      },
      cui: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'CUI guatemalteco'
      },
      rtu: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'RTU guatemalteco'
      },
      profile_image: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ruta de la foto de perfil'
      },
      short_bio: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Biografía corta (máx. 200 caracteres)'
      },
      full_bio: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Biografía extendida (máx. 2000 caracteres)'
      },
      linkedin_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Perfil de LinkedIn'
      },
      twitter_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Perfil de Twitter'
      },
      website_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Sitio web personal/profesional'
      },
      base_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Tarifa base por hora/evento/día en GTQ'
      },
      rate_type: {
        type: Sequelize.ENUM('hourly', 'daily', 'event'),
        allowNull: false,
        defaultValue: 'hourly',
        comment: 'Tipo de tarifa: por hora, día o evento completo'
      },
      modalities: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: ['presential'],
        comment: 'Modalidades disponibles: presential, virtual, hybrid'
      },
      languages: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: ['spanish'],
        comment: 'Idiomas que maneja'
      },
      cv_file: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ruta del archivo CV/portafolio'
      },
      category: {
        type: Sequelize.ENUM('national', 'international', 'expert', 'special_guest'),
        allowNull: false,
        defaultValue: 'national',
        comment: 'Categoría del speaker'
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Rating promedio (1-5 estrellas)'
      },
      total_events: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de eventos realizados'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el speaker está activo'
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de verificación administrativa'
      },
      verified_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que verificó el perfil'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que creó el registro'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que actualizó el registro'
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
    await queryInterface.addIndex('speakers', ['email'], {
      name: 'speakers_email_index',
      unique: true
    });

    await queryInterface.addIndex('speakers', ['nit'], {
      name: 'speakers_nit_index',
      unique: true,
      where: {
        nit: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    await queryInterface.addIndex('speakers', ['category'], {
      name: 'speakers_category_index'
    });

    await queryInterface.addIndex('speakers', ['rating'], {
      name: 'speakers_rating_index'
    });

    await queryInterface.addIndex('speakers', ['is_active'], {
      name: 'speakers_is_active_index'
    });

    await queryInterface.addIndex('speakers', ['created_by'], {
      name: 'speakers_created_by_index'
    });

    await queryInterface.addIndex('speakers', ['verified_at'], {
      name: 'speakers_verified_at_index'
    });

    await queryInterface.addIndex('speakers', ['created_at'], {
      name: 'speakers_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('speakers');
  }
};