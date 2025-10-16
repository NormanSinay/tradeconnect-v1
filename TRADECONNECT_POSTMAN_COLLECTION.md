# Colección Postman - TradeConnect Usuario Final

## Descripción
Colección completa de endpoints para el flujo de usuario final en TradeConnect. Incluye todas las fases desde registro hasta certificación.

## Variables de Entorno
Configurar las siguientes variables en Postman:

```json
{
  "base_url": "http://localhost:3000/api",
  "user_email": "usuario@ejemplo.com",
  "user_password": "Contraseña123",
  "access_token": "",
  "refresh_token": "",
  "event_id": "",
  "registration_id": "",
  "cart_session_id": "",
  "payment_id": "",
  "certificate_hash": ""
}
```

## Estructura de la Colección

### 🔐 **1. AUTENTICACIÓN**
#### 1.1 Registro de Usuario
**Method:** POST
**URL:** `{{base_url}}/auth/register`
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "email": "{{user_email}}",
  "password": "Contraseña123",
  "confirmPassword": "Contraseña123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+502 1234-5678",
  "nit": "12345678-9",
  "cui": "1234567890123",
  "termsAccepted": true,
  "marketingAccepted": false
}
```
**Tests:**
```javascript
if (pm.response.code === 201) {
    pm.collectionVariables.set("user_email", pm.request.body.raw.email);
}
```

#### 1.2 Verificación de Email
**Method:** POST
**URL:** `{{base_url}}/auth/verify-email`
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "token": "verification_token_from_email"
}
```

#### 1.3 Login
**Method:** POST
**URL:** `{{base_url}}/auth/login`
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "email": "{{user_email}}",
  "password": "{{user_password}}"
}
```
**Tests:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("access_token", response.data.tokens.accessToken);
    pm.collectionVariables.set("refresh_token", response.data.tokens.refreshToken);
}
```

#### 1.4 Refresh Token
**Method:** POST
**URL:** `{{base_url}}/auth/refresh-token`
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "refreshToken": "{{refresh_token}}"
}
```
**Tests:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("access_token", response.data.tokens.accessToken);
    pm.collectionVariables.set("refresh_token", response.data.tokens.refreshToken);
}
```

### 📅 **2. CATÁLOGO PÚBLICO**
#### 2.1 Listar Eventos Públicos
**Method:** GET
**URL:** `{{base_url}}/public/events?page=1&limit=10&search=conferencia`
**Headers:**
```
Content-Type: application/json
```

#### 2.2 Buscar Eventos
**Method:** GET
**URL:** `{{base_url}}/public/events/search?q=blockchain&location=Guatemala&priceMin=0&priceMax=500`
**Headers:**
```
Content-Type: application/json
```

#### 2.3 Detalle de Evento
**Method:** GET
**URL:** `{{base_url}}/public/events/{{event_id}}`
**Headers:**
```
Content-Type: application/json
```
**Tests:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("event_id", response.data.event.id);
}
```

#### 2.4 Vista Calendario
**Method:** GET
**URL:** `{{base_url}}/public/events/calendar?month=10&year=2024`
**Headers:**
```
Content-Type: application/json
```

#### 2.5 Categorías Disponibles
**Method:** GET
**URL:** `{{base_url}}/public/events/categories`
**Headers:**
```
Content-Type: application/json
```

### 🛒 **3. CARRITO DE COMPRAS**
#### 3.1 Obtener Carrito Actual
**Method:** GET
**URL:** `{{base_url}}/cart`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 3.2 Agregar Evento al Carrito
**Method:** POST
**URL:** `{{base_url}}/cart/add`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "eventId": {{event_id}},
  "quantity": 1,
  "accessTypeId": 1,
  "sessionId": "{{cart_session_id}}"
}
```

#### 3.3 Actualizar Item del Carrito
**Method:** PUT
**URL:** `{{base_url}}/cart/update`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "itemId": 1,
  "quantity": 2,
  "sessionId": "{{cart_session_id}}"
}
```

#### 3.4 Aplicar Código Promocional
**Method:** POST
**URL:** `{{base_url}}/cart/apply-promo`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "code": "DESCUENTO20",
  "sessionId": "{{cart_session_id}}"
}
```

