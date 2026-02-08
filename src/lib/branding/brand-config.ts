/**
 * ServicesArtisans - Brand Configuration
 * World-class branding system inspired by Doctolib, Booksy, Treatwell
 *
 * This file defines the complete brand identity and ensures consistency
 * across all touchpoints (web, email, SMS, etc.)
 */

// ===========================================
// BRAND IDENTITY
// ===========================================

export const brand = {
  name: 'ServicesArtisans',
  tagline: 'Trouvez des artisans près de chez vous',
  shortDescription: 'La plateforme de réservation pour artisans et clients exigeants',
  fullDescription: 'ServicesArtisans connecte les artisans qualifiés avec les clients à la recherche de services de qualité. Réservation en ligne, rappels automatiques, avis vérifiés.',

  // Brand personality (for consistent tone of voice)
  personality: {
    traits: ['Professionnel', 'Accessible', 'Fiable', 'Humain', 'Moderne'],
    toneOfVoice: {
      formal: 0.6, // 60% formel, 40% décontracté
      friendly: 0.8,
      confident: 0.7,
      helpful: 0.9,
    },
  },

  // Core values
  values: [
    {
      name: 'Confiance',
      description: 'Des artisans vérifiés et des avis authentiques',
      icon: 'shield-check',
    },
    {
      name: 'Simplicité',
      description: 'Réservez en 3 clics, recevez une confirmation instantanée',
      icon: 'zap',
    },
    {
      name: 'Proximité',
      description: 'Des artisans locaux qui connaissent votre région',
      icon: 'map-pin',
    },
    {
      name: 'Excellence',
      description: 'Un service 5 étoiles à chaque étape',
      icon: 'star',
    },
  ],

  // Contact information
  contact: {
    email: 'contact@servicesartisans.fr',
    support: 'support@servicesartisans.fr',
  },

  // Social media
  social: {
    facebook: 'https://facebook.com/servicesartisans',
    instagram: 'https://instagram.com/servicesartisans',
    linkedin: 'https://linkedin.com/company/servicesartisans',
    twitter: 'https://twitter.com/servicesartisans',
  },

  // Legal identity: see src/lib/config/company-identity.ts
} as const

// ===========================================
// VISUAL IDENTITY - COLORS
// ===========================================

export const brandColors = {
  // Primary - Bleu confiance (inspiré de Doctolib)
  primary: {
    DEFAULT: '#2563eb', // Blue 600
    light: '#3b82f6',   // Blue 500
    dark: '#1d4ed8',    // Blue 700
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },

  // Secondary - Violet moderne (accent)
  secondary: {
    DEFAULT: '#8b5cf6', // Violet 500
    light: '#a78bfa',
    dark: '#7c3aed',
    50: '#f5f3ff',
    500: '#8b5cf6',
    600: '#7c3aed',
  },

  // Success - Vert confirmation
  success: {
    DEFAULT: '#10b981', // Emerald 500
    light: '#34d399',
    dark: '#059669',
    50: '#ecfdf5',
    500: '#10b981',
    600: '#059669',
  },

  // Warning - Orange attention
  warning: {
    DEFAULT: '#f59e0b', // Amber 500
    light: '#fbbf24',
    dark: '#d97706',
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },

  // Error - Rouge erreur
  error: {
    DEFAULT: '#ef4444', // Red 500
    light: '#f87171',
    dark: '#dc2626',
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },

  // Neutral - Gris interface
  neutral: {
    white: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    black: '#000000',
  },

  // Semantic colors for specific use cases
  semantic: {
    link: '#2563eb',
    linkHover: '#1d4ed8',
    background: '#fafafa',
    surface: '#ffffff',
    border: '#e5e5e5',
    textPrimary: '#171717',
    textSecondary: '#525252',
    textMuted: '#a3a3a3',
  },

  // Gradient presets
  gradients: {
    primary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    hero: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
    subtle: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
  },
} as const

// ===========================================
// TYPOGRAPHY
// ===========================================

