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
import { SITE_URL } from '@/lib/seo/config'
import { getBreadcrumbSchema, getCollectionPageSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getRgeNationalStats } from '@/lib/rge/guide-stats'
import { getRgeLastSyncDate } from '@/lib/rge/last-sync'
import LastUpdated from '@/components/seo/LastUpdated'
import {
  RGE_ALLOWED_SERVICES,
  RGE_QUALIFICATION_LABELS,
  type RgeAllowedService,
} from '@/lib/rge/service-city-listings'

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
    tagline: 'Aérothermie, géothermie et PAC hybrides — le poste n°1 de MaPrimeRénov\u2019.',
  },
  'isolation-thermique': {
    title: 'Isolation thermique',
    tagline:
      'ITE, ITI, combles perdus et planchers bas — la brique n°1 des économies d\u2019énergie.',
  },
  chauffagiste: {
    title: 'Chauffage performant',
    tagline: 'Chaudières biomasse, poêles à granulés, systèmes hybrides bas-carbone.',
  },
  'panneaux-solaires': {
    title: 'Panneaux solaires',
    tagline:
      'Photovoltaïque, solaire thermique et autoconsommation — prime à l\u2019investissement.',
  },
  'renovation-energetique': {
    title: 'Rénovation énergétique globale',
    tagline:
      'Accompagnement Mon Accompagnateur Rénov\u2019 et parcours MaPrimeRénov\u2019 Parcours Accompagné.',
  },
  electricien: {
    title: 'Électricien RGE',
    tagline: 'Bornes de recharge IRVE, intégration photovoltaïque et pilotage énergétique.',
  },
  menuisier: {
    title: 'Menuiserie performante',
    tagline:
      'Remplacement de fenêtres, portes d\u2019entrée et baies à haute performance thermique.',
  },
  couvreur: {
    title: 'Couverture & toiture',
    tagline: 'Isolation de toiture par l\u2019extérieur, sarking et couverture éco-performante.',
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
    tagline: 'Entretien annuel d\u2019appareils bois, condition de maintien des aides.',
  },
  zingueur: {
    title: 'Zinguerie & couverture',
    tagline: 'Isolation de toiture, zinguerie et couverture performante.',
  },
  facadier: {
    title: 'Façade & ITE',
    tagline: 'Isolation thermique par l\u2019extérieur et ravalement performant.',
  },
  platrier: {
    title: 'Plâtrerie & ITI',
    tagline: 'Isolation thermique par l\u2019intérieur et cloisons à haute performance.',
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
    question: 'Qu\u2019est-ce que la certification RGE exactement ?',
    answer:
      'RGE signifie « Reconnu Garant de l\u2019Environnement ». C\u2019est une mention délivrée par des organismes de qualification accrédités COFRAC (Qualibat, Qualit\u2019EnR, Qualifelec, Certibat, Eco Artisan) à des entreprises du bâtiment qui prouvent, preuves de formation et audits chantier à l\u2019appui, leur maîtrise des travaux de rénovation énergétique. La mention est valable quatre ans, renouvelable, et fait l\u2019objet de contrôles sur site périodiques. Sans qualification RGE active au moment de la signature du devis, aucune aide publique à la rénovation énergétique (MaPrimeRénov\u2019, CEE, Éco-PTZ, TVA 5,5 %) n\u2019est mobilisable.',
  },
  {
    question: 'Comment vérifier qu\u2019un artisan est réellement RGE ?',
    answer:
      'Le référentiel officiel est l\u2019annuaire France Rénov\u2019 piloté par l\u2019ADEME, consultable sur france-renov.gouv.fr. Il recense l\u2019ensemble des entreprises titulaires d\u2019une qualification RGE active avec leur SIRET, leurs domaines de travaux couverts et la date de fin de validité. Chez ServicesArtisans, notre moteur interne de vérification croise directement ce référentiel avec le SIRET de l\u2019entreprise que vous voulez auditer : une recherche suffit pour savoir si la mention est en cours de validité, expirée ou inexistante. Ne vous contentez jamais d\u2019un logo RGE imprimé sur un devis, c\u2019est la première fraude rencontrée sur le terrain.',
  },
  {
    question: 'Quelles aides obtient-on en passant par un artisan RGE ?',
    answer:
      'Trois dispositifs majeurs sont conditionnés au recours à un professionnel RGE : MaPrimeRénov\u2019 (aide directe de l\u2019Anah, barème selon revenus et gains énergétiques), les Certificats d\u2019Économies d\u2019Énergie dits « primes CEE » (versés par les délégataires obligés, Effy, Sonergia, TotalEnergies, EDF, Engie) et le taux de TVA réduit à 5,5 % sur la main-d\u2019œuvre et les matériaux énergétiques. S\u2019y ajoutent l\u2019Éco-PTZ (prêt à taux zéro jusqu\u2019à 50 000 € pour une rénovation globale) et certaines aides locales (régions, départements, métropoles). La règle d\u2019or : la qualification RGE doit être active à la date de signature du devis, pas au démarrage du chantier.',
  },
  {
    question: 'Quelle différence entre Qualibat, Qualit\u2019EnR, Qualifelec ?',
    answer:
      'Ces trois organismes sont accrédités COFRAC pour délivrer la mention RGE, mais ils ne couvrent pas les mêmes métiers. Qualibat (le plus large) traite l\u2019isolation thermique (ITE, ITI), la maçonnerie, la couverture et l\u2019enveloppe du bâti via ses qualifications 7xxx et 8xxx. Qualit\u2019EnR est dédié aux énergies renouvelables avec ses signatures QualiPAC (pompes à chaleur), QualiSol et QualiPV (solaire thermique et photovoltaïque), Qualibois (chauffage bois). Qualifelec cible les électriciens pour les bornes IRVE, le photovoltaïque et les solutions électriques performantes. Un artisan peut cumuler plusieurs qualifications s\u2019il exerce plusieurs métiers — c\u2019est courant pour les plaquistes ITE et les chauffagistes PAC.',
  },
  {
    question: 'Comment trouver un artisan RGE près de chez moi ?',
    answer:
      'Trois chemins complémentaires selon votre besoin. Pour une recherche par ville, utilisez nos annuaires dédiés /artisans-rge/[votre-ville] — ils affichent tous les artisans RGE actifs dans la commune, toutes spécialités confondues, synchronisés chaque semaine avec l\u2019ADEME. Pour une recherche par métier ciblé, passez par /rge/[service]/[ville] (exemple : /rge/pompe-a-chaleur/lyon). Enfin, si vous connaissez déjà le nom de l\u2019entreprise, notre vérificateur /verifier-artisan vous confirme en temps réel si sa mention RGE est en cours de validité. Dans tous les cas, comparez toujours au moins trois devis d\u2019artisans RGE avant de signer : c\u2019est la seule manière d\u2019objectiver les prix et de détecter les anomalies techniques.',
  },
]

