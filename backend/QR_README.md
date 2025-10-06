# 📱 Módulo QR - Control de Acceso y Códigos QR

## Descripción General

El **Módulo QR** es un sistema completo de control de acceso basado en códigos QR dinámicos para eventos empresariales. Implementa validación en tiempo real, integración con blockchain para anti-falsificación, funcionalidad offline y reportes avanzados.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas
- **Generación automática** de códigos QR únicos por inscripción
- **Validación en tiempo real** con verificación blockchain
- **Control de acceso offline** para ubicaciones remotas
- **Encriptación AES-256 + firma HMAC-SHA256** para seguridad
- **Registro automático de asistencia** al validar QR
- **Gestión de excepciones** y códigos de respaldo
- **Reportes y analytics** de uso de QR
- **Rate limiting** y protección contra abuso

### 🔒 Seguridad Implementada
- **Encriptación de datos sensibles** en QR
- **Firma digital HMAC-SHA256** para integridad
- **Prevención de ataques replay** con nonces únicos
- **Validación de límites temporales** de eventos
- **Auditoría completa** de todos los accesos
- **Invalidación de QR** por seguridad

### ⛓️ Integración Blockchain
- **Registro automático** en Ethereum Sepolia
- **Verificación de autenticidad** contra blockchain
- **Hashes SHA-256** de contenido QR
- **Transacciones batch** para optimizar gas
- **Manejo de errores** y reintentos automáticos

## 📋 Arquitectura del Sistema

### Componentes Principales

```
📁 backend/src/
├── 📄 controllers/qrController.ts    # Controladores HTTP
├── 📄 services/qrService.ts          # Lógica de negocio
├── 📄 models/QRCode.ts              # Modelo de datos QR
├── 📄 models/Attendance.ts          # Modelo de asistencia
├── 📄 models/AccessLog.ts           # Logs de acceso
├── 📄 routes/qr.ts                  # Definición de rutas
└── 📄 types/qr.types.ts             # Tipos TypeScript
```

### Modelos de Datos

#### QRCode
```typescript
interface QRCodeAttributes {
  id: number;
  eventRegistrationId: number;  // FK a inscripción
  qrData: any;                  // Datos encriptados
  qrHash: string;              // Hash SHA-256 único
  status: QRStatus;            // ACTIVE | USED | EXPIRED | INVALIDATED
  generatedAt: Date;
  expiresAt?: Date;
  blockchainTxHash?: string;   // Hash de transacción blockchain
  createdBy: number;           // Usuario que generó el QR
}
```

#### Attendance
```typescript
interface AttendanceAttributes {
  eventId: number;
  userId: number;
  qrCodeId: number;
  checkInTime: Date;
  accessPoint?: string;
  method: AttendanceMethod;    // QR | MANUAL | BACKUP_CODE
  status: AttendanceStatus;    // CHECKED_IN | CHECKED_OUT
}
```

## 🔗 Endpoints de API

### Generación y Gestión de QR

#### `POST /api/v1/qr/generate/{registrationId}`
Genera un código QR único para una inscripción confirmada.

**Request Body:**
```json
{
  "expiresAt": "2025-12-31T23:59:59Z",
  "metadata": {
    "purpose": "event_access",
    "notes": "Generated for Tech Conference 2025"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Código QR generado exitosamente",
  "data": {
    "qrId": 1,
    "qrHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "qrUrl": "data:image/png;base64,...",
    "status": "active",
    "expiresAt": "2025-12-31T23:59:59Z",
    "blockchainTxHash": "0x123..."
  }
}
```

#### `GET /api/v1/qr/{registrationId}`
Obtiene información del código QR asociado a una inscripción.

#### `POST /api/v1/qr/regenerate/{registrationId}`
Invalida el QR actual y genera uno nuevo.

### Validación y Control de Acceso

#### `POST /api/v1/qr/validate`
Valida un código QR escaneado y registra asistencia.

