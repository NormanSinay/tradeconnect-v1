/**
 * Script para probar el endpoint de eventos del dashboard de usuario
 */
const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tradeconnect_dev',
  process.env.DB_USER || 'tradeconnect_user',
  process.env.DB_PASSWORD || 'tradeconnect123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function testUserEventsEndpoint() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');

    // Simular la query que hace el controller
    console.log('🔍 Ejecutando query simulada del controller...\n');

    const query = `
      SELECT
        e.*,
        ec.name as "eventCategory.name",
        et.name as "eventType.name",
        es.name as "eventStatus.name"
      FROM events e
      LEFT JOIN event_categories ec ON e.event_category_id = ec.id
      LEFT JOIN event_types et ON e.event_type_id = et.id
      LEFT JOIN event_statuses es ON e.event_status_id = es.id
      WHERE e.published_at IS NOT NULL
        AND es.name = 'published'
      ORDER BY e.start_date ASC
    `;

    const [events] = await sequelize.query(query);

    console.log(`📊 Resultado: ${events.length} evento(s) encontrado(s)\n`);

    if (events.length === 0) {
      console.log('❌ NO SE ENCONTRARON EVENTOS\n');
      console.log('Causas posibles:');
      console.log('  1. Los eventos no tienen published_at');
      console.log('  2. El status no es "published"');
      console.log('  3. No hay eventos en la base de datos\n');

      // Verificar eventos sin filtro
      const [allEvents] = await sequelize.query(`
        SELECT
          e.id,
          e.title,
          e.published_at,
          es.name as status
        FROM events e
        LEFT JOIN event_statuses es ON e.event_status_id = es.id
      `);

      console.log('📋 Todos los eventos en la BD:');
      allEvents.forEach(ev => {
        console.log(`  ID: ${ev.id} - ${ev.title}`);
        console.log(`    published_at: ${ev.published_at || 'NULL'}`);
        console.log(`    status: ${ev.status}`);
      });
    } else {
      console.log('✅ EVENTOS ENCONTRADOS:\n');
      events.forEach((event, index) => {
        console.log(`${index + 1}. ID: ${event.id}`);
        console.log(`   Título: ${event.title}`);
        console.log(`   Categoría: ${event['eventCategory.name'] || 'Sin categoría'}`);
        console.log(`   Tipo: ${event['eventType.name'] || 'Sin tipo'}`);
        console.log(`   Status: ${event['eventStatus.name']}`);
        console.log(`   isVirtual: ${event.is_virtual}`);
        console.log(`   Fecha inicio: ${event.start_date}`);
        console.log(`   Fecha fin: ${event.end_date}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

testUserEventsEndpoint();
