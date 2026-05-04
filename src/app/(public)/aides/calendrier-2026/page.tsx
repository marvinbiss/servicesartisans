import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Calendar,
  CalendarClock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Info,
  Receipt,
  Sun,
  Snowflake,
  Wrench,
  Megaphone,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors } from '@/lib/data/authors'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import {
  AIDES_CALENDAR_2026,
  AIDES_CALENDAR_CATEGORIES,
  getAidesCalendarLastDate,
  getAidesCalendarMonthsSummary,
  type AidesCalendarEvent,
  type CalendarEventCategory,
} from '@/lib/aides/calendar-2026'

/**
 * /aides/calendrier-2026 — Sprint O 2026-05-03.
 *
 * Hub time-bound captant les requêtes saisonnières "calendrier aides 2026",
 * "échéance MaPrimeRénov 2026", "quand demander prime CEE", "deadline aides
 * rénovation 2026" (volume Ahrefs estimé 1.5-3K req/mois, pic novembre-mars).
 *
 * Différencié des hubs aides classiques : organisé chronologiquement plutôt
 * que par dispositif, capture l'intent navigationnel "que faire ce mois-ci".
 *
 * Auteur : claire-dubois (YMYL aides financières publiques + dates officielles).
 *
 * Justification SEO : pas de calendrier aides centralisé sur Sonergia, Effy,
 * Heero (vérifié 2026-05-03 audit concurrentiel). Quick win + opportunité de
 * back-link presse (Le Monde, Capital, Que Choisir publient ces calendriers
 * chaque janvier — citation potentielle).
 */

export const revalidate = 86400

const PATH = '/aides/calendrier-2026'
const PAGE_URL = `${SITE_URL}${PATH}`
const PUBLISHED_AT = '2026-05-03'
const REVIEWED_AT = getAidesCalendarLastDate()
const AUTHOR = authors['claire-dubois']

const TITLE = 'Calendrier des aides rénovation 2026 : 11 dates clés à retenir'
const DESCRIPTION =
  "Calendrier officiel des aides rénovation énergétique 2026 : revalorisations barèmes, échéances dépôt MaPrimeRénov', deadlines factures, saisonnalité optimale par travaux. Source ANAH, ADEME, France Rénov'."

const CATEGORY_ICONS: Record<CalendarEventCategory, typeof Calendar> = {
  bareme: Calculator,
  fiscal: Receipt,
  saisonnalite: Sun,
  echeance: AlertTriangle,
  campagne: Megaphone,
}

