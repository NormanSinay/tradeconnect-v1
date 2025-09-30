'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar estados de eventos del sistema
    const eventStatuses = [
      {
        name: 'draft',
        display_name: 'Borrador',
        description: 'Evento en proceso de creación, no visible públicamente',
        color: '#6B7280',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'review',
        display_name: 'En Revisión',
        description: 'Evento enviado para revisión antes de publicación',
        color: '#F59E0B',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'approved',
        display_name: 'Aprobado',
        description: 'Evento aprobado pero aún no publicado',
        color: '#10B981',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'published',
        display_name: 'Publicado',
        description: 'Evento publicado y visible para el público',
        color: '#3B82F6',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'ongoing',
        display_name: 'En Progreso',
        description: 'Evento actualmente en desarrollo',
        color: '#8B5CF6',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'completed',
        display_name: 'Completado',
        description: 'Evento finalizado exitosamente',
        color: '#059669',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'cancelled',
        display_name: 'Cancelado',
        description: 'Evento cancelado antes de su realización',
        color: '#EF4444',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'postponed',
        display_name: 'Pospuesto',
        description: 'Evento reprogramado para una fecha futura',
        color: '#F97316',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'archived',
        display_name: 'Archivado',
        description: 'Evento finalizado y archivado',
        color: '#6B7280',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('event_statuses', eventStatuses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('event_statuses', null, {});
  }
};