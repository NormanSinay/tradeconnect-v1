# Migración de MUI a Tailwind CSS + shadcn/ui

## ✅ Implementación Completada

Este documento describe la migración exitosa de Material-UI (MUI) a Tailwind CSS con shadcn/ui en el proyecto TradeConnect.

---

## 📋 Resumen de Cambios

### Arquitectura Implementada

```
React (componentes interactivos)
  ↓
Astro (routing y SSR)
  ↓
shadcn/ui (componentes UI)
  ↓
Tailwind CSS (estilos)
  ↓
Radix UI (primitivos accesibles)
  ↓
React Icons (iconografía)
```

---

## 🎯 Componentes Implementados

### 1. **Configuración Base**

#### ✅ Tailwind CSS
- `tailwind.config.mjs` - Configuración completa con tema corporativo
- `postcss.config.js` - Procesamiento de estilos
- Integración con Astro mediante `@astrojs/tailwind`

#### ✅ Utilidades y Helpers
- `src/lib/utils.ts` - Funciones helper:
  - `cn()` - Merge de clases Tailwind
  - `formatCurrency()` - Formato de moneda GTQ
  - `formatDate()` - Formato de fechas
  - `truncate()` - Truncar texto
  - `debounce()` - Optimización de performance
  - `sleep()` - Async delay

#### ✅ Estilos Globales
- `src/styles/globals.css` - Estilos base con:
  - Configuración de fuentes (Inter, Montserrat)
  - Variables CSS personalizadas
  - Utilidades custom
  - Animaciones personalizadas
  - Soporte para accesibilidad
  - Modo responsive
  - Print styles

### 2. **Componentes shadcn/ui**

#### ✅ Button (`src/components/ui/button.tsx`)
Variantes:
- `default` - Botón primario con sombra
- `destructive` - Para acciones destructivas
- `outline` - Botón con borde
- `secondary` - Botón secundario (gold)
- `ghost` - Botón transparente
- `link` - Estilo de enlace

Tamaños:
- `sm` - 36px altura
- `default` - 40px altura
- `lg` - 44px altura
- `xl` - 48px altura
- `icon` - 40x40px (cuadrado)

#### ✅ Card (`src/components/ui/card.tsx`)
Componentes:
- `Card` - Contenedor principal con hover effect
- `CardHeader` - Encabezado
- `CardTitle` - Título
- `CardDescription` - Descripción
- `CardContent` - Contenido
- `CardFooter` - Pie de card

#### ✅ Badge (`src/components/ui/badge.tsx`)
Variantes:
- `default` - Primary color
- `secondary` - Gold color
- `destructive` - Error color
- `outline` - Con borde
- `success` - Verde
- `warning` - Naranja
- `info` - Azul

### 3. **Custom Hooks**

#### ✅ useMediaQuery (`src/hooks/useMediaQuery.ts`)
Hooks disponibles:
- `useMediaQuery(query)` - Hook genérico
- `useIsMobile()` - max-width: 767px
- `useIsTablet()` - 768px - 1023px
- `useIsDesktop()` - min-width: 1024px
- `useIsSmallScreen()` - max-width: 639px
- `useIsMediumScreen()` - min-width: 768px
- `useIsLargeScreen()` - min-width: 1024px
- `useIsExtraLargeScreen()` - min-width: 1280px
- `useIs2ExtraLargeScreen()` - min-width: 1536px

### 4. **Páginas Migradas**

#### ✅ HomePage (`src/components/HomePageNew.tsx`)
Secciones implementadas:
1. **Hero Section** - Con parallax effect y animaciones
2. **Stats Section** - 4 tarjetas de estadísticas con iconos
3. **Featured Events** - Grid de eventos destacados
4. **Categories** - Grid de categorías con hover effects

Características:
- ✅ Responsive design completo (mobile, tablet, desktop)
- ✅ Animaciones con framer-motion
- ✅ Parallax effect en desktop
- ✅ Hover effects en cards
- ✅ Loading states
- ✅ Integración con API (React Query)
- ✅ Navegación con React Router

---

## 🎨 Tema Corporativo

### Colores

