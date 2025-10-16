# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeConnect is an enterprise-grade e-commerce platform for managing business events, including registration, payments, FEL (electronic invoicing for Guatemala), QR codes, certificates, and hybrid events. The platform is built with Node.js/Express + TypeScript on the backend, PostgreSQL for the database, and Redis for caching/sessions.

## Development Commands

### Backend Development

All backend commands are run from the `backend/` directory:

```bash
# Development
npm run dev              # Start dev server with nodemon
npm start                # Run compiled code from dist/

# Building & Testing
npm run build            # Compile TypeScript to dist/
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier

# Database Operations
npm run db:migrate       # Run Sequelize migrations
npm run db:seed          # Seed database with initial data

# Documentation
npm run docs:generate    # Generate Swagger API docs

# Setup Scripts (from project root)
node scripts/verify-payment-setup.js      # Verify payment gateway configuration
node scripts/setup-payment-webhooks.js    # Configure payment webhooks
```

### Initial Setup

The project uses PostgreSQL and Redis. Start both services with Docker:

```bash
# From project root
docker-compose up -d     # Start PostgreSQL, Redis, and MailHog

# Then install dependencies and setup backend
cd backend
npm install

# Configure environment
cp .env.example .env      # Edit .env with your configurations

# Setup database
npm run db:migrate        # Run migrations
npm run db:seed           # (Optional) Seed with initial data

# Verify payment setup (optional)
cd ..
node scripts/verify-payment-setup.js
node scripts/setup-payment-webhooks.js

# Start development server
cd backend
npm run dev
```

**Docker Services**:
- PostgreSQL (port 5432): Database `tradeconnect_dev`, user `tradeconnect_user`, password `tradeconnect123`
- Redis (port 6379): Password `tradeconnect_redis_password`
- MailHog (ports 8025 UI, 1025 SMTP): Email testing tool

**Configuration Files**:
- `backend/.env` - Environment variables (copy from `.env.example`)
- `backend/config/config.json` - Sequelize CLI database config
- `backend/src/config/database.ts` - Application database config

## Architecture

### Core Modules

TradeConnect is organized into **36 functional modules** across **14 major feature areas**:

1. **Authentication & Users** (3 modules) - JWT-based auth with 2FA, sessions, user management, role-based access control (RBAC)
2. **Events Management** (6 modules) - Core event CRUD, templates, duplication, categories, types, statuses, event sessions, registrations, reports & analytics
3. **Speakers** (2 modules) - Speaker profiles, specialties, availability, contracts, payments, evaluations
4. **Registration System** (2 modules) - Individual and group registrations, cart management, abandoned cart tracking
5. **Payment Processing** (3 modules) - PayPal, Stripe, NeoNet, BAM gateway integrations with refunds, webhooks, and reconciliation
6. **FEL Integration** (3 modules) - Guatemala electronic invoicing system with NIT/CUI validation, tokens, error handling, invoice management
7. **Promotions & Discounts** (2 modules) - Promo codes, volume discounts, early bird pricing, usage tracking
8. **Capacity Management** (3 modules) - Event capacities, access types, overbooking rules, waitlists
9. **QR Codes & Access Control** (1 module) - Event access via QR validation, attendance tracking, access logs, sync logs
10. **Certificate Generation** (3 modules) - PDF certificates with blockchain anchoring, certificate templates, validation logs
11. **Notifications** (3 modules) - Email, SMS (Twilio), WhatsApp with templates, rules, user preferences
12. **Hybrid Events** (3 modules) - Support for virtual, in-person, and hybrid events with virtual rooms, streaming, and virtual participants
13. **User Preferences** (1 module) - Notification preferences and user settings
14. **Public APIs** (1 module) - Public endpoints for validations and system information

**Module Breakdown by Component**:
- 36 Controllers
- 36 Route files
- 60 Service files
- 69 Database models
- 59 Database migrations

### Directory Structure

```
backend/src/
├── config/          # Database, Redis, environment configuration
├── controllers/     # Request handlers (eventController, authController, etc.)
├── middleware/      # Auth, security, rate limiting, logging
├── models/          # Sequelize models (User, Event, Speaker, Cart, etc.)
├── routes/          # Express route definitions
├── services/        # Business logic (eventService, authService, etc.)
├── types/           # TypeScript type definitions
└── utils/           # Helpers (logger, constants, validators, etc.)

backend/
├── migrations/      # Sequelize migration files (59 total)
├── seeders/         # Database seed files
├── config/          # Sequelize CLI config
└── dist/            # Compiled JavaScript output
```

