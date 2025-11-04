/**
 * @fileoverview Servidor principal de TradeConnect Platform
 * @version 1.0.0
 * @author TradeConnect Team
 */

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/environment';
import { testRedisConnection } from './config/redis';
import sequelize from './config/database';
import { requestLogger, errorLogger } from './middleware/logging.middleware';
import { successResponse, errorResponse } from './utils/common.utils';
import { initializeSocketService } from './services/socketService';

// Importar modelos (esto los registra con Sequelize)
import './models';

// Importar rutas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import sessionRoutes from './routes/sessions';

// Importar servicios para inicializar listeners
import { eventService } from './services/eventService';
import { eventListenersService } from './services/eventListeners';
import { metricsService } from './services/metricsService';
import { queueService } from './services/queueService';
import { notificationTriggersService } from './services/notificationTriggers';
import eventRoutes from './routes/events';
import eventTemplateRoutes from './routes/event-templates';
import eventCategoryRoutes from './routes/event-categories';
import eventRegistrationRoutes from './routes/event-registrations';
import eventReportsRoutes from './routes/event-reports';
import eventSessionsRoutes from './routes/event-sessions';
import certificateRoutes from './routes/certificates';
import publicRoutes from './routes/public';

// Importar rutas de promociones y descuentos
import promotionRoutes from './routes/promotions';
import discountRoutes from './routes/discounts';

// Importar rutas de finanzas
import financeRoutes from './routes/finance';

// Importar rutas del módulo de aforos
import capacityRoutes from './routes/capacity';
import accessTypesRoutes from './routes/access-types';
import overbookingRoutes from './routes/overbooking';

// Importar rutas del módulo QR y control de acceso
import qrRoutes from './routes/qr';

// Importar rutas del módulo de notificaciones
import notificationRoutes from './routes/notifications';
import emailTemplateRoutes from './routes/email-templates';
import notificationRuleRoutes from './routes/notification-rules';
import userPreferencesRoutes from './routes/user-preferences';

// Importar rutas de campañas de email
import campaignRoutes from './routes/campaigns';

// Importar rutas del módulo de eventos híbridos
import hybridEventRoutes from './routes/hybrid-events';
import streamingRoutes from './routes/streaming';
import virtualParticipantRoutes from './routes/virtual-participants';

// Importar middleware de seguridad
import { generalLimiter, authLimiter } from './middleware/rateLimiting';
import { basicSecurity, publicSecurity, protectedSecurity } from './middleware/security';

const app = express();
const PORT = config.PORT;

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ====================================================================
// MIDDLEWARES DE SEGURIDAD Y CONFIGURACIÓN
// ====================================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Configurar CORS con función de validación de origen
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  'http://localhost:4321'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, o same-origin)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Origen no permitido: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(compression());

// ====================================================================
// MIDDLEWARES DE SEGURIDAD Y RATE LIMITING
// ====================================================================

// Rate limiting general
app.use(generalLimiter);

// Middleware de seguridad básico
app.use(basicSecurity);

// Rate limiting específico para autenticación se maneja en rutas individuales

// ====================================================================
// MIDDLEWARES DE PARSING
// ====================================================================

// Middleware para verificar JSON solo en métodos que requieren body JSON
const jsonParserMiddleware = express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Solo validar JSON para métodos que típicamente envían body JSON
    const methodsWithJsonBody = ['POST', 'PUT', 'PATCH'];
    if (methodsWithJsonBody.includes(req.method || '')) {
      try {
        JSON.parse(buf.toString());
      } catch (error) {
        throw new Error('Invalid JSON');
      }
    }
  }
});

