/**
 * Page : /renovation-energetique/travaux/chauffage/chaudiere-granules/prix
 *
 * @kw-primary    chaudière granulés prix
 * @kw-volume     1100
 * @kw-kd         4
 * @kw-cpc        TBD
 * @intent        commercial
 * @cluster       chaudiere_biomasse
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster granulés/biomasse)
 * @backlog-item  Sprint-pseo-chaudiere-granules-prix-2026-05-22
 * @author        jean-pierre-duval
 *
 * KW cibles (validés Ahrefs gap CSV 2026-05-04, country=fr) :
 * - "chaudière à granulés"     2 100 vol, KD 5  ⭐ pivot connexe hub (focus prix)
 * - "chaudiere granulés"       1 100 vol, KD 4  ⭐ pivot prix
 * - "chaudiere a granule"      1 500 vol, KD 2  (variant grand head)
 * - "prix chaudiere granules"    100 vol, KD 1
 * - "chaudière biomasse"       2 800 vol, KD 0  (head connexe biomasse)
 * - "chaudière à condensation" 6 900 vol, KD 2  (alternative anti-canniba)
 * - "chaudiere a pellet"         700 vol, KD 2
 * - Famille cumulée prix biomasse : ~9 000 vol/mois
 *
 * Easy win : OUI MAJEUR (KD ≤ 5 sur pivot, variants KD 1-2). Page PRIX dédiée
 * vs hub /chaudiere-granules (panorama). Sources MPR ANAH 2026 + CEE BAR-TH-113.
 *
 * Anti-cannibalisation :
 *   - /chaudiere-granules         = hub PRODUIT (silo, fonctionnement, marques)
 *   - /chaudiere-bois             = biomasse bûches (alternative)
 *   - /poele-granules             = appoint ponctuel (point unique)
 *   - Cette page                  = sous-page PRIX (puissance, marques, ROI 15 ans)
 *
 * YMYL high : investissement 15 000-25 000 €, MPR Bleu jusqu’à 7 000 € + CEE
 * BAR-TH-113 jusqu’à 5 500 € + Coup de pouce. Cite : ANAH, France Rénov’, ADEME,
 * Légifrance, AFNOR EN 303-5, EN 14961-2 granulés, Qualibois.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Flame,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getServiceSchema,
} from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import FinalCtaSection from '@/components/conversion/FinalCtaSection'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chaudiere-granules/prix'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Chaudière granulés prix 2026 : maison 80-200 m², aides'
const DESCRIPTION =
  'Chaudière à granulés prix 2026 : 15 000-25 000 € posée (15-30 kW). MaPrimeRénov’ Bleu 7 000 € + CEE BAR-TH-113. Reste à charge 4 000-12 000 €.'

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
  'Prix moyen 2026 d’une chaudière à granulés posée : 15 000-25 000 € TTC selon puissance.',
  '15 kW (maison 80-120 m² bien isolée) : 15 000-19 000 € posée.',
  '20-25 kW (maison 120-180 m² standard) : 17 000-22 000 € posée.',
  '30 kW (maison > 180 m² ou peu isolée) : 20 000-25 000 € posée.',
  'Reste à charge ménage Bleu après aides : 4 000-8 000 € selon configuration.',
  'Aides cumulables 2026 : MPR Bleu 7 000 € + Coup de pouce CEE BAR-TH-113 + TVA 5,5 % + Éco-PTZ.',
  'ROI 9-13 ans vs chaudière fioul ou gaz (économie 30-50 % de la facture chauffage).',
]

const PUISSANCE_PRIX = [
  {
    config: '15 kW (maison BBC 80-120 m²)',
    materiel: '8 000 - 11 000 €',
    pose: '4 000 - 5 500 €',
    silo: '2 500 - 3 500 €',
    total: '15 000 - 19 000 €',
    note: 'Maison récente bien isolée, ECS via ballon tampon couplé.',
  },
  {
    config: '20 kW (maison 100-150 m² standard)',
    materiel: '9 500 - 12 500 €',
    pose: '4 500 - 6 000 €',
    silo: '3 000 - 4 000 €',
    total: '16 500 - 20 500 €',
    note: 'Configuration la plus courante en rénovation passoire E.',
  },
  {
    config: '25 kW (maison 130-180 m²)',
    materiel: '10 500 - 14 000 €',
    pose: '5 000 - 6 500 €',
    silo: '3 500 - 4 500 €',
    total: '18 000 - 22 000 €',
    note: 'Maison standard ou ancienne F/G post-isolation partielle.',
  },
  {
    config: '30 kW (maison > 180 m² ou peu isolée)',
    materiel: '12 000 - 16 000 €',
    pose: '5 500 - 7 500 €',
    silo: '4 000 - 5 500 €',
    total: '20 000 - 25 000 €',
    note: 'Logements avec ECS centralisée importante ou multi-zones.',
  },
]

const MARQUES_COMPARATIF = [
  {
    marque: 'ÖkoFEN (AT)',
    rendement: '≥ 95 %',
    flammeverte: '7★',
    prix: '17 000 - 24 000 €',
    note: 'Référence européenne. Silo + alimentation pneumatique. Garantie cuve 5 ans.',
  },
  {
    marque: 'Hargassner (AT)',
    rendement: '≥ 95 %',
    flammeverte: '7★',
    prix: '18 000 - 25 000 €',
    note: 'Haut de gamme autrichien. Régulation très fine. Garantie 5 ans.',
  },
  {
    marque: 'De Dietrich Pellets+ (FR)',
    rendement: '≥ 92 %',
    flammeverte: '7★',
    prix: '16 000 - 22 000 €',
    note: 'Marque française. Intégration parfaite avec gamme De Dietrich. Garantie 5 ans.',
  },
  {
    marque: 'Fröling (AT)',
    rendement: '≥ 94 %',
    flammeverte: '7★',
    prix: '17 500 - 23 500 €',
    note: 'Spécialiste biomasse. Bonne autonomie silo intégré ou déporté.',
  },
  {
    marque: 'MORETTI Design (IT)',
    rendement: '≥ 91 %',
    flammeverte: '7★',
    prix: '15 000 - 20 000 €',
    note: 'Bon rapport qualité-prix italien. Garantie 3-5 ans selon modèle.',
  },
]

const AIDES_TABLE = [
  {
    profil: 'Très modestes (bleu)',
    mpr: '7 000 €',
    cee: '~ 5 500 €',
    cumul: '~ 12 500 €',
    rac: '4 000 - 12 500 €',
  },
  {
    profil: 'Modestes (jaune)',
    mpr: '5 000 €',
    cee: '~ 5 500 €',
    cumul: '~ 10 500 €',
    rac: '5 000 - 13 500 €',
  },
  {
    profil: 'Intermédiaires (violet)',
    mpr: '3 000 €',
    cee: '~ 4 200 €',
    cumul: '~ 7 200 €',
    rac: '8 000 - 17 800 €',
  },
  {
    profil: 'Supérieurs (rose)',
    mpr: '0 €',
    cee: '~ 4 200 €',
    cumul: '~ 4 200 €',
    rac: '10 800 - 20 800 €',
  },
]

const ROI_EXEMPLES = [
  {
    profil: 'Fioul → granulés, maison 130 m² très modeste',
    facture: '2 400 €/an → 1 300 €/an',
    rac: '5 500 €',
    eco10: '11 000 €',
    roi: '5 ans',
  },
  {
    profil: 'Gaz propane → granulés, maison 150 m² modeste',
    facture: '2 100 €/an → 1 400 €/an',
    rac: '7 800 €',
    eco10: '7 000 €',
    roi: '11 ans',
  },
  {
    profil: 'Convecteurs élec → granulés, maison 120 m² très modeste',
    facture: '2 800 €/an → 1 200 €/an',
    rac: '6 000 €',
    eco10: '16 000 €',
    roi: '4 ans',
  },
  {
    profil: 'Gaz nat → granulés, maison 100 m² intermédiaire',
    facture: '1 600 €/an → 1 100 €/an',
    rac: '12 000 €',
    eco10: '5 000 €',
    roi: '24 ans (limite ROI)',
  },
]

const PIEGES_DEVIS = [
  {
    title: 'Silo non inclus',
    impact: '+ 2 500-5 500 €',
    desc: 'Le silo (stockage 1-5 tonnes granulés) représente 15-25 % du devis. Certains devis low-cost omettent le silo ou proposent du sac à la main. Exiger silo textile ou maçonné chiffré, accès camion citerne aspirateur.',
  },
  {
    title: 'Flamme Verte 7 étoiles minimum',
    impact: 'Aides perdues',
    desc: 'Pour MPR + CEE BAR-TH-113 : appareil Flamme Verte 7★ obligatoire (rendement ≥ 92 %, émissions CO ≤ 0,03 %, particules ≤ 30 mg/Nm³). Sans certification = dossier rejeté. Vérifier numéro Flamme Verte sur fiche produit.',
  },
  {
    title: 'TVA 20 % au lieu de 5,5 %',
    impact: '+ 14 % sur le total',
    desc: 'Sans installateur RGE Qualibois Module Chaudière, TVA 20 %. Sur devis 18 000 € : surcoût ~ 2 500 €. Vérifier numéro Qualibois Module Chaudière (et non Module Poêle) valide à la date du devis.',
  },
  {
    title: 'Conduit d’évacuation non chiffré',
    impact: '+ 1 200-2 500 €',
    desc: 'Conduit T400-P1-Wxx-G-50 (inox isolé) obligatoire pour chaudière granulés. Sortie en toiture + tubage si conduit existant. Souvent chiffré à part « si nécessaire » → exiger devis complet conduit + tubage + chapeau.',
  },
  {
    title: 'Granulés EN ISO 17225-2 classe A1 non précisés',
    impact: 'Pannes + rendement -10 %',
    desc: 'Granulés certifiés DINplus / ENplus A1 obligatoires (humidité < 10 %, cendres < 0,7 %, longueur 6-30 mm). Granulés bas de gamme = encrassement chaudière + perte rendement + maintenance fréquente.',
  },
  {
    title: 'Pas de désembouage circuit',
    impact: '-15-25 % rendement',
    desc: 'Sur installation existante, désembouage circuit hydraulique (élimine boues hydrocollodes) obligatoire avant raccordement. Sans désembouage : encrassement radiateurs + perte rendement + corrosion chaudière neuve.',
  },
]

const faqs = [
  {
    question: 'Combien coûte précisément une chaudière à granulés posée en 2026 ?',
    answer:
      'Entre <strong>15 000 et 25 000 € TTC posée</strong> selon puissance (15 à 30 kW). Pour une maison standard 100-150 m² post-isolation : comptez 17 000-21 000 € pour une 20-25 kW marque européenne (ÖkoFEN, Hargassner, De Dietrich, Fröling). Le matériel représente 55-65 % du devis (8 000-14 000 €), la pose 25-35 % (4 500-6 500 €), le silo 12-20 % (2 500-4 500 €). Variations +10-20 % en Île-de-France et métropoles.',
  },
  {
    question: 'Quelles aides 2026 pour une chaudière à granulés ?',
    answer:
      'Cumul possible : <strong>MaPrimeRénov’ Bleu 7 000 €</strong> (revenus très modestes), Jaune 5 000 €, Violet 3 000 €, Rose 0 € + <strong>Coup de pouce CEE BAR-TH-113</strong> jusqu’à 5 500 € selon revenus et délégataire (TotalEnergies, EDF, Engie, Sonergia) + <strong>TVA 5,5 %</strong> avec installateur RGE Qualibois Module Chaudière + <strong>éco-PTZ</strong> jusqu’à 30 000 €. Pour un foyer aux revenus très modestes, le reste à charge tombe à 4 000-8 000 € sur un projet 17 000-19 000 €. Conditions : appareil Flamme Verte 7★, pose RGE, logement > 2 ans, dossier France Rénov’ AVANT signature devis.',
  },
  {
    question: 'Quelle puissance choisir : 15, 20, 25 ou 30 kW ?',
    answer:
      'Selon surface et isolation : <strong>15 kW</strong> pour maison BBC 80-120 m² ou post-rénovation globale. <strong>20 kW</strong> pour maison 100-150 m² standard (configuration la plus courante en rénovation). <strong>25 kW</strong> pour maison 130-180 m² ou ancien post-isolation partielle. <strong>30 kW</strong> pour maison > 180 m² ou logement collectif. Règle : 0,15-0,20 kW/m² selon DPE. Le surdimensionnement provoque cycles courts et perte rendement 10-15 %.',
  },
  {
    question: 'Quel est le ROI réel d’une chaudière à granulés vs fioul / gaz ?',
    answer:
      'Vs <strong>fioul</strong> : économie 40-50 % (fioul ~ 0,12 €/kWh vs granulés ~ 0,065 €/kWh). ROI 5-8 ans après aides. Vs <strong>gaz propane</strong> : économie 30-40 %. ROI 8-12 ans. Vs <strong>convecteurs électriques</strong> : économie 55-65 %. ROI 4-6 ans. Vs <strong>gaz naturel</strong> : économie 15-25 % seulement (gaz naturel encore très compétitif en 2026). ROI 12-24 ans, à analyser au cas par cas. Sources : ADEME baromètre 2026, France Rénov’.',
  },
  {
    question: 'Combien coûte une tonne de granulés en 2026 ?',
    answer:
      'En vrac (livraison camion souffleur) : <strong>380-450 €/tonne TTC</strong> en moyenne nationale 2026 (variation saisonnière 15-25 % : prix bas avril-juin, prix haut octobre-décembre). En sac 15 kg palette : 500-600 €/tonne équivalent. Une maison 130 m² standard consomme 4-6 tonnes/an. Stocker pour 1 saison entière nécessite un silo 5-7 m³ minimum. Privilégier achat groupé en début d’été (-15-20 % vs hiver).',
  },
  {
    question: 'Quel artisan choisir et comment vérifier sa qualification ?',
    answer:
      'Installateur qualifié <strong>RGE Qualibois Module Chaudière</strong> (et NON Module Poêle). Vérification obligatoire : (1) numéro Qualibois valide à la date du devis sur <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a>, (2) SIRET actif sur societe.com, (3) attestation décennale assurance, (4) 5-10 références chantiers chaudière granulés (PAS uniquement poêles). Sans RGE Module Chaudière : MPR + CEE BAR-TH-113 rejetés + TVA 20 % = surcoût ~ 3 500 € sur un devis 18 000 €.',
  },
  {
    question: 'Que faut-il prévoir comme conduit d’évacuation ?',
    answer:
      'Conduit obligatoire : <strong>T400-P1-Wxx-G-50</strong> (inox isolé, étanche, à condensation, distance feu 50 mm). Sortie en toiture obligatoire (pas en façade). Si conduit existant (chaudière fioul/gaz) : tubage inox flexible obligatoire (1 500-2 500 €). Si pas de conduit : création conduit + tubage = 2 000-4 000 € selon configuration. Inspection conduit existant par fumiste qualifié recommandée avant signature devis.',
  },
  {
    question: 'Quelle est la durée de vie et l’entretien ?',
    answer:
      '<strong>Durée de vie</strong> chaudière granulés : 15-20 ans (vs 12-18 ans fioul, 15-25 ans gaz). <strong>Entretien obligatoire annuel</strong> (décret 2009-649) : 180-280 € HT/an. Inclut : nettoyage brûleur, foyer, échangeur, vis sans fin, contrôle évacuation fumée, mesure CO. <strong>Ramonage</strong> obligatoire 1-2 fois/an selon DTU 24.1 : 80-120 €. Conduit d’évacuation à vérifier visuellement chaque saison. Coût total entretien annuel ~ 300-400 €/an.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Chaudière à granulés',
    url: 'https://france-renov.gouv.fr/renovation/chauffage/chaudiere-granules',
  },
  {
    label: 'ANAH — MaPrimeRénov’ Chaudière biomasse',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'ADEME — Guide chauffage bois',
    url: 'https://agir.ademe.fr',
  },
  {
    label: 'AFNOR — NF EN 303-5 (Chaudières chauffage central biomasse)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — NF EN ISO 17225-2 (Granulés bois classe A1)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'Flamme Verte — Référentiel 7 étoiles',
    url: 'https://www.flammeverte.org',
  },
  {
    label: 'Qualibois — Annuaire RGE Module Chaudière',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Légifrance — Décret 2009-649 (entretien chaudières)',
    url: 'https://www.legifrance.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'Chaudière à granulés — hub 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-granules',
    description: 'Silo, fonctionnement, marques',
  },
  {
    label: 'Installation chaudière granulés — guide pose',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-granules/installation',
    description: 'Étapes, durée, conduit, RGE',
  },
  {
    label: 'Chaudière bois bûches — alternative',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
    description: 'Stère bois vs granulés',
  },
  {
    label: 'Poêle à granulés — appoint ponctuel',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
    description: 'Point unique 5-12 kW',
  },
  {
    label: 'Label RGE Qualibois',
    href: '/rge/labels/qualibois',
    description: 'Certification chauffagiste biomasse',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimer mes aides chaudière granulés',
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
    section: 'Travaux — Chauffage biomasse — Chaudière granulés — Prix',
    keywords: [
      'chaudière granulés prix',
      'chaudière à granulés prix',
      'prix chaudière granulés',
      'chaudière biomasse prix',
      'chaudière pellet prix',
      'tarif chaudière granulés',
      'chaudière granulés 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    {
      name: 'Chaudière à granulés',
      url: '/renovation-energetique/travaux/chauffage/chaudiere-granules',
    },
    { name: 'Prix', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Installation chaudière à granulés 2026',
    description:
      'Fourniture et pose d’une chaudière à granulés (15-30 kW) + silo (1-5 t) par un artisan RGE Qualibois Module Chaudière. Flamme Verte 7★. Prix 15 000-25 000 € TTC posée.',
    category: 'Chauffage biomasse — Chaudière à granulés',
  })
  const financialSchema = getFinancialProductSchema({
    name: 'Aides cumulées chaudière granulés 2026',
    description:
      'Cumul MaPrimeRénov’ par geste (jusqu’à 7 000 € Bleu) + Coup de pouce CEE BAR-TH-113 (jusqu’à 5 500 €) + TVA 5,5 % + éco-PTZ pour l’installation d’une chaudière à granulés Flamme Verte 7★ par un artisan RGE Qualibois.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: '4 200 € à 12 500 € selon revenus du foyer',
  })
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'MaPrimeRénov’ — Chaudière biomasse 2026',
    description:
      'Aide à la transition énergétique versée par l’ANAH aux ménages installant une chaudière à granulés ou à bûches (Flamme Verte 7★, EN 303-5) par un artisan RGE Qualibois Module Chaudière.',
    url: PAGE_URL,
    serviceType: 'Aide financière à la rénovation énergétique',
    serviceOperator: {
      name: 'ANAH — Agence nationale de l’habitat',
      url: 'https://www.anah.gouv.fr',
    },
    audience: 'Propriétaires occupants, bailleurs et copropriétés — logement > 2 ans',
    sameAs: ['https://france-renov.gouv.fr/aides/maprimerenov', 'https://www.anah.gouv.fr'],
  })
  const schemas = [
    articleSchema,
    breadcrumbSchema,
    faqSchema,
    serviceSchema,
    financialSchema,
    govServiceSchema,
  ].filter((s): s is Record<string, unknown> => s !== null)

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
              {
                label: 'Chaudière à granulés',
                href: '/renovation-energetique/travaux/chauffage/chaudiere-granules',
              },
              { label: 'Prix' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Chaudière granulés &middot; Prix 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Chaudière à granulés : prix 2026 et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, une <strong>chaudière à granulés posée</strong> coûte entre{' '}
              <strong>15 000 et 25 000 € TTC</strong> selon puissance (15-30 kW) et marque (ÖkoFEN,
              Hargassner, De Dietrich, Fröling). Avec MaPrimeRénov’ Bleu jusqu’à 7 000 € + Coup de
              pouce CEE BAR-TH-113 jusqu’à 5 500 €, le reste à charge tombe à{' '}
              <strong>4 000-8 000 €</strong> pour un foyer très modeste. Voici la grille de prix, le
              comparatif 5 marques, le ROI 10 ans et les aides 2026.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="prix-puissance">Prix par puissance et configuration</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Configuration</th>
                    <th className="p-3 border-b border-sand-200">Matériel</th>
                    <th className="p-3 border-b border-sand-200">Pose</th>
                    <th className="p-3 border-b border-sand-200">Silo</th>
                    <th className="p-3 border-b border-sand-200">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PUISSANCE_PRIX.map((row) => (
                    <tr key={row.config} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.config}</td>
                      <td className="p-3 whitespace-nowrap">{row.materiel}</td>
                      <td className="p-3 whitespace-nowrap">{row.pose}</td>
                      <td className="p-3 whitespace-nowrap">{row.silo}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes nationales 2026, TVA 5,5 % incluse avec artisan RGE Qualibois Module
                Chaudière. Variations +10-20 % en Île-de-France et métropoles. Sources : ADEME,
                France Rénov’, baromètre installateurs Qualibois 2026.
              </p>
            </div>

            <h2 id="comparatif-marques">Comparatif 5 marques Flamme Verte 7★</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Marque</th>
                    <th className="p-3 border-b border-sand-200">Rendement</th>
                    <th className="p-3 border-b border-sand-200">Flamme Verte</th>
                    <th className="p-3 border-b border-sand-200">Prix posé</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {MARQUES_COMPARATIF.map((row) => (
                    <tr key={row.marque} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.marque}</td>
                      <td className="p-3 whitespace-nowrap">{row.rendement}</td>
                      <td className="p-3 whitespace-nowrap">{row.flammeverte}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Rendements et étoiles Flamme Verte certifiés sur fiche produit constructeur. Sources
                : Flamme Verte annuaire 2026, AFNOR EN 303-5, France Rénov’.
              </p>
            </div>

            <div className="not-prose grid gap-3 my-6">
              {MARQUES_COMPARATIF.map((m) => (
                <div key={m.marque} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {m.marque}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {m.prix}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{m.note}</p>
                </div>
              ))}
            </div>

            <h2 id="aides">Aides 2026 selon profil revenus</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">CEE BAR-TH-113</th>
                    <th className="p-3 border-b border-sand-200">Cumul aides</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Reste à charge
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {AIDES_TABLE.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3">{row.mpr}</td>
                      <td className="p-3">{row.cee}</td>
                      <td className="p-3 font-semibold text-primary-800">{row.cumul}</td>
                      <td className="p-3 hidden md:table-cell">{row.rac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Reste à charge calculé sur chaudière granulés 17 000-19 000 € après cumul aides et
                TVA 5,5 %. Barèmes 2026 sous réserve mise à jour ANAH. Sources : ANAH, France
                Rénov’, fiches CEE BAR-TH-113.
              </p>
            </div>

            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov’</strong> chaudière biomasse : 7 000 € (Bleu) / 5 000 € (Jaune)
                / 3 000 € (Violet) / 0 € (Rose). Conditions : Flamme Verte 7★, EN 303-5, rendement ≥
                87 % PCI, pose RGE Qualibois Module Chaudière.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Coup de pouce CEE BAR-TH-113</strong> : jusqu’à 5 500 € selon revenus et
                délégataire (TotalEnergies, EDF, Engie, Sonergia). Cumulable avec MPR. Contrat signé
                AVANT signature devis.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> automatique avec artisan RGE Qualibois Module Chaudière =
                ~ 14 % d’économie vs TVA 20 %.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> : jusqu’à 30 000 € (50 000 € en bouquet 3 gestes). Sans
                intérêts, remboursement 15-20 ans.
              </li>
            </ul>

            <h2 id="roi">ROI 10 ans selon source de chauffage actuelle</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil</th>
                    <th className="p-3 border-b border-sand-200">Facture chauffage</th>
                    <th className="p-3 border-b border-sand-200">RAC</th>
                    <th className="p-3 border-b border-sand-200">Éco. 10 ans</th>
                    <th className="p-3 border-b border-sand-200">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {ROI_EXEMPLES.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3 whitespace-nowrap">{row.facture}</td>
                      <td className="p-3 whitespace-nowrap">{row.rac}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.eco10}
                      </td>
                      <td className="p-3 font-semibold whitespace-nowrap">{row.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Hypothèses : granulés 0,065 €/kWh, fioul 0,12 €/kWh, gaz propane 0,15 €/kWh, élec
                0,20 €/kWh, gaz nat 0,09 €/kWh. Hors hausse tarifaire +3-5 %/an. Sources : ADEME
                baromètre 2026, INSEE statistiques énergie.
              </p>
            </div>

            <h2 id="pieges">6 pièges qui font dériver un devis</h2>
            <div className="not-prose grid gap-3 my-6">
              {PIEGES_DEVIS.map((piege) => (
                <div
                  key={piege.title}
                  className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{piege.title}</p>
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {piege.impact}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{piege.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="comparer-devis">Checklist comparaison 3 devis</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mention RGE Qualibois Module Chaudière</strong> (et NON Module Poêle) valide
                à la date du devis
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marque + modèle + puissance kW + rendement % PCI</strong> précisés
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Certification Flamme Verte 7 étoiles</strong> (numéro vérifiable)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Silo dimensionné</strong> (capacité tonnes + type textile/maçonné + accès
                camion)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Conduit d’évacuation</strong> (T400-P1, tubage si existant, sortie toiture)
                chiffré
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Désembouage circuit</strong> chiffré (sur installation existante)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Total HT, TVA 5,5 % détaillée, total TTC</strong>, modalités paiement
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer mes aides chaudière granulés en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur compare votre situation (revenus, surface, chauffage actuel)
                    pour estimer le coût net après aides MPR + CEE 2026. Liste de chauffagistes
                    Qualibois Module Chaudière proches de chez vous.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Simulateur aides <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2 id="economies">Économies sur la facture chauffage</h2>
            <ul>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Vs fioul : économie 40-50 % de la facture. ROI 5-8 ans après aides.
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Vs gaz propane : économie 30-40 %. ROI 8-12 ans.
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Vs convecteurs électriques : économie 55-65 %. ROI 4-6 ans.
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Bonus DPE : passage typique de E → C ou C → B, gain 1-2 classes, valorisation
                revente +3-7 %.
              </li>
            </ul>
          </article>

          <SimulateurAideBox
            serviceKey="chaudiere-granules"
            estimatedSaving={12500}
            subtitle="MaPrimeRénov’ Bleu 7 000 € + CEE BAR-TH-113 jusqu’à 5 500 € — éligibilité en 3 min"
          />

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
                    className="flex items-start justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sand-900 m-0">{g.label}</p>
                      <p className="text-xs text-sand-600 mt-1 mb-0">{g.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <FlagshipAuthorCard
            authorSlug={AUTHOR_SLUG}
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/chauffage/chaudiere-granules"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Chaudière à granulés
            </Link>
            <Link
              href="/rge/labels/qualibois"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes RGE Qualibois <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <FinalCtaSection
        heading="Demandez vos devis chaudière à granulés"
        description="Recevez 3 devis d'artisans RGE Qualibois en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur-aides-renovation?service=chaudiere-granules',
          intent: 'final-devis-prix',
        }}
        secondaryCta={{
          label: 'Voir les chauffagistes RGE',
          href: '/rge/labels/qualibois',
        }}
        accent="blue"
        trustLine="Chauffagistes RGE Qualibois • Source : Registre RGE ADEME • RGPD"
      />
    </>
  )
}
