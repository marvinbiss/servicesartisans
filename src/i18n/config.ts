/**
 * i18n Configuration - ServicesArtisans
 * Multi-language support (FR, EN, ES, DE)
 */

export const locales = ['fr', 'en', 'es', 'de'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
}

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
}

// Date formatting options per locale
export const dateFormats: Record<Locale, Intl.DateTimeFormatOptions> = {
  fr: { day: 'numeric', month: 'long', year: 'numeric' },
  en: { month: 'long', day: 'numeric', year: 'numeric' },
  es: { day: 'numeric', month: 'long', year: 'numeric' },
  de: { day: 'numeric', month: 'long', year: 'numeric' },
}

// Currency formatting
export const currencyFormats: Record<Locale, { locale: string; currency: string }> = {
  fr: { locale: 'fr-FR', currency: 'EUR' },
  en: { locale: 'en-GB', currency: 'GBP' },
  es: { locale: 'es-ES', currency: 'EUR' },
  de: { locale: 'de-DE', currency: 'EUR' },
}
