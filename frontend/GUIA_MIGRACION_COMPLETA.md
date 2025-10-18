# 🚀 Guía Completa de Migración: Eliminación Total de MUI

## 📊 Estado del Proyecto

### Componentes shadcn/ui Creados ✅

Se han creado **15 componentes shadcn/ui** base:

1. ✅ `Button` - 6 variantes, 5 tamaños
2. ✅ `Card` - Con Header, Title, Description, Content, Footer
3. ✅ `Badge` - 7 variantes de color
4. ✅ `Input` - Input de texto con validación
5. ✅ `Label` - Labels para formularios
6. ✅ `Textarea` - Área de texto
7. ✅ `Select` - Select con ícono de chevron
8. ✅ `Checkbox` - Checkbox con check icon
9. ✅ `Dialog` - Modal con Radix UI
10. ✅ `Tabs` - Tabs con Radix UI
11. ✅ `Table` - Tabla completa (Header, Body, Footer, Row, Cell)
12. ✅ `Alert` - Alertas con 5 variantes
13. ✅ `Skeleton` - Loading skeleton
14. ✅ `Avatar` - Avatar con imagen y fallback

### Componentes Pendientes de Migrar: 65 archivos

---

## 🎯 Plan de Migración por Prioridad

### FASE 1: Layout & Common

1. **`src/components/layout/Navbar.tsx`**
   - MUI: `AppBar`, `Toolbar`, `IconButton`, `Menu`, `MenuItem`, `Avatar`, `Badge`
   - shadcn/ui: `Button`, `Avatar`, `Badge`, Custom dropdown

2. **`src/components/layout/Footer.tsx`**
   - MUI: `Box`, `Container`, `Grid`, `Typography`, `Link`
   - Tailwind: `<div>` + grid classes

3. **`src/components/layout/BaseLayout.tsx`**
   - MUI: `Box`, `CssBaseline`
   - Tailwind: Remove MUI imports, usar `<div>` + Tailwind

4. **`src/components/layout/AdminLayout.tsx`**
   - MUI: `Box`, `Drawer`, `AppBar`, `Toolbar`, `IconButton`
   - shadcn/ui: Custom sidebar component

5. **`src/components/common/ErrorBoundary.tsx`**
   - MUI: `Box`, `Typography`, `Button`, `Alert`
   - shadcn/ui: `Alert`, `Button`

6. **`src/components/common/ToastContainer.tsx`**
   - Ya usa `react-hot-toast` - Solo actualizar imports

7. **`src/components/common/LanguageSelector.tsx`**
   - MUI: `Select`, `MenuItem`
   - shadcn/ui: `Select`

---

### FASE 2: Auth Components 

1. **`src/components/auth/LoginPage.tsx`**
   - MUI: `TextField`, `Button`, `Checkbox`, `Link`, `Alert`
   - shadcn/ui: `Input`, `Button`, `Checkbox`, `Alert`

2. **`src/components/auth/RegisterPage.tsx`**
   - Similar a LoginPage

3. **`src/components/auth/ForgotPasswordPage.tsx`**
   - MUI: `TextField`, `Button`, `Alert`
   - shadcn/ui: `Input`, `Button`, `Alert`

4. **`src/components/auth/ResetPasswordPage.tsx`**
   - Similar a ForgotPasswordPage

**Patrón de migración:**
```tsx
// ANTES (MUI)
import { TextField, Button, Alert } from '@mui/material';

<TextField
  label="Email"
  variant="outlined"
  fullWidth
/>

// DESPUÉS (shadcn/ui)
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    className="w-full"
  />
</div>
```

**Tiempo estimado:** 3-4 horas

---

### FASE 3: Event Components

1. **`src/components/EventsPage.tsx`**
2. **`src/components/events/EventDetailPage.tsx`**
3. **`src/components/events/EventCard.tsx`**
4. **`src/components/events/EventFilters.tsx`**
5. **`src/components/events/EventGrid.tsx`**
6. **`src/components/events/EventGallery.tsx`**
7. **`src/components/events/EventAgenda.tsx`**
8. **`src/components/events/EventIncludes.tsx`**
9. **`src/components/events/EventReviews.tsx`**
10. **`src/components/events/EventSortOptions.tsx`**
11. **`src/components/events/ReservationSidebar.tsx`**

**Componentes MUI comunes:**
- `Card`, `CardContent`, `CardMedia` → shadcn/ui `Card`
- `Grid` → Tailwind `grid` classes
- `Chip` → shadcn/ui `Badge`
- `Button` → shadcn/ui `Button`
- `Rating` → Custom component con React Icons stars

