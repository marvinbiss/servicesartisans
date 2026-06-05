import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  /** `dark` : variante lisible sur fond charcoal-950 (hero immersif). */
  variant?: 'light' | 'dark'
}

const VARIANT_LINK: Record<'light' | 'dark', string> = {
  light: 'text-charcoal-400 hover:text-primary-400',
  dark: 'text-sand-400 hover:text-white',
}

const VARIANT_CURRENT: Record<'light' | 'dark', string> = {
  light: 'text-charcoal-900',
  dark: 'text-white',
}

const VARIANT_CHEVRON: Record<'light' | 'dark', string> = {
  light: 'text-sand-400',
  dark: 'text-charcoal-300',
}

export default function Breadcrumb({ items, className = '', variant = 'light' }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className={`flex items-center gap-2 text-sm ${className}`}>
      <ol
        className="flex items-center gap-2"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li
          className="flex items-center"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            className={`flex items-center gap-1 transition-colors ${VARIANT_LINK[variant]}`}
            itemProp="item"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only" itemProp="name">
              Accueil
            </span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-2"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <ChevronRight className={`w-4 h-4 ${VARIANT_CHEVRON[variant]}`} aria-hidden="true" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className={`transition-colors ${VARIANT_LINK[variant]}`}
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            ) : (
              // Plan D — D-5 (a11y) : aria-current="page" pour annoncer la
              // page courante aux lecteurs d'écran (WCAG 2.4.8 Location).
              <span
                className={`font-medium ${VARIANT_CURRENT[variant]}`}
                itemProp="name"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
