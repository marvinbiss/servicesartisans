import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Calculator,
  ClipboardCheck,
  Compass,
  FileSearch,
  ShieldCheck,
  Thermometer,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import EnBrefBox from '@/components/seo/EnBrefBox'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getGovernmentServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { getPublishedDate } from '@/lib/seo/published-dates'

export const dynamic = 'force-static'
export const revalidate = 86400

const PATH = '/diagnostic'
const REVIEW_DATE = '2026-04-29'
// REVIEW_YEAR : string literal (pas Number(...)) pour rester résolvable par
// scripts/audit-meta-quality.mjs. Garder en sync avec REVIEW_DATE.
const REVIEW_YEAR = '2026'
const HUB_TITLE = `Diagnostic énergétique ${REVIEW_YEAR} : DPE, audit + classes A à G`
const HUB_DESCRIPTION = `Comprendre son DPE et l'audit énergétique ${REVIEW_YEAR} : classes A à G, prix, aides MaPrimeRénov', obligation passoires thermiques (F/G interdites à la location).`
const PUBLISHED_DATE = getPublishedDate('/diagnostic')

const AUTHOR = authors['sophie-martin']
const REVIEWER = getReviewerForAuthor(AUTHOR)

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Quelle différence entre un DPE et un audit énergétique ?',
    answer:
      'Le DPE (Diagnostic de Performance Énergétique) est un état des lieux obligatoire en cas de vente ou de location : il classe le logement de A à G sur la base de la consommation d’énergie et des émissions de gaz à effet de serre. L’audit énergétique va beaucoup plus loin : il propose au moins deux scénarios chiffrés de travaux de rénovation pour faire passer le logement à une classe supérieure (B ou C cible MaPrimeRénov’ Parcours accompagné). L’audit est obligatoire depuis 2022 pour la vente d’une passoire thermique (F ou G) et systématique pour mobiliser l’aide MaPrimeRénov’ Parcours accompagné.',
  },
  {
    question: `Combien coûte un audit énergétique en ${REVIEW_YEAR} et quelles aides ?`,
    answer: `Le prix d'un audit énergétique réglementaire en maison individuelle se situe entre 800 et 1 200 € TTC en ${REVIEW_YEAR}, selon la surface et la complexité. Pour un appartement, comptez 500 à 900 €. Une prise en charge MaPrimeRénov' jusqu'à 500 € (ménage modeste) ou 400 € (ménage intermédiaire) s'applique si l'audit est réalisé par un auditeur RGE Études (qualification OPQIBI 1905, Qualibat 8731, ou audit ANAH). L'audit doit être commandé AVANT le démarrage des travaux pour être éligible au remboursement.`,
  },
  {
    question: `Mon logement est classé F ou G : que faire en ${REVIEW_YEAR} ?`,
    answer:
      'Depuis le 1er janvier 2025, les logements classés G sont interdits à la location (loi Climat & Résilience). Les classés F seront concernés à partir du 1er janvier 2028, et les E à partir de 2034. Trois leviers à activer : (1) commander un audit énergétique pour identifier le bouquet de travaux qui sortira le logement de la classe interdite, (2) mobiliser MaPrimeRénov’ Parcours accompagné (jusqu’à 70 000 € pour un saut de 4 classes en ménage très modeste), et (3) faire réaliser les travaux par un artisan RGE pour conserver l’éligibilité aux primes CEE. Un nouveau DPE après travaux atteste du changement de classe.',
  },
  {
    question: 'Le DPE est-il fiable ?',
    answer:
      'La méthode officielle 3CL-DPE 2021 a remplacé en juillet 2021 l’ancienne méthode dite « sur facture », jugée trop variable. Le DPE actuel s’appuie exclusivement sur les caractéristiques techniques du logement (isolation, équipements, surface, orientation, zone climatique) et non sur les consommations réelles, ce qui le rend opposable juridiquement. Il reste toutefois sensible à la qualité des données saisies par le diagnostiqueur (épaisseurs d’isolant, type de chaudière). En cas de doute, un second avis ou un audit énergétique permet de vérifier les hypothèses.',
  },
  {
    question: `Quels diagnostics sont obligatoires pour vendre un logement en ${REVIEW_YEAR} ?`,
    answer: `Le Dossier de Diagnostic Technique (DDT) annexé au compromis de vente comprend en ${REVIEW_YEAR} : DPE (validité 10 ans), diagnostic amiante (logements construits avant 1997), diagnostic plomb (CREP, logements antérieurs à 1949), diagnostic termites (zones à risque arrêtées par les préfets), diagnostic gaz et électricité (installations de plus de 15 ans), État des Risques (ERP, ex-ERRIAL), audit énergétique (passoires F et G uniquement) et diagnostic assainissement non collectif si applicable. Tous ces diagnostics doivent être réalisés par un diagnostiqueur immobilier certifié.`,
  },
]

