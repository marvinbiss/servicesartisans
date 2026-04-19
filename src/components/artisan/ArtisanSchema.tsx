import React from 'react'
import { getDisplayName } from './types'
import type { LegacyArtisan } from '@/types/legacy'
import { slugify, getArtisanUrl } from '@/lib/utils'
import { companyIdentity, getSocialLinks } from '@/lib/config/company-identity'

interface ArtisanSchemaProps {
  artisan: LegacyArtisan
  isClaimed?: boolean
}

export function ArtisanSchema({ artisan, isClaimed = false }: ArtisanSchemaProps) {
  const displayName = getDisplayName(artisan)
  const baseUrl = companyIdentity.url

  // Organization Schema for ServicesArtisans platform
  const organizationSchema = {
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'ServicesArtisans',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/icons/icon-512x512.png`,
      width: 512,
      height: 512,
    },
    description:
      'Plateforme de mise en relation entre particuliers et artisans qualifiés en France',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['French'],
      url: `${baseUrl}/contact`,
      ...(companyIdentity.phone && { telephone: companyIdentity.phone }),
    },
    ...(getSocialLinks().length > 0 && { sameAs: getSocialLinks() }),
  }

  const artisanUrl = `${baseUrl}${getArtisanUrl(artisan)}`

  // Individual Service Schemas for each service offered
  const serviceSchemas = artisan.service_prices.map((service, index) => ({
    '@type': 'Service',
    '@id': `${artisanUrl}#service-${index}`,
    name: service.name,
    description: service.description || `${service.name} par ${displayName}`,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${artisanUrl}#business`,
      name: displayName,
    },
    areaServed: {
      '@type': 'City',
      name: artisan.city,
      ...(artisan.region && {
        containedInPlace: { '@type': 'AdministrativeArea', name: artisan.region },
      }),
    },
    ...(() => {
      if (!service.price) return {}
      const numericPrice = service.price.replace(/[^0-9]/g, '')
      if (!numericPrice || numericPrice === '0' || /devis/i.test(service.price)) return {}
      return {
        offers: {
          '@type': 'Offer',
          price: numericPrice,
          priceCurrency: 'EUR',
          availability: artisan.accepts_new_clients
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      }
    })(),
    ...(service.duration && {
      estimatedDuration: service.duration,
    }),
    serviceType: artisan.specialty,
    termsOfService: `${baseUrl}/cgv`,
  }))

  // LocalBusiness Schema — use more specific @type when possible for richer snippets
  const businessType = artisan.specialty?.toLowerCase().includes('plomb')
    ? 'Plumber'
    : artisan.specialty?.toLowerCase().includes('electr')
      ? 'Electrician'
      : 'HomeAndConstructionBusiness'

  const localBusinessSchema = {
    '@type': ['LocalBusiness', businessType],
    '@id': `${artisanUrl}#business`,
    name: displayName,
    description: artisan.description || `${displayName} - ${artisan.specialty} à ${artisan.city}`,
    image: artisan.portfolio?.[0]?.imageUrl || `${baseUrl}/opengraph-image`,
    // Add knowsAbout for E-E-A-T signals
    knowsAbout: artisan.specialty,
    ...(isClaimed &&
      artisan.phone &&
      artisan.phone.replace(/\D/g, '').length >= 10 && {
        telephone: artisan.phone,
      }),
    ...(isClaimed && artisan.email && { email: artisan.email }),
    url: artisanUrl,
    parentOrganization: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: 'ServicesArtisans',
    },

    address: {
      '@type': 'PostalAddress',
      ...(artisan.address ? { streetAddress: artisan.address } : {}),
      addressLocality: artisan.city,
      ...(artisan.region || artisan.department
        ? { addressRegion: artisan.region || artisan.department }
        : {}),
      postalCode: artisan.postal_code,
      addressCountry: 'FR',
    },

    ...(artisan.latitude &&
      artisan.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: artisan.latitude,
          longitude: artisan.longitude,
        },
      }),

    ...(artisan.service_prices.length > 0 && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: artisan.service_prices.map((s, _i) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: s.name,
            description: s.description,
          },
          ...(() => {
            if (!s.price) return {}
            const numericPrice = s.price.replace(/[^0-9]/g, '')
            if (!numericPrice || numericPrice === '0' || /devis/i.test(s.price)) return {}
            return {
              priceSpecification: {
                '@type': 'PriceSpecification',
                price: numericPrice,
                priceCurrency: 'EUR',
              },
            }
          })(),
        })),
      },
    }),

    ...(artisan.intervention_radius_km &&
      artisan.latitude &&
      artisan.longitude && {
        areaServed: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: artisan.latitude,
            longitude: artisan.longitude,
          },
          geoRadius: artisan.intervention_radius_km * 1000,
        },
      }),

    ...(artisan.siret &&
      /^\d{14}$/.test(artisan.siret.trim()) && {
        identifier: {
          '@type': 'PropertyValue',
          name: 'SIRET',
          value: artisan.siret.trim(),
        },
      }),

    ...(() => {
      const links: string[] = []
      if (artisan.website) links.push(artisan.website)
      // Lien societe.com basé sur le SIREN (9 premiers chiffres du SIRET)
      if (artisan.siret && artisan.siret.length >= 9) {
        const siren = artisan.siret.replace(/\s/g, '').slice(0, 9)
        links.push(`https://www.societe.com/societe/${siren}.html`)
      }
      return links.length > 0 ? { sameAs: links } : {}
    })(),

    // AggregateRating — only when real reviews exist
    ...(artisan.review_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: artisan.average_rating.toFixed(1),
        reviewCount: String(artisan.review_count),
        bestRating: '5',
        worstRating: '1',
      },
    }),

    // Additional SEO-friendly properties
    ...(artisan.creation_date ? { foundingDate: artisan.creation_date } : {}),
    priceRange: '€€',
    currenciesAccepted: 'EUR',

    // Opening hours for Google Knowledge Panel
    ...(artisan.opening_hours &&
      Object.keys(artisan.opening_hours).length > 0 && {
        openingHoursSpecification: (() => {
          const dayMap: Record<string, string> = {
            lundi: 'Monday',
            mardi: 'Tuesday',
            mercredi: 'Wednesday',
            jeudi: 'Thursday',
            vendredi: 'Friday',
            samedi: 'Saturday',
            dimanche: 'Sunday',
          }
          return Object.entries(artisan.opening_hours)
            .filter(
              ([, val]: [string, { ouvert: boolean; debut: string; fin: string }]) => val?.ouvert
            )
            .map(([day, val]: [string, { ouvert: boolean; debut: string; fin: string }]) => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: dayMap[day] || day,
              opens: val.debut || '08:00',
              closes: val.fin || '18:00',
            }))
        })(),
      }),

    // RGE certifications — EducationalOccupationalCredential per qualification.
    // Dedupe par code (un artisan peut avoir plusieurs entrées pour la même
    // qualif avec dates différentes — on garde la plus récente par date_fin).
    ...(() => {
      const rge = artisan.rge_qualifications
      if (!Array.isArray(rge) || rge.length === 0) return {}
      const now = Date.now()
      const active = rge.filter((q) => {
        if (!q?.date_fin) return false
        const end = Date.parse(q.date_fin)
        return Number.isFinite(end) && end > now
      })
      if (active.length === 0) return {}
      // Dedupe par code, garder la plus longue validité
      const byCode = new Map<string, (typeof active)[number]>()
      for (const q of active) {
        const existing = byCode.get(q.code)
        if (!existing || Date.parse(q.date_fin) > Date.parse(existing.date_fin)) {
          byCode.set(q.code, q)
        }
      }
      const credentials = Array.from(byCode.values()).map((q) => ({
        '@type': 'EducationalOccupationalCredential',
        name: q.nom,
        identifier: q.code,
        credentialCategory: "RGE (Reconnu Garant de l'Environnement)",
        recognizedBy: {
          '@type': 'Organization',
          name: q.organisme,
        },
        validFrom: q.date_debut || undefined,
        validThrough: q.date_fin,
        ...(q.url ? { url: q.url } : {}),
      }))
      return { hasCredential: credentials }
    })(),

    // Organismes RGE ayant délivré au moins une qualification active —
    // memberOf pour renforcer le signal de rattachement officiel (Qualibat,
    // Qualit'EnR, Qualifelec, OPQIBI, Certibat).
    ...(() => {
      const organismes = artisan.rge_organismes
      if (!Array.isArray(organismes) || organismes.length === 0) return {}
      return {
        memberOf: organismes.map((name) => ({
          '@type': 'Organization',
          name,
        })),
      }
    })(),

    // Quote request action for rich results
    potentialAction: {
      '@type': 'CommunicateAction',
      target: `${artisanUrl}#devis`,
      name: 'Obtenir mon devis gratuit',
    },
  }

  // FAQPage Schema — not applicable (no FAQ data on individual artisan pages)
  const faqSchema = null

  // BreadcrumbList Schema — 5 levels matching visible breadcrumb
  // Structure: Accueil > Services > {Service} > {Ville} > {Nom artisan}
  const specialtySlug = slugify(artisan.specialty)
  const citySlug = slugify(artisan.city)
  const breadcrumbItems = [
    { name: 'Accueil', item: baseUrl },
    { name: 'Services', item: `${baseUrl}/services` },
    { name: artisan.specialty, item: `${baseUrl}/services/${specialtySlug}` },
    { name: artisan.city, item: `${baseUrl}/services/${specialtySlug}/${citySlug}` },
    { name: displayName, item: '' },
  ]

  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => {
      const isLast = index === breadcrumbItems.length - 1
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        ...(!isLast && item.item
          ? {
              item: {
                '@type': 'WebPage',
                '@id': item.item,
                name: item.name,
              },
            }
          : {}),
      }
    }),
  }

  // ProfilePage Schema (wraps the artisan profile)
  const profilePageSchema = {
    '@type': 'ProfilePage',
    '@id': `${artisanUrl}#profile`,
    mainEntity: { '@id': `${artisanUrl}#business` },
    ...(artisan.created_at
      ? {
          dateCreated: new Date(artisan.created_at).toISOString(),
        }
      : artisan.member_since
        ? {
            dateCreated: `${artisan.member_since}-01-01`,
          }
        : {}),
    ...(artisan.updated_at
      ? {
          dateModified: new Date(artisan.updated_at).toISOString(),
        }
      : {}),
  }

  // Combined schema graph for better SEO (single JSON-LD with @graph)
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      profilePageSchema,
      localBusinessSchema,
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : []),
      ...serviceSchemas,
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(combinedSchema, null, 0)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e'),
        }}
      />
    </>
  )
}
