# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeConnect is an e-commerce platform backend built with TypeScript, Express.js, PostgreSQL, and Redis. The platform is designed for managing business events with modules including authentication, event management, payment processing, FEL (Guatemalan electronic invoicing) integration, QR codes, certificates, and hybrid events support.

## Development Commands

### Running the Application
```bash
npm run dev              # Start development server with nodemon
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production server from dist/
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
```

### Code Quality
```bash
npm run lint             # Check code with ESLint
npm run lint:fix         # Fix ESLint errors automatically
npm run format           # Format code with Prettier
```

### Database Operations
```bash
npm run db:migrate       # Run Sequelize migrations
npm run db:seed          # Seed database with initial data
```

### Documentation
```bash
npm run docs:generate    # Generate Swagger API documentation
```

## Architecture

### Database Architecture (Sequelize TypeScript ORM)

The application uses **Sequelize TypeScript** with decorators for model definitions. All models are defined in `src/models/` and registered in `src/models/index.ts`. The database is PostgreSQL.

**Core Models:**
- `User` - User accounts with bcrypt password hashing (hooks in BeforeCreate/BeforeUpdate)
- `Role` - User roles (admin, organizer, participant, etc.)
- `Permission` - Granular permissions system
- `UserRole` - Many-to-many relationship between users and roles
- `RolePermission` - Many-to-many relationship between roles and permissions
- `Session` - Active user sessions with device tracking
- `TwoFactorAuth` - 2FA implementation (TOTP/SMS)
- `AuditLog` - Security audit trail

**Important:** Models use TypeScript decorators (`@Table`, `@Column`, etc.) and must be added to the `sequelize.addModels()` array in `src/models/index.ts` to be registered.

### Authentication & Authorization Flow

1. **JWT-based authentication** with access and refresh tokens
2. **Session management** tracked in both PostgreSQL and Redis
3. **Two-factor authentication** (2FA) supported via TOTP and SMS
4. **Role-Based Access Control (RBAC)** with permissions checked via middleware
5. **Security middleware** includes rate limiting, helmet, CORS, and request validation

Key files:
- `src/middleware/auth.ts` - JWT authentication middleware, role/permission checks
- `src/services/authService.ts` - Login, registration, password reset, token generation
- `src/services/twoFactorService.ts` - 2FA setup, verification, recovery codes
- `src/services/securityService.ts` - Security monitoring, breach detection, suspicious activity tracking
- `src/middleware/rateLimiting.ts` - Redis-backed rate limiting (general + auth-specific)

### Request Flow

```
Request → Rate Limiter → Security Middleware → Auth Middleware → Route Handler → Service Layer → Model Layer → Database
```

### Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@/*` → `src/*`
- `@config/*` → `src/config/*`
- `@middleware/*` → `src/middleware/*`
- `@models/*` → `src/models/*`
- `@routes/*` → `src/routes/*`
- `@services/*` → `src/services/*`
- `@utils/*` → `src/utils/*`
- `@types/*` → `src/types/*`

Use these aliases when importing to maintain consistency.

### Middleware Stack Order (Critical)

The middleware order in `src/server.ts` is critical:
1. Helmet (security headers)
2. CORS
3. Compression
4. General rate limiter
5. Basic security middleware
6. Auth-specific rate limiter (for `/api/auth` routes)
7. Body parsers (JSON, URL-encoded)
8. Request logger
9. Routes
10. 404 handler
11. Error logger
12. Global error handler

### Error Handling

Global error handler in `src/server.ts` catches:
- JSON parsing errors
- File size limit errors
- Sequelize validation errors
- JWT errors (invalid/expired tokens)
- Custom API errors

Use `successResponse()` and `errorResponse()` from `src/utils/common.utils.ts` for consistent API responses.

### Environment Configuration

Copy `.env.example` to `.env` and configure:
- Database credentials (PostgreSQL)
- Redis connection
- JWT secrets (use long random strings in production)
- Email SMTP settings
- FEL API credentials (Guatemala electronic invoicing)
- Payment gateway credentials (PayPal, Stripe, NeoNet, BAM)
- Twilio/WhatsApp for 2FA SMS
- Logging level and file path

### Redis Usage

Redis is used for:
- Session storage (active sessions)
- Rate limiting counters
- Caching (future implementation)
- Token blacklisting (future implementation)

Connection configured in `src/config/redis.ts`.

### Logging

Winston logger configured in `src/utils/logger.ts`:
- Console output in development
- File output in `logs/app.log`
- Different log levels (error, warn, info, debug)
- Structured logging with timestamps

Request/response logging via `src/middleware/logging.middleware.ts`.

### Database Migrations

Migrations are in `migrations/` directory and should be run in order (numbered 000-007):
1. Create users table
2. Create permissions table
3. Create two_factor_auth table
4. Create audit_logs table
5. Create roles table
6. Create user_roles junction table
7. Create role_permissions junction table
8. Create sessions table

Seeders initialize default permissions, roles, and admin user.

### Security Features

- **Rate Limiting**: Redis-backed, configurable limits per endpoint
- **Password Hashing**: bcrypt with automatic hashing in model hooks
- **JWT Tokens**: Signed with strong secrets, includes refresh token flow
- **Session Tracking**: Device info, IP address, last activity
- **Audit Logging**: All security-relevant actions logged
- **Security Service**: Monitors for suspicious activity, password breaches
- **Input Validation**: Express-validator on all routes
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers enabled

## Common Issues

### TypeScript Path Aliases
If imports fail, ensure `tsconfig.json` paths are mirrored in `jest.config.js` moduleNameMapping.

### Sequelize Model Registration
New models must be added to `src/models/index.ts` in the `sequelize.addModels()` array.

### Migration Order
Migrations must run in sequence due to foreign key dependencies. Use numbered prefixes.

### Redis Connection
If Redis is unavailable, the app will start but rate limiting and sessions may not work correctly.

## API Structure

Current implemented routes:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns access + refresh tokens)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate session
- `GET /api/users/me` - Get current user profile (requires auth)
- `GET /api/sessions` - List user sessions (requires auth)
- `DELETE /api/sessions/:id` - Revoke specific session (requires auth)

Health check endpoints:
- `GET /health` - System health (DB + Redis status)
- `GET /info` - System information

## Future Modules (Planned)

Based on server.ts, these modules are planned:
- Events Management
- Registration System
- Payment Processing (PayPal, Stripe, NeoNet, BAM)
- FEL Integration (Guatemalan electronic invoicing)
- QR Codes & Access Control
- Certificate Generation
- Notifications (Email, SMS, WhatsApp)
- Hybrid Events
- Reports & Analytics