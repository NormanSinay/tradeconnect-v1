# 📦 Notas de Dependencias - TradeConnect Frontend

## ⚠️ Conflictos de Dependencias Conocidos

### **ESLint + React Hooks Plugin**

**Problema:**
- ESLint v9.12.0 (instalado)
- `eslint-plugin-react-hooks` v4.6.2 solo soporta ESLint v3-v8

**Solución:**
Al instalar nuevas dependencias, usar el flag `--legacy-peer-deps`:

```bash
npm install <package> --legacy-peer-deps
```

**Opciones para Resolver Permanentemente:**

**Opción 1: Downgrade ESLint (Recomendado para estabilidad)**
```bash
npm install eslint@8.57.1 --save-dev
```

**Opción 2: Upgrade React Hooks Plugin (Beta)**
```bash
npm install eslint-plugin-react-hooks@rc --save-dev
```

**Opción 3: Usar .npmrc**
Crear archivo `.npmrc` en la raíz con:
```
legacy-peer-deps=true
```

---

## ✅ Dependencias Instaladas Exitosamente

### **Visualización de Datos**
- ✅ `recharts@3.2.1` - Gráficos para admin dashboard

### **QR Codes**
- ✅ `qrcode@1.5.4` - Generación de QR codes
- ✅ `react-qr-code@2.0.15` - Componente React de QR

### **3D Graphics**
- ✅ `@react-three/fiber@8.16.8` - React renderer para Three.js
- ✅ `@react-three/drei@9.109.5` - Helpers para Three.js
- ✅ `three@0.167.1` - Biblioteca 3D

### **Formularios**
- ✅ `react-hook-form@7.52.1` - Gestión de formularios
- ✅ `@hookform/resolvers@5.2.2` - Resolvers para validación
- ✅ `yup@1.4.0` - Validación de esquemas
- ✅ `zod@3.23.8` - Validación TypeScript-first

### **UI/UX**
- ✅ `@mui/material@5.15.0` - Material-UI
- ✅ `@mui/icons-material@5.15.0` - Iconos Material
- ✅ `framer-motion@11.5.4` - Animaciones

### **Routing & State**
- ✅ `react-router-dom@6.26.1` - Routing
- ✅ `@tanstack/react-query@5.51.1` - Server state management

### **Carruseles**
- ✅ `swiper@11.1.12` - Carrusel touch

### **PDF & Canvas**
- ✅ `html2canvas@1.4.1` - HTML a canvas
- ✅ `jspdf@2.5.1` - Generación de PDFs

### **i18n**
- ✅ `i18next@23.16.8` - Internacionalización
- ✅ `react-i18next@13.5.0` - React bindings
- ✅ `i18next-browser-languagedetector@8.2.0` - Detección de idioma
- ✅ `i18next-http-backend@2.6.1` - Backend HTTP

---

## 📋 Dependencias Opcionales Pendientes

### **Pagos (Stripe)**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js --legacy-peer-deps
```

### **PayPal**
```bash
npm install @paypal/react-paypal-js --legacy-peer-deps
```
**Estado:** Puede ser necesaria si aún no está instalada

### **PDF Viewer**
```bash
npm install react-pdf @react-pdf/renderer --legacy-peer-deps
```

### **Testing**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest --legacy-peer-deps
```

---

## 🔧 Comandos Útiles

### **Instalar todas las dependencias**
```bash
npm install --legacy-peer-deps
```

### **Actualizar dependencias**
```bash
npm update --legacy-peer-deps
```

### **Verificar vulnerabilidades**
```bash
npm audit
```

### **Fix vulnerabilidades (con precaución)**
```bash
npm audit fix --legacy-peer-deps
```

---

## ⚠️ Vulnerabilidades Conocidas

**Estado actual:** 13 vulnerabilidades (3 low, 9 moderate, 1 high)

**Recomendación:** No ejecutar `npm audit fix --force` sin revisar, ya que puede causar breaking changes.

**Para revisar vulnerabilidades:**
```bash
npm audit
```

---

## 📝 Notas de Versiones

### **Node.js**
- Versión recomendada: v18.x o v20.x (LTS)
- Verificar: `node --version`

### **npm**
- Versión recomendada: v9.x o v10.x
- Verificar: `npm --version`

---

## 🚀 Instalaciones Futuras

Para evitar conflictos, **siempre** usar:
```bash
npm install <package> --legacy-peer-deps
```

O configurar globalmente en `.npmrc`:
```
legacy-peer-deps=true
```

---

**Última actualización:** 2025-10-14
**Mantenedor:** Claude Code
