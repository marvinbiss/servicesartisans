'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, FileText, Phone } from 'lucide-react'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'
import { useEffect, useMemo } from 'react'
import { trackEvent } from '@/lib/analytics/tracking'
import StickyMobileCTA from '@/components/conversion/StickyMobileCTA'
import ExitIntentPopup from '@/components/ExitIntentPopup'

interface Suggestion {
  href: string
  label: string
}

/** Known service keyword → slug mappings.
 *  Pivot full RGE 2026-05-03 : retrait des 4 commodity services (serrurier,
 *  vitrier, carreleur, cuisiniste). Leurs URLs `/services/{slug}` retournent
 *  410 via gone-paths.ts → ne plus suggérer de tels slugs depuis le 404. */
const SERVICE_KEYWORDS: Record<string, { slug: string; label: string }> = {
  plomb: { slug: 'plombier', label: 'Plombier' },
  electr: { slug: 'electricien', label: 'Électricien' },
  chauffag: { slug: 'chauffagiste', label: 'Chauffagiste' },
  peint: { slug: 'peintre-en-batiment', label: 'Peintre en bâtiment' },
  menuisi: { slug: 'menuisier', label: 'Menuisier' },
  couv: { slug: 'couvreur', label: 'Couvreur' },
  macon: { slug: 'macon', label: 'Maçon' },
  maçon: { slug: 'macon', label: 'Maçon' },
  climat: { slug: 'climaticien', label: 'Climaticien' },
  charpent: { slug: 'charpentier', label: 'Charpentier' },
  ravalement: { slug: 'facadier', label: 'Façadier' },
  facade: { slug: 'facadier', label: 'Façadier' },
  façade: { slug: 'facadier', label: 'Façadier' },
  isolation: { slug: 'isolation-thermique', label: 'Isolation thermique' },
  solaire: { slug: 'panneaux-solaires', label: 'Panneaux solaires' },
  ramone: { slug: 'ramoneur', label: 'Ramoneur' },
  // Pivot pure-play BTP énergétique 2026-05-02 : jardin/nettoy/demenag/alarme retirés.
  // Pivot full RGE 2026-05-03 : serrur/vitr/carrel/cuisin retirés.
}

/** Well-known city names (top ~30 for fast matching) */
const CITY_KEYWORDS: Record<string, { slug: string; label: string }> = {
  paris: { slug: 'paris', label: 'Paris' },
  marseille: { slug: 'marseille', label: 'Marseille' },
  lyon: { slug: 'lyon', label: 'Lyon' },
  toulouse: { slug: 'toulouse', label: 'Toulouse' },
  nice: { slug: 'nice', label: 'Nice' },
  nantes: { slug: 'nantes', label: 'Nantes' },
  montpellier: { slug: 'montpellier', label: 'Montpellier' },
  strasbourg: { slug: 'strasbourg', label: 'Strasbourg' },
  bordeaux: { slug: 'bordeaux', label: 'Bordeaux' },
  lille: { slug: 'lille', label: 'Lille' },
  rennes: { slug: 'rennes', label: 'Rennes' },
  reims: { slug: 'reims', label: 'Reims' },
  toulon: { slug: 'toulon', label: 'Toulon' },
  grenoble: { slug: 'grenoble', label: 'Grenoble' },
  dijon: { slug: 'dijon', label: 'Dijon' },
  angers: { slug: 'angers', label: 'Angers' },
  nimes: { slug: 'nimes', label: 'Nîmes' },
  clermont: { slug: 'clermont-ferrand', label: 'Clermont-Ferrand' },
  rouen: { slug: 'rouen', label: 'Rouen' },
  metz: { slug: 'metz', label: 'Metz' },
  besancon: { slug: 'besancon', label: 'Besançon' },
  perpignan: { slug: 'perpignan', label: 'Perpignan' },
  orleans: { slug: 'orleans', label: 'Orléans' },
  caen: { slug: 'caen', label: 'Caen' },
  mulhouse: { slug: 'mulhouse', label: 'Mulhouse' },
  brest: { slug: 'brest', label: 'Brest' },
  tours: { slug: 'tours', label: 'Tours' },
  amiens: { slug: 'amiens', label: 'Amiens' },
  limoges: { slug: 'limoges', label: 'Limoges' },
  avignon: { slug: 'avignon', label: 'Avignon' },
}

