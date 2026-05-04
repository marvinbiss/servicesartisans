import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Scale,
  Sparkles,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Info,
  Wind,
  Snowflake,
  Droplet,
  Thermometer,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import { aidesCatalog } from '@/lib/aides/aides-catalog'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'

/**
 * /aides/pompe-a-chaleur-aides-comparatif — Sprint AI Wave L 2026-05-03.
 *
 * Comparator des aides 2026 par TYPE de pompe à chaleur (air-eau, air-air,
 * géothermique, hybride). Volume Ahrefs estimé "aide pompe à chaleur 2026"
 * 3-5K req/mois + variantes (PAC air-eau aides, géothermie subvention…).
 *
 * Different angle than /guides/pompe-a-chaleur-cee-maprimerenov-2026 (guide
 * pédagogique) : ici on tabule LES AIDES par type de PAC pour décider AVANT
 * achat (montant MPR, montant CEE, Coup de pouce éligible OUI/NON, plafond
 * éco-PTZ par geste).
 *
 * Auteur : claire-dubois (YMYL aides financières publiques).
 */

export const revalidate = 86400

const PATH = '/aides/pompe-a-chaleur-aides-comparatif'
const PAGE_URL = `${SITE_URL}${PATH}`
const PUBLISHED_AT = '2026-05-03'
const REVIEWED_AT = '2026-05-03'
const AUTHOR = authors['claire-dubois']
const REVIEWER = getReviewerForAuthor(AUTHOR)

const TITLE = 'Aides pompe à chaleur 2026 : montants par type de PAC'
const DESCRIPTION =
  "Aides PAC 2026 par type : air-eau, air-air, géothermie, hybride. Montants MaPrimeRénov', CEE, Coup de pouce, éco-PTZ. Tableau comparatif officiel + cumul total."

type PacType = {
  slug: string
  name: string
  icon: typeof Wind
  cop: string
  prixMoyen: string
  ideal: string
  mprMontant: string
  ceeMontant: string
  coupDePouceEligible: boolean
  ecoPtzPlafond: string
  cumulMaxModeste: string
  qualifRge: string
  notes: string
}

const PAC_TYPES: PacType[] = [
  {
    slug: 'air-eau',
    name: 'PAC air-eau',
    icon: Wind,
    cop: '3,0 à 4,5',
    prixMoyen: '12 000 - 18 000 €',
    ideal: 'Maison individuelle avec radiateurs ou plancher chauffant',
    mprMontant: '0 € (rose) → 5 000 € (bleu)',
    ceeMontant: '2 500 - 4 000 € (zone H1)',
    coupDePouceEligible: true,
    ecoPtzPlafond: '15 000 € (geste seul)',
    cumulMaxModeste: '~13 000 € (revenus modestes, zone H1)',
    qualifRge: 'QualiPAC ou équivalent COFRAC',
    notes:
      'Forfaits CEE majorés en zone climatique H1 (froid). Coup de pouce Chauffage actif sur remplacement chaudière fioul/gaz.',
  },
  {
    slug: 'air-air',
    name: 'PAC air-air (climatisation réversible)',
    icon: Snowflake,
    cop: '3,5 à 4,0',
    prixMoyen: '5 000 - 10 000 €',
    ideal: 'Logement neuf BBC ou rénovation légère sans réseau hydraulique',
    mprMontant: 'Non éligible (depuis 2021)',
    ceeMontant: '500 - 1 500 € selon surface',
    coupDePouceEligible: false,
    ecoPtzPlafond: '7 000 € (parois vitrées seules) — sinon non éligible',
    cumulMaxModeste: '~1 500 € (CEE classique uniquement)',
    qualifRge: 'QualiPAC',
    notes:
      "Exclue de MaPrimeRénov' depuis 2021 (rendement énergétique jugé insuffisant en hiver). Reste populaire en zone H3 (climat doux).",
  },
  {
    slug: 'geothermique',
    name: 'PAC géothermique (sol-eau ou eau-eau)',
    icon: Thermometer,
    cop: '4,0 à 5,5',
    prixMoyen: '20 000 - 35 000 € (forage inclus)',
    ideal: 'Maison avec terrain ≥ 250 m² ou nappe phréatique exploitable',
    mprMontant: '0 € (rose) → 11 000 € (bleu)',
    ceeMontant: '3 000 - 5 500 € (zone H1)',
    coupDePouceEligible: true,
    ecoPtzPlafond: '15 000 € (geste seul)',
    cumulMaxModeste: '~25 000 € (revenus modestes, zone H1)',
    qualifRge: 'QualiPAC + module géothermie',
    notes:
      'Plus chère à installer mais COP imbattable et durabilité 20-25 ans. Aides MaPrimeRénov’ les plus généreuses en absolu.',
  },
  {
    slug: 'hybride',
    name: 'PAC hybride (PAC air-eau + chaudière gaz)',
    icon: Droplet,
    cop: '2,8 à 3,5 (mixte)',
    prixMoyen: '10 000 - 15 000 €',
    ideal: 'Rénovation maison ancienne avec chaudière gaz à conserver',
    mprMontant: '0 € (rose) → 4 000 € (bleu)',
    ceeMontant: '2 000 - 3 500 € (zone H1)',
    coupDePouceEligible: true,
    ecoPtzPlafond: '15 000 € (geste seul)',
    cumulMaxModeste: '~10 000 € (revenus modestes, zone H1)',
    qualifRge: 'QualiPAC + qualification chauffage gaz',
    notes:
      'Solution de transition pour passoires énergétiques où la PAC seule ne couvre pas les pics hiver. Coup de pouce Chauffage actif.',
  },
]