```javascript
// Primary (Azul)
primary-50  → #E8EAF6
primary-500 → #3949AB (Main)
primary-900 → #161D7D

// Secondary (Gold)
secondary-50  → #FFF9E6
secondary-500 → #D4AF37 (Main)
secondary-900 → #906323

// Status Colors
success → #388E3C
error   → #D32F2F
warning → #F57C00
info    → #1976D2
```

### Tipografía

```javascript
// Fuentes
font-sans    → Inter, Roboto, system-ui
font-heading → Montserrat, Inter, system-ui

// Tamaños
text-xs  → 12px
text-sm  → 14px
text-base → 16px
text-lg  → 18px
text-xl  → 20px
text-2xl → 24px
text-3xl → 30px
text-4xl → 36px
text-5xl → 48px
```

### Espaciado

```javascript
xs  → 4px
sm  → 8px
md  → 16px
lg  → 24px
xl  → 32px
2xl → 48px
3xl → 64px
```

### Border Radius

```javascript
sm   → 4px
md   → 8px
lg   → 12px
xl   → 16px
2xl  → 24px
full → 9999px
```

### Sombras

```javascript
shadow-sm → Sombra pequeña
shadow-md → Sombra media (default)
shadow-lg → Sombra grande
shadow-xl → Sombra extra grande
shadow-2xl → Sombra 2x grande
```

---

## 📦 Dependencias Instaladas

```json
{
  "dependencies": {
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "lucide-react": "latest",
    "react-icons": "latest"
  },
  "devDependencies": {
    "tailwindcss": "3.4.17",
    "postcss": "8.4.49",
    "autoprefixer": "10.4.20",
    "@astrojs/tailwind": "5.1.3",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "class-variance-authority": "latest"
  }
}
```

---

## 🔄 Mapeo MUI → Tailwind/shadcn

| Componente MUI | Reemplazo | Ubicación |
|----------------|-----------|-----------|
| `Box` | `<div>` + Tailwind classes | N/A |
| `Container` | `<div className="container-custom">` | N/A |
| `Grid` | Tailwind Grid (`grid grid-cols-X`) | N/A |
| `Typography` | `<h1>`, `<p>` + Tailwind | N/A |
| `Button` | `<Button>` | `@/components/ui/button` |
| `Card` | `<Card>` | `@/components/ui/card` |
| `Chip` | `<Badge>` | `@/components/ui/badge` |
| `CircularProgress` | `<div className="animate-spin">` | N/A |
| `useTheme` | Tailwind theme config | `tailwind.config.mjs` |
| `useMediaQuery` | `useMediaQuery` hook | `@/hooks/useMediaQuery` |

### Iconos MUI → React Icons

| MUI Icon | React Icons | Import |
|----------|-------------|--------|
| `Event` | `FaCalendarAlt` | `react-icons/fa` |
| `People` | `FaUsers` | `react-icons/fa` |
| `School` | `FaGraduationCap` | `react-icons/fa` |
| `TrendingUp` | `FaChartLine` | `react-icons/fa` |

---

## 🚀 Uso de Componentes

### Button

```tsx
import { Button } from '@/components/ui/button';

// Variantes
<Button variant="default">Primary</Button>
<Button variant="outline">Outlined</Button>
<Button variant="secondary">Gold</Button>
<Button variant="ghost">Ghost</Button>

// Tamaños
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// Como Link
<Button asChild>
  <Link to="/events">Ver Eventos</Link>
</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido del card
  </CardContent>
  <CardFooter>
    Footer
  </CardFooter>
</Card>
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Gold</Badge>
<Badge variant="success">Éxito</Badge>
<Badge variant="outline">Outlined</Badge>
```

### Media Query Hooks

```tsx
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';

const Component = () => {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
};
```

---

## 📝 Clases Tailwind Útiles

### Layout

```css
/* Container personalizado */
.container-custom

/* Centrado absoluto */
.center-absolute

/* Altura de pantalla segura (mobile) */
.h-screen-safe
```

### Efectos

```css
/* Texto con gradiente */
.gradient-text

/* Glass morphism */
.glass

/* Card con hover */
.card-hover

/* Sombra suave con transición */
.shadow-smooth

/* Efecto ripple en botones */
.btn-ripple
```

### Animaciones

