/**
 * @fileoverview Configuración de base de datos PostgreSQL
 * @version 1.0.0
 */

// Importar configuración de environment para cargar dotenv
import './environment';

import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tradeconnect_dev',
  process.env.DB_USER || 'tradeconnect_user',
  process.env.DB_PASSWORD || 'tradeconnect123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

export default sequelize;