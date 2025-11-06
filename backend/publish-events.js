/**
 * Script para publicar los eventos de prueba
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

async function publishEvents() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');

    // Actualizar los eventos para marcarlos como publicados
    const [result] = await sequelize.query(`
      UPDATE events
      SET published_at = CURRENT_TIMESTAMP
      WHERE id IN (7, 8) AND published_at IS NULL
      RETURNING id, title, published_at, event_status_id
    `);

    if (result.length === 0) {
      console.log('ℹ️  Los eventos ya estaban publicados o no se encontraron.\n');
    } else {
      console.log('✅ Eventos actualizados exitosamente:\n');
      result.forEach(event => {
        console.log(`   ID: ${event.id}`);
        console.log(`   Título: ${event.title}`);
        console.log(`   Publicado en: ${event.published_at}`);
        console.log(`   Status ID: ${event.event_status_id}`);
        console.log('');
      });
    }

    // Verificar el resultado final
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
      WHERE e.id IN (7, 8)
      ORDER BY e.id
    `);

    console.log('\n📊 ESTADO ACTUAL DE LOS EVENTOS:');
    console.log('================================\n');

    events.forEach(event => {
      const isPublished = event.published_at !== null;
      const willShow = isPublished && event.status === 'published';

      console.log(`ID: ${event.id} - ${event.title}`);
      console.log(`   Publicado: ${isPublished ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   ${willShow ? '✅ SE MOSTRARÁ' : '❌ NO SE MOSTRARÁ'} en el dashboard\n`);
    });

    console.log('📝 Siguiente paso: Reinicia el servidor backend si está corriendo\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

publishEvents();
