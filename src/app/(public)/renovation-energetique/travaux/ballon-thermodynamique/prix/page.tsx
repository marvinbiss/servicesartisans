/**
 * Page : /renovation-energetique/travaux/ballon-thermodynamique/prix
 *
 * @kw-primary    ballon thermodynamique prix
 * @kw-volume     700
 * @kw-kd         0
 * @kw-cpc        TBD
 * @intent        commercial
 * @cluster       ballon_thermo
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster ballon_thermo)
 * @backlog-item  Sprint3-ballon-thermodynamique-prix
 * @author        marc-lefebvre
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "ballon thermodynamique prix"      700 vol KD 0  ⭐ PIVOT rang #163
 * - "prix ballon thermodynamique"      350 vol KD 0  rang #161
 * - "ballon thermodynamique 200l prix" long-tail
 * - "ballon thermodynamique 300l prix" long-tail
 * - "tarif ballon thermodynamique"     long-tail
 * - "ballon thermodynamique pas cher"  long-tail
 *
 * Easy win : OUI MAJEUR (KD 0 sur tous KW, vol cumulé ~1 100/mo).
 * Atout SA : focus PRIX (par capacité, par marque, ROI 10 ans vs cumulus élec),
 * distinct de la page hub /ballon-thermodynamique qui couvre capacités + marques
 * + sources d'air sans focus transactionnel.
 *
 * Anti-cannibalisation :
 *   - /ballon-thermodynamique               = hub PRODUIT (capacités, marques, classes)
 *   - Cette page                            = sous-page PRIX (focus transactionnel)
 *   - /chauffage/chauffe-eau-thermodynamique = SOLUTION complète COP/ROI
 *
 * YMYL high : décisions investissement 2 200-4 800 €, prime CEE BAR-TH-148,
 * MaPrimeRénov' barèmes 2026. Cite : Légifrance, France Rénov', ADEME,
 * AFNOR EN 16147, ANAH, Service-Public.fr.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Droplets,
  ShieldCheck,
  TrendingDown,
  XCircle,
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
import PrixComparatif from '@/components/conversion/PrixComparatif'
import FinalCtaSection from '@/components/conversion/FinalCtaSection'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/ballon-thermodynamique/prix'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Ballon thermodynamique prix 2026 : ROI, marques & aides'
const DESCRIPTION =
  'Prix ballon thermodynamique 2026 : 2 200-4 800 € posé selon capacité (150-300 L). Comparatif Atlantic / Thermor / Ariston / De Dietrich / Auer. ROI 6-9 ans vs cumulus. MPR 1 200 € + CEE BAR-TH-148.'

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
  'Prix moyen 2026 d’un ballon thermodynamique posé : 2 200-4 800 € selon capacité.',
  'Reste à charge ménage très modeste : 900-2 300 € après MPR Bleu 1 200 € + CEE ~150 €.',
  'ROI 10 ans vs cumulus électrique : 1 200-2 600 € d’économies cumulées sur la facture ECS.',
  'TVA 5,5 % automatique avec artisan RGE QualiPAC ou Qualisol = ~14 % d’économie vs 20 %.',
  'Capacités standards : 150 L (1-2 pers), 200 L (3 pers), 270 L (4 pers), 300 L+ (5+ pers).',
  'Marques fiables 2026 : Atlantic Calypso, Thermor Aéromax, Ariston Nuos, De Dietrich Kaliko, Auer.',
  'Écart entre 3 devis à configuration équivalente : 15-25 % typique. Demandez 3 devis avant signature.',
]

const CAPACITE_PRIX = [
  {
    capacite: '150 L (1-2 personnes)',
    materiel: '1 200 - 1 800 €',
    pose: '900 - 1 400 €',
    total: '2 200 - 3 200 €',
    note: 'Studio, T2 ou couple sans enfant. ECS suffisante pour 50-110 L/jour à 60 °C.',
  },
  {
    capacite: '200 L (2-3 personnes)',
    materiel: '1 400 - 2 100 €',
    pose: '1 000 - 1 500 €',
    total: '2 500 - 3 600 €',
    note: 'T3/T4 standard 2026. ECS 110-150 L/jour. Modèle le plus vendu en rénovation.',
  },
  {
    capacite: '270 L (3-5 personnes)',
    materiel: '1 800 - 2 700 €',
    pose: '1 200 - 1 700 €',
    total: '3 000 - 4 400 €',
    note: 'Maison 80-130 m² famille. ECS 150-220 L/jour. Modèles haut de gamme cuve inox.',
  },
  {
    capacite: '300 L+ (5+ personnes ou split)',
    materiel: '2 200 - 3 300 €',
    pose: '1 600 - 2 200 €',
    total: '3 800 - 4 800 €',
    note: 'Maison familiale > 130 m². Souvent split (UE+UI) avec PAC dédiée extérieure.',
  },
]

const MARQUES_COMPARATIF = [
  {
    marque: 'Atlantic Calypso (FR)',
    capacite: '200 L / 270 L',
    cop: '3,4 (A+)',
    prix: '2 700 - 4 200 €',
    garantie: '5 ans cuve',
    note: 'Leader marché France. Fabrication La Roche-sur-Yon. SAV dense, pièces rapides.',
  },
  {
    marque: 'Thermor Aéromax 5 (FR)',
    capacite: '200 L / 250 L / 270 L',
    cop: '3,3 (A+)',
    prix: '2 500 - 4 000 €',
    garantie: '5 ans cuve / 2 ans pièces',
    note: 'Filiale Atlantic. Très bon rapport qualité-prix. Modèles compacts disponibles.',
  },
  {
    marque: 'Ariston Nuos Plus (IT)',
    capacite: '200 L / 250 L',
    cop: '3,2 (A+)',
    prix: '2 200 - 3 800 €',
    garantie: '5 ans cuve',
    note: 'Italien, design soigné. Modèle Lydos Hybrid = chauffe-eau convertible thermo.',
  },
  {
    marque: 'De Dietrich Kaliko (FR)',
    capacite: '200 L / 270 L / 300 L',
    cop: '3,3 (A+)',
    prix: '2 800 - 4 200 €',
    garantie: '5 ans cuve',
    note: 'Marque historique chauffage. Intégration parfaite avec chaudière De Dietrich.',
  },
  {
    marque: 'Auer EDEL (FR)',
    capacite: '200 L / 270 L',
    cop: '3,5 (A++)',
    prix: '3 000 - 4 500 €',
    garantie: '5 ans cuve / 7 ans extension',
    note: 'Fabricant français Feuquières-en-Vimeu. COP élevé, SAV nationale.',
  },
]

const AIDES_TABLE = [
  {
    profil: 'Très modestes (bleu)',
    mpr: '1 200 €',
    cee: '~ 150 €',
    cumul: '~ 1 350 €',
    rac: '900 - 2 300 €',
  },
  {
    profil: 'Modestes (jaune)',
    mpr: '800 €',
    cee: '~ 150 €',
    cumul: '~ 950 €',
    rac: '1 250 - 2 700 €',
  },
  {
    profil: 'Intermédiaires (violet)',
    mpr: '400 €',
    cee: '~ 100 €',
    cumul: '~ 500 €',
    rac: '1 700 - 3 100 €',
  },
  {
    profil: 'Supérieurs (rose)',
    mpr: '0 €',
    cee: '~ 80 €',
    cumul: '~ 80 €',
    rac: '2 100 - 3 800 €',
  },
]

const ROI_10_ANS = [
  {
    profil: 'Cumulus 200 L → ballon thermo 200 L, modeste',
    facture: '450 €/an → 130 €/an',
    rac: '1 250 €',
    eco10: '3 200 €',
    roi: '4 ans',
  },
  {
    profil: 'Cumulus 270 L → ballon thermo 270 L, intermédiaire',
    facture: '580 €/an → 180 €/an',
    rac: '2 200 €',
    eco10: '4 000 €',
    roi: '5,5 ans',
  },
  {
    profil: 'Cumulus 150 L → ballon thermo 150 L, très modeste',
    facture: '330 €/an → 100 €/an',
    rac: '900 €',
    eco10: '2 300 €',
    roi: '3,9 ans',
  },
  {
    profil: 'Cumulus 300 L → ballon thermo 300 L split, supérieur',
    facture: '720 €/an → 220 €/an',
    rac: '3 800 €',
    eco10: '5 000 €',
    roi: '7,6 ans',
  },
]

const FACTEURS_PRIX = [
  {
    label: 'Capacité nominale (litres)',
    impact: '+ 200-400 € par tranche +50 L',
    detail:
      'Plus la cuve est grande, plus le coût matière (acier émaillé ou inox) + isolation polyuréthane augmente. Cuve inox = +300-500 € vs émaillée.',
  },
  {
    label: 'Source d’air (ambiant / extrait / split)',
    impact: '+ 0 / +500 / +1 000 €',
    detail:
      'Ambiant intérieur = standard. Extrait sur VMC = raccord gaines (+500 €). Split air extérieur = unité ext. + liaison frigorifique (+1 000 €).',
  },
  {
    label: 'Classe énergétique (A+ → A+++)',
    impact: '+ 300-700 €',
    detail:
      'COP NF EN 16147 ≥ 2,5 obligatoire pour MPR. A+++ (COP ≥ 3,5) = 600 € de surcoût matériel mais ~25 € d’économie facture / an.',
  },
  {
    label: 'Marque (entrée vs premium)',
    impact: '+ 400-900 €',
    detail:
      'Ariston/Thermor entrée de gamme vs Atlantic Calypso/Auer/Daikin premium. SAV et durée de vie (12-15 ans) justifient l’écart sur le long terme.',
  },
  {
    label: 'Difficulté de pose',
    impact: '+ 300-1 200 €',
    detail:
      'Local technique exigu, accès difficile, évacuation condensats à créer, tableau électrique à reprendre. À chiffrer lors de la visite technique.',
  },
  {
    label: 'Région (zone IDF / métropoles)',
    impact: '+ 10-20 % sur la pose',
    detail:
      'Coût main-d’œuvre artisan plus élevé Île-de-France, PACA, Lyon, Bordeaux. Province rurale = -5-10 % vs moyenne nationale.',
  },
]

const PIEGES_DEVIS = [
  {
    title: 'COP nominal vs COP saisonnier',
    impact: 'Performance -20-30 %',
    desc: 'Le COP affiché en fiche produit (mesuré à 7 °C) chute fortement à 5 °C ambiant. Exiger le COP NF EN 16147 mesuré cycle complet (référence A15 pour air ambiant).',
  },
  {
    title: 'Anode magnésium non incluse',
    impact: '+80-150 € à terme',
    desc: 'L’anode magnésium protège la cuve de la corrosion. Doit être contrôlée tous les 2-3 ans. Si non remplacée à temps, la cuve se perce = remplacement total.',
  },
  {
    title: 'Évacuation condensats absente',
    impact: '+200-500 €',
    desc: 'Le ballon thermo produit ~5 L/jour d’eau de condensat acide (pH 5-6). Doit être évacué vers le réseau eaux usées avec siphon. Souvent oublié sur les devis low-cost.',
  },
  {
    title: 'TVA 20 % au lieu de 5,5 %',
    impact: '+14 % sur le total',
    desc: 'Sans installateur RGE QualiPAC ou Qualisol, la TVA passe à 20 %. Sur un devis 3 500 €, l’écart est de ~500 €. Vérifier la mention RGE valide à la date du devis.',
  },
  {
    title: 'Pose dans pièce de vie',
    impact: 'Confort thermique',
    desc: 'Un ballon thermo air ambiant refroidit la pièce de 2-4 °C en hiver. À éviter dans salon ou chambre. Privilégier garage, buanderie, cellier > 20 m³ non chauffé.',
  },
]

const faqs = [
  {
    question: 'Combien coûte précisément un ballon thermodynamique posé en 2026 ?',
    answer:
      'Entre 2 200 et 4 800 € TTC tout compris (matériel + pose + raccordement + mise en service + garanties), selon capacité et marque. Pour une maison standard 100-130 m² famille 4 personnes, comptez 3 000-3 800 € pour un 200-270 L de marque française (Atlantic Calypso, Thermor Aéromax). Le matériel représente 55-65 % du devis (1 400-2 700 €), la pose et le raccordement 35-45 % (900-1 700 €).',
  },
  {
    question: 'Quelles aides 2026 pour un ballon thermodynamique ?',
    answer:
      "Cumul possible : MaPrimeRénov' Bleu (revenus très modestes) jusqu'à 1 200 € + CEE BAR-TH-148 environ 150 € + éco-PTZ jusqu'à 30 000 € (par geste) + TVA 5,5 % avec installateur RGE QualiPAC/Qualisol. Pour un foyer aux revenus très modestes, le reste à charge peut tomber à 900-2 300 € sur un projet 2 200-3 800 €. Conditions : COP minimum 2,5 (EN 16147), pose par RGE, logement > 2 ans, dossier France Rénov' déposé AVANT signature du devis.",
  },
  {
    question: 'Quel ballon thermodynamique offre le meilleur rapport qualité-prix en 2026 ?',
    answer:
      '<strong>Thermor Aéromax 5 200 L</strong> (~2 800 € posé) : COP 3,3, garantie 5 ans cuve, marque française du groupe Atlantic. Pour montée en gamme : <strong>Atlantic Calypso 270 L</strong> (~3 500 € posé), COP 3,4, leader marché. Pour COP maximal : <strong>Auer EDEL 270 L</strong> (~4 000 € posé), COP 3,5 (classe A++), fabricant français Feuquières-en-Vimeu. Éviter les marques sans SAV France ou sans garantie cuve 5 ans minimum.',
  },
  {
    question: 'Quel est le ROI réel d’un ballon thermodynamique vs cumulus électrique ?',
    answer:
      'Économie 60-75 % sur la facture ECS. Cumulus 200 L = ~2 500 kWh/an × 0,20 € = 500 €/an. Ballon thermo 200 L = ~800 kWh/an × 0,20 € = 160 €/an. Économie ~340 €/an. Reste à charge moyen 1 500-2 500 € après aides → ROI 4,5-7,5 ans. Sur 12 ans (durée de vie moyenne), économie cumulée 3 000-4 500 €. Le ROI s’améliore encore avec la hausse continue du prix du kWh (+5-10 %/an depuis 2022).',
  },
  {
    question: 'Pourquoi les devis ballon thermodynamique varient autant ?',
    answer:
      'Quatre facteurs principaux : (1) capacité en litres (150 à 300+ L = +800 € par tranche +100 L), (2) source d’air (ambiant standard, extrait sur VMC +500 €, split air extérieur +1 000 €), (3) classe énergétique COP NF EN 16147 (A+ entrée de gamme vs A+++ premium = +600 €), (4) configuration de pose (local technique, évacuation condensats, tableau électrique à reprendre). Écart typique entre 3 devis à configuration équivalente : 15-25 %.',
  },
  {
    question: 'Quel artisan choisir et comment vérifier sa qualification ?',
    answer:
      "Plombier-chauffagiste qualifié <strong>RGE QualiPAC</strong> ou <strong>Qualisol</strong> (le ballon thermo est une PAC dédiée à l'ECS). Vérification obligatoire : (1) numéro Qualibat/QualiPAC valide à la date du devis sur france-renov.gouv.fr, (2) SIRET actif sur societe.com, (3) attestation décennale assurance professionnelle, (4) 5-10 références chantiers ECS thermo. Sans RGE : aides MPR/CEE rejetées + TVA 20 % au lieu de 5,5 % = surcoût ~600 € sur un devis 3 500 €.",
  },
  {
    question: 'La « ballon thermo à 1 € » existe-t-elle encore en 2026 ?',
    answer:
      'Non. Le Coup de pouce CEE pour chauffe-eau thermodynamique a été significativement réduit depuis 2024 et n’atteint plus le seuil nécessaire pour couvrir 100 % du prix. Toute offre « à 1 € » en 2026 cache soit une sous-performance (COP < 2,5 = inéligible MPR), soit un reste à charge dissimulé en post-installation, soit une fraude aux aides (poursuites pénales possibles selon DGCCRF). Privilégiez 3 devis comparés d’artisans RGE QualiPAC.',
  },
  {
    question: 'Combien coûte l’entretien annuel et la durée de vie ?',
    answer:
      'Entretien recommandé annuel (non obligatoire légalement, contrairement aux chaudières gaz) : 80-150 € HT/an. Inclut nettoyage évaporateur, contrôle pression circuit fluide frigorigène, vérification anode magnésium (corrosion cuve), vidange si eau dure (>25 °TH = adoucisseur recommandé). Durée de vie moyenne 12-15 ans (vs 8-12 ans pour cumulus électrique classique). Première panne fréquente : compresseur après 8-10 ans (300-600 € pièce + main d’œuvre).',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Chauffe-eau thermodynamique',
    url: 'https://france-renov.gouv.fr/renovation/chauffage/chauffe-eau-thermodynamique',
  },
  {
    label: 'ANAH — MaPrimeRénov’ chauffe-eau thermodynamique',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'ADEME — Eau chaude sanitaire et économies',
    url: 'https://agir.ademe.fr',
  },
  {
    label: 'AFNOR — Norme NF EN 16147 (essais COP chauffe-eau thermodynamique)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'Légifrance — Décret 2009-649 modifié',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Qualit’ENR — Annuaire QualiPAC officiel',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Service-Public.fr — Aides à la rénovation énergétique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35054',
  },
]

const relatedPages = [
  {
    label: 'Ballon thermodynamique — hub 2026',
    href: '/renovation-energetique/travaux/ballon-thermodynamique',
    description: 'Capacités, marques, sources d’air',
  },
  {
    label: 'Installation ballon thermodynamique — guide pose',
    href: '/renovation-energetique/travaux/ballon-thermodynamique/installation',
    description: 'Étapes, durée, prix pose, RGE',
  },
  {
    label: 'Chauffe-eau thermodynamique — solution complète',
    href: '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique',
    description: 'COP 3-3,5, ROI 4-6 ans, comparatif',
  },
  {
    label: 'PAC air-eau — alternative chauffage + ECS',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: '1 PAC pour chauffage + ECS, MPR + CEE',
  },
  {
    label: 'Label RGE QualiPAC',
    href: '/rge/labels/qualipac',
    description: 'Certification chauffagiste PAC ECS',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimer mes aides ballon thermodynamique',
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
    section: 'Travaux — Ballon thermodynamique — Prix',
    keywords: [
      'ballon thermodynamique prix',
      'prix ballon thermodynamique',
      'ballon thermodynamique 200l prix',
      'ballon thermodynamique 300l prix',
      'tarif ballon thermodynamique',
      'ballon thermodynamique pas cher',
      'ballon thermodynamique 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    {
      name: 'Ballon thermodynamique',
      url: '/renovation-energetique/travaux/ballon-thermodynamique',
    },
    { name: 'Prix', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Installation ballon thermodynamique 2026',
    description:
      'Fourniture et pose d’un ballon thermodynamique (chauffe-eau avec PAC intégrée) 150-300 L par artisan RGE QualiPAC ou Qualisol. Prix 2 200-4 800 € TTC posé.',
    category: 'Eau chaude sanitaire — Ballon thermodynamique',
  })
  const financialSchema = getFinancialProductSchema({
    name: 'Aides cumulées ballon thermodynamique 2026',
    description:
      'Cumul MaPrimeRénov’ par geste (jusqu’à 1 200 €) + Coup de pouce CEE BAR-TH-148 (~150 €) + TVA 5,5 % + éco-PTZ pour l’installation d’un ballon thermodynamique par un artisan RGE QualiPAC ou Qualisol.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: '80 € à 1 350 € selon revenus du foyer',
  })
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'MaPrimeRénov’ — Chauffe-eau thermodynamique 2026',
    description:
      'Aide à la transition énergétique versée par l’ANAH aux ménages installant un ballon thermodynamique (COP ≥ 2,5 NF EN 16147) par un artisan RGE QualiPAC ou Qualisol.',
    url: PAGE_URL,
    serviceType: 'Aide financière à la rénovation énergétique',
    serviceOperator: {
      name: 'ANAH — Agence nationale de l’habitat',
      url: 'https://www.anah.gouv.fr',
    },
    audience: 'Propriétaires occupants, bailleurs et copropriétés — logement >2 ans',
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
              {
                label: 'Ballon thermodynamique',
                href: '/renovation-energetique/travaux/ballon-thermodynamique',
              },
              { label: 'Prix' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplets className="w-3.5 h-3.5" aria-hidden />
              Ballon thermodynamique &middot; Prix 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Ballon thermodynamique : prix 2026, ROI et marques
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, un <strong>ballon thermodynamique posé</strong> coûte entre{' '}
              <strong>2 200 et 4 800 € TTC</strong> selon capacité (150 à 300 L) et marque
              (Atlantic, Thermor, Ariston, De Dietrich, Auer). Avec les aides MaPrimeRénov’ + CEE
              BAR-TH-148, le reste à charge tombe à <strong>900-2 300 €</strong> pour un ménage très
              modeste. Voici la grille de prix par capacité, le comparatif 5 marques, le ROI 10 ans
              vs cumulus électrique et le détail des aides 2026.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="prix-capacite">Prix par capacité 2026</h2>
            <p>
              Le prix d’un ballon thermodynamique dépend en premier lieu de la capacité de la cuve
              (litres) — calculée selon la composition du foyer et le profil d’usage ECS. Comptez 50
              L par personne pour un usage standard, 60-70 L pour un usage intensif (bains
              fréquents, double salle de bain).
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Capacité</th>
                    <th className="p-3 border-b border-sand-200">Matériel</th>
                    <th className="p-3 border-b border-sand-200">Pose</th>
                    <th className="p-3 border-b border-sand-200">Total TTC posé</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Profil</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {CAPACITE_PRIX.map((row) => (
                    <tr key={row.capacite} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.capacite}</td>
                      <td className="p-3 whitespace-nowrap">{row.materiel}</td>
                      <td className="p-3 whitespace-nowrap">{row.pose}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.total}
                      </td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes moyennes nationales 2026, TVA 5,5 % incluse avec artisan RGE
                QualiPAC/Qualisol. Variations +10-20 % en Île-de-France, PACA et grandes métropoles.
                Sources : baromètre prix artisans RGE 2026, AFPAC, France Rénov’.
              </p>
            </div>

            <h2 id="comparatif-marques">Comparatif 5 marques fiables</h2>
            <p>
              Cinq marques se partagent l’essentiel du marché français du ballon thermodynamique.
              Les prix indicatifs portent sur un modèle 200-270 L posé par un artisan RGE QualiPAC.
              Privilégier les marques avec SAV France développé et garantie cuve 5 ans minimum.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Marque / modèle</th>
                    <th className="p-3 border-b border-sand-200">Capacités</th>
                    <th className="p-3 border-b border-sand-200">COP (classe)</th>
                    <th className="p-3 border-b border-sand-200">Prix posé</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Garantie</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {MARQUES_COMPARATIF.map((row) => (
                    <tr key={row.marque} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.marque}</td>
                      <td className="p-3 whitespace-nowrap">{row.capacite}</td>
                      <td className="p-3 whitespace-nowrap">{row.cop}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 text-sand-600 hidden md:table-cell whitespace-nowrap">
                        {row.garantie}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                COP officiels mesurés norme NF EN 16147 (cycle complet, référence A15 air ambiant).
                Garantie fabricant standard. Sources : fiches produits constructeurs, AFPAC,
                comparatif Que Choisir 2026.
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

            <h2 id="facteurs-prix">6 facteurs qui font varier le prix</h2>
            <p>
              Un devis transparent doit détailler chaque ligne. Voici les 6 facteurs principaux qui
              expliquent l’écart de 15-25 % entre 3 devis à configuration similaire :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {FACTEURS_PRIX.map((f) => (
                <div key={f.label} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sand-900 m-0">{f.label}</p>
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {f.impact}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{f.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="roi">ROI 10 ans vs cumulus électrique</h2>
            <p>
              Le ballon thermodynamique consomme 60-75 % d’électricité en moins qu’un cumulus
              classique grâce à son COP 3-3,5. Voici 4 cas types calculés sur 10 ans après pose,
              hors hausse tarifaire électricité (+5-10 %/an depuis 2022) et hors entretien
              recommandé (80-150 €/an).
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil</th>
                    <th className="p-3 border-b border-sand-200">Facture ECS annuelle</th>
                    <th className="p-3 border-b border-sand-200">Reste à charge</th>
                    <th className="p-3 border-b border-sand-200">Éco. 10 ans</th>
                    <th className="p-3 border-b border-sand-200">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {ROI_10_ANS.map((row) => (
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
                Hypothèses : COP 3,3 réel saisonnier ; tarif EDF heures creuses 0,20 €/kWh ; cumulus
                rendement 90 %. Sources : ADEME, AFPAC, INSEE statistiques énergie 2026.
              </p>
            </div>

            <h2 id="aides">Aides 2026 : combien récupérer selon votre profil</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">CEE BAR-TH-148</th>
                    <th className="p-3 border-b border-sand-200">Cumul aides</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Reste à charge*
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
                *Reste à charge calculé sur ballon thermo 200-270 L à 2 800-3 800 € TTC, après cumul
                aides et TVA 5,5 %. Vérifier les barèmes exacts sur france-renov.gouv.fr. Barèmes
                2026 sous réserve de mise à jour ANAH.
              </p>
            </div>

            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov’</strong> chauffe-eau thermodynamique : 1 200 € (Bleu) / 800 €
                (Jaune) / 400 € (Violet) / 0 € (Rose). Conditions : COP ≥ 2,5 NF EN 16147, pose par
                RGE QualiPAC/Qualisol, logement &gt; 2 ans, dossier déposé AVANT signature devis.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>CEE BAR-TH-148</strong> (chauffe-eau thermodynamique) : ~150 € selon revenus
                et délégataire (TotalEnergies, EDF, Engie, Sonergia). Cumulable avec MPR.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> : jusqu’à 30 000 € par geste si combiné avec d’autres
                travaux d’économie d’énergie. Sans intérêts, remboursement 15-20 ans.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> automatique avec artisan RGE = ~14 % d’économie vs TVA 20
                % (soit ~500 € sur un devis 3 500 €).
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aides locales</strong> (région, département, métropole) : 100-500 €
                variables. Voir notre simulateur pour le détail par département.
              </li>
            </ul>

            <h2 id="pieges">5 pièges qui font dériver un devis</h2>
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

            <h2 id="ballon-1-euro">Méfiance « ballon thermo à 1 € »</h2>
            <div className="not-prose border-2 border-red-300 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    Aucune offre « ballon thermo à 1 € » légitime n’existe en 2026.
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    Le Coup de pouce CEE BAR-TH-148 a été significativement réduit depuis 2024 et
                    n’atteint plus le seuil nécessaire pour couvrir 100 % du prix. Toute offre « à 1
                    € » aujourd’hui masque soit une sous-performance (COP &lt; 2,5, inéligible MPR),
                    soit un reste à charge caché en post-installation, soit une fraude aux aides. La
                    DGCCRF (répression des fraudes) publie chaque année une liste noire des
                    éco-démarcheurs frauduleux.
                  </p>
                </div>
              </div>
            </div>

            <h2 id="comparer-devis">Comment comparer 3 devis efficacement</h2>
            <p>
              L’écart entre 3 devis à configuration équivalente atteint 15-25 % en pratique. Voici
              les 6 points à vérifier sur chaque devis avant de signer :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mention RGE QualiPAC ou Qualisol</strong> valide à la date du devis
                (vérifiable sur france-renov.gouv.fr)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marque, modèle, volume nominal, COP NF EN 16147</strong> précisés (pas «
                ballon thermo haute qualité »)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Classe énergétique</strong> A+ (minimum MPR), A++ ou A+++ (recommandée)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Évacuation condensats</strong> incluse (siphon + raccord eaux usées)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Garanties</strong> détaillées (cuve 5 ans + pièces 2-5 ans + décennale
                artisan)
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
                    Estimer mes aides ballon thermodynamique en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur compare votre situation (revenus, surface, ECS actuelle) pour
                    estimer le coût net après aides MPR + CEE 2026. Liste de chauffagistes QualiPAC
                    proches de chez vous.
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

            <h2 id="economies-facture">Économies sur la facture ECS</h2>
            <ul>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Facture cumulus 200 L typique 500 €/an → facture ballon thermo 200 L 160 €/an
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Retour sur investissement 4 à 7 ans selon aides perçues + tarif électricité (heures
                creuses recommandées pour optimiser la chauffe nuit)
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Bonus DPE : passage typique de classe E → D ou C (gain 1-2 classes), valorisation
                revente +3-5 %
              </li>
            </ul>
          </article>

          <PrixComparatif
            title="Prix ballon thermodynamique par marque 2026"
            caption="COP/SCOP norme EN 16147. Prix posés artisan RGE QualiPAC. Sources : fiches produits constructeurs + ADEME."
            withSchema
            rows={[
              {
                brand: 'Atlantic Calypso',
                model: '200 / 270 L',
                priceRange: '2 700 - 4 200 €',
                cop: '3,4',
                warranty: '5 ans cuve',
                rating: 4.4,
                highlight: true,
                notes: 'Leader FR, SAV dense',
              },
              {
                brand: 'Thermor Aéromax 5',
                model: '200 / 250 / 270 L',
                priceRange: '2 500 - 4 000 €',
                cop: '3,3',
                warranty: '5 ans cuve / 2 ans pièces',
                rating: 4.3,
                notes: 'Très bon rapport qualité-prix',
              },
              {
                brand: 'Ariston Nuos Plus',
                model: '200 / 250 L',
                priceRange: '2 200 - 3 800 €',
                cop: '3,2',
                warranty: '5 ans cuve',
                rating: 4.1,
                notes: 'Design soigné, modèles hybrides',
              },
              {
                brand: 'De Dietrich Kaliko',
                model: '200 / 270 / 300 L',
                priceRange: '2 800 - 4 200 €',
                cop: '3,3',
                warranty: '5 ans cuve',
                rating: 4.2,
                notes: 'Intégration chaudière De Dietrich',
              },
              {
                brand: 'Auer EDEL',
                model: '200 / 270 L',
                priceRange: '3 000 - 4 500 €',
                cop: '3,5',
                warranty: '5 ans cuve / 7 ans extension',
                rating: 4.5,
                notes: 'COP A++, fabricant FR',
              },
            ]}
          />

          <SimulateurAideBox
            serviceKey="ballon-thermodynamique"
            estimatedSaving={1350}
            subtitle="MaPrimeRénov' jusqu'à 1 200 € + CEE BAR-TH-148 ~150 € — éligibilité en 3 min"
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
              href="/renovation-energetique/travaux/ballon-thermodynamique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Ballon thermodynamique
            </Link>
            <Link
              href="/rge/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes RGE QualiPAC <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <FinalCtaSection
        heading="Demandez vos devis ballon thermodynamique"
        description="Recevez 3 devis d'artisans RGE QualiPAC en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur-aides-renovation?service=ballon-thermodynamique',
          intent: 'final-devis-prix',
        }}
        secondaryCta={{
          label: 'Voir les chauffagistes RGE',
          href: '/rge/chauffagiste',
        }}
        accent="blue"
        trustLine="Artisans RGE QualiPAC • Source : Registre RGE ADEME • RGPD"
      />
    </>
  )
}