export const metadata: Metadata = {
  title: 'Artisans RGE certifiés : trouvez un pro près de chez vous',
  description:
    'Annuaire national des artisans RGE actifs en France. Données ADEME officielles, mise à jour hebdomadaire. Éligibles MaPrimeRénov\u2019, CEE, TVA 5,5 %. Vérification gratuite.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    locale: 'fr_FR',
    title: 'Artisans RGE certifiés en France — Annuaire officiel ADEME',
    description:
      'Tous les artisans RGE actifs en France, sourcés ADEME. MaPrimeRénov\u2019, CEE, TVA 5,5 %. Vérification gratuite en temps réel.',
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

  const collectionSchema = getCollectionPageSchema({
    name: 'Artisans RGE certifiés en France',
    description:
      'Annuaire national des artisans titulaires d\u2019une qualification RGE active, sourcé depuis le référentiel ADEME. Éligibles MaPrimeRénov\u2019, CEE et TVA réduite à 5,5 %.',
    url: PAGE_PATH,
    itemCount: totalActive,
  })

  const faqSchema = getFAQSchema(FAQ)

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Label officiel — Reconnu Garant de l&apos;Environnement
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight mb-5">
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
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {hasStats ? totalActive.toLocaleString('fr-FR') : '—'}
            </div>
            <div className="text-sm text-slate-600 mt-2 leading-relaxed">
              Artisans RGE actifs recensés en France, qualifications en cours de validité au
              référentiel France Rénov&apos; ADEME.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {RGE_ALLOWED_SERVICES.length}
            </div>
            <div className="text-sm text-slate-600 mt-2 leading-relaxed">
              Métiers énergétiques couverts par la mention RGE : enveloppe du bâti, chauffage,
              énergies renouvelables, menuiserie performante.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">4</div>
            <div className="text-sm text-slate-600 mt-2 leading-relaxed">
              Organismes accrédités COFRAC délivrent la mention : Qualibat, Qualit&apos;EnR,
              Qualifelec, Certibat.
            </div>
          </div>
        </div>
      </section>

      {/* Bénéfices rapide */}
      <section className="bg-emerald-50/60 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-start gap-3">
            <FileCheck2
              className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-slate-900">MaPrimeRénov&apos;</div>
              <div className="text-sm text-slate-600">
                Aide directe de l&apos;Anah, réservée aux travaux réalisés par un artisan RGE actif.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileCheck2
              className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-slate-900">Primes CEE</div>
              <div className="text-sm text-slate-600">
                Versées par les délégataires obligés (Effy, Sonergia, TotalEnergies, EDF).
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Percent className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold text-slate-900">TVA à 5,5 %</div>
              <div className="text-sm text-slate-600">
                Taux réduit sur la main-d&apos;œuvre et les matériaux des travaux énergétiques.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grille des services RGE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-slate-900 mb-3">
          Métiers énergétiques couverts par la mention RGE
        </h2>
        <p className="text-slate-600 max-w-3xl mb-10 leading-relaxed">
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
                className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition">
                    <Icon className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition">
                      {display.title}
                    </h3>
                    {label && (
                      <div className="text-xs font-medium text-emerald-700 mt-0.5">
                        {label.label} — {label.organisme}
                      </div>
                    )}
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{display.tagline}</p>
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
        <section className="bg-slate-50 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-slate-900 mb-3">
              Les villes où trouver un artisan RGE
            </h2>
            <p className="text-slate-600 max-w-3xl mb-8 leading-relaxed">
              Classement des villes françaises en fonction du nombre d&apos;artisans RGE actifs
              référencés. Chaque page ville affiche l&apos;annuaire complet, toutes spécialités
              confondues.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {topCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/artisans-rge/${city.slug}`}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-slate-900 group-hover:text-emerald-700 transition truncate">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-500 tabular-nums ml-2">
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
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-slate-900 mb-3">
          Questions fréquentes sur la mention RGE
        </h2>
        <p className="text-slate-600 mb-10 leading-relaxed">
          Tout ce qu&apos;il faut savoir avant de signer un devis de rénovation énergétique avec un
          artisan RGE.
        </p>
        <div className="space-y-4">
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition p-6"
            >
              <summary className="font-heading font-bold text-lg text-slate-900 cursor-pointer list-none flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span className="text-emerald-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-slate-700 mt-4 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Guides RGE pratiques — devenir RGE, v\u00e9rifier un RGE, tarifs audit */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Guides RGE pratiques
          </h2>
          <p className="text-slate-600 max-w-3xl mb-8 leading-relaxed">
            Trois ressources op&eacute;rationnelles&nbsp;: comment obtenir la qualification RGE,
            comment v&eacute;rifier qu&rsquo;un artisan est r&eacute;ellement qualifi&eacute;, et
            combien co&ucirc;te un audit &eacute;nerg&eacute;tique r&eacute;glementaire.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              href="/rge/comment-devenir-rge"
              className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition">
                Comment devenir artisan RGE&nbsp;?
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Parcours complet de qualification (formation, audit, chantier t&eacute;moin),
                co&ucirc;ts et d&eacute;lais pour chaque organisme.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Lire le guide <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/rge/fraude-rge-comment-verifier"
              className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition">
                D&eacute;tecter la fraude RGE
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Signaux d&rsquo;alerte, v&eacute;rification officielle France R&eacute;nov&rsquo; et
                recours en cas d&rsquo;abus ou d&rsquo;usurpation.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                V&eacute;rifier un artisan <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/rge/tarifs-audit-energetique"
              className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Percent className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition">
                Tarifs audit &eacute;nerg&eacute;tique r&eacute;glementaire
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Prix moyen par type de logement, conditions de prise en charge
                MaPrimeR&eacute;nov&rsquo; et choix de l&rsquo;auditeur.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Voir les tarifs <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Ressources compl\u00e9mentaires — cross-linking CEE / Qualifications / ADEME */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
          Aller plus loin
        </h2>
        <p className="text-slate-600 max-w-3xl mb-8 leading-relaxed">
          Comprendre les primes CEE mobilisables, les qualifications RGE exig&eacute;es et la source
          officielle des donn&eacute;es que nous exposons.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/cee"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <Percent className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition">
              Les 19 primes CEE r&eacute;sidentielles
            </div>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Catalogue DGEC complet : PAC, isolation, poêle bois, chaudi&egrave;re biomasse, VMC.
              Montants 2026 d&eacute;taill&eacute;s.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Explorer les primes CEE <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/rge/qualifications"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition">
              Qualifications RGE officielles
            </div>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              QualiPAC, QualiSol, QualiBois Air/Eau, Qualifelec&nbsp;: guides
              d&eacute;taill&eacute;s de chaque qualification et v&eacute;rification.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Lire les guides <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/ademe"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition">
              Source officielle ADEME
            </div>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              165&nbsp;000 qualifications synchronis&eacute;es chaque semaine avec l&rsquo;annuaire
              France R&eacute;nov&rsquo;. M&eacute;thodologie et attribution.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Voir la m&eacute;thodologie <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/maprimerenov-cumulaison-cee"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition">
              Cumul MaPrimeR&eacute;nov&rsquo; &amp; CEE 2026
            </div>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              R&egrave;gles de cumul, plafonds par profil et ordre d&rsquo;imputation des aides pour
              chaque type de travaux.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Lire les r&egrave;gles <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>
        </div>
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
