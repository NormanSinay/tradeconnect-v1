#!/usr/bin/env node

/**
 * @fileoverview Script para verificar configuración del módulo de pagos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Verifica que todas las dependencias y configuraciones estén correctas
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración de colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Cargar variables de entorno
require('dotenv').config();

/**
 * Verifica existencia de archivos requeridos
 */
function checkRequiredFiles() {
  logInfo('Checking required files...');

  const requiredFiles = [
    'backend/src/types/payment.types.ts',
    'backend/src/types/payment-gateway.types.ts',
    'backend/src/models/Payment.ts',
    'backend/src/models/PaymentMethod.ts',
    'backend/src/models/Refund.ts',
    'backend/src/models/PaymentReconciliation.ts',
    'backend/src/services/paymentService.ts',
    'backend/src/services/refundService.ts',
    'backend/src/services/paypalService.ts',
    'backend/src/services/stripeService.ts',
    'backend/src/services/neonetService.ts',
    'backend/src/services/bamService.ts',
    'backend/src/controllers/paymentController.ts',
    'backend/src/controllers/refundController.ts',
    'backend/src/controllers/webhookController.ts',
    'backend/src/routes/payments.ts',
    'backend/src/routes/refunds.ts',
    'backend/src/routes/webhooks.ts',
    'backend/src/utils/payment.utils.ts',
    'backend/PAYMENTS_README.md'
  ];

  let allFilesExist = true;

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`File exists: ${file}`);
    } else {
      logError(`File missing: ${file}`);
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

/**
 * Verifica variables de entorno
 */
function checkEnvironmentVariables() {
  logInfo('Checking environment variables...');

  const requiredVars = [
    'PAYMENT_ENCRYPTION_KEY'
  ];

  const optionalVars = {
    paypal: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_ENVIRONMENT'],
    stripe: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    neonet: ['NEONET_MERCHANT_ID', 'NEONET_API_KEY', 'NEONET_API_SECRET', 'NEONET_ENVIRONMENT'],
    bam: ['BAM_MERCHANT_ID', 'BAM_API_KEY', 'BAM_API_SECRET', 'BAM_ENVIRONMENT']
  };

  let hasRequired = true;
  let gatewayCount = 0;

  // Verificar variables requeridas
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`Required env var set: ${varName}`);
    } else {
      logError(`Required env var missing: ${varName}`);
      hasRequired = false;
    }
  });

  // Verificar variables de pasarelas
  Object.entries(optionalVars).forEach(([gateway, vars]) => {
    const hasAllVars = vars.every(varName => process.env[varName]);
    if (hasAllVars) {
      logSuccess(`Gateway configured: ${gateway.toUpperCase()}`);
      gatewayCount++;
    } else {
      logWarning(`Gateway not configured: ${gateway.toUpperCase()}`);
    }
  });

  if (gatewayCount === 0) {
    logWarning('No payment gateways configured - using mocks only');
  }

  return hasRequired;
}

/**
 * Verifica migraciones de base de datos
 */
function checkDatabaseMigrations() {
  logInfo('Checking database migrations...');

  const migrationFiles = [
    '027-create-payments.js',
    '028-create-payment-methods.js',
    '029-create-refunds.js',
    '030-create-payment-reconciliations.js'
  ];

  let allMigrationsExist = true;

  migrationFiles.forEach(file => {
    const filePath = path.join('backend/migrations', file);
    if (fs.existsSync(filePath)) {
      logSuccess(`Migration exists: ${file}`);
    } else {
      logError(`Migration missing: ${file}`);
      allMigrationsExist = false;
    }
  });

  return allMigrationsExist;
}

/**
 * Verifica conectividad de webhooks
 */
