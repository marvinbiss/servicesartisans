/**
 * Page : /renovation-energetique/travaux/chauffage/tubage-cheminee
 *
 * @kw-primary    tuber une cheminée
 * @kw-volume     350
 * @kw-kd         1
 * @kw-cpc        0.34
 * @cluster       9
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster fumisterie / tubage)
 * @backlog-item  Levier-M-tubage-cheminee
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "tuber une cheminée"        350 vol KD 1 ⭐⭐ pivot
 * - "tubage cheminée prix"   ~  500 vol estimé (cluster cousin Levier I ramonage)
 * - "tubage poêle granulés"  ~  300 vol estimé
 * - "tubage inox"            ~  250 vol estimé
 * - "kit tubage cheminée"    ~  200 vol estimé
 * - Famille cumulée pivot estimée : ~1 600 vol/mois (long-tail fumisterie)
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * Easy win : MOYEN (KD 1, niche technique, complète Levier I ramonage)
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Tubage / fumisterie
 *
 * Anti-cannibalisation :
 *   - /travaux/chauffage/ramonage         = entretien annuel obligatoire (Levier I)
 *   - /travaux/chauffage/poele-granules   = produit poêle granulés (intent install)
 *   - /travaux/chauffage/chaudiere-bois   = chaudière bois (intent install)
 *   - Cette page = TUBAGE = chemisage du conduit pour rendre étanche /
 *     compatible appareil moderne. Métier fumisterie (Qualibat 5921).
 *
 * YMYL high : sécurité conduits (Code construction R136, NF DTU 24.1
 * « Travaux de fumisterie »), incendie cheminée + intoxication CO,
 * assurance habitation (clause conduit certifié). Conduits maçonnés
 * non tubés ne respectent pas les performances modernes (tirage,
 * étanchéité, condensation).
 *
 * Cite : Code construction R136-1 à R136-10, NF DTU 24.1 (fumisterie),
 * NF EN 1856 (conduits métalliques), NF EN 1443 (classes T-P-W),
 * Qualibat 5921, ADEME guide bois énergie, INRS R408 / R430.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Pipette,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  HardHat,
  Flame,
  Ruler,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/tubage-cheminee'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Prix tubage cheminée 2026 : 50-150 €/m + obligation pose'
const DESCRIPTION =
  'Tubage cheminée 2026 : 50-150 €/ml (inox flexible 304L/316L/904L), 1 500-4 000 € posé. Obligation appareils modernes, NF DTU 24.1.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Tubage = chemisage métallique d’un conduit existant pour le rendre étanche, résistant et compatible avec un appareil moderne (poêle, insert, chaudière).',
  'Prix 2026 : tubage flexible inox 304L 50-90 €/ml, inox 316L 70-120 €/ml, inox 904L 100-150 €/ml. Pose complète conduit 6-10 m : 1 500-4 000 € TTC.',
  'Obligation NF DTU 24.1 « fumisterie » + Code construction R136 : tout poêle ou chaudière moderne installé sur conduit maçonné existant doit avoir un tubage certifié.',
  'Classes du conduit (NF EN 1443) : T (température), P (pression), W (résistance condensats). Le tubage doit correspondre à la classe de l’appareil (constructeur).',
  'Inox 316L = standard 2026 polyvalent (poêle bois, granulés, fioul). Inox 904L = haute performance (chaudière condensation, milieu très acide).',
  'Aucune aide MaPrimeRénov’ ni CEE pour le tubage seul. EN REVANCHE : si combiné à la pose d’un poêle granulés ou chaudière biomasse RGE Qualibois, le tubage est inclus dans le devis et bénéficie du barème global.',
]

const TYPES_TUBAGE = [
  {
    type: 'Inox 304L (poêle à bois standard)',
    prixMl: '50 - 90 €/ml',
    application: 'Poêle ou insert bois bûches',
    duree: '15-25 ans',
    note: 'Inox de base, suffisant pour combustion bois sèche. Pas adapté aux granulés (acidité différente) ni aux chaudières condensation.',
  },
  {
    type: 'Inox 316L (multi-énergies)',
    prixMl: '70 - 120 €/ml',
    application: 'Poêle granulés, chaudière fioul, bois mixte',
    duree: '20-30 ans',
    note: 'Standard 2026 polyvalent. Résiste à la corrosion acide des granulés et aux condensats fioul. Choix recommandé en rénovation polyvalente.',
  },
  {
    type: 'Inox 904L (haute performance)',
    prixMl: '100 - 150 €/ml',
    application: 'Chaudière condensation gaz, milieu acide',
    duree: '25-40 ans',
    note: 'Inox haute performance, résiste aux condensats très acides (pH < 4). Quasi-obligatoire pour chaudière condensation gaz à long terme.',
  },
  {
    type: 'Conduit double paroi isolé (sortie verticale)',
    prixMl: '120 - 200 €/ml',
    application: 'Sortie en toiture sans conduit existant',
    duree: '20-30 ans',
    note: 'Pour création complète : 2 parois inox + isolant ceram entre les deux. Permet sortie verticale traversant plancher / charpente / toiture.',
  },
]

const FACTEURS_PRIX = [
  {
    title: 'Type d’appareil raccordé',
    impact: '×1 à ×2',
    desc: 'Poêle bûches : inox 304L 50-90 €/ml. Poêle granulés : inox 316L 70-120 €/ml. Chaudière condensation : 316L ou 904L 100-150 €/ml. Plus l’appareil produit des condensats acides, plus l’inox doit être qualitatif.',
  },
  {
    title: 'Hauteur et configuration du conduit',
    impact: '+15 à +50 %',
    desc: 'Conduit > 8 m : majoration. Conduit avec dévoiements (coudes 30°-45°) : tubage flexible obligatoire, +20-30 %. Conduit non-rectiligne : étude technique préalable.',
  },
  {
    title: 'État du conduit existant',
    impact: '×1,3 à ×2',
    desc: 'Conduit maçonné sain : tubage simple. Bistre dur, fissures, conduit fissuré : débistrage préalable (+200-500 €) ou reconstruction partielle.',
  },
  {
    title: 'Accessibilité',
    impact: '+150 à +600 €',
    desc: 'Toiture facilement accessible : surcoût modeste. Conduit en maison à étages avec accès délicat : nacelle 400-600 €/jour. Conduit traversant plancher : démontage + réfection plâtrerie.',
  },
  {
    title: 'Type de tubage : flexible vs rigide',
    impact: '±20 %',
    desc: 'Flexible : pose plus rapide, idéal conduits avec dévoiements. Rigide : meilleur tirage, durée de vie supérieure, mais nécessite conduit rectiligne. Hybride possible.',
  },
]

const REGLEMENT = [
  {
    title: 'NF DTU 24.1 — Travaux de fumisterie',
    desc: 'Document Technique Unifié de référence pour toute installation, pose ou rénovation de conduits de fumée. Définit dimensions, matériaux, étanchéité, distances de sécurité aux matériaux combustibles (≥ 16 cm typiquement).',
  },
  {
    title: 'Code construction et habitation art. R136-1 à R136-10',
    desc: 'Définit les obligations propriétaire / bailleur en matière de conduits de fumée : compatibilité de l’appareil et du conduit, ramonage annuel (Décret 2023-741), tubage si besoin pour appareils modernes.',
  },
  {
    title: 'NF EN 1443 / NF EN 1856 — classification conduits',
    desc: 'Norme européenne classant les conduits selon : T (température max, ex T200), P (pression, N/P/H), W (étanchéité aux condensats, sec/humide). Le tubage doit correspondre à la plaque signalétique de l’appareil installé.',
  },
  {
    title: 'Distances de sécurité aux matériaux combustibles',
    desc: 'NF DTU 24.1 impose une distance minimale au matériau combustible (charpente bois, isolation laine minérale) selon le type de conduit : 8-16 cm typiquement, sinon protection isolante céramique.',
  },
]

const QUI_CHOISIR = [
  {
    title: 'Fumiste qualifié Qualibat 5921 (fumisterie)',
    must: 'Recommandé',
    desc: 'Préférer un fumiste qualifié Qualibat 5921 ou un installateur RGE Qualibois (poêle granulés / chaudière biomasse). La fumisterie est un métier technique avec responsabilité sécurité directe.',
  },
  {
    title: 'Tubage certifié CE marqué NF EN 1856',
    must: 'Obligatoire',
    desc: 'Le tubage doit porter le marquage CE conforme NF EN 1856-1 (rigide) ou NF EN 1856-2 (flexible) avec sa classe T/P/W indiquée. Refuser tout produit hors marquage CE — risque incendie + nullité assurance.',
  },
  {
    title: 'Étude conduit avec inspection vidéo',
    must: 'Obligatoire',
    desc: 'Avant pose : inspection vidéo du conduit existant (50-150 €). Vérifie l’état, identifie les défauts (fissures, bistre, endommagements). Sans inspection préalable, devis incomplet.',
  },
  {
    title: 'Décennale et RC pro travail en hauteur',
    must: 'Obligatoire',
    desc: 'Le tubage est un ouvrage couvert par la garantie décennale (Code civil art. 1792 — sécurité incendie). Vérifier l’attestation décennale + RC pro mentionnant fumisterie et travail en hauteur.',
  },
  {
    title: 'Plaque signalétique remise à la fin',
    must: 'Obligatoire',
    desc: 'À la fin du chantier, le pro doit poser une plaque signalétique normalisée (NF EN 1443) au bas du conduit, indiquant : classe T/P/W, marque, diamètre intérieur, date de pose. Conserver cette information pour l’assurance.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce qu’un tubage de cheminée ?',
    answer:
      'Le tubage est l’opération qui consiste à insérer un conduit métallique (généralement en inox flexible ou rigide) à l’intérieur d’un conduit maçonné existant. Objectif : rendre le conduit étanche aux fumées et aux condensats, lui donner les performances thermiques et chimiques requises par les appareils modernes (poêles à granulés, chaudières condensation, etc.). Sans tubage, un conduit ancien maçonné ne peut pas accueillir un appareil moderne en toute sécurité ni avec les performances annoncées par le constructeur.',
  },
  {
    question: 'Combien coûte un tubage de cheminée en 2026 ?',
    answer:
      'Le prix dépend du type d’inox et de la longueur. En 2026 : inox 304L 50-90 €/ml (poêle bois standard), inox 316L 70-120 €/ml (granulés, fioul, multi-énergies), inox 904L 100-150 €/ml (chaudière condensation, milieu acide). Pour un conduit standard de 6-10 m, comptez 1 500-4 000 € TTC pose comprise. Conduit double paroi isolé en sortie verticale : 120-200 €/ml. TVA 10 % logement > 2 ans avec artisan.',
  },
  {
    question: 'Un tubage est-il obligatoire pour un poêle à granulés ?',
    answer:
      'OUI dans la quasi-totalité des cas. La NF DTU 24.1 et le Code construction R136 imposent que tout appareil moderne raccordé à un conduit maçonné existant ait un tubage certifié de classe T-P-W compatible. Pour un poêle à granulés (température ≈ 200 °C, condensats acides), le tubage inox 316L est le standard 2026. Sans tubage, l’assurance habitation peut refuser de prendre en charge un sinistre. Et le constructeur du poêle annule sa garantie si l’installation n’est pas conforme.',
  },
  {
    question: 'Quelle différence entre inox 304L, 316L et 904L ?',
    answer:
      'Trois nuances d’inox couramment utilisées en fumisterie 2026 : (1) 304L = standard alimentaire, suffisant pour bois bûches. (2) 316L = ajout de molybdène, résiste à la corrosion acide des granulés, fioul, mixte — choix recommandé en polyvalent. (3) 904L = haute performance, résiste aux condensats très acides (pH < 4) — typique chaudière condensation gaz. Plus la nuance est élevée, plus le tubage est durable mais plus cher (de 30 à 70 % au-dessus du 304L).',
  },
  {
    question: 'Y a-t-il des aides MaPrimeRénov’ ou CEE pour le tubage ?',
    answer:
      'Pas pour le tubage SEUL. EN REVANCHE, si le tubage est réalisé dans le cadre de la pose d’un poêle à granulés, d’une chaudière biomasse ou d’une chaudière à condensation gaz par un installateur RGE Qualibois ou QualiPAC, il est INCLUS dans le devis global et bénéficie du barème MaPrimeRénov’ + CEE applicable à l’appareil. Demander explicitement à l’installateur : « le tubage est-il inclus dans le devis, et dans le coût pris en compte par MPR/CEE ? ».',
  },
  {
    question: 'Combien de temps dure un tubage ?',
    answer:
      'Durée de vie typique 2026 : tubage inox 304L 15-25 ans, 316L 20-30 ans, 904L 25-40 ans. Cette durée varie selon : (1) la qualité de la combustion (bois sec = bonne, bois humide = corrosion accélérée), (2) la fréquence d’entretien (ramonage annuel obligatoire, Décret 2023-741), (3) la présence de bistre dur. Un tubage bien entretenu et utilisé avec du bois sec peut atteindre 30-40 ans. Inspection vidéo recommandée tous les 5-10 ans.',
  },
  {
    question: 'Peut-on tuber soi-même sa cheminée ?',
    answer:
      'NON, c’est fortement déconseillé. Le tubage est un ouvrage de sécurité incendie + sécurité gaz brûlés (CO). Il est couvert par la garantie décennale, ce qui implique une qualification (Qualibat 5921 ou RGE Qualibois). En cas d’incendie ou d’intoxication CO, l’assurance habitation peut refuser la prise en charge si le tubage a été posé en auto-construction. De plus, le travail en hauteur (Code travail R4323-58) impose des EPI et une formation. Confier à un fumiste pro est la seule option sérieuse en 2026.',
  },
  {
    question: 'Tubage flexible ou rigide : que choisir ?',
    answer:
      'Tubage FLEXIBLE : conduits avec dévoiements (coudes), pose rapide, idéal pour conduits anciens en maçonnerie irrégulière. Inox 304L ou 316L principalement. Durée de vie 15-30 ans selon nuance. Tubage RIGIDE : meilleur tirage, durée de vie supérieure (jusqu’à 40 ans en 904L), mais nécessite un conduit rectiligne. Souvent assemblé par éléments de 1 m. Solution hybride : flexible dans les tronçons droits, rigide dans les longues sections rectilignes. Choisir selon la configuration du conduit existant et le diagnostic vidéo préalable.',
  },
]

const sources = [
  {
    label: 'AFNOR / NF DTU 24.1 — Travaux de fumisterie',
    url: 'https://www.boutique.afnor.org',
  },
  {
    label: 'Légifrance — Code construction art. R136-1 à R136-10',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000045748867/',
  },
  {
    label: 'AFNOR / NF EN 1443 + NF EN 1856 — classification conduits',
    url: 'https://www.boutique.afnor.org',
  },
  {
    label: 'Légifrance — Décret 2023-741 (ramonage annuel)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047943089',
  },
  {
    label: 'Qualibat — référentiel 5921 fumisterie',
    url: 'https://www.qualibat.com',
  },
  {
    label: 'INRS — Travail en hauteur recommandations R408 / R430',
    url: 'https://www.inrs.fr/risques/chutes-hauteur',
  },
  { label: 'ADEME — Bois énergie, conduits et fumisterie', url: 'https://librairie.ademe.fr' },
]

const relatedPages = [
  {
    label: 'Hub Chauffage rénovation',
    href: '/renovation-energetique/travaux/chauffage',
  },
  {
    label: 'Ramonage cheminée (obligation annuelle)',
    href: '/renovation-energetique/travaux/chauffage/ramonage',
  },
  {
    label: 'Poêle à granulés (prix + aides)',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
  },
  {
    label: 'Chaudière à bois',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
  },
  {
    label: 'Chaudière condensation gaz',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
  },
  {
    label: 'Trouver un fumiste / installateur Qualibois',
    href: '/rge/renovation-energetique',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — Chauffage — Tubage / fumisterie',
    keywords: [
      'tuber une cheminée',
      'tubage cheminée prix',
      'tubage poêle granulés',
      'tubage inox 316L',
      'fumisterie',
      'NF DTU 24.1',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Tubage cheminée', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              { label: 'Tubage cheminée' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Pipette className="w-3.5 h-3.5" aria-hidden />
              Chauffage &middot; Tubage / fumisterie
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Tuber une cheminée en 2026 : prix 50-150 €/ml et obligation
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, tuber une cheminée coûte <strong>50-150 € par mètre linéaire</strong> selon
              la nuance d’inox (304L, 316L ou 904L). Pour un conduit de 6 à 10 m, comptez{' '}
              <strong>1 500-4 000 €</strong> posé. Le tubage est <strong>obligatoire</strong> au
              titre de la <strong>NF DTU 24.1</strong> dès que vous installez un appareil moderne
              (poêle, insert, chaudière condensation) sur un conduit maçonné existant.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 4 types de tubage en 2026</h2>
            <p>
              Le choix dépend de l’appareil raccordé (température, condensats, classe T-P-W) et de
              la configuration du conduit existant :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Prix au ml</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Application
                    </th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Durée de vie
                    </th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {TYPES_TUBAGE.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prixMl}
                      </td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">
                        {row.application}
                      </td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.duree}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs nationaux 2026, hors options (débistrage, inspection vidéo, plâtrerie). TVA
                10 % logement &gt; 2 ans avec artisan.
              </p>
            </div>

            <h2>5 facteurs qui font varier le prix</h2>
            <div className="not-prose grid gap-3 my-6">
              {FACTEURS_PRIX.map((factor) => (
                <div
                  key={factor.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{factor.title}</p>
                      <span className="text-xs font-semibold text-primary-800 bg-primary-50 px-2 py-0.5 rounded">
                        {factor.impact}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{factor.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Réglementation et normes 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {REGLEMENT.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <Ruler className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose border-2 border-red-300 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    Sans tubage conforme NF DTU 24.1 : assurance possible non couverte
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    En cas d’incendie de cheminée, intoxication CO ou dégât conduit, l’assurance
                    habitation peut <strong>refuser la prise en charge</strong> si le tubage n’est
                    pas certifié CE NF EN 1856 et conforme NF DTU 24.1, ou s’il n’a pas été posé par
                    un fumiste qualifié. Conserver précieusement la facture, le marquage CE du
                    tubage et la plaque signalétique.
                  </p>
                </div>
              </div>
            </div>

            <h2>5 critères pour choisir un fumiste</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUI_CHOISIR.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <HardHat className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          item.must === 'Obligatoire'
                            ? 'text-red-800 bg-red-50'
                            : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {item.must}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Flame className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis tubage cheminée en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 fumistes Qualibat 5921 ou installateurs RGE Qualibois vous répondent sous 48
                    h. Devis avec inspection vidéo, marquage CE NF EN 1856 et garantie pose.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/renovation-energetique"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Annuaire fumistes <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Aide au calcul : votre budget tubage 2026</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Conduit <strong>6 m</strong> en inox 316L pour poêle granulés : ~600-720 € matériel
                + pose 800-1 200 € = total ~1 500-2 000 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Conduit <strong>8 m</strong> en inox 904L pour chaudière condensation : ~1 000-1 200
                € matériel + pose 1 200-1 800 € = total ~2 500-3 500 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Création <strong>complète sortie verticale</strong> double paroi 6 m : ~1 200-2 000
                € matériel + pose 1 500-2 500 € = total ~3 000-4 500 €.
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Si
                couplé à pose poêle granulés ou chaudière biomasse RGE Qualibois : tubage inclus
                dans le devis global, MPR + CEE applicables au montant total appareil + tubage.
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> TVA 10
                % automatique avec artisan dans logement &gt; 2 ans.
              </li>
            </ul>
          </article>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedPages.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-center justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all text-sand-800"
                  >
                    <span className="text-sm font-medium">{g.label}</span>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <FlagshipAuthorCard
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/chauffage/ramonage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Ramonage cheminée
            </Link>
            <Link
              href="/renovation-energetique/travaux/chauffage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Hub Chauffage <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
