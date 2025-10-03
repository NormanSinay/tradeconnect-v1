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

TradeConnect is organized into 17 feature modules:

1. **Authentication & Users** - JWT-based auth with 2FA, sessions, role-based access control (RBAC)
2. **Events Management** - Core event CRUD, templates, duplication, categories, types, statuses
3. **Speakers** - Speaker profiles, specialties, availability, contracts, payments, evaluations
4. **Registration System** - Individual and group registrations, cart management, abandoned cart tracking
5. **Payment Processing** - PayPal, Stripe, NeoNet, BAM gateway integrations
6. **FEL Integration** - Guatemala electronic invoicing system
7. **QR Codes & Access Control** - Event access via QR validation
8. **Certificate Generation** - PDF certificates with blockchain anchoring
9. **Notifications** - Email, SMS (Twilio), WhatsApp
10. **Hybrid Events** - Support for virtual, in-person, and hybrid events
11. **Reports & Analytics** - Event metrics, registration reports, financial reports

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

**Core Entities**:
- `User` → `UserRole` ← `Role` ← `RolePermission` → `Permission`
- `User` → `Session` (JWT sessions), `TwoFactorAuth`, `AuditLog`
- `Event` → `EventType`, `EventCategory`, `EventStatus`, `EventTemplate`, `EventMedia`
- `Event` → `EventRegistration`, `SpeakerEvent` ← `Speaker`
- `Speaker` → `Contract`, `SpeakerPayment`, `SpeakerEvaluation`, `SpeakerAvailabilityBlock`
- `User` → `Registration`, `GroupRegistration`
- `Cart` → `CartItem`, `CartSession`, `AbandonedCart`

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

Migrations are in `backend/migrations/` numbered sequentially (000-032). When creating a new migration:
- Follow existing naming: `0XX-create-table-name.js`
- Include both `up` and `down` methods
- Run `npm run db:migrate` to apply
- Sequelize CLI uses `config/config.json` for connection settings

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
- 113 API endpoints across all modules
- 32 database migrations
- 7 database seeders
- 22 Sequelize models
- Complete authentication system with 2FA
- Events module with speakers and registrations
- Cart and registration system (recently added)
- Comprehensive security and rate limiting

The frontend directory currently appears empty - backend API development is the focus.
