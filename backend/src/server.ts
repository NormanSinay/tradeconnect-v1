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
import eventRoutes from './routes/events';
import eventTemplateRoutes from './routes/event-templates';
import eventCategoryRoutes from './routes/event-categories';
import eventRegistrationRoutes from './routes/event-registrations';
import eventReportsRoutes from './routes/event-reports';
import certificateRoutes from './routes/certificates';
import publicRoutes from './routes/public';

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

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (error) {
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// ====================================================================
// MIDDLEWARES DE LOGGING
// ====================================================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

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
            customFields: {
              type: 'object',
              description: 'Campos personalizados actualizados'
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
          }
        }
      },
      // User management schemas
      CreateUserRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email del usuario',
            example: 'usuario@tradeconnect.gt'
          },
          password: {
            type: 'string',
            minLength: 8,
            description: 'Contraseña (mínimo 8 caracteres)',
            example: 'SecurePass123'
          },
          firstName: {
            type: 'string',
            description: 'Nombre',
            example: 'Juan'
          },
          lastName: {
            type: 'string',
            description: 'Apellido',
            example: 'Pérez'
          },
          phone: {
            type: 'string',
            description: 'Teléfono',
            example: '+502 1234-5678'
          },
          role: {
            type: 'string',
            enum: ['user', 'speaker', 'participant', 'client'],
            description: 'Rol del usuario',
            example: 'user'
          }
        }
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            description: 'Nombre',
            example: 'Juan'
          },
          lastName: {
            type: 'string',
            description: 'Apellido',
            example: 'Pérez'
          },
          phone: {
            type: 'string',
            description: 'Teléfono',
            example: '+502 1234-5678'
          },
          isActive: {
            type: 'boolean',
            description: 'Estado del usuario',
            example: true
          },
          role: {
            type: 'string',
            enum: ['user', 'speaker', 'participant', 'client'],
            description: 'Rol del usuario',
            example: 'user'
          }
        }
      },
      // Authentication schemas
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email del usuario',
            example: 'usuario@tradeconnect.gt'
          },
          password: {
            type: 'string',
            description: 'Contraseña',
            example: 'SecurePass123'
          },
          twoFactorCode: {
            type: 'string',
            description: 'Código 2FA (opcional)',
            example: '123456'
          },
          rememberMe: {
            type: 'boolean',
            description: 'Recordar sesión',
            example: true
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'termsAccepted'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email del usuario',
            example: 'usuario@tradeconnect.gt'
          },
          password: {
            type: 'string',
            minLength: 8,
            description: 'Contraseña (mínimo 8 caracteres)',
            example: 'SecurePass123'
          },
          confirmPassword: {
            type: 'string',
            description: 'Confirmación de contraseña',
            example: 'SecurePass123'
          },
          firstName: {
            type: 'string',
            description: 'Nombre',
            example: 'Juan'
          },
          lastName: {
            type: 'string',
            description: 'Apellido',
            example: 'Pérez'
          },
          phone: {
            type: 'string',
            description: 'Teléfono',
            example: '+502 1234-5678'
          },
          nit: {
            type: 'string',
            description: 'NIT guatemalteco',
            example: '12345678-9'
          },
          cui: {
            type: 'string',
            description: 'CUI guatemalteco (13 dígitos)',
            example: '1234567890123'
          },
          termsAccepted: {
            type: 'boolean',
            description: 'Aceptación de términos y condiciones',
            example: true
          },
          marketingAccepted: {
            type: 'boolean',
            description: 'Aceptación de marketing',
            example: false
          }
        }
      },
      ResetPasswordData: {
        type: 'object',
        required: ['resetToken', 'newPassword', 'confirmPassword'],
        properties: {
          resetToken: {
            type: 'string',
            description: 'Token de reseteo de contraseña',
            example: 'abc123def456'
          },
          newPassword: {
            type: 'string',
            minLength: 8,
            description: 'Nueva contraseña',
            example: 'NewSecurePass123'
          },
          confirmPassword: {
            type: 'string',
            description: 'Confirmación de nueva contraseña',
            example: 'NewSecurePass123'
          }
        }
      },
      ChangePasswordData: {
        type: 'object',
        required: ['currentPassword', 'newPassword', 'confirmNewPassword'],
        properties: {
          currentPassword: {
            type: 'string',
            description: 'Contraseña actual',
            example: 'CurrentPass123'
          },
          newPassword: {
            type: 'string',
            minLength: 8,
            description: 'Nueva contraseña',
            example: 'NewSecurePass123'
          },
          confirmNewPassword: {
            type: 'string',
            description: 'Confirmación de nueva contraseña',
            example: 'NewSecurePass123'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/AuthUser'
          },
          accessToken: {
            type: 'string',
            description: 'Token de acceso JWT',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          refreshToken: {
            type: 'string',
            description: 'Token de refresco',
            example: 'refresh_token_123'
          },
          expiresIn: {
            type: 'integer',
            description: 'Tiempo de expiración en segundos',
            example: 3600
          },
          requires2FA: {
            type: 'boolean',
            description: 'Si requiere autenticación de dos factores',
            example: false
          }
        }
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID del usuario',
            example: 1
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email del usuario',
            example: 'usuario@tradeconnect.gt'
          },
          firstName: {
            type: 'string',
            description: 'Nombre',
            example: 'Juan'
          },
          lastName: {
            type: 'string',
            description: 'Apellido',
            example: 'Pérez'
          },
          role: {
            type: 'string',
            description: 'Rol del usuario',
            example: 'user'
          },
          isActive: {
            type: 'boolean',
            description: 'Estado del usuario',
            example: true
          },
          emailVerified: {
            type: 'boolean',
            description: 'Email verificado',
            example: true
          },
          twoFactorEnabled: {
            type: 'boolean',
            description: '2FA habilitado',
            example: false
          }
        }
      },
      // Registration schemas
      CreateIndividualRegistrationRequest: {
        type: 'object',
        required: ['eventId', 'participantType', 'participantData'],
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
          participantData: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['firstName', 'lastName', 'email'],
              properties: {
                firstName: {
                  type: 'string',
                  description: 'Nombre del participante',
                  example: 'Juan'
                },
                lastName: {
                  type: 'string',
                  description: 'Apellido del participante',
                  example: 'Pérez'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Email del participante',
                  example: 'juan.perez@email.com'
                },
                phone: {
                  type: 'string',
                  description: 'Teléfono del participante',
                  example: '+502 1234-5678'
                },
                nit: {
                  type: 'string',
                  description: 'NIT del participante',
                  example: '12345678-9'
                },
                cui: {
                  type: 'string',
                  description: 'CUI del participante',
                  example: '1234567890123'
                },
                position: {
                  type: 'string',
                  description: 'Cargo del participante',
                  example: 'Gerente de Ventas'
                }
              }
            }
          },
          customFields: {
            type: 'object',
            description: 'Campos personalizados del evento',
            example: { 'dietary_restrictions': 'vegetarian', 'special_needs': 'wheelchair access' }
          },
          paymentMethod: {
            type: 'string',
            enum: ['paypal', 'stripe', 'neonet', 'bam'],
            description: 'Método de pago',
            example: 'paypal'
          }
        }
      },
      UpdateRegistrationRequest: {
        type: 'object',
        properties: {
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
          },
          customFields: {
            type: 'object',
            description: 'Campos personalizados actualizados'
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled'],
            description: 'Estado de la inscripción',
            example: 'confirmed'
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
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
        'Hybrid Events',
        'Reports & Analytics'
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
      modules: 17,
      endpoints: 113, // Total endpoints implemented: auth(25) + users(6) + sessions(6) + events(54) + speakers(8) + registrations(6) + cart(7) + public(6) + general(4)
      paymentGateways: ['PayPal', 'Stripe', 'NeoNet', 'BAM'],
      felIntegration: true,
      blockchainSupport: true,
      qrCodes: true,
      certificates: true,
      hybridEvents: true
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
app.use(`${API_VERSION}/speakers`, speakersRoutes);
app.use(`${API_VERSION}/speaker-contracts`, speakerContractRoutes);

// Rutas de inscripciones y carrito
import registrationRoutes from './routes/registrations';
import cartRoutes from './routes/cart';
app.use(`${API_VERSION}/registrations`, registrationRoutes);
app.use(`${API_VERSION}/cart`, cartRoutes);

// Rutas públicas
app.use(`${API_VERSION}/public`, publicRoutes);

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
app.use('/api/speaker-contracts', (req, res) => res.redirect(301, `${API_VERSION}/speaker-contracts${req.path}`));
app.use('/api/registrations', (req, res) => res.redirect(301, `${API_VERSION}/registrations${req.path}`));
app.use('/api/cart', (req, res) => res.redirect(301, `${API_VERSION}/cart${req.path}`));
app.use('/api/public', (req, res) => res.redirect(301, `${API_VERSION}/public${req.path}`));

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
    console.log('✅ Event listeners initialized');

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