**File Counts**:
- `src/controllers/`: 36 controllers
- `src/routes/`: 36 route files
- `src/services/`: 60 service files
- `src/models/`: 69 models + index.ts
- `migrations/`: 59 migration files

### Key Architectural Patterns

**Event-Driven Architecture**: The system uses an event emitter pattern for cross-module communication:
- `eventService` emits events (e.g., `event.created`, `event.published`)
- `eventListenersService` registers listeners that trigger notifications, logging, etc.
- Initialize both in `server.ts` startup

**Service Layer Pattern**: Business logic lives in services, not controllers:
- Controllers handle HTTP concerns (request/response)
- Services handle business rules, database operations, external APIs
- Example: `eventService.createEvent()` contains validation and DB logic

**RBAC (Role-Based Access Control)**:
- Users have roles (`super_admin`, `admin`, `manager`, `operator`, `user`, `speaker`, `participant`, `client`)
- Roles have permissions (defined in `utils/constants.ts`)
- Middleware: `authenticateToken` → `requirePermission([...])` → controller
- See `middleware/auth.ts` for implementation

**TypeScript Path Aliases**: Use aliases for cleaner imports:
```typescript
import { Event } from '@models/Event';
import { logger } from '@utils/logger';
import { authService } from '@services/authService';
```
Configured in `tsconfig.json` under `paths`.

### Database Models & Relationships

**Core Entities** (69 models):
- `User` → `UserRole` ← `Role` ← `RolePermission` → `Permission`
- `User` → `Session` (JWT sessions), `TwoFactorAuth`, `AuditLog`, `UserNotificationPreferences`
- `Event` → `EventType`, `EventCategory`, `EventStatus`, `EventTemplate`, `EventMedia`, `EventDuplication`
- `Event` → `EventRegistration`, `SpeakerEvent` ← `Speaker`, `EventSession`, `HybridEvent`
- `Event` → `Promotion`, `PromoCode`, `VolumeDiscount`, `EarlyBirdDiscount`, `PromoCodeUsage`
- `Event` → `Capacity`, `AccessType`, `Overbooking`, `CapacityRule`, `Waitlist`
- `Speaker` → `Contract`, `SpeakerPayment`, `SpeakerEvaluation`, `SpeakerAvailabilityBlock`
- `Speaker` → `SpeakerSpecialty` ← `Specialty`
- `User` → `Registration`, `GroupRegistration`
- `Cart` → `CartItem`, `CartSession`, `AbandonedCart`
- `Payment` → `PaymentMethod`, `Refund`, `PaymentReconciliation`
- `Invoice` → `FelDocument`, `FelToken`, `FelError`, `FelAuditLog`
- `Registration` → `NitValidation`, `CuiValidation`
- `Registration` → `QRCode`, `Attendance`, `AccessLog`, `QrSyncLog`
- `Registration` → `Certificate`, `CertificateTemplate`, `CertificateValidationLog`, `BlockchainHash`
- `Notification` → `NotificationLog`, `NotificationRule`, `EmailTemplate`
- `HybridEvent` → `VirtualRoom`, `StreamingConfig`, `VirtualParticipant`

All models use Sequelize TypeScript decorators (`@Table`, `@Column`, etc.) and are registered in `models/index.ts`.

### Configuration & Environment

**Environment Variables**: Copy `backend/.env.example` to `backend/.env` and configure:
- Database credentials (PostgreSQL)
- Redis connection
- JWT secrets (JWT_SECRET, JWT_REFRESH_SECRET)
- SMTP settings for email
- Payment gateway credentials (PayPal, Stripe, NeoNet, BAM)
- FEL API credentials
- Twilio/WhatsApp API keys
- Blockchain/Ethereum RPC URL

**Security Configuration**:
- Helmet.js for HTTP headers
- CORS configured in `server.ts`
- Rate limiting: `generalLimiter` (100 req/15min), `authLimiter` (5 req/15min)
- Redis-backed session store
- Token blacklisting for logout

### API Documentation

Swagger/OpenAPI docs are auto-generated and available at:
- **UI**: `http://localhost:3000/api/docs`
- **JSON**: `http://localhost:3000/api/docs.json`
- **Health Check**: `http://localhost:3000/health`
- **System Info**: `http://localhost:3000/info`

Generate updated docs: `npm run docs:generate`

**Key API Endpoints**:
- Authentication: `/api/v1/auth/*`
- Events: `/api/v1/events/*`
- Registrations: `/api/v1/registrations/*`
- Payments: `/api/v1/payments/*`
- Cart: `/api/v1/cart/*`
- FEL/Invoicing: `/api/v1/fel/*`, `/api/v1/invoices/*`
- QR Codes: `/api/v1/qr/*`
- Certificates: `/api/v1/certificates/*`
- Notifications: `/api/v1/notifications/*`
- Webhooks: `/api/v1/webhooks/*`

