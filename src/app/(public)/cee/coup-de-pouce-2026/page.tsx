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
import { SITE_URL, getAlternates, SITE_NAME } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
} from '@/lib/seo/jsonld'

export const revalidate = 86400

const PAGE_PATH = '/cee/coup-de-pouce-2026'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-04-09'
const MODIFIED = '2026-04-09'

export const metadata: Metadata = {
  title: 'Coup de pouce CEE 2026 : chartes actives et bonifications',
  description:
    "Panorama neutre et sourcé des chartes Coup de pouce CEE actives en 2026 : chauffage résidentiel individuel, rénovation d'ampleur (MI et appartement), rénovation performante collectif, chauffage bâtiments collectifs et tertiaires. Cadre juridique, opérations concernées, parcours, cumul MaPrimeRénov' et pièges à éviter.",
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
    status: 'Charte active en 2026 — dépôt des chartes signataires avant le 01/02/2026',
    icon: Flame,
    legal:
      "Instituée par l'arrêté du 25 mars 2020 modifié (NOR : TRER2008220A) pris en application de l'article L221-7 du code de l'énergie. Elle est publiée au Bulletin officiel du ministère chargé de l'énergie et consultable sur Légifrance.",
    perimeter:
      "Remplacement, en maison individuelle ou appartement à usage de résidence principale, d'un équipement de chauffage individuel au charbon, au fioul ou au gaz (hors condensation pour certains gestes) par un équipement utilisant une énergie renouvelable ou de récupération. La fiche BAR-TH-106 (chaudière gaz THPE) est abrogée depuis le 01/01/2024 et n'entre plus dans le périmètre.",
    operations: [
      'BAR-TH-171 — pompe à chaleur air/eau (remplace la BAR-TH-104 abrogée le 01/01/2024)',
      'BAR-TH-172 — pompe à chaleur eau/eau ou sol/eau',
      'BAR-TH-113 — chaudière biomasse individuelle performante',
      'BAR-TH-143 — système solaire combiné (SSC)',
      "BAR-TH-137 — raccordement d'un logement existant à un réseau de chaleur alimenté majoritairement par des EnR&R",
      "BAR-TH-112 — appareil indépendant de chauffage au bois (en remplacement d'un équipement au charbon)",
    ],
    signers:
      "Signataires : obligés et délégataires CEE volontaires (vendeurs d'énergie et leurs délégataires inscrits au registre national). La liste des signataires effectifs est publiée et mise à jour sur le site du ministère chargé de l'énergie ; elle évolue au fil des adhésions et des retraits.",
    conditions:
      "Le dispositif distingue les ménages en situation de précarité énergétique (modestes et très modestes, au sens de l'arrêté du 30 mars 2020) et les autres ménages. La bonification s'exprime sous forme de coefficient multiplicateur appliqué au volume CEE de base de l'opération, plus élevé pour les ménages modestes.",
    amounts:
      'Depuis 2022, les montants planchers de prime en euros par profil de ménage ne sont plus imposés par arrêté : chaque signataire fixe ses propres barèmes. La charte fixe en revanche les coefficients multiplicateurs de bonification (ordre de grandeur : ×5 sur le volume CEE pour une PAC ou une chaudière biomasse chez un ménage modeste, ×2 pour un système solaire combiné, ×5 ou ×4 pour un appareil bois selon profil). Le montant final en euros dépend du signataire, de la localisation du bien et du profil du ménage — à simuler sur le site du signataire ou sur ecologie.gouv.fr/politiques-publiques/coup-pouce-chauffage.',
    end: "Charte ouverte en 2026 : les obligés et délégataires peuvent la signer jusqu'au 01/02/2026, les opérations engagées sous charte restent éligibles selon les délais de l'arrêté en vigueur. Vérifier la dernière version sur Légifrance avant tout engagement.",
  },
  {
    key: 'renovation-mi',
    label: "Coup de pouce Rénovation d'ampleur (maison individuelle et appartement)",
    status: "Charte active en 2026 — prolongée par l'arrêté du 7 janvier 2026",
    icon: HomeIcon,
    legal:
      "Instituée par l'arrêté du 8 octobre 2020 modifié, pris en application de l'article L221-7 du code de l'énergie, et prolongée par l'arrêté du 7 janvier 2026 (JORFTEXT000053373748), en vigueur depuis le 17/01/2026. Elle encadre la bonification CEE des opérations de rénovation d'ampleur en maison individuelle et en appartement.",
    perimeter:
      "Rénovation d'ampleur d'une maison individuelle ou d'un appartement existant, occupé à titre de résidence principale. Les résidences secondaires sont exclues du bénéfice de la charte. Les travaux doivent permettre un saut de 2 classes DPE minimum, attesté par un audit énergétique avant/après.",
    operations: [
      "BAR-TH-174 — rénovation d'ampleur d'une maison individuelle (remplace la BAR-TH-164 abrogée)",
      "BAR-TH-175 — rénovation d'ampleur d'un appartement",
      'Audit énergétique préalable obligatoire',
      'Réalisation des travaux par des entreprises titulaires du signe de qualité RGE pour chaque lot concerné',
    ],
    signers:
      'Signataires : obligés et délégataires volontaires. Le bénéficiaire doit contractualiser avec un signataire de la charte avant la signature du devis.',
    conditions:
      "Saut de 2 classes DPE minimum calculé selon la méthode prévue par l'arrêté, résidence principale uniquement, résidences secondaires expressément exclues. Les plafonds MaPrimeRénov' Parcours accompagné s'appliquent pour le cumul avec l'aide publique.",
    amounts:
      "La bonification prend la forme d'un coefficient multiplicateur appliqué au volume CEE de base de l'opération BAR-TH-174 ou BAR-TH-175, variable selon le nombre de classes DPE gagnées. Depuis 2022, aucun montant plancher en euros n'est imposé par arrêté : chaque signataire fixe son propre barème. Le montant final dépend du signataire, de la surface, du gain énergétique et du profil du ménage — à simuler sur le site du signataire.",
    end: "Pas de date limite d'achèvement fixée par l'arrêté du 7 janvier 2026 ; la charte reste en vigueur tant qu'elle n'est pas abrogée par un arrêté ultérieur.",
  },
  {
    key: 'renovation-collectif',
    label: 'Coup de pouce Rénovation performante de bâtiment résidentiel collectif',
    status: "Charte active en 2026 — prolongée par l'arrêté du 7 janvier 2026",
    icon: HomeIcon,
    legal:
      "Prolongée par l'arrêté du 7 janvier 2026 (JORFTEXT000053373748), en vigueur depuis le 17/01/2026, pris en application de l'article L221-7 du code de l'énergie. Elle encadre la bonification CEE des opérations de rénovation performante en copropriété et logement social.",
    perimeter:
      "Rénovation performante d'un bâtiment résidentiel collectif existant (copropriété, bailleur social), avec un bouquet de travaux permettant un gain énergétique significatif attesté par audit avant/après.",
    operations: [
      "BAR-TH-177 — rénovation performante d'un bâtiment résidentiel collectif",
      'Audit énergétique préalable obligatoire',
      'Réalisation des travaux par des entreprises titulaires du signe de qualité RGE pour chaque lot concerné',
    ],
    signers:
      'Signataires : obligés et délégataires volontaires. Le syndic ou le bailleur contractualise avec un signataire de la charte avant la signature du devis des travaux.',
    conditions:
      "Gain énergétique minimal fixé par l'arrêté, sur la base de la méthode de calcul officielle. Les exigences techniques et documentaires suivent la fiche BAR-TH-177.",
    amounts:
      "Bonification sous forme de coefficient multiplicateur appliqué au volume CEE de base de l'opération BAR-TH-177. Depuis 2022, aucun montant plancher en euros n'est imposé par arrêté : chaque signataire fixe son barème. Le montant final dépend du signataire, de la surface rénovée et du gain énergétique — à simuler sur le site du signataire.",
    end: "Charte prolongée par l'arrêté du 7 janvier 2026 ; sa date de fin est fixée par arrêté, vérifier la dernière version sur Légifrance avant tout engagement.",
  },
  {
    key: 'chauffage-collectif',
    label: 'Coup de pouce Chauffage des bâtiments collectifs et tertiaires',
    status: 'Charte active en 2026 — vérifier la dernière version sur Légifrance',
    icon: Flame,
    legal:
      "Instituée sur le fondement de l'article L221-7 du code de l'énergie, publiée au Bulletin officiel du ministère chargé de l'énergie. Elle encadre la bonification CEE du remplacement d'équipements de chauffage dans les bâtiments résidentiels collectifs et tertiaires.",
    perimeter:
      "Remplacement d'une chaudière charbon, fioul ou gaz par un équipement utilisant une énergie renouvelable ou de récupération, ou raccordement à un réseau de chaleur EnR&R, dans un bâtiment résidentiel collectif ou un bâtiment tertiaire existant.",
    operations: [
      'BAR-TH-137 — raccordement à un réseau de chaleur alimenté majoritairement par des EnR&R (résidentiel collectif)',
      'BAR-TH-178 / BAR-TH-179 / BAR-TH-180 — équipements de chauffage performants en résidentiel collectif',
      "BAT-TH-127 — raccordement d'un bâtiment tertiaire à un réseau de chaleur EnR&R",
      'BAT-TH-162 / BAT-TH-163 / BAT-TH-164 — équipements de chauffage performants en tertiaire',
    ],
    signers:
      "Signataires : obligés et délégataires CEE volontaires. Le maître d'ouvrage (syndic, bailleur social, gestionnaire tertiaire) contractualise avec un signataire de la charte avant la signature du devis.",
    conditions:
      "Les exigences techniques suivent les fiches d'opérations standardisées correspondantes. Les contrôles sur site prévus par l'arrêté du 28 septembre 2021 modifié s'appliquent.",
    amounts:
      "Bonification sous forme de coefficient multiplicateur appliqué au volume CEE de base de chaque opération. Aucun montant plancher en euros n'est imposé par arrêté depuis 2022 : chaque signataire fixe son barème. Le montant final dépend du signataire, de la surface traitée et du type d'équipement — à simuler sur le site du signataire.",
    end: 'Charte reconduite par arrêté ; vérifier la dernière version en vigueur sur Légifrance avant tout engagement.',
  },
]

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Le Coup de pouce est-il systématique ?',
    answer:
      "Non. Les chartes Coup de pouce sont facultatives pour les obligés et les délégataires : ils les signent s'ils le souhaitent, en fonction de leur stratégie d'approvisionnement en CEE. Un bénéficiaire ne peut donc obtenir la bonification que s'il contractualise avec un signataire effectif de la charte concernée, avant la signature du devis. Vérifiez toujours que le nom de votre délégataire ou obligé figure sur la liste publiée par le ministère chargé de l'énergie.",
  },
  {
    question: 'Qui finance réellement le Coup de pouce ?',
    answer:
      "Le financement reste intégralement supporté par l'obligé signataire de la charte, c'est-à-dire le vendeur d'énergie soumis à l'obligation CEE prévue à l'article L221-1 du code de l'énergie. L'obligé répercute ce coût dans le prix de l'énergie qu'il facture à ses clients finaux. Le Coup de pouce n'est pas une aide d'État au sens budgétaire : c'est une bonification contractuelle privée, encadrée par arrêté, qu'un obligé s'engage à verser en contrepartie d'un volume de CEE bonifié.",
  },
  {
    question: 'Peut-on cumuler plusieurs Coup de pouce ?',
    answer:
      "Le cumul dépend de la rédaction de chaque charte. Certaines opérations « Coup de pouce Chauffage » et « Coup de pouce Rénovation performante » sont exclusives l'une de l'autre lorsqu'elles portent sur le même geste, car un même kWh cumac ne peut être bonifié deux fois. En revanche, on peut en principe cumuler deux chartes sur deux opérations distinctes (par exemple une PAC bonifiée et un raccordement au réseau de chaleur), sous réserve que les arrêtés applicables ne l'interdisent pas. Demandez systématiquement confirmation écrite au signataire.",
  },
  {
    question: 'Que se passe-t-il quand une charte Coup de pouce prend fin ?',
    answer:
      "La date de fin d'une charte est fixée par l'arrêté qui l'a créée. Au-delà, les dossiers engagés avant l'échéance restent traités selon la charte d'origine, à condition que la date d'engagement (signature du devis, bon de commande ou contrat) soit antérieure à la fin de la charte et que le dépôt au PNCEE intervienne dans le délai imparti par l'arrêté. Les nouveaux devis signés après l'échéance retombent au forfait CEE classique, sans bonification.",
  },
  {
    question: 'Puis-je négocier le montant de la prime Coup de pouce ?',
    answer:
      "Oui, très souvent. Depuis 2022, les montants planchers en euros par profil de ménage ne sont plus imposés par arrêté : chaque signataire fixe librement son propre barème, dans le respect des coefficients multiplicateurs de bonification prévus par la charte. À opération identique, la différence de prime entre deux signataires peut être significative — comparez systématiquement plusieurs propositions avant d'arrêter votre choix. Attention toutefois à la transparence du reste à charge : un montant affiché élevé peut parfois masquer des frais d'accompagnement facturés à côté. Et soyez vigilant sur la date d'engagement (voir règles du parcours) : changer de signataire après la signature du devis peut rendre le dossier inéligible.",
  },
  {
    question: 'Un artisan peut-il refuser un Coup de pouce ?',
    answer:
      "Oui. L'artisan n'est pas signataire de la charte : il réalise simplement les travaux. S'il n'a pas de partenariat avec un délégataire signataire, ou s'il préfère travailler avec un autre circuit CEE, il peut refuser d'intégrer le Coup de pouce dans son devis. Dans ce cas, le bénéficiaire peut soit choisir un autre artisan RGE partenaire d'un signataire de la charte, soit contractualiser directement avec un délégataire signataire et demander à l'artisan de facturer sans prime intégrée.",
  },
]

function getArticleSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
      { '@type': 'Thing', name: "Certificats d'économies d'énergie" },
      { '@type': 'Thing', name: 'Chartes Coup de pouce' },
      { '@type': 'Thing', name: "Code de l'énergie, article L221-7" },
    ],
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

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={governmentServiceSchema} />
      <JsonLd data={financialProductSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Primes CEE', href: '/cee' },
          { label: 'Coup de pouce 2026' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Guide neutre — article L221-7 du code de l’énergie
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-5">
            Coup de pouce CEE 2026&nbsp;: chartes actives et bonifications
          </h1>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
            className="justify-start mt-2 text-emerald-50/80"
          />
          <p className="text-lg md:text-xl text-emerald-50/90 leading-relaxed">
            Les chartes «&nbsp;Coup de pouce&nbsp;» bonifient certaines primes CEE d’une opération
            standardisée. Ce guide recense les chartes actives en 2026, leur cadre juridique, les
            opérations concernées et le parcours à suivre pour en bénéficier sans se faire piéger.
          </p>
          <div
            className="speakable-summary mt-6 text-base md:text-lg text-emerald-50/80 leading-relaxed border-l-2 border-emerald-400/40 pl-4"
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
          Les «&nbsp;Coup de pouce&nbsp;» sont devenus, depuis leur lancement en 2019, l’un des
          leviers les plus visibles du dispositif des certificats d’économies d’énergie. Ils ne
          créent pas de nouvelles opérations&nbsp;: ils
          <em> majorent</em> le volume de CEE généré par une opération déjà standardisée, en
          contrepartie d’un engagement contractuel pris par un obligationé ou un délégataire auprès
          de l’État.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Cet article décrit ce qu’est juridiquement un Coup de pouce, liste les chartes actives ou
          historiques en 2026, explique le parcours à suivre côté particulier et l’articulation avec
          MaPrimeRénov’, et signale les pièges fréquents. Les données chiffrées exactes sont
          volontairement renvoyées aux sites officiels — france-renov.gouv.fr et
          maprimerenov.gouv.fr — car les montants peuvent être ajustés par arrêté en cours d’année.
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
              contractuelle d’une opération standardisée CEE. Il ne définit pas lui-même une
              opération nouvelle&nbsp;: il s’adosse à une fiche existante (exemple BAR-TH-171 pour
              une pompe à chaleur air/eau) et applique un coefficient multiplicateur au volume de
              CEE généré, dont la contrepartie est versée par le signataire de la charte au
              bénéficiaire final sous forme de prime. Depuis 2022, les montants planchers en euros
              par profil de ménage ne sont plus imposés par arrêté&nbsp;: chaque signataire fixe
              librement son propre barème.
            </p>
            <p>
              <strong>Cadre réglementaire.</strong> Les chartes Coup de pouce sont prises sur le
              fondement de l’article L221-7 du code de l’énergie, qui autorise le ministre chargé de
              l’énergie à bonifier certaines opérations par arrêté. Chaque dispositif fait l’objet
              d’un arrêté sectoriel (arrêté du 25 mars 2020 modifié pour le chauffage, arrêté du 8
              octobre 2020 modifié puis prolongé par l’arrêté du 7 janvier 2026 pour la rénovation
              d’ampleur), publié au Bulletin officiel du ministère chargé de l’énergie et
              consultable sur Légifrance. L’ensemble du dispositif s’inscrit depuis le 1
              <sup>er</sup> janvier 2026 dans la{' '}
              <strong>
                6<sup>e</sup> période CEE
              </strong>{' '}
              (01/01/2026 &ndash; 31/12/2030), encadrée par l’arrêté du 21 décembre 2025
              (JORFTEXT000053158200) et le décret n°&nbsp;2025-1048.
            </p>
            <p>
              <strong>Principe économique.</strong> L’obligé ou le délégataire signe une charte
              d’engagement avec l’État. En échange, il obtient un bonus de volume CEE sur les
              opérations concernées, qu’il s’engage à reverser au bénéficiaire final sous forme de
              prime majorée. Le coût total reste supporté par l’obligé, qui le répercute ensuite
              dans le prix de l’énergie qu’il vend à ses clients. Le Coup de pouce n’est donc pas
              une subvention publique, même s’il en donne souvent l’apparence dans la communication
              grand public.
            </p>
            <p>
              <strong>Portée.</strong> Un Coup de pouce ne crée aucun droit automatique&nbsp;: il ne
              s’applique que si le bénéficiaire contractualise avec un signataire effectif de la
              charte, avant la signature du devis des travaux. C’est cette antériorité de
              l’engagement qui conditionne juridiquement l’éligibilité.
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
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-700" />
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
                d: "Seules les entreprises titulaires du signe de qualité RGE (Reconnu garant de l'environnement) correspondant à l'opération peuvent réaliser les travaux ouvrant droit à la prime CEE. Vérifiez la validité du RGE sur france-renov.gouv.fr ; un RGE expiré ou sur un autre domaine de travaux disqualifie le dossier.",
              },
              {
                t: "S'engager AVANT la signature du devis",
                d: "L'engagement auprès du signataire de la charte (création d'un compte, acceptation des CGU, validation de l'opération) doit impérativement précéder la signature du devis de l'artisan. La date d'engagement est contrôlée au PNCEE. Toute antériorité du devis entraîne le rejet du dossier.",
              },
              {
                t: 'Obtenir le devis mentionnant la prime bonifiée',
                d: "L'artisan émet ensuite le devis, qui doit mentionner de manière lisible la prime Coup de pouce prévue (montant ou référence à la charte) et le nom du signataire. C'est la preuve commerciale de la bonification.",
              },
              {
                t: 'Signer l’engagement et réaliser les travaux',
                d: "Le bénéficiaire signe le devis, puis les travaux sont réalisés conformément aux règles techniques de la fiche d'opération standardisée (isolant certifié ACERMI, PAC avec COP minimum, etc.). Les photos géotaggées et justificatifs techniques sont collectés au fil du chantier.",
              },
              {
                t: 'Déposer le dossier dans les délais',
                d: "Une fois les travaux achevés et payés, le dossier complet (attestation sur l'honneur, facture, preuves techniques) est transmis au signataire, qui le dépose au PNCEE. Le délai habituel est de l'ordre de deux mois après la fin des travaux ; la charte et l'arrêté applicable fixent la règle exacte.",
              },
              {
                t: 'Recevoir la prime versée par le signataire',
                d: "Le paiement intervient après validation du dossier par le signataire — parfois avant dépôt PNCEE, parfois après, selon le modèle. En cas de retard anormal, consultez la médiation nationale de l'énergie.",
              },
            ].map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-4 bg-white border border-charcoal-200 rounded-lg p-4"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0">
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
              className="text-emerald-700 underline hover:text-emerald-800"
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
              Depuis 2023, la politique publique des CEE et des Coup de pouce poursuit trois
              tendances de fond. La première est le
              <strong> durcissement progressif</strong> des critères techniques des
              opérations&nbsp;: coefficients de performance minimaux rehaussés, contrôles sur site
              renforcés par l’arrêté du 28 septembre 2021 modifié, exigences documentaires accrues.
            </p>
            <p>
              La deuxième est la <strong>révision à la baisse des bonifications</strong> les plus
              généreuses, observée en particulier sur les chartes historiques qui avaient alimenté
              les offres «&nbsp;à 1&nbsp;euro&nbsp;» entre 2019 et 2021. Ce mouvement vise à
              rééquilibrer le reste à charge et à limiter les effets d’aubaine.
            </p>
            <p>
              La troisième est le <strong>retrait progressif des opérations fossiles</strong> du
              périmètre des Coup de pouce&nbsp;: les bonifications sur les chaudières au gaz, déjà
              très encadrées, sont en voie d’extinction, dans la ligne de la stratégie nationale bas
              carbone. Les PAC, les chaudières biomasse et les raccordements à des réseaux de
              chaleur EnR&R concentrent désormais l’essentiel de l’effort.
            </p>
            <p>
              <strong>Chartes clôturées à ne pas confondre.</strong> Plusieurs chartes Coup de pouce
              historiquement connues ne sont <em>plus actives</em> en 2026 et doivent être écartées
              de toute communication commerciale. Le
              <strong> Coup de pouce Isolation</strong>, qui a alimenté les offres «&nbsp;à
              1&nbsp;euro&nbsp;» entre 2019 et 2021, a été clôturé le
              <strong> 30 juin 2022</strong>. Le{' '}
              <strong>Coup de pouce Pilotage connecté du chauffage</strong> (fiche BAR-TH-173), qui
              bonifiait l’installation de systèmes de régulation pièce par pièce, a été
              <strong> supprimé par l’arrêté du 18 novembre 2024</strong> (JORFTEXT000050626971).
              Ces deux bonifications ne peuvent plus être proposées en 2026&nbsp;; toute promesse
              commerciale les évoquant comme actives constitue une information trompeuse.
            </p>
            <p>
              Ces tendances sont factées&nbsp;; les calendriers précis de sortie dépendent toutefois
              de chaque arrêté modificatif et peuvent évoluer. C’est une raison supplémentaire de
              vérifier la version à jour de chaque texte avant de s’engager.
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
            <BookOpen className="w-7 h-7 text-emerald-700" />
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
        <div className="bg-gradient-to-br from-emerald-50 to-primary-50 border border-emerald-100 rounded-2xl p-8">
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
              className="flex items-start gap-3 bg-white border border-charcoal-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
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
              className="flex items-start gap-3 bg-white border border-charcoal-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-charcoal-900">Guides CEE par opération</div>
                <div className="text-sm text-charcoal-600">Isolation, chauffage, ventilation</div>
              </div>
            </Link>
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="flex items-start gap-3 bg-white border border-charcoal-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
            >
              <FileCheck2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-charcoal-900">MaPrimeRénov’ + CEE</div>
                <div className="text-sm text-charcoal-600">Règles de cumul et plafonds</div>
              </div>
            </Link>
            <Link
              href="/cee/mandataire-vs-direct"
              className="flex items-start gap-3 bg-white border border-charcoal-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
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
