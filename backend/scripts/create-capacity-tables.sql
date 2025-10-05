-- Script SQL para crear las tablas del módulo de gestión de aforos
-- Ejecutar este script directamente en PostgreSQL

-- Crear tabla access_types
CREATE TABLE IF NOT EXISTS "access_types" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL UNIQUE,
  "display_name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "short_description" VARCHAR(500),
  "category" VARCHAR(50) NOT NULL,
  "color" VARCHAR(7),
  "icon" VARCHAR(100),
  "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSON,
  "created_by" INTEGER NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- Crear índices para access_types
CREATE UNIQUE INDEX IF NOT EXISTS "access_types_name_index" ON "access_types" ("name");
CREATE INDEX IF NOT EXISTS "access_types_category_index" ON "access_types" ("category");
CREATE INDEX IF NOT EXISTS "access_types_status_index" ON "access_types" ("status");
CREATE INDEX IF NOT EXISTS "access_types_is_default_index" ON "access_types" ("is_default");
CREATE INDEX IF NOT EXISTS "access_types_priority_index" ON "access_types" ("priority");
CREATE INDEX IF NOT EXISTS "access_types_display_order_index" ON "access_types" ("display_order");
CREATE INDEX IF NOT EXISTS "access_types_created_by_index" ON "access_types" ("created_by");
CREATE INDEX IF NOT EXISTS "access_types_created_at_index" ON "access_types" ("created_at");

-- Crear tabla capacities
CREATE TABLE IF NOT EXISTS "capacities" (
  "id" SERIAL PRIMARY KEY,
  "event_id" INTEGER NOT NULL UNIQUE REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "total_capacity" INTEGER NOT NULL,
  "available_capacity" INTEGER NOT NULL DEFAULT 0,
  "blocked_capacity" INTEGER NOT NULL DEFAULT 0,
  "overbooking_percentage" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "overbooking_enabled" BOOLEAN NOT NULL DEFAULT false,
  "waitlist_enabled" BOOLEAN NOT NULL DEFAULT true,
  "lock_timeout_minutes" INTEGER NOT NULL DEFAULT 15,
  "alert_thresholds" JSON NOT NULL DEFAULT '{"low": 80, "medium": 90, "high": 95}',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSON,
  "created_by" INTEGER NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- Crear índices para capacities
CREATE UNIQUE INDEX IF NOT EXISTS "capacities_event_id_index" ON "capacities" ("event_id");
CREATE INDEX IF NOT EXISTS "capacities_is_active_index" ON "capacities" ("is_active");
CREATE INDEX IF NOT EXISTS "capacities_created_by_index" ON "capacities" ("created_by");
CREATE INDEX IF NOT EXISTS "capacities_created_at_index" ON "capacities" ("created_at");

-- Crear tabla overbookings
CREATE TABLE IF NOT EXISTS "overbookings" (
  "id" SERIAL PRIMARY KEY,
  "event_id" INTEGER NOT NULL UNIQUE REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "max_percentage" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "current_percentage" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "risk_level" VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  "auto_actions" JSON NOT NULL DEFAULT '{"alertAdmins": true, "notifyUsers": false, "offerAlternatives": false}',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "activated_at" TIMESTAMP WITH TIME ZONE,
  "deactivated_at" TIMESTAMP WITH TIME ZONE,
  "metadata" JSON,
  "created_by" INTEGER NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- Crear índices para overbookings
CREATE UNIQUE INDEX IF NOT EXISTS "overbookings_event_id_index" ON "overbookings" ("event_id");
CREATE INDEX IF NOT EXISTS "overbookings_is_active_index" ON "overbookings" ("is_active");
CREATE INDEX IF NOT EXISTS "overbookings_risk_level_index" ON "overbookings" ("risk_level");
CREATE INDEX IF NOT EXISTS "overbookings_activated_at_index" ON "overbookings" ("activated_at");
CREATE INDEX IF NOT EXISTS "overbookings_created_by_index" ON "overbookings" ("created_by");
CREATE INDEX IF NOT EXISTS "overbookings_created_at_index" ON "overbookings" ("created_at");

-- Crear tabla capacity_rules
CREATE TABLE IF NOT EXISTS "capacity_rules" (
  "id" SERIAL PRIMARY KEY,
  "event_id" INTEGER NOT NULL REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "type" VARCHAR(30) NOT NULL CHECK (type IN ('GLOBAL', 'DATE_SPECIFIC', 'SESSION_SPECIFIC', 'ACCESS_TYPE_SPECIFIC')),
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "conditions" JSON NOT NULL DEFAULT '{}',
  "actions" JSON NOT NULL DEFAULT '{}',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "created_by" INTEGER NOT NULL REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- Crear índices para capacity_rules
CREATE INDEX IF NOT EXISTS "capacity_rules_event_id_index" ON "capacity_rules" ("event_id");
CREATE INDEX IF NOT EXISTS "capacity_rules_type_index" ON "capacity_rules" ("type");
CREATE INDEX IF NOT EXISTS "capacity_rules_is_active_index" ON "capacity_rules" ("is_active");
CREATE INDEX IF NOT EXISTS "capacity_rules_priority_index" ON "capacity_rules" ("priority");
CREATE INDEX IF NOT EXISTS "capacity_rules_created_by_index" ON "capacity_rules" ("created_by");
CREATE INDEX IF NOT EXISTS "capacity_rules_created_at_index" ON "capacity_rules" ("created_at");

-- Agregar comentarios a las tablas
COMMENT ON TABLE "access_types" IS 'Tipos de acceso disponibles para eventos';
COMMENT ON TABLE "capacities" IS 'Configuración de capacidades por evento';
COMMENT ON TABLE "overbookings" IS 'Configuración de overbooking por evento';
COMMENT ON TABLE "capacity_rules" IS 'Reglas específicas de capacidad por evento';

-- Insertar algunos tipos de acceso por defecto
INSERT INTO "access_types" ("name", "display_name", "description", "category", "status", "is_default", "priority", "display_order", "created_by", "created_at", "updated_at")
VALUES
  ('general', 'Acceso General', 'Acceso estándar para todos los participantes', 'standard', 'ACTIVE', true, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vip', 'Acceso VIP', 'Acceso premium con beneficios adicionales', 'premium', 'ACTIVE', false, 10, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('student', 'Acceso Estudiante', 'Acceso especial para estudiantes', 'standard', 'ACTIVE', false, 5, 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;