### Testing Strategy

- **Unit Tests**: Test services and utilities in isolation
- **Integration Tests**: Test API endpoints with supertest
- **Payment Tests**: Mock implementations available for NeoNet and BAM gateways
- **Test Database**: Uses `tradeconnect_test` database (see `config/config.json`)

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.spec.ts

# Run tests matching pattern
npm test -- --testPathPattern=payment
npm test -- --testPathPattern=event

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Payment Gateway Mocks**: Configure in `.env` for testing:
```
NEONET_MOCK=true
BAM_MOCK=true
NEONET_MOCK_SUCCESS_RATE=0.9  # 90% success rate for testing
```

### Logging & Monitoring

- Winston logger in `utils/logger.ts`
- Request logging middleware: `requestLogger`, `errorLogger`
- Logs stored in `backend/logs/`
- Audit logs stored in database via `AuditLog` model
- Metrics endpoint: `GET /metrics` (memory, uptime, performance)

## Common Development Tasks

### Adding a New Model

1. Create model in `src/models/YourModel.ts` with Sequelize TypeScript decorators
2. Add to `src/models/index.ts` in `sequelize.addModels([...])` and exports
3. Create migration: Create file `migrations/0XX-create-your-model.js`
4. Run migration: `npm run db:migrate`
5. (Optional) Create seeder in `seeders/` and run with `npm run db:seed`

### Adding a New API Endpoint

1. Create/update controller in `src/controllers/`
2. Create/update route in `src/routes/`
3. Add route to `src/server.ts` (e.g., `app.use('/api/your-resource', yourRoutes)`)
4. Add Swagger JSDoc comments for documentation
5. Protect with auth middleware if needed: `router.post('/', authenticateToken, requirePermission([...]), controller)`

### Working with Permissions

All permissions are defined in `utils/constants.ts` under `PERMISSIONS`. To check permissions in a route:

```typescript
import { authenticateToken, requirePermission } from '@middleware/auth';
import { PERMISSIONS } from '@utils/constants';

router.post('/events',
  authenticateToken,
  requirePermission([PERMISSIONS.CREATE_EVENT]),
  eventController.createEvent
);
```

### Database Migrations

Migrations are in `backend/migrations/` with 59+ migration files. When creating a new migration:
- Follow existing naming patterns: `0XX-create-table-name.js` or timestamp-based `YYYYMMDDHHMMSS-create-table-name.js`
- Include both `up` and `down` methods
- Run `npm run db:migrate` to apply
- Sequelize CLI uses `config/config.json` for connection settings
- Recent migrations use timestamp format for better collaboration

**Migration Naming Examples**:
- Early migrations: `000-create-users.js`, `001-create-permissions.js`
- Recent migrations: `20251005234331-create-qr-codes.js`, `20251007142317-create-notification-tables.js`

```bash
# Run all pending migrations
npm run db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Create new migration
npx sequelize-cli migration:generate --name create-your-table-name
```

### Caching Strategy

Redis is used for:
- Session storage (connect-redis)
- Rate limiting (rate-limit-redis)
- Application caching (see `services/cacheService.ts`)
- Token blacklisting

Access Redis via `config/redis.ts` which exports configured clients.

### Event System

The event-driven architecture allows decoupled communication between modules:

```typescript
// In a service
eventService.getEventEmitter().emit('event.created', { eventId, userId });

// In eventListenersService (already set up)
eventEmitter.on('event.created', async (data) => {
  // Send notification, log, update metrics, etc.
});
```

Events are initialized in `server.ts` via `eventListenersService(eventEmitter)`.

### Queue System & Background Jobs

The system uses Bull (Redis-backed queue) for background job processing:

```typescript
import { queueService } from '@services/queueService';

// Add a job to the queue
await queueService.addJob('send-email', {
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'John' }
});

// Jobs are processed asynchronously
// Configure queue workers in queueService.ts
```

Common queue jobs:
- Email sending (to avoid blocking HTTP requests)
- Certificate generation with blockchain anchoring
- Abandoned cart reminders
- Notification delivery (SMS, WhatsApp)
- Report generation

### Real-time Features with Socket.IO

Socket.IO is configured for real-time updates:

```typescript
import { initializeSocketService } from '@services/socketService';

// Initialized in server.ts
const io = initializeSocketService(server);

// Emit events from services
socketService.emitToRoom(eventId, 'attendance.updated', attendanceData);
```

