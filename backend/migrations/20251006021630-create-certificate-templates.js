'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('certificate_templates', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        comment: 'ID único del template de certificado'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre del template'
      },
      event_types: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Tipos de evento para los que aplica este template'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si el template está activo'
      },
      version: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '1.0.0',
        comment: 'Versión del template'
      },
      html_template: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Template HTML del certificado'
      },
      css_styles: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Estilos CSS del template'
      },
      required_variables: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Variables requeridas en el template'
      },
      configuration: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Configuración adicional (orientación, márgenes, etc.)'
      },
      logo_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL del logo institucional'
      },
      signature_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL de la firma digital'
      },
      background_color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        defaultValue: '#FFFFFF',
        comment: 'Color de fondo del certificado'
      },
      text_color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        defaultValue: '#000000',
        comment: 'Color del texto'
      },
      border_color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        defaultValue: '#000000',
        comment: 'Color del borde'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Usuario que creó el template'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Usuario que actualizó el template'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de creación'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices
    await queryInterface.addIndex('certificate_templates', ['active']);
    await queryInterface.addIndex('certificate_templates', ['created_by']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('certificate_templates');
  }
};
