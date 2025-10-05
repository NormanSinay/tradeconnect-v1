const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const config = {
  username: 'tradeconnect_user',
  password: 'tradeconnect123',
  database: 'tradeconnect_dev',
  host: '127.0.0.1',
  port: 5432,
  dialect: 'postgres',
  logging: console.log
};

async function runSQL() {
  const sequelize = new Sequelize(config.database, config.username, config.password, config);

  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'create-capacity-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Ejecutando script SQL...');

    // Ejecutar el SQL
    await sequelize.query(sql);

    console.log('✅ Script SQL ejecutado exitosamente');

    // Verificar que las tablas se crearon
    const tables = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('access_types', 'capacities', 'overbookings', 'capacity_rules')
      ORDER BY table_name
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('Tablas creadas:', tables.map(t => t.table_name));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runSQL();