<!-- .github/copilot-instructions.md - instrucciones para agentes de codificación -->
# Instrucciones rápidas para agentes (TradeConnect)

Resumen corto:
- Backend Node.js + Express + TypeScript (carpeta `backend/`). Frontend en `frontend/` (Astro/React).
- DB: PostgreSQL; Cache/queues: Redis + Bull. Migrations/seeders usan Sequelize CLI (`backend/migrations`, `backend/seeders`).

Qué hacer primero:
- Buscar y usar `backend/.env.example` para variables necesarias.
- Levantar servicios locales: `docker-compose up -d` desde la raíz (Postgres, Redis, MailHog).
- Instalar deps y ejecutar en modo desarrollo desde `backend/`:
  - `npm install`
  - `npm run dev` (inicia nodemon en `src/server.ts`)

Comandos esenciales (directorio `backend/`):
- Dev server: `npm run dev`
- Build: `npm run build` -> genera `dist/`
- Start prod: `npm start` (ejecuta `dist/server.js`)
- Tests: `npm test`, `npm run test:watch`, `npm run test:coverage`
- DB: `npm run db:migrate`, `npm run db:seed`
- Docs: `npm run docs:generate` (genera `docs/swagger.json`)

Arquitectura y patrones relevantes:
- Estructura principal: `src/{controllers,routes,services,models,middleware,utils}`.
- Service layer: la lógica está en `services/*`; los controllers solo manejan HTTP. Ejemplo: `eventService.createEvent()`.
- Event-driven: `eventService` emite eventos y `eventListenersService` registra listeners. Inicialización en `backend/src/server.ts`.
- Queue workers: usan Bull a través de `services/queueService.ts` (jobs: emails, certificates, reminders).

Paths y alias TypeScript:
- Revisar `backend/tsconfig.json` (aliases): `@/*` → `src/*`, `@services/*`, `@models/*`, `@utils/*`, etc. Úsalos en imports.

Dónde buscar cosas concretas:
- Rutas y controladores: `backend/src/routes/` y `backend/src/controllers/`.
- Modelos y relaciones: `backend/src/models/` y `backend/migrations/`.
- Permisos y RBAC: `backend/src/utils/constants.ts` (constantes `PERMISSIONS`), middleware en `backend/src/middleware/auth.ts`.
- Inicialización del servidor (CORS, rate-limit, swagger): `backend/src/server.ts`.
- Swagger UI: `http://localhost:<PORT>/api/docs` una vez levantado el backend.

Consejos específicos para PRs o cambios automáticos:
- Cuando agregues un modelo: crear archivo en `src/models`, añadir export/registro en `src/models/index.ts`, crear migration en `backend/migrations/`, y ejecutar `npm run db:migrate`.
- Para nuevas rutas: añadir controller > route > registrar en `server.ts` > documentar con JSDoc para Swagger.
- Mantener servicios puros: mover la lógica a `services/` y dejar los controladores lo más delgados posible.

Tests y mocks:
- Tests unitarios con Jest en `backend/` (`npm test`).
- Pagos: habilitar mocks mediante variables `.env` (ejemplo `NEONET_MOCK=true`, `BAM_MOCK=true`). Buscar usos en `services/payment*`.

Errores comunes detectables en el repo:
- Imports fuera de alias: usar los aliases definidos en `tsconfig.json` para evitar paths relativos largos.
- Variables de entorno faltantes: chequear `backend/.env.example` antes de ejecutar.

Si necesitas más contexto, lee estos archivos (prioridad):
1. `backend/src/server.ts` (inicio, middlewares, listeners)
2. `backend/tsconfig.json` (aliases)
3. `backend/src/services/eventService.ts` y `backend/src/services/eventListeners.ts`
4. `backend/src/services/queueService.ts`
5. `backend/src/utils/constants.ts` (PERMISSIONS)

Preguntas útiles para el autor humano si algo no está claro:
- ¿Puerto por defecto esperado (env) para desarrollo? (server usa `config.PORT`)
- ¿Alguna variable de entorno obligatoria no documentada en `.env.example`?

Mantendré estas instrucciones cortas y apuntadas a tareas automáticas: si quieres que incluya snippets de codificación automáticos o reglas de estilo más estrictas (lint/fix, PR templates), dime y los incorporo.