async function checkWebhookConnectivity() {
  logInfo('Checking webhook connectivity...');

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const webhooks = [
    '/api/v1/webhooks/paypal',
    '/api/v1/webhooks/stripe',
    '/api/v1/webhooks/neonet',
    '/api/v1/webhooks/bam',
    '/api/v1/webhooks/zoom',
    '/api/v1/webhooks/calendar'
  ];

  let connectivityOk = true;

  for (const webhook of webhooks) {
    try {
      const response = await axios.head(`${baseUrl}${webhook}`, { timeout: 5000 });
      if (response.status === 404) {
        logSuccess(`Webhook endpoint accessible: ${webhook}`);
      } else {
        logWarning(`Webhook endpoint returns ${response.status}: ${webhook}`);
      }
    } catch (error) {
      logError(`Webhook endpoint not accessible: ${webhook} (${error.code || 'unknown error'})`);
      connectivityOk = false;
    }
  }

  return connectivityOk;
}

/**
 * Verifica configuración de mocks
 */
function checkMockConfiguration() {
  logInfo('Checking mock configuration...');

  const mockVars = [
    'NEONET_MOCK',
    'BAM_MOCK'
  ];

  mockVars.forEach(varName => {
    const value = process.env[varName];
    if (value !== undefined) {
      logSuccess(`Mock configured: ${varName}=${value}`);
    } else {
      logInfo(`Mock not configured: ${varName} (defaults to false)`);
    }
  });

  return true;
}

/**
 * Función principal
 */
async function main() {
  log('🔍 Verifying TradeConnect Payment Module Setup', 'cyan');
  log('');

  const checks = {
    files: false,
    env: false,
    migrations: false,
    webhooks: false,
    mocks: false
  };

  // Ejecutar verificaciones
  checks.files = checkRequiredFiles();
  log('');
  checks.env = checkEnvironmentVariables();
  log('');
  checks.migrations = checkDatabaseMigrations();
  log('');
  checks.mocks = checkMockConfiguration();
  log('');

  try {
    checks.webhooks = await checkWebhookConnectivity();
  } catch (error) {
    logWarning('Could not check webhook connectivity - server may not be running');
    checks.webhooks = null; // No determinar como fallo
  }

  log('');
  log('📊 Verification Results:', 'cyan');

  const results = [
    { name: 'Required Files', status: checks.files },
    { name: 'Environment Variables', status: checks.env },
    { name: 'Database Migrations', status: checks.migrations },
    { name: 'Mock Configuration', status: checks.mocks },
    { name: 'Webhook Connectivity', status: checks.webhooks }
  ];

  results.forEach(result => {
    const status = result.status === true ? '✅ Pass' :
                  result.status === false ? '❌ Fail' : '⚠️  Skip';
    const color = result.status === true ? 'green' :
                 result.status === false ? 'red' : 'yellow';
    log(`  ${result.name}: ${status}`, color);
  });

  const passedChecks = results.filter(r => r.status === true).length;
  const totalChecks = results.filter(r => r.status !== null).length;

  log('');
  if (passedChecks === totalChecks) {
    logSuccess(`All ${totalChecks} checks passed! Payment module is ready.`);
  } else {
    logWarning(`${passedChecks} of ${totalChecks} checks passed.`);
  }

  log('');
  log('📝 Next steps:', 'yellow');
  if (!checks.files) {
    log('  • Run the payment module implementation');
  }
  if (!checks.env) {
    log('  • Configure environment variables in .env file');
  }
  if (!checks.migrations) {
    log('  • Run database migrations: npm run migrate');
  }
  if (checks.webhooks === false) {
    log('  • Start the server and verify webhook endpoints');
  }
  log('  • Run webhook setup: node scripts/setup-payment-webhooks.js');
  log('  • Test payment flows with mock data');

  const exitCode = (passedChecks === totalChecks) ? 0 : 1;
  process.exit(exitCode);
}

// Ejecutar script
if (require.main === module) {
  main().catch(error => {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkRequiredFiles,
  checkEnvironmentVariables,
  checkDatabaseMigrations,
  checkWebhookConnectivity,
  checkMockConfiguration
};