function getSuggestions(segments: string[]): Suggestion[] {
  const suggestions: Suggestion[] = []
  const joined = segments.join(' ').toLowerCase()
  const seen = new Set<string>()

  // Match service keywords
  for (const [keyword, service] of Object.entries(SERVICE_KEYWORDS)) {
    if (joined.includes(keyword)) {
      const href = `/services/${service.slug}`
      if (!seen.has(href)) {
        seen.add(href)
        suggestions.push({ href, label: service.label })
      }
    }
  }

  // Match city keywords
  for (const [keyword, city] of Object.entries(CITY_KEYWORDS)) {
    if (joined.includes(keyword)) {
      const href = `/villes/${city.slug}`
      if (!seen.has(href)) {
        seen.add(href)
        suggestions.push({ href, label: `Artisans à ${city.label}` })
      }
    }
  }

  return suggestions
}

export default function NotFoundClient() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const dynamicSuggestions = useMemo(() => getSuggestions(segments), [segments])

  useEffect(() => {
    trackEvent('page_not_found', {
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    })
  }, [pathname])

  const defaultLinks: Suggestion[] = [
    { href: '/', label: 'Accueil' },
    { href: '/services', label: 'Tous les services' },
    { href: '/devis', label: 'Demande de devis' },
  ]

  return (
    <>
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-primary-500 opacity-20">404</div>
            <div className="text-6xl -mt-20 mb-4">🔧</div>
          </div>

          <h1 className="font-heading text-3xl font-bold text-charcoal-900 mb-4 tracking-tight">
            Page introuvable
          </h1>
          <p className="text-charcoal-600 mb-8">
            Oups ! Il semble que cette page n&apos;existe pas ou a été déplacée. Nos artisans sont
            peut-être en train de la réparer...
          </p>

          {/* Primary actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 bg-white border border-sand-400 text-charcoal-700 px-6 py-3 rounded-lg font-semibold hover:bg-sand-50 transition-colors"
            >
              <Search className="w-5 h-5" />
              Trouver un artisan
            </Link>
          </div>

          {/* Search bar */}
          <form
            action="/recherche"
            method="GET"
            className="mt-8 flex items-center gap-2 max-w-sm mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                type="text"
                name="q"
                placeholder="Rechercher un service..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-sand-400 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Rechercher
            </button>
          </form>

          {/* Dynamic suggestions based on URL */}
          {dynamicSuggestions.length > 0 && (
            <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
              <p className="text-sm font-semibold text-primary-800 mb-3">
                Peut-être cherchiez-vous :
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {dynamicSuggestions.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="text-sm bg-white hover:bg-primary-100 text-primary-600 px-3 py-1.5 rounded-full transition-colors border border-primary-200 font-medium"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Default suggestions */}
          <div className="mt-8 pt-8 border-t border-sand-300">
            <p className="text-sm text-charcoal-500 mb-4">Pages populaires :</p>
            <div className="flex flex-wrap justify-center gap-2">
              {defaultLinks.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="text-sm bg-sand-100 hover:bg-primary-100 text-charcoal-700 hover:text-primary-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {s.label}
                </Link>
              ))}
              <Link
                href="/services/plombier"
                className="text-sm bg-sand-100 hover:bg-primary-100 text-charcoal-700 hover:text-primary-600 px-3 py-1.5 rounded-full transition-colors"
              >
                Plombier
              </Link>
              <Link
                href="/services/electricien"
                className="text-sm bg-sand-100 hover:bg-primary-100 text-charcoal-700 hover:text-primary-600 px-3 py-1.5 rounded-full transition-colors"
              >
                Électricien
              </Link>
              <Link
                href="/services/chauffagiste"
                className="text-sm bg-sand-100 hover:bg-primary-100 text-charcoal-700 hover:text-primary-600 px-3 py-1.5 rounded-full transition-colors"
              >
                Chauffagiste
              </Link>
            </div>
          </div>

          {/* CTA Conversion */}
          <div className="mt-10 p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-90" />
            <p className="font-heading font-bold text-lg mb-2">Vous cherchez un artisan ?</p>
            <p className="text-primary-100 text-sm mb-4">Devis gratuit et sans engagement.</p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-bold hover:bg-primary-50 transition-colors"
            >
              Demander un devis gratuit
              <span aria-hidden="true">→</span>
            </Link>
            <p className="text-primary-100 text-sm mt-3 mb-2">Ou appelez-nous</p>
            <a
              href={PHONE_TEL}
              onClick={() => {
                trackEvent('phone_click', { source: '404_page' })
              }}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              aria-label="Appeler ServicesArtisans"
            >
              <Phone className="w-5 h-5" />
              {PHONE_NUMBER}
            </a>
          </div>
        </div>
      </div>

      {/* Conversion widgets */}
      <StickyMobileCTA ctaText="Devis gratuit" />
      <ExitIntentPopup sessionKey="sa:exit-intent-404" />
    </>
  )
}
