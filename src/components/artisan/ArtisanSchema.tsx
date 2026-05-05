import React from 'react'
import { getDisplayName } from './types'
import type { LegacyArtisan } from '@/types/legacy'
import { slugify, getArtisanUrl } from '@/lib/utils'
import { companyIdentity, getSocialLinks } from '@/lib/config/company-identity'
import { cleanAdemeText } from '@/lib/ademe/text'
import { safeJsonStringify } from '@/lib/seo/safe-json'
import { authors } from '@/lib/data/authors'
import { SITE_URL } from '@/lib/seo/config'

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
      'Plateforme de mise en relation entre particuliers et artisans RGE certifiés en France',
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

  // Individual Service Schemas for each service offered.
  // Defensive : le type déclare ServicePrice[] mais un provider mal importé
  // peut arriver avec undefined → fallback `[]` pour éviter crash SSR.
  const serviceSchemas = (artisan.service_prices ?? []).map((service, index) => ({
    '@type': 'Service',
    '@id': `${artisanUrl}#service-${index}`,
    name: service.name,
    description: service.description || `${service.name} par ${displayName}`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${baseUrl}#website` },
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
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${baseUrl}#website` },
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
      // Google Maps — preuve d'identité externe forte (E-E-A-T trust signal).
      // Format officiel Places "place_id only" pour ne pas leak le nom dans
      // l'URL (Google sait résoudre depuis le seul place_id).
      if (artisan.google_place_id) {
        links.push(
          `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(artisan.google_place_id)}`
        )
      }
      return links.length > 0 ? { sameAs: links } : {}
    })(),

    // AggregateRating — priorité first-party (review_count + average_rating
    // de la plateforme). Fallback Google Places UNIQUEMENT si first-party=0
    // ET google_rating>0 ET business_status=OPERATIONAL : c'est l'entité
    // LocalBusiness elle-même qui porte ses avis Google (acceptable Schema.org
    // policy — distinct du listing page-level qui interdit l'agrégation
    // cross-source). Defensive : Number() coerce les NUMERIC Supabase string.
    ...(() => {
      // Source 1 — first-party reviews (toujours préféré)
      const reviewCount = Number(artisan.review_count ?? 0)
      const avgRating = Number(artisan.average_rating ?? 0)
      if (reviewCount > 0 && avgRating > 0) {
        return {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating.toFixed(1),
            reviewCount: String(reviewCount),
            bestRating: '5',
            worstRating: '1',
          },
        }
      }
      // Source 2 — Google Places fallback. Strict guards : place_id présent,
      // rating dans [1, 5] (zéro réel = no signal, pas un faux 0★), count>=3
      // (Google n'affiche pas les ratings <3 reviews, mimer la même barre
      // pour éviter qu'un AggregateRating soit émis sur une donnée trop fine),
      // status OPERATIONAL (sinon CLOSED_PERMANENTLY ou CLOSED_TEMPORARILY :
      // ne pas émettre d'étoiles SERP pour une boîte fermée).
      const gRating = Number(artisan.google_rating ?? 0)
      const gCount = Number(artisan.google_user_ratings_total ?? 0)
      if (
        artisan.google_place_id &&
        gRating >= 1 &&
        gRating <= 5 &&
        gCount >= 3 &&
        artisan.google_business_status === 'OPERATIONAL'
      ) {
        return {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: gRating.toFixed(1),
            reviewCount: String(gCount),
            bestRating: '5',
            worstRating: '1',
          },
        }
      }
      return {}
    })(),

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
        name: cleanAdemeText(q.nom),
        identifier: q.code,
        credentialCategory: "RGE (Reconnu Garant de l'Environnement)",
        recognizedBy: {
          '@type': 'Organization',
          name: cleanAdemeText(q.organisme),
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
          name: cleanAdemeText(name),
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
    '@id': `${artisanUrl}#breadcrumb`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${baseUrl}#website` },
    numberOfItems: breadcrumbItems.length,
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
  // Tier 19 — enrichissement E-E-A-T : url + name + description + inLanguage
  // + isAccessibleForFree + lastReviewed (date dernière vérif éditoriale =
  // updated_at, signal QRG) + reviewedBy (notre rédaction éditoriale qui a
  // validé la fiche : SIRET INSEE + RGE ADEME + zone d'intervention).
  // Cf. Google QRG section 3.4 (trustworthiness) : Google récompense les
  // pages annuaire qui exposent leur process de vérification, pas seulement
  // qui se déclarent "vérifiées" dans le texte.
  const PROFILE_REVIEWER = authors['sophie-martin']
  const profilePageDescription =
    artisan.description?.slice(0, 200) ||
    `Fiche artisan ${displayName} ${artisan.specialty ? `— ${artisan.specialty} ` : ''}à ${artisan.city}. SIRET vérifié, qualifications RGE synchronisées ADEME.`
  const profilePageSchema: Record<string, unknown> = {
    '@type': 'ProfilePage',
    '@id': `${artisanUrl}#profile`,
    url: artisanUrl,
    name: `${displayName}${artisan.city ? ` — ${artisan.city}` : ''}`,
    description: profilePageDescription,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${baseUrl}#website` },
    isAccessibleForFree: true,
    mainEntity: { '@id': `${artisanUrl}#business` },
    breadcrumb: { '@id': `${artisanUrl}#breadcrumb` },
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
          lastReviewed: new Date(artisan.updated_at).toISOString().slice(0, 10),
        }
      : {}),
    ...(PROFILE_REVIEWER && {
      reviewedBy: {
        '@type': 'Person',
        '@id': `${SITE_URL}/equipe/${PROFILE_REVIEWER.slug}#person`,
        name: PROFILE_REVIEWER.name,
        jobTitle: PROFILE_REVIEWER.role,
        url: `${SITE_URL}/equipe/${PROFILE_REVIEWER.slug}`,
      },
    }),
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
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(combinedSchema) }}
      />
    </>
  )
}
