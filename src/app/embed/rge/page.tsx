import type { Metadata } from 'next'

import { SITE_URL } from '@/lib/seo/config'

/**
 * GET /embed/rge — RGE search widget (pillar 10 RGE-OS).
 *
 * Iframe document rendered by `public/embed/rge-v1.js` (and the mirror
 * route `/api/v1/embed/rge-snippet`). Hosts third-party sites in 3 lines:
 *
 *   <div id="sa-rge-search"></div>
 *   <script src="https://servicesartisans.fr/embed/rge-v1.js" async></script>
 *   <script>window.SARGEConfig = { container: '#sa-rge-search' };</script>
 *
 * Submit navigates the parent window (`target="_top"`) to
 * `${SITE_URL}/rge?metier=…&ville=…` so users land on the canonical SA
 * results page (where leads + tracking + claim CTA live).
 *
 * noindex/nofollow + grandfathered in docs/ahrefs-first-grandfather.json.
 */

const VALID_THEMES = new Set(['light', 'dark', 'auto'])
const VALID_METIERS = new Set([
  'pompe-a-chaleur',
  'isolation',
  'photovoltaique',
  'chauffage',
  'vmc',
  'audit-energetique',
  'menuiseries',
  'all',
])

const MAX_VILLE_LEN = 50

type EmbedRgePageProps = {
  searchParams: Promise<{ metier?: string; theme?: string; ville?: string }>
}

export const metadata: Metadata = {
  title: 'Recherche RGE — ServicesArtisans',
  description: 'Widget de recherche d’artisan RGE certifié — ServicesArtisans.',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
}

export const dynamic = 'force-static'
export const revalidate = 86400

function pickMetier(raw: string | undefined): string {
  const value = (raw ?? '').toLowerCase()
  return VALID_METIERS.has(value) ? value : 'all'
}

function pickTheme(raw: string | undefined): 'light' | 'dark' | 'auto' {
  const value = (raw ?? '').toLowerCase()
  if (VALID_THEMES.has(value)) return value as 'light' | 'dark' | 'auto'
  return 'light'
}

function pickVille(raw: string | undefined): string {
  const value = (raw ?? '').slice(0, MAX_VILLE_LEN).trim()
  // Whitelist : lettres ASCII + diacritiques FR + chiffres + espaces, tirets,
  // apostrophes (Saint-Étienne, L'Haÿ-les-Roses…). On neutralise le reste
  // pour bloquer toute tentative d'injection dans `defaultValue`. Pas de
  // `\p{...}` unicode property class (incompatible target ES par défaut).
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s'-]/g, '')
}

export default async function EmbedRgePage(props: EmbedRgePageProps) {
  const searchParams = await props.searchParams
  const metier = pickMetier(searchParams.metier)
  const theme = pickTheme(searchParams.theme)
  const ville = pickVille(searchParams.ville)

  const isDark = theme === 'dark'
  const shellClass = isDark ? 'bg-charcoal-900 text-white' : 'bg-white text-charcoal-900'
  const inputClass = isDark
    ? 'flex-1 rounded border border-charcoal-700 bg-charcoal-800 text-white placeholder-charcoal-400 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent-400'
    : 'flex-1 rounded border border-charcoal-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent-600'
  const footerClass = isDark ? 'text-charcoal-400' : 'text-charcoal-500'
  const footerLinkClass = isDark ? 'underline text-accent-300' : 'underline text-accent-700'

  return (
    <div className={`min-h-[120px] w-full ${shellClass} px-4 py-3`} data-embed-page="rge">
      <form
        action={`${SITE_URL}/rge`}
        method="get"
        target="_top"
        className="flex flex-col gap-2 sm:flex-row"
        aria-label="Recherche d'un artisan RGE certifié"
      >
        <input type="hidden" name="metier" value={metier} />
        <input
          type="text"
          name="ville"
          placeholder="Votre ville (ex. Lyon)"
          defaultValue={ville}
          maxLength={MAX_VILLE_LEN}
          className={inputClass}
          aria-label="Ville"
          required
        />
        <button
          type="submit"
          className="rounded bg-accent-600 px-4 py-2 font-semibold text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-400"
        >
          Trouver un artisan RGE
        </button>
      </form>
      <p className={`mt-2 text-xs ${footerClass}`}>
        Powered by{' '}
        <a href={SITE_URL} target="_top" className={footerLinkClass} rel="noopener">
          ServicesArtisans
        </a>{' '}
        — Source : Registre RGE ADEME (CC-BY 4.0).
      </p>
    </div>
  )
}