**Request Body:**
```json
{
  "qrHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "eventId": 1,
  "accessPoint": "Main Entrance",
  "deviceInfo": {
    "deviceType": "mobile_scanner",
    "appVersion": "1.0.0",
    "os": "iOS"
  },
  "location": {
    "latitude": 14.6349,
    "longitude": -90.5069,
    "accuracy": 10
  }
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Acceso concedido",
  "data": {
    "isValid": true,
    "status": "used",
    "participantId": 123,
    "registrationId": 456,
    "eventId": 1,
    "attendanceRecorded": true,
    "attendanceId": 789,
    "message": "Acceso concedido exitosamente"
  }
}
```

### Verificación Blockchain

#### `GET /api/v1/qr/blockchain-verify/{hash}`
Verifica la autenticidad de un código QR consultando blockchain.

**Response:**
```json
{
  "success": true,
  "message": "QR verificado en blockchain",
  "data": {
    "exists": true,
    "hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "txHash": "0x123...",
    "blockNumber": 12345678,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Gestión y Reportes

#### `POST /api/v1/qr/invalidate/{qrId}`
Invalida un código QR por razones de seguridad.

#### `GET /api/v1/qr/stats/{eventId}`
Obtiene estadísticas de uso de códigos QR para un evento.

**Response:**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "eventId": 1,
    "active": 450,
    "used": 45,
    "expired": 5,
    "invalidated": 0
  }
}
```

## 📱 Funcionalidad Offline

### Descarga de Lista Offline
#### `POST /api/v1/qr/offline/download-list/{eventId}`
Descarga una lista encriptada de QRs válidos para modo offline.

### Validación Offline
#### `POST /api/v1/qr/offline/validate`
Valida QR en modo offline (sin conexión a internet).

### Sincronización
#### `POST /api/v1/qr/offline/sync-attendance`
Sincroniza registros de asistencia realizados en modo offline.

#### `GET /api/v1/qr/offline/sync-status`
Consulta el estado de sincronización offline.

## 🔐 Seguridad y Validaciones

### Rate Limiting
- **Generación QR**: 10 por 15 minutos por usuario
- **Validación QR**: 30 por minuto por endpoint
- **Verificación blockchain**: 20 por minuto (público)

### Validaciones Implementadas
- **Hash QR**: Formato SHA-256 válido (64 caracteres hexadecimales)
- **Estado QR**: Solo QR activos pueden ser validados
- **Evento correcto**: QR debe corresponder al evento especificado
- **Límites temporales**: Validación de horarios de evento
- **Asistencia duplicada**: Prevención de múltiples check-ins

