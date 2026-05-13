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
  PlugZap,
  Thermometer,
  ClipboardCheck,
  Square,
  Sparkles,
  Award,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getCollectionPageSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getRgeNationalStats } from '@/lib/rge/guide-stats'
import { getRgeLastSyncDate } from '@/lib/rge/last-sync'
import { logger } from '@/lib/logger'
import LastUpdated from '@/components/seo/LastUpdated'
import {
  RGE_ALLOWED_SERVICES,
  RGE_QUALIFICATION_LABELS,
  type RgeAllowedService,
} from '@/lib/rge/service-city-listings'
import { CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'
import { CEE_SHORT_LABELS } from '@/lib/cee/shared-labels'
import { RGE_DEEP_LINK_CARDS } from '@/lib/seo/rge-deep-link-cards'

export const revalidate = 86400

const PAGE_PATH = '/rge'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`

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
  'borne-recharge': {
    title: 'Borne de recharge IRVE',
    tagline: 'Installateurs Qualifelec IRVE (P1/P2/P3) — bornes maison, copro et entreprise.',
  },
  'chauffe-eau-thermodynamique': {
    title: 'Chauffe-eau thermodynamique',
    tagline: 'QualiPAC module CET — éligible MaPrimeRénov’ et prime CEE BAR-TH-148.',
  },
  'audit-energetique': {
    title: 'Audit énergétique',
    tagline:
      'Architectes CNOA et bureaux d’études OPQIBI 1905/1911 — entrée du parcours rénovation.',
  },
  ventilation: {
    title: 'Ventilation (VMC)',
    tagline: 'VMC simple flux hygroréglable et double flux haute performance (BAR-TH-125).',
  },
  fenetres: {
    title: 'Fenêtres performantes',
    tagline: 'Remplacement de fenêtres et baies isolantes éligibles MaPrimeRénov’ (BAR-EN-104).',
  },
}

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
  'borne-recharge': PlugZap,
  'chauffe-eau-thermodynamique': Thermometer,
  'audit-energetique': ClipboardCheck,
  ventilation: Wind,
  fenetres: Square,
}

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
  {
    question: 'Qu’est-ce qu’un artisan RGE certifié ?',
    answer:
      'Un artisan RGE certifié est une entreprise du bâtiment qui détient une qualification active délivrée par un organisme accrédité COFRAC (Qualibat, Qualit’EnR, Qualifelec, Certibat, OPQIBI). Cette qualification atteste de trois éléments : une formation technique attestée du dirigeant ou d’un référent technique salarié, une assurance responsabilité civile professionnelle décennale couvrant les travaux de rénovation énergétique, et au moins un audit chantier réalisé par l’organisme certificateur dans les deux premières années. La qualification est nominative à l’entreprise (SIRET) et restreinte à des domaines précis : un artisan RGE pour les pompes à chaleur (QualiPAC) n’est pas automatiquement RGE pour l’isolation par l’extérieur (Qualibat 7141). Vérifiez toujours que la qualification correspond exactement aux travaux que vous voulez engager.',
  },
  {
    question: 'Qu’est-ce que l’annuaire RGE et où le consulter ?',
    answer:
      'L’annuaire RGE est le référentiel public listant l’ensemble des entreprises du bâtiment titulaires d’une qualification RGE active en France. La source officielle est l’annuaire France Rénov’ piloté par l’ADEME, accessible sur france-renov.gouv.fr. Notre annuaire ServicesArtisans synchronise ce référentiel chaque semaine et l’enrichit : recherche par ville (/artisans-rge/[ville]), par métier énergétique (/rge/[service]), par qualification (/rge/qualifications), affichage du SIRET vérifié auprès de l’INSEE, des dates de fin de validité par qualification, des organismes certificateurs et de l’historique des renouvellements. Cette double source (ADEME officiel + croisement INSEE) permet de détecter les fausses mentions RGE — première source de fraude observée sur les devis particuliers.',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getRgeNationalStats().catch(() => ({ totalActive: 0, topCities: [] }))
  const totalActive = stats.totalActive || 0

  const title = 'Annuaire artisan RGE 2026 : trouver un pro certifié — ADEME'
  const description =
    totalActive > 0
      ? `Trouvez parmi ${totalActive.toLocaleString('fr-FR')} artisans RGE certifiés en France. Vérification ADEME en 1 clic, devis gratuit, éligibles MaPrimeRénov', CEE, TVA 5,5 %.`
      : 'Annuaire national des artisans RGE certifiés. Données ADEME officielles, vérification en 1 clic, éligibles MaPrimeRénov’, CEE, TVA 5,5 %.'

  return {
    title,
    description,
    alternates: getAlternates('/rge'),
    openGraph: {
      locale: 'fr_FR',
      title,
      description,
      url: PAGE_URL,
      siteName: 'ServicesArtisans',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function RgeHubPage() {
  const [stats, lastSyncDate] = await Promise.all([
    getRgeNationalStats().catch((err: unknown) => {
      logger.error('rge_hub.national_stats_error', err as Error, { route: 'rge' })
      return { totalActive: 0, topCities: [] }
    }),
    getRgeLastSyncDate().catch((err: unknown) => {
      logger.error('rge_hub.last_sync_error', err as Error, { route: 'rge' })
      return null
    }),
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

  const totalFmt = totalActive.toLocaleString('fr-FR')

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={jsonLdItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* HERO — vert forêt façon Hellio, gros titre, stats à droite */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
        <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent-400/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-secondary-500/10 blur-3xl" />
          </div>

          <div className="relative px-6 md:px-12 lg:px-16 py-16 md:py-24">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-sm font-medium text-white/90 mb-6">
                  <ShieldCheck className="w-4 h-4 text-secondary-300" aria-hidden="true" />
                  Label officiel — Reconnu Garant de l&apos;Environnement
                </span>

                <h1
                  data-speakable="true"
                  className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6"
                >
                  Artisans RGE certifiés
                  <br className="hidden md:block" />{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 via-secondary-400 to-primary-300">
                    en France.
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-accent-100/95 leading-relaxed max-w-2xl mb-6">
                  {hasStats ? (
                    <>
                      <strong className="text-white">{totalFmt} artisans RGE actifs</strong> sur
                      tout le territoire, synchronisés chaque semaine depuis le référentiel officiel
                      de l&apos;ADEME. Seule mention qui ouvre droit à MaPrimeRénov&apos;, aux
                      primes CEE et à la TVA réduite à 5,5 %.
                    </>
                  ) : (
                    <>
                      L&apos;annuaire de référence des artisans titulaires d&apos;une qualification
                      RGE active en France, synchronisé chaque semaine depuis le référentiel
                      officiel de l&apos;ADEME. Seule mention qui ouvre droit à MaPrimeRénov&apos;,
                      aux primes CEE et à la TVA réduite à 5,5 %.
                    </>
                  )}
                </p>

                <LastUpdated
                  label="Données ADEME synchronisées le"
                  date={lastSyncDate}
                  className="mb-8 text-accent-100/90"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/verifier-artisan"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white text-accent-800 font-bold shadow-cta hover:bg-accent-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-accent-700 focus-visible:ring-white"
                  >
                    <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                    Vérifier un artisan RGE
                  </Link>
                  <Link
                    href="/devis"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-secondary-500 hover:bg-secondary-400 text-charcoal-900 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-accent-700 focus-visible:ring-secondary-300"
                  >
                    Devis gratuit
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Stats column */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3 md:gap-4">
                <div className="col-span-2 rounded-3xl bg-white/8 backdrop-blur-sm border border-white/10 p-7">
                  <Award className="w-6 h-6 text-secondary-300 mb-3" aria-hidden="true" />
                  <div className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                    {hasStats ? totalFmt : '—'}
                  </div>
                  <div className="text-sm text-accent-100/85 mt-2 leading-relaxed">
                    Artisans RGE actifs recensés en France au référentiel France Rénov&apos; ADEME.
                  </div>
                </div>
                <div className="rounded-3xl bg-white/8 backdrop-blur-sm border border-white/10 p-6">
                  <div className="font-heading text-3xl font-extrabold text-white tracking-tight">
                    {RGE_ALLOWED_SERVICES.length}
                  </div>
                  <div className="text-xs text-accent-100/85 mt-1.5 leading-snug">
                    Métiers énergétiques couverts
                  </div>
                </div>
                <div className="rounded-3xl bg-white/8 backdrop-blur-sm border border-white/10 p-6">
                  <div className="font-heading text-3xl font-extrabold text-white tracking-tight">
                    4
                  </div>
                  <div className="text-xs text-accent-100/85 mt-1.5 leading-snug">
                    Organismes COFRAC accrédités
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AIDES BRIDGE — 3 cartes blanches sur sand */}
      <section className="bg-sand-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-accent-600 tracking-[0.18em] uppercase mb-3">
              Aides débloquées
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900 mb-4">
              Trois dispositifs réservés aux artisans RGE.
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              La qualification RGE active à la signature du devis conditionne l&apos;accès aux aides
              publiques majeures.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                href: '/aides/maprimerenov',
                Icon: FileCheck2,
                title: "MaPrimeRénov'",
                desc: "Aide directe de l'Anah, barème selon revenus, réservée aux travaux réalisés par un artisan RGE actif.",
              },
              {
                href: '/aides/cee',
                Icon: Sparkles,
                title: 'Primes CEE',
                desc: 'Versées par les délégataires obligés (Effy, Sonergia, TotalEnergies, EDF, Engie).',
              },
              {
                href: '/aides/tva-5-5',
                Icon: Percent,
                title: 'TVA à 5,5 %',
                desc: "Taux réduit appliqué sur la main-d'œuvre et les matériaux des travaux énergétiques.",
              },
            ].map(({ href, Icon, title, desc }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-3xl bg-white border border-sand-200 p-7 hover:border-accent-300 hover:shadow-card-hover hover:-trancharcoal-y-0.5 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mb-5"
                  aria-hidden="true"
                >
                  <Icon className="w-6 h-6 text-accent-700" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900 group-hover:text-accent-700 transition-colors mb-2">
                  {title}
                </h3>
                <p className="text-sm text-charcoal-500 leading-relaxed">{desc}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 group-hover:gap-2.5 transition-all">
                  En savoir plus <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MÉTIERS ÉNERGÉTIQUES — bento aéré */}
      <section className="bg-white py-20 md:py-24 border-y border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <span className="inline-block text-xs font-bold text-accent-600 tracking-[0.18em] uppercase mb-3">
              Métiers couverts
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-charcoal-900 mb-5">
              {RGE_ALLOWED_SERVICES.length} métiers énergétiques sous mention RGE.
            </h2>
            <p className="text-lg text-charcoal-600 leading-relaxed">
              Chaque domaine de travaux correspond à une qualification spécifique délivrée par un
              organisme accrédité. Cliquez sur un métier pour accéder aux artisans RGE actifs ville
              par ville.
            </p>
          </div>

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
                  className="group rounded-3xl bg-sand-50 border border-sand-200 p-7 hover:bg-white hover:border-accent-300 hover:shadow-card-hover hover:-trancharcoal-y-0.5 transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center mb-5 group-hover:bg-accent-200 transition-colors"
                    aria-hidden="true"
                  >
                    <Icon className="w-6 h-6 text-accent-700" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-charcoal-900 group-hover:text-accent-700 transition-colors mb-2">
                    {display.title}
                  </h3>
                  {label && (
                    <div className="text-xs font-semibold text-accent-600 mb-2.5 uppercase tracking-wider">
                      {label.label} · {label.organisme}
                    </div>
                  )}
                  <p className="text-sm text-charcoal-500 leading-relaxed">{display.tagline}</p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 group-hover:gap-2.5 transition-all">
                    Voir les artisans <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* TOP VILLES — bandeau aéré */}
      {topCities.length > 0 && (
        <section className="bg-sand-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 mb-12 items-end">
              <div className="lg:col-span-7">
                <span className="inline-block text-xs font-bold text-accent-600 tracking-[0.18em] uppercase mb-3">
                  Top villes
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900">
                  Les villes où trouver un artisan RGE.
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-charcoal-600 leading-relaxed">
                  Classement par nombre d&apos;artisans RGE actifs référencés. Chaque page ville
                  affiche l&apos;annuaire complet, toutes spécialités confondues.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {topCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/artisans-rge/${city.slug}`}
                  className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-sand-200 hover:border-accent-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="w-4 h-4 text-accent-600 flex-shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-charcoal-900 group-hover:text-accent-700 transition-colors truncate">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-charcoal-700 tabular-nums ml-2">
                    {city.count.toLocaleString('fr-FR')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ — bento clair */}
      <section className="bg-white border-y border-sand-200 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-accent-600 tracking-[0.18em] uppercase mb-3">
              FAQ
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900 mb-4">
              Questions fréquentes sur la mention RGE.
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Tout ce qu&apos;il faut savoir avant de signer un devis de rénovation énergétique avec
              un artisan RGE.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-3xl bg-sand-50 border border-sand-200 hover:border-accent-200 transition-colors"
              >
                <summary className="flex items-start justify-between gap-4 px-7 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-heading text-base md:text-lg font-bold text-charcoal-900 leading-snug">
                    {item.question}
                  </span>
                  <span
                    className="text-accent-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="px-7 pb-6 -mt-1 text-charcoal-600 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES PRATIQUES */}
      <section className="bg-sand-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="inline-block text-xs font-bold text-accent-600 tracking-[0.18em] uppercase mb-3">
              Guides RGE pratiques
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900 mb-4">
              Trois ressources opérationnelles.
            </h2>
            <p className="text-lg text-charcoal-600 leading-relaxed">
              Comment obtenir la qualification RGE, comment vérifier qu&apos;un artisan est
              réellement qualifié, et combien coûte un audit énergétique réglementaire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                href: '/rge/comment-devenir-rge',
                Icon: Wrench,
                title: 'Comment devenir artisan RGE ?',
                desc: 'Parcours complet de qualification (formation, audit, chantier témoin), coûts et délais pour chaque organisme.',
                cta: 'Lire le guide',
              },
              {
                href: '/rge/fraude-rge-comment-verifier',
                Icon: ShieldCheck,
                title: 'Détecter la fraude RGE',
                desc: "Signaux d'alerte, vérification officielle France Rénov' et recours en cas d'abus ou d'usurpation.",
                cta: 'Vérifier un artisan',
              },
              {
                href: '/rge/tarifs-audit-energetique',
                Icon: Percent,
                title: 'Tarifs audit énergétique',
                desc: "Prix moyen par type de logement, conditions de prise en charge MaPrimeRénov' et choix de l'auditeur.",
                cta: 'Voir les tarifs',
              },
            ].map(({ href, Icon, title, desc, cta }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-3xl bg-white border border-sand-200 p-7 hover:border-accent-300 hover:shadow-card-hover hover:-trancharcoal-y-0.5 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mb-5"
                  aria-hidden="true"
                >
                  <Icon className="w-6 h-6 text-accent-700" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900 group-hover:text-accent-700 transition-colors mb-2">
                  {title}
                </h3>
                <p className="text-sm text-charcoal-500 leading-relaxed">{desc}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 group-hover:gap-2.5 transition-all">
                  {cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RESSOURCES — cross-linking */}
      <section className="bg-white border-y border-sand-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-accent-600 tracking-[0.18em] uppercase mb-3">
              Aller plus loin
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900 mb-4">
              Comprendre les primes, qualifications et sources.
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Les primes CEE mobilisables, les qualifications RGE exigées et la source officielle
              des données.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                href: '/cee',
                Icon: Percent,
                title: 'Les 19 primes CEE',
                desc: 'Catalogue DGEC complet : PAC, isolation, poêle bois, chaudière biomasse, VMC. Montants 2026 détaillés.',
                cta: 'Explorer les primes',
              },
              {
                href: '/rge/qualifications',
                Icon: FileCheck2,
                title: 'Qualifications RGE',
                desc: 'QualiPAC, QualiSol, QualiBois, Qualifelec : guides détaillés de chaque qualification et vérification.',
                cta: 'Lire les guides',
              },
              {
                href: '/ademe',
                Icon: ShieldCheck,
                title: 'Source officielle ADEME',
                desc: '165 000 qualifications synchronisées chaque semaine avec l’annuaire France Rénov’. Méthodologie.',
                cta: 'Voir la méthodologie',
              },
              {
                href: '/maprimerenov-cumulaison-cee',
                Icon: FileCheck2,
                title: 'Cumul MaPrimeRénov’ & CEE',
                desc: 'Règles de cumul, plafonds par profil et ordre d’imputation des aides pour chaque type de travaux.',
                cta: 'Lire les règles',
              },
            ].map(({ href, Icon, title, desc, cta }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-3xl bg-sand-50 border border-sand-200 p-6 hover:bg-white hover:border-accent-300 hover:shadow-card-hover transition-all duration-300"
              >
                <div
                  className="w-11 h-11 rounded-2xl bg-accent-100 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5 text-accent-700" />
                </div>
                <h3 className="font-heading text-base font-bold text-charcoal-900 group-hover:text-accent-700 transition-colors mb-2">
                  {title}
                </h3>
                <p className="text-sm text-charcoal-500 leading-relaxed">{desc}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 group-hover:gap-2.5 transition-all">
                  {cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRIMES CEE LISTE */}
      <section className="bg-sand-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="inline-block text-xs font-bold text-accent-600 tracking-[0.18em] uppercase mb-3">
              Primes CEE 2026
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900 mb-4">
              Primes CEE accessibles aux artisans RGE.
            </h2>
            <p className="text-lg text-charcoal-600 leading-relaxed">
              Chaque opération CEE active en 2026 exige une qualification RGE spécifique. Consultez
              le guide officiel par opération&nbsp;: barème, plafonds, cumul MaPrimeRénov&apos;,
              procédure.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CEE_OPERATIONS_WITH_GUIDE.map((code) => (
              <li key={code}>
                <Link
                  href={`/cee/${code.toLowerCase()}/guide`}
                  className="block px-5 py-4 rounded-2xl border border-sand-200 bg-white hover:border-accent-300 hover:bg-accent-50/40 transition-all"
                >
                  <span className="font-bold text-accent-800 text-sm">{code}</span>
                  <span className="text-charcoal-700 ml-2 text-sm">
                    {CEE_SHORT_LABELS[code] ?? 'Opération CEE'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DEEP-LINK CARDS */}
      <section className="bg-white border-y border-sand-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="inline-block text-xs font-bold text-accent-600 tracking-[0.18em] uppercase mb-3">
              Approfondir
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900 mb-4">
              Six guides courts pour comprendre.
            </h2>
            <p className="text-lg text-charcoal-600 leading-relaxed">
              Techniques, prix et conditions d&apos;aides des grands postes de rénovation
              énergétique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {RGE_DEEP_LINK_CARDS.map((card) => (
              <Link
                key={`${card.serviceSlug}-${card.anchorId}`}
                href={`/services/${card.serviceSlug}#${card.anchorId}`}
                className="group rounded-3xl bg-sand-50 border border-sand-200 p-6 hover:bg-white hover:border-accent-300 hover:shadow-card-hover transition-all duration-300"
              >
                <h3 className="font-heading text-base font-bold text-charcoal-900 group-hover:text-accent-700 transition-colors mb-2 leading-snug">
                  {card.label}
                </h3>
                <p className="text-sm text-charcoal-500 leading-relaxed">{card.hint}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 group-hover:gap-2.5 transition-all">
                  Lire la section <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-accent-700 to-accent-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-400/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-400/20 blur-3xl" />
          </div>
          <div className="relative px-6 md:px-12 lg:px-20 py-16 md:py-20 text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
              Prêt à lancer vos travaux avec un artisan RGE&nbsp;?
            </h2>
            <p className="text-lg text-accent-100/95 max-w-2xl mx-auto leading-relaxed mb-10">
              Vérifiez la qualification d&apos;un artisan, demandez un devis gratuit et sans
              engagement, ou approfondissez le sujet avec nos guides éditoriaux.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/verifier-artisan"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white text-accent-800 font-bold shadow-cta hover:bg-accent-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-accent-700 focus-visible:ring-white"
              >
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                Vérifier un artisan
              </Link>
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-secondary-500 hover:bg-secondary-400 text-charcoal-900 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-accent-700 focus-visible:ring-secondary-300"
              >
                Demander un devis
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="/guides/artisan-rge"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                Lire le guide RGE
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