Real-time events:
- Live attendance updates during events
- Real-time capacity monitoring
- Payment status updates
- Notification delivery confirmations

## Module-Specific Implementation Notes

### FEL (Facturación Electrónica en Línea) Module

The FEL integration handles Guatemala's electronic invoicing system:

**Models**: `Invoice`, `FelDocument`, `FelToken`, `FelError`, `FelAuditLog`, `NitValidation`, `CuiValidation`

**Key Services**:
- `felService` - Main FEL API integration
- `invoiceService` - Invoice generation and management
- NIT/CUI validation services for tax ID verification

**Routes**: `/api/fel/*`, `/api/invoices/*`, `/api/fel-validation/*`

**Important**: FEL tokens expire and need automatic renewal. The system handles token refresh automatically.

### Promotions & Discounts Module

Flexible pricing system with multiple discount types:

**Models**: `Promotion`, `PromoCode`, `VolumeDiscount`, `EarlyBirdDiscount`, `PromoCodeUsage`

**Features**:
- Promo codes with usage limits and expiration
- Volume discounts based on quantity
- Early bird pricing with time-based rules
- Automatic discount application at checkout
- Usage tracking and analytics

**Routes**: `/api/promotions/*`, `/api/discounts/*`

### Capacity Management Module

Sophisticated capacity control for events:

**Models**: `Capacity`, `AccessType`, `Overbooking`, `CapacityRule`, `Waitlist`

**Features**:
- Different capacity rules per access type
- Overbooking configuration with percentage or fixed limits
- Automatic waitlist management
- Real-time capacity monitoring via Socket.IO

**Routes**: `/api/capacity/*`, `/api/access-types/*`, `/api/overbooking/*`

### QR Code & Access Control Module

Complete access control system with QR codes:

**Models**: `QRCode`, `Attendance`, `AccessLog`, `QrSyncLog`, `BlockchainHash`

**Features**:
- Dynamic QR code generation per registration
- QR validation and check-in
- Attendance tracking
- Access log audit trail
- Offline sync capability with sync logs
- Optional blockchain anchoring for tamper-proof records

**Routes**: `/api/qr/*`

### Certificate Module

PDF certificate generation with blockchain verification:

**Models**: `Certificate`, `CertificateTemplate`, `CertificateValidationLog`, `BlockchainHash`

**Features**:
- Customizable certificate templates with variables
- PDF generation using Puppeteer or pdf-lib
- Blockchain anchoring on Ethereum testnet
- Public certificate validation endpoint
- Bulk certificate generation for events

**Routes**: `/api/certificates/*`, `/api/certificate-templates/*`, `/api/certificate-validation/*`

### Notifications Module

Multi-channel notification system:

**Models**: `Notification`, `NotificationLog`, `NotificationRule`, `EmailTemplate`, `UserNotificationPreferences`

**Features**:
- Email via SMTP/Nodemailer
- SMS via Twilio
- WhatsApp via Twilio or whatsapp-web.js
- Template-based messaging with variable substitution
- Rule-based automatic notifications (triggers)
- User preference management (opt-in/opt-out)
- Delivery tracking and logs

**Routes**: `/api/notifications/*`, `/api/email-templates/*`, `/api/notification-rules/*`, `/api/user-preferences/*`

**Configuration**: Initialize notification triggers with `notificationTriggersService` in `server.ts`

### Hybrid Events Module

Virtual and hybrid event support:

**Models**: `HybridEvent`, `VirtualRoom`, `StreamingConfig`, `VirtualParticipant`

**Features**:
- Virtual room management
- Streaming configuration (platform, URL, credentials)
- Virtual participant tracking
- Integration points for video platforms (Zoom, Teams, etc.)

**Routes**: `/api/hybrid-events/*`, `/api/streaming/*`, `/api/virtual-participants/*`

### Event Sessions Module

Sub-events and agenda management:

**Model**: `EventSession`

**Features**:
- Multiple sessions per event
- Session scheduling with start/end times
- Speaker assignment per session
- Capacity per session

**Routes**: `/api/event-sessions/*`

## Development Best Practices

### When Adding Features

1. Define TypeScript types in `src/types/` first
2. Implement business logic in services
3. Keep controllers thin - delegate to services
4. Add appropriate middleware (auth, validation)
5. Update Swagger docs with JSDoc comments
6. Add audit logging for sensitive operations via `AuditLog.log()`

### Error Handling

Use the centralized error handler in `server.ts`. Return structured responses:

