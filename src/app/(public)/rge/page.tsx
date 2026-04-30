import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Flame,
  Sun,
  Home,
  Leaf,
  Wrench,
  Zap,
  Hammer,
  Building2,
  Wind,
  PaintBucket,
  FileCheck2,
  Percent,
  MapPin,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getCollectionPageSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getRgeNationalStats } from '@/lib/rge/guide-stats'
import { getRgeLastSyncDate } from '@/lib/rge/last-sync'
import LastUpdated from '@/components/seo/LastUpdated'
import {
  RGE_ALLOWED_SERVICES,
  RGE_QUALIFICATION_LABELS,
  type RgeAllowedService,
} from '@/lib/rge/service-city-listings'
import { CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'
import { CEE_SHORT_LABELS } from '@/lib/cee/shared-labels'

// ISR — révalidation quotidienne. Les stats nationales RGE évoluent au rythme
// de la sync ADEME hebdomadaire, 24h est un bon compromis crawl/fraîcheur.
export const revalidate = 86400

const PAGE_PATH = '/rge'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`

// Libellés éditoriaux par service énergétique (H3 de chaque carte).
// Source de vérité : RGE_ALLOWED_SERVICES (allowlist) — on typage via index,
// tout ajout à l'allowlist doit avoir son entrée ici sinon fallback automatique.
const SERVICE_DISPLAY: Record<RgeAllowedService, { title: string; tagline: string }> = {
  'pompe-a-chaleur': {
    title: 'Pompe à chaleur',
    tagline: 'Aérothermie, géothermie et PAC hybrides — le poste n°1 de MaPrimeRénov’.',
  },
  'isolation-thermique': {
    title: 'Isolation thermique',
    tagline: 'ITE, ITI, combles perdus et planchers bas — la brique n°1 des économies d’énergie.',
  },
  chauffagiste: {
    title: 'Chauffage performant',
    tagline: 'Chaudières biomasse, poêles à granulés, systèmes hybrides bas-carbone.',
  },
  'panneaux-solaires': {
    title: 'Panneaux solaires',
    tagline: 'Photovoltaïque, solaire thermique et autoconsommation — prime à l’investissement.',
  },
  'renovation-energetique': {
    title: 'Rénovation énergétique globale',
    tagline:
      'Accompagnement Mon Accompagnateur Rénov’ et parcours MaPrimeRénov’ Parcours Accompagné.',
  },
  electricien: {
    title: 'Électricien RGE',
    tagline: 'Bornes de recharge IRVE, intégration photovoltaïque et pilotage énergétique.',
  },
  menuisier: {
    title: 'Menuiserie performante',
    tagline: 'Remplacement de fenêtres, portes d’entrée et baies à haute performance thermique.',
  },
  couvreur: {
    title: 'Couverture & toiture',
    tagline: 'Isolation de toiture par l’extérieur, sarking et couverture éco-performante.',
  },
  plombier: {
    title: 'Plomberie performante',
    tagline: 'Chauffe-eau thermodynamique et solutions ECS économes en énergie.',
  },
  climaticien: {
    title: 'Climatisation réversible',
    tagline: 'Air/air réversible, multi-splits et PAC air/air éligibles aux primes CEE.',
  },
  ramoneur: {
    title: 'Ramonage certifié',
    tagline: 'Entretien annuel d’appareils bois, condition de maintien des aides.',
  },
  zingueur: {
    title: 'Zinguerie & couverture',
    tagline: 'Isolation de toiture, zinguerie et couverture performante.',
  },
  facadier: {
    title: 'Façade & ITE',
    tagline: 'Isolation thermique par l’extérieur et ravalement performant.',
  },
  platrier: {
    title: 'Plâtrerie & ITI',
    tagline: 'Isolation thermique par l’intérieur et cloisons à haute performance.',
  },
}

// Icône Lucide par service — associations visuelles stables et cohérentes
// avec la charte des pages énergie existantes.
const SERVICE_ICONS: Record<RgeAllowedService, React.ComponentType<{ className?: string }>> = {
  'pompe-a-chaleur': Leaf,
  'isolation-thermique': Home,
  chauffagiste: Flame,
  'panneaux-solaires': Sun,
  'renovation-energetique': Building2,
  electricien: Zap,
  menuisier: Hammer,
  couvreur: Home,
  plombier: Wrench,
  climaticien: Wind,
  ramoneur: Flame,
  zingueur: Home,
  facadier: PaintBucket,
  platrier: PaintBucket,
}

// FAQ éditoriale 100% unique, rédigée pour le hub /rge (pas de copier-coller
// des guides existants). Rigueur réglementaire : on cite les organismes
// accrédités COFRAC et les dispositifs en vigueur au 1er janvier 2026.
const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Qu’est-ce que la certification RGE exactement ?',
    answer:
      'RGE signifie « Reconnu Garant de l’Environnement ». C’est une mention délivrée par des organismes de qualification accrédités COFRAC (Qualibat, Qualit’EnR, Qualifelec, Certibat, OPQIBI) à des entreprises du bâtiment qui prouvent, preuves de formation et audits chantier à l’appui, leur maîtrise des travaux de rénovation énergétique. La mention est valable quatre ans, renouvelable, et fait l’objet de contrôles sur site périodiques. Sans qualification RGE active au moment de la signature du devis, aucune aide publique à la rénovation énergétique (MaPrimeRénov’, CEE, Éco-PTZ, TVA 5,5 %) n’est mobilisable.',
  },
  {
    question: 'Comment vérifier qu’un artisan est réellement RGE ?',
    answer:
      'Le référentiel officiel est l’annuaire France Rénov’ piloté par l’ADEME, consultable sur france-renov.gouv.fr. Il recense l’ensemble des entreprises titulaires d’une qualification RGE active avec leur SIRET, leurs domaines de travaux couverts et la date de fin de validité. Chez ServicesArtisans, notre moteur interne de vérification croise directement ce référentiel avec le SIRET de l’entreprise que vous voulez auditer : une recherche suffit pour savoir si la mention est en cours de validité, expirée ou inexistante. Ne vous contentez jamais d’un logo RGE imprimé sur un devis, c’est la première fraude rencontrée sur le terrain.',
  },
  {
    question: 'Quelles aides obtient-on en passant par un artisan RGE ?',
    answer:
      'Trois dispositifs majeurs sont conditionnés au recours à un professionnel RGE : MaPrimeRénov’ (aide directe de l’Anah, barème selon revenus et gains énergétiques), les Certificats d’Économies d’Énergie dits « primes CEE » (versés par les délégataires obligés, Effy, Sonergia, TotalEnergies, EDF, Engie) et le taux de TVA réduit à 5,5 % sur la main-d’œuvre et les matériaux énergétiques. S’y ajoutent l’Éco-PTZ (prêt à taux zéro jusqu’à 50 000 € pour une rénovation globale) et certaines aides locales (régions, départements, métropoles). La règle d’or : la qualification RGE doit être active à la date de signature du devis, pas au démarrage du chantier.',
  },
  {
    question: 'Quelle différence entre Qualibat, Qualit’EnR, Qualifelec ?',
    answer:
      'Ces trois organismes sont accrédités COFRAC pour délivrer la mention RGE, mais ils ne couvrent pas les mêmes métiers. Qualibat (le plus large) traite l’isolation thermique (ITE, ITI), la maçonnerie, la couverture et l’enveloppe du bâti via ses qualifications 7xxx et 8xxx. Qualit’EnR est dédié aux énergies renouvelables avec ses signatures QualiPAC (pompes à chaleur), QualiSol et QualiPV (solaire thermique et photovoltaïque), QualiBois (chauffage bois). Qualifelec cible les électriciens pour les bornes IRVE, le photovoltaïque et les solutions électriques performantes. Un artisan peut cumuler plusieurs qualifications s’il exerce plusieurs métiers — c’est courant pour les plaquistes ITE et les chauffagistes PAC.',
  },
  {
    question: 'Comment trouver un artisan RGE près de chez moi ?',
    answer:
      'Trois chemins complémentaires selon votre besoin. Pour une recherche par ville, utilisez nos annuaires dédiés /artisans-rge/[votre-ville] — ils affichent tous les artisans RGE actifs dans la commune, toutes spécialités confondues, synchronisés chaque semaine avec l’ADEME. Pour une recherche par métier ciblé, passez par /rge/[service]/[ville] (exemple : /rge/pompe-a-chaleur/lyon). Enfin, si vous connaissez déjà le nom de l’entreprise, notre vérificateur /verifier-artisan vous confirme en temps réel si sa mention RGE est en cours de validité. Dans tous les cas, comparez toujours au moins trois devis d’artisans RGE avant de signer : c’est la seule manière d’objectiver les prix et de détecter les anomalies techniques.',
  },
]

export const metadata: Metadata = {
  title: 'Artisans RGE certifiés : trouvez un pro',
  description:
    'Annuaire national artisans RGE actifs en France. Données ADEME officielles, mise à jour hebdo. Éligibles MaPrimeRénov’, CEE, TVA 5,5 %.',
  alternates: getAlternates('/rge'),
  openGraph: {
    locale: 'fr_FR',
    title: 'Artisans RGE certifiés en France — Annuaire officiel ADEME',
    description:
      'Tous les artisans RGE actifs en France, sourcés ADEME. MaPrimeRénov’, CEE, TVA 5,5 %. Vérification gratuite en temps réel.',
    url: PAGE_URL,
    siteName: 'ServicesArtisans',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artisans RGE certifiés en France',
    description:
      'Annuaire national des artisans RGE. Données ADEME, vérification gratuite, éligibles aux aides publiques.',
  },
}

export default async function RgeHubPage() {
  // Fail-open strict : si la DB est down ou pendant le build, on retombe sur
  // { totalActive: 0, topCities: [] }. Jamais de rendu cassé.
  // Fetch stats + dernière sync ADEME en parallèle. Fail-open sur les deux.
  const [stats, lastSyncDate] = await Promise.all([
    getRgeNationalStats().catch(() => ({
      totalActive: 0,
      topCities: [],
    })),
    getRgeLastSyncDate().catch(() => null),
  ])

  const totalActive = stats.totalActive || 0
  const topCities = stats.topCities.slice(0, 12)
  const hasStats = totalActive > 0

  const breadcrumbItems = [{ label: 'Accueil', href: '/' }, { label: 'Artisans RGE' }]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: PAGE_PATH },
  ])

  const rgeParts = RGE_ALLOWED_SERVICES.map((service) => ({
    url: `/rge/${service}`,
    name: `Artisans RGE ${service.replace(/-/g, ' ')}`,
  }))

  const collectionSchema = getCollectionPageSchema({
    name: 'Artisans RGE certifiés en France',
    description:
      'Annuaire national des artisans titulaires d’une qualification RGE active, sourcé depuis le référentiel ADEME. Éligibles MaPrimeRénov’, CEE et TVA réduite à 5,5 %.',
    url: PAGE_PATH,
    itemCount: totalActive,
    parts: rgeParts,
  })

  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: `${SITE_URL}/rge`,
    name: 'FAQ — Artisans RGE (Reconnu Garant Environnement)',
    includeSpeakable: true,
  })

  const jsonLdItems: Record<string, unknown>[] = [breadcrumbSchema, collectionSchema]
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Label officiel — Reconnu Garant de l&apos;Environnement
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-6xl font-extrabold leading-tight mb-5"
          >
            Artisans RGE certifiés en France
          </h1>
          <p className="text-lg md:text-xl text-emerald-50/90 max-w-3xl leading-relaxed">
            {hasStats ? (
              <>
                <strong className="text-white">
                  {totalActive.toLocaleString('fr-FR')} artisans RGE actifs
                </strong>{' '}
                sur tout le territoire, synchronisés chaque semaine depuis le référentiel officiel
                de l&apos;ADEME. Seule mention qui ouvre droit à MaPrimeRénov&apos;, aux primes CEE
                et à la TVA réduite à 5,5 %.
              </>
            ) : (
              <>
                L&apos;annuaire de référence des artisans titulaires d&apos;une qualification RGE
                active en France, synchronisé chaque semaine depuis le référentiel officiel de
                l&apos;ADEME. Seule mention qui ouvre droit à MaPrimeRénov&apos;, aux primes CEE et
                à la TVA réduite à 5,5 %.
              </>
            )}
          </p>
          {/* Freshness signal — MAX(providers.rge_last_synced_at) ; fail-open
              sur la date de rendu si la DB ne répond pas. */}
          <LastUpdated
            label="Données ADEME synchronisées le"
            date={lastSyncDate}
            className="mt-5 text-emerald-100/90"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/verifier-artisan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Trouver un artisan RGE
            </Link>
            <Link
              href="/guides/artisan-rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Comprendre la mention RGE
            </Link>
          </div>
        </div>
      </section>

      {/* Bloc stats nationales */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {hasStats ? totalActive.toLocaleString('fr-FR') : '—'}
            </div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Artisans RGE actifs recensés en France, qualifications en cours de validité au
              référentiel France Rénov&apos; ADEME.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {RGE_ALLOWED_SERVICES.length}
            </div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Métiers énergétiques couverts par la mention RGE : enveloppe du bâti, chauffage,
              énergies renouvelables, menuiserie performante.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">4</div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Organismes accrédités COFRAC délivrent la mention : Qualibat, Qualit&apos;EnR,
              Qualifelec, Certibat.
            </div>
          </div>
        </div>
      </section>

      {/* Bénéfices rapide */}
      {/* Bridge YMYL : RGE conditionne l'accès aux aides → cards cliquables
          vers /aides/[slug] (E-E-A-T signal + maillage thématique aides ↔ rge,
          audit maillage 2026-04-30). */}
      <section className="bg-emerald-50/60 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link
            href="/aides/maprimerenov"
            className="flex items-start gap-3 rounded-lg p-3 -m-3 hover:bg-emerald-100/60 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <FileCheck2
              className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-charcoal-900">MaPrimeRénov&apos;</div>
              <div className="text-sm text-charcoal-600">
                Aide directe de l&apos;Anah, réservée aux travaux réalisés par un artisan RGE actif.
              </div>
            </div>
          </Link>
          <Link
            href="/aides/cee"
            className="flex items-start gap-3 rounded-lg p-3 -m-3 hover:bg-emerald-100/60 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <FileCheck2
              className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-charcoal-900">Primes CEE</div>
              <div className="text-sm text-charcoal-600">
                Versées par les délégataires obligés (Effy, Sonergia, TotalEnergies, EDF).
              </div>
            </div>
          </Link>
          <Link
            href="/aides/tva-5-5"
            className="flex items-start gap-3 rounded-lg p-3 -m-3 hover:bg-emerald-100/60 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <Percent className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold text-charcoal-900">TVA à 5,5 %</div>
              <div className="text-sm text-charcoal-600">
                Taux réduit sur la main-d&apos;œuvre et les matériaux des travaux énergétiques.
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Grille des services RGE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
          Métiers énergétiques couverts par la mention RGE
        </h2>
        <p className="text-charcoal-600 max-w-3xl mb-10 leading-relaxed">
          Chaque domaine de travaux correspond à une qualification RGE spécifique, délivrée par un
          organisme accrédité. Cliquez sur un métier pour accéder aux artisans RGE actifs dans ce
          domaine, ville par ville.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RGE_ALLOWED_SERVICES.map((slug) => {
            const label = RGE_QUALIFICATION_LABELS[slug]
            const display = SERVICE_DISPLAY[slug]
            const Icon = SERVICE_ICONS[slug] ?? Leaf
            const linkTarget = topCities[0]
              ? `/rge/${slug}/${topCities[0].slug}`
              : `/services/${slug}`

            return (
              <Link
                key={slug}
                href={linkTarget}
                className="group p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition">
                    <Icon className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                      {display.title}
                    </h3>
                    {label && (
                      <div className="text-xs font-medium text-emerald-700 mt-0.5">
                        {label.label} — {label.organisme}
                      </div>
                    )}
                    <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                      {display.tagline}
                    </p>
                    <div className="text-sm font-semibold text-emerald-700 mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Voir les artisans <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Top villes */}
      {topCities.length > 0 && (
        <section className="bg-sand-50 border-y border-charcoal-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
              Les villes où trouver un artisan RGE
            </h2>
            <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
              Classement des villes françaises en fonction du nombre d&apos;artisans RGE actifs
              référencés. Chaque page ville affiche l&apos;annuaire complet, toutes spécialités
              confondues.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {topCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/artisans-rge/${city.slug}`}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition truncate">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-charcoal-900 tabular-nums ml-2">
                    {city.count.toLocaleString('fr-FR')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
          Questions fréquentes sur la mention RGE
        </h2>
        <p className="text-charcoal-600 mb-10 leading-relaxed">
          Tout ce qu&apos;il faut savoir avant de signer un devis de rénovation énergétique avec un
          artisan RGE.
        </p>
        <div className="space-y-4">
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-300 transition p-6"
            >
              <summary className="font-heading font-bold text-lg text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span className="text-emerald-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-charcoal-700 mt-4 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Guides RGE pratiques — devenir RGE, vérifier un RGE, tarifs audit */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
            Guides RGE pratiques
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
            Trois ressources opérationnelles&nbsp;: comment obtenir la qualification RGE, comment
            vérifier qu’un artisan est réellement qualifié, et combien coûte un audit énergétique
            réglementaire.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              href="/rge/comment-devenir-rge"
              className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                Comment devenir artisan RGE&nbsp;?
              </div>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Parcours complet de qualification (formation, audit, chantier témoin), coûts et
                délais pour chaque organisme.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Lire le guide <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/rge/fraude-rge-comment-verifier"
              className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                Détecter la fraude RGE
              </div>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Signaux d’alerte, vérification officielle France Rénov’ et recours en cas d’abus ou
                d’usurpation.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Vérifier un artisan <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/rge/tarifs-audit-energetique"
              className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Percent className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                Tarifs audit énergétique réglementaire
              </div>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Prix moyen par type de logement, conditions de prise en charge MaPrimeRénov’ et
                choix de l’auditeur.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Voir les tarifs <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Ressources complémentaires — cross-linking CEE / Qualifications / ADEME */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
          Aller plus loin
        </h2>
        <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
          Comprendre les primes CEE mobilisables, les qualifications RGE exigées et la source
          officielle des données que nous exposons.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/cee"
            className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <Percent className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
              Les 19 primes CEE résidentielles
            </div>
            <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Catalogue DGEC complet : PAC, isolation, poêle bois, chaudière biomasse, VMC. Montants
              2026 détaillés.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Explorer les primes CEE <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/rge/qualifications"
            className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
              Qualifications RGE officielles
            </div>
            <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              QualiPAC, QualiSol, QualiBois Air/Eau, Qualifelec&nbsp;: guides détaillés de chaque
              qualification et vérification.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Lire les guides <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/ademe"
            className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
              Source officielle ADEME
            </div>
            <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              165&nbsp;000 qualifications synchronisées chaque semaine avec l’annuaire France
              Rénov’. Méthodologie et attribution.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Voir la méthodologie <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/maprimerenov-cumulaison-cee"
            className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
              Cumul MaPrimeRénov’ &amp; CEE 2026
            </div>
            <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Règles de cumul, plafonds par profil et ordre d’imputation des aides pour chaque type
              de travaux.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Lire les règles <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* Primes CEE par opération — maillage RGE → CEE spécifiques */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 border-t border-charcoal-100">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
          Primes CEE accessibles aux artisans RGE
        </h2>
        <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
          Chaque opération CEE active en 2026 exige une qualification RGE spécifique. Consultez le
          guide officiel par opération : barème, plafonds, cumul MaPrimeRénov&apos;, procédure.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {CEE_OPERATIONS_WITH_GUIDE.map((code) => (
            <li key={code}>
              <Link
                href={`/cee/${code.toLowerCase()}/guide`}
                className="block px-4 py-3 rounded-xl border border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 transition text-sm"
              >
                <span className="font-bold text-emerald-900">{code}</span>
                <span className="text-charcoal-700 ml-2">
                  {CEE_SHORT_LABELS[code] ?? 'Opération CEE'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTAs finaux */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">
            Prêt à lancer vos travaux avec un artisan RGE ?
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Vérifiez la qualification d&apos;un artisan, demandez un devis gratuit et sans
            engagement, ou approfondissez le sujet avec nos guides éditoriaux.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/verifier-artisan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Vérifier un artisan
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/guides/artisan-rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Lire le guide RGE
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
