/**
 * Page : /renovation-energetique/travaux/charpente
 *
 * @kw-primary    charpente
 * @kw-volume     8700
 * @kw-kd         0
 * @kw-cpc        0.37
 * @cluster       7
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster couverture / charpente)
 * @backlog-item  Levier-K-charpente
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "charpente"           8 700 vol, KD 0 ⭐⭐⭐⭐ MEGA EASY pivot
 * - "charpentier"         8 700 vol, KD 0 ⭐⭐⭐⭐
 * - "charpentier couvreur" 2 000 vol, KD 0
 * - "tuber une cheminée"   350 vol, KD 1 (cousin fumisterie)
 * - Famille cumulée pivot : ~19 400 vol/mois (Pages Jaunes #51, Travaux #4-9)
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * Easy win : MAJEUR (KD 0, 0 page existante côté SA, intent guide vol massif)
 * Cluster pillar : Rénovation Énergétique → Travaux → Couverture → Charpente
 *
 * Anti-cannibalisation :
 *   - /travaux/nettoyage-toiture        = entretien surface couverture (Levier G)
 *   - /travaux/menuiseries/fenetre-de-toit = ouverture toit (Levier D)
 *   - /travaux/isolation/toiture        = isolation thermique combles
 *   - Cette page = STRUCTURE PORTANTE de la toiture (charpente bois /
 *     fermettes / acier). Métier charpentier (Qualibat 2231) ou
 *     charpentier-couvreur (Qualibat 2232).
 *
 * YMYL medium : sécurité structure (DTU 31.1, 31.3, 31.2, 32.1), travail
 * en hauteur (Code travail R4323-58), responsabilité décennale obligatoire.
 * Pas d'aide MPR/CEE pour la charpente seule (pas une rénovation thermique).
 *
 * Cite : DTU 31.1 (charpente bois traditionnelle), DTU 31.3 (lamellé-collé),
 * DTU 31.2 (ossature bois), DTU 32.1 (charpente acier), Code travail R4323-58,
 * Qualibat 2231 / 2232, ADEME bois construction.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Hammer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  HardHat,
  Trees,
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

const PAGE_PATH = '/renovation-energetique/travaux/charpente'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'thomas-bernard'
const AUTHOR_NAME = 'Thomas Bernard'

const TITLE = 'Charpente 2026 : prix 100-300 €/m², types et choix charpentier'
const DESCRIPTION =
  'Charpente en 2026 : prix 100-300 €/m² selon type (traditionnelle, fermettes, lamellé-collé, acier). Réfection, traitement, choisir un charpentier Qualibat 2231.'

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
  '4 types de charpente en 2026 : traditionnelle (bois massif), fermettes industrielles (sapin/épicéa), lamellé-collé (grandes portées), acier ou métallique.',
  'Prix moyen 2026 au m² couvert : traditionnelle 150-300 €/m², fermettes 100-180 €/m², lamellé-collé 200-350 €/m², acier 180-280 €/m². Maison 100 m² : 10 000-30 000 €.',
  'Réfection partielle de charpente : 80-200 €/m² selon dégâts (traitement insectes / champignons, remplacement pannes, renforts métalliques).',
  'Traitement charpente bois (anti-termites, capricornes, vrillettes) : 25-50 €/m², garantie 10 ans avec entreprise certifiée CTB-A+ ou Qualibat 5331.',
  'Aucune aide MaPrimeRénov’ ni CEE pour la charpente seule (pas une rénovation thermique). TVA 10 % logement > 2 ans avec artisan. Si combles aménagés en même temps : aides isolation toiture éligibles.',
  'Choisir un charpentier Qualibat 2231 (charpente bois traditionnelle) ou Qualibat 2232 (charpentier-couvreur), avec décennale et RC pro travail en hauteur à jour.',
]

const TYPES_CHARPENTE = [
  {
    type: 'Traditionnelle (bois massif)',
    prixM2: '150 - 300 €/m²',
    portees: '6-12 m',
    duree: '50-100 ans',
    note: 'Sapin, épicéa, douglas ou chêne assemblés en fermes, pannes et chevrons. Permet combles aménageables grâce aux entraits relevés. Choix patrimonial.',
  },
  {
    type: 'Fermettes industrielles',
    prixM2: '100 - 180 €/m²',
    portees: '8-15 m',
    duree: '40-80 ans',
    note: 'Sapin / épicéa pré-assemblés en triangulation serrée (W). Économique en construction neuve. Combles non aménageables (sauf surélévation).',
  },
  {
    type: 'Lamellé-collé (BLC)',
    prixM2: '200 - 350 €/m²',
    portees: '15-30 m',
    duree: '60-100 ans',
    note: 'Lamelles de bois collées sous pression, certifiées DTU 31.3. Permet de très grandes portées sans pannes intermédiaires. Très utilisé en bâtiment public.',
  },
  {
    type: 'Acier (métallique)',
    prixM2: '180 - 280 €/m²',
    portees: '20-50 m',
    duree: '60-100 ans',
    note: 'Fermes, IPN ou treillis acier. Souvent utilisé en bâtiment industriel ou agricole. En résidentiel : grandes portées, plafonds cathédrales.',
  },
]

const FACTEURS_PRIX = [
  {
    title: 'Type de bois ou matériau',
    impact: '×1 à ×2',
    desc: 'Sapin / épicéa : standard, prix de base. Douglas : +20-30 % (durabilité 3 sans traitement). Chêne : +50-100 % (patrimoine, traditionnel). Acier : variable selon poids.',
  },
  {
    title: 'Portée et complexité',
    impact: '+20 à +60 %',
    desc: 'Portée > 10 m, multi-pans, croupes, lucarnes : majoration significative. Charpente sur plan irrégulier (L, U, T) : surcoût main d’œuvre 30-50 %.',
  },
  {
    title: 'Combles aménageables ou perdus',
    impact: '+30 à +50 %',
    desc: 'Charpente traditionnelle pour combles aménageables : entraits relevés, pannes intermédiaires libres. Coût supérieur aux fermettes mais permet pièces habitables.',
  },
  {
    title: 'État actuel (réfection)',
    impact: '×1,5 à ×3',
    desc: 'Réfection : remplacer 1 à 4 pannes 80-200 €/m². Refaire entièrement avec dépose + reconstruction : +30-50 % vs neuf. Renforts métalliques : 50-150 €/u.',
  },
  {
    title: 'Région et accessibilité',
    impact: '±15 %',
    desc: 'Île-de-France et grandes agglos : +10-15 %. Zone montagne avec accès difficile : +20 %. Région forestière (Vosges, Massif central) : prix bois plus stables.',
  },
]

const REGLEMENT = [
  {
    title: 'DTU 31.1 — charpente bois traditionnelle',
    desc: 'Document Technique Unifié de référence pour toute charpente bois traditionnelle assemblée. Définit les dimensions minimales des sections, les ancrages et les garanties d’assemblage.',
  },
  {
    title: 'DTU 31.3 — charpente lamellé-collé (BLC)',
    desc: 'DTU encadrant les charpentes en lamellé-collé. Exigences sur la classe d’emploi, le collage, le marquage CE et les portées admissibles.',
  },
  {
    title: 'DTU 31.2 — maison à ossature bois',
    desc: 'DTU complémentaire pour les charpentes intégrées à des maisons à ossature bois (MOB). Couvre la liaison murs / charpente et l’étanchéité globale.',
  },
  {
    title: 'DTU 32.1 — charpente acier',
    desc: 'DTU dédié aux charpentes métalliques. Galvanisation à chaud minimale, assemblage boulonné ou soudé certifié, calculs Eurocode 3 imposés.',
  },
]

const QUI_CHOISIR = [
  {
    title: 'Qualibat 2231 (charpente bois) ou 2232 (charpentier-couvreur)',
    must: 'Recommandé',
    desc: 'Préférer un artisan disposant de la qualification Qualibat 2231 (charpente bois traditionnelle), 2232 (charpentier-couvreur) ou 2122 (lamellé-collé) selon votre projet.',
  },
  {
    title: 'Décennale et RC pro travail en hauteur',
    must: 'Obligatoire',
    desc: 'La charpente est un ouvrage de gros œuvre couvert par la garantie décennale (Code civil art. 1792). Vérifier l’attestation décennale en cours et la RC pro mentionnant travail en hauteur.',
  },
  {
    title: 'Étude de structure ou bureau d’études bois',
    must: 'Recommandé',
    desc: 'Pour toute charpente avec portée > 10 m, modifications structurelles ou surélévation : exiger une note de calcul d’un bureau d’études bois ou d’un ingénieur structure.',
  },
  {
    title: 'Bois certifié PEFC ou FSC',
    must: 'Recommandé',
    desc: 'Pour respecter la traçabilité forestière : bois marqué PEFC (Pan European Forest Certification) ou FSC (Forest Stewardship Council). Souvent imposé par les acteurs publics.',
  },
  {
    title: 'Devis avec dimensions, classes et garanties',
    must: 'Obligatoire',
    desc: 'Le devis doit mentionner : essence + classe d’emploi (1 à 5 selon norme NF EN 335), sections en mm, traitement (CTB-A+ ou équivalent), garanties pose et matériel.',
  },
]

const faqs = [
  {
    question: 'Combien coûte une charpente neuve en 2026 ?',
    answer:
      'Pour une maison de 100 m² couverts en 2026, comptez 10 000-30 000 € TTC selon le type : fermettes industrielles 10 000-18 000 € (le plus économique), traditionnelle bois massif 15 000-30 000 €, lamellé-collé 20 000-35 000 €, acier 18 000-28 000 €. Au m² couvert : fermettes 100-180 €, traditionnelle 150-300 €, lamellé-collé 200-350 €, acier 180-280 €.',
  },
  {
    question: 'Quels sont les 4 types de charpente ?',
    answer:
      'En 2026, on distingue : (1) charpente traditionnelle en bois massif (sapin, épicéa, douglas, chêne) — assemblée en fermes/pannes/chevrons, permet combles aménageables ; (2) fermettes industrielles — pré-assemblées, économique mais combles non aménageables ; (3) lamellé-collé (BLC, DTU 31.3) — grandes portées 15-30 m, certifié pour bâtiments publics ; (4) charpente acier ou métallique — DTU 32.1, portées exceptionnelles 20-50 m, plus utilisée en industriel et grandes portées.',
  },
  {
    question: 'Combien coûte une réfection partielle de charpente ?',
    answer:
      'Pour une réfection partielle : remplacer 1 à 4 pannes endommagées 80-200 €/m², ajout de renforts métalliques 50-150 € par renfort. Pour une charpente attaquée par insectes (capricornes, vrillettes) ou champignons (mérule) : traitement préventif 25-50 €/m², traitement curatif 30-80 €/m², le tout garanti 10 ans avec un pro certifié CTB-A+ ou Qualibat 5331. En cas de mérule avérée, déclaration en mairie obligatoire (loi ALUR 2014).',
  },
  {
    question: 'Y a-t-il une aide MaPrimeRénov’ ou CEE pour refaire la charpente ?',
    answer:
      'NON, pas pour la charpente seule. La charpente n’est pas une rénovation énergétique en elle-même : aucune prime MaPrimeRénov’ ni CEE ne couvre sa réfection isolée. EN REVANCHE : si vous profitez du chantier pour faire isoler vos combles (par l’intérieur ou par sarking), l’isolation thermique est éligible MPR + CEE. Combiner les deux est souvent rentable : un seul échafaudage, un seul accès toiture, deux primes activables sur la partie isolation.',
  },
  {
    question: 'Comment savoir si ma charpente est en bon état ?',
    answer:
      'Cinq signaux d’alerte : (1) trous, sciure, galeries dans le bois = insectes xylophages (capricornes, vrillettes, termites) ; (2) bois mou ou friable au pouce = pourriture ou mérule ; (3) déformations, flèche anormale d’une panne ou ferme = surcharge ou affaiblissement structurel ; (4) infiltrations d’eau visibles, taches noires = défaut couverture + risque champignons ; (5) bruit de travail nocturne ou matinal = vrillettes en activité. Faire diagnostiquer par un charpentier Qualibat ou un expert en pathologie du bâtiment.',
  },
  {
    question: 'Faut-il traiter une charpente bois ?',
    answer:
      'OUI en France, pour les classes d’emploi 1 et 2 (intérieur sec), un traitement préventif anti-insectes est obligatoire ou très fortement recommandé selon norme NF EN 335. Les traitements modernes (sels minéraux ou pyréthrinoïdes en autoclave) sont garantis 10 ans. En zones à termites (zones décrétées par préfecture, art. L133-1 à L133-6 CCH), la déclaration en mairie est obligatoire en cas de présence et le traitement spécifique anti-termites devient impératif. Bois durable naturellement (chêne cœur, douglas cœur) : dispensé.',
  },
  {
    question: 'Combien de temps dure un chantier charpente ?',
    answer:
      'Pour une maison de 100 m² couverts en 2026 : fermettes industrielles posées en 1-2 jours (préfabriquées), charpente traditionnelle bois massif 5-10 jours, lamellé-collé 3-5 jours (préfabriqué). En cas de réfection complète avec dépose : ajouter 2-4 jours. Études + production + pose : compter 6 à 12 semaines au total entre la commande et la fin du chantier.',
  },
  {
    question: 'Peut-on transformer des combles perdus en combles aménageables ?',
    answer:
      'Oui, mais c’est un chantier important. Si la charpente est en fermettes industrielles, il faut soit modifier la structure (dépose + repose en traditionnelle, 15 000-30 000 €), soit poser des fermettes spéciales aménageables. Si la charpente est traditionnelle avec entraits hauts : aménagement direct possible (5 000-15 000 € hors isolation et finitions). Compter au total 1 200-2 500 €/m² pour des combles aménagés tout compris (charpente, isolation, plancher, ouvertures, plâtrerie, électricité).',
  },
]

const sources = [
  {
    label: 'AFNOR / DTU 31.1 — charpente bois traditionnelle',
    url: 'https://www.boutique.afnor.org',
  },
  {
    label: 'AFNOR / DTU 31.3 — charpente lamellé-collé',
    url: 'https://www.boutique.afnor.org',
  },
  {
    label: 'AFNOR / DTU 32.1 — charpente acier',
    url: 'https://www.boutique.afnor.org',
  },
  {
    label: 'Légifrance — Code construction L133-1 à L133-6 (lutte contre les termites)',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000006176015/',
  },
  {
    label: 'INRS — Travail en hauteur recommandations R408 / R430',
    url: 'https://www.inrs.fr/risques/chutes-hauteur',
  },
  {
    label: 'Qualibat — référentiels 2231, 2232, 5331',
    url: 'https://www.qualibat.com',
  },
  { label: 'CTB-A+ — certification anti-termites bois', url: 'https://www.fcba.fr' },
  { label: 'ADEME — Bois construction et rénovation', url: 'https://librairie.ademe.fr' },
]

const relatedPages = [
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
  },
  {
    label: 'Isolation toiture (combles + rampants)',
    href: '/renovation-energetique/travaux/isolation/toiture',
  },
  {
    label: 'Nettoyage et démoussage de toiture',
    href: '/renovation-energetique/travaux/nettoyage-toiture',
  },
  {
    label: 'Fenêtre de toit Velux',
    href: '/renovation-energetique/travaux/menuiseries/fenetre-de-toit',
  },
  {
    label: 'Trouver un charpentier RGE Qualibat',
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
    section: 'Travaux — Couverture — Charpente',
    keywords: [
      'charpente',
      'charpentier',
      'prix charpente',
      'charpente traditionnelle',
      'fermettes industrielles',
      'lamellé-collé',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Charpente', url: PAGE_PATH },
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
              { label: 'Charpente' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Hammer className="w-3.5 h-3.5" aria-hidden />
              Couverture &middot; Charpente
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Charpente en 2026 : prix 100-300 €/m², 4 types et choix d’un charpentier
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Pour une maison de 100 m² couverts en 2026, une charpente neuve coûte{' '}
              <strong>10 000 à 30 000 €</strong> selon le type : fermettes industrielles, bois
              massif traditionnelle, lamellé-collé ou acier. Réfection partielle{' '}
              <strong>80-200 €/m²</strong>. Choisir un charpentier <strong>Qualibat 2231</strong> ou{' '}
              <strong>2232</strong> avec décennale et RC pro travail en hauteur à jour.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 4 types de charpente en 2026</h2>
            <p>
              Le choix du type dépend de la portée, du budget, de l’intention d’aménager les combles
              et du caractère patrimonial du bâti. Voici les fourchettes 2026 :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Prix au m²</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Portées</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Durée de vie
                    </th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {TYPES_CHARPENTE.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prixM2}
                      </td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.portees}</td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.duree}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs nationaux 2026, hors options (couverture, étanchéité, isolation). TVA 10 %
                logement &gt; 2 ans avec artisan.
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

            <h2>Réglementation et DTU à respecter</h2>
            <p>
              La charpente est un ouvrage de gros œuvre couvert par la garantie décennale (Code
              civil art. 1792). Voici les principaux DTU encadrant la profession :
            </p>
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

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Mérule, termites, capricornes : déclaration mairie obligatoire
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    En cas de présence avérée de termites ou de mérule, le propriétaire doit
                    déclarer en mairie selon les art. L133-1 à L133-6 du Code construction (loi ALUR
                    2014). Lors d’une vente immobilière, l’état parasitaire fait partie des
                    diagnostics obligatoires en zone à termites. Confier le traitement à un pro
                    certifié CTB-A+ ou Qualibat 5331, garanti 10 ans.
                  </p>
                </div>
              </div>
            </div>

            <h2>5 critères pour choisir un charpentier</h2>
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
                <Trees className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis charpente en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 charpentiers Qualibat 2231 / 2232 vérifiés vous répondent sous 48 h. Devis
                    détaillés type, essence, dimensions, garanties pose et matériel.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/renovation-energetique"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Annuaire artisans <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Aide au calcul : votre budget charpente 2026</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Maison{' '}
                <strong>80 m²</strong> en fermettes : ~10 000-15 000 € posées.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Maison{' '}
                <strong>100 m²</strong> traditionnelle bois massif : ~15 000-25 000 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Maison{' '}
                <strong>150 m²</strong> avec lucarnes + croupes : ~25 000-40 000 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Si
                couplé avec isolation toiture (sarking ou intérieure) : aides MPR + CEE éligibles
                sur la partie isolation, ~3 000-7 000 € de prime selon revenus.
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
              href="/renovation-energetique/travaux"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Travaux
            </Link>
            <Link
              href="/renovation-energetique/travaux/isolation/toiture"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Isolation toiture <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
