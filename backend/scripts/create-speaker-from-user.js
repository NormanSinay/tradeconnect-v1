/**
 * Script para crear un registro de Speaker desde un User con rol speaker
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tradeconnect_dev',
  username: process.env.DB_USER || 'tradeconnect_user',
  password: process.env.DB_PASSWORD || 'tradeconnect123',
  dialect: 'postgres',
  logging: false
};

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging
});

async function createSpeakerFromUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // 1. Buscar usuarios con rol speaker
    const [users] = await sequelize.query(`
      SELECT
        u.id,
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.phone,
        r.name as role
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'speaker'
        AND u.deleted_at IS NULL
        AND u.is_active = true
    `);

    console.log(`\n📋 Usuarios con rol speaker encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Nombre: ${user.firstName} ${user.lastName}`);
    });

    // 2. Verificar cuáles ya tienen registro en speakers
    const [speakers] = await sequelize.query(`
      SELECT id, first_name as "firstName", last_name as "lastName", email
      FROM speakers
      WHERE deleted_at IS NULL
    `);

    console.log(`\n📋 Speakers registrados: ${speakers.length}`);
    speakers.forEach(speaker => {
      console.log(`  - ID: ${speaker.id}, Email: ${speaker.email}, Nombre: ${speaker.firstName} ${speaker.lastName}`);
    });

    // 3. Identificar usuarios que no tienen registro en speakers
    const speakerEmails = new Set(speakers.map(s => s.email.toLowerCase()));
    const usersWithoutSpeaker = users.filter(u => !speakerEmails.has(u.email.toLowerCase()));

    console.log(`\n⚠️  Usuarios sin registro en speakers: ${usersWithoutSpeaker.length}`);

    if (usersWithoutSpeaker.length === 0) {
      console.log('✅ Todos los usuarios con rol speaker tienen su registro en la tabla speakers');
      await sequelize.close();
      return;
    }

    // 4. Crear registros de speaker para cada usuario
    console.log('\n🔨 Creando registros de speaker...\n');

    for (const user of usersWithoutSpeaker) {
      try {
        const [result] = await sequelize.query(`
          INSERT INTO speakers (
            first_name,
            last_name,
            email,
            phone,
            base_rate,
            rate_type,
            modalities,
            languages,
            category,
            is_active,
            total_events,
            created_by,
            created_at,
            updated_at
          )
          VALUES (
            :firstName,
            :lastName,
            :email,
            :phone,
            0,
            'event',
            '["presential", "virtual", "hybrid"]'::json,
            '["spanish"]'::json,
            'national',
            true,
            0,
            :userId,
            NOW(),
            NOW()
          )
          RETURNING id
        `, {
          replacements: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || null,
            userId: user.id
          }
        });

        console.log(`  ✅ Speaker creado para ${user.firstName} ${user.lastName} (ID: ${result[0].id})`);
      } catch (error) {
        console.error(`  ❌ Error creando speaker para ${user.email}:`, error.message);
      }
    }

    console.log('\n✅ Proceso completado');
    await sequelize.close();

  } catch (error) {
    console.error('❌ Error:', error);
    await sequelize.close();
    process.exit(1);
  }
}

createSpeakerFromUser();
