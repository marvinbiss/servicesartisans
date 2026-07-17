import type { Metadata } from 'next'
import Link from 'next/link'
import { X, ShieldCheck, Clock, Check } from 'lucide-react'
import DevisForm from '@/components/DevisForm'

/**
 * Tunnel devis IMMERSIF (plein écran) — variante conversion-first inspirée du
 * wizard dédié de travaux.com (dogfood comparatif 2026-06-09).
 *
 * Différences avec /devis :
 *  - Aucun chrome (header/nav/footer/SEO sections) — masqué via SiteChrome
 *    (préfixe `/demander-un-devis` dans HIDDEN_PREFIXES). Zéro distraction →
 *    on garde l'utilisateur dans le funnel jusqu'au bout.
 *  - Barre fine logo + croix (sortie explicite vers l'accueil).
 *  - Le wizard 3 étapes (DevisForm) reste identique : barre de progression,
 *    1 step requis minimal (service + ville), étape 2 100% optionnelle, contact
 *    en dernier (sunk-cost).
 *
 * SEO : noindex,follow (duplicate du funnel /devis qui porte le contenu
 * éditorial + FAQ + maillage). Pas de canonical cross-page : sur une page
 * noindex, un canonical vers une autre URL est un signal contradictoire que
 * Google ignore — noindex suffit à éviter toute concurrence d'indexation.
 * Cette route n'est qu'une surface de conversion (CTA contextualisés, A/B).
 */

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Demander un devis artisan RGE — gratuit, sans engagement',
  description:
    'Décrivez votre projet en 2 minutes et recevez des devis gratuits d’artisans RGE certifiés. Sans engagement.',
  robots: { index: false, follow: true },
}

interface DemanderDevisPageProps {
  searchParams: Promise<{
    service?: string | string[]
    operation?: string | string[]
    ville?: string | string[]
  }>
}

function firstParam(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value
  return raw?.trim() || undefined
}

export default async function DemanderDevisPage(props: DemanderDevisPageProps) {
  const searchParams = await props.searchParams
  const prefilledService = firstParam(searchParams?.service)
  const prefilledOperation = firstParam(searchParams?.operation)
  const prefilledCity = firstParam(searchParams?.ville)

  return (
    // NB : SiteChrome (branche chrome masqué) enveloppe déjà `children` dans
    // <main id="main-content">. On n'ajoute donc PAS de second <main>/<header>/
    // <footer> ici (sinon landmarks dupliqués + <main> imbriqué = HTML invalide
    // / violation WCAG « one main per page »). Tout est en <div> neutres.
    <div className="min-h-screen bg-sand-50 flex flex-col">
      {/* Barre fine : logo + sortie explicite (pattern wizard travaux.com) */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-heading font-bold text-lg tracking-tight text-charcoal-900"
            aria-label="Retour à l'accueil ServicesArtisans"
          >
            Services<span className="text-primary-500">Artisans</span>
          </Link>
          <Link
            href="/"
            aria-label="Quitter et revenir à l'accueil"
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-900 hover:bg-sand-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Quitter</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 w-full">
        {/* pb généreux : le bandeau cookie (fixe, bottom) ne doit pas recouvrir
            le CTA du wizard au premier affichage (form court → CTA bas). */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-44 md:pb-32">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 tracking-tight">
              Recevez vos devis gratuits
            </h1>
            <p className="text-charcoal-500 mt-2 max-w-xl mx-auto">
              Artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC) — sans engagement.
            </p>
          </div>

          <DevisForm
            prefilledService={prefilledService}
            prefilledOperation={prefilledOperation}
            prefilledCity={prefilledCity}
          />
        </div>
      </div>

      {/* Réassurance pied de tunnel — remplace la sidebar absente */}
      <div className="border-t border-sand-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-charcoal-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-accent-600" /> Données issues du registre RGE ADEME
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-accent-600" /> 100 % gratuit, sans engagement
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent-600" /> Réponse rapide
          </span>
        </div>
      </div>
    </div>
  )
}
