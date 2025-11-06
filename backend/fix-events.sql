-- Script para publicar los eventos de prueba y hacerlos visibles en el dashboard
-- Ejecutar este script en la base de datos tradeconnect_dev

-- Paso 1: Actualizar los eventos para marcarlos como publicados
-- Esto establece published_at con la fecha/hora actual
UPDATE events
SET published_at = CURRENT_TIMESTAMP
WHERE id IN (7, 8) AND published_at IS NULL;

-- Verificar los cambios
SELECT
  id,
  title,
  published_at,
  event_status_id,
  is_virtual
FROM events
WHERE id IN (7, 8);

-- Mostrar los statuses
SELECT * FROM event_statuses ORDER BY id;