const FAQ = [
  {
    question: 'Quelle est la PAC qui ouvre le droit aux aides les plus généreuses en 2026 ?',
    answer:
      "La PAC géothermique (sol-eau ou eau-eau) reçoit les forfaits MaPrimeRénov' les plus élevés en valeur absolue : jusqu'à 11 000 € pour un ménage très modeste (profil bleu), contre 5 000 € maximum pour une PAC air-eau classique. Cette générosité reflète le coût d'installation supérieur (forage + sondes) et le COP de 4-5,5 nettement meilleur. La PAC air-air n'est plus éligible MaPrimeRénov' depuis 2021.",
  },
  {
    question: 'La PAC air-air est-elle vraiment exclue de MaPrimeRénov’ en 2026 ?',
    answer:
      "Oui, sans exception, depuis l'arrêté de juillet 2021. La PAC air-air (climatisation réversible) reste éligible à la prime CEE classique (500-1 500 €) et bénéficie automatiquement de la TVA réduite à 5,5 %, mais aucune subvention publique. Cette restriction tient à un rendement énergétique en chauffage jugé inférieur aux PAC air-eau et géothermiques, et à un risque de dérive d'usage (climatisation surconsommatrice en été).",
  },
  {
    question:
      'Quelle est la différence entre Coup de pouce Chauffage et MaPrimeRénov’ pour une PAC ?',
    answer:
      "Le Coup de pouce Chauffage est une bonification de la prime CEE versée par les obligés (Effy, Sonergia, EDF) lorsque vous remplacez une chaudière fioul ou gaz par une PAC. Il ne remplace pas MaPrimeRénov' mais s'y cumule. Pour une PAC air-eau remplaçant un fioul, vous pouvez recevoir simultanément : MaPrimeRénov' (forfait selon revenus) + prime CEE classique + bonification Coup de pouce + TVA 5,5 % automatique.",
  },
  {
    question: 'Quel est le cumul maximum d’aides pour une PAC air-eau en 2026 ?',
    answer:
      "Pour un ménage très modeste (profil bleu) en zone climatique H1 (froid) qui remplace une chaudière fioul par une PAC air-eau : MaPrimeRénov' 5 000 € + prime CEE classique 2 500 € + Coup de pouce Chauffage ~5 500 € (bonification) = environ 13 000 € de subventions cumulées, plus la TVA 5,5 % automatique. À ajouter éventuellement un éco-PTZ jusqu'à 15 000 € pour préfinancer le reste à charge.",
  },
  {
    question: 'Mon artisan doit-il être QualiPAC obligatoirement ?',
    answer:
      "Oui, la qualification QualiPAC (ou équivalent COFRAC) est exigée pour toutes les PAC sauf cas très spécifiques (PAC géothermique nécessitant un module sondes terrain supplémentaire). La qualification doit être valide à la DATE de signature du devis (et non au démarrage du chantier). Sans QualiPAC, vous perdez intégralement MaPrimeRénov', la prime CEE et le Coup de pouce. Vérifier sur france-renov.gouv.fr la validité de la qualification de votre artisan avant signature.",
  },
  {
    question: 'Existe-t-il des aides régionales spécifiques pour les PAC ?',
    answer:
      "Oui, plusieurs régions disposent de dispositifs cumulables avec les aides nationales. Île-de-France (Énergie + Île-de-France, jusqu'à 4 000 €), Auvergne-Rhône-Alpes (Eco-Énergie ARA, jusqu'à 6 000 €), Hauts-de-France (Pass Rénovation, jusqu'à 15 000 € en prêt avancé), Bretagne (Pacte Énergie Bretagne, jusqu'à 6 000 €) sont les plus généreuses. Notre dataset open-data regroupe les 13 régions métropolitaines avec montant et URL officielle source de chaque aide régionale.",
  },
]

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

export default function PompeAChaleurAidesComparatifPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: 'Aides pompe à chaleur — comparatif', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)
  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: PAGE_URL,
    name: 'FAQ — Aides pompe à chaleur 2026 par type',
    includeSpeakable: true,
  })

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${PAGE_URL}#article`,
    url: PAGE_URL,
    headline: TITLE,
    description: DESCRIPTION,
    image: [`${SITE_URL}/og-default.jpg`],
    datePublished: `${PUBLISHED_AT}T00:00:00+02:00`,
    dateModified: `${REVIEWED_AT}T00:00:00+02:00`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Aides à la rénovation énergétique',
    keywords: [
      'aides pompe à chaleur',
      'PAC',
      'PAC air-eau',
      'PAC géothermique',
      "MaPrimeRénov'",
      'Coup de pouce CEE',
      'QualiPAC',
      'comparatif',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: 'Pompe à chaleur' },
      { '@type': 'Thing', name: "MaPrimeRénov' PAC" },
      { '@type': 'Thing', name: 'Coup de pouce chauffage' },
      { '@type': 'Thing', name: 'Qualification QualiPAC' },
    ],
    ...spreadCitationsForTopics('pompe à chaleur PAC MaPrimeRénov Coup de pouce CEE RGE QualiPAC'),
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
    ...(REVIEWER && { reviewedBy: getReviewedByPersonSchema(REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
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

  const tldrBullets = [
    '4 types de PAC en 2026 : air-eau (la plus installée), air-air, géothermique (la plus aidée), hybride.',
    'PAC air-air = exclue de MaPrimeRénov’ depuis 2021. Reste éligible CEE classique uniquement.',
    'PAC géothermique = forfait MaPrimeRénov’ jusqu’à 11 000 € (ménage très modeste).',
    'Cumul max PAC air-eau (revenus modestes, zone H1) : ~13 000 € MPR + CEE + Coup de pouce.',
    'QualiPAC obligatoire pour toutes les PAC (sauf module géothermie sondes terrain).',
  ]

  const enBrefPoints = [
    'PAC air-eau = la plus installée, COP 3-4,5, aides MPR + CEE + Coup de pouce cumulables.',
    'PAC air-air = exclue MaPrimeRénov’ depuis 2021 — CEE classique uniquement.',
    'PAC géothermique = aides MPR les plus élevées (11 000 € max) mais investissement initial 20-35 K€.',
    'PAC hybride = solution transition passoires énergétiques (PAC + chaudière gaz combinées).',
    'QualiPAC obligatoire à la signature du devis pour toutes les aides.',
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema as Record<string, unknown>,
          articleSchema as Record<string, unknown>,
          ...(faqSchema ? [faqSchema as Record<string, unknown>] : []),
        ]}
      />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: 'Aides pompe à chaleur — comparatif' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`Tableau comparatif des aides 2026 par type de pompe à chaleur (air-eau, air-air, géothermique, hybride). MaPrimeRénov', prime CEE, Coup de pouce Chauffage, éco-PTZ : montants exacts et conditions par technologie. La PAC air-air est exclue de MPR depuis 2021.`}
          keyPoints={enBrefPoints}
        />
      </div>

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Scale className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Comparatif aides 2026 · 4 technologies PAC
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Aides pompe à chaleur 2026 : montants par type de PAC
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Comparatif officiel des aides nationales (MaPrimeRénov’, prime CEE, Coup de pouce
            Chauffage, éco-PTZ) selon le type de PAC installé. Sources : ANAH, ADEME, France Rénov’,
            arrêtés DGEC.
          </p>
          <LastUpdated
            label="Comparatif vérifié le"
            date={REVIEWED_AT}
            className="mt-4 text-emerald-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides PAC
            </Link>
            <Link
              href="/guides/pompe-a-chaleur-cee-maprimerenov-2026"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Guide PAC complet
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
          <TldrBlock title="L’essentiel : 4 types, 4 niveaux d’aides" bullets={tldrBullets} />
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="cards-pac-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2
              id="cards-pac-heading"
              className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900"
            >
              Les 4 types de PAC et leurs aides
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PAC_TYPES.map((p) => {
              const Icon = p.icon
              return (
                <article
                  key={p.slug}
                  className="rounded-2xl border border-charcoal-100 bg-white p-6 hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <Icon className="h-6 w-6 text-emerald-700" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-charcoal-900">{p.name}</h3>
                      <p className="text-xs text-charcoal-500 mt-1">
                        COP {p.cop} · {p.prixMoyen}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-charcoal-700 italic mb-3">Idéal pour : {p.ideal}</p>
                  <dl className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <dt className="text-charcoal-500">MaPrimeRénov’</dt>
                      <dd className="font-semibold text-charcoal-900">{p.mprMontant}</dd>
                    </div>
                    <div>
                      <dt className="text-charcoal-500">CEE</dt>
                      <dd className="font-semibold text-charcoal-900">{p.ceeMontant}</dd>
                    </div>
                    <div>
                      <dt className="text-charcoal-500">Coup de pouce</dt>
                      <dd className="font-semibold text-charcoal-900">
                        {p.coupDePouceEligible ? 'Oui' : 'Non éligible'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-charcoal-500">Éco-PTZ plafond</dt>
                      <dd className="font-semibold text-charcoal-900">{p.ecoPtzPlafond}</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-emerald-700 font-semibold mb-2">
                    Cumul max (modeste, H1) : {p.cumulMaxModeste}
                  </p>
                  <p className="text-xs text-charcoal-600 leading-relaxed">{p.notes}</p>
                  <p className="text-xs text-charcoal-500 mt-3">
                    Qualification RGE requise : {p.qualifRge}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section
        className="bg-emerald-50/40 py-12 border-y border-emerald-100"
        aria-labelledby="full-table-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="full-table-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            Tableau récapitulatif des aides par type
          </h2>
          <p className="text-charcoal-700 mb-6">
            Vue à plat des montants nationaux 2026. Pastilles{' '}
            <CheckCircle2
              className="inline w-4 h-4 text-emerald-600 align-text-bottom"
              aria-hidden="true"
            />{' '}
            indiquent le type de PAC qui touche le forfait MaPrimeRénov’ le plus élevé sur le
            critère.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Tableau des aides 2026 par type de pompe à chaleur (air-eau, air-air, géothermique,
                hybride)
              </caption>
              <thead className="bg-emerald-50 text-charcoal-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Type de PAC
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    MaPrimeRénov’
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Prime CEE
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Coup de pouce
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Éco-PTZ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
                {PAC_TYPES.map((p) => (
                  <tr key={p.slug} className="align-top">
                    <th scope="row" className="px-4 py-3 font-semibold">
                      {p.name}
                    </th>
                    <td className="px-4 py-3">
                      {p.slug === 'geothermique' && (
                        <CheckCircle2
                          className="inline w-4 h-4 text-emerald-600 mr-1 align-text-bottom"
                          aria-label="Forfait MaPrimeRénov’ le plus élevé sur ce critère"
                        />
                      )}
                      {p.mprMontant}
                    </td>
                    <td className="px-4 py-3">{p.ceeMontant}</td>
                    <td className="px-4 py-3">
                      {p.coupDePouceEligible ? '✓ Oui' : '✗ Non éligible'}
                    </td>
                    <td className="px-4 py-3">{p.ecoPtzPlafond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="bg-white py-12 border-t border-charcoal-100"
        aria-labelledby="bridge-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 p-6 md:p-8">
            <Info className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h2
                id="bridge-heading"
                className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-2"
              >
                Stratégie de cumul optimal pour une PAC en 2026
              </h2>
              <p className="text-charcoal-700 leading-relaxed mb-4">
                Pour les types éligibles (air-eau, géothermique, hybride), la combinaison gagnante
                est : <strong>MaPrimeRénov’</strong> (selon revenus) + <strong>prime CEE</strong>{' '}
                (versée par l’obligé) + <strong>bonification Coup de pouce Chauffage</strong> (si
                remplacement chaudière fioul/gaz) + TVA 5,5 % automatique + éventuellement{' '}
                <strong>éco-PTZ</strong> à taux 0 % pour préfinancer le reste à charge. Notre
                simulateur agrège les 4 dispositifs en 2 minutes.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/simulateur-aides-renovation"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold shadow-md hover:bg-emerald-800 transition"
                >
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                  Simuler mon plan d’aides PAC
                </Link>
                <Link
                  href="/aides/maprimerenov-vs-coup-de-pouce"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                >
                  MaPrimeRénov’ vs Coup de pouce
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-white py-12 border-t border-charcoal-100"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2
            id="faq-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details
                key={`faq-${i}`}
                className="group rounded-xl border border-charcoal-200 bg-white p-5 open:border-emerald-300 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-charcoal-900 flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span
                    className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-charcoal-700 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal-950 py-12 text-center text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
            Pages associées sur les aides PAC
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Link
              href="/aides/aide-pompe-a-chaleur"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Page aide PAC
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/guides/pompe-a-chaleur-cee-maprimerenov-2026"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Guide PAC + aides
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/services/pompe-a-chaleur"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Trouver un installateur
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/aides"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-900 font-semibold transition"
            >
              Hub des {aidesCatalog.length} aides 2026
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
