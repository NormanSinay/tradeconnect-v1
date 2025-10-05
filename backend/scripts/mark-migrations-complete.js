/**
 * Script para marcar migraciones como completadas
 * Esto es necesario cuando las tablas ya existen pero Sequelize no las tiene registradas
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// Configuración de la base de datos
const config = require('../config/config.json').development;

async function markMigrationsComplete() {
  const sequelize = new Sequelize(config.database, config.username, config.password, config);

  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Migraciones que necesitan ser marcadas como completadas
    const migrationsToMark = [
      '043-create-capacities.js',
      '044-create-overbookings.js',
      '045-create-capacity-rules.js',
      '046-create-waitlists.js',
      '047-create-event-sessions.js'
    ];

    console.log('📝 Marcando migraciones como completadas...');

    for (const migrationName of migrationsToMark) {
      try {
        // Usar INSERT con ON CONFLICT para evitar errores si ya existe
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (?) ON CONFLICT (name) DO NOTHING',
          {
            replacements: [migrationName],
            type: Sequelize.QueryTypes.INSERT
          }
        );
        console.log(`✅ ${migrationName} - marcado como completado`);
      } catch (error) {
        console.log(`⚠️  ${migrationName} - ya estaba marcado o error:`, error.message);
      }
    }

    console.log('🎉 Todas las migraciones han sido marcadas como completadas');

    // Verificar el estado final
    console.log('\n📊 Verificando estado final...');
    const [results] = await sequelize.query('SELECT name FROM "SequelizeMeta" ORDER BY name', {
      type: Sequelize.QueryTypes.SELECT
    });

    console.log('Migraciones completadas:');
    if (Array.isArray(results)) {
      results.forEach(row => {
        console.log(`  - ${row.name}`);
      });
    } else {
      console.log('  - No se pudieron obtener los resultados');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
markMigrationsComplete().catch(console.error);