```css
/* Float */
.animate-float

/* Pulse lento */
.animate-pulse-slow

/* Fade in */
.animate-fade-in

/* Slide up */
.animate-slide-up
```

### Scrollbar

```css
/* Scrollbar personalizado */
.custom-scrollbar

/* Ocultar scrollbar */
.scrollbar-hide
```

---

## 🎯 Próximos Pasos

### Componentes Pendientes de Migrar

1. **Layout Components**
   - `Navbar.tsx` - Barra de navegación
   - `Footer.tsx` - Pie de página
   - `BaseLayout.tsx` - Layout base
   - `AdminLayout.tsx` - Layout admin

2. **Event Components**
   - `EventsPage.tsx` - Listado de eventos
   - `EventDetailPage.tsx` - Detalle de evento
   - `EventCard.tsx` - Card de evento
   - `EventFilters.tsx` - Filtros
   - `EventGrid.tsx` - Grid

3. **Authentication**
   - `LoginPage.tsx`
   - `RegisterPage.tsx`
   - `ForgotPasswordPage.tsx`
   - `ResetPasswordPage.tsx`

4. **Admin Components**
   - `DashboardPage.tsx`
   - `AdminSidebar.tsx`
   - `EventsTable.tsx`
   - `RegistrationsTable.tsx`

5. **Cart & Checkout**
   - `CartPage.tsx`
   - `CheckoutPage.tsx`
   - `CheckoutStepper.tsx`

### Componentes shadcn/ui Adicionales Necesarios

```bash
# Dialog (Modal)
# Dropdown Menu
# Select
# Input
# Textarea
# Checkbox
# Radio Group
# Switch
# Tabs
# Table
# Skeleton
# Alert
# Toast (ya se usa react-hot-toast)
# Accordion
# Avatar
# Progress
# Separator
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
npm run lint:fix

# Format
npm run format

# Type check
npm run type-check
```

---

## 📚 Recursos

### Documentación

- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/primitives)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Astro](https://docs.astro.build/)
- [Framer Motion](https://www.framer.com/motion/)

### Herramientas

- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui CLI](https://ui.shadcn.com/docs/cli)

---

## ⚠️ Notas Importantes

1. **MUI aún está instalado** - No se ha removido para evitar romper componentes no migrados
2. **Compatibilidad** - Los estilos globales de Tailwind no interfieren con MUI
3. **Performance** - Bundle size se reducirá gradualmente al migrar componentes
4. **Testing** - Probar todos los breakpoints responsive
5. **Accesibilidad** - Mantener focus states y keyboard navigation

---

## ✅ Checklist de Migración

- [x] Instalar Tailwind CSS
- [x] Configurar tema corporativo
- [x] Crear componentes base shadcn/ui (Button, Card, Badge)
- [x] Crear utilidades (cn helper, formatters)
- [x] Crear custom hooks (useMediaQuery)
- [x] Migrar HomePage
- [x] Actualizar ClientApp (remover ThemeProvider de MUI)
- [ ] Migrar Layout components
- [ ] Migrar Event components
- [ ] Migrar Auth components
- [ ] Migrar Admin components
- [ ] Migrar Cart/Checkout components
- [ ] Remover dependencias de MUI
- [ ] Testing completo responsive
- [ ] Testing cross-browser
- [ ] Lighthouse audit

---

## 📊 Métricas de Éxito

### Antes (con MUI)
- Bundle size: ~500KB (estimado con MUI + Emotion)
- First Contentful Paint: TBD
- Time to Interactive: TBD

### Después (con Tailwind + shadcn/ui)
- Bundle size estimado: ~300KB (40% reducción esperada)
- First Contentful Paint: Mejor performance esperada
- Time to Interactive: Mejor performance esperada

---

## 👥 Contribución

Al migrar componentes adicionales:

1. Seguir la estructura de carpetas existente
2. Usar los componentes shadcn/ui base
3. Mantener accesibilidad (ARIA labels, keyboard navigation)
4. Probar en mobile, tablet y desktop
5. Documentar cambios en este archivo

---

## 🐛 Issues Conocidos

Ninguno actualmente.

---

**Última actualización:** 2025-10-18
**Versión:** 1.0.0
**Autor:** Claude Code (Anthropic AI)
