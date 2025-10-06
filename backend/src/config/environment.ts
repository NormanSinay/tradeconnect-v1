/**
 * @fileoverview Configuración de variables de entorno
 * @version 1.0.0
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  
  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'tradeconnect_dev',
    user: process.env.DB_USER || 'tradeconnect_user',
    password: process.env.DB_PASSWORD || 'tradeconnect123'
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'c0fcd5432f88e5fae798739e84b0893e4cef17338a57a60c48be11e3a2c837d458c6c2eb326577fcd66de2068ffb0ce038eb2eba4cc5cf9abb17e325b33620ed',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '75f8318b3f1b2089fa01663ea389e741722cf7859d946f7d52189ff6417da32429aeae6c50f9198a8dbf91e27f70f88dde095ee6551f417230be7b6789466b47',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
  },
  
  // Encriptación
  encryption: {
    key: process.env.ENCRYPTION_KEY || '9d3a42cb733dce131f2ee6fcc64b324d22fa0a725087f6f7f039149112b61a75698d8b98f6f209764ffef5085030d759994dbb66573a4dc29c9e003cdfe3adb4'
  },
  
  // FEL Guatemala
  fel: {
    baseUrl: process.env.FEL_BASE_URL || 'https://testws.ccgfel.gt/Api',
    username: process.env.FEL_USERNAME,
    password: process.env.FEL_PASSWORD
  },
  
  // App
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Blockchain
  blockchain: {
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true' || false,
    defaultNetwork: 'sepolia_testnet',
    networks: {
      sepolia_testnet: {
        name: 'sepolia_testnet',
        rpcUrl: process.env.ETHEREUM_TESTNET_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
        chainId: 11155111, // Sepolia testnet
        symbol: 'ETH',
        contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
        contractAbi: JSON.parse(process.env.ETHEREUM_CONTRACT_ABI || JSON.stringify(require('../../contracts/CertificateRegistryABI.json'))),
        systemWalletAddress: process.env.ETHEREUM_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000',
        systemWalletKey: process.env.ETHEREUM_WALLET_KEY || '',
        requiredConfirmations: parseInt(process.env.ETHEREUM_CONFIRMATIONS || '3'),
        transactionTimeoutSeconds: parseInt(process.env.ETHEREUM_TIMEOUT || '300'),
        maxRetries: parseInt(process.env.ETHEREUM_MAX_RETRIES || '3'),
        maxGasPriceGwei: parseInt(process.env.ETHEREUM_MAX_GAS_PRICE || '50'),
        gasLimit: parseInt(process.env.ETHEREUM_GAS_LIMIT || '200000')
      }
    }
  },

  // QR Codes
  qr: {
    encryptionKey: process.env.QR_ENCRYPTION_KEY || 'qr-encryption-key-32-chars-long!!!',
    hmacSecret: process.env.QR_HMAC_SECRET || 'qr-hmac-secret-32-chars-long!!!!!',
    validityHours: parseInt(process.env.QR_VALIDITY_HOURS || '24'),
    maxOfflineHours: parseInt(process.env.QR_MAX_OFFLINE_HOURS || '168'), // 7 días
    batchSize: parseInt(process.env.QR_BATCH_SIZE || '100'),
    cacheTtl: parseInt(process.env.QR_CACHE_TTL || '3600') // 1 hora
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log'
  }
};

export default config;