const CATEGORY_COLORS: Record<CalendarEventCategory, string> = {
  bareme: 'bg-blue-50 text-blue-700 border-blue-200',
  fiscal: 'bg-amber-50 text-amber-700 border-amber-200',
  saisonnalite: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  echeance: 'bg-red-50 text-red-700 border-red-200',
  campagne: 'bg-violet-50 text-violet-700 border-violet-200',
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  const monthNames = [
    'jan',
    'fév',
    'mar',
    'avr',
    'mai',
    'juin',
    'juil',
    'août',
    'sep',
    'oct',
    'nov',
    'déc',
  ]
  return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]} ${y}`
}

function formatDateRange(event: AidesCalendarEvent): string {
  if (!event.endDate || event.endDate === event.startDate) return formatDate(event.startDate)
  return `${formatDate(event.startDate)} → ${formatDate(event.endDate)}`
}

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PATH),
  openGraph: {
    ...getOgDefaults(),
    locale: 'fr_FR',
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
  },
}

export default function AidesCalendrier2026Page() {
  const monthsSummary = getAidesCalendarMonthsSummary()
  const monthsWithEvents = monthsSummary.filter((m) => m.events.length > 0)

  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: 'Calendrier 2026', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)

  // ItemList Schema.org pour les 11 événements (carrousel SERP potentiel).
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Calendrier aides rénovation énergétique 2026',
    numberOfItems: AIDES_CALENDAR_2026.length,
    itemListElement: AIDES_CALENDAR_2026.map((e, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Event',
        name: e.title,
        description: e.description,
        startDate: e.startDate,
        ...(e.endDate && { endDate: e.endDate }),
        url: `${PAGE_URL}#${e.slug}`,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        location: {
          '@type': 'VirtualLocation',
          url: e.sourceUrl,
        },
        organizer: {
          '@type': 'Organization',
          name: 'ServicesArtisans',
          url: SITE_URL,
        },
      },
    })),
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    image: [`${SITE_URL}/og-default.jpg`],
    datePublished: `${PUBLISHED_AT}T00:00:00+02:00`,
    dateModified: `${REVIEWED_AT}T00:00:00+02:00`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    author: AUTHOR
      ? {
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          url: `${SITE_URL}/equipe/${AUTHOR.slug}`,
          ...(AUTHOR.methodology &&
            AUTHOR.methodology.length > 0 && { skills: AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `${AIDES_CALENDAR_2026.length} dates clés 2026 à connaître pour optimiser ses aides rénovation.`,
    '1er janvier 2026 : revalorisation annuelle plafonds revenus + forfaits MaPrimeRénov’.',
    'Avril-juin : déclaration revenus → RFR 2025 utilisé pour catégorie MPR 2026 et 2027.',
    'Juillet-septembre : pic chantiers extérieurs (toiture, ITE, fenêtres) — réserver dès juin.',
    '31 décembre : deadline factures acquittées pour comptabilisation année fiscale.',
  ]

  const tldrBullets = [
    `${AIDES_CALENDAR_2026.length} échéances aides 2026 organisées par mois — barèmes, fiscal, saisonnalité, deadlines.`,
    'Au 1er janvier 2026 : nouveaux plafonds revenus MPR + coefficients CEE actualisés (vérifier votre catégorie bleu/jaune/violet/rose).',
    'Saisonnalité forte : Q1 isolation · Q2 planification PAC · Q3 toiture/ITE · Q4 chauffage urgence (et délais RGE saturés).',
    'Risque #1 hivernal : signer avec un artisan non-RGE pour gagner du temps = perte intégrale de toutes les aides.',
    'Deadline absolue : facture acquittée 2026 obligatoire avant le 31 décembre + dépôt MPR sous 6 mois post-travaux.',
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema as Record<string, unknown>,
          articleSchema as Record<string, unknown>,
          itemListSchema as Record<string, unknown>,
        ]}
      />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: 'Calendrier 2026' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`Calendrier des aides rénovation énergétique 2026 : ${AIDES_CALENDAR_2026.length} dates clés à connaître pour ne perdre aucune subvention. Revalorisation barèmes au 1er janvier, fenêtres fiscales avril-juin, saisonnalité chantiers, deadlines de dépôt. Sources ANAH, ADEME, France Rénov’.`}
          keyPoints={enBrefPoints}
        />
      </div>

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <CalendarClock className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Calendrier 2026 · YMYL vérifié · sources officielles
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Calendrier des aides rénovation énergétique 2026
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            {AIDES_CALENDAR_2026.length} dates clés organisées chronologiquement : revalorisations
            de barème, échéances fiscales, saisonnalité optimale par type de travaux et deadlines de
            dépôt. Sources : ANAH, ADEME, France Rénov’, ministère de la Transition écologique.
          </p>
          <LastUpdated
            label="Calendrier vérifié le"
            date={REVIEWED_AT}
            className="mt-4 text-emerald-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides 2026
            </Link>
            <Link
              href="/aides"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Hub des aides
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 border-b border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <ArticleMeta
            author={AUTHOR?.name ?? 'Équipe éditoriale ServicesArtisans'}
            authorHref={AUTHOR ? `/equipe/${AUTHOR.slug}` : '/a-propos'}
            datePublished={PUBLISHED_AT}
            dateModified={REVIEWED_AT}
          />
          <TldrBlock title="L’essentiel du calendrier 2026" bullets={tldrBullets} />
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="categories-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2
              id="categories-heading"
              className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900"
            >
              5 types d’événements à surveiller
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {AIDES_CALENDAR_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.category]
              return (
                <div
                  key={cat.category}
                  className={`rounded-xl border p-4 ${CATEGORY_COLORS[cat.category]}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="font-heading font-semibold">{cat.label}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{cat.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-sand-50 py-12" aria-labelledby="timeline-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2
              id="timeline-heading"
              className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900"
            >
              Timeline 2026 mois par mois
            </h2>
          </div>

          <div className="space-y-8">
            {monthsWithEvents.map((m) => (
              <div key={m.month} className="bg-white rounded-2xl border border-charcoal-100 p-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-charcoal-100">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <span className="font-heading font-bold text-emerald-700">
                      {String(m.month).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-charcoal-900">
                      {m.monthName} 2026
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      {m.events.length} événement{m.events.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <ul className="space-y-4">
                  {m.events.map((e) => {
                    const Icon = CATEGORY_ICONS[e.category]
                    return (
                      <li
                        key={e.slug}
                        id={e.slug}
                        className="rounded-xl bg-sand-50/40 border border-charcoal-100 p-5 scroll-mt-20"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${CATEGORY_COLORS[e.category]}`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                              <h4 className="font-heading font-bold text-charcoal-900">
                                {e.title}
                              </h4>
                              <span className="text-xs font-mono text-charcoal-500">
                                {formatDateRange(e)}
                              </span>
                            </div>
                            <p className="text-sm text-charcoal-700 leading-relaxed mb-3">
                              {e.description}
                            </p>
                            <div className="flex items-start gap-2 mb-3 text-sm">
                              <CheckCircle2
                                className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span className="text-charcoal-800">
                                <strong>Action recommandée :</strong> {e.recommendedAction}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <a
                                href={e.sourceUrl}
                                rel="noopener nofollow"
                                target="_blank"
                                className="inline-flex items-center gap-1 text-emerald-800 hover:underline font-medium"
                              >
                                Source officielle
                                <ArrowRight className="w-3 h-3" aria-hidden="true" />
                              </a>
                              {e.relatedAids.length > 0 && (
                                <>
                                  <span className="text-charcoal-300">·</span>
                                  <span className="text-charcoal-500">Aides :</span>
                                  {e.relatedAids.slice(0, 3).map((slug) => (
                                    <Link
                                      key={slug}
                                      href={`/aides/${slug}`}
                                      className="text-emerald-700 hover:underline"
                                    >
                                      {slug}
                                    </Link>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-amber-50/40 py-12 border-y border-amber-100"
        aria-labelledby="warning-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl bg-white border border-amber-200 p-6 md:p-8">
            <AlertTriangle
              className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1"
              aria-hidden="true"
            />
            <div>
              <h2
                id="warning-heading"
                className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-2"
              >
                Risques calendaires à éviter absolument
              </h2>
              <ul className="space-y-2 text-sm text-charcoal-800 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Snowflake
                    className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Hiver — panne chauffage :</strong> NE JAMAIS signer avec un artisan
                    non-RGE pour aller plus vite. Vous perdez intégralement MPR + CEE + Coup de
                    pouce. Mieux vaut un appoint électrique temporaire et une installation propre au
                    S1 suivant.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Receipt
                    className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Fin d’année — paiement tardif :</strong> une facture émise en 2026 mais
                    payée en 2027 = comptabilisée 2027 (autre barème). Régler avant le 24 décembre
                    pour absorber les délais bancaires.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Wrench
                    className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Post-travaux — délai dépôt MPR :</strong> 6 mois maximum pour déposer le
                    dossier final. Au-delà = rejet irrévocable. Calendarisez le dépôt dans les 30
                    jours suivant la fin des travaux.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="cluster-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="cluster-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-4"
          >
            Continuer l’exploration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/aides"
              className="group rounded-2xl border border-charcoal-100 p-5 hover:border-emerald-300 hover:bg-emerald-50/40 transition"
            >
              <div className="font-heading font-bold text-charcoal-900 mb-1 group-hover:text-emerald-800">
                Hub des aides nationales
              </div>
              <p className="text-sm text-charcoal-700">
                Les 12 dispositifs 2026 expliqués (MaPrimeRénov’, CEE, éco-PTZ, TVA 5,5 %, Coup de
                pouce…).
              </p>
            </Link>
            <Link
              href="/aides/maprimerenov-vs-cee"
              className="group rounded-2xl border border-charcoal-100 p-5 hover:border-emerald-300 hover:bg-emerald-50/40 transition"
            >
              <div className="font-heading font-bold text-charcoal-900 mb-1 group-hover:text-emerald-800">
                MaPrimeRénov’ vs CEE — 10 différences
              </div>
              <p className="text-sm text-charcoal-700">
                Comparatif officiel + règles de cumul (≤ 100 % TTC).
              </p>
            </Link>
            <Link
              href="/aides/par-region"
              className="group rounded-2xl border border-charcoal-100 p-5 hover:border-emerald-300 hover:bg-emerald-50/40 transition"
            >
              <div className="font-heading font-bold text-charcoal-900 mb-1 group-hover:text-emerald-800">
                Aides par région
              </div>
              <p className="text-sm text-charcoal-700">
                13 régions métropolitaines + aides régionales cumulables avec MPR + CEE.
              </p>
            </Link>
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="group rounded-2xl border border-charcoal-100 p-5 hover:border-emerald-300 hover:bg-emerald-50/40 transition"
            >
              <div className="font-heading font-bold text-charcoal-900 mb-1 group-hover:text-emerald-800">
                Cumul MaPrimeRénov’ + CEE famille par famille
              </div>
              <p className="text-sm text-charcoal-700">
                Détail par geste : PAC air-eau, isolation combles, chaudière biomasse, fenêtres…
              </p>
            </Link>
          </div>
          <div className="mt-6 flex items-start gap-2 text-sm text-charcoal-500">
            <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Ce calendrier est mis à jour trimestriellement. En cas d’ajustement officiel publié
              par arrêté DGEC ou décret ANAH, les dates sont actualisées dans les 7 jours.
            </span>
          </div>
        </div>
      </section>
    </>
  )
}