### Manejo de Errores
```json
{
  "success": false,
  "message": "Código QR inválido",
  "data": {
    "isValid": false,
    "status": "invalidated",
    "failureReason": "Código QR no encontrado",
    "message": "Este código QR no existe en el sistema"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 🗃️ Base de Datos

### Migraciones
```sql
-- Tabla principal de QR codes
CREATE TABLE qr_codes (
  id SERIAL PRIMARY KEY,
  event_registration_id INTEGER NOT NULL,
  qr_data JSONB,                    -- Datos encriptados
  qr_hash VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  blockchain_tx_hash VARCHAR(66),   -- Hash Ethereum
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de asistencia
CREATE TABLE attendances (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  qr_code_id INTEGER,
  check_in_time TIMESTAMP DEFAULT NOW(),
  access_point VARCHAR(100),
  method VARCHAR(20) DEFAULT 'qr',
  status VARCHAR(20) DEFAULT 'checked_in'
);

-- Tabla de logs de acceso
CREATE TABLE access_logs (
  id SERIAL PRIMARY KEY,
  event_id INTEGER,
  user_id INTEGER,
  qr_code_id INTEGER,
  access_type VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW(),
  result VARCHAR(20),
  failure_reason TEXT,
  severity VARCHAR(20) DEFAULT 'low'
);
```

### Índices de Performance
```sql
-- Índices para búsquedas rápidas
CREATE UNIQUE INDEX idx_qr_codes_hash ON qr_codes(qr_hash);
CREATE INDEX idx_qr_codes_registration ON qr_codes(event_registration_id, status);
CREATE INDEX idx_qr_codes_status ON qr_codes(status);
CREATE INDEX idx_qr_codes_expires ON qr_codes(expires_at);
CREATE INDEX idx_attendances_event_user ON attendances(event_id, user_id);
```

## ⚙️ Configuración

### Variables de Entorno
```bash
# QR Configuration
QR_ENCRYPTION_KEY=32_char_hex_key_here
QR_HMAC_SECRET=32_char_secret_here
QR_VALIDITY_HOURS=24
QR_MAX_OFFLINE_HOURS=168
QR_BATCH_SIZE=100
QR_CACHE_TTL=3600

# Blockchain Configuration
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHEREUM_WALLET_KEY=your_private_key
BLOCKCHAIN_ENABLED=true
```

### Rate Limiting Configuration
```typescript
const RATE_LIMITS = {
  QR_GENERATION: { windowMs: 15 * 60 * 1000, max: 10 },  // 10 por 15 min
  QR_VALIDATION: { windowMs: 60 * 1000, max: 30 },       // 30 por minuto
  PUBLIC_QR: { windowMs: 60 * 1000, max: 20 }            // 20 por minuto
};
```

## 🧪 Testing

### Tests Unitarios
```bash
# Ejecutar tests del módulo QR
npm test -- --testPathPattern=qr

# Tests específicos
npm test -- qrService.test.ts
npm test -- qrController.test.ts
```

### Casos de Prueba
- ✅ Generación de QR con datos válidos
- ✅ Validación de QR existente
- ✅ Rechazo de QR inválido/expirado
- ✅ Prevención de asistencia duplicada
- ✅ Rate limiting funcional
- ✅ Integración blockchain
- ✅ Funcionalidad offline

## 📊 Monitoreo y Métricas

### KPIs del Módulo QR
- **Tasa de éxito de validación**: >99%
- **Tiempo de respuesta**: <1 segundo
- **Tasa de falsos positivos**: <0.1%
- **Disponibilidad**: >99.9%

### Logs de Monitoreo
```bash
# Verificar logs de QR
grep "QR_VALIDATION" logs/app.log
grep "BLOCKCHAIN" logs/app.log
grep "ACCESS_DENIED" logs/app.log
```

## 🚀 Guía de Despliegue

### Pre-requisitos
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Ethereum RPC endpoint (Sepolia testnet)

### Configuración de Producción
1. **Configurar variables de entorno** para producción
2. **Verificar conectividad blockchain** antes del despliegue
3. **Configurar rate limiting** según carga esperada
4. **Establecer alertas** para fallos de validación

### Checklist de Despliegue
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] Conexión blockchain verificada
- [ ] Tests pasando
- [ ] Rate limiting configurado
- [ ] Logs configurados
- [ ] Monitoreo habilitado

## 🔧 Solución de Problemas

### Problemas Comunes

#### QR no se valida
1. Verificar que el QR esté activo: `SELECT * FROM qr_codes WHERE qr_hash = '...'`
2. Verificar expiración: `expires_at > NOW()`
3. Verificar evento correcto en la validación

#### Error de blockchain
1. Verificar conectividad RPC: `curl $ETHEREUM_RPC_URL`
2. Verificar saldo de wallet para gas fees
3. Revisar logs: `grep "BLOCKCHAIN_ERROR" logs/app.log`

#### Performance lenta
1. Verificar índices de BD
2. Revisar configuración de Redis cache
3. Verificar rate limiting no excesivo

## 📚 Referencias

### Documentación Técnica
- [Ethereum JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/)
- [QR Code Standards](https://www.qrcode.com/en/)
- [HMAC-SHA256](https://tools.ietf.org/html/rfc2104)

### Endpoints Relacionados
- `/api/v1/events` - Gestión de eventos
- `/api/v1/registrations` - Inscripciones
- `/api/v1/certificates` - Certificados blockchain

---

**Desarrollado por:** TradeConnect Team
**Versión:** 1.0.0
**Última actualización:** 2025-10-06