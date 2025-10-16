# 🔧 Guía Rápida de Corrección de Errores TypeScript

## Errores Restantes: 28

### 1. **Avatar `src` prop errors** (4 errores)
**Problema:** `src` no puede ser `string | undefined` con `exactOptionalPropertyTypes`

**Solución:**
```typescript
// ANTES
<Avatar src={user.avatar} alt={user.name} />

// DESPUÉS
<Avatar src={user.avatar || undefined} alt={user.name} />
// O mejor:
{user.avatar && <Avatar src={user.avatar} alt={user.name} />}
```

**Archivos afectados:**
- `EventAgenda.tsx:236`
- `EventReviews.tsx:198`
- `ProfileForm.tsx:204`

---

### 2. **Form Resolver Type Errors** (9 errores)
**Problema:** Yup schemas con campos opcionales vs required

**Solución:** Usar type assertions o ajustar los schemas

```typescript
// OPCIÓN 1: Type assertion
resolver: yupResolver(loginSchema) as Resolver<LoginFormData>

// OPCIÓN 2: Ajustar schema para coincidir exactamente
const loginSchema = yup.object({
  email: yup.string().required(),
  password: yup.string().required(),
  rememberMe: yup.boolean().optional(), // Debe ser opcional
});
```

**Archivos afectados:**
- `LoginPage.tsx:59, 132`
- `RegisterPage.tsx:93, 137, 495`
- `FELForm.tsx:75`
- `ProfileForm.tsx:80, 168`

---

### 3. **Recharts `data` prop** (3 errores)
**Problema:** Recharts no acepta `data | undefined`

**Solución:**
```typescript
// ANTES
<LineChart data={chartData.revenue}>

// DESPUÉS
<LineChart data={chartData.revenue || []}>
```

**Archivos afectados:**
- `DashboardCharts.tsx:152, 203, 248`

---

### 4. **Chip `icon` prop** (1 error)
**Problema:** Similar a Avatar, no acepta `Element | undefined`

**Solución:**
```typescript
// ANTES
<Chip icon={getStatusIcon()} />

// DESPUÉS
{getStatusIcon() && <Chip icon={getStatusIcon()} />}
// O
<Chip icon={getStatusIcon() || undefined} />
```

**Archivo:** `MyCertificates.tsx:261`

---

### 5. **StatsSection `suffix` prop** (1 error)
**Solución:**
```typescript
<AnimatedCounter target={stat.value} suffix={stat.suffix || ''} />
```

**Archivo:** `StatsSection.tsx:176`

---

### 6. **SecureInput `error` prop** (3 errores)
**Solución:**
```typescript
<SecureInput
  error={errors.password?.message || ''}
  // o
  error={errors.password?.message ?? ''}
/>
```

**Archivo:** `ChangePasswordForm.tsx:215, 233, 325`

---

### 7. **Blob download** (1 error)
**Solución:**
```typescript
// ANTES
const url = window.URL.createObjectURL(new Blob([blob]));

// DESPUÉS
const url = window.URL.createObjectURL(new Blob([blob.data]));
```

**Archivo:** `MyCertificates.tsx:60`

---

### 8. **Services imports** (4 errores)
**Solución:** Verificar que los servicios se exportan correctamente desde `api.ts`

**Archivos:**
- `CartContext.tsx:4` - Importar de `cartService.ts`
- `felService.ts:2` - Arreglar import circular
- `services/index.ts:83-84` - Asegurar imports correctos

---

### 9. **HomePage complex union** (2 errores)
**Solución:** Simplificar los tipos o dividir el componente

---

## Script de Corrección Automática

```bash
# Correr desde frontend/
cd C:\Users\nsinay\OneDrive - Camara del Comercio GT\Documentos\NASG\tradeconnect-v1\frontend

# Ver errores
npx tsc --noEmit | grep "error TS"

# Después de aplicar fixes manualmente
npm run type-check
```

---

## Prioridad de Corrección

1. ✅ **ALTA** - Services imports (bloquea el build)
2. ✅ **ALTA** - Form resolvers (funcionalidad core)
3. **MEDIA** - Avatar/Chip props (UI/UX)
4. **MEDIA** - Recharts data props (Admin dashboard)
5. **BAJA** - HomePage complex types (refactor opcional)

