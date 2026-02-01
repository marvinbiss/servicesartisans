'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { Artisan, getDisplayName } from './types'

interface ArtisanBreadcrumbProps {
  artisan: Artisan
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ArtisanBreadcrumb({ artisan }: ArtisanBreadcrumbProps) {
  const displayName = getDisplayName(artisan)
  const specialtySlug = slugify(artisan.specialty)
  const citySlug = slugify(artisan.city)
  const regionSlug = artisan.region ? slugify(artisan.region) : null
  const departmentSlug = artisan.department ? slugify(artisan.department) : null

  // Build breadcrumb with full geographic hierarchy
  const items: Array<{ label: string; href?: string; icon?: typeof Home }> = [
    { label: 'Accueil', href: '/', icon: Home },
    { label: artisan.specialty, href: `/services/${specialtySlug}` },
  ]

  // Add region if available
  if (artisan.region && regionSlug) {
    items.push({ label: artisan.region, href: `/regions/${regionSlug}` })
  }

  // Add department if available
  if (artisan.department && departmentSlug) {
    items.push({ label: artisan.department, href: `/departements/${departmentSlug}` })
  }

  // Add city
  if (artisan.city) {
    items.push({ label: artisan.city, href: `/villes/${citySlug}` })
  }

  // Add artisan name (no link)
  items.push({ label: displayName })

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1 whitespace-nowrap">
          {index > 0 && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
