/**
 * @fileoverview Profile Components Index - Arquitectura React/Astro + Tailwind CSS + shadcn/ui
 *
 * Arquitectura recomendada para migración:
 * React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui (componentes UI)
 * → Tailwind CSS (estilos) → Radix UI (primitivos accesibles) → Lucide Icons (iconos)
 *
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Índice centralizado de componentes de perfil.
 * Compatible con SSR de Astro y optimizado para performance.
 */

// Profile Components Index
// Centralized exports for all profile-related components

export { default as ProfileSidebar } from './ProfileSidebar';
export type { ProfileSection } from './ProfileSidebar';

export { default as ProfileForm } from './ProfileForm';
export type { ProfileFormData } from './ProfileForm';

export { default as MyEvents } from './MyEvents';

export { default as MyCertificates } from './MyCertificates';

export { default as PaymentHistory } from './PaymentHistory';

export { default as ChangePasswordForm } from './ChangePasswordForm';
export type { ChangePasswordFormData } from './ChangePasswordForm';

export { default as TwoFactorAuth } from './TwoFactorAuth';

export { default as ProfilePage } from './ProfilePage';
