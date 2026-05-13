import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Flame,
  Home as HomeIcon,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

import CeeCTA from '@/components/cee/CeeCTA'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, getAlternates, SITE_NAME } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'

export const revalidate = 86400

const PAGE_PATH = '/cee/coup-de-pouce-2026'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-04-09'
const MODIFIED = '2026-04-09'
const AUTHOR = authors['claire-dubois']
const REVIEWER = getReviewerForAuthor(AUTHOR)

export const metadata: Metadata = {
  title: 'Coup de pouce CEE 2026 : chartes actives',
  description:
    "Découvrez les chartes Coup de pouce CEE actives en 2026 : chauffage, rénovation d'ampleur, collectif et tertiaire. Cadre juridique, cumul MaPrimeRénov', pièges.",
  alternates: getAlternates(PAGE_PATH),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Coup de pouce CEE 2026 : chartes actives et bonifications',
    description:
      "Chartes Coup de pouce CEE en vigueur en 2026 : chauffage, rénovation d'ampleur, rénovation collectif, chauffage collectif/tertiaire. Définitions, opérations, parcours et cumul avec MaPrimeRénov'.",
    type: 'article',
    locale: 'fr_FR',
    url: PAGE_URL,
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coup de pouce CEE 2026 : chartes actives',
    description:
      "Bonifications CEE 2026 : chauffage, rénovation d'ampleur, rénovation collectif, chauffage collectif. Cadre juridique et parcours bénéficiaire.",
  },
}

type ChartKey = 'chauffage' | 'renovation-mi' | 'renovation-collectif' | 'chauffage-collectif'

