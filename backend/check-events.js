/**
 * Script para verificar el estado de los eventos en la base de datos
 */
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tradeconnect_dev',
  process.env.DB_USER || 'tradeconnect_user',
  process.env.DB_PASSWORD || 'tradeconnect123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function checkEvents() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');

    // Primero, verificar la estructura de la tabla
    const [columns] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `);

    console.log('📋 Columnas disponibles en la tabla events:');
    columns.forEach(col => console.log(`   - ${col.column_name}`));
    console.log('\n');

    // Consultar todos los eventos usando nombres correctos de columnas
    const [events] = await sequelize.query(`
      SELECT
        e.id,
        e.title,
        e.published_at,
        es.name as status,
        e.is_virtual,
        e.start_date,
        e.capacity,
        e.registered_count
      FROM events e
      LEFT JOIN event_statuses es ON e.event_status_id = es.id
      ORDER BY e.id
    `);

    console.log('📊 EVENTOS EN LA BASE DE DATOS:');
    console.log('================================\n');

    if (events.length === 0) {
      console.log('⚠️  No hay eventos en la base de datos\n');
    } else {
      events.forEach((event, index) => {
        const isPublished = event.published_at !== null;
        console.log(`${index + 1}. ID: ${event.id}`);
        console.log(`   Título: ${event.title}`);
        console.log(`   published_at: ${event.published_at || 'No publicado'}`);
        console.log(`   isPublished: ${isPublished}`);
        console.log(`   status: ${event.status || 'Sin estado'}`);
        console.log(`   is_virtual: ${event.is_virtual}`);
        console.log(`   Fecha: ${event.start_date}`);
        console.log(`   Capacidad: ${event.capacity || 'N/A'}`);
        console.log(`   Inscritos: ${event.registered_count || 0}`);

        // Verificar si el evento se mostraría en el dashboard
        // Nota: El controller usa isPublished (getter) y status='open'
        const willShow = isPublished && event.status === 'open';
        console.log(`   ${willShow ? '✅ SE MOSTRARÁ' : '❌ NO SE MOSTRARÁ'} en el dashboard`);
        if (!isPublished) console.log(`   → Razón: No está publicado (published_at es null)`);
        if (isPublished && event.status !== 'open') console.log(`   → Razón: Status es "${event.status}", debe ser "open"`);
        console.log('');
      });
    }

    console.log('\n📝 CRITERIOS PARA QUE UN EVENTO SE MUESTRE:');
    console.log('  • published_at IS NOT NULL (isPublished = true)');
    console.log('  • status = "open" (event_status.name = "open")');
    console.log('');

    // Contar eventos que se mostrarían
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM events e
      LEFT JOIN event_statuses es ON e.event_status_id = es.id
      WHERE e.published_at IS NOT NULL AND es.name = 'open'
    `);

    console.log(`📈 Total de eventos que se mostrarán: ${count[0].count}\n`);

    // Mostrar todos los statuses disponibles
    const [statuses] = await sequelize.query(`
      SELECT id, name, description
      FROM event_statuses
      ORDER BY id
    `);

    console.log('📋 STATUSES DISPONIBLES:');
    statuses.forEach(s => {
      console.log(`   ${s.id}. ${s.name} - ${s.description || 'Sin descripción'}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkEvents();
