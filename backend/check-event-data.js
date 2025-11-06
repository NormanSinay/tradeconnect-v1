/**
 * Script para verificar los datos de los eventos en la base de datos
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tradeconnect_dev',
  process.env.DB_USER || 'tradeconnect_user',
  process.env.DB_PASSWORD || 'tradeconnect123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false
  }
);

async function checkEventData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Consultar los eventos publicados
    const [events] = await sequelize.query(`
      SELECT
        e.id,
        e.title,
        e.start_date,
        e.end_date,
        e.location,
        e.virtual_location,
        e.is_virtual,
        e.price,
        e.min_price,
        e.capacity,
        e.registered_count,
        e.description,
        e.short_description,
        e.published_at,
        e.event_status_id,
        ec.name as category_name,
        et.name as type_name
      FROM events e
      LEFT JOIN event_categories ec ON e.event_category_id = ec.id
      LEFT JOIN event_types et ON e.event_type_id = et.id
      WHERE e.published_at IS NOT NULL
      ORDER BY e.id
    `);

    console.log(`📊 Total eventos publicados: ${events.length}\n`);

    events.forEach((event, index) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎯 Evento ${index + 1}: ${event.title} (ID: ${event.id})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📅 Fecha inicio: ${event.start_date || 'NO DEFINIDA ❌'}`);
      console.log(`📅 Fecha fin: ${event.end_date || 'NO DEFINIDA ❌'}`);
      console.log(`📍 Ubicación: ${event.location || 'NO DEFINIDA'}`);
      console.log(`💻 Ubicación virtual: ${event.virtual_location || 'NO DEFINIDA'}`);
      console.log(`🌐 Es virtual: ${event.is_virtual ? 'Sí' : 'No'}`);
      console.log(`💰 Precio: ${event.price || 'NO DEFINIDO'}`);
      console.log(`💵 Precio mínimo: ${event.min_price || 'NO DEFINIDO'}`);
      console.log(`👥 Capacidad: ${event.capacity || 'NO DEFINIDA'}`);
      console.log(`✅ Registrados: ${event.registered_count || 0}`);
      console.log(`📂 Categoría: ${event.category_name || 'NO DEFINIDA'}`);
      console.log(`🏷️ Tipo: ${event.type_name || 'NO DEFINIDO'}`);
      console.log(`📝 Descripción: ${event.description ? 'SÍ' : 'NO'}`);
      console.log(`📝 Descripción corta: ${event.short_description ? 'SÍ' : 'NO'}`);
      console.log(`✨ Publicado: ${event.published_at || 'NO'}`);
      console.log(`📊 Estado ID: ${event.event_status_id || 'NO DEFINIDO'}`);
    });

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 RESUMEN DE PROBLEMAS ENCONTRADOS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const eventsWithoutStartDate = events.filter(e => !e.start_date);
    const eventsWithoutLocation = events.filter(e => !e.location && !e.virtual_location);
    const eventsWithoutPrice = events.filter(e => !e.price && !e.min_price);

    if (eventsWithoutStartDate.length > 0) {
      console.log(`\n❌ ${eventsWithoutStartDate.length} evento(s) sin fecha de inicio:`);
      eventsWithoutStartDate.forEach(e => console.log(`   - ${e.title} (ID: ${e.id})`));
    }

    if (eventsWithoutLocation.length > 0) {
      console.log(`\n⚠️ ${eventsWithoutLocation.length} evento(s) sin ubicación:`);
      eventsWithoutLocation.forEach(e => console.log(`   - ${e.title} (ID: ${e.id})`));
    }

    if (eventsWithoutPrice.length > 0) {
      console.log(`\n⚠️ ${eventsWithoutPrice.length} evento(s) sin precio:`);
      eventsWithoutPrice.forEach(e => console.log(`   - ${e.title} (ID: ${e.id})`));
    }

    if (eventsWithoutStartDate.length === 0 && eventsWithoutLocation.length === 0 && eventsWithoutPrice.length === 0) {
      console.log('\n✅ Todos los eventos tienen datos completos');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkEventData();
