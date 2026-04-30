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
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'

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
    note: 'Forfait MaPrimeRénov’ selon profil (bleu/jaune/violet/rose). Coup de pouce Isolation actif en 2026.',
  },
  {
    famille: 'Isolation des murs (ITE ou ITI)',
    code: 'BAR-EN-102',
    href: '/cee/bar-en-102',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: false,
    note: 'MPR par geste plafonnée en surface (100 m² en ITE). Bonifications en parcours accompagné.',
  },
  {
    famille: 'Isolation des planchers bas',
    code: 'BAR-EN-103',
    href: '/cee/bar-en-103',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'Résistance thermique minimale exigée (R ≥ 3 m².K/W). Coup de pouce Isolation applicable.',
  },
  {
    famille: 'Fenêtres et parois vitrées',
    code: 'BAR-EN-104',
    href: '/cee/bar-en-104',
    mpr: 'conditionnel',
    cee: 'oui',
    coupDePouce: false,
    note: 'MPR réservée au remplacement d’un simple vitrage par du double vitrage performant. Hors parcours accompagné sinon.',
  },
  {
    famille: 'Pompe à chaleur air/eau haute performance',
    code: 'BAR-TH-171',
    href: '/cee/bar-th-171',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'Forfait MPR majeur pour les profils bleu et jaune. Coup de pouce Chauffage actif (sortie chaudière fossile).',
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
    note: 'COP minimal exigé. Forfait MPR stable sur tous les profils de revenus.',
  },
  {
    famille: 'Chaudière biomasse (granulés, bûches)',
    code: 'BAR-TH-113',
    href: '/cee/bar-th-113',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'Label Flamme Verte 7\u202f\u00e9toiles requis. Coup de pouce Chauffage cumulable avec le forfait MPR.',
  },
  {
    famille: 'Poêle à bois ou à granulés',
    code: 'BAR-TH-112',
    href: '/cee/bar-th-112',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'Rendement minimal 75\u202f% et émissions de particules encadrées.',
  },
  {
    famille: 'VMC double flux',
    code: 'BAR-TH-125',
    href: '/cee/bar-th-125',
    mpr: 'conditionnel',
    cee: 'oui',
    coupDePouce: false,
    note: 'MPR surtout mobilisée en Parcours Accompagné (geste isolé faiblement soutenu).',
  },
  {
    famille: 'Pompe à chaleur eau/eau haute performance',
    code: 'BAR-TH-172',
    href: '/cee/bar-th-172',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: true,
    note: 'PAC géothermique sur nappe. Remplace depuis le 01/01/2024 la BAR-TH-106 chaudière gaz (abrogée, fossiles exclus MPR depuis 2023).',
  },
  {
    famille: 'PAC hybride (PAC + chaudière gaz)',
    code: 'BAR-TH-159',
    href: '/cee/bar-th-159',
    mpr: 'non',
    cee: 'oui',
    coupDePouce: false,
    note: 'Présence d’une chaudière gaz → exclusion MaPrimeRénov’ par le décret fossiles.',
  },
  {
    famille: 'Système solaire combiné (SSC)',
    code: 'BAR-TH-143',
    href: '/cee/bar-th-143',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: false,
    note: 'Forfait MPR élevé. Compatible avec un chauffage d’appoint bois.',
  },
  {
    famille: 'Rénovation d’ampleur maison individuelle',
    code: 'BAR-TH-174',
    href: '/cee/bar-th-174',
    mpr: 'oui',
    cee: 'oui',
    coupDePouce: false,
    note: 'Remplace depuis 2024 l’ancienne BAR-TH-164. Parcours Accompagné obligatoire. Forfait MPR dédié + CEE rénovation d’ampleur (un seul dossier).',
  },
]

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question:
      'Puis-je cumuler MaPrimeRénov’, la prime CEE et l’Éco-PTZ sur le même chantier\u202f?',
    answer:
      'Oui, les trois dispositifs sont cumulables et c’est même une pratique courante. MaPrimeRénov’ est une aide publique versée par l’Anah, la prime CEE est une aide privée financée par les obligés (Effy, Sonergia, TotalEnergies, EDF, Engie…), et l’Éco-prêt à taux zéro (jusqu’à 50\u202f000\u202f€ sur 20 ans) est un crédit bancaire sans intérêts. Les trois peuvent s’additionner sur le même devis, sous trois conditions : l’entreprise est RGE à la date de signature du devis, le total des aides ne dépasse pas 100\u202f% du coût TTC du chantier, et un reste à charge minimum est conservé (règle de l’arrêté du 14 janvier 2020 modifié). En pratique, l’Éco-PTZ finance justement le reste à charge.',
  },
  {
    question: 'La prime CEE est-elle imposable\u202f?',
    answer:
      'Non. La prime CEE versée à un particulier pour des travaux d’économies d’énergie dans sa résidence principale ou secondaire n’est pas soumise à l’impôt sur le revenu. C’est juridiquement une aide et non un revenu. MaPrimeRénov’ n’est pas non plus imposable. Les deux sommes n’ont donc pas à figurer dans la déclaration annuelle de revenus, sauf cas très particuliers des locations meublées soumises à BIC, pour lesquels il faut se rapprocher d’un expert-comptable.',
  },
  {
    question: 'Mon artisan propose un «\u202freste à charge zéro\u202f». Est-ce légal\u202f?',
    answer:
      'Non, c’est un signal d’alarme. Depuis l’arrêté du 14 janvier 2020 modifié et la loi Climat et Résilience, un reste à charge minimum du ménage est obligatoire dès lors que MaPrimeRénov’ est mobilisée. Seul le segment très précaire, sur quelques opérations fortement bonifiées, peut approcher d’un cumul proche de 100\u202f%, sans jamais l’atteindre légalement. Un commercial qui promet «\u202f1\u202f€\u202f» ou «\u202f0\u202f€\u202f» de reste à charge sur un geste isolé en dehors de ce cadre détourne le dispositif. Avant de signer, vérifiez la qualification RGE de l’entreprise sur france-renov.gouv.fr et ne versez jamais d’acompte avant l’accord écrit de MaPrimeRénov’.',
  },
  {
    question: 'Combien de temps entre le dépôt du dossier et le versement des aides\u202f?',
    answer:
      'Pour MaPrimeRénov’, comptez 2 à 4 mois en moyenne entre l’envoi du dossier complet à l’Anah et le versement sur votre compte bancaire, avec des pics pouvant aller à 6 mois en période de forte affluence. Pour la prime CEE, le délai dépend de l’obligé ou délégataire : 4 à 12 semaines après réception du dossier complet (facture acquittée, attestation sur l’honneur, photos géotaggées obligatoires depuis la loi du 30 juin 2025). Les délégataires spécialisés (Effy, Sonergia) sont historiquement plus rapides que les obligés généralistes. En Parcours Accompagné, le versement MPR est échelonné selon l’avancement des travaux.',
  },
  {
    question: 'Qu’est-ce que «\u202fMon Accompagnateur Rénov’\u202f» et est-ce obligatoire\u202f?',
    answer:
      'Mon Accompagnateur Rénov’ est un tiers agréé par l’État (décret n°\u202f2022-1035 du 22 juillet 2022) qui accompagne le ménage dans toutes les étapes de la rénovation: audit énergétique, choix des travaux, aide au montage des dossiers, suivi de chantier, réception. Il est obligatoire pour tout dossier en Parcours Accompagné MaPrimeRénov’ (bouquet de travaux avec gain énergétique ≥\u202f35\u202f%). Il reste facultatif pour MaPrimeRénov’ par geste, sauf cas particuliers (dossiers majorés pour les ménages très modestes ou sortie de passoire énergétique). Son coût peut être pris en charge partiellement par l’Anah (jusqu’à 2\u202f000\u202f€ pour les ménages bleu).',
  },
  {
    question: 'Si mes travaux dépassent le plafond d’aides, qui paie la différence\u202f?',
    answer:
      'Le ménage, via ses fonds propres ou un financement bancaire. Plusieurs outils limitent l’impact: l’Éco-PTZ (50\u202f000\u202f€ maximum sur 20 ans, sans intérêts), le prêt avance rénovation pour les propriétaires âgés, les aides locales (régions, départements, intercommunalités), la TVA à taux réduit 5,5\u202f% qui s’applique de plein droit à toute opération d’économies d’énergie éligible CGI art.\u202f278-0 bis A, et parfois des prêts employeurs Action Logement. La règle d’or reste de bâtir le plan de financement «\u202ftoutes aides comprises\u202f\u00bb avant la signature du devis, jamais après.',
  },
  {
    question: 'Dois-je déposer le dossier CEE avant ou après MaPrimeRénov’?',
    answer:
      'MaPrimeRénov’ d’abord, systématiquement. L’ordre chronologique est imposé: dépôt du devis sur maprimerenov.gouv.fr → accord écrit de l’Anah (indispensable avant toute signature) → signature du devis et de l’attestation sur l’honneur CEE → travaux → facture acquittée → dépôt MaPrimeRénov’ final et dépôt CEE auprès du délégataire. Signer le devis avant l’accord MPR est une erreur fréquente qui rend le dossier inéligible. Côté CEE, la date de signature du devis fige le cours de la prime (en €/MWh cumac) pour toute la durée du chantier.',
  },
]

