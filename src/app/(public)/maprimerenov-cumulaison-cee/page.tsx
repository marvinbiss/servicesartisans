import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  BookOpen,
  ArrowRight,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Calculator,
  Landmark,
  Euro,
  ClipboardList,
} from 'lucide-react'

import CeeCTA from '@/components/cee/CeeCTA'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { ArticleMeta } from '@/components/ArticleMeta'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getCeeGovServiceSchema,
  getFAQSchema,
  getMaPrimeRenovGovServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'

const MPR_CEE_AUTHOR = authors['claire-dubois']
const MPR_CEE_REVIEWER = getReviewerForAuthor(MPR_CEE_AUTHOR)

export const revalidate = 86400

const PAGE_PATH = '/maprimerenov-cumulaison-cee'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED_AT = '2026-04-09T09:00:00+02:00'
const UPDATED_AT = '2026-04-09T09:00:00+02:00'

type CumulStatus = 'oui' | 'non' | 'conditionnel'

type FamilleRow = {
  famille: string
  code: string
  href: string
  mpr: CumulStatus
  cee: CumulStatus
  coupDePouce: boolean
  note: string
}

const FAMILLES: FamilleRow[] = [
  {
    famille: 'Isolation des combles perdus',
    code: 'BAR-EN-101',
    href: '/cee/bar-en-101',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'Forfait MPR selon profil. Coup de pouce Isolation actif en 2026.',
  },
  {
    famille: 'Isolation des murs (ITE ou ITI)',
    code: 'BAR-EN-102',
    href: '/cee/bar-en-102',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: false,
    note: 'MPR par geste plafonnée en surface (100 m² en ITE).',
  },
  {
    famille: 'Isolation des planchers bas',
    code: 'BAR-EN-103',
    href: '/cee/bar-en-103',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'R ≥ 3 m².K/W exigé. Coup de pouce Isolation applicable.',
  },
  {
    famille: 'Fenêtres et parois vitrées',
    code: 'BAR-EN-104',
    href: '/cee/bar-en-104',
    mpr: 'conditionnel',
    cee: 'oui',
    coupDePouce: false,
    note: 'MPR limitée au remplacement simple → double vitrage performant.',
  },
  {
    famille: 'Pompe à chaleur air/eau haute performance',
    code: 'BAR-TH-171',
    href: '/cee/bar-th-171',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'Forfait MPR majeur (bleu/jaune). Coup de pouce Chauffage actif.',
  },
  {
    famille: 'Pompe à chaleur air/air (climatisation réversible)',
    code: 'BAR-TH-129',
    href: '/cee/bar-th-129',
    mpr: 'non',
    cee: 'oui',
    coupDePouce: false,
    note: 'Exclusion historique de MaPrimeRénov’. Seule la prime CEE est mobilisable.',
  },
  {
    famille: 'Chauffe-eau thermodynamique',
    code: 'BAR-TH-148',
    href: '/cee/bar-th-148',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: false,
    note: 'COP minimal exigé. Forfait MPR stable sur tous profils.',
  },
  {
    famille: 'Chaudière biomasse (granulés, bûches)',
    code: 'BAR-TH-113',
    href: '/cee/bar-th-113',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'Label Flamme Verte 7 étoiles requis. Coup de pouce cumulable.',
  },
  {
    famille: 'Poêle à bois ou à granulés',
    code: 'BAR-TH-112',
    href: '/cee/bar-th-112',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'Rendement minimal 75 % et émissions de particules encadrées.',
  },
  {
    famille: 'VMC double flux',
    code: 'BAR-TH-125',
    href: '/cee/bar-th-125',
    mpr: 'conditionnel',
    cee: 'oui',
    coupDePouce: false,
    note: 'MPR mobilisée surtout en Parcours Accompagné.',
  },
  {
    famille: 'Pompe à chaleur eau/eau haute performance',
    code: 'BAR-TH-172',
    href: '/cee/bar-th-172',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'PAC géothermique sur nappe. Remplace BAR-TH-106 (gaz, abrogée).',
  },
  {
    famille: 'PAC hybride (PAC + chaudière gaz)',
    code: 'BAR-TH-159',
    href: '/cee/bar-th-159',
    mpr: 'non',
    cee: 'oui',
    coupDePouce: false,
    note: 'Présence chaudière gaz → exclusion MPR (décret fossiles).',
  },
  {
    famille: 'Système solaire combiné (SSC)',
    code: 'BAR-TH-143',
    href: '/cee/bar-th-143',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: false,
    note: 'Forfait MPR élevé. Compatible avec un appoint bois.',
  },
  {
    famille: 'Rénovation d’ampleur maison individuelle',
    code: 'BAR-TH-174',
    href: '/cee/bar-th-174',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: false,
    note: 'Remplace BAR-TH-164 depuis 2024. Parcours Accompagné obligatoire.',
  },
]

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Puis-je cumuler MaPrimeRénov’, la prime CEE et l’Éco-PTZ sur le même chantier ?',
    answer:
      'Oui, les trois sont cumulables et c’est courant. MPR (aide publique Anah) + prime CEE (aide privée des obligés Effy, Sonergia, TotalEnergies, EDF, Engie…) + Éco-PTZ (crédit bancaire sans intérêts jusqu’à 50 000 € sur 20 ans). Trois conditions : RGE à la date du devis, total des aides ≤ 100 % du coût TTC, reste à charge minimum conservé (arrêté du 14 janvier 2020 modifié). En pratique, l’Éco-PTZ finance le reste à charge.',
  },
  {
    question: 'La prime CEE est-elle imposable ?',
    answer:
      'Non. La prime CEE versée à un particulier pour des travaux dans sa résidence principale ou secondaire est juridiquement une aide, pas un revenu — donc non imposable. MaPrimeRénov’ non plus. Aucune des deux ne figure dans la déclaration annuelle, sauf cas particulier des locations meublées BIC (consulter un expert-comptable).',
  },
  {
    question: 'Mon artisan propose un « reste à charge zéro ». Est-ce légal ?',
    answer:
      'Non, signal d’alarme. Depuis l’arrêté du 14 janvier 2020 modifié et la loi Climat et Résilience, un reste à charge minimum est obligatoire dès lors que MPR est mobilisée. Seul le segment très précaire sur opérations fortement bonifiées peut s’en approcher, sans l’atteindre. Toute promesse de « 1 € » ou « 0 € » hors cadre détourne le dispositif. Vérifiez le RGE sur france-renov.gouv.fr et ne versez jamais d’acompte avant l’accord écrit MPR.',
  },
  {
    question: 'Combien de temps entre le dépôt du dossier et le versement des aides ?',
    answer:
      'MPR : 2 à 4 mois en moyenne (jusqu’à 6 mois en période de forte affluence). Prime CEE : 4 à 12 semaines après dossier complet (facture acquittée, attestation sur l’honneur, photos géotaggées obligatoires depuis la loi du 30 juin 2025). Les délégataires spécialisés (Effy, Sonergia) sont en général plus rapides que les obligés généralistes. En Parcours Accompagné, le versement MPR est échelonné selon l’avancement.',
  },
  {
    question: 'Qu’est-ce que « Mon Accompagnateur Rénov’ » et est-ce obligatoire ?',
    answer:
      'Tiers agréé par l’État (décret n° 2022-1035 du 22 juillet 2022) qui accompagne le ménage : audit, choix des travaux, montage des dossiers, suivi de chantier, réception. Obligatoire pour tout Parcours Accompagné MPR (bouquet ≥ 35 % de gain). Facultatif en parcours par geste, sauf cas particuliers (dossiers majorés très modestes, sortie de passoire). Coût en partie pris en charge par l’Anah (jusqu’à 2 000 € pour les ménages bleu).',
  },
  {
    question: 'Si mes travaux dépassent le plafond d’aides, qui paie la différence ?',
    answer:
      'Le ménage. Plusieurs outils limitent l’impact : Éco-PTZ (50 000 € sur 20 ans sans intérêts), prêt avance rénovation pour propriétaires âgés, aides locales (régions/départements/intercommunalités), TVA à 5,5 % (CGI art. 278-0 bis A), prêts employeurs Action Logement. Règle d’or : bâtir le plan de financement « toutes aides comprises » avant la signature du devis, jamais après.',
  },
  {
    question: 'Dois-je déposer le dossier CEE avant ou après MaPrimeRénov’?',
    answer:
      'MPR d’abord. Ordre imposé : dépôt devis sur maprimerenov.gouv.fr → accord Anah → signature devis + attestation sur l’honneur CEE → travaux → facture acquittée → dépôt MPR final + dépôt CEE chez le délégataire. Signer le devis avant l’accord MPR rend le dossier inéligible. Côté CEE, la date de signature fige le cours de la prime (€/MWh cumac).',
  },
]

