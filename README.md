# TradeConnect Platform v1.0.0

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-6+-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Plataforma completa para gestión de eventos empresariales con blockchain y pagos integrados**

## 📋 Descripción General

TradeConnect es una plataforma e-commerce integral diseñada para la gestión completa de eventos empresariales en Guatemala y Latinoamérica. Combina gestión de eventos, sistema de pagos multi-pasarela, facturación electrónica FEL, certificados blockchain y control de acceso QR.

### 🎯 Características Principales

- **🏢 Gestión Completa de Eventos**: Creación, configuración y administración de eventos empresariales
- **💳 Procesamiento de Pagos**: Sistema multi-pasarela con PayPal, Stripe, NeoNet y BAM
- **📧 Facturación Electrónica FEL**: Integración completa con SAT Guatemala
- **🎫 Certificados Blockchain**: Generación y verificación de certificados en Ethereum
- **📱 Control de Acceso QR**: Sistema de check-in con códigos QR dinámicos
- **👥 Gestión de Speakers**: Base de datos completa de expositores y contratos
- **📊 Analytics y Reportes**: Dashboard completo con métricas en tiempo real
- **🔒 Seguridad PCI DSS**: Procesamiento seguro de pagos con tokenización

## 🏗️ Arquitectura del Sistema

### Tecnologías Principales

- **Backend**: Node.js + Express.js + TypeScript
- **Base de Datos**: PostgreSQL + Sequelize ORM
- **Cache**: Redis para sesiones y datos temporales
- **Blockchain**: Ethereum testnet para certificados
- **Pagos**: Multi-pasarela (PayPal, Stripe, NeoNet, BAM)
- **Documentación**: Swagger/OpenAPI

### Estructura de Módulos

```
tradeconnect-v1/
├── backend/                 # API REST principal
│   ├── src/
│   │   ├── models/         # Modelos Sequelize
│   │   ├── controllers/    # Controladores HTTP
│   │   ├── services/       # Lógica de negocio
│   │   ├── routes/         # Definición de rutas
│   │   ├── middleware/     # Middlewares personalizados
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   ├── migrations/         # Migraciones de BD
│   └── config/             # Configuración
├── frontend/               # Interfaz de usuario (futuro)
├── scripts/                # Scripts de automatización
├── tests/                  # Tests automatizados
└── docs/                   # Documentación adicional
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/your-org/tradeconnect-v1.git
   cd tradeconnect-v1
   ```

2. **Instalar dependencias**
   ```bash
   cd backend
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con sus configuraciones
   ```

4. **Configurar base de datos**
   ```bash
   # Crear base de datos PostgreSQL
   createdb tradeconnect_dev

   # Ejecutar migraciones
   npm run migrate

   # (Opcional) Ejecutar seeders
   npm run seed
   ```

5. **Verificar configuración de pagos**
   ```bash
   node scripts/verify-payment-setup.js
   ```

6. **Configurar webhooks de pago**
   ```bash
   node scripts/setup-payment-webhooks.js
   ```

7. **Iniciar servidor**
   ```bash
   npm start
   ```

### Verificación

- **Health Check**: `GET http://localhost:3000/health`
- **API Docs**: `http://localhost:3000/api/docs`
- **Info del Sistema**: `GET http://localhost:3000/info`

## 📡 API Endpoints