function StatusCell({ status }: { status: CumulStatus }) {
  if (status === 'oui') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
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
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
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

  return (
    <>
      <JsonLd
        data={
          faqSchema
            ? [breadcrumbSchema, articleSchema, faqSchema]
            : [breadcrumbSchema, articleSchema]
        }
      />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Primes CEE', href: '/cee' },
          { label: 'Cumul MaPrimeRénov’ et CEE' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Landmark className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
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
            className="justify-start mt-2 text-emerald-50/80"
          />
          <p className="text-lg md:text-xl text-emerald-50/90 max-w-3xl leading-relaxed">
            Peut-on cumuler MaPrimeRénov’ et la prime CEE&nbsp;? Oui, dans la grande majorité des
            cas, et c’est même prévu explicitement par la réglementation. Ce guide détaille les
            règles générales, les exceptions (pompe à chaleur air/air, chaudière gaz, PAC hybride),
            les plafonds 2026 et la procédure à suivre pour obtenir les deux aides sur le même
            chantier.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Obtenir un devis gratuit
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
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
                <a href={href} className="text-emerald-700 font-semibold hover:underline">
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
          MaPrimeRénov’ et les Certificats d’Économies d’Énergie (CEE) sont deux dispositifs d’aide
          à la rénovation énergétique distincts, qui coexistent depuis la fusion du crédit d’impôt
          transition énergétique dans MaPrimeRénov’ en 2020 (décret n°&nbsp;2020-26). Les textes
          réglementaires, en particulier l’arrêté du 14 janvier 2020 modifié et l’arrêté du 22
          décembre 2014 modifié pour les CEE, prévoient explicitement leur cumul. C’est la règle, et
          non l’exception.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          MaPrimeRénov’ est une aide publique, financée par l’État et versée par l’Agence nationale
          de l’habitat (Anah). Elle s’adresse aux propriétaires occupants, aux bailleurs et aux
          copropriétés. Son barème est segmenté en quatre profils de revenus, identifiés par un code
          couleur officiel&nbsp;:
        </p>
        <ul className="list-disc pl-6 text-charcoal-700 leading-relaxed mb-4 space-y-1">
          <li>
            <strong>Bleu</strong> — ménages très modestes (forfaits les plus élevés)&nbsp;;
          </li>
          <li>
            <strong>Jaune</strong> — ménages modestes&nbsp;;
          </li>
          <li>
            <strong>Violet</strong> — ménages aux revenus intermédiaires&nbsp;;
          </li>
          <li>
            <strong>Rose</strong> — ménages aisés (forfaits les plus restreints, essentiellement
            ouverts au Parcours Accompagné et à l’isolation).
          </li>
        </ul>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Les plafonds de revenu fiscal de référence sont publiés chaque année sur{' '}
          <strong>maprimerenov.gouv.fr</strong> et varient selon la composition du foyer et la zone
          géographique (Île-de-France ou reste du territoire). Le dispositif est piloté par France
          Rénov’ et non plus «&nbsp;directement par l’Anah&nbsp;» comme c’était le cas en 2020.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Les CEE sont un dispositif distinct, privé dans leur financement mais encadré par l’État.
          Les vendeurs d’énergie (EDF, Engie, TotalEnergies, Auchan, Leclerc, BP…) sont dits
          «&nbsp;obligés&nbsp;» par la loi POPE de 2005&nbsp;: ils doivent financer des travaux
          d’économies d’énergie chez les particuliers, sous peine de pénalités. Le pilotage est
          assuré par la Direction générale de l’énergie et du climat (DGEC) et par le Pôle national
          des CEE (PNCEE). La période P6 (2026-2030) a démarré le 1er janvier 2026 avec une
          obligation annuelle de 1&nbsp;050 TWhc, dont 280 TWhc réservés au segment précarité
          énergétique.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Les deux aides ne se parlent pas directement dans le calcul, mais elles s’additionnent sur
          le plan de financement du ménage. Sur une pompe à chaleur air/eau de 14&nbsp;000&nbsp;€
          TTC, un ménage du profil bleu peut par exemple toucher une part MaPrimeRénov’ de l’ordre
          de 5&nbsp;000&nbsp;€ et une prime CEE «&nbsp;Coup de pouce Chauffage&nbsp;» de plusieurs
          milliers d’euros supplémentaires&nbsp;; les montants exacts dépendent du gain énergétique
          calculé, du barème en vigueur et du délégataire choisi. Les barèmes n’étant pas figés, ce
          guide renvoie systématiquement vers les simulateurs officiels pour les chiffres.
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
                Depuis le 1er janvier 2023, les équipements fonctionnant au gaz ou au fioul sont
                exclus de MaPrimeRénov’. Les chaudières gaz à condensation, les PAC hybrides
                contenant un générateur gaz et la climatisation réversible (PAC air/air) ne
                bénéficient donc <strong>que</strong> de la prime CEE, jamais de MaPrimeRénov’.
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
            Depuis la réforme de 2024, MaPrimeRénov’ distingue deux parcours distincts, qui ne
            cumulent pas leurs forfaits sur les mêmes travaux. Il faut choisir l’un ou l’autre au
            moment du dépôt du dossier. Dans les deux cas, le cumul avec la prime CEE est possible
            et même recommandé.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-charcoal-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-bold text-charcoal-900">
                  Parcours par geste
                </h3>
              </div>
              <p className="text-sm text-charcoal-700 leading-relaxed mb-3">
                L’aide est calculée geste par geste&nbsp;: isolation de combles, remplacement d’une
                chaudière par une pompe à chaleur, installation d’un chauffe-eau thermodynamique,
                etc. Chaque geste a son forfait MaPrimeRénov’ propre, lu dans le tableau de l’arrêté
                du 14 janvier 2020 modifié.
              </p>
              <ul className="text-sm text-charcoal-700 space-y-1 list-disc pl-5">
                <li>Un seul geste possible (pas de bouquet obligatoire)</li>
                <li>Recommandé pour les chantiers simples (PAC, poêle, isolation combles)</li>
                <li>Pas d’accompagnateur Rénov’ obligatoire</li>
                <li>Cumulable prime CEE en direct</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-charcoal-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-bold text-charcoal-900">
                  Parcours Accompagné
                </h3>
              </div>
              <p className="text-sm text-charcoal-700 leading-relaxed mb-3">
                Successeur direct de MaPrimeRénov’ Sérénité. Il finance un bouquet de travaux d’au
                moins deux gestes permettant un gain énergétique minimum de 35&nbsp;% (saut de deux
                classes DPE minimum dans la majorité des cas). Mon Accompagnateur Rénov’ est{' '}
                <strong>obligatoire</strong>.
              </p>
              <ul className="text-sm text-charcoal-700 space-y-1 list-disc pl-5">
                <li>Bouquet &ge; 2 gestes, gain énergétique &ge; 35 %</li>
                <li>Mon Accompagnateur Rénov’ obligatoire (décret 2022-1035)</li>
                <li>Bonus sortie de passoire (F ou G)</li>
                <li>Bonus BBC (atteinte du niveau A ou B)</li>
                <li>
                  Le CEE «&nbsp;BAR-TH-174 rénovation d’ampleur maison individuelle&nbsp;» (qui
                  remplace depuis 2024 l’ancienne BAR-TH-164) s’y adosse naturellement
                </li>
              </ul>
            </div>
          </div>
          <p className="text-charcoal-700 leading-relaxed mt-6">
            Pour un particulier qui veut rénover complètement son logement, le Parcours Accompagné
            sera presque toujours plus avantageux car les forfaits MaPrimeRénov’ et le coefficient
            CEE BAR-TH-174 (rénovation d’ampleur, qui remplace depuis 2024 l’ancienne BAR-TH-164)
            sont majorés. Pour un geste isolé (remplacer une vieille chaudière fioul par une PAC
            air/eau, par exemple), le parcours par geste est plus simple et plus rapide, et reste
            pleinement cumulable avec la prime CEE.
          </p>
        </div>
      </section>

      {/* 3. Tableau familles */}
      <section id="tableau" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-4">
          3. Quelles sont les règles de cumul MaPrimeRénov’ + CEE par famille de travaux ?
        </h2>
        <p className="text-charcoal-700 leading-relaxed mb-8 max-w-3xl">
          Le tableau ci-dessous synthétise la compatibilité des deux aides pour les 14 familles de
          travaux les plus courantes en résidentiel. La colonne «&nbsp;Coup de pouce&nbsp;» indique
          si une charte CEE bonifiée (Coup de pouce Chauffage, Isolation, Rénovation performante)
          peut s’ajouter à la prime CEE standard.
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
                      className="text-xs font-mono font-semibold text-emerald-700 hover:underline"
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
          Sources&nbsp;: arrêté du 14 janvier 2020 modifié (MaPrimeRénov’), arrêté du 22 décembre
          2014 modifié (opérations standardisées CEE), décret n°&nbsp;2022-1649 (exclusion
          fossiles), chartes Coup de pouce en vigueur. Les éligibilités exactes dépendent des
          performances techniques (COP, résistance thermique, rendement…) précisées dans chaque
          fiche d’opération.
        </p>
      </section>

      {/* Simulateur CTA — capte l'intent juste après le tableau de cumul */}
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
            Le cumul MaPrimeRénov’ + CEE n’est pas illimité. Deux plafonds se combinent&nbsp;: un
            plafond propre à MaPrimeRénov’ (dépense éligible par logement, sur une période de cinq
            ans) et un plafond global d’écrêtement exprimé en taux d’aide maximum du coût TTC du
            chantier. L’arrêté du 14 janvier 2020 modifié fixe un taux d’aide cumulé maximum par
            profil&nbsp;:
          </p>
          <div className="bg-white rounded-2xl border border-charcoal-200 overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-sand-50 border-b border-charcoal-200">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-charcoal-700">Profil</th>
                  <th className="px-4 py-3 font-semibold text-charcoal-700">Tranche</th>
                  <th className="px-4 py-3 font-semibold text-charcoal-700">
                    Taux d’aide max (toutes aides publiques cumulées)
                  </th>
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
            Valeurs de référence indicatives pour la configuration la plus courante (Parcours
            Accompagné, hors bonifications exceptionnelles). Les chiffres exacts varient selon le
            type de travaux et les éventuels bonus. Consultez toujours le simulateur officiel sur
            maprimerenov.gouv.fr pour votre situation.
          </p>
          <h3 className="font-heading text-xl font-bold text-charcoal-900 mb-3">
            La règle du reste à charge minimum
          </h3>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            Quelle que soit la combinaison d’aides, le ménage conserve
            <strong> toujours un reste à charge minimum</strong>. C’est une règle cardinale,
            inscrite depuis 2020 dans les textes MPR et renforcée par la loi Climat et Résilience.
            En pratique, l’Anah écrête l’aide MaPrimeRénov’ pour que la somme MPR + CEE + autres
            aides publiques ne dépasse jamais le taux maximum indiqué ci-dessus. Un devis dont
            toutes les aides couvriraient 100&nbsp;% du coût TTC serait automatiquement rejeté.
          </p>
          <h3 className="font-heading text-xl font-bold text-charcoal-900 mb-3 mt-6">
            Bonus sortie passoire et bonus BBC
          </h3>
          <p className="text-charcoal-700 leading-relaxed">
            Deux bonus MaPrimeRénov’ restent mobilisables en Parcours Accompagné en 2026&nbsp;: le
            bonus «&nbsp;sortie de passoire thermique&nbsp;» lorsque les travaux permettent à un
            logement classé F ou G de sortir de ces étiquettes, et le bonus «&nbsp;Bâtiment basse
            consommation&nbsp;» lorsque l’étiquette DPE finale atteint A ou B. Ces bonus s’ajoutent
            aux forfaits par geste ou au forfait BAR-TH-174 (ex BAR-TH-164) et restent cumulables
            avec la prime CEE correspondante, toujours dans la limite du taux d’aide maximum.
          </p>
        </div>
      </section>

      {/* 5. Procédure */}
      <section id="procedure" className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
          5. Comment demander le cumul concrètement&nbsp;?
        </h2>
        <p className="text-charcoal-700 leading-relaxed mb-8">
          L’ordre chronologique des étapes est déterminant. Une inversion (signature de devis avant
          accord MPR, dépôt CEE antérieur à la date d’engagement, etc.) suffit à rendre le dossier
          <strong> inéligible</strong>. Voici le parcours type, qui vaut pour la quasi-totalité des
          chantiers résidentiels.
        </p>
        <ol className="space-y-5">
          {[
            {
              n: 1,
              title: 'Identifier la fiche CEE et le parcours MPR',
              text: 'Repérer la fiche d’opération standardisée correspondant aux travaux (BAR-EN-101, BAR-TH-171…) et décider si vous partez en parcours par geste ou en Parcours Accompagné. Dans le second cas, contactez un Accompagnateur Rénov’ agréé avant toute demande de devis.',
            },
            {
              n: 2,
              title: 'Demander un devis à un artisan RGE',
              text: 'La qualification RGE doit être active à la date de signature du devis. Vérifiez-la sur france-renov.gouv.fr ou via notre annuaire. Le devis doit mentionner explicitement les caractéristiques techniques exigées (résistance thermique, COP, rendement, classe énergétique).',
            },
            {
              n: 3,
              title: 'Déposer le dossier MaPrimeRénov’ en ligne',
              text: 'Rendez-vous sur maprimerenov.gouv.fr, créez votre compte, uploadez le devis, votre avis d’imposition et vos pièces justificatives. Attendez l’accord écrit. Aucun paiement, aucun acompte ne doit intervenir avant cet accord.',
            },
            {
              n: 4,
              title: 'Signer le devis et l’attestation sur l’honneur CEE',
              text: 'Une fois l’accord MPR reçu, signez le devis et l’attestation sur l’honneur CEE fournie par le délégataire choisi (Effy, Sonergia, TotalEnergies, EDF…). La date de signature fige le cours de la prime CEE.',
            },
            {
              n: 5,
              title: 'Travaux + facture acquittée',
              text: 'L’artisan réalise les travaux. Conservez soigneusement la facture acquittée ainsi que les photos géotaggées et horodatées (obligatoires depuis la loi du 30 juin 2025).',
            },
            {
              n: 6,
              title: 'Déposer la facture pour paiement',
              text: 'Sur maprimerenov.gouv.fr, déposez la facture pour déclencher le versement Anah (2 à 4 mois). Parallèlement, transmettez le dossier complet au délégataire CEE pour versement de la prime CEE (4 à 12 semaines).',
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-5 items-start">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0">
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
                <li>
                  Signer le devis avant l’accord MaPrimeRénov’ — dossier irrémédiablement rejeté.
                </li>
                <li>
                  Accepter un démarchage téléphonique CEE — interdit par la loi n°&nbsp;2020-901 du
                  24 juillet 2020.
                </li>
                <li>
                  Artisan RGE non vérifié sur france-renov.gouv.fr à la date de signature — motif de
                  fraude et d’annulation.
                </li>
                <li>
                  Promesse d’un «&nbsp;reste à charge zéro&nbsp;» — contraire à la réglementation,
                  signal d’arnaque.
                </li>
              </ul>
              <p className="text-sm text-rose-900/90 mt-3">
                Pour valider la qualification d’un artisan&nbsp;: consultez notre guide{' '}
                <Link href="/rge/fraude-rge-comment-verifier" className="font-semibold underline">
                  Comment vérifier une qualification RGE
                </Link>{' '}
                ou rendez-vous directement sur{' '}
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
        </div>
      </section>

      {/* Références réglementaires */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4">
          Références réglementaires
        </h2>
        <ul className="text-sm text-charcoal-600 space-y-2 list-disc pl-5 leading-relaxed">
          <li>Code de l’énergie, articles L.&nbsp;221-1 et suivants (CEE)</li>
          <li>
            Code de la construction et de l’habitation, articles R.&nbsp;321-1 et suivants (Anah /
            MaPrimeRénov’)
          </li>
          <li>
            Arrêté du 22 décembre 2014 modifié — opérations standardisées d’économies d’énergie
          </li>
          <li>
            Arrêté du 14 janvier 2020 modifié — prime de transition énergétique (MaPrimeRénov’)
          </li>
          <li>Décret n°&nbsp;2020-26 du 14 janvier 2020 — création de MaPrimeRénov’</li>
          <li>
            Décret n°&nbsp;2022-1649 du 26 décembre 2022 — exclusion des chaudières fonctionnant aux
            énergies fossiles
          </li>
          <li>Décret n°&nbsp;2022-1035 du 22 juillet 2022 — Mon Accompagnateur Rénov’</li>
          <li>
            Loi n°&nbsp;2020-901 du 24 juillet 2020 — interdiction du démarchage téléphonique CEE
          </li>
          <li>Loi Climat et Résilience du 22 août 2021</li>
          <li>CGI, article 278-0 bis A — TVA à 5,5 %</li>
        </ul>
      </section>

      {/* CTA inline CEE */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CeeCTA variant="inline" />
      </div>

      {/* CTA final */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">
            Prêt à monter votre dossier&nbsp;?
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Obtenez un devis gratuit auprès d’un artisan RGE vérifié, ou approfondissez le sujet
            avec nos ressources dédiées CEE, RGE et rénovation énergétique.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Demander un devis gratuit
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition"
            >
              <Euro className="w-5 h-5" aria-hidden="true" />
              Catalogue des primes CEE
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Annuaire RGE
            </Link>
            <Link
              href="/cee/guides"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Guides CEE
            </Link>
            <Link
              href="/cee/mandataire-vs-direct"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
              Mandataire ou direct&nbsp;?
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky CTA mobile — simulateur aides rénovation */}
      <SimulateurCTA variant="sticky-bottom" />
    </>
  )
}