const CHARTS: Array<{
  key: ChartKey
  label: string
  status: string
  icon: React.ComponentType<{ className?: string }>
  legal: string
  perimeter: string
  operations: string[]
  signers: string
  conditions: string
  amounts: string
  end: string
}> = [
  {
    key: 'chauffage',
    label: 'Coup de pouce Chauffage (résidentiel individuel)',
    status: 'Active 2026 — dépôt signataires avant le 01/02/2026',
    icon: Flame,
    legal:
      "Arrêté du 25 mars 2020 modifié (NOR : TRER2008220A), article L221-7 du code de l'énergie. Publication au Bulletin officiel et sur Légifrance.",
    perimeter:
      "Remplacement, en résidence principale (maison individuelle ou appartement), d'un chauffage individuel charbon/fioul/gaz par un équipement EnR&R. Fiche BAR-TH-106 (gaz THPE) abrogée le 01/01/2024.",
    operations: [
      'BAR-TH-171 — PAC air/eau',
      'BAR-TH-172 — PAC eau/eau ou sol/eau',
      'BAR-TH-113 — chaudière biomasse individuelle',
      'BAR-TH-143 — système solaire combiné (SSC)',
      'BAR-TH-137 — raccordement réseau de chaleur EnR&R',
      'BAR-TH-112 — appareil bois (remplacement charbon)',
    ],
    signers:
      "Obligés et délégataires CEE volontaires. Liste des signataires effectifs publiée et mise à jour sur le site du ministère chargé de l'énergie.",
    conditions:
      'Distinction ménages modestes / très modestes (arrêté du 30 mars 2020) vs autres. Coefficient multiplicateur appliqué au volume CEE de base, plus élevé pour les ménages modestes.',
    amounts:
      'Depuis 2022, plus de montant plancher en euros : chaque signataire fixe son barème. La charte fixe les coefficients (≈ ×5 PAC ou biomasse pour ménage modeste, ×2 SSC, ×5 ou ×4 bois selon profil). Simulation sur le site du signataire ou ecologie.gouv.fr/politiques-publiques/coup-pouce-chauffage.',
    end: "Ouverte en 2026, signature jusqu'au 01/02/2026. Opérations engagées sous charte restent éligibles selon délais de l'arrêté. Vérifier Légifrance avant engagement.",
  },
  {
    key: 'renovation-mi',
    label: "Coup de pouce Rénovation d'ampleur (maison individuelle et appartement)",
    status: "Active 2026 — prolongée par l'arrêté du 7 janvier 2026",
    icon: HomeIcon,
    legal:
      "Arrêté du 8 octobre 2020 modifié, prolongé par l'arrêté du 7 janvier 2026 (JORFTEXT000053373748), en vigueur depuis le 17/01/2026. Article L221-7 du code de l'énergie.",
    perimeter:
      'Maison individuelle ou appartement existant, résidence principale uniquement (résidences secondaires exclues). Saut de 2 classes DPE minimum, audit énergétique avant/après obligatoire.',
    operations: [
      'BAR-TH-174 — rénovation maison individuelle',
      'BAR-TH-175 — rénovation appartement',
      'Audit énergétique préalable obligatoire',
      'Entreprises RGE pour chaque lot concerné',
    ],
    signers:
      'Obligés et délégataires volontaires. Contractualisation avec un signataire avant signature du devis.',
    conditions:
      "Saut ≥ 2 classes DPE selon méthode de l'arrêté. Résidence principale exclusive. Plafonds MaPrimeRénov' Parcours accompagné applicables au cumul.",
    amounts:
      'Coefficient multiplicateur sur le volume CEE de base BAR-TH-174/175, variable selon classes DPE gagnées. Aucun plancher en euros depuis 2022 : barème fixé par chaque signataire selon surface, gain et profil ménage.',
    end: "Pas de date limite fixée par l'arrêté du 7 janvier 2026 ; en vigueur tant qu'aucun arrêté postérieur ne l'abroge.",
  },
  {
    key: 'renovation-collectif',
    label: 'Coup de pouce Rénovation performante de bâtiment résidentiel collectif',
    status: "Active 2026 — prolongée par l'arrêté du 7 janvier 2026",
    icon: HomeIcon,
    legal:
      "Arrêté du 7 janvier 2026 (JORFTEXT000053373748), en vigueur depuis le 17/01/2026. Article L221-7 du code de l'énergie.",
    perimeter:
      'Bâtiment résidentiel collectif existant (copropriété, bailleur social), bouquet de travaux avec gain énergétique attesté par audit avant/après.',
    operations: [
      'BAR-TH-177 — rénovation performante collectif',
      'Audit énergétique préalable obligatoire',
      'Entreprises RGE pour chaque lot concerné',
    ],
    signers:
      'Obligés et délégataires volontaires. Syndic ou bailleur contractualise avec un signataire avant signature du devis.',
    conditions:
      "Gain énergétique minimal fixé par l'arrêté ; exigences techniques de la fiche BAR-TH-177.",
    amounts:
      'Coefficient multiplicateur sur le volume CEE BAR-TH-177. Aucun plancher en euros depuis 2022 : barème fixé par chaque signataire selon surface et gain.',
    end: "Prolongée par l'arrêté du 7 janvier 2026 ; date de fin par arrêté, vérifier Légifrance avant engagement.",
  },
  {
    key: 'chauffage-collectif',
    label: 'Coup de pouce Chauffage des bâtiments collectifs et tertiaires',
    status: 'Active 2026 — vérifier dernière version sur Légifrance',
    icon: Flame,
    legal:
      "Article L221-7 du code de l'énergie, publication au Bulletin officiel du ministère chargé de l'énergie.",
    perimeter:
      'Remplacement chaudière charbon/fioul/gaz par équipement EnR&R ou raccordement à un réseau de chaleur EnR&R, en résidentiel collectif ou tertiaire existant.',
    operations: [
      'BAR-TH-137 — raccordement réseau chaleur EnR&R (collectif)',
      'BAR-TH-178/179/180 — équipements chauffage collectif',
      'BAT-TH-127 — raccordement réseau chaleur EnR&R (tertiaire)',
      'BAT-TH-162/163/164 — équipements chauffage tertiaire',
    ],
    signers:
      "Obligés et délégataires CEE volontaires. Maître d'ouvrage (syndic, bailleur, gestionnaire tertiaire) contractualise avant signature du devis.",
    conditions:
      "Exigences techniques des fiches d'opérations standardisées. Contrôles sur site de l'arrêté du 28 septembre 2021 modifié.",
    amounts:
      'Coefficient multiplicateur sur le volume CEE de chaque opération. Aucun plancher en euros depuis 2022 : barème par signataire selon surface et équipement.',
    end: 'Reconduite par arrêté ; vérifier dernière version sur Légifrance avant engagement.',
  },
]

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Le Coup de pouce est-il systématique ?',
    answer:
      "Non. Les chartes sont facultatives pour les obligés et délégataires : ils les signent selon leur stratégie d'approvisionnement CEE. La bonification suppose donc une contractualisation avec un signataire effectif, avant signature du devis. Vérifiez le nom du signataire sur la liste publiée par le ministère.",
  },
  {
    question: 'Qui finance réellement le Coup de pouce ?',
    answer:
      "L'obligé signataire (vendeur d'énergie soumis à l'obligation CEE, article L221-1). Il répercute le coût dans le prix de l'énergie facturé à ses clients. Ce n'est pas une aide d'État budgétaire mais une bonification contractuelle privée encadrée par arrêté.",
  },
  {
    question: 'Peut-on cumuler plusieurs Coup de pouce ?',
    answer:
      'Le cumul dépend de chaque charte. Sur un même geste, Chauffage et Rénovation performante sont exclusifs (un kWh cumac ne peut être bonifié deux fois). Sur deux opérations distinctes (ex. PAC + raccordement réseau), le cumul est possible sauf interdiction des arrêtés. Demandez confirmation écrite au signataire.',
  },
  {
    question: 'Que se passe-t-il quand une charte prend fin ?',
    answer:
      "La date de fin est fixée par l'arrêté. Les dossiers engagés avant échéance (devis signé, bon de commande) restent traités selon la charte d'origine si le dépôt PNCEE intervient dans le délai. Les nouveaux devis signés après retombent au forfait CEE classique, sans bonification.",
  },
  {
    question: 'Puis-je négocier le montant de la prime ?',
    answer:
      "Oui. Depuis 2022, plus de plancher en euros : chaque signataire fixe son barème dans la limite des coefficients de la charte. Les écarts sont parfois significatifs — comparez plusieurs propositions. Attention au reste à charge réel (frais d'accompagnement parfois facturés à côté) et à la date d'engagement : changer de signataire après devis peut rendre le dossier inéligible.",
  },
  {
    question: 'Un artisan peut-il refuser un Coup de pouce ?',
    answer:
      "Oui. L'artisan n'est pas signataire de la charte. Sans partenariat avec un délégataire signataire ou par préférence pour un autre circuit, il peut refuser d'intégrer la prime au devis. Le bénéficiaire peut alors choisir un autre RGE partenaire d'un signataire, ou contractualiser directement avec un délégataire et demander à l'artisan de facturer sans prime intégrée.",
  },
]

function getArticleSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${PAGE_URL}#article`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    image: `${SITE_URL}/opengraph-image`,
    headline: 'Coup de pouce CEE 2026 : chartes actives et bonifications',
    description:
      "Panorama neutre et sourcé des chartes Coup de pouce CEE actives en 2026 : chauffage résidentiel individuel, rénovation d'ampleur, rénovation performante collectif, chauffage collectif et tertiaire. Cadre juridique, parcours bénéficiaire et cumul MaPrimeRénov'.",
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': PAGE_URL,
    },
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: "Certificats d'économies d'énergie (CEE)",
    keywords: [
      'Coup de pouce CEE',
      'chartes 2026',
      'chauffage résidentiel',
      "rénovation d'ampleur",
      'chauffage collectif',
      'tertiaire',
      "MaPrimeRénov'",
    ].join(', '),
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
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    about: [
      { '@type': 'Thing', name: "Certificats d'économies d'énergie" },
      { '@type': 'Thing', name: 'Chartes Coup de pouce' },
      { '@type': 'Thing', name: "Code de l'énergie, article L221-7" },
    ],
    ...spreadCitationsForTopics('CEE Coup de pouce MaPrimeRénov rénovation énergétique'),
  }
}

export default function CoupDePouce2026Page() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: 'Coup de pouce 2026', url: PAGE_PATH },
  ])

  const articleSchema = getArticleSchema()
  const faqSchema = getFAQSchema(FAQ)

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: 'Coup de pouce CEE 2026',
    description:
      "Bonifications contractuelles des primes CEE instituées par arrêté au titre de l'article L221-7 du code de l'énergie : charte Chauffage résidentiel individuel (arrêté 25 mars 2020 modifié), charte Rénovation d'ampleur maison individuelle et appartement (arrêté 8 octobre 2020 modifié, prolongé par l'arrêté 7 janvier 2026), charte Rénovation performante de bâtiment résidentiel collectif et charte Chauffage des bâtiments collectifs et tertiaires.",
    url: PAGE_URL,
    serviceType: 'Bonification CEE à la rénovation énergétique',
    audience:
      'Propriétaires occupants et bailleurs de résidence principale (maison individuelle et appartement), syndics de copropriété, bailleurs sociaux, gestionnaires de bâtiments tertiaires',
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: [
      'https://www.ecologie.gouv.fr/politiques-publiques/coup-pouce-chauffage',
      'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
      'https://france-renov.gouv.fr/aides/cee',
      'https://www.legifrance.gouv.fr/',
    ],
  })

  const financialProductSchema = getFinancialProductSchema({
    name: 'Prime Coup de pouce CEE bonifiée',
    description:
      "Prime CEE majorée par un coefficient multiplicateur fixé par arrêté (ordre de grandeur : ×5 sur le volume CEE pour une PAC ou une chaudière biomasse chez un ménage modeste, ×2 pour un système solaire combiné). Depuis 2022, aucun montant plancher en euros n'est imposé par arrêté : chaque signataire fixe son propre barème. La prime est versée par l'obligé ou le délégataire signataire de la charte au bénéficiaire final.",
    url: PAGE_URL,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Aucun frais à la charge du bénéficiaire pour bénéficier de la bonification. L'engagement auprès du signataire doit impérativement précéder la signature du devis sous peine de rejet du dossier au PNCEE. Cumul possible avec MaPrimeRénov' dans la limite du reste à charge minimum imposé par les décrets applicables.",
  })

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema,
    articleSchema,
    governmentServiceSchema as Record<string, unknown>,
    financialProductSchema as Record<string, unknown>,
  ]
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Primes CEE', href: '/cee' },
          { label: 'Coup de pouce 2026' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-4 h-4 text-accent-300" />
            <span className="text-sm font-medium text-accent-100">
              Guide neutre — article L221-7 du code de l’énergie
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-5"
          >
            Coup de pouce CEE 2026&nbsp;: chartes actives et bonifications
          </h1>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
            className="justify-start mt-2 text-accent-50/80"
          />
          <p className="text-lg md:text-xl text-accent-50/90 leading-relaxed">
            Les chartes «&nbsp;Coup de pouce&nbsp;» bonifient certaines primes CEE d’une opération
            standardisée. Ce guide recense les chartes actives en 2026, leur cadre juridique, les
            opérations concernées et le parcours à suivre pour en bénéficier sans se faire piéger.
          </p>
          <div
            className="speakable-summary mt-6 text-base md:text-lg text-accent-50/80 leading-relaxed border-l-2 border-accent-400/40 pl-4"
            data-speakable="true"
          >
            <p>
              Un Coup de pouce est une bonification contractuelle d’une prime CEE, définie par une
              charte signée entre l’État et un obligationé ou délégataire. La bonification est
              reversée au bénéficiaire final sous forme de prime majorée. Engagement obligatoire
              <em> avant</em> signature du devis, artisan RGE, dépôt dans les délais&nbsp;: trois
              règles d’or.
            </p>
          </div>
        </div>
      </section>

      {/* Intro éditoriale */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-charcoal-700 leading-relaxed text-lg mb-4">
          Depuis 2019, les «&nbsp;Coup de pouce&nbsp;» sont l’un des leviers les plus visibles des
          CEE. Ils ne créent pas d’opérations nouvelles&nbsp;: ils <em>majorent</em> le volume CEE
          d’une opération déjà standardisée, contre un engagement contractuel pris par un
          obligationé ou un délégataire auprès de l’État.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Ce guide décrit le cadre juridique, recense les chartes actives en 2026, détaille le
          parcours côté particulier, l’articulation avec MaPrimeRénov’ et les pièges fréquents. Les
          montants exacts sont renvoyés aux sites officiels (france-renov.gouv.fr,
          maprimerenov.gouv.fr) car ils peuvent évoluer par arrêté en cours d’année.
        </p>
      </section>

      {/* Qu'est-ce qu'un Coup de pouce */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            Qu’est-ce qu’un Coup de pouce CEE&nbsp;?
          </h2>
          <div className="space-y-4 text-charcoal-700 leading-relaxed">
            <p>
              <strong>Définition juridique.</strong> Un Coup de pouce est une bonification
              contractuelle d’une opération standardisée CEE. Il s’adosse à une fiche existante
              (ex&nbsp;: BAR-TH-171 PAC air/eau) et applique un coefficient multiplicateur au volume
              CEE généré, reversé par le signataire au bénéficiaire sous forme de prime majorée.
              Depuis 2022, plus de montant plancher en euros&nbsp;: chaque signataire fixe son
              barème.
            </p>
            <p>
              <strong>Cadre réglementaire.</strong> Article L221-7 du code de l’énergie, déclinaison
              par arrêtés sectoriels (25 mars 2020 modifié pour le chauffage, 8 octobre 2020 modifié
              prolongé par arrêté du 7 janvier 2026 pour la rénovation d’ampleur). Le dispositif
              s’inscrit depuis le 1<sup>er</sup> janvier 2026 dans la{' '}
              <strong>
                6<sup>e</sup> période CEE
              </strong>{' '}
              (01/01/2026&nbsp;– 31/12/2030), encadrée par l’arrêté du 21 décembre 2025
              (JORFTEXT000053158200) et le décret n°&nbsp;2025-1048.
            </p>
            <p>
              <strong>Principe économique.</strong> L’obligé ou délégataire signe la charte, obtient
              un bonus de volume CEE sur les opérations concernées et le reverse au bénéficiaire en
              prime majorée. Le coût reste supporté par l’obligé et répercuté dans le prix de
              l’énergie. Ce n’est pas une subvention publique malgré l’apparence.
            </p>
            <p>
              <strong>Portée.</strong> Aucun droit automatique&nbsp;: la bonification suppose une
              contractualisation avec un signataire effectif <em>avant</em> signature du devis.
              Cette antériorité conditionne juridiquement l’éligibilité.
            </p>
          </div>
        </div>
      </section>

      {/* CTA inline après explication */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CeeCTA variant="inline" />
      </div>

      {/* Chartes actives 2026 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
          Quelles chartes Coup de pouce CEE sont actives en 2026&nbsp;?
        </h2>
        <p className="text-charcoal-600 max-w-3xl mb-4 leading-relaxed">
          Le tableau ci-dessous recense les chartes en vigueur ou historiquement publiées. Le statut
          d’une charte peut évoluer par arrêté en cours d’année. En cas de doute, vérifier la
          dernière version publiée sur Légifrance et sur france-renov.gouv.fr avant tout engagement.
        </p>
        <div className="inline-flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-10 text-sm text-amber-900 max-w-3xl">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Les informations ci-dessous sont données à titre pédagogique&nbsp;; elles ne se
            substituent pas aux arrêtés en vigueur au jour du devis. Seul le texte publié au
            Bulletin officiel fait foi.
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {CHARTS.map((c) => {
            const Icon = c.icon
            return (
              <article
                key={c.key}
                className="bg-white border border-charcoal-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-50 border border-accent-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-accent-700" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-charcoal-900 leading-tight">
                      {c.label}
                    </h3>
                    <p className="text-xs text-charcoal-900 mt-1">{c.status}</p>
                  </div>
                </div>
                <dl className="space-y-3 text-sm text-charcoal-700 leading-relaxed">
                  <div>
                    <dt className="font-semibold text-charcoal-900">Base juridique</dt>
                    <dd>{c.legal}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-charcoal-900">Périmètre</dt>
                    <dd>{c.perimeter}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-charcoal-900">Opérations concernées</dt>
                    <dd>
                      <ul className="list-disc pl-5 space-y-1">
                        {c.operations.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-charcoal-900">Signataires</dt>
                    <dd>{c.signers}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-charcoal-900">Conditions d’éligibilité</dt>
                    <dd>{c.conditions}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-charcoal-900">Montants indicatifs</dt>
                    <dd>{c.amounts}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-charcoal-900">Date de fin</dt>
                    <dd>{c.end}</dd>
                  </div>
                </dl>
              </article>
            )
          })}
        </div>
      </section>

      {/* Comment bénéficier */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            Comment bénéficier d’un Coup de pouce CEE en 2026&nbsp;?
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-6">
            Le parcours est strict et l’ordre des étapes est
            <em> opposable</em>&nbsp;: une inversion, même de bonne foi, peut faire rejeter le
            dossier au PNCEE et priver le bénéficiaire de la prime.
          </p>
          <ol className="space-y-4">
            {[
              {
                t: 'Choisir un artisan RGE',
                d: "Seules les entreprises RGE (Reconnu garant de l'environnement) sur l'opération concernée peuvent réaliser les travaux. Vérifier la validité sur france-renov.gouv.fr ; un RGE expiré ou hors domaine disqualifie le dossier.",
              },
              {
                t: "S'engager AVANT la signature du devis",
                d: "L'engagement auprès du signataire (création de compte, validation de l'opération) doit précéder la signature du devis. La date est contrôlée au PNCEE ; toute antériorité du devis entraîne le rejet.",
              },
              {
                t: 'Obtenir le devis mentionnant la prime bonifiée',
                d: "Le devis de l'artisan doit mentionner lisiblement la prime Coup de pouce (montant ou référence à la charte) et le nom du signataire.",
              },
              {
                t: 'Signer et réaliser les travaux',
                d: "Travaux conformes à la fiche d'opération standardisée (isolant ACERMI, PAC avec COP minimum, etc.). Photos géotaggées et justificatifs techniques collectés au fil du chantier.",
              },
              {
                t: 'Déposer le dossier dans les délais',
                d: "Dossier complet (attestation sur l'honneur, facture, preuves techniques) transmis au signataire, qui dépose au PNCEE. Délai usuel : ~2 mois après fin de travaux ; règle exacte fixée par la charte et l'arrêté.",
              },
              {
                t: 'Recevoir la prime',
                d: "Paiement après validation par le signataire (avant ou après dépôt PNCEE selon le modèle). En cas de retard anormal, médiateur national de l'énergie.",
              },
            ].map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-4 bg-white border border-charcoal-200 rounded-lg p-4"
              >
                <div className="w-8 h-8 rounded-full bg-accent-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 mb-1">{s.t}</h3>
                  <p className="text-sm text-charcoal-700 leading-relaxed">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cumul MaPrimeRénov' */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
          Coup de pouce + MaPrimeRénov’&nbsp;: cumul possible&nbsp;?
        </h2>
        <div className="space-y-4 text-charcoal-700 leading-relaxed">
          <p>
            <strong>Oui, en principe.</strong> MaPrimeRénov’ (aide publique versée par l’Anah) et la
            prime CEE — y compris bonifiée par un Coup de pouce — relèvent de deux logiques
            distinctes&nbsp;: l’une est budgétaire, l’autre est une obligation privée pesée sur les
            vendeurs d’énergie. Le cumul est autorisé par principe, sauf disposition contraire
            expressément prévue dans la charte Coup de pouce ou dans l’arrêté encadrant
            MaPrimeRénov’.
          </p>
          <p>
            <strong>Précaution pratique.</strong> Le total des aides ne peut toutefois pas dépasser
            le coût réel des travaux&nbsp;: un plafond de reste à charge minimum est en général
            imposé, en particulier pour les ménages modestes et très modestes, par les décrets
            applicables à MaPrimeRénov’. Les simulateurs officiels de france-renov.gouv.fr et
            maprimerenov.gouv.fr intègrent cette règle et donnent un chiffrage fiable avant
            signature.
          </p>
          <p>
            Pour un panorama détaillé du cumul et de ses limites, voir notre guide&nbsp;:{' '}
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="text-accent-700 underline hover:text-accent-800"
            >
              MaPrimeRénov’ et CEE&nbsp;: règles de cumul
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Évolutions 2026 */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            Quelles sont les évolutions 2026 du Coup de pouce CEE&nbsp;?
          </h2>
          <div className="space-y-4 text-charcoal-700 leading-relaxed">
            <p>
              Trois tendances de fond depuis 2023 : <strong>durcissement technique</strong>{' '}
              (coefficients de performance rehaussés, contrôles renforcés par l’arrêté du 28
              septembre 2021 modifié), <strong>révision à la baisse des bonifications</strong> les
              plus généreuses pour limiter les effets d’aubaine, et{' '}
              <strong>retrait progressif des opérations fossiles</strong> (chaudières gaz en voie
              d’extinction). PAC, biomasse et réseaux EnR&R concentrent désormais l’effort.
            </p>
            <p>
              <strong>Chartes clôturées à ne pas confondre.</strong> Le{' '}
              <strong>Coup de pouce Isolation</strong> (offres « à 1 € » 2019–2021) a été clôturé le
              30 juin 2022. Le <strong>Coup de pouce Pilotage connecté du chauffage</strong>{' '}
              (BAR-TH-173) a été supprimé par l’arrêté du 18 novembre 2024 (JORFTEXT000050626971).
              Ces deux bonifications ne peuvent plus être proposées en 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Pièges et arnaques */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-amber-600" />
          Quels pièges et arnaques éviter sur le Coup de pouce CEE&nbsp;?
        </h2>
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h3 className="font-semibold text-charcoal-900 mb-1">
              Le mirage du «&nbsp;1&nbsp;euro symbolique&nbsp;»
            </h3>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              Certaines offres agressives annoncent une installation à 1&nbsp;euro en omettant le
              reste à charge minimum imposé par la réglementation pour les opérations aidées, ou en
              facturant des prestations annexes à part. Depuis 2021, les offres «&nbsp;à
              1&nbsp;euro&nbsp;» ne sont plus autorisées pour la majorité des gestes de rénovation.
              Méfiance absolue en cas de promesse de ce type.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h3 className="font-semibold text-charcoal-900 mb-1">
              Démarchage téléphonique illicite
            </h3>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              La loi n°&nbsp;2020-901 du 24 juillet 2020 interdit le démarchage téléphonique pour la
              vente d’équipements ou la réalisation de travaux d’économies d’énergie dans les
              logements. Tout appel non sollicité vantant un «&nbsp;Coup de pouce&nbsp;» est donc
              présumé illégal. Raccrochez et signalez à la DGCCRF via SignalConso.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h3 className="font-semibold text-charcoal-900 mb-1">Fausse promesse de cumul</h3>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              Certains intermédiaires annoncent un cumul «&nbsp;gratuit&nbsp;» entre plusieurs
              chartes Coup de pouce pour la même opération, alors qu’un même kWh cumac ne peut être
              bonifié deux fois. Résultat pratique&nbsp;: la prime effectivement versée au dépôt est
              inférieure à celle annoncée, et le bénéficiaire se retrouve avec un reste à charge
              inattendu.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-8 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-accent-700" />
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((f, i) => (
              <details key={i} className="bg-white border border-charcoal-200 rounded-lg p-5 group">
                <summary className="font-semibold text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-4">
                  <span>{f.question}</span>
                  <ArrowRight className="w-4 h-4 text-charcoal-400 flex-shrink-0 mt-1 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-charcoal-700 leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA fin */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-gradient-to-br from-accent-50 to-primary-50 border border-accent-100 rounded-2xl p-8">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
            Aller plus loin
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-6">
            Quatre ressources complémentaires pour ma&icirc;triser votre dossier CEE avant de signer
            un devis&nbsp;:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/cee"
              className="flex items-start gap-3 bg-white border border-charcoal-200 rounded-lg p-4 hover:border-accent-300 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-accent-700 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-charcoal-900">
                  Primes CEE&nbsp;: panorama général
                </div>
                <div className="text-sm text-charcoal-600">
                  Le dispositif, les acteurs, les opérations
                </div>
              </div>
            </Link>
            <Link
              href="/cee/guides"
              className="flex items-start gap-3 bg-white border border-charcoal-200 rounded-lg p-4 hover:border-accent-300 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-accent-700 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-charcoal-900">Guides CEE par opération</div>
                <div className="text-sm text-charcoal-600">Isolation, chauffage, ventilation</div>
              </div>
            </Link>
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="flex items-start gap-3 bg-white border border-charcoal-200 rounded-lg p-4 hover:border-accent-300 transition-colors"
            >
              <FileCheck2 className="w-5 h-5 text-accent-700 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-charcoal-900">MaPrimeRénov’ + CEE</div>
                <div className="text-sm text-charcoal-600">Règles de cumul et plafonds</div>
              </div>
            </Link>
            <Link
              href="/cee/mandataire-vs-direct"
              className="flex items-start gap-3 bg-white border border-charcoal-200 rounded-lg p-4 hover:border-accent-300 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-accent-700 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-charcoal-900">
                  Obligé, délégataire, mandataire
                </div>
                <div className="text-sm text-charcoal-600">Les 3 rôles du circuit CEE</div>
              </div>
            </Link>
          </div>
          <p className="text-xs text-charcoal-900 mt-6 flex items-center gap-2">
            <ExternalLink className="w-3 h-3" />
            Sources officielles&nbsp;: legifrance.gouv.fr, france-renov.gouv.fr,
            maprimerenov.gouv.fr, Bulletin officiel du ministère chargé de l’énergie.
          </p>
        </div>
      </section>
    </>
  )
}
