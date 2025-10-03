#!/usr/bin/env node

/**
 * @fileoverview Script para configurar webhooks de pasarelas de pago
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Configura automáticamente webhooks en PayPal, Stripe, NeoNet y BAM
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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

// URL base de la aplicación
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_VERSION = '/api/v1';

/**
 * Configura webhook de PayPal
 */
async function setupPayPalWebhook() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

  if (!clientId || !clientSecret) {
    logWarning('PayPal credentials not configured, skipping...');
    return false;
  }

  try {
    logInfo('Setting up PayPal webhook...');

    // Obtener access token
    const authResponse = await axios({
      method: 'post',
      url: environment === 'production'
        ? 'https://api.paypal.com/v1/oauth2/token'
        : 'https://api.sandbox.paypal.com/v1/oauth2/token',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      data: 'grant_type=client_credentials'
    });

    const accessToken = authResponse.data.access_token;

    // Crear webhook
    const webhookUrl = `${BASE_URL}${API_VERSION}/webhooks/paypal`;
    const webhookData = {
      url: webhookUrl,
      event_types: [
        { name: 'PAYMENT.CAPTURE.COMPLETED' },
        { name: 'PAYMENT.CAPTURE.DENIED' },
        { name: 'PAYMENT.CAPTURE.PENDING' },
        { name: 'PAYMENT.CAPTURE.REFUNDED' },
        { name: 'PAYMENT.CAPTURE.REVERSED' }
      ]
    };

    const webhookResponse = await axios({
      method: 'post',
      url: environment === 'production'
        ? 'https://api.paypal.com/v1/notifications/webhooks'
        : 'https://api.sandbox.paypal.com/v1/notifications/webhooks',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: webhookData
    });

    const webhookId = webhookResponse.data.id;
    logSuccess(`PayPal webhook created: ${webhookId}`);

    // Guardar webhook ID en .env si no existe
    updateEnvFile('PAYPAL_WEBHOOK_ID', webhookId);

    return true;
  } catch (error) {
    logError(`Failed to setup PayPal webhook: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Configura webhook de Stripe
 */
async function setupStripeWebhook() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    logWarning('Stripe credentials not configured, skipping...');
    return false;
  }

  try {
    logInfo('Setting up Stripe webhook...');

    // Crear webhook
    const webhookUrl = `${BASE_URL}${API_VERSION}/webhooks/stripe`;
    const webhookData = {
      url: webhookUrl,
      enabled_events: [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.canceled',
        'charge.dispute.created',
        'charge.refunded'
      ]
    };

    const response = await axios({
      method: 'post',
      url: 'https://api.stripe.com/v1/webhook_endpoints',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams(webhookData).toString()
    });

    const webhookId = response.data.id;
    const secret = response.data.secret;

    logSuccess(`Stripe webhook created: ${webhookId}`);

    // Guardar configuración en .env
    updateEnvFile('STRIPE_WEBHOOK_ID', webhookId);
    updateEnvFile('STRIPE_WEBHOOK_SECRET', secret);

    return true;
  } catch (error) {
    logError(`Failed to setup Stripe webhook: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Configura webhook de NeoNet
 */
async function setupNeoNetWebhook() {
  const merchantId = process.env.NEONET_MERCHANT_ID;
  const apiKey = process.env.NEONET_API_KEY;
  const apiSecret = process.env.NEONET_API_SECRET;
  const environment = process.env.NEONET_ENVIRONMENT || 'sandbox';

  if (!merchantId || !apiKey || !apiSecret) {
    logWarning('NeoNet credentials not configured, skipping...');
    return false;
  }

  try {
    logInfo('Setting up NeoNet webhook...');

    // Generar firma
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(`${apiKey}${timestamp}`)
      .digest('hex');

    const webhookUrl = `${BASE_URL}${API_VERSION}/webhooks/neonet`;
    const webhookData = {
      merchantId,
      webhookUrl,
      events: ['transaction.approved', 'transaction.declined', 'transaction.expired']
    };

    const baseUrl = environment === 'production'
      ? 'https://api.neonet.com.gt'
      : 'https://sandbox.neonet.com.gt';

    const response = await axios({
      method: 'post',
      url: `${baseUrl}/api/v1/webhooks`,
      headers: {
        'Authorization': `Bearer ${apiKey}:${timestamp}:${signature}`,
        'Content-Type': 'application/json'
      },
      data: webhookData
    });

    logSuccess(`NeoNet webhook configured successfully`);
    return true;
  } catch (error) {
    logError(`Failed to setup NeoNet webhook: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Configura webhook de BAM
 */
async function setupBAMWebhook() {
  const merchantId = process.env.BAM_MERCHANT_ID;
  const apiKey = process.env.BAM_API_KEY;
  const apiSecret = process.env.BAM_API_SECRET;
  const environment = process.env.BAM_ENVIRONMENT || 'sandbox';

  if (!merchantId || !apiKey || !apiSecret) {
    logWarning('BAM credentials not configured, skipping...');
    return false;
  }

  try {
    logInfo('Setting up BAM webhook...');

    // Generar firma
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(`${apiKey}${timestamp}`)
      .digest('hex');

    const webhookUrl = `${BASE_URL}${API_VERSION}/webhooks/bam`;
    const webhookData = {
      merchantId,
      webhookUrl,
      events: ['transaction.approved', 'transaction.declined', 'transaction.expired']
    };

    const baseUrl = environment === 'production'
      ? 'https://api.bam.com.gt'
      : 'https://sandbox.bam.com.gt';

    const response = await axios({
      method: 'post',
      url: `${baseUrl}/api/v1/webhooks`,
      headers: {
        'Authorization': `Bearer ${apiKey}:${timestamp}:${signature}`,
        'Content-Type': 'application/json'
      },
      data: webhookData
    });

    logSuccess(`BAM webhook configured successfully`);
    return true;
  } catch (error) {
    logError(`Failed to setup BAM webhook: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Actualiza archivo .env con nueva configuración
 */
function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, '..', '.env');

  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Verificar si la variable ya existe
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      // Actualizar valor existente
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Agregar nueva variable
      envContent += `\n${key}=${value}`;
    }

    fs.writeFileSync(envPath, envContent);
    logInfo(`Updated .env file with ${key}`);
  } catch (error) {
    logWarning(`Could not update .env file: ${error.message}`);
  }
}

/**
 * Función principal
 */
async function main() {
  log('🚀 Setting up payment webhooks for TradeConnect', 'cyan');
  log(`📍 Base URL: ${BASE_URL}`, 'cyan');
  log('');

  const results = {
    paypal: false,
    stripe: false,
    neonet: false,
    bam: false
  };

  // Configurar webhooks
  results.paypal = await setupPayPalWebhook();
  results.stripe = await setupStripeWebhook();
  results.neonet = await setupNeoNetWebhook();
  results.bam = await setupBAMWebhook();

  log('');
  log('📊 Setup Results:', 'cyan');

  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  Object.entries(results).forEach(([gateway, success]) => {
    const status = success ? '✅ Success' : '❌ Failed';
    log(`  ${gateway.toUpperCase()}: ${status}`, success ? 'green' : 'red');
  });

  log('');
  if (successCount === totalCount) {
    logSuccess(`All ${totalCount} payment webhooks configured successfully!`);
  } else if (successCount > 0) {
    logWarning(`${successCount} of ${totalCount} payment webhooks configured successfully.`);
  } else {
    logError('No payment webhooks were configured.');
  }

  log('');
  log('📝 Next steps:', 'yellow');
  log('  1. Verify webhook URLs are accessible from the internet');
  log('  2. Test webhook endpoints with sample data');
  log('  3. Monitor webhook logs in production');
  log('  4. Set up webhook retry policies if needed');

  process.exit(successCount > 0 ? 0 : 1);
}

// Ejecutar script
if (require.main === module) {
  main().catch(error => {
    logError(`Script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  setupPayPalWebhook,
  setupStripeWebhook,
  setupNeoNetWebhook,
  setupBAMWebhook
};