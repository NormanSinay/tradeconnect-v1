/// <reference path="../.astro/types.d.ts" />

/**
 * TradeConnect Frontend - Environment Types
 *
 * Type definitions for environment variables and global types
 * Compatible with Astro + React + Tailwind/shadcn architecture
 */

/// <reference types="vite/client" />

/**
 * Environment Variables Type Definitions
 *
 * Supports both development and production environments
 * with proper typing for Vite environment variables
 */
interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL?: string

  // Environment flags
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean

  // Build info
  readonly VITE_BUILD_DATE?: string
  readonly VITE_VERSION?: string
  readonly VITE_COMMIT_HASH?: string

  // Feature flags
  readonly VITE_ENABLE_DEBUG?: string
  readonly VITE_ENABLE_ANALYTICS?: string
  readonly VITE_ENABLE_PWA?: string

  // Third-party services
  readonly VITE_GOOGLE_ANALYTICS_ID?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_PAYPAL_CLIENT_ID?: string

  // Social media
  readonly VITE_FACEBOOK_APP_ID?: string
  readonly VITE_TWITTER_HANDLE?: string
  readonly VITE_LINKEDIN_COMPANY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Global Type Declarations
 *
 * Extends global scope with TradeConnect-specific types
 */
declare global {
  /**
   * Window interface extensions for TradeConnect
   */
  interface Window {
    // Analytics
    gtag?: (...args: any[]) => void
    dataLayer?: any[]

    // Payment gateways
    paypal?: any
    Stripe?: any

    // WebSocket connections
    tradeconnectWS?: WebSocket

    // Debug utilities (development only)
    __TRADECONNECT_DEBUG__?: boolean
    __TRADECONNECT_VERSION__?: string
  }

  /**
   * CSS Custom Properties (CSS Variables)
   * Available globally through Tailwind theme
   */
  interface CSSCustomProperties {
    '--primary': string
    '--primary-light': string
    '--primary-dark': string
    '--accent': string
    '--secondary': string
    '--text-primary': string
    '--text-secondary': string
    '--error': string
    '--success': string
    '--warning': string
    '--info': string
    '--background': string
    '--surface': string
    '--border-radius-sm': string
    '--border-radius-md': string
    '--border-radius-lg': string
    '--border-radius-xl': string
    '--shadow-sm': string
    '--shadow-md': string
    '--shadow-lg': string
    '--shadow-xl': string
    '--spacing-xs': string
    '--spacing-sm': string
    '--spacing-md': string
    '--spacing-lg': string
    '--spacing-xl': string
  }

  /**
   * Extended HTMLElement for TradeConnect components
   */
  interface HTMLElement {
    // Animation properties
    style: CSSStyleDeclaration & CSSCustomProperties
  }

  /**
   * Navigator interface extensions
   */
  interface Navigator {
    // Service Worker support
    serviceWorker?: ServiceWorkerContainer

    // Web Share API
    share?: (data: ShareData) => Promise<void>
    canShare?: (data: ShareData) => boolean

    // Geolocation for events
    geolocation?: Geolocation
  }

  /**
   * ShareData interface for Web Share API
   */
  interface ShareData {
    title?: string
    text?: string
    url?: string
    files?: readonly File[]
  }

  /**
   * Performance API extensions
   */
  interface PerformanceEntry {
    // Custom performance marks for TradeConnect
    name: string
    entryType: string
    startTime: number
    duration?: number
  }

  /**
   * Error handling extensions
   */
  interface Error {
    // TradeConnect error codes
    code?: string
    statusCode?: number
    context?: Record<string, any>
  }

  /**
   * Console extensions for development
   */
  interface Console {
    // TradeConnect specific logging
    tradeconnect?: {
      log: (...args: any[]) => void
      warn: (...args: any[]) => void
      error: (...args: any[]) => void
      debug: (...args: any[]) => void
    }
  }
}

/**
 * Module declarations for third-party libraries
 */
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

/**
 * Astro-specific type extensions
 */
declare namespace astroHTML {
  interface HTMLAttributes {
    // Custom attributes for TradeConnect components
    'data-testid'?: string
    'data-cy'?: string
    'data-analytics'?: string
  }
}

/**
 * React-specific type extensions
 */
declare namespace React {
  interface HTMLAttributes<T> extends astroHTML.HTMLAttributes {}
}

/**
 * Utility types for TradeConnect
 */
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Environment validation function
 */
declare function validateEnvironment(): boolean

export {}