export const metadata: Metadata = {
  title: HUB_TITLE,
  description: HUB_DESCRIPTION,
  alternates: getAlternates(PATH),
  openGraph: {
    ...getOgDefaults(),
    locale: 'fr_FR',
    title: `${HUB_TITLE} — ${SITE_NAME}`,
    description: HUB_DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: HUB_TITLE,
    description: HUB_DESCRIPTION,
  },
}

const tldrBullets = [
  'DPE : classe A→G obligatoire à la vente et à la location depuis 2006 (méthode 3CL-DPE 2021)',
  'Audit énergétique : 800-1 200 € TTC, jusqu’à 500 € d’aide MaPrimeRénov’',
  'Passoire thermique (F/G) : interdiction location G dès 2025, F dès 2028, E dès 2034',
  'Auditeur RGE Études (OPQIBI 1905, Qualibat 8731) requis pour MaPrimeRénov’ Parcours accompagné',
]

const enBrefPoints = [
  '7 classes énergétiques (A à G) basées sur la consommation et les émissions GES',
  'Audit énergétique réglementaire requis pour vendre une passoire thermique (F/G)',
  'Auditeur RGE Études certifié obligatoire pour MaPrimeRénov’ Parcours accompagné',
  'Sources : ADEME, France Rénov’, service-public.fr, articles L.126-26 et suivants du CCH',
]

type DpeClass = {
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  label: string
  range: string
  ges: string
  status: string
  color: string
}

const DPE_CLASSES: DpeClass[] = [
  {
    letter: 'A',
    label: 'Très performant',
    range: '< 70 kWh/m²/an',
    ges: '< 6 kg CO₂/m²/an',
    status: 'Excellence — RT 2012 / RE 2020',
    color: 'bg-emerald-600 text-white',
  },
  {
    letter: 'B',
    label: 'Performant',
    range: '70–110 kWh/m²/an',
    ges: '6–11 kg CO₂/m²/an',
    status: 'BBC rénovation cible MaPrimeRénov’',
    color: 'bg-emerald-500 text-white',
  },
  {
    letter: 'C',
    label: 'Bon',
    range: '110–180 kWh/m²/an',
    ges: '11–30 kg CO₂/m²/an',
    status: 'Cible standard rénovation lourde',
    color: 'bg-lime-500 text-charcoal-900',
  },
  {
    letter: 'D',
    label: 'Moyen',
    range: '180–250 kWh/m²/an',
    ges: '30–50 kg CO₂/m²/an',
    status: 'Logement courant — gain MaPrimeRénov’ utile',
    color: 'bg-yellow-400 text-charcoal-900',
  },
  {
    letter: 'E',
    label: 'Énergivore',
    range: '250–330 kWh/m²/an',
    ges: '50–70 kg CO₂/m²/an',
    status: 'Interdiction de location à compter du 1er janvier 2034',
    color: 'bg-orange-500 text-white',
  },
  {
    letter: 'F',
    label: 'Passoire thermique',
    range: '330–420 kWh/m²/an',
    ges: '70–100 kg CO₂/m²/an',
    status: 'Interdiction de location à compter du 1er janvier 2028',
    color: 'bg-orange-600 text-white',
  },
  {
    letter: 'G',
    label: 'Passoire extrême',
    range: '> 420 kWh/m²/an',
    ges: '> 100 kg CO₂/m²/an',
    status: 'Interdiction de location depuis le 1er janvier 2025',
    color: 'bg-red-700 text-white',
  },
]

