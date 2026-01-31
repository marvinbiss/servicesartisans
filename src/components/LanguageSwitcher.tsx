'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config'

interface LanguageSwitcherProps {
  currentLocale: Locale
  variant?: 'dropdown' | 'inline'
  className?: string
}

export default function LanguageSwitcher({
  currentLocale,
  variant = 'dropdown',
  className = '',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    // Remove current locale from pathname and add new one
    const segments = pathname.split('/')
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    const newPath = segments.join('/') || '/'

    router.push(newPath)
    setIsOpen(false)
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              locale === currentLocale
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <span>{localeFlags[locale]}</span>
            <span className="hidden sm:inline">{localeNames[locale]}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Changer de langue"
        aria-expanded={isOpen}
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {localeFlags[currentLocale]} {localeNames[currentLocale]}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                locale === currentLocale ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">{localeFlags[locale]}</span>
                <span className="font-medium">{localeNames[locale]}</span>
              </span>
              {locale === currentLocale && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