// Aplicar middleware de JSON parsing
app.use(jsonParserMiddleware);

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// ====================================================================
// MIDDLEWARES DE LOGGING
// ====================================================================
app.use(requestLogger);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ====================================================================
// CONFIGURACIÓN DE SWAGGER
// ====================================================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TradeConnect Platform API',
      version: '1.0.0',
      description: 'Plataforma completa para gestión de eventos empresariales con blockchain',
      contact: {
        name: 'TradeConnect Team',
        email: 'support@tradeconnect.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Development server'
      },
      {
        url: 'https://api.tradeconnect.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error description'
            },
            error: {
              type: 'string',
              example: 'ERROR_CODE'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        // Cart schemas
        CartItemRequest: {
          type: 'object',
          required: ['eventId', 'participantType', 'quantity'],
          properties: {
            eventId: {
              type: 'integer',
              description: 'ID del evento',
              example: 1
            },
            participantType: {
              type: 'string',
              enum: ['individual', 'empresa'],
              description: 'Tipo de participante',
              example: 'individual'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              maximum: 50,
              description: 'Cantidad de participantes',
              example: 2
            },
            customFields: {
              type: 'object',
              description: 'Campos personalizados del evento',
              example: { 'dietary_restrictions': 'vegetarian' }
            },
            participantData: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  nit: { type: 'string' },
                  cui: { type: 'string' },
                  position: { type: 'string' }
                }
              }
            }
          }
        },
        CartUpdateRequest: {
          type: 'object',
          required: ['itemId'],
          properties: {
            itemId: {
              type: 'integer',
              description: 'ID del item a actualizar',
              example: 1
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              maximum: 50,
              description: 'Nueva cantidad',
              example: 3
            },
          }
        },
        // FEL schemas
        FelValidationRequest: {
          type: 'object',
          required: ['nit'],
          properties: {
            nit: {
              type: 'string',
              description: 'Número de Identificación Tributaria',
              example: '12345678-9'
            }
          }
        },
        FelCuiValidationRequest: {
          type: 'object',
          required: ['cui'],
          properties: {
            cui: {
              type: 'string',
              description: 'Código Único de Identificación',
              example: '1234567890123'
            }
          }
        },
        InvoiceGenerationRequest: {
          type: 'object',
          required: ['registrationId'],
          properties: {
            registrationId: {
              type: 'integer',
              description: 'ID de la inscripción',
              example: 1
            },
            paymentId: {
              type: 'integer',
              description: 'ID del pago (opcional)',
              example: 1
            },
            customItems: {
              type: 'array',
              description: 'Items personalizados de factura',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                  discount: { type: 'number' }
                }
              }
            },
            notes: {
              type: 'string',
              description: 'Notas adicionales',
              example: 'Factura generada automáticamente'
            }
          }
        },
        InvoiceCancelRequest: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: {
              type: 'string',
              description: 'Motivo de la anulación',
              example: 'Cliente solicitó cancelación'
            }
          }
        },
        FelDocumentResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            uuid: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            invoiceId: { type: 'integer', example: 1 },
            status: {
              type: 'string',
              enum: ['generated', 'sent', 'certified', 'cancelled', 'expired', 'failed'],
              example: 'certified'
            },
            authorizationNumber: { type: 'string', example: '123456789' },
            certifiedAt: { type: 'string', format: 'date-time' },
            qrCode: { type: 'string', example: 'https://fel.sat.gob.gt/verify/...' },
            series: { type: 'string', example: 'A' },
            number: { type: 'integer', example: 1 }
          }
        },
        InvoiceResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            uuid: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            registrationId: { type: 'integer', example: 1 },
            status: {
              type: 'string',
              enum: ['draft', 'pending', 'certified', 'sent', 'cancelled', 'expired'],
              example: 'certified'
            },
            documentType: {
              type: 'string',
              enum: ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO'],
              example: 'FACTURA'
            },
            series: { type: 'string', example: 'A' },
            number: { type: 'integer', example: 1 },
            nit: { type: 'string', example: '12345678-9' },
            name: { type: 'string', example: 'Juan Pérez' },
            address: { type: 'string', example: 'Ciudad de Guatemala' },
            email: { type: 'string', example: 'cliente@example.com' },
            phone: { type: 'string', example: '+502 1234-5678' },
            subtotal: { type: 'number', example: 100.00 },
            taxRate: { type: 'number', example: 0.12 },
            taxAmount: { type: 'number', example: 12.00 },
            total: { type: 'number', example: 112.00 },
            currency: { type: 'string', example: 'GTQ' },
            description: { type: 'string', example: 'Factura por servicios' },
            notes: { type: 'string', example: 'Pago en efectivo' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        NitValidationResponse: {
          type: 'object',
          properties: {
            nit: { type: 'string', example: '12345678-9' },
            name: { type: 'string', example: 'EMPRESA S.A.' },
            status: {
              type: 'string',
              enum: ['valid', 'invalid', 'not_found'],
              example: 'valid'
            },
            address: { type: 'string', example: 'Ciudad de Guatemala' },
            municipality: { type: 'string', example: 'Guatemala' },
            department: { type: 'string', example: 'Guatemala' },
            lastUpdated: { type: 'string', format: 'date-time' }
          }
        },
        CuiValidationResponse: {
          type: 'object',
          properties: {
            cui: { type: 'string', example: '1234567890123' },
            name: { type: 'string', example: 'Juan Pérez García' },
            status: {
              type: 'string',
              enum: ['valid', 'invalid', 'not_found'],
              example: 'valid'
            },
            birthDate: { type: 'string', format: 'date', example: '1990-01-15' },
            gender: { type: 'string', example: 'M' },
            lastUpdated: { type: 'string', format: 'date-time' }
          }
        }
      },
      PromoCodeRequest: {
        type: 'object',
        required: ['code'],
        properties: {
          code: {
            type: 'string',
            description: 'Código promocional',
            example: 'DESCUENTO20'
          }
        }
      },
      // Promotion schemas
      Promotion: {
        type: 'object',
        required: ['name', 'type', 'createdBy'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único de la promoción',
            example: 1
          },
          name: {
            type: 'string',
            description: 'Nombre de la promoción',
            example: 'Promoción Verano 2024'
          },
          description: {
            type: 'string',
            description: 'Descripción detallada',
            example: 'Descuentos especiales para temporada de verano'
          },
          type: {
            type: 'string',
            enum: ['GENERAL', 'EVENT_SPECIFIC', 'CATEGORY_SPECIFIC', 'MEMBERSHIP'],
            description: 'Tipo de promoción',
            example: 'GENERAL'
          },
          isActive: {
            type: 'boolean',
            description: 'Estado de la promoción',
            example: true
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de inicio'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de fin'
          },
          eventIds: {
            type: 'array',
            items: { type: 'integer' },
            description: 'IDs de eventos específicos'
          },
          categoryIds: {
            type: 'array',
            items: { type: 'integer' },
            description: 'IDs de categorías permitidas'
          },
          minPurchaseAmount: {
            type: 'number',
            description: 'Monto mínimo de compra'
          },
          userTypes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tipos de usuario permitidos'
          },
          isStackable: {
            type: 'boolean',
            description: 'Si puede combinarse con otras promociones'
          },
          priority: {
            type: 'integer',
            description: 'Prioridad de aplicación'
          },
          createdBy: {
            type: 'integer',
            description: 'ID del usuario creador'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de actualización'
          }
        }
      },
      PromotionCreateRequest: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 255,
            description: 'Nombre de la promoción'
          },
          description: {
            type: 'string',
            maxLength: 1000,
            description: 'Descripción detallada'
          },
          type: {
            type: 'string',
            enum: ['GENERAL', 'EVENT_SPECIFIC', 'CATEGORY_SPECIFIC', 'MEMBERSHIP'],
            description: 'Tipo de promoción'
          },
          isActive: {
            type: 'boolean',
            description: 'Estado inicial',
            default: true
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de inicio'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de fin'
          },
          eventIds: {
            type: 'array',
            items: { type: 'integer' },
            description: 'IDs de eventos específicos'
          },
          categoryIds: {
            type: 'array',
            items: { type: 'integer' },
            description: 'IDs de categorías permitidas'
          },
          minPurchaseAmount: {
            type: 'number',
            minimum: 0,
            description: 'Monto mínimo de compra'
          },
          userTypes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tipos de usuario permitidos'
          },
          isStackable: {
            type: 'boolean',
            description: 'Si puede combinarse con otras promociones',
            default: true
          },
          priority: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            description: 'Prioridad de aplicación',
            default: 0
          }
        }
      },
      // PromoCode schemas
      PromoCode: {
        type: 'object',
        required: ['code', 'name', 'discountType', 'discountValue', 'createdBy'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del código promocional',
            example: 1
          },
          code: {
            type: 'string',
            description: 'Código promocional único',
            example: 'DESCUENTO20'
          },
          name: {
            type: 'string',
            description: 'Nombre del código',
            example: 'Descuento del 20%'
          },
          description: {
            type: 'string',
            description: 'Descripción detallada'
          },
          discountType: {
            type: 'string',
            enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'SPECIAL_PRICE'],
            description: 'Tipo de descuento',
            example: 'PERCENTAGE'
          },
          discountValue: {
            type: 'number',
            description: 'Valor del descuento',
            example: 20
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de inicio de vigencia'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de fin de vigencia'
          },
          maxUsesTotal: {
            type: 'integer',
            description: 'Máximo de usos totales'
          },
          maxUsesPerUser: {
            type: 'integer',
            description: 'Máximo de usos por usuario',
            default: 1
          },
          currentUsesTotal: {
            type: 'integer',
            description: 'Usos actuales totales',
            default: 0
          },
          isActive: {
            type: 'boolean',
            description: 'Estado del código',
            default: true
          },
          minPurchaseAmount: {
            type: 'number',
            description: 'Monto mínimo de compra'
          },
          maxDiscountAmount: {
            type: 'number',
            description: 'Monto máximo de descuento'
          },
          isStackable: {
            type: 'boolean',
            description: 'Si puede combinarse con otros descuentos',
            default: true
          },
          promotionId: {
            type: 'integer',
            description: 'ID de la promoción padre'
          },
          createdBy: {
            type: 'integer',
            description: 'ID del usuario creador'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de actualización'
          }
        }
      },
      PromoCodeCreateRequest: {
        type: 'object',
        required: ['code', 'name', 'discountType', 'discountValue'],
        properties: {
          code: {
            type: 'string',
            minLength: 4,
            maxLength: 50,
            pattern: '^[A-Z0-9_-]+$',
            description: 'Código promocional único'
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 255,
            description: 'Nombre del código'
          },
          description: {
            type: 'string',
            maxLength: 1000,
            description: 'Descripción detallada'
          },
          discountType: {
            type: 'string',
            enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'SPECIAL_PRICE'],
            description: 'Tipo de descuento'
          },
          discountValue: {
            type: 'number',
            minimum: 0,
            description: 'Valor del descuento'
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de inicio de vigencia'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de fin de vigencia'
          },
          maxUsesTotal: {
            type: 'integer',
            minimum: 1,
            description: 'Máximo de usos totales'
          },
          maxUsesPerUser: {
            type: 'integer',
            minimum: 1,
            description: 'Máximo de usos por usuario',
            default: 1
          },
          isActive: {
            type: 'boolean',
            description: 'Estado inicial',
            default: true
          },
          minPurchaseAmount: {
            type: 'number',
            minimum: 0,
            description: 'Monto mínimo de compra'
          },
          maxDiscountAmount: {
            type: 'number',
            minimum: 0,
            description: 'Monto máximo de descuento'
          },
          isStackable: {
            type: 'boolean',
            description: 'Si puede combinarse con otros descuentos',
            default: true
          },
          promotionId: {
            type: 'integer',
            description: 'ID de la promoción padre'
          }
        }
      },
      // Discount schemas
      VolumeDiscount: {
        type: 'object',
        required: ['eventId', 'minQuantity', 'discountPercentage'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del descuento por volumen',
            example: 1
          },
          eventId: {
            type: 'integer',
            description: 'ID del evento',
            example: 1
          },
          minQuantity: {
            type: 'integer',
            description: 'Cantidad mínima',
            example: 5
          },
          maxQuantity: {
            type: 'integer',
            description: 'Cantidad máxima (opcional)',
            example: 10
          },
          discountPercentage: {
            type: 'number',
            description: 'Porcentaje de descuento',
            example: 10
          },
          description: {
            type: 'string',
            description: 'Descripción del descuento'
          },
          isActive: {
            type: 'boolean',
            description: 'Estado del descuento',
            default: true
          },
          priority: {
            type: 'integer',
            description: 'Prioridad de aplicación',
            default: 0
          },
          createdBy: {
            type: 'integer',
            description: 'ID del usuario creador'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de actualización'
          }
        }
      },
      EarlyBirdDiscount: {
        type: 'object',
        required: ['eventId', 'daysBeforeEvent', 'discountPercentage'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del descuento early bird',
            example: 1
          },
          eventId: {
            type: 'integer',
            description: 'ID del evento',
            example: 1
          },
          daysBeforeEvent: {
            type: 'integer',
            description: 'Días antes del evento',
            example: 30
          },
          discountPercentage: {
            type: 'number',
            description: 'Porcentaje de descuento',
            example: 15
          },
          description: {
            type: 'string',
            description: 'Descripción del descuento'
          },
          isActive: {
            type: 'boolean',
            description: 'Estado del descuento',
            default: true
          },
          priority: {
            type: 'integer',
            description: 'Prioridad de aplicación',
            default: 0
          },
          autoApply: {
            type: 'boolean',
            description: 'Si se aplica automáticamente',
            default: true
          },
          createdBy: {
            type: 'integer',
            description: 'ID del usuario creador'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de actualización'
          }
        }
      },
      // Request/Response schemas
      ValidatePromoCodeRequest: {
        type: 'object',
        required: ['code', 'eventId'],
        properties: {
          code: {
            type: 'string',
            description: 'Código promocional a validar'
          },
          eventId: {
            type: 'integer',
            description: 'ID del evento'
          },
          userId: {
            type: 'integer',
            description: 'ID del usuario (opcional)'
          },
          cartTotal: {
            type: 'number',
            description: 'Total del carrito (opcional)'
          }
        }
      },
      ValidatePromoCodeResponse: {
        type: 'object',
        properties: {
          valid: {
            type: 'boolean',
            description: 'Si el código es válido'
          },
          promoCode: {
            $ref: '#/components/schemas/PromoCode',
            description: 'Detalles del código promocional'
          },
          discountAmount: {
            type: 'number',
            description: 'Monto del descuento calculado'
          },
          finalAmount: {
            type: 'number',
            description: 'Monto final después del descuento'
          },
          message: {
            type: 'string',
            description: 'Mensaje descriptivo'
          }
        }
      },
      ApplyPromoCodeRequest: {
        type: 'object',
        required: ['code', 'eventId', 'cartTotal'],
        properties: {
          code: {
            type: 'string',
            description: 'Código promocional a aplicar'
          },
          eventId: {
            type: 'integer',
            description: 'ID del evento'
          },
          cartTotal: {
            type: 'number',
            description: 'Total del carrito'
          },
          quantity: {
            type: 'integer',
            description: 'Cantidad de items',
            default: 1
          }
        }
      },
      ApplicableDiscountsRequest: {
        type: 'object',
        required: ['eventId', 'quantity', 'basePrice'],
        properties: {
          eventId: {
            type: 'integer',
            description: 'ID del evento'
          },
          userId: {
            type: 'integer',
            description: 'ID del usuario'
          },
          quantity: {
            type: 'integer',
            description: 'Cantidad de items'
          },
          registrationDate: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de registro'
          },
          basePrice: {
            type: 'number',
            description: 'Precio base'
          },
          currentDiscounts: {
            type: 'array',
            description: 'Descuentos ya aplicados',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                description: { type: 'string' },
                amount: { type: 'number' },
                percentage: { type: 'number' }
              }
            }
          }
        }
      },
      ApplicableDiscountsResponse: {
        type: 'object',
        properties: {
          volumeDiscount: {
            $ref: '#/components/schemas/VolumeDiscount',
            description: 'Descuento por volumen aplicable'
          },
          earlyBirdDiscount: {
            $ref: '#/components/schemas/EarlyBirdDiscount',
            description: 'Descuento early bird aplicable'
          },
          totalDiscount: {
            type: 'number',
            description: 'Descuento total calculado'
          },
          finalPrice: {
            type: 'number',
            description: 'Precio final'
          },
          appliedDiscounts: {
            type: 'array',
            description: 'Descuentos aplicados',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                description: { type: 'string' },
                amount: { type: 'number' },
                percentage: { type: 'number' }
              }
            }
          },
          nextVolumeTier: {
            type: 'object',
            description: 'Próximo nivel de descuento por volumen',
            properties: {
              minQuantity: { type: 'integer' },
              discountPercentage: { type: 'number' },
              additionalSavings: { type: 'number' }
            }
          }
        }
      },
      // Hybrid Events schemas
      VirtualParticipant: {
        type: 'object',
        required: ['id', 'userId', 'hybridEventId', 'status'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del participante virtual',
            example: 1
          },
          userId: {
            type: 'integer',
            description: 'ID del usuario',
            example: 123
          },
          hybridEventId: {
            type: 'integer',
            description: 'ID del evento híbrido',
            example: 456
          },
          roomId: {
            type: 'integer',
            description: 'ID de la sala virtual',
            example: 789
          },
          status: {
            type: 'string',
            enum: ['invited', 'joined', 'left', 'removed', 'blocked'],
            description: 'Estado del participante',
            example: 'joined'
          },
          role: {
            type: 'string',
            enum: ['attendee', 'presenter', 'moderator', 'organizer'],
            description: 'Rol del participante',
            example: 'attendee'
          },
          isModerator: {
            type: 'boolean',
            description: 'Si el participante es moderador',
            example: false
          },
          isMuted: {
            type: 'boolean',
            description: 'Si el participante está silenciado',
            example: false
          },
          isBlocked: {
            type: 'boolean',
            description: 'Si el participante está bloqueado',
            example: false
          },
          moderationNotes: {
            type: 'string',
            description: 'Notas de moderación',
            example: 'Silenciado por spam'
          },
          messagesSent: {
            type: 'integer',
            description: 'Mensajes enviados',
            example: 15
          },
          questionsAsked: {
            type: 'integer',
            description: 'Preguntas realizadas',
            example: 3
          },
          pollsParticipated: {
            type: 'integer',
            description: 'Encuestas participadas',
            example: 5
          },
          totalTimeActive: {
            type: 'integer',
            description: 'Tiempo total activo (segundos)',
            example: 3600
          },
          averageLatency: {
            type: 'number',
            description: 'Latencia promedio (ms)',
            example: 45.2
          },
          lastActivity: {
            type: 'string',
            format: 'date-time',
            description: 'Última actividad'
          },
          lastPingAt: {
            type: 'string',
            format: 'date-time',
            description: 'Último ping'
          },
          joinedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de unión'
          },
          leftAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de salida'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de actualización'
          }
        }
      },
      HybridEvent: {
        type: 'object',
        required: ['id', 'eventId', 'modality'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del evento híbrido',
            example: 1
          },
          eventId: {
            type: 'integer',
            description: 'ID del evento base',
            example: 123
          },
          modality: {
            type: 'string',
            enum: ['presential_only', 'virtual_only', 'hybrid'],
            description: 'Modalidad del evento',
            example: 'hybrid'
          },
          streamingPlatform: {
            type: 'string',
            enum: ['zoom', 'google_meet', 'microsoft_teams', 'jitsi', 'custom_streaming'],
            description: 'Plataforma de streaming',
            example: 'zoom'
          },
          streamingConfigId: {
            type: 'integer',
            description: 'ID de la configuración de streaming',
            example: 456
          },
          virtualRoomId: {
            type: 'integer',
            description: 'ID de la sala virtual',
            example: 789
          },
          maxVirtualParticipants: {
            type: 'integer',
            description: 'Máximo participantes virtuales',
            example: 500
          },
          isRecordingEnabled: {
            type: 'boolean',
            description: 'Si la grabación está habilitada',
            example: true
          },
          isChatEnabled: {
            type: 'boolean',
            description: 'Si el chat está habilitado',
            example: true
          },
          isQAndAEnabled: {
            type: 'boolean',
            description: 'Si Q&A está habilitado',
            example: true
          },
          isPollingEnabled: {
            type: 'boolean',
            description: 'Si encuestas están habilitadas',
            example: true
          },
          encryptionEnabled: {
            type: 'boolean',
            description: 'Si el encriptación está habilitada',
            example: true
          },
          createdBy: {
            type: 'integer',
            description: 'ID del usuario creador',
            example: 1
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de actualización'
          }
        }
      },
      StreamingConfig: {
        type: 'object',
        required: ['id', 'platform', 'meetingId'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único de la configuración',
            example: 1
          },
          platform: {
            type: 'string',
            enum: ['zoom', 'google_meet', 'microsoft_teams', 'jitsi', 'custom_streaming'],
            description: 'Plataforma de streaming',
            example: 'zoom'
          },
          meetingId: {
            type: 'string',
            description: 'ID de la reunión',
            example: '123456789'
          },
          meetingPassword: {
            type: 'string',
            description: 'Contraseña de la reunión',
            example: 'abc123'
          },
          hostUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL del host',
            example: 'https://zoom.us/j/123456789?pwd=abc123'
          },
          attendeeUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL de los asistentes',
            example: 'https://zoom.us/j/123456789'
          },
          apiKey: {
            type: 'string',
            description: 'API Key de la plataforma',
            example: 'zoom_api_key_123'
          },
          apiSecret: {
            type: 'string',
            description: 'API Secret de la plataforma',
            example: 'zoom_api_secret_456'
          },
          webhookUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL de webhook',
            example: 'https://api.tradeconnect.com/webhooks/streaming'
          },
          isActive: {
            type: 'boolean',
            description: 'Si la configuración está activa',
            example: true
          },
          settings: {
            type: 'object',
            description: 'Configuraciones específicas de la plataforma',
            properties: {
              record: { type: 'boolean', example: true },
              autoRecord: { type: 'boolean', example: false },
              muteOnEntry: { type: 'boolean', example: true },
              waitingRoom: { type: 'boolean', example: false },
              quality: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' }
            }
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de expiración'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de actualización'
          }
        }
      },
      // Request/Response schemas for Hybrid Events
      CreateHybridEventRequest: {
        type: 'object',
        required: ['eventId', 'modality'],
        properties: {
          eventId: {
            type: 'integer',
            description: 'ID del evento a convertir en híbrido',
            example: 123
          },
          modality: {
            type: 'string',
            enum: ['presential_only', 'virtual_only', 'hybrid'],
            description: 'Modalidad del evento',
            example: 'hybrid'
          },
          streamingPlatform: {
            type: 'string',
            enum: ['zoom', 'google_meet', 'microsoft_teams', 'jitsi', 'custom_streaming'],
            description: 'Plataforma de streaming',
            example: 'zoom'
          },
          maxVirtualParticipants: {
            type: 'integer',
            minimum: 1,
            maximum: 10000,
            description: 'Máximo participantes virtuales',
            example: 500
          },
          isRecordingEnabled: {
            type: 'boolean',
            description: 'Habilitar grabación',
            default: false,
            example: true
          },
          isChatEnabled: {
            type: 'boolean',
            description: 'Habilitar chat',
            default: true,
            example: true
          },
          isQAndAEnabled: {
            type: 'boolean',
            description: 'Habilitar Q&A',
            default: true,
            example: true
          },
          isPollingEnabled: {
            type: 'boolean',
            description: 'Habilitar encuestas',
            default: true,
            example: true
          },
          encryptionEnabled: {
            type: 'boolean',
            description: 'Habilitar encriptación end-to-end',
            default: true,
            example: true
          }
        }
      },
      UpdateHybridEventRequest: {
        type: 'object',
        properties: {
          modality: {
            type: 'string',
            enum: ['presential_only', 'virtual_only', 'hybrid'],
            description: 'Nueva modalidad del evento'
          },
          streamingPlatform: {
            type: 'string',
            enum: ['zoom', 'google_meet', 'microsoft_teams', 'jitsi', 'custom_streaming'],
            description: 'Nueva plataforma de streaming'
          },
          maxVirtualParticipants: {
            type: 'integer',
            minimum: 1,
            maximum: 10000,
            description: 'Nuevo máximo participantes virtuales'
          },
          isRecordingEnabled: {
            type: 'boolean',
            description: 'Cambiar estado de grabación'
          },
          isChatEnabled: {
            type: 'boolean',
            description: 'Cambiar estado del chat'
          },
          isQAndAEnabled: {
            type: 'boolean',
            description: 'Cambiar estado de Q&A'
          },
          isPollingEnabled: {
            type: 'boolean',
            description: 'Cambiar estado de encuestas'
          },
          encryptionEnabled: {
            type: 'boolean',
            description: 'Cambiar estado de encriptación'
          }
        }
      },
      JoinVirtualEventRequest: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'Token de acceso JWT para streams privados',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          deviceInfo: {
            type: 'object',
            description: 'Información del dispositivo',
            properties: {
              userAgent: { type: 'string', example: 'Mozilla/5.0...' },
              platform: { type: 'string', example: 'web' },
              screenResolution: { type: 'string', example: '1920x1080' }
            }
          },
          preferredQuality: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'auto'],
            description: 'Calidad preferida de video',
            example: 'high'
          }
        }
      },
      StartStreamingRequest: {
        type: 'object',
        properties: {
          quality: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Calidad del stream',
            default: 'high',
            example: 'high'
          },
          record: {
            type: 'boolean',
            description: 'Habilitar grabación',
            default: false,
            example: true
          },
          autoStartRecording: {
            type: 'boolean',
            description: 'Iniciar grabación automáticamente',
            default: false,
            example: false
          },
          enableChat: {
            type: 'boolean',
            description: 'Habilitar chat',
            default: true,
            example: true
          },
          enableQAndA: {
            type: 'boolean',
            description: 'Habilitar Q&A',
            default: true,
            example: true
          },
          enablePolling: {
            type: 'boolean',
            description: 'Habilitar encuestas',
            default: true,
            example: true
          },
          moderatorOnlyControls: {
            type: 'boolean',
            description: 'Solo moderadores pueden controlar',
            default: true,
            example: true
          }
        }
      },
      VirtualAccessResponse: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'Token JWT para acceso al stream',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          streamUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL del stream',
            example: 'https://zoom.us/j/123456789'
          },
          websocketUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL de WebSocket para comunicación en tiempo real',
            example: 'wss://api.tradeconnect.com/socket.io/'
          },
          participantId: {
            type: 'integer',
            description: 'ID del participante asignado',
            example: 123
          },
          roomId: {
            type: 'string',
            description: 'ID de la sala',
            example: 'room_456'
          },
          permissions: {
            type: 'object',
            description: 'Permisos del participante',
            properties: {
              canChat: { type: 'boolean', example: true },
              canAskQuestions: { type: 'boolean', example: true },
              canVotePolls: { type: 'boolean', example: true },
              canModerate: { type: 'boolean', example: false },
              canShareScreen: { type: 'boolean', example: false }
            }
          },
          encryptionKey: {
            type: 'string',
            description: 'Clave de encriptación para datos sensibles',
            example: 'a1b2c3d4e5f678901234567890123456789012345678901234567890'
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de expiración del token'
          }
        }
      },
      // Moderation schemas
      ModerationActionRequest: {
        type: 'object',
        required: ['action', 'participantId'],
        properties: {
          action: {
            type: 'string',
            enum: ['mute', 'unmute', 'block', 'change_role'],
            description: 'Acción de moderación',
            example: 'mute'
          },
          participantId: {
            type: 'integer',
            description: 'ID del participante',
            example: 123
          },
          reason: {
            type: 'string',
            description: 'Razón de la acción',
            example: 'Comportamiento disruptivo'
          },
          newRole: {
            type: 'string',
            enum: ['attendee', 'presenter', 'moderator', 'organizer'],
            description: 'Nuevo rol (solo para change_role)',
            example: 'moderator'
          },
          duration: {
            type: 'integer',
            description: 'Duración en minutos (para acciones temporales)',
            example: 15
          }
        }
      },
      ModerationActionResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          action: { type: 'string', example: 'mute' },
          participantId: { type: 'integer', example: 123 },
          moderatorId: { type: 'integer', example: 456 },
          timestamp: { type: 'string', format: 'date-time' },
          reason: { type: 'string', example: 'Comportamiento disruptivo' },
          expiresAt: { type: 'string', format: 'date-time' }
        }
      },
      // WebSocket/Socket.io schemas
      SocketEventData: {
        type: 'object',
        properties: {
          event: {
            type: 'string',
            description: 'Tipo de evento',
            example: 'chat_message'
          },
          data: {
            type: 'object',
            description: 'Datos del evento',
            example: {
              message: 'Hola a todos!',
              senderId: 123,
              timestamp: '2024-01-01T12:00:00Z'
            }
          },
          roomId: {
            type: 'string',
            description: 'ID de la sala',
            example: 'room_456'
          },
          userId: {
            type: 'integer',
            description: 'ID del usuario',
            example: 123
          }
        }
      },
      // WebSocket Events Documentation
      WebSocketChatMessage: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            description: 'Contenido del mensaje',
            example: 'Hola a todos los participantes!'
          },
          messageType: {
            type: 'string',
            enum: ['text', 'emoji', 'system'],
            description: 'Tipo de mensaje',
            default: 'text',
            example: 'text'
          },
          replyTo: {
            type: 'integer',
            description: 'ID del mensaje al que se responde',
            example: 123
          }
        }
      },
      WebSocketQuestion: {
        type: 'object',
        required: ['question'],
        properties: {
          question: {
            type: 'string',
            description: 'Texto de la pregunta',
            example: '¿Cuál es el horario de la próxima sesión?'
          },
          isAnonymous: {
            type: 'boolean',
            description: 'Si la pregunta es anónima',
            default: false,
            example: false
          },
          category: {
            type: 'string',
            enum: ['general', 'technical', 'schedule', 'content'],
            description: 'Categoría de la pregunta',
            example: 'schedule'
          }
        }
      },
      WebSocketPollVote: {
        type: 'object',
        required: ['pollId', 'optionId'],
        properties: {
          pollId: {
            type: 'integer',
            description: 'ID de la encuesta',
            example: 456
          },
          optionId: {
            type: 'integer',
            description: 'ID de la opción seleccionada',
            example: 2
          }
        }
      },
      WebSocketModerationAction: {
        type: 'object',
        required: ['action', 'targetUserId'],
        properties: {
          action: {
            type: 'string',
            enum: ['mute', 'unmute', 'block', 'change_role'],
            description: 'Acción de moderación',
            example: 'mute'
          },
          targetUserId: {
            type: 'integer',
            description: 'ID del usuario objetivo',
            example: 789
          },
          reason: {
            type: 'string',
            description: 'Razón de la acción',
            example: 'Comportamiento disruptivo'
          },
          duration: {
            type: 'integer',
            description: 'Duración en minutos (para acciones temporales)',
            example: 15
          }
        }
      },
      // Security schemas
      StreamTokenRequest: {
        type: 'object',
        required: ['eventId', 'participantId'],
        properties: {
          eventId: {
            type: 'integer',
            description: 'ID del evento',
            example: 123
          },
          participantId: {
            type: 'integer',
            description: 'ID del participante',
            example: 456
          },
          platform: {
            type: 'string',
            enum: ['zoom', 'google_meet', 'microsoft_teams', 'jitsi'],
            description: 'Plataforma de streaming',
            example: 'zoom'
          },
          expiresInHours: {
            type: 'integer',
            description: 'Horas de validez del token',
            default: 24,
            example: 24
          }
        }
      },
      StreamTokenResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'Token JWT generado',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de expiración'
          },
          participantId: { type: 'integer', example: 456 },
          eventId: { type: 'integer', example: 123 },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['read', 'write', 'moderate']
          }
        }
      },
        CartResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del carrito'
            },
            sessionId: {
              type: 'string',
              description: 'ID de sesión del carrito'
            },
            userId: {
              type: 'integer',
              description: 'ID del usuario'
            },
            totalItems: {
              type: 'integer',
              description: 'Total de items'
            },
            subtotal: {
              type: 'number',
              description: 'Subtotal sin descuentos'
            },
            discountAmount: {
              type: 'number',
              description: 'Monto de descuentos'
            },
            total: {
              type: 'number',
              description: 'Total final'
            },
            promoCode: {
              type: 'string',
              description: 'Código promocional aplicado'
            },
            promoDiscount: {
              type: 'number',
              description: 'Descuento por código promocional'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de expiración'
            },
            lastActivity: {
              type: 'string',
              format: 'date-time',
              description: 'Última actividad'
            },
            isAbandoned: {
              type: 'boolean',
              description: 'Si el carrito fue abandonado'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  cartId: { type: 'integer' },
                  eventId: { type: 'integer' },
                  participantType: { type: 'string' },
                  quantity: { type: 'integer' },
                  basePrice: { type: 'number' },
                  discountAmount: { type: 'number' },
                  finalPrice: { type: 'number' },
                  total: { type: 'number' },
                  isGroupRegistration: { type: 'boolean' },
                  customFields: { type: 'object' },
                  addedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          },
          paths: {
            // FEL paths
            '/api/v1/fel/authenticate': {
              post: {
                tags: ['FEL'],
                summary: 'Autenticar con certificador FEL',
                description: 'Obtiene un token de autenticación del certificador FEL especificado',
                security: [{ bearerAuth: [] }],
                parameters: [
                  {
                    name: 'certifier',
                    in: 'query',
                    required: true,
                    schema: { type: 'string', enum: ['infile', 'dimexa'] },
                    description: 'Nombre del certificador FEL'
                  }
                ],
                responses: {
                  200: {
                    description: 'Token obtenido exitosamente',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/ApiResponse' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/certify-dte': {
              post: {
                tags: ['FEL'],
                summary: 'Certificar Documento Tributario Electrónico',
                description: 'Envía un DTE para certificación ante el SAT',
                security: [{ bearerAuth: [] }],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['invoiceId'],
                        properties: {
                          invoiceId: { type: 'integer', description: 'ID de la factura' }
                        }
                      }
                    }
                  }
                },
                responses: {
                  200: {
                    description: 'DTE certificado exitosamente',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/ApiResponse' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  404: { description: 'Factura no encontrada' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/cancel-dte': {
              post: {
                tags: ['FEL'],
                summary: 'Anular Documento Tributario Electrónico',
                description: 'Anula un DTE certificado',
                security: [{ bearerAuth: [] }],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/InvoiceCancelRequest' }
                    }
                  }
                },
                responses: {
                  200: {
                    description: 'DTE anulado exitosamente',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/ApiResponse' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  404: { description: 'Factura no encontrada' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/consult-dte/{uuid}': {
              get: {
                tags: ['FEL'],
                summary: 'Consultar estado de DTE',
                description: 'Consulta el estado de un DTE ante el SAT',
                security: [{ bearerAuth: [] }],
                parameters: [
                  {
                    name: 'uuid',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    description: 'UUID del documento FEL'
                  }
                ],
                responses: {
                  200: {
                    description: 'Estado del DTE obtenido',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/ApiResponse' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  404: { description: 'Documento no encontrado' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/auto-generate/{registrationId}': {
              post: {
                tags: ['FEL'],
                summary: 'Generar factura automáticamente',
                description: 'Genera factura FEL automáticamente después de un pago exitoso',
                security: [{ bearerAuth: [] }],
                parameters: [
                  {
                    name: 'registrationId',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de la inscripción'
                  }
                ],
                requestBody: {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/InvoiceGenerationRequest' }
                    }
                  }
                },
                responses: {
                  200: {
                    description: 'Factura generada exitosamente',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/ApiResponse' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  404: { description: 'Inscripción no encontrada' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/download-pdf/{uuid}': {
              get: {
                tags: ['FEL'],
                summary: 'Descargar PDF de factura',
                description: 'Descarga el PDF de una factura certificada',
                security: [{ bearerAuth: [] }],
                parameters: [
                  {
                    name: 'uuid',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    description: 'UUID del documento FEL'
                  }
                ],
                responses: {
                  200: {
                    description: 'PDF descargado exitosamente',
                    content: {
                      'application/pdf': {
                        schema: { type: 'string', format: 'binary' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  404: { description: 'Documento no encontrado' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/retry-failed': {
              post: {
                tags: ['FEL'],
                summary: 'Reintentar operaciones fallidas',
                description: 'Reintenta la certificación de documentos FEL que fallaron',
                security: [{ bearerAuth: [] }],
                responses: {
                  200: {
                    description: 'Reintentos procesados exitosamente',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/ApiResponse' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/token/status': {
              get: {
                tags: ['FEL'],
                summary: 'Estado del token FEL',
                description: 'Obtiene el estado actual del token de autenticación FEL',
                security: [{ bearerAuth: [] }],
                responses: {
                  200: {
                    description: 'Estado del token obtenido',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/ApiResponse' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/token/refresh': {
              post: {
                tags: ['FEL'],
                summary: 'Renovar token FEL',
                description: 'Renueva el token de autenticación FEL antes de que expire',
                security: [{ bearerAuth: [] }],
                responses: {
                  200: {
                    description: 'Token renovado exitosamente',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/ApiResponse' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/validate-nit': {
              post: {
                tags: ['FEL Validation'],
                summary: 'Validar NIT',
                description: 'Valida un NIT ante el sistema tributario guatemalteco',
                security: [{ bearerAuth: [] }],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/FelValidationRequest' }
                    }
                  }
                },
                responses: {
                  200: {
                    description: 'NIT validado exitosamente',
                    content: {
                      'application/json': {
                        schema: {
                          allOf: [
                            { $ref: '#/components/schemas/ApiResponse' },
                            {
                              properties: {
                                data: { $ref: '#/components/schemas/NitValidationResponse' }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  400: { description: 'NIT inválido' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/validate-cui': {
              post: {
                tags: ['FEL Validation'],
                summary: 'Validar CUI',
                description: 'Valida un CUI ante el Registro Nacional de Personas',
                security: [{ bearerAuth: [] }],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/FelCuiValidationRequest' }
                    }
                  }
                },
                responses: {
                  200: {
                    description: 'CUI validado exitosamente',
                    content: {
                      'application/json': {
                        schema: {
                          allOf: [
                            { $ref: '#/components/schemas/ApiResponse' },
                            {
                              properties: {
                                data: { $ref: '#/components/schemas/CuiValidationResponse' }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  400: { description: 'CUI inválido' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/fel/validation-history': {
              get: {
                tags: ['FEL Validation'],
                summary: 'Historial de validaciones',
                description: 'Obtiene el historial de validaciones NIT/CUI realizadas',
                security: [{ bearerAuth: [] }],
                parameters: [
                  {
                    name: 'type',
                    in: 'query',
                    schema: { type: 'string', enum: ['nit', 'cui'] },
                    description: 'Tipo de validación'
                  },
                  {
                    name: 'limit',
                    in: 'query',
                    schema: { type: 'integer', default: 50 },
                    description: 'Límite de resultados'
                  }
                ],
                responses: {
                  200: {
                    description: 'Historial obtenido exitosamente',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/ApiResponse' }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/invoices': {
              get: {
                tags: ['Invoices'],
                summary: 'Listar facturas',
                description: 'Obtiene la lista de facturas con filtros opcionales',
                security: [{ bearerAuth: [] }],
                parameters: [
                  {
                    name: 'status',
                    in: 'query',
                    schema: { type: 'string', enum: ['draft', 'pending', 'certified', 'sent', 'cancelled', 'expired'] },
                    description: 'Estado de la factura'
                  },
                  {
                    name: 'registrationId',
                    in: 'query',
                    schema: { type: 'integer' },
                    description: 'ID de la inscripción'
                  },
                  {
                    name: 'limit',
                    in: 'query',
                    schema: { type: 'integer', default: 50 },
                    description: 'Límite de resultados'
                  },
                  {
                    name: 'offset',
                    in: 'query',
                    schema: { type: 'integer', default: 0 },
                    description: 'Desplazamiento'
                  }
                ],
                responses: {
                  200: {
                    description: 'Facturas obtenidas exitosamente',
                    content: {
                      'application/json': {
                        schema: {
                          allOf: [
                            { $ref: '#/components/schemas/ApiResponse' },
                            {
                              properties: {
                                data: {
                                  type: 'array',
                                  items: { $ref: '#/components/schemas/InvoiceResponse' }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  500: { description: 'Error interno del servidor' }
                }
              },
              post: {
                tags: ['Invoices'],
                summary: 'Crear factura',
                description: 'Crea una nueva factura',
                security: [{ bearerAuth: [] }],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/InvoiceGenerationRequest' }
                    }
                  }
                },
                responses: {
                  201: {
                    description: 'Factura creada exitosamente',
                    content: {
                      'application/json': {
                        schema: {
                          allOf: [
                            { $ref: '#/components/schemas/ApiResponse' },
                            {
                              properties: {
                                data: { $ref: '#/components/schemas/InvoiceResponse' }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  400: { description: 'Datos inválidos' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/invoices/{id}': {
              get: {
                tags: ['Invoices'],
                summary: 'Obtener factura por ID',
                description: 'Obtiene los detalles de una factura específica',
                security: [{ bearerAuth: [] }],
                parameters: [
                  {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de la factura'
                  }
                ],
                responses: {
                  200: {
                    description: 'Factura obtenida exitosamente',
                    content: {
                      'application/json': {
                        schema: {
                          allOf: [
                            { $ref: '#/components/schemas/ApiResponse' },
                            {
                              properties: {
                                data: { $ref: '#/components/schemas/InvoiceResponse' }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  404: { description: 'Factura no encontrada' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            },
            '/api/v1/invoices/registration/{regId}': {
              get: {
                tags: ['Invoices'],
                summary: 'Facturas por inscripción',
                description: 'Obtiene todas las facturas de una inscripción específica',
                security: [{ bearerAuth: [] }],
                parameters: [
                  {
                    name: 'regId',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' },
                    description: 'ID de la inscripción'
                  }
                ],
                responses: {
                  200: {
                    description: 'Facturas obtenidas exitosamente',
                    content: {
                      'application/json': {
                        schema: {
                          allOf: [
                            { $ref: '#/components/schemas/ApiResponse' },
                            {
                              properties: {
                                data: {
                                  type: 'array',
                                  items: { $ref: '#/components/schemas/InvoiceResponse' }
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  401: { description: 'No autorizado' },
                  404: { description: 'Inscripción no encontrada' },
                  500: { description: 'Error interno del servidor' }
                }
              }
            }
          }
        },
        // WebSocket/Socket.io endpoints documentation
        websocket: {
          summary: 'WebSocket/Socket.io Events',
          description: `
  ## Eventos de WebSocket para Eventos Híbridos
  
  ### Conexión y Autenticación
  - **connect**: Cliente se conecta al servidor WebSocket
  - **authenticate**: Autenticación del participante (requiere token JWT)
  - **disconnect**: Cliente se desconecta
  
  ### Chat y Comunicación
  - **chat_message**: Enviar mensaje de chat
  - **chat_history**: Solicitar historial de mensajes
  - **message_received**: Confirmación de mensaje recibido
  - **typing_start/typing_stop**: Indicadores de escritura
  
  ### Preguntas y Respuestas (Q&A)
  - **ask_question**: Enviar pregunta
  - **answer_question**: Responder pregunta (solo moderadores)
  - **question_upvote**: Votar pregunta
  - **question_answered**: Marcar pregunta como respondida
  
  ### Encuestas
  - **poll_vote**: Votar en encuesta
  - **poll_results**: Solicitar resultados actualizados
  - **poll_created**: Nueva encuesta creada
  
  ### Moderación
  - **moderation_action**: Acción de moderación (mute, unmute, block, change_role)
  - **participant_muted/unmuted**: Estado de mute actualizado
  - **participant_blocked**: Participante bloqueado
  - **role_changed**: Rol de participante cambiado
  
  ### Streaming y Participantes
  - **stream_started/stopped**: Estado del stream
  - **participant_joined/left**: Participantes uniéndose/saliendo
  - **participant_count**: Conteo actualizado de participantes
  - **quality_changed**: Cambio de calidad de video
  
  ### Notificaciones
  - **notification**: Notificación general del sistema
  - **private_message**: Mensaje privado (moderador a participante)
  
  ### Eventos del Sistema
  - **ping/pong**: Heartbeat para mantener conexión
  - **error**: Error en la comunicación
  - **reconnect**: Reconexión automática
  
  ### Autenticación Requerida
  Todos los eventos requieren autenticación previa mediante el evento 'authenticate' con un token JWT válido.
  
  ### Salas (Rooms)
  Los participantes se unen automáticamente a la sala del evento híbrido correspondiente.
  
  ### Rate Limiting
  Se aplican límites de rate por participante para prevenir abuso (60 mensajes/minuto por defecto).
          `,
          tags: ['WebSocket'],
          responses: {
            101: {
              description: 'WebSocket connection established'
            }
          }
        }
      }
    },
    apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
    './src/services/*.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ====================================================================
// RUTAS PRINCIPALES
// ====================================================================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página de bienvenida de la API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Información básica de la API
 */
app.get('/', (req, res) => {
  res.json(successResponse({
    name: 'TradeConnect Platform API',
    version: '1.0.0',
    description: 'Plataforma e-commerce para gestión de eventos empresariales',
    environment: config.NODE_ENV,
    endpoints: {
      health: '/health',
      documentation: '/api/docs',
      swaggerJson: '/api/docs.json',
      api: {
        v1: '/api/v1',
        legacy: '/api (redirects to v1)'
      },
      modules: [
        'Authentication & Users',
        'Events Management (CORE)',
        'Registration System',
        'Payment Processing',
        'FEL Integration',
        'QR Codes & Access Control',
        'Certificate Generation',
        'Notifications',
        'Hybrid Events (Advanced)',
        'Real-time Communication (WebSocket)',
        'Streaming & Moderation',
        'Virtual Participants Management',
        'Stream Security & Encryption',
        'Engagement Analytics',
        'Reports & Analytics',
        'Promotions & Discounts'
      ]
    }
  }, 'Welcome to TradeConnect Platform API'));
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del sistema
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Sistema funcionando correctamente
 *       503:
 *         description: Sistema no disponible
 */
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a base de datos
    await sequelize.authenticate();
    const dbStatus = 'connected';
    
    // Verificar conexión a Redis
    const redisStatus = await testRedisConnection() ? 'connected' : 'disconnected';
    
    // Determinar estado general del sistema
    const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: '1.0.0',
      services: {
        database: dbStatus,
        redis: redisStatus,
        api: 'running'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid
    };
    
    if (isHealthy) {
      res.status(200).json(successResponse(healthData, 'System is healthy'));
    } else {
      res.status(503).json(errorResponse('System is unhealthy', JSON.stringify(healthData)));
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json(errorResponse(
      'Health check failed', 
      error instanceof Error ? error.message : 'Unknown error'
    ));
  }
});

/**
 * @swagger
 * /info:
 *   get:
 *     summary: Información detallada del sistema
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Información del sistema
 */
app.get('/info', (req, res) => {
  res.json(successResponse({
    application: {
      name: 'TradeConnect Platform',
      version: '1.0.0',
      description: 'Plataforma completa para gestión de eventos empresariales',
      author: 'TradeConnect Team'
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      pid: process.pid
    },
    features: {
      modules: 20,
      endpoints: 185, // Total endpoints implemented: auth(25) + users(6) + sessions(6) + events(54) + speakers(8) + registrations(6) + cart(7) + public(6) + payments(15) + refunds(4) + webhooks(6) + promotions(7) + discounts(5) + hybrid-events(12) + streaming(15) + virtual-participants(12) + general(4)
      paymentGateways: ['PayPal', 'Stripe', 'NeoNet', 'BAM'],
      felIntegration: true,
      blockchainSupport: true,
      qrCodes: true,
      certificates: true,
      hybridEvents: true,
      realtimeCommunication: true,
      websocketSupport: true,
      advancedModeration: true,
      streamSecurity: true,
      engagementAnalytics: true
    }
  }, 'System information retrieved successfully'));
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Métricas de performance del sistema
 *     description: Obtiene métricas detalladas de performance del sistema
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 */
app.get('/metrics', async (req, res) => {
  try {
    const metrics = metricsService.getAllMetrics();

    // Verificar umbrales y loggear si es necesario
    metricsService.checkThresholds();

    res.json(successResponse(metrics, 'System metrics retrieved successfully'));
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json(errorResponse('Error retrieving metrics'));
  }
});

// ====================================================================
// RUTAS DE LA API
// ====================================================================

// Rutas de documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    syntaxHighlight: {
      activate: true,
      theme: 'arta'
    },
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Agregar token JWT si existe en localStorage/sessionStorage
      const token = req.headers.Authorization || localStorage.getItem('jwt_token');
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      return req;
    }
  }
}));

// Endpoint para obtener la especificación Swagger en JSON
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Version 1
const API_VERSION = '/api/v1';

// Rutas de autenticación
app.use(`${API_VERSION}/auth`, authRoutes);

// Rutas de usuarios
app.use(`${API_VERSION}/users`, userRoutes);

// Rutas de sesiones
app.use(`${API_VERSION}/sessions`, sessionRoutes);

// Rutas de eventos
app.use(`${API_VERSION}/events`, eventRoutes);

// Rutas de sesiones de eventos
app.use(`${API_VERSION}/events`, eventSessionsRoutes);

// Rutas de plantillas de eventos
app.use(`${API_VERSION}/event-templates`, eventTemplateRoutes);

// Rutas de categorías y tipos de eventos
app.use(`${API_VERSION}/event-categories`, eventCategoryRoutes);

// Rutas de inscripciones a eventos
app.use(`${API_VERSION}/event-registrations`, eventRegistrationRoutes);

// Rutas de reportes y analytics
app.use(`${API_VERSION}/event-reports`, eventReportsRoutes);

// Rutas de certificados blockchain
app.use(`${API_VERSION}/certificates`, certificateRoutes);

// Rutas de speakers
import speakersRoutes from './routes/speakers';
import speakerContractRoutes from './routes/speaker-contracts';
import speakerDashboardRoutes from './routes/speakerDashboard';
app.use(`${API_VERSION}/speakers`, speakersRoutes);
app.use(`${API_VERSION}/speaker-contracts`, speakerContractRoutes);
app.use(`${API_VERSION}/speakers/dashboard`, speakerDashboardRoutes);

// Rutas de inscripciones y carrito
import registrationRoutes from './routes/registrations';
import cartRoutes from './routes/cart';
app.use(`${API_VERSION}/registrations`, registrationRoutes);
app.use(`${API_VERSION}/cart`, cartRoutes);

// Rutas públicas
app.use(`${API_VERSION}/public`, publicRoutes);

// Rutas CMS (gestión de contenido)
import cmsRoutes from './routes/cms';
app.use(`${API_VERSION}/cms`, cmsRoutes);

// Rutas de pagos
import paymentsRoutes from './routes/payments';
import refundsRoutes from './routes/refunds';
import webhooksRoutes from './routes/webhooks';
app.use(`${API_VERSION}/payments`, paymentsRoutes);
app.use(`${API_VERSION}/refunds`, refundsRoutes);
app.use(`${API_VERSION}/webhooks`, webhooksRoutes);

// Rutas FEL (Facturación Electrónica)
import felRoutes from './routes/fel';
import felValidationRoutes from './routes/fel-validation';
import invoicesRoutes from './routes/invoices';
app.use(`${API_VERSION}/fel`, felRoutes);
app.use(`${API_VERSION}/fel/validation`, felValidationRoutes);
app.use(`${API_VERSION}/invoices`, invoicesRoutes);

// Rutas de promociones y descuentos ya están importadas arriba

// Rutas de promociones y descuentos
app.use(`${API_VERSION}/promotions`, promotionRoutes);
app.use(`${API_VERSION}/discounts`, discountRoutes);

// Rutas de cupones avanzados
import advancedCouponRoutes from './routes/advanced-coupons';
app.use(`${API_VERSION}/advanced-coupons`, advancedCouponRoutes);

// Rutas de usuarios avanzados
import advancedUserRoutes from './routes/advanced-users';
app.use(`${API_VERSION}/advanced-users`, advancedUserRoutes);

// Rutas de roles del sistema
import rolesRoutes from './routes/roles';
app.use(`${API_VERSION}/roles`, rolesRoutes);

// Rutas de auditoría y logs
import auditRoutes from './routes/audit';
app.use(`${API_VERSION}/audit`, auditRoutes);

// Rutas de finanzas
console.log('🔍 [DEBUG] Registering finance routes...', { financeRoutes: typeof financeRoutes, API_VERSION });
app.use(`${API_VERSION}/finance`, financeRoutes);
console.log('✅ [DEBUG] Finance routes registered');

// Rutas del módulo de aforos
app.use(`${API_VERSION}/capacity`, capacityRoutes);
app.use(`${API_VERSION}/access-types`, accessTypesRoutes);
app.use(`${API_VERSION}/overbooking`, overbookingRoutes);

// Rutas del módulo QR y control de acceso
app.use(`${API_VERSION}/qr`, qrRoutes);

// Rutas del módulo de notificaciones
app.use(`${API_VERSION}/notifications`, notificationRoutes);
app.use(`${API_VERSION}/email-templates`, emailTemplateRoutes);
app.use(`${API_VERSION}/notification-rules`, notificationRuleRoutes);
app.use(`${API_VERSION}/user/preferences`, userPreferencesRoutes);

// Rutas de campañas de email
app.use(`${API_VERSION}/campaigns`, campaignRoutes);

// Rutas del módulo de eventos híbridos
app.use(`${API_VERSION}/hybrid-events`, hybridEventRoutes);
app.use(`${API_VERSION}/streaming`, streamingRoutes);
app.use(`${API_VERSION}/virtual-participants`, virtualParticipantRoutes);

// Rutas de configuración del sistema
import systemRoutes from './routes/system';
app.use(`${API_VERSION}/system`, systemRoutes);

// Rutas de administración
import adminRoutes from './routes/admin';
app.use(`${API_VERSION}/admin`, adminRoutes);

// Backward compatibility - redirect old API routes to v1
app.use('/api/auth', (req, res) => res.redirect(301, `${API_VERSION}/auth${req.path}`));
app.use('/api/users', (req, res) => res.redirect(301, `${API_VERSION}/users${req.path}`));
app.use('/api/sessions', (req, res) => res.redirect(301, `${API_VERSION}/sessions${req.path}`));
app.use('/api/events', (req, res) => res.redirect(301, `${API_VERSION}/events${req.path}`));
app.use('/api/event-templates', (req, res) => res.redirect(301, `${API_VERSION}/event-templates${req.path}`));
app.use('/api/event-categories', (req, res) => res.redirect(301, `${API_VERSION}/event-categories${req.path}`));
app.use('/api/event-registrations', (req, res) => res.redirect(301, `${API_VERSION}/event-registrations${req.path}`));
app.use('/api/event-reports', (req, res) => res.redirect(301, `${API_VERSION}/event-reports${req.path}`));
app.use('/api/certificates', (req, res) => res.redirect(301, `${API_VERSION}/certificates${req.path}`));
app.use('/api/speakers', (req, res) => res.redirect(301, `${API_VERSION}/speakers${req.path}`));
app.use('/api/speakers/dashboard', (req, res) => res.redirect(301, `${API_VERSION}/speakers/dashboard${req.path}`));
app.use('/api/speaker-contracts', (req, res) => res.redirect(301, `${API_VERSION}/speaker-contracts${req.path}`));
app.use('/api/registrations', (req, res) => res.redirect(301, `${API_VERSION}/registrations${req.path}`));
app.use('/api/cart', (req, res) => res.redirect(301, `${API_VERSION}/cart${req.path}`));
app.use('/api/public', (req, res) => res.redirect(301, `${API_VERSION}/public${req.path}`));
app.use('/api/cms', (req, res) => res.redirect(301, `${API_VERSION}/cms${req.path}`));
app.use('/api/payments', (req, res) => res.redirect(301, `${API_VERSION}/payments${req.path}`));
app.use('/api/refunds', (req, res) => res.redirect(301, `${API_VERSION}/refunds${req.path}`));
app.use('/api/webhooks', (req, res) => res.redirect(301, `${API_VERSION}/webhooks${req.path}`));

// Backward compatibility - FEL routes
app.use('/api/fel', (req, res) => res.redirect(301, `${API_VERSION}/fel${req.path}`));
app.use('/api/invoices', (req, res) => res.redirect(301, `${API_VERSION}/invoices${req.path}`));

// Backward compatibility - Notification routes
app.use('/api/notifications', (req, res) => res.redirect(301, `${API_VERSION}/notifications${req.path}`));
app.use('/api/email-templates', (req, res) => res.redirect(301, `${API_VERSION}/email-templates${req.path}`));
app.use('/api/notification-rules', (req, res) => res.redirect(301, `${API_VERSION}/notification-rules${req.path}`));

// ====================================================================
// MANEJO DE ERRORES 404
// ====================================================================
app.use((req, res, next) => {
  res.status(404).json(errorResponse(
    `Route ${req.originalUrl} not found`,
    'The requested endpoint does not exist'
  ));
});

// ====================================================================
// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// ====================================================================
app.use(errorLogger);

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error('Global error handler:', error);
  
  // Error de validación JSON
  if (error.message === 'Invalid JSON') {
    res.status(400).json(errorResponse('Invalid JSON format'));
    return;
  }
  
  // Error de payload muy grande
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json(errorResponse('File too large'));
    return;
  }
  
  // Error de Sequelize (base de datos)
  if (error.name === 'SequelizeValidationError') {
    res.status(400).json(errorResponse(
      'Database validation error',
      error.errors?.map((e: any) => e.message).join(', ')
    ));
    return;
  }
  
  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json(errorResponse('Invalid token'));
    return;
  }
  
  if (error.name === 'TokenExpiredError') {
    res.status(401).json(errorResponse('Token expired'));
    return;
  }
  
  // Error genérico
  const statusCode = error.statusCode || error.status || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? error.message 
    : 'Internal server error';
    
  res.status(statusCode).json(errorResponse(message, error.stack));
  return;
});

// ====================================================================
// FUNCIÓN DE INICIALIZACIÓN DEL SERVIDOR
// ====================================================================
const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Starting TradeConnect Platform...');

    // Inicializar servicios de eventos y listeners
    console.log('🎯 Initializing event services...');
    const eventEmitter = eventService.getEventEmitter();
    eventListenersService(eventEmitter);
    notificationTriggersService(eventEmitter);
    console.log('✅ Event listeners and notification triggers initialized');

    // Inicializar servicio de colas
    console.log('📋 Initializing queue service...');
    if (!queueService.isReady()) {
      console.log('❌ Queue service not ready');
    } else {
      console.log('✅ Queue service initialized');
    }

    // Verificar conexión a base de datos
    console.log('📊 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Verificar conexión a Redis
    console.log('🔄 Connecting to Redis...');
    const redisConnected = await testRedisConnection();
    if (redisConnected) {
      console.log('✅ Redis connected successfully');
    } else {
      console.log('⚠️  Redis connection failed - some features may not work');
    }
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`
╭──────────────────────────────────────────────────────────────────────────────────────────╮

                🚀 TradeConnect Platform Server Started Successfully!

                📍 Environment: ${config.NODE_ENV.padEnd(44)}
                🔗 URL: http://localhost:${PORT}${' '.repeat(33)}
                📝 Health Check: http://localhost:${PORT}/health${' '.repeat(25)}
                📊 System Info: http://localhost:${PORT}/info${' '.repeat(26)}
                📚 API Documentation: http://localhost:${PORT}/api/docs/${' '.repeat(18)}
                ⏰ Started at: ${new Date().toISOString().padEnd(37)}

                              🎯 Ready to accept requests!

╰─────────────────────────────────────────────────────────────────────────────────────────╯
      `);
    });

    // Inicializar WebSocket/Socket.io
    console.log('🔌 Initializing WebSocket/Socket.io service...');
    initializeSocketService(server);
    console.log('✅ WebSocket/Socket.io service initialized');
    
    // Manejo graceful de shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await sequelize.close();
          console.log('🗄️  Database connection closed');
          
          const { closeRedisConnections } = await import('./config/redis');
          await closeRedisConnections();
          console.log('🔄 Redis connections closed');
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };
    
    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ====================================================================
// INICIAR SERVIDOR
// ====================================================================
startServer();

export default app;