type DiagnosticCard = {
  href: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const DIAGNOSTIC_GUIDES: DiagnosticCard[] = [
  {
    href: '/guides/audit-energetique-prix-aides',
    title: 'Audit énergétique : prix + aides 2026',
    description:
      'Coût détaillé maison/appartement, qualifications RGE Études requises, déroulé des 2 scénarios MaPrimeRénov’.',
    icon: ClipboardCheck,
  },
  {
    href: '/guides/dpe-mauvais-que-faire',
    title: 'DPE D, E, F ou G : que faire ?',
    description:
      'Stratégies de rénovation par classe DPE actuelle, leviers MaPrimeRénov’ Parcours accompagné et CEE.',
    icon: Thermometer,
  },
  {
    href: '/guides/passoire-thermique-renovation',
    title: `Passoire thermique : rénover en ${REVIEW_YEAR}`,
    description:
      'Calendrier loi Climat & Résilience (G/F/E), bouquet de travaux type, aides cumulables.',
    icon: ShieldCheck,
  },
  {
    href: '/guides/classe-energie-f-interdite-2028',
    title: 'Classe F interdite à la location en 2028',
    description:
      'Échéances précises, obligations bailleurs, recours locataires, jurisprudence récente.',
    icon: FileSearch,
  },
  {
    href: '/guides/diagnostics-immobiliers',
    title: 'Tous les diagnostics immobiliers obligatoires',
    description:
      'DDT complet : DPE, amiante, plomb, termites, gaz, électricité, ERP, audit énergétique. Validités et coûts.',
    icon: Compass,
  },
  {
    href: '/guides/diagnostics-vente-obligatoires',
    title: 'Diagnostics obligatoires pour vendre',
    description:
      'Liste exhaustive des diagnostics à fournir au compromis selon année de construction et zone.',
    icon: FileSearch,
  },
]

export default function DiagnosticHubPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Diagnostic énergétique', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: HUB_TITLE,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: DIAGNOSTIC_GUIDES.length,
    itemListElement: DIAGNOSTIC_GUIDES.map((g, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${SITE_URL}${g.href}`,
      name: g.title,
    })),
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${PATH}#webpage`,
    url: `${SITE_URL}${PATH}`,
    name: HUB_TITLE,
    description: HUB_DESCRIPTION,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    breadcrumb: breadcrumbSchema,
    primaryImageOfPage: { '@id': `${SITE_URL}/opengraph-image` },
    dateModified: REVIEW_DATE,
    author: AUTHOR
      ? {
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          ...(AUTHOR.methodology &&
            AUTHOR.methodology.length > 0 && { skills: AUTHOR.methodology }),
        }
      : undefined,
    publisher: { '@id': `${SITE_URL}#organization` },
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: HUB_TITLE,
    description: HUB_DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    datePublished: PUBLISHED_DATE,
    dateModified: REVIEW_DATE,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    image: `${SITE_URL}/opengraph-image`,
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
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${PATH}` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: 'Diagnostic de Performance Énergétique (DPE) et audit énergétique réglementaire',
    description:
      'Dispositifs réglementaires français de mesure de la performance énergétique des logements résidentiels. DPE (méthode 3CL-DPE 2021) opposable juridiquement, audit énergétique réglementaire obligatoire pour la vente des passoires thermiques (loi Climat & Résilience).',
    url: `${SITE_URL}${PATH}`,
    serviceType: 'Diagnostic réglementaire',
    audience: 'Propriétaires, bailleurs et acquéreurs de logements résidentiels en France',
    temporalCoverage: '2021-07-01/..',
    sameAs: [
      'https://www.ecologie.gouv.fr/diagnostic-performance-energetique-dpe',
      'https://france-renov.gouv.fr/aides/audit-energetique',
      'https://www.service-public.fr/particuliers/vosdroits/F16096',
    ],
    serviceOperator: {
      name: "Direction de l'habitat, de l'urbanisme et des paysages (DHUP)",
      url: 'https://www.ecologie.gouv.fr/direction-lhabitat-lurbanisme-et-paysages-dhup',
    },
  })

  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: `${SITE_URL}${PATH}`,
    name: 'FAQ — Diagnostic énergétique, DPE et audit',
    includeSpeakable: true,
  })

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema as Record<string, unknown>,
    articleSchema as Record<string, unknown>,
    webPageSchema as Record<string, unknown>,
    itemListSchema as Record<string, unknown>,
    governmentServiceSchema as Record<string, unknown>,
  ]
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Diagnostic énergétique' }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <FileSearch className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Hub diagnostic énergétique 2026
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            {HUB_TITLE}
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            {HUB_DESCRIPTION}
          </p>
          <LastUpdated
            label="Dossier vérifié le"
            date={REVIEW_DATE}
            className="mt-4 text-emerald-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides rénovation
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Devis gratuit RGE
            </Link>
          </div>
        </div>
      </section>

      {/* En bref + TLDR + author */}
      <section className="bg-white py-10 border-b border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <ArticleMeta
            author={AUTHOR?.name ?? 'Équipe éditoriale ServicesArtisans'}
            authorHref={AUTHOR ? `/equipe/${AUTHOR.slug}` : '/a-propos'}
            datePublished={PUBLISHED_DATE}
            dateModified={REVIEW_DATE}
          />
          <EnBrefBox keyPoints={enBrefPoints} />
          <TldrBlock title="L’essentiel du diagnostic énergétique 2026" bullets={tldrBullets} />
        </div>
      </section>

      {/* Classes DPE */}
      <section id="classes-dpe" aria-labelledby="classes-heading" className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="classes-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
          >
            Comprendre les classes DPE A à G en {REVIEW_YEAR}
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-6">
            Le DPE classe les logements de A (très performant) à G (passoire extrême) sur la base de
            la consommation d’énergie primaire et des émissions de gaz à effet de serre. Méthode
            réglementaire 3CL-DPE 2021, opposable juridiquement.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white">
            <table className="w-full text-left">
              <caption className="sr-only">
                Classes DPE 2026 : seuils énergie + GES + statut
              </caption>
              <thead className="bg-charcoal-50 text-sm text-charcoal-700">
                <tr>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Classe
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Consommation
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    GES
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Statut 2026
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-sm text-charcoal-800">
                {DPE_CLASSES.map((c) => (
                  <tr key={c.letter}>
                    <th scope="row" className="px-3 py-3 align-middle">
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg font-extrabold ${c.color}`}
                        aria-label={`Classe ${c.letter} — ${c.label}`}
                      >
                        {c.letter}
                      </span>
                      <div className="text-xs text-charcoal-600 mt-1">{c.label}</div>
                    </th>
                    <td className="px-3 py-3 align-middle whitespace-nowrap">{c.range}</td>
                    <td className="px-3 py-3 align-middle whitespace-nowrap">{c.ges}</td>
                    <td className="px-3 py-3 align-middle text-charcoal-700">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-charcoal-500 leading-relaxed">
            Seuils issus de l’arrêté du 31 mars 2021 (méthode 3CL-DPE 2021) modifié par l’arrêté du
            13 avril 2022 (correctif petits logements). Calendrier d’interdiction location issu de
            la loi Climat & Résilience du 22 août 2021 (articles 160 et 161).
          </p>
        </div>
      </section>

      {/* Audit vs DPE */}
      <section
        id="audit-vs-dpe"
        aria-labelledby="audit-heading"
        className="bg-emerald-50/60 py-12 border-y border-emerald-100"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="audit-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
          >
            DPE vs audit énergétique : quelle différence en {REVIEW_YEAR}&nbsp;?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
              <h3 className="font-heading text-xl font-bold text-charcoal-900 mb-2">DPE</h3>
              <ul className="space-y-2 text-sm text-charcoal-700 leading-relaxed">
                <li>État des lieux à un instant T (validité 10 ans)</li>
                <li>Obligatoire pour vendre OU louer un logement (depuis 2006)</li>
                <li>Coût : 100 à 250 € selon surface et zone</li>
                <li>Réalisé par un diagnostiqueur immobilier certifié COFRAC</li>
                <li>Aucune préconisation chiffrée — seulement un classement A→G</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-300 bg-white p-6">
              <h3 className="font-heading text-xl font-bold text-charcoal-900 mb-2">
                Audit énergétique
              </h3>
              <ul className="space-y-2 text-sm text-charcoal-700 leading-relaxed">
                <li>Plan d’action : ≥ 2 scénarios chiffrés de travaux</li>
                <li>Obligatoire pour vendre une passoire thermique (F/G) depuis avril 2023</li>
                <li>Coût : 800 à 1 200 € (maison), 500 à 900 € (appartement)</li>
                <li>Réalisé par un auditeur RGE Études (OPQIBI 1905, Qualibat 8731)</li>
                <li>Aide MaPrimeRénov’ : jusqu’à 500 € (modeste) / 400 € (intermédiaire)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue guides */}
      <section id="guides" aria-labelledby="guides-heading" className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="guides-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            Guides détaillés : DPE, audit, passoires
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIAGNOSTIC_GUIDES.map((g) => {
              const Icon = g.icon
              return (
                <Link
                  key={g.href}
                  href={g.href}
                  className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition mb-2">
                    {g.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-3">{g.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-700 font-medium">
                    Lire le guide
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA simulateur + RGE */}
      <section className="bg-emerald-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Passer du diagnostic aux travaux : trouvez vos artisans RGE
          </h2>
          <p className="text-emerald-50/90 leading-relaxed mb-6 max-w-2xl mx-auto">
            Simulez en 3 minutes le bouquet d’aides applicable à votre logement et obtenez 3 devis
            d’artisans certifiés RGE (Qualibat, Qualit’EnR, OPQIBI) près de chez vous.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides en 3 min
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Annuaire artisans RGE
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="bg-white py-12 border-t border-charcoal-100"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2
            id="faq-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((q) => (
              <details
                key={q.question}
                className="group rounded-xl border border-charcoal-100 bg-white p-5"
              >
                <summary className="cursor-pointer list-none font-semibold text-charcoal-900 group-open:text-emerald-700">
                  {q.question}
                </summary>
                <p className="mt-3 text-sm text-charcoal-700 leading-relaxed">{q.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="bg-sand-50 py-10 border-t border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-xl font-extrabold text-charcoal-900">
              Notre méthodologie
            </h2>
          </div>
          <p className="text-sm text-charcoal-700 leading-relaxed mb-3">
            Dossier rédigé par {AUTHOR?.name ?? 'la rédaction ServicesArtisans'} (
            {AUTHOR?.role ?? 'rédacteur spécialisé'}). Méthodologie publiée :
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-charcoal-700">
            {(AUTHOR?.methodology ?? []).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-charcoal-500">
            Détail complet sur{' '}
            <Link href="/methodologie" className="underline hover:text-emerald-700">
              /methodologie
            </Link>{' '}
            · Sources officielles : ADEME, France Rénov’, service-public.fr, Journal Officiel.
          </p>
        </div>
      </section>
    </>
  )
}
