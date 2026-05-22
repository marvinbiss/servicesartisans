/**
 * Page : /renovation-energetique/travaux/chauffage/chaudiere-granules
 *
 * @kw-primary    chaudière à granulés
 * @kw-volume     2100
 * @kw-kd         5
 * @kw-cpc        1.85
 * @intent        commercial + informational
 * @cluster       chaudiere
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rangs #57, #90, #149, #179)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster granulés/pellet)
 * @backlog-item  Levier-L-chaudiere-granules
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "chaudière à granulés"     2 100 vol, KD 5  ⭐⭐⭐ pivot rang #57
 * - "chaudiere a granule"      1 500 vol, KD 2  rang #90
 * - "chaudiere granulés"       1 100 vol, KD 4  rang #149
 * - "chaudiere a pellet"         700 vol, KD 2  rang #179
 * - "chaudiere granules"         250 vol, KD 4
 * - "prix chaudiere granules"    100 vol, KD 1
 * - Famille cumulée pivot : ~5 750 vol/mois (KW pivot KD 1-5 = easy win)
 *
 * Easy win : OUI (KD 2-5, 4 leaders quelleenergie/effy/france-renov). 0 page SA
 * dédiée granulés (que /chaudiere-bois biomasse large + /poele-granules point unique).
 * Atout SA : page focused chaudière granulés CHAUFFAGE CENTRAL (silo + vis sans fin
 * + automation), distincte du poêle (point unique). Aides MPR Bleu jusqu'à 7 000 € +
 * CEE BAR-TH-104 + Coup de pouce. Supply DB : 4 171 Qualibois actifs.
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Chaudière granulés
 *
 * Anti-cannibalisation :
 *   - /chauffage/chaudiere-bois         = biomasse au sens large (bûches + granulés + mixte)
 *   - /chauffage/poele-granules         = poêle pellet (point unique pièce)
 *   - /chauffage/poele-granules/sans-electricite = niche
 *   - /guides/chaudiere-gaz-vs-granules = comparatif binaire gaz vs granulés
 *   - Cette page = chaudière granulés (chauffage central automatisé silo + vis +
 *     allumage automatique + écran tactile, distinct du bûches manuel et du poêle)
 *
 * YMYL high : décisions investissement 15-25K€, label RGE Qualibois obligatoire
 * pour aides, normes EN 303-5 classe 5 / Flamme Verte 7*. Cite : Légifrance,
 * France Rénov', ADEME, Propellet (syndicat granulés bois), ONF, Code énergie.
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
  Wrench,
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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chaudiere-granules'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Chaudière à granulés 2026 : prix & aides MPR'
const DESCRIPTION =
  "Chaudière à granulés 2026 : prix posé 15 000-25 000 €, aides MaPrimeRénov' jusqu'à 7 000 € + CEE 5 000 €, rendement 90-95 %, ROI 7-10 ans. Choisir un installateur RGE Qualibois."

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
  'Chauffage central automatisé : silo + vis sans fin alimente le brûleur en granulés bois.',
  'Prix posé 2026 : 15 000-25 000 € (15-25 kW) selon marque, silo et automation.',
  "Aides MPR Bleu jusqu'à 7 000 € + CEE Coup de pouce 5 000 € (sortie fioul/gaz) + éco-PTZ.",
  'Rendement saisonnier η_s 90-95 %, classe énergétique A++ ou A+++.',
  'Combustible local renouvelable : 350-450 €/tonne en 2026 (~5 t/an pour 100 m²).',
  'Installateur RGE Qualibois obligatoire (aides + TVA 5,5 %). Norme EN 303-5 classe 5.',
  'ROI 7-10 ans en remplacement chaudière fioul. Durée de vie 20-25 ans.',
]

const PRIX_CHAUDIERE_GRANULES = [
  {
    type: 'Compacte 12-15 kW (T2/T3, maison 70-90 m²)',
    prix: '12 000-16 000 € posée',
    detail:
      "Modèle d'entrée de gamme avec silo 200-300 kg intégré. Allumage automatique, écran simple. Marques : Okofen, Hargassner, Fröling.",
  },
  {
    type: 'Standard 15-25 kW (maison 100-180 m²)',
    prix: '16 000-22 000 € posée',
    detail:
      'Silo séparé textile 1,5-3 t ou maçonné 2-5 t. Vis sans fin ou aspirateur. Modulation puissance 30-100 %. Standard du marché.',
  },
  {
    type: 'Haut de gamme 25-35 kW (grand logement / hôtel)',
    prix: '22 000-32 000 € posée',
    detail:
      'Silo enterré ou grand silo intérieur. Pilotage smartphone, autonettoyage cendres, modulation 20-100 %. Marques : Hargassner, Fröling, Viessmann Vitoligno.',
  },
  {
    type: 'Hybride granulés + ballon tampon ECS',
    prix: '22 000-28 000 € posée',
    detail:
      "Inclut ballon tampon 500-1 000 L pour optimiser la modulation et l'ECS. Recommandé pour grandes consommations ECS et confort thermique maximal.",
  },
]

const ANATOMIE_INSTALLATION = [
  {
    composant: 'Chaudière',
    detail:
      'Bloc principal avec brûleur, échangeur, ventilateur tirage, automate de régulation. Largeur 60-70 cm, hauteur 130-180 cm. À placer dans un local technique sec ventilé.',
  },
  {
    composant: 'Silo de stockage',
    detail:
      '3 options : (1) silo textile 1,5-3 t (700-1 200 €), (2) silo maçonné 3-7 t (3 000-5 000 € avec construction), (3) silo enterré (5 000-8 000 €). Volume = 1,5x consommation annuelle (5 t pour 100 m²).',
  },
  {
    composant: 'Système de transport',
    detail:
      "Vis sans fin (5-10 m, fiable) ou aspirateur pneumatique (jusqu'à 25 m, plus flexible). Le choix dépend de la distance silo-chaudière.",
  },
  {
    composant: 'Évacuation des fumées',
    detail:
      'Conduit étanche en inox classe T400 minimum (résistant 400 °C). Tubage du conduit existant 600-1 200 € ou conduit neuf double paroi 1 500-3 000 €. Décendrage 1-2x/an.',
  },
  {
    composant: 'Régulation et automation',
    detail:
      'Sondes extérieure + intérieure + ECS, programmation hebdo, modulation auto. Modèles connectés (Okofen Pelletronic, Fröling Lambdatronic) avec pilotage smartphone.',
  },
  {
    composant: 'Ballon tampon (optionnel mais recommandé)',
    detail:
      "Ballon eau 500-1 500 L stocke la chaleur produite. Permet à la chaudière de fonctionner à pleine puissance puis de s'éteindre = +10-15 % de rendement et durée de vie chaudière + silencieux.",
  },
]

const COMPARATIF_VS_AUTRES = [
  {
    critere: 'Prix posé',
    granules: '15-25K €',
    fioul: '6-9K €',
    pac: '12-15K €',
    poele: '4-8K €',
  },
  {
    critere: "MaPrimeRénov' Bleu max",
    granules: '7 000 €',
    fioul: '0 €',
    pac: '5 000 €',
    poele: '2 500 €',
  },
  {
    critere: 'CEE Coup de pouce',
    granules: '4 000-5 000 €',
    fioul: '0 €',
    pac: '4 000 €',
    poele: '500-1 000 €',
  },
  {
    critere: 'Rendement / COP',
    granules: '90-95 %',
    fioul: '85-90 %',
    pac: 'COP 3,5-4,5',
    poele: '85-92 %',
  },
  {
    critere: 'Coût combustible 100 m²/an',
    granules: '650-1 100 €',
    fioul: '1 600-2 800 €',
    pac: '500-1 000 €',
    poele: '700-1 100 €',
  },
  {
    critere: 'Encombrement',
    granules: 'Important + silo',
    fioul: 'Modéré + cuve',
    pac: 'Modéré (UE+UI)',
    poele: 'Faible (1 pièce)',
  },
  {
    critere: 'Entretien annuel',
    granules: '180-280 €',
    fioul: '150-220 €',
    pac: '120-200 €',
    poele: '150-200 €',
  },
  {
    critere: 'Durée de vie',
    granules: '20-25 ans',
    fioul: '15-20 ans',
    pac: '15-20 ans',
    poele: '15-20 ans',
  },
  {
    critere: 'ROI typique (vs fioul)',
    granules: '7-10 ans',
    fioul: 'N/A',
    pac: '5-7 ans',
    poele: '6-9 ans (appoint)',
  },
]

const QUAND_CHOISIR = [
  {
    cas: 'Vous avez une chaudière fioul à remplacer',
    reco: '✅ Excellente option',
    detail:
      'Remplacement direct chaufferie : aides massives (MPR Bleu 7 000 € + CEE 5 000 € sortie fioul). ROI 6-8 ans. Mieux que la PAC en zone froide (Alsace, Massif Central) ou maison ancienne mal isolée (PAC moins performante quand T° ext < -7 °C).',
  },
  {
    cas: 'Vous habitez en zone rurale avec espace de stockage',
    reco: '✅ Top choix',
    detail:
      'Filière granulés bois locale = approvisionnement à 50-150 km. Stocker 3-5 t (silo 4-7 m³) demande un local annexe ou garage. Idéal en maison individuelle avec dépendance.',
  },
  {
    cas: 'Vous voulez un chauffage 100 % EnR sans dépendance électrique',
    reco: '✅ Pertinent',
    detail:
      "Combustible biomasse renouvelable, neutre en CO2 (cycle court bois). Demande peu d'électricité (250-500 W pour vis + ventilateur). Reste autonome en panne secteur courte (versions UPS).",
  },
  {
    cas: 'Vous habitez en appartement ou T2 sans local technique',
    reco: '❌ Non adapté',
    detail:
      'Encombrement chaudière + silo (5-7 m² mini) impossible en appartement. Préférez un poêle à granulés (1 pièce) ou chauffage électrique + isolation.',
  },
  {
    cas: 'Vous construisez en neuf bien isolé (RT 2012/RE 2020)',
    reco: '🟡 Surdimensionné',
    detail:
      'Une chaudière granulés est surdimensionnée pour un logement neuf RE 2020 (besoin de chaleur faible). Préférez une PAC air-eau ou un poêle granulés en chauffage principal.',
  },
  {
    cas: 'Vous avez une chaudière gaz récente (< 12 ans)',
    reco: '🟡 Garder en attente',
    detail:
      "Ne remplacez pas par anticipation : pas d'interdiction du gaz résidentiel. Anticipez plutôt le remplacement de votre prochaine chaudière en chaudière granulés ou PAC selon votre zone.",
  },
]

const faqs = [
  {
    question: 'Combien coûte une chaudière à granulés en 2026 ?',
    answer:
      "Prix posé clé en main 2026 : 12 000-16 000 € pour une compacte 12-15 kW (T2/T3) ; 16 000-22 000 € pour une standard 15-25 kW (maison 100-180 m²) ; 22 000-32 000 € pour un haut de gamme 25-35 kW ou avec ballon tampon. La chaudière représente 40-50 % du devis (5 000-12 000 € pour Okofen/Hargassner/Fröling), le silo 10-15 % (1 500-5 000 €), la pose et le raccordement 35-50 %. Aides cumulées : jusqu'à 12 000 € (MPR + CEE Coup de pouce sortie fioul).",
  },
  {
    question: 'Quelles aides 2026 pour une chaudière à granulés ?',
    answer:
      "Cumul possible MaPrimeRénov' Bleu jusqu'à 7 000 € (revenus très modestes) + CEE Coup de pouce 4 000-5 000 € (sortie fioul ou gaz) + éco-PTZ jusqu'à 30 000 € + TVA 5,5 % avec installateur RGE Qualibois. Pour un foyer aux revenus modestes remplaçant une chaudière fioul, le reste à charge peut tomber à 6 000-9 000 € sur un projet 18 000-22 000 €. Le cumul est conditionné à un installateur certifié RGE Qualibois et un dossier France Rénov' validé avant signature du devis.",
  },
  {
    question: 'Quelle différence entre chaudière granulés, chaudière bois et poêle granulés ?',
    answer:
      '<strong>Chaudière granulés</strong> = chauffage central automatisé (silo + vis + brûleur, alimente radiateurs + ECS). <strong>Chaudière bois bûches</strong> = même usage mais alimentation manuelle (1-2 chargements/jour, moins automatisé, moins cher 5-8K €). <strong>Chaudière mixte</strong> = bûches + granulés selon disponibilité. <strong>Poêle granulés</strong> = chauffage point unique (1 pièce, 4-8K €), pas de chauffage central. La chaudière granulés est le seul système 100 % automatisé qui chauffe TOUT le logement.',
  },
  {
    question: 'Quel rendement et quelle consommation pour une chaudière granulés ?',
    answer:
      'Rendement saisonnier η_s 90-95 % (vs 70-80 % pour vieille chaudière fioul, 92-94 % pour chaudière condensation gaz). Consommation moyenne maison 100 m² : 4-5 t de granulés/an, soit 1 600-2 250 €/an au tarif 2026 (350-450 €/t). À comparer à fioul 1 600-2 800 €/an pour la même surface. Économie en sortie fioul : 200-600 €/an + suppression facture liée au cours du brut.',
  },
  {
    question: 'Quel installateur choisir pour une chaudière granulés ?',
    answer:
      "Plombier-chauffagiste qualifié <strong>RGE Qualibois 'Module Chaudières'</strong> (mention spécifique aux chaudières biomasse, distincte de Qualibois 'Module Air' pour poêles et inserts). Cette qualification est obligatoire pour bénéficier de MaPrimeRénov', des CEE Coup de pouce et de la TVA réduite à 5,5 %. Vérifier : SIRET valide, attestation décennale, certificat Qualibois en cours de validité (1 an), références chantiers granulés (10 mini), devis détaillé avec marque, classe énergétique (A++ ou A+++), normes EN 303-5 classe 5 et Flamme Verte 7 étoiles.",
  },
  {
    question: 'Comment stocker les granulés de bois ?',
    answer:
      "3 options : (1) <strong>silo textile</strong> 1,5-3 t (700-1 200 €) — installation rapide, 2 m² au sol, idéal cellier/garage ; (2) <strong>silo maçonné</strong> 3-7 t (3 000-5 000 € avec construction) — durable mais demande un local dédié ; (3) <strong>silo enterré</strong> 4-10 t (5 000-8 000 € avec terrassement) — gain d'espace intérieur, plus cher. Volume conseillé = 1,5 fois la consommation annuelle (5 t/an = silo 7,5 t = 12 m³). Prévoir 1-2 livraisons/an par camion souffleur.",
  },
  {
    question: 'Quel entretien pour une chaudière granulés ?',
    answer:
      "Entretien annuel obligatoire (Décret 2009-649) : 180-280 € HT, plus cher qu'une chaudière gaz à cause du décendrage. À effectuer tous les 1-3 mois soi-même : vider le bac à cendres (5-10 L/an pour 5 t consommées). Annuel par le pro : nettoyage approfondi échangeur, contrôle vis sans fin, paramétrage régulation, mesure CO/CO2, contrôle conduit + tubage. Le ramonage du conduit est obligatoire 2 fois/an dont 1 en saison de chauffe (Décret 2023-741).",
  },
  {
    question: 'Chaudière granulés vs PAC air-eau : laquelle choisir ?',
    answer:
      "Critères de choix : (1) <strong>climat</strong> — granulés meilleur en zone froide (Alsace, Massif Central, T° ext < -7 °C où la PAC perd 30-50 % de COP) ; (2) <strong>isolation</strong> — granulés plus tolérant aux maisons mal isolées (puissance modulable jusqu'à 35 kW vs PAC limitée à 14-20 kW) ; (3) <strong>espace</strong> — la PAC gagne (UE+UI = 1 m²) vs granulés (chaudière + silo = 5-7 m²) ; (4) <strong>combustible local</strong> — granulés gagne en maison rurale, PAC gagne en milieu urbain ; (5) <strong>autonomie panne secteur</strong> — granulés mieux ; (6) <strong>aides</strong> — granulés MPR 7 000 € vs PAC 5 000 € pour revenus très modestes.",
  },
]

const sources = [
  {
    label: "France Rénov' — Chaudière biomasse",
    url: 'https://france-renov.gouv.fr/renovation/chauffage/chaudiere-biomasse',
  },
  {
    label: "ANAH — MaPrimeRénov' chauffage biomasse",
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'ADEME — Chauffage au bois',
    url: 'https://www.ademe.fr',
  },
  {
    label: 'Propellet — Syndicat français des granulés bois',
    url: 'https://www.propellet.fr',
  },
  {
    label: 'AFNOR — Norme EN 303-5 (chaudières biomasse)',
    url: 'https://www.afnor.org',
  },
  {
    label: "Qualit'ENR — Mention RGE Qualibois (annuaire)",
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Service-Public.fr — Aides à la rénovation énergétique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35054',
  },
  {
    label: 'Flamme Verte — Label fabricants équipements bois',
    url: 'https://www.flammeverte.org',
  },
]

const relatedPages = [
  {
    label: 'Chaudière granulés prix 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-granules/prix',
    description: 'Grille 15-30 kW + ROI vs fioul/gaz + 5 marques',
  },
  {
    label: 'Installation chaudière granulés 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-granules/installation',
    description: '10 étapes + conduit T400-P1 + désembouage + RGE',
  },
  {
    label: 'Chaudière à bois 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
    description: 'Biomasse au sens large (bûches, granulés, mixte)',
  },
  {
    label: 'Poêle à granulés 2026',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
    description: 'Chauffage point unique 4-8K €, MPR 2 500 €',
  },
  {
    label: 'PAC air-eau 2026 — alternative urbaine',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: "COP 3,5-4,5, MPR + CEE jusqu'à 8 000 €",
  },
  {
    label: 'Chaudière fioul interdite 2026',
    href: '/guides/chaudiere-fioul-interdite-2026',
    description: "Comprendre l'arrêté du 5 juillet 2022",
  },
  {
    label: 'Hub Chauffage 2026',
    href: '/renovation-energetique/travaux/chauffage',
    description: '4 familles + comparatif prix',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ cumulables',
  },
  {
    label: 'Label RGE Qualibois',
    href: '/rge/labels/qualibois',
    description: 'Certification chauffagiste biomasse',
  },
  {
    label: 'Trouver un chauffagiste Qualibois',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE biomasse vérifié',
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
    section: 'Chauffage — Chaudière à granulés',
    keywords: [
      'chaudière à granulés',
      'chaudiere a granule',
      'chaudiere granulés',
      'chaudiere a pellet',
      'prix chaudiere granules',
      'chaudière granulés 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Chaudière à granulés', url: PAGE_PATH },
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
              { label: 'Chaudière à granulés' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-accent-50 text-accent-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              EnR — Aides MPR + CEE jusqu&apos;à 12 000 €
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Chaudière à granulés 2026 : prix, aides et installation
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>chaudière à granulés</strong> est un chauffage central 100 % automatisé
              alimenté en pellets bois (silo + vis sans fin + allumage automatique). En 2026, son
              prix posé est <strong>15 000 à 25 000 €</strong>, mais les aides cumulées (MPR{' '}
              <strong>jusqu&apos;à 7 000 €</strong> + CEE Coup de pouce{' '}
              <strong>jusqu&apos;à 5 000 €</strong> + éco-PTZ + TVA 5,5 %) peuvent réduire le reste
              à charge à <strong>6 000-9 000 €</strong>. Voici les vrais prix par modèle, le détail
              de l&apos;installation et comment choisir un installateur RGE{' '}
              <strong>Qualibois</strong>.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="prix">Prix chaudière à granulés 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {PRIX_CHAUDIERE_GRANULES.map((p) => (
                <div key={p.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {p.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {p.prix}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-sand-600 italic">
              Prix moyens 2026 toutes marques confondues, posé clé en main, hors aides. TVA 5,5 %
              applicable avec installateur RGE Qualibois. Variations +10-20 % en Île-de-France et
              grandes métropoles.
            </p>

            <h2 id="anatomie">Anatomie de l&apos;installation</h2>
            <div className="not-prose grid gap-3 my-6">
              {ANATOMIE_INSTALLATION.map((c) => (
                <div key={c.composant} className="bg-white border border-sand-200 rounded-xl p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 m-0 mb-1">
                    {c.composant}
                  </h3>
                  <p className="text-sm text-sand-700 m-0">{c.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="aides">Aides 2026 cumulées</h2>
            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov&apos; Bleu</strong> (revenus très modestes) :{' '}
                <strong>7 000 €</strong>. MPR Jaune (modestes) : 5 500 €. MPR Violet
                (intermédiaires) : 4 000 €. MPR Rose (aisés) : 0 € depuis 2024 sauf parcours
                accompagné.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>CEE BAR-TH-104</strong> (chaudière biomasse autonome) +{' '}
                <strong>Coup de pouce chauffage</strong> sortie fioul ou gaz :{' '}
                <strong>4 000-5 000 €</strong> selon revenus.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> : jusqu&apos;à <strong>30 000 €</strong> par geste
                (chaudière biomasse), 50 000 € en rénovation d&apos;ampleur (3 gestes mini).
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> : matériel + pose, sous condition d&apos;installateur RGE
                Qualibois et logement de plus de 2 ans.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aides locales</strong> (région, département, métropole) : variables 500-3
                000 €. Voir notre simulateur pour le détail par département.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Cumul aides : ordre des opérations</p>
                <p className="m-0">
                  Le cumul MPR + CEE + éco-PTZ + TVA 5,5 % est autorisé mais conditionné à un ordre
                  strict : (1) déposer le dossier France Rénov&apos; AVANT signature du devis, (2)
                  valider le devis avec installateur RGE Qualibois, (3) faire intervenir le «
                  mandataire CEE » (souvent l&apos;installateur ou un délégataire) AVANT le
                  démarrage des travaux. Une signature avant dépôt = perte de toutes les aides.
                </p>
              </div>
            </div>

            <h2 id="comparatif">Chaudière granulés vs autres systèmes</h2>
            <div className="not-prose overflow-x-auto my-6">
              <table className="min-w-full bg-white border border-sand-200 rounded-xl text-sm">
                <thead className="bg-sand-100 text-sand-900">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Critère</th>
                    <th className="text-left px-3 py-2 font-semibold">Granulés</th>
                    <th className="text-left px-3 py-2 font-semibold">Fioul</th>
                    <th className="text-left px-3 py-2 font-semibold">PAC air-eau</th>
                    <th className="text-left px-3 py-2 font-semibold">Poêle granulés</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF_VS_AUTRES.map((c) => (
                    <tr key={c.critere} className="border-t border-sand-100">
                      <td className="px-3 py-2 align-top font-semibold text-sand-900">
                        {c.critere}
                      </td>
                      <td className="px-3 py-2 align-top text-primary-700 font-semibold">
                        {c.granules}
                      </td>
                      <td className="px-3 py-2 align-top text-sand-700">{c.fioul}</td>
                      <td className="px-3 py-2 align-top text-sand-700">{c.pac}</td>
                      <td className="px-3 py-2 align-top text-sand-700">{c.poele}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="quand-choisir">Quand choisir une chaudière à granulés ?</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUAND_CHOISIR.map((q) => (
                <div key={q.cas} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {q.cas}
                    </h3>
                    <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded whitespace-nowrap">
                      {q.reco}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{q.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-primary-200 bg-primary-50 rounded-lg p-5 my-8">
              <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-primary-900 m-0 mb-1">
                  Estimer mes aides chaudière granulés en 2 minutes
                </p>
                <p className="text-sm text-primary-900 m-0 mb-3">
                  Notre simulateur compare votre situation (revenus, surface, énergie actuelle) pour
                  estimer le coût net après aides — chaudière granulés vs PAC vs condensation.
                  Résultat argumenté avec montants MPR + CEE 2026 actualisés et liste de
                  chauffagistes Qualibois proches de chez vous.
                </p>
                <Link
                  href="/simulateur-aides-renovation"
                  className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                >
                  Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>

            <h2 id="installation">Installation et obligations</h2>
            <ul>
              <li>
                <Wrench className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Installateur RGE Qualibois &laquo; Module Chaudières &raquo;</strong>{' '}
                obligatoire (distinct de Qualibois Air poêles). Sans cette mention, aides MPR/CEE
                rejetées et TVA passe à 20 %.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Norme EN 303-5 classe 5</strong> + label{' '}
                <strong>Flamme Verte 7 étoiles</strong> obligatoires pour les aides depuis 2020. À
                vérifier sur la fiche technique du matériel.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Conduit de fumée</strong> en inox classe T400 minimum (résistant 400 °C).
                Tubage du conduit existant 600-1 200 € ou conduit neuf double paroi 1 500-3 000 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Local technique</strong> : 5-7 m² minimum (chaudière + silo + accès vis),
                sec, ventilé, accès facile pour livraison granulés (camion souffleur, tuyau 30-40
                m).
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Entretien annuel</strong> obligatoire (Décret 2009-649). 180-280 € HT/an.
                Ramonage conduit 2 fois/an dont 1 en saison de chauffe (Décret 2023-741).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marques fiables</strong> : Okofen (Autriche), Hargassner (Autriche), Fröling
                (Autriche), Viessmann Vitoligno (Allemagne), De Dietrich Bioneo, Atlantic Loganova.
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
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/chauffage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Chauffage
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes Qualibois <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