#### 3.5 Calcular Totales
**Method:** GET
**URL:** `{{base_url}}/cart/calculate?sessionId={{cart_session_id}}`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 3.6 Remover Item del Carrito
**Method:** DELETE
**URL:** `{{base_url}}/cart/remove/1?sessionId={{cart_session_id}}`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### 📝 **4. INSCRIPCIONES**
#### 4.1 Crear Inscripción
**Method:** POST
**URL:** `{{base_url}}/registrations`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "eventId": {{event_id}},
  "accessTypeId": 1,
  "quantity": 1,
  "attendeeInfo": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "{{user_email}}",
    "phone": "+502 1234-5678"
  },
  "affiliationData": {
    "nit": "12345678-9",
    "cui": "1234567890123"
  }
}
```
**Tests:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("registration_id", response.data.registration.id);
}
```

#### 4.2 Validar Afiliación CCG
**Method:** POST
**URL:** `{{base_url}}/registrations/validate-affiliation`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "nit": "12345678-9",
  "cui": "1234567890123",
  "email": "{{user_email}}",
  "phone": "+502 1234-5678"
}
```

#### 4.3 Listar Mis Inscripciones
**Method:** GET
**URL:** `{{base_url}}/registrations?page=1&limit=10&status=PAGADO`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### 💳 **5. PROCESAMIENTO DE PAGOS**
#### 5.1 Métodos de Pago Disponibles
**Method:** GET
**URL:** `{{base_url}}/payments/methods`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 5.2 Procesar Pago con PayPal
**Method:** POST
**URL:** `{{base_url}}/payments/paypal/create`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "registrationId": {{registration_id}},
  "amount": 150.00,
  "currency": "GTQ",
  "returnUrl": "https://tradeconnect.com/payment/success",
  "cancelUrl": "https://tradeconnect.com/payment/cancel"
}
```
**Tests:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("payment_id", response.data.payment.id);
}
```

#### 5.3 Procesar Pago con Stripe
**Method:** POST
**URL:** `{{base_url}}/payments/stripe/create`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "registrationId": {{registration_id}},
  "amount": 150.00,
  "currency": "GTQ",
  "paymentMethodId": "pm_card_visa"
}
```

#### 5.4 Procesar Pago con NeoNet
**Method:** POST
**URL:** `{{base_url}}/payments/neonet/create`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "registrationId": {{registration_id}},
  "amount": 150.00,
  "currency": "GTQ",
  "cardInfo": {
    "number": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  }
}
```

#### 5.5 Consultar Estado de Pago
**Method:** GET
**URL:** `{{base_url}}/payments/{{payment_id}}/status`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 5.6 Historial de Pagos
**Method:** GET
**URL:** `{{base_url}}/payments/history?page=1&limit=10`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### 🧾 **6. FACTURACIÓN FEL**
#### 6.1 Generar Factura Automática
**Method:** POST
**URL:** `{{base_url}}/fel/auto-generate/{{registration_id}}`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "paymentId": {{payment_id}},
  "notes": "Factura generada automáticamente"
}
```

#### 6.2 Consultar Estado DTE
**Method:** GET
**URL:** `{{base_url}}/fel/consult-dte/factura-uuid-123`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 6.3 Descargar PDF de Factura
**Method:** GET
**URL:** `{{base_url}}/fel/download-pdf/factura-uuid-123`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### 🎫 **7. CÓDIGOS QR Y ACCESO**
#### 7.1 Generar Código QR
**Method:** POST
**URL:** `{{base_url}}/qr/generate/{{registration_id}}`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "metadata": {
    "accessLevel": "standard",
    "specialRequirements": ["vegetarian"]
  }
}
```

#### 7.2 Obtener QR Existente
**Method:** GET
**URL:** `{{base_url}}/qr/{{registration_id}}`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 7.3 Validar Código QR (Entrada)
**Method:** POST
**URL:** `{{base_url}}/qr/validate`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "qrHash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
  "eventId": {{event_id}},
  "accessPoint": "Entrada Principal",
  "deviceInfo": {
    "deviceType": "mobile",
    "appVersion": "1.0.0"
  }
}
```

#### 7.4 Marcar Asistencia
**Method:** POST
**URL:** `{{base_url}}/attendance/mark`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "registrationId": {{registration_id}},
  "eventId": {{event_id}},
  "accessPoint": "Entrada Principal",
  "deviceInfo": {
    "deviceType": "mobile",
    "appVersion": "1.0.0"
  }
}
```

#### 7.5 Consultar Mi Asistencia
**Method:** GET
**URL:** `{{base_url}}/attendance/participant/{{registration_id}}`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### 🎓 **8. CERTIFICADOS**
#### 8.1 Generar Certificado
**Method:** POST
**URL:** `{{base_url}}/certificates/generate/{{registration_id}}`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 8.2 Mis Certificados
**Method:** GET
**URL:** `{{base_url}}/certificates/participant/123`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 8.3 Descargar Certificado PDF
**Method:** GET
**URL:** `{{base_url}}/certificates/download/456`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 8.4 Verificar Certificado (Público)
**Method:** GET
**URL:** `{{base_url}}/public/certificates/verify/{{certificate_hash}}`
**Headers:**
```
Content-Type: application/json
```

#### 8.5 Validar Autenticidad
**Method:** POST
**URL:** `{{base_url}}/certificates/validate`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "certificateId": 456,
  "validationCode": "VALIDATION123"
}
```

