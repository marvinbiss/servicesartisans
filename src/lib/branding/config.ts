/**
 * World-Class Branding Configuration - ServicesArtisans
 * Professional design system for a premium platform
 */

export const brand = {
  name: 'ServicesArtisans',
  tagline: 'Trouvez des artisans pres de chez vous',
  description: 'Plateforme de mise en relation entre particuliers et artisans qualifies en France.',

  // Logo variations
  logo: {
    primary: '/logo.svg',
    white: '/logo-white.svg',
    icon: '/icon.svg',
    favicon: '/favicon.ico',
  },

  // Contact — Legal identity: see src/lib/config/company-identity.ts
  contact: {
    email: 'contact@servicesartisans.fr',
  },

  // Social
  social: {
    facebook: 'https://facebook.com/servicesartisans',
    instagram: 'https://instagram.com/servicesartisans',
    linkedin: 'https://linkedin.com/company/servicesartisans',
    twitter: 'https://twitter.com/servicesartisan',
  },
}

/**
 * Premium Color Palette
 * Inspired by luxury service platforms (Treatwell, Doctolib, Airbnb)
 */
export const colors = {
  // Primary - Deep Ocean Blue (Trust, Professionalism) - Aligned with Tailwind Blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary - Warm Amber (Energy, Artisanat)
  secondary: {
    50: '#FFFBEB',
    100: '#FFF3C6',
    200: '#FFE588',
    300: '#FFD24A',
    400: '#FFBE20',
    500: '#F59E0B', // Main secondary
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  // Accent - Emerald (Success, Quality)
  accent: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main accent
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  // Neutrals - Sophisticated Slate
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Background gradients
  gradients: {
    primary: 'linear-gradient(135deg, #3366FF 0%, #1A4FE6 100%)',
    secondary: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    hero: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
    card: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    premium: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%)',
  },
}

/**
 * Typography System
 * Modern, readable, professional
 */
export const typography = {
  // Font families
  fonts: {
    heading: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },

  // Font sizes (rem)
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },

  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
}

/**
 * Spacing System (based on 4px grid)
 */
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
  20: '5rem',   // 80px
  24: '6rem',   // 96px
  32: '8rem',   // 128px
}

/**
 * Border Radius
 */
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
}

/**
 * Shadows (Soft, modern shadows)
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  glow: '0 0 20px rgba(51, 102, 255, 0.3)',
  'glow-lg': '0 0 40px rgba(51, 102, 255, 0.4)',
}

/**
 * Animation presets
 */
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
}

/**
 * Breakpoints
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

/**
 * Z-Index scale
 */
export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
}

export default {
  brand,
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
}
