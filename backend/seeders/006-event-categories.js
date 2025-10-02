'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar categorías de eventos del sistema
    const eventCategories = [
      {
        name: 'business',
        display_name: 'Negocios',
        description: 'Eventos relacionados con emprendimiento, gestión y desarrollo empresarial',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'technology',
        display_name: 'Tecnología',
        description: 'Eventos sobre innovación tecnológica, software y hardware',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'marketing',
        display_name: 'Marketing',
        description: 'Eventos de marketing digital, publicidad y estrategias comerciales',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'finance',
        display_name: 'Finanzas',
        description: 'Eventos sobre finanzas, inversiones y gestión financiera',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'healthcare',
        display_name: 'Salud',
        description: 'Eventos relacionados con medicina, bienestar y salud pública',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'education',
        display_name: 'Educación',
        description: 'Eventos educativos, formación y desarrollo profesional',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'legal',
        display_name: 'Legal',
        description: 'Eventos sobre derecho, legislación y compliance',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'construction',
        display_name: 'Construcción',
        description: 'Eventos de construcción, arquitectura e ingeniería civil',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manufacturing',
        display_name: 'Manufactura',
        description: 'Eventos de manufactura, producción e industria',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'retail',
        display_name: 'Retail',
        description: 'Eventos de comercio minorista y experiencia del cliente',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'tourism',
        display_name: 'Turismo',
        description: 'Eventos relacionados con turismo y hospitalidad',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'agriculture',
        display_name: 'Agricultura',
        description: 'Eventos agrícolas, ganadería y desarrollo rural',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'energy',
        display_name: 'Energía',
        description: 'Eventos de energía, petróleo, gas y renovables',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'environment',
        display_name: 'Medio Ambiente',
        description: 'Eventos sobre sostenibilidad y medio ambiente',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'sports',
        display_name: 'Deportes',
        description: 'Eventos deportivos y recreativos',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'entertainment',
        display_name: 'Entretenimiento',
        description: 'Eventos de entretenimiento y cultura',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'government',
        display_name: 'Gobierno',
        description: 'Eventos gubernamentales y sector público',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'non_profit',
        display_name: 'ONG',
        description: 'Eventos de organizaciones sin fines de lucro',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'other',
        display_name: 'Otro',
        description: 'Categoría no clasificada en las opciones anteriores',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Verificar si ya existen categorías de eventos
    const [results] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM event_categories',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (results.count > 0) {
      console.log('Categorías de eventos ya existen, saltando inserción...');
      return;
    }

    // Insertar categorías de eventos si no existen
    await queryInterface.bulkInsert('event_categories', eventCategories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('event_categories', null, {});
  }
};