function StatusCell({ status }: { status: CumulStatus }) {
  if (status === 'oui') {
    return (
      <span className="inline-flex items-center gap-1 text-accent-700 font-semibold">
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
        Oui
      </span>
    )
  }
  if (status === 'non') {
    return (
      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
        <XCircle className="w-4 h-4" aria-hidden="true" />
        Non
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
      <Info className="w-4 h-4" aria-hidden="true" />
      Sous conditions
    </span>
  )
}

export const metadata: Metadata = {
  title: 'Cumul MaPrimeRénov’ + CEE 2026 : règles',
  description:
    'Cumul MaPrimeRénov’ et prime CEE 2026 : parcours par geste ou accompagné, tableau par famille de travaux, plafonds, ordre chronologique, FAQ.',
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    locale: 'fr_FR',
    title: 'Cumul MaPrimeRénov’ et CEE 2026 — guide complet',
    description:
      'Tout savoir sur le cumul MaPrimeRénov’ et CEE en 2026 : règles, parcours, plafonds, tableau par type de travaux, FAQ.',
    url: PAGE_URL,
    siteName: SITE_NAME,
    type: 'article',
    publishedTime: PUBLISHED_AT,
    modifiedTime: UPDATED_AT,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cumul MaPrimeRénov’ et CEE 2026',
    description: 'Règles et plafonds de cumul MPR + CEE en 2026, famille par famille.',
  },
}

export default function MaprimeRenovCumulCeePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: 'Cumul MaPrimeRénov’ et CEE', url: PAGE_PATH },
  ])

  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: `${SITE_URL}${PAGE_PATH}`,
    name: "FAQ — Cumul MaPrimeRénov' et CEE",
    includeSpeakable: true,
  })

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    image: `${SITE_URL}/opengraph-image`,
    headline: 'Cumul MaPrimeRénov’ et CEE 2026 : règles et plafonds',
    description:
      'Guide de référence sur le cumul MaPrimeRénov’ et Certificats d’Économies d’Énergie en 2026, mis à jour au regard des derniers textes réglementaires.',
    datePublished: PUBLISHED_AT,
    dateModified: UPDATED_AT,
    inLanguage: 'fr-FR',
    url: PAGE_URL,
    mainEntityOfPage: PAGE_URL,
    author: MPR_CEE_AUTHOR
      ? {
          '@type': 'Person',
          name: MPR_CEE_AUTHOR.name,
          jobTitle: MPR_CEE_AUTHOR.role,
          url: `${SITE_URL}/equipe/${MPR_CEE_AUTHOR.slug}`,
          ...(MPR_CEE_AUTHOR.methodology &&
            MPR_CEE_AUTHOR.methodology.length > 0 && { skills: MPR_CEE_AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(MPR_CEE_REVIEWER && { reviewedBy: getReviewedByPersonSchema(MPR_CEE_REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    about: [
      { '@type': 'Thing', name: 'MaPrimeRénov’' },
      { '@type': 'Thing', name: 'Certificats d’Économies d’Énergie' },
      { '@type': 'Thing', name: 'Rénovation énergétique' },
    ],
  }

  // GovernmentService — page cumul MPR + CEE. Émet les 2 dispositifs cités
  // avec fragment URL distinct pour @id KG uniques.
  const mprGovSchema = getMaPrimeRenovGovServiceSchema(`${PAGE_URL}#maprimerenov`)
  const ceeGovSchema = getCeeGovServiceSchema(`${PAGE_URL}#cee`)

  const baseSchemas: Record<string, unknown>[] = faqSchema
    ? [breadcrumbSchema, articleSchema, faqSchema]
    : [breadcrumbSchema, articleSchema]
  const allSchemas: Record<string, unknown>[] = [...baseSchemas, mprGovSchema, ceeGovSchema]

  return (
    <>
      <JsonLd data={allSchemas} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Primes CEE', href: '/cee' },
          { label: 'Cumul MaPrimeRénov’ et CEE' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <Landmark className="w-4 h-4 text-accent-300" />
            <span className="text-sm font-medium text-accent-100">
              Mis à jour pour MaPrimeRénov’ 2026
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-6xl font-extrabold leading-tight mb-5"
          >
            Cumul MaPrimeRénov’ et CEE 2026 : règles et plafonds
          </h1>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished={PUBLISHED_AT}
            dateModified={UPDATED_AT}
            className="justify-start mt-2 text-accent-50/80"
          />
          <p className="text-lg md:text-xl text-accent-50/90 max-w-3xl leading-relaxed">
            Peut-on cumuler MaPrimeRénov’ et la prime CEE&nbsp;? Oui dans la majorité des cas, et
            c’est même prévu par les textes. Ce guide détaille les règles, exceptions (PAC air/air,
            chaudière gaz, PAC hybride), plafonds 2026 et procédure pour obtenir les deux aides.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-accent-800 font-semibold shadow-lg hover:bg-accent-50 transition"
            >
              Obtenir un devis gratuit
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-accent-300/60 text-white font-semibold hover:bg-accent-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Catalogue CEE
            </Link>
          </div>
        </div>
      </section>

      {/* Sommaire */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
            Sommaire
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {[
              ['#principe', '1. Principe du cumul en 2026'],
              ['#parcours', '2. Les deux voies MaPrimeRénov’'],
              ['#tableau', '3. Tableau par famille de travaux'],
              ['#plafonds', '4. Plafonds et reste à charge minimum'],
              ['#procedure', '5. Procédure concrète'],
              ['#faq', '6. Questions fréquentes'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-accent-700 font-semibold hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 1. Principe */}
      <section id="principe" className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
          1. Quel est le principe du cumul MaPrimeRénov' + CEE en 2026 ?
        </h2>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          MaPrimeRénov’ et les Certificats d’Économies d’Énergie (CEE) sont deux dispositifs
          distincts qui coexistent depuis la fusion du CITE dans MPR en 2020 (décret
          n°&nbsp;2020-26). Les arrêtés du 14 janvier 2020 modifié (MPR) et du 22 décembre 2014
          modifié (CEE) prévoient explicitement leur cumul&nbsp;: c’est la règle.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          <strong>MaPrimeRénov’</strong> est une aide publique versée par l’Anah aux propriétaires
          occupants, bailleurs et copropriétés. Barème segmenté en 4 profils&nbsp;:
        </p>
        <ul className="list-disc pl-6 text-charcoal-700 leading-relaxed mb-4 space-y-1">
          <li>
            <strong>Bleu</strong> — très modestes (forfaits maximaux)
          </li>
          <li>
            <strong>Jaune</strong> — modestes
          </li>
          <li>
            <strong>Violet</strong> — intermédiaires
          </li>
          <li>
            <strong>Rose</strong> — aisés (essentiellement Parcours Accompagné et isolation)
          </li>
        </ul>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Plafonds de revenu fiscal publiés chaque année sur <strong>maprimerenov.gouv.fr</strong>,
          variables selon foyer et zone (Île-de-France ou autre). Pilotage France Rénov’.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          <strong>Les CEE</strong> sont un dispositif privé encadré par l’État. Les vendeurs
          d’énergie (EDF, Engie, TotalEnergies, Auchan, Leclerc, BP…) sont «&nbsp;obligés&nbsp;» par
          la loi POPE de 2005 de financer des travaux chez les particuliers. Pilotage DGEC + PNCEE.
          Période P6 (2026-2030) démarrée le 1<sup>er</sup> janvier 2026 avec 1&nbsp;050 TWhc/an,
          dont 280 TWhc réservés à la précarité énergétique.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Les deux aides s’additionnent sur le plan de financement. Exemple PAC air/eau de
          14&nbsp;000&nbsp;€ TTC, ménage bleu&nbsp;: ~5&nbsp;000&nbsp;€ MPR + plusieurs milliers €
          via Coup de pouce Chauffage. Montants exacts variables (gain énergétique, barème,
          délégataire) — voir simulateurs officiels.
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-xl mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <div className="font-bold text-amber-900">
                Décret 2022-1649 — exclusion des énergies fossiles
              </div>
              <p className="text-sm text-amber-900/90 mt-1 leading-relaxed">
                Depuis le 1<sup>er</sup> janvier 2023, les équipements gaz ou fioul sont exclus de
                MPR. Les chaudières gaz à condensation, PAC hybrides à générateur gaz et PAC air/air
                n’ont <strong>que</strong> la prime CEE.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Parcours */}
      <section id="parcours" className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            2. Quelles sont les deux voies MaPrimeRénov’ en 2026 ?
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-6">
            Depuis la réforme de 2024, MPR distingue deux parcours qui ne cumulent pas leurs
            forfaits sur les mêmes travaux. Choix au dépôt. Cumul prime CEE possible dans les deux
            cas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-charcoal-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5 text-accent-700" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-bold text-charcoal-900">
                  Parcours par geste
                </h3>
              </div>
              <p className="text-sm text-charcoal-700 leading-relaxed mb-3">
                Aide calculée geste par geste (combles, PAC, CET…), forfait MPR propre lu dans
                l’arrêté du 14 janvier 2020 modifié.
              </p>
              <ul className="text-sm text-charcoal-700 space-y-1 list-disc pl-5">
                <li>Un seul geste possible (pas de bouquet)</li>
                <li>Idéal chantiers simples (PAC, poêle, isolation combles)</li>
                <li>Pas d’accompagnateur Rénov’ obligatoire</li>
                <li>Cumulable prime CEE en direct</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-charcoal-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-accent-700" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-bold text-charcoal-900">
                  Parcours Accompagné
                </h3>
              </div>
              <p className="text-sm text-charcoal-700 leading-relaxed mb-3">
                Successeur de MPR Sérénité. Bouquet ≥ 2 gestes, gain ≥ 35&nbsp;% (saut 2 classes DPE
                généralement). Mon Accompagnateur Rénov’ <strong>obligatoire</strong>.
              </p>
              <ul className="text-sm text-charcoal-700 space-y-1 list-disc pl-5">
                <li>Bouquet ≥ 2 gestes, gain ≥ 35 %</li>
                <li>Mon Accompagnateur Rénov’ obligatoire (décret 2022-1035)</li>
                <li>Bonus sortie de passoire (F/G)</li>
                <li>Bonus BBC (A/B)</li>
                <li>CEE BAR-TH-174 (rénovation d’ampleur) s’y adosse naturellement</li>
              </ul>
            </div>
          </div>
          <p className="text-charcoal-700 leading-relaxed mt-6">
            Pour une rénovation complète, le Parcours Accompagné est presque toujours plus
            avantageux (forfaits MPR et coefficient CEE BAR-TH-174 majorés). Pour un geste isolé
            (remplacement chaudière fioul → PAC air/eau), le parcours par geste reste plus simple et
            toujours cumulable avec la prime CEE.
          </p>
        </div>
      </section>

      {/* 3. Tableau familles */}
      <section id="tableau" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-4">
          3. Quelles sont les règles de cumul MaPrimeRénov’ + CEE par famille de travaux ?
        </h2>
        <p className="text-charcoal-700 leading-relaxed mb-8 max-w-3xl">
          Tableau de compatibilité pour les 14 familles résidentielles courantes. La colonne
          «&nbsp;Coup de pouce&nbsp;» indique si une charte CEE bonifiée s’ajoute à la prime CEE
          standard.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-charcoal-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-charcoal-200">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold text-charcoal-700">Famille de travaux</th>
                <th className="px-4 py-3 font-semibold text-charcoal-700">Fiche CEE</th>
                <th className="px-4 py-3 font-semibold text-charcoal-700">MPR</th>
                <th className="px-4 py-3 font-semibold text-charcoal-700">CEE</th>
                <th className="px-4 py-3 font-semibold text-charcoal-700">Coup de pouce</th>
                <th className="px-4 py-3 font-semibold text-charcoal-700">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {FAMILLES.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="px-4 py-3 font-semibold text-charcoal-900">{row.famille}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={row.href}
                      className="text-xs font-mono font-semibold text-accent-700 hover:underline"
                    >
                      {row.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusCell status={row.mpr} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusCell status={row.cee} />
                  </td>
                  <td className="px-4 py-3">
                    {row.coupDePouce ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        Oui
                      </span>
                    ) : (
                      <span className="text-xs text-charcoal-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal-600 leading-relaxed max-w-xs">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-charcoal-900 mt-4 leading-relaxed">
          Sources&nbsp;: arrêté du 14 janvier 2020 modifié, arrêté du 22 décembre 2014 modifié,
          décret n°&nbsp;2022-1649, chartes Coup de pouce. Éligibilité exacte selon performances
          techniques (COP, R, rendement) de chaque fiche.
        </p>
      </section>

      {/* Simulateur CTA */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <SimulateurCTA variant="banner" />
        </div>
      </section>

      {/* 4. Plafonds */}
      <section id="plafonds" className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            4. Quels sont les plafonds de cumul et le reste à charge minimum ?
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            Deux plafonds&nbsp;: dépense éligible MPR par logement sur 5 ans, et taux d’aide maximum
            global. L’arrêté du 14 janvier 2020 modifié fixe le taux cumulé maximum par
            profil&nbsp;:
          </p>
          <div className="bg-white rounded-2xl border border-charcoal-200 overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-sand-50 border-b border-charcoal-200">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-charcoal-700">Profil</th>
                  <th className="px-4 py-3 font-semibold text-charcoal-700">Tranche</th>
                  <th className="px-4 py-3 font-semibold text-charcoal-700">Taux d’aide max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                <tr>
                  <td className="px-4 py-3 font-semibold text-primary-600">Bleu</td>
                  <td className="px-4 py-3 text-charcoal-700">Très modestes</td>
                  <td className="px-4 py-3 text-charcoal-700">Jusqu’à 90 %</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-amber-600">Jaune</td>
                  <td className="px-4 py-3 text-charcoal-700">Modestes</td>
                  <td className="px-4 py-3 text-charcoal-700">Jusqu’à 75 %</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-purple-700">Violet</td>
                  <td className="px-4 py-3 text-charcoal-700">Intermédiaires</td>
                  <td className="px-4 py-3 text-charcoal-700">Jusqu’à 60 %</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-rose-700">Rose</td>
                  <td className="px-4 py-3 text-charcoal-700">Supérieurs</td>
                  <td className="px-4 py-3 text-charcoal-700">Jusqu’à 40 %</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-charcoal-900 mb-6">
            Valeurs indicatives Parcours Accompagné, hors bonifications exceptionnelles. Chiffres
            exacts selon travaux et bonus — simulateur officiel sur maprimerenov.gouv.fr.
          </p>
          <h3 className="font-heading text-xl font-bold text-charcoal-900 mb-3">
            La règle du reste à charge minimum
          </h3>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            Le ménage conserve <strong>toujours un reste à charge minimum</strong>. Règle inscrite
            depuis 2020 dans MPR et renforcée par la loi Climat et Résilience. L’Anah écrête MPR
            pour que MPR + CEE + autres aides publiques ne dépassent jamais le taux ci-dessus. Un
            devis aux aides à 100&nbsp;% est rejeté.
          </p>
          <h3 className="font-heading text-xl font-bold text-charcoal-900 mb-3 mt-6">
            Bonus sortie passoire et bonus BBC
          </h3>
          <p className="text-charcoal-700 leading-relaxed">
            En Parcours Accompagné&nbsp;: bonus sortie de passoire (F/G) + bonus BBC (A/B).
            S’ajoutent aux forfaits par geste ou BAR-TH-174, cumulables avec la prime CEE dans la
            limite du taux maximum.
          </p>
        </div>
      </section>

      {/* 5. Procédure */}
      <section id="procedure" className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
          5. Comment demander le cumul concrètement&nbsp;?
        </h2>
        <p className="text-charcoal-700 leading-relaxed mb-8">
          L’ordre chronologique est déterminant. Une inversion (devis avant accord MPR, dépôt CEE
          antérieur à l’engagement) suffit à rendre le dossier <strong>inéligible</strong>.
        </p>
        <ol className="space-y-5">
          {[
            {
              n: 1,
              title: 'Identifier la fiche CEE et le parcours MPR',
              text: 'Repérer la fiche d’opération (BAR-EN-101, BAR-TH-171…) et choisir parcours par geste ou Parcours Accompagné. Pour ce dernier, contacter un Accompagnateur Rénov’ avant tout devis.',
            },
            {
              n: 2,
              title: 'Devis chez un artisan RGE',
              text: 'RGE actif à la date de signature (vérifier sur france-renov.gouv.fr ou notre annuaire). Devis mentionnant les caractéristiques techniques exigées (R, COP, rendement).',
            },
            {
              n: 3,
              title: 'Déposer le dossier MaPrimeRénov’',
              text: 'Sur maprimerenov.gouv.fr, créer compte, uploader devis + avis d’imposition. Attendre l’accord écrit. Aucun acompte avant cet accord.',
            },
            {
              n: 4,
              title: 'Signer devis et attestation CEE',
              text: 'Une fois l’accord MPR reçu, signer devis + attestation sur l’honneur CEE du délégataire choisi (Effy, Sonergia, TotalEnergies, EDF…). La date fige le cours de la prime CEE.',
            },
            {
              n: 5,
              title: 'Travaux + facture acquittée',
              text: 'Travaux réalisés. Conserver facture acquittée + photos géotaggées (obligatoires depuis la loi du 30 juin 2025).',
            },
            {
              n: 6,
              title: 'Déposer la facture pour paiement',
              text: 'Sur maprimerenov.gouv.fr, déposer la facture (versement Anah 2-4 mois). En parallèle, transmettre le dossier au délégataire CEE (4-12 semaines).',
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-5 items-start">
              <div className="w-10 h-10 rounded-full bg-accent-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                {step.n}
              </div>
              <div>
                <div className="font-bold text-charcoal-900">{step.title}</div>
                <p className="text-charcoal-700 leading-relaxed mt-1">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 bg-rose-50 border-l-4 border-rose-500 p-5 rounded-r-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <div className="font-bold text-rose-900">Pièges classiques</div>
              <ul className="text-sm text-rose-900/90 mt-2 space-y-1 list-disc pl-5">
                <li>Devis signé avant accord MPR → dossier rejeté.</li>
                <li>Démarchage téléphonique CEE → interdit (loi n°&nbsp;2020-901).</li>
                <li>RGE non vérifié à la date de signature → fraude/annulation.</li>
                <li>Promesse de «&nbsp;reste à charge zéro&nbsp;» → arnaque.</li>
              </ul>
              <p className="text-sm text-rose-900/90 mt-3">
                Vérifier l’artisan&nbsp;:{' '}
                <Link href="/rge/fraude-rge-comment-verifier" className="font-semibold underline">
                  Comment vérifier une qualification RGE
                </Link>{' '}
                ou{' '}
                <a
                  href="https://france-renov.gouv.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  france-renov.gouv.fr
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-sand-50 border-t border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-10">
            6. Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((item, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-charcoal-200 hover:border-accent-300 transition p-6"
              >
                <summary className="font-heading font-bold text-lg text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span className="text-accent-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-charcoal-700 mt-4 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Références réglementaires */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4">
          Références réglementaires
        </h2>
        <ul className="text-sm text-charcoal-600 space-y-2 list-disc pl-5 leading-relaxed">
          <li>Code de l’énergie, art. L.&nbsp;221-1 et s. (CEE)</li>
          <li>CCH, art. R.&nbsp;321-1 et s. (Anah / MPR)</li>
          <li>Arrêté du 22 décembre 2014 modifié — opérations standardisées CEE</li>
          <li>Arrêté du 14 janvier 2020 modifié — MaPrimeRénov’</li>
          <li>Décret n°&nbsp;2020-26 du 14 janvier 2020 — création MPR</li>
          <li>Décret n°&nbsp;2022-1649 du 26 décembre 2022 — exclusion fossiles</li>
          <li>Décret n°&nbsp;2022-1035 du 22 juillet 2022 — Mon Accompagnateur Rénov’</li>
          <li>Loi n°&nbsp;2020-901 du 24 juillet 2020 — interdiction démarchage CEE</li>
          <li>Loi Climat et Résilience du 22 août 2021</li>
          <li>CGI, art. 278-0 bis A — TVA 5,5 %</li>
        </ul>
      </section>

      {/* CTA inline CEE */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CeeCTA variant="inline" />
      </div>

      {/* CTA final */}
      <section className="bg-gradient-to-br from-accent-700 to-accent-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">
            Prêt à monter votre dossier&nbsp;?
          </h2>
          <p className="text-accent-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Devis gratuit auprès d’un artisan RGE vérifié, ou approfondissez avec nos ressources
            CEE, RGE et rénovation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-accent-800 font-semibold shadow-lg hover:bg-accent-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Demander un devis gratuit
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-500 text-white font-semibold hover:bg-accent-400 transition"
            >
              <Euro className="w-5 h-5" aria-hidden="true" />
              Catalogue des primes CEE
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-accent-300/60 text-white font-semibold hover:bg-accent-600/30 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Annuaire RGE
            </Link>
            <Link
              href="/cee/guides"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-accent-300/60 text-white font-semibold hover:bg-accent-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Guides CEE
            </Link>
            <Link
              href="/cee/mandataire-vs-direct"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-accent-300/60 text-white font-semibold hover:bg-accent-600/30 transition"
            >
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
              Mandataire ou direct&nbsp;?
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky CTA mobile */}
      <SimulateurCTA variant="sticky-bottom" />
    </>
  )
}