```typescript
return res.status(HTTP_STATUS.BAD_REQUEST).json({
  success: false,
  message: 'User-friendly message',
  error: 'ERROR_CODE',
  timestamp: new Date().toISOString()
});
```

Or use utility functions from `utils/common.utils.ts`:
```typescript
res.json(successResponse(data, message));
res.status(400).json(errorResponse(message, error));
```

### Security Considerations

- Always use `authenticateToken` middleware for protected routes
- Apply `requirePermission()` for authorization
- Validate input with `express-validator` or Joi
- Log security events via `securityService.logSecurityEvent()`
- Never commit secrets - use environment variables

## Payment Gateway Integration

The platform supports multiple payment gateways with comprehensive security features:

### Supported Gateways

| Gateway | Status | Currencies | Fee Structure |
|---------|--------|------------|---------------|
| PayPal  | Production | USD, GTQ | 2.9% + $0.49 |
| Stripe  | Production | USD, GTQ | 2.9% + $0.30 |
| NeoNet  | Production | GTQ | 2.5% |
| BAM     | Production | GTQ | 2.5% |

### Payment Security

- **Tokenization**: No card numbers stored in database
- **Encryption**: AES-256 encryption for sensitive credentials
- **Validation**: Luhn algorithm for card number validation
- **Rate Limiting**: 5 payment attempts per 15 minutes per IP
- **Circuit Breaker**: Gateway isolation on failures
- **Audit Trail**: Complete transaction logging via `AuditLog` model

### Payment Services Architecture

```typescript
// Main payment orchestrator
paymentService.processPayment(gateway, amount, currency, metadata)

// Gateway-specific services
paypalService.createOrder(...)
stripeService.createPaymentIntent(...)
neonetService.processPayment(...)
bamService.processPayment(...)

// Refund handling
refundService.processRefund(paymentId, amount, reason)
```

**Key Files**:
- `services/paymentService.ts` - Main payment orchestrator
- `services/paypalService.ts` - PayPal integration
- `services/stripeService.ts` - Stripe integration
- `services/neonetService.ts` - NeoNet integration (with mock mode)
- `services/bamService.ts` - BAM integration (with mock mode)
- `services/refundService.ts` - Refund processing
- `controllers/paymentController.ts` - Payment endpoints
- `controllers/webhookController.ts` - Payment webhooks

## Project Status

### Current Implementation

**Scale & Architecture**:
- **Modules**: 36 functional modules across 14 feature areas
- **API Endpoints**: 150+ RESTful endpoints
- **Controllers**: 36 controller files
- **Services**: 60 service files (business logic layer)
- **Database**:
  - 69 Sequelize models with TypeScript decorators
  - 59 migration files (numbered 000-047, plus timestamped)
  - 7+ seeder files for initial data

**Feature Completeness**:
- ✅ **Authentication**: JWT-based auth with 2FA, sessions, RBAC (8 roles, multiple permissions)
- ✅ **Events**: Full CRUD, templates, duplication, categories, types, sessions, reports
- ✅ **Speakers**: Profiles, specialties, contracts, payments, evaluations, availability
- ✅ **Registration**: Individual/group registrations, cart, abandoned cart tracking
- ✅ **Payments**: 4 gateway integrations (PayPal, Stripe, NeoNet, BAM) with refunds, webhooks
- ✅ **FEL**: Guatemala electronic invoicing with NIT/CUI validation, token management
- ✅ **QR Codes**: Dynamic generation, validation, attendance tracking, offline sync
- ✅ **Certificates**: PDF generation with blockchain anchoring on Ethereum testnet
- ✅ **Notifications**: Multi-channel (Email, SMS, WhatsApp) with templates, rules, preferences
- ✅ **Hybrid Events**: Virtual rooms, streaming config, virtual participant tracking
- ✅ **Promotions**: Promo codes, volume discounts, early bird pricing, usage tracking
- ✅ **Capacity**: Sophisticated capacity rules, access types, overbooking, waitlists
- ✅ **Real-time**: Socket.IO for live updates (attendance, capacity, payments)
- ✅ **Background Jobs**: Bull queue for async processing (emails, certificates, reports)
- ✅ **Security**: Helmet, CORS, rate limiting, AES-256 encryption, comprehensive audit logging

**Technology Stack**:
- Node.js + Express.js + TypeScript
- PostgreSQL with Sequelize ORM
- Redis for caching, sessions, queues
- Socket.IO for WebSocket connections
- Bull for job queues
- Puppeteer/pdf-lib for PDF generation
- Ethers.js for blockchain integration

**Project Focus**: Backend API development (frontend directory is currently empty)