### 👤 **9. GESTIÓN DE PERFIL**
#### 9.1 Obtener Perfil
**Method:** GET
**URL:** `{{base_url}}/users/profile`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 9.2 Actualizar Perfil
**Method:** PUT
**URL:** `{{base_url}}/users/profile`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez González",
  "phone": "+502 8765-4321",
  "nit": "12345678-9",
  "cui": "1234567890123",
  "timezone": "America/Guatemala",
  "locale": "es-GT"
}
```

#### 9.3 Cambiar Contraseña
**Method:** POST
**URL:** `{{base_url}}/auth/password/change`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "currentPassword": "{{user_password}}",
  "newPassword": "NuevaContraseña123",
  "confirmNewPassword": "NuevaContraseña123"
}
```

#### 9.4 Sesiones Activas
**Method:** GET
**URL:** `{{base_url}}/sessions/active`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 9.5 Cerrar Sesión
**Method:** POST
**URL:** `{{base_url}}/auth/logout`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### 🔔 **10. NOTIFICACIONES**
#### 10.1 Mis Notificaciones
**Method:** GET
**URL:** `{{base_url}}/notifications?page=1&limit=10&status=unread`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 10.2 Marcar Notificación como Leída
**Method:** PUT
**URL:** `{{base_url}}/notifications/789/read`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

### 🏷️ **11. PROMOCIONES Y DESCUENTOS**
#### 11.1 Validar Código Promocional
**Method:** POST
**URL:** `{{base_url}}/discounts/validate-code`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```
**Body:**
```json
{
  "code": "DESCUENTO20",
  "eventId": {{event_id}},
  "cartTotal": 150.00
}
```

#### 11.2 Descuentos por Volumen
**Method:** GET
**URL:** `{{base_url}}/discounts/volume/{{event_id}}?isActive=true`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 11.3 Descuentos Early Bird
**Method:** GET
**URL:** `{{base_url}}/discounts/early-bird/{{event_id}}?registrationDate=2024-10-01T00:00:00.000Z`
**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

## Scripts de Prueba Automáticos

### Pre-request Script (para todos los requests autenticados)
```javascript
if (pm.request.headers.get('Authorization')) {
    // Verificar si el token está expirando
    const token = pm.collectionVariables.get('access_token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp - now < 300) { // 5 minutos antes de expirar
                console.log('Token expirando pronto, considera hacer refresh');
            }
        } catch (e) {
            console.log('Error parsing token:', e);
        }
    }
}
```

### Test Script Global
```javascript
// Verificar respuesta exitosa
pm.test("Status code is not 5xx", function () {
    pm.response.to.not.be.serverError;
});

// Verificar estructura de respuesta
pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});

// Log de respuesta para debugging
console.log('Response:', pm.response.json());
```

## Consideraciones de Uso

1. **Orden de Ejecución:** Seguir el orden de las carpetas para un flujo completo
2. **Variables:** Configurar todas las variables de entorno antes de comenzar
3. **Autenticación:** Los endpoints marcados requieren token Bearer
4. **Rate Limiting:** Respetar los límites de rate limiting implementados
5. **Entorno:** Ajustar `base_url` según el entorno (desarrollo/producción)

## Casos de Uso Comunes

### Flujo Completo de Usuario Nuevo:
1. Registro → Verificación Email → Login
2. Explorar Eventos → Agregar al Carrito → Aplicar Promoción
3. Crear Inscripción → Procesar Pago → Recibir Factura FEL
4. Generar QR → Validar Acceso → Marcar Asistencia
5. Generar Certificado → Descargar PDF

### Recuperación de Sesión:
1. Login → Obtener Perfil → Verificar Sesiones Activas
2. Revisar Inscripciones → Verificar Estado de Pagos
3. Consultar QR → Verificar Asistencia

Esta colección proporciona cobertura completa para todas las operaciones CRUD típicas de un usuario final en TradeConnect.