export const brandTypography = {
  // Font families
  fontFamily: {
    display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  },

  // Font sizes with line heights
  fontSize: {
    '2xs': { size: '0.625rem', lineHeight: '0.875rem' },   // 10px
    xs: { size: '0.75rem', lineHeight: '1rem' },           // 12px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },       // 14px
    base: { size: '1rem', lineHeight: '1.5rem' },          // 16px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },       // 18px
    xl: { size: '1.25rem', lineHeight: '1.75rem' },        // 20px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },         // 24px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' },    // 30px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' },      // 36px
    '5xl': { size: '3rem', lineHeight: '1.1' },            // 48px
    '6xl': { size: '3.75rem', lineHeight: '1' },           // 60px
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const

// ===========================================
// SPACING & LAYOUT
// ===========================================

export const brandSpacing = {
  // Base unit: 4px
  unit: 4,

  // Named spacing
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px

  // Component-specific
  buttonPadding: {
    sm: '0.5rem 1rem',
    md: '0.75rem 1.5rem',
    lg: '1rem 2rem',
  },

  cardPadding: {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  },

  // Container max widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

// ===========================================
// BORDER RADIUS
// ===========================================

export const brandRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',

  // Component-specific
  button: '0.5rem',
  card: '0.75rem',
  modal: '1rem',
  input: '0.5rem',
  badge: '9999px',
  avatar: '9999px',
} as const

// ===========================================
// SHADOWS
// ===========================================

export const brandShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Colored shadows for emphasis
  primary: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
  success: '0 4px 14px 0 rgba(16, 185, 129, 0.3)',

  // Card shadows
  card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const

// ===========================================
// ANIMATIONS
// ===========================================

export const brandAnimations = {
  // Durations
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Keyframe presets
  keyframes: {
    fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
    fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
    slideUp: { from: { transform: 'translateY(10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
    slideDown: { from: { transform: 'translateY(-10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
    pulse: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
    spin: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
  },
} as const

// ===========================================
// COMPONENT STYLES
// ===========================================

export const componentStyles = {
  // Buttons
  button: {
    primary: {
      bg: brandColors.primary.DEFAULT,
      text: '#ffffff',
      hover: brandColors.primary.dark,
      active: brandColors.primary[700],
      shadow: brandShadows.primary,
    },
    secondary: {
      bg: brandColors.secondary.DEFAULT,
      text: '#ffffff',
      hover: brandColors.secondary.dark,
    },
    outline: {
      bg: 'transparent',
      text: brandColors.primary.DEFAULT,
      border: brandColors.primary.DEFAULT,
      hover: brandColors.primary[50],
    },
    ghost: {
      bg: 'transparent',
      text: brandColors.neutral[700],
      hover: brandColors.neutral[100],
    },
  },

  // Inputs
  input: {
    bg: '#ffffff',
    border: brandColors.neutral[300],
    borderFocus: brandColors.primary.DEFAULT,
    text: brandColors.neutral[900],
    placeholder: brandColors.neutral[400],
    error: brandColors.error.DEFAULT,
    disabled: {
      bg: brandColors.neutral[100],
      text: brandColors.neutral[400],
    },
  },

  // Cards
  card: {
    bg: '#ffffff',
    border: brandColors.neutral[200],
    shadow: brandShadows.card,
    shadowHover: brandShadows.cardHover,
    radius: brandRadius.card,
  },

  // Badges
  badge: {
    primary: { bg: brandColors.primary[100], text: brandColors.primary[700] },
    secondary: { bg: brandColors.secondary[50], text: brandColors.secondary[600] },
    success: { bg: brandColors.success[50], text: brandColors.success[600] },
    warning: { bg: brandColors.warning[50], text: brandColors.warning[600] },
    error: { bg: brandColors.error[50], text: brandColors.error[600] },
    neutral: { bg: brandColors.neutral[100], text: brandColors.neutral[600] },
  },
} as const

// ===========================================
// COPYWRITING TEMPLATES
// ===========================================

export const copywriting = {
  // CTAs
  cta: {
    booking: 'Réserver maintenant',
    bookingShort: 'Réserver',
    viewProfile: 'Voir le profil',
    contact: 'Contacter',
    learnMore: 'En savoir plus',
    getStarted: 'Commencer',
    signUp: 'Créer un compte',
    signIn: 'Se connecter',
    submit: 'Envoyer',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    back: 'Retour',
    next: 'Suivant',
    save: 'Enregistrer',
  },

  // Common messages
  messages: {
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    success: 'Opération réussie',
    noResults: 'Aucun résultat trouvé',
    required: 'Ce champ est requis',
    invalidEmail: 'Email invalide',
    invalidPhone: 'Numéro de téléphone invalide',
  },

  // Booking-specific
  booking: {
    selectDate: 'Choisissez une date',
    selectTime: 'Choisissez un créneau',
    yourInfo: 'Vos coordonnées',
    confirmation: 'Réservation confirmée !',
    reminder: "N'oubliez pas votre rendez-vous",
    cancelled: 'Réservation annulée',
    noSlots: 'Aucun créneau disponible',
    slotTaken: 'Ce créneau vient d\'être réservé',
  },

  // Social proof
  socialProof: {
    reviews: (count: number) => `${count} avis`,
    rating: (avg: number) => `${avg}/5`,
    recommended: (pct: number) => `${pct}% recommandent`,
    verified: 'Avis vérifié',
    popular: 'Très demandé',
  },
} as const

// ===========================================
// EXPORT ALL
// ===========================================

export const brandConfig = {
  brand,
  colors: brandColors,
  typography: brandTypography,
  spacing: brandSpacing,
  radius: brandRadius,
  shadows: brandShadows,
  animations: brandAnimations,
  components: componentStyles,
  copy: copywriting,
} as const

export default brandConfig