**Tiempo estimado:** 6-8 horas

---

### FASE 4: Cart & Checkout

1. **`src/components/cart/CartPage.tsx`**
2. **`src/components/cart/MiniCart.tsx`**
3. **`src/components/checkout/CheckoutPage.tsx`**
4. **`src/components/checkout/CheckoutStepper.tsx`**
   - MUI: `Stepper`, `Step`, `StepLabel`
   - Custom: Crear stepper component con Tailwind

5. **`src/components/checkout/CheckoutSummary.tsx`**
6. **`src/components/checkout/PersonalInfoForm.tsx`**
7. **`src/components/checkout/CreditCardForm.tsx`**
8. **`src/components/checkout/FELForm.tsx`**
9. **`src/components/checkout/PaymentMethodSelector.tsx`**
10. **`src/components/checkout/PayPalButton.tsx`**
11. **`src/components/checkout/CheckoutSuccessPage.tsx`**

**Tiempo estimado:** 5-7 horas

---

### FASE 5: Profile Components (MEDIA PRIORIDAD) - 7 archivos

1. **`src/components/profile/ProfilePage.tsx`**
2. **`src/components/profile/ProfileSidebar.tsx`**
3. **`src/components/profile/ProfileForm.tsx`**
4. **`src/components/profile/ChangePasswordForm.tsx`**
5. **`src/components/profile/MyEvents.tsx`**
6. **`src/components/profile/MyCertificates.tsx`**
7. **`src/components/profile/PaymentHistory.tsx`**
8. **`src/components/profile/TwoFactorAuth.tsx`**

**Tiempo estimado:** 4-6 horas

---

### FASE 6: Admin Components (MEDIA-BAJA PRIORIDAD) - 6 archivos

1. **`src/components/admin/DashboardPage.tsx`**
2. **`src/components/admin/DashboardKPIs.tsx`**
3. **`src/components/admin/DashboardCharts.tsx`**
4. **`src/components/admin/AdminSidebar.tsx`**
5. **`src/components/admin/EventsTable.tsx`**
   - MUI: `Table`, `TableContainer`, `TableHead`, `TableBody`, `TableRow`, `TableCell`
   - shadcn/ui: `Table` components

6. **`src/components/admin/RegistrationsTable.tsx`**
7. **`src/components/admin/EventFormWizard.tsx`**
8. **`src/components/admin/ReportsGenerator.tsx`**
9. **`src/components/admin/DebugDashboard.tsx`**

**Tiempo estimado:** 6-8 horas

---

### FASE 7: Speaker & Operator (BAJA PRIORIDAD) - 4 archivos

1. **`src/components/speaker/SpeakerEventsPage.tsx`**
2. **`src/components/speaker/SpeakerSchedulePage.tsx`**
3. **`src/components/speaker/SpeakerProfilePage.tsx`**
4. **`src/components/operator/OperatorCheckinPage.tsx`**

**Tiempo estimado:** 3-4 horas

---

### FASE 8: Home & Static Pages (BAJA PRIORIDAD) - 5 archivos

1. **`src/components/home/CategoriesGrid.tsx`** - DONE (nuevo HomePage)
2. **`src/components/home/FeaturedEventsCarousel.tsx`** - DONE
3. **`src/components/home/StatsSection.tsx`** - DONE
4. **`src/components/ContactPage.tsx`**
5. **`src/components/ReportIssuePage.tsx`**
6. **`src/components/certificates/CertificateDetailPage.tsx`**

**Tiempo estimado:** 2-3 horas

---

### FASE 9: Misc & Cleanup - 5 archivos

1. **`src/components/common/SecureInput.tsx`**
2. **`src/components/common/SecureFileUpload.tsx`**
3. **`src/components/App.tsx`**
4. **`src/components/layout/VoiceAssistant.tsx`**

**Tiempo estimado:** 2-3 horas

---

## 🛠️ Patrón General de Migración

### 1. Imports

```tsx
// ❌ ANTES (MUI)
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';

// ✅ DESPUÉS (shadcn/ui + Tailwind)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
```

### 2. Layout Components

```tsx
// ❌ ANTES (MUI)
<Container maxWidth="lg">
  <Box sx={{ py: 4 }}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        Content
      </Grid>
    </Grid>
  </Box>
</Container>

// ✅ DESPUÉS (Tailwind)
<div className="container-custom">
  <div className="py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        Content
      </div>
    </div>
  </div>
</div>
```

