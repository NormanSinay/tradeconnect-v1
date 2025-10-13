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

# Building
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled code from dist/

# Testing
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
```

### Database Setup

The project uses PostgreSQL and Redis. Start both services with Docker:

```bash
# From project root
docker-compose up -d     # Start PostgreSQL, Redis, and MailHog

# Then run migrations and seeds
cd backend
npm run db:migrate
npm run db:seed
```

Database configuration is in `backend/config/config.json` for Sequelize CLI and `backend/src/config/database.ts` for the application.

## Architecture

### Core Modules

TradeConnect is organized into 17+ feature modules:

1. **Authentication & Users** - JWT-based auth with 2FA, sessions, role-based access control (RBAC)
2. **Events Management** - Core event CRUD, templates, duplication, categories, types, statuses, event sessions
3. **Speakers** - Speaker profiles, specialties, availability, contracts, payments, evaluations
4. **Registration System** - Individual and group registrations, cart management, abandoned cart tracking
5. **Payment Processing** - PayPal, Stripe, NeoNet, BAM gateway integrations with refunds and reconciliation
6. **FEL Integration** - Guatemala electronic invoicing system with NIT/CUI validation, tokens, error handling
7. **QR Codes & Access Control** - Event access via QR validation, attendance tracking, access logs, sync logs
8. **Certificate Generation** - PDF certificates with blockchain anchoring, certificate templates, validation logs
9. **Notifications** - Email, SMS (Twilio), WhatsApp with templates, rules, user preferences
10. **Hybrid Events** - Support for virtual, in-person, and hybrid events with virtual rooms and streaming
11. **Reports & Analytics** - Event metrics, registration reports, financial reports
12. **Promotions & Discounts** - Promo codes, volume discounts, early bird pricing, usage tracking
13. **Capacity Management** - Event capacities, access types, overbooking rules, waitlists
14. **Invoicing** - Complete invoicing system integrated with FEL

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
├── migrations/      # Sequelize migration files (000-032)
├── seeders/         # Database seed files
├── config/          # Sequelize CLI config
└── dist/            # Compiled JavaScript output
```

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

**Core Entities** (71+ models):
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
- UI: `http://localhost:3000/api/docs`
- JSON: `http://localhost:3000/api/docs.json`

Generate updated docs: `npm run docs:generate`

### Testing Strategy

- **Unit Tests**: Test services and utilities in isolation
- **Integration Tests**: Test API endpoints with supertest
- **Test Database**: Uses `tradeconnect_test` database (see `config/config.json`)
- Run single test: `npm test -- path/to/test.spec.ts`

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

Migrations are in `backend/migrations/` with 59 migration files. When creating a new migration:
- Follow existing naming patterns: `0XX-create-table-name.js` or timestamp-based `YYYYMMDDHHMMSS-create-table-name.js`
- Include both `up` and `down` methods
- Run `npm run db:migrate` to apply
- Sequelize CLI uses `config/config.json` for connection settings
- Recent migrations use timestamp format for better collaboration

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

## Project Status

Current implementation includes:
- 150+ API endpoints across all modules
- 59 database migrations
- 7+ database seeders
- 71+ Sequelize models
- Complete authentication system with 2FA
- Events module with speakers, registrations, and sessions
- Cart and registration system with abandoned cart tracking
- Payment processing with 4 gateway integrations (PayPal, Stripe, NeoNet, BAM)
- FEL integration with NIT/CUI validation for Guatemala
- QR code generation and access control system
- Certificate generation with blockchain anchoring
- Notification system (Email, SMS, WhatsApp) with templates and rules
- Hybrid events with virtual rooms and streaming
- Promotions and discount system (promo codes, volume, early bird)
- Capacity management with overbooking and waitlists
- Comprehensive security and rate limiting
- Socket.IO for real-time features
- Bull queue service for background jobs

The frontend directory currently appears empty - backend API development is the focus.