### Autenticación & Usuarios
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/register` - Registro de usuarios
- `GET /api/v1/users/profile` - Perfil de usuario
- `PUT /api/v1/users/profile` - Actualizar perfil

### Gestión de Eventos
- `GET /api/v1/events` - Listar eventos
- `POST /api/v1/events` - Crear evento
- `GET /api/v1/events/{id}` - Detalles de evento
- `PUT /api/v1/events/{id}` - Actualizar evento

### Sistema de Pagos
- `POST /api/v1/payments/process` - Procesar pago
- `GET /api/v1/payments/{id}/status` - Estado de transacción
- `GET /api/v1/payments/history` - Historial de pagos
- `POST /api/v1/refunds` - Procesar reembolso

### Inscripciones
- `POST /api/v1/registrations` - Crear inscripción
- `GET /api/v1/registrations/{id}` - Detalles de inscripción
- `PUT /api/v1/registrations/{id}` - Actualizar inscripción

### Carrito de Compras
- `POST /api/v1/cart/items` - Agregar item al carrito
- `GET /api/v1/cart` - Ver carrito
- `POST /api/v1/cart/checkout` - Checkout del carrito

## 💳 Módulo de Pagos

### Pasarelas Soportadas

| Pasarela | Estado | Monedas | Comisiones |
|----------|--------|---------|------------|
| PayPal | ✅ Producción | USD, GTQ | 2.9% + $0.49 |
| Stripe | ✅ Producción | USD, GTQ | 2.9% + $0.30 |
| NeoNet | ✅ Producción | GTQ | 2.5% |
| BAM | ✅ Producción | GTQ | 2.5% |

### Características de Seguridad

- ✅ **Tokenización completa** - No se almacenan números de tarjeta
- ✅ **Encriptación AES-256** - Credenciales sensibles encriptadas
- ✅ **Validación Luhn** - Verificación de números de tarjeta
- ✅ **Rate Limiting** - Protección contra abuso (5 intentos/min)
- ✅ **Circuit Breaker** - Aislamiento de fallos por pasarela
- ✅ **Auditoría completa** - Logs de todas las transacciones

### Configuración de Mocks

Para desarrollo y testing, el sistema incluye mocks completos:

```bash
# En .env
NEONET_MOCK=true
BAM_MOCK=true
NEONET_MOCK_SUCCESS_RATE=0.9
```

## 🗄️ Base de Datos

### Migraciones

```bash
# Ejecutar todas las migraciones
npm run migrate

# Crear nueva migración
npx sequelize-cli migration:generate --name create-table-name

# Revertir última migración
npm run migrate:undo
```

### Modelos Principales

- **Users**: Usuarios del sistema
- **Events**: Eventos empresariales
- **Registrations**: Inscripciones a eventos
- **Payments**: Transacciones de pago
- **Refunds**: Reembolsos procesados
- **Contracts**: Contratos con speakers
- **Certificates**: Certificados blockchain

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar con nodemon
npm start                # Iniciar en producción
npm test                 # Ejecutar tests

# Base de datos
npm run migrate          # Ejecutar migraciones
npm run migrate:undo     # Revertir migración
npm run seed             # Ejecutar seeders

# Pagos
node scripts/verify-payment-setup.js    # Verificar configuración
node scripts/setup-payment-webhooks.js  # Configurar webhooks

# Utilidades
npm run lint             # Ejecutar ESLint
npm run format           # Formatear código
npm run build            # Compilar TypeScript
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests específicos
npm test -- --testPathPattern=payment
npm test -- --testPathPattern=event

# Cobertura
npm run test:coverage
```

### Tests por Módulo

- **Unitarios**: Servicios individuales
- **Integración**: APIs completas
- **E2E**: Flujos completos de usuario
- **Pago**: Mocks y APIs reales

## 📊 Monitoreo y Logs

### Métricas Disponibles

- **Performance**: Tiempos de respuesta, throughput
- **Pagos**: Tasas de éxito, rechazos por pasarela
- **Sistema**: Uso de CPU, memoria, conexiones DB
- **Negocio**: Eventos creados, inscripciones, ingresos

### Logs

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Buscar logs específicos
grep "PAYMENT" logs/app.log
grep "ERROR" logs/app.log
```

## 🚀 Despliegue

### Entornos

- **Development**: Configuración local
- **Staging**: Pruebas de integración
- **Production**: Entorno de producción

### Variables de Entorno

```bash
# Base
NODE_ENV=production
PORT=3000
BASE_URL=https://api.tradeconnect.com

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tradeconnect_prod
DB_USER=tradeconnect_user
DB_PASSWORD=secure_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=8h

# Pagos (ver documentación específica)
PAYMENT_ENCRYPTION_KEY=your_32_char_key
PAYPAL_CLIENT_ID=your_paypal_client_id
# ... más variables
```

### Docker

```bash
# Construir imagen
docker build -t tradeconnect .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env tradeconnect
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de Contribución

- Seguir convenciones de código TypeScript
- Escribir tests para nuevas funcionalidades
- Actualizar documentación
- Seguir flujo Git Flow

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

- **Email**: support@tradeconnect.com
- **Docs**: https://docs.tradeconnect.com
- **Issues**: [GitHub Issues](https://github.com/your-org/tradeconnect-v1/issues)

## 🙏 Agradecimientos

- **Cámara del Comercio**: Por el soporte al proyecto
- **Comunidad Open Source**: Por las librerías utilizadas
- **Equipo de Desarrollo**: Por el esfuerzo y dedicación

---

**Desarrollado con ❤️ por el equipo TradeConnect**