### 3. Typography

```tsx
// ❌ ANTES (MUI)
<Typography variant="h1">Title</Typography>
<Typography variant="body1">Text</Typography>

// ✅ DESPUÉS (Tailwind)
<h1 className="text-4xl font-bold font-heading">Title</h1>
<p className="text-base">Text</p>
```

### 4. Buttons

```tsx
// ❌ ANTES (MUI)
<Button variant="contained" color="primary" size="large">
  Click me
</Button>

// ✅ DESPUÉS (shadcn/ui)
<Button variant="default" size="lg">
  Click me
</Button>
```

### 5. Forms

```tsx
// ❌ ANTES (MUI)
<TextField
  label="Email"
  variant="outlined"
  fullWidth
  required
  error={!!errors.email}
  helperText={errors.email}
/>

// ✅ DESPUÉS (shadcn/ui)
<div className="space-y-2">
  <Label htmlFor="email">
    Email <span className="text-error">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    className={cn(
      "w-full",
      errors.email && "border-error focus-visible:ring-error"
    )}
  />
  {errors.email && (
    <p className="text-sm text-error">{errors.email}</p>
  )}
</div>
```

### 6. Cards

```tsx
// ❌ ANTES (MUI)
<Card>
  <CardMedia
    component="img"
    height="140"
    image={image}
  />
  <CardContent>
    <Typography variant="h5">Title</Typography>
  </CardContent>
</Card>

// ✅ DESPUÉS (shadcn/ui)
<Card>
  <div className="relative h-48 overflow-hidden">
    <img
      src={image}
      className="w-full h-full object-cover"
    />
  </div>
  <CardContent>
    <h3 className="text-xl font-bold">Title</h3>
  </CardContent>
</Card>
```

### 7. Loading States

```tsx
// ❌ ANTES (MUI)
<CircularProgress size={40} />

// ✅ DESPUÉS (Tailwind)
<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />

// O con Skeleton
import { Skeleton } from '@/components/ui/skeleton';
<Skeleton className="h-10 w-full" />
```

### 8. Responsive Design

```tsx
// ❌ ANTES (MUI)
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

// ✅ DESPUÉS (Custom hook)
const isMobile = useIsMobile();
const isDesktop = useIsDesktop();
```

---

## 📦 Componentes Custom Necesarios

Algunos componentes MUI no tienen equivalente directo y requieren implementación custom:

### 1. Stepper Component

```tsx
// Crear: src/components/ui/stepper.tsx
// Para CheckoutStepper
```

### 2. Rating Component

```tsx
// Crear: src/components/ui/rating.tsx
// Para EventReviews
// Usar React Icons stars
```

### 3. Drawer Component

```tsx
// Crear: src/components/ui/drawer.tsx
// Para AdminLayout sidebar
// Usar Radix UI Dialog como base
```

### 4. Menu/Dropdown Component

```tsx
// Ya existe: @radix-ui/react-dropdown-menu
// Crear wrapper: src/components/ui/dropdown-menu.tsx
```

---

## 🗑️ Fase Final: Desinstalar MUI

Una vez migrados TODOS los componentes:

```bash
cd frontend

# Desinstalar MUI
npm uninstall @mui/material @mui/icons-material @mui/system @mui/x-date-pickers @mui/x-date-pickers-pro @emotion/react @emotion/styled

# Verificar que no hay imports de MUI
grep -r "from '@mui" src/

# Si encuentra alguno, migrar ese archivo primero

# Build de prueba
npm run build

# Si el build es exitoso, commit
git add .
git commit -m "feat: Complete migration from MUI to Tailwind + shadcn/ui"
```

---

## ✅ Checklist de Migración

### Preparación
- [x] Tailwind CSS instalado y configurado
- [x] shadcn/ui componentes base creados
- [x] Custom hooks (useMediaQuery) creados
- [x] Estilos globales configurados
- [x] HomePage migrada (ejemplo completo)

### Layout & Common (Fase 1)
- [ ] Navbar migrado
- [ ] Footer migrado
- [ ] BaseLayout migrado
- [ ] AdminLayout migrado
- [ ] ErrorBoundary migrado
- [ ] ToastContainer actualizado
- [ ] LanguageSelector migrado

### Auth (Fase 2)
- [ ] LoginPage migrado
- [ ] RegisterPage migrado
- [ ] ForgotPasswordPage migrado
- [ ] ResetPasswordPage migrado

### Events (Fase 3)
- [ ] EventsPage migrado
- [ ] EventDetailPage migrado
- [ ] EventCard migrado
- [ ] EventFilters migrado
- [ ] EventGrid migrado
- [ ] EventGallery migrado
- [ ] EventAgenda migrado
- [ ] EventIncludes migrado
- [ ] EventReviews migrado
- [ ] EventSortOptions migrado
- [ ] ReservationSidebar migrado

### Cart & Checkout (Fase 4)
- [ ] CartPage migrado
- [ ] MiniCart migrado
- [ ] CheckoutPage migrado
- [ ] CheckoutStepper migrado (custom component needed)
- [ ] CheckoutSummary migrado
- [ ] PersonalInfoForm migrado
- [ ] CreditCardForm migrado
- [ ] FELForm migrado
- [ ] PaymentMethodSelector migrado
- [ ] PayPalButton migrado
- [ ] CheckoutSuccessPage migrado

### Profile (Fase 5)
- [ ] ProfilePage migrado
- [ ] ProfileSidebar migrado
- [ ] ProfileForm migrado
- [ ] ChangePasswordForm migrado
- [ ] MyEvents migrado
- [ ] MyCertificates migrado
- [ ] PaymentHistory migrado
- [ ] TwoFactorAuth migrado

### Admin (Fase 6)
- [ ] DashboardPage migrado
- [ ] DashboardKPIs migrado
- [ ] DashboardCharts migrado (usar recharts)
- [ ] AdminSidebar migrado
- [ ] EventsTable migrado
- [ ] RegistrationsTable migrado
- [ ] EventFormWizard migrado
- [ ] ReportsGenerator migrado
- [ ] DebugDashboard migrado

### Speaker & Operator (Fase 7)
- [ ] SpeakerEventsPage migrado
- [ ] SpeakerSchedulePage migrado
- [ ] SpeakerProfilePage migrado
- [ ] OperatorCheckinPage migrado

### Home & Static (Fase 8)
- [x] HomePage migrado (HomePageNew.tsx)
- [ ] ContactPage migrado
- [ ] ReportIssuePage migrado
- [ ] CertificateDetailPage migrado

### Misc (Fase 9)
- [ ] SecureInput migrado
- [ ] SecureFileUpload migrado
- [ ] App.tsx migrado
- [ ] VoiceAssistant migrado

### Cleanup Final
- [ ] Remover todos los imports de MUI
- [ ] Desinstalar dependencias de MUI
- [ ] Actualizar astro.config.mjs (remover mui-vendor chunk)
- [ ] Testing completo
- [ ] Build exitoso
- [ ] Lighthouse audit
- [ ] Documentar cambios

---

## 📊 Estimación de Tiempo Total

| Fase | Archivos | Horas |
|------|----------|-------|
| 1. Layout & Common | 7 | 4-6 |
| 2. Auth | 4 | 3-4 |
| 3. Events | 11 | 6-8 |
| 4. Cart & Checkout | 11 | 5-7 |
| 5. Profile | 8 | 4-6 |
| 6. Admin | 9 | 6-8 |
| 7. Speaker & Operator | 4 | 3-4 |
| 8. Home & Static | 4 | 2-3 |
| 9. Misc | 4 | 2-3 |
| Testing & Cleanup | - | 4-6 |
| **TOTAL** | **65** | **39-55 horas** |

**Estimación realista:** 1-2 semanas de trabajo a tiempo completo

---

## 🚨 Notas Importantes

1. **No eliminar archivos MUI originales** - Crear versiones nuevas primero (ej: `ComponentNew.tsx`)
2. **Probar cada fase** antes de continuar
3. **Commitear por fases** - No hacer todo de una vez
4. **Mantener funcionalidad** - La app debe funcionar en todo momento
5. **Responsive testing** - Probar mobile, tablet, desktop
6. **Accesibilidad** - Mantener ARIA labels y keyboard navigation

---

## 📖 Recursos de Referencia

- HomePage migrada: `src/components/HomePageNew.tsx` (ejemplo completo)
- Componentes shadcn/ui: `src/components/ui/*`
- Custom hooks: `src/hooks/useMediaQuery.ts`
- Utilidades: `src/lib/utils.ts`
- Estilos globales: `src/styles/globals.css`
- Configuración Tailwind: `tailwind.config.mjs`

---

**Próximo paso recomendado:** Empezar con Fase 1 (Layout & Common) ya que afecta toda la aplicación.

¿Necesitas ayuda con alguna fase específica? Puedo generar código de ejemplo para cualquier componente.
