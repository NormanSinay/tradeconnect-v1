'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar tipos de eventos del sistema
    const eventTypes = [
      {
        name: 'conference',
        display_name: 'Conferencia',
        description: 'Evento de conferencias con múltiples speakers y sesiones',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'workshop',
        display_name: 'Taller',
        description: 'Sesión práctica e interactiva con participación activa',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'seminar',
        display_name: 'Seminario',
        description: 'Sesión educativa especializada en un tema específico',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'webinar',
        display_name: 'Webinar',
        description: 'Evento en línea transmitido por internet',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'networking',
        display_name: 'Networking',
        description: 'Evento para establecer contactos profesionales',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'trade_show',
        display_name: 'Feria Comercial',
        description: 'Exposición comercial con stands y demostraciones',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'panel_discussion',
        display_name: 'Panel de Discusión',
        description: 'Debate moderado con expertos en un tema',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'training',
        display_name: 'Capacitación',
        description: 'Sesión de formación y desarrollo profesional',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'launch_event',
        display_name: 'Evento de Lanzamiento',
        description: 'Presentación oficial de productos o servicios',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'social_event',
        display_name: 'Evento Social',
        description: 'Evento recreativo o celebración corporativa',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'hybrid',
        display_name: 'Evento Híbrido',
        description: 'Evento que combina presencia física y virtual',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'other',
        display_name: 'Otro',
        description: 'Tipo de evento no clasificado en las categorías anteriores',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('event_types', eventTypes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('event_types', null, {});
  }
};