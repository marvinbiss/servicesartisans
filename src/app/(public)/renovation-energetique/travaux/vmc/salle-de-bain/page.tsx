/**
 * Page : /renovation-energetique/travaux/vmc/salle-de-bain
 *
 * @kw-primary    vmc salle de bain
 * @kw-volume     9800
 * @kw-kd         0
 * @kw-cpc        0.07
 * @cluster       reno-energetique-vmc-salle-de-bain
 * @ahrefs-source api-live
 * @snapshot      2026-05-06
 * @backlog-item  B5 (récap audits 2026-05-06 — Bloc 1 Ahrefs cluster VMC SDB)
 *
 * KW cibles validés Ahrefs API live (2026-05-06, country=fr) :
 * - "vmc salle de bain"          → 9 800 vol, KD 0, CPC $0,07 ⭐⭐⭐⭐⭐ MEGA PIVOT
 * - "aerateur salle de bain"     → 1 000 vol, KD 0, CPC $0,06 ⭐⭐⭐⭐
 * - "extracteur salle de bain"   →   600 vol, KD 0, CPC $0,07 ⭐⭐⭐
 * - "vmc pour salle de bain"     →   300 vol, KD 0, CPC $0,07
 * - "vmc sdb"                    →   200 vol, KD 0, CPC $0,10
 * - Famille cumulée pivot : ~11 900 vol/mois (KD 0 partout = TOP TOP EASY WIN)
 *
 * Easy win : OUI MEGA — KD 0 sur tout le cluster, leader actuel = sites fabricants
 * (aldes.fr, atlantic-clim.com) + marketplaces (manomano, leroy merlin) = pas
 * d'éditorial neutre + RGE local. Atout SA : artisans Qualibat 8721 + simulateur.
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → VMC → Salle de bain
 *
 * Anti-cannibalisation :
 *   - Hub /vmc = panorama 4 types VMC (autoréglable / hygro / double flux)
 *   - /vmc/installation = installation centralisée maison entière
 *   - /vmc/hygroreglable = type technique hygro
 *   - /vmc/simple-flux = type technique simple flux
 *   - /vmc/entretien = obligation entretien (B6 H 2026-05-04)
 *   - Cette page = focus PIÈCE HUMIDE (SDB) : extracteur autonome OU bouche VMC
 *     centralisée, débits réglementaires, NF C 15-100 volumes humides, sans
 *     fenêtre, marques dédiées SDB. Pas de chevauchement type technique.
 *
 * YMYL : sécurité électrique humide (NF C 15-100) + santé (humidité, moisissures,
 *        légionelle) + conformité réglementaire (arrêté 24/03/1982 + RSD).
 * Cite Légifrance + ADEME + Code construction + DTU 68.3 + NF C 15-100.
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
  Volume2,
  Wind,
  Zap,
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
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/vmc/salle-de-bain'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'VMC Salle de Bain 2026 : extracteur, débit, normes, prix'
const DESCRIPTION =
  'VMC salle de bain 2026 : extracteur 60-300 € posé, bouche VMC 50-150 €. Débit min 15 m³/h. Normes NF C 15-100 IP44 + arrêté 24/03/1982. Hygro vs détection.'

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
  'Ventilation mécanique obligatoire dans toute salle de bain depuis 1982 (arrêté 24/03/1982 modifié).',
  'Débits réglementaires : 15 m³/h (SDB seule), 30 m³/h (SDB + WC), 30 m³/h (cuisine), 15 m³/h (WC).',
  '3 solutions : bouche VMC centralisée existante, extracteur intermittent (40-150 €), extracteur permanent hygro (100-300 €).',
  'NF C 15-100 — appareils en volume 1 ou 2 doivent être IPX4 minimum, classe II, alimentation par DDR 30 mA.',
  'SDB sans fenêtre : extraction mécanique impérative (RSD type 1981, art. 47). Permanent + détection humidité conseillé.',
  'Marques top : Aldes EasyHome, Atlantic VPI, Unelvent S&P, Vortice Punto, Helios MiniVent — niveau sonore < 30 dB(A) pour confort.',
]

const SOLUTIONS = [
  {
    titre: 'Bouche VMC centralisée existante',
    prix: '50-150 € (bouche + raccord)',
    intent: 'Maison déjà équipée VMC simple flux ou double flux',
    detail:
      'Si la maison a déjà une VMC simple flux ou double flux centralisée, raccorder une bouche dédiée SDB est la solution la plus économique. Bouche autoréglable 15-30 m³/h pour ~30 €, bouche hygroréglable 10-45 m³/h ~80 €. Pose par chauffagiste/électricien : 1-2 h.',
    icon: 'wind',
  },
  {
    titre: 'Extracteur intermittent (avec interrupteur ou détection)',
    prix: '60-180 € posé',
    intent: 'SDB sans VMC centrale, usage occasionnel',
    detail:
      'Petit ventilateur mural ou plafonnier, déclenché par interrupteur ou détecteur de mouvement. Débit 80-100 m³/h. Modèles à minuterie pour fonctionner 5-15 min après douche. Pose simple si gaine d’évacuation existante.',
    icon: 'wind',
  },
  {
    titre: 'Extracteur permanent hygroréglable',
    prix: '120-350 € posé',
    intent: 'SDB sans fenêtre, famille avec enfants, zone très humide',
    detail:
      'Fonctionne en continu à débit minimum (5-10 m³/h), monte automatiquement à 80-130 m³/h dès que l’hygrométrie dépasse 65 %. Solution la plus efficace contre moisissures et condensation. Conso élec ~5 €/an.',
    icon: 'droplets',
  },
  {
    titre: 'Extracteur double débit avec timer',
    prix: '90-220 € posé',
    intent: 'SDB familiale, douche fréquente',
    detail:
      'Marche petit débit en continu (15-25 m³/h), passe en grand débit (80-100 m³/h) sur action de l’interrupteur, retour automatique après 10-30 min. Bon compromis efficacité/silence (souvent < 28 dB(A)).',
    icon: 'wind',
  },
  {
    titre: 'VMC double flux + bouche SDB',
    prix: '+200-400 € (par rapport à autoréglable)',
    intent: 'Rénovation globale + récup chaleur',
    detail:
      'Si vous installez une VMC double flux pour toute la maison (4 000-6 500 € posé), la bouche SDB est intégrée. Récupère 70-90 % de la chaleur extraite. Éligible MaPrimeRénov’ jusqu’à 2 500 €.',
    icon: 'wind',
  },
]

const DEBITS_REGLEMENTAIRES = [
  {
    piece: 'Salle de bain seule',
    debit_mini: '15 m³/h (continu) ou 30 m³/h (intermittent)',
    detail: 'Arrêté 24/03/1982 art. 3 — applicable T1, T2, T3 standard.',
  },
  {
    piece: 'Salle de bain + WC',
    debit_mini: '30 m³/h (continu) ou 60 m³/h (intermittent)',
    detail: 'Cumul SDB + WC dans la même pièce.',
  },
  {
    piece: 'Salle d’eau (douche seule)',
    debit_mini: '15 m³/h (continu) ou 30 m³/h (intermittent)',
    detail: 'Pas de baignoire = même débit que SDB seule.',
  },
  {
    piece: 'WC séparé',
    debit_mini: '15 m³/h (continu) ou 30 m³/h (intermittent)',
    detail: 'Pour T1, débit ramené à 5 m³/h continu acceptable.',
  },
  {
    piece: 'Cuisine (référence)',
    debit_mini: '30 m³/h (continu) ou 135 m³/h (intermittent ≥ 4 pièces)',
    detail: 'Pour info : la cuisine a les débits les plus élevés.',
  },
]

const VOLUMES_NFC15100 = [
  {
    volume: 'Volume 0',
    desc: 'Intérieur baignoire/douche',
    ip: 'IPX7 obligatoire',
    detail:
      'Aucun appareil électrique autorisé sauf TBTS 12 V (très basse tension de sécurité). Aucune VMC.',
  },
  {
    volume: 'Volume 1',
    desc: 'Au-dessus baignoire/douche jusqu’à 2,25 m',
    ip: 'IPX4 mini, classe II, TBTS 25 V',
    detail:
      'Extracteur autorisé si IPX4 (ou supérieur) + protection DDR 30 mA + alimentation TBTS 25 V max.',
  },
  {
    volume: 'Volume 2',
    desc: '60 cm autour volume 1 + jusqu’à 3 m haut',
    ip: 'IPX4 mini',
    detail:
      'Extracteurs résidentiels classiques OK. Prises électriques toujours interdites (sauf rasoirs avec transfo séparation).',
  },
  {
    volume: 'Hors volume',
    desc: 'Reste de la pièce au-delà 60 cm volume 2',
    ip: 'IP21 mini',
    detail:
      'Tous les appareils résidentiels classés IP21 sont autorisés. Prise interrupteur normaux OK avec DDR 30 mA général de la SDB.',
  },
]

const TOP_MARQUES = [
  {
    marque: 'Aldes',
    modele: 'EasyHome PureAir',
    prix: '90-180 €',
    detail: 'Hygroréglable, 0-115 m³/h, 28 dB(A). Made in France.',
  },
  {
    marque: 'Atlantic',
    modele: 'VPI Compact',
    prix: '70-150 €',
    detail: 'Détection présence + hygro, 100 m³/h, 27 dB(A). Garantie 2 ans.',
  },
  {
    marque: 'Unelvent (S&P)',
    modele: 'Silent Dual',
    prix: '85-180 €',
    detail: 'Double débit 12/120 m³/h, 26 dB(A). Réf marché silence.',
  },
  {
    marque: 'Vortice',
    modele: 'Punto Filo MF 90/3.5"',
    prix: '50-120 €',
    detail: 'Bon rapport qualité/prix, 80 m³/h, 35 dB(A). Italien.',
  },
  {
    marque: 'Helios',
    modele: 'MiniVent M1/120',
    prix: '120-280 €',
    detail: 'Haut de gamme allemand, 120 m³/h, 24 dB(A). Très silencieux.',
  },
]

const faqs = [
  {
    question: 'Une VMC est-elle obligatoire dans une salle de bain ?',
    answer:
      'OUI. Toute salle de bain doit être ventilée mécaniquement depuis l’arrêté du 24 mars 1982 modifié (article 3). Le débit minimum réglementaire est 15 m³/h en continu pour une SDB seule, 30 m³/h si elle inclut un WC. Pour une SDB sans fenêtre extérieure, l’extraction mécanique est impérative (Règlement Sanitaire Départemental type, article 47). Sans ventilation conforme : risque de moisissures, dégradation matériaux, mais aussi sanction administrative en cas de location (logement non décent au sens du décret 2002-120).',
  },
  {
    question: 'Quel débit choisir pour une VMC salle de bain ?',
    answer:
      'Le débit dépend de la configuration : (1) SDB seule : 15 m³/h en continu OU 30 m³/h en intermittent ; (2) SDB + WC : 30 m³/h continu OU 60 m³/h intermittent ; (3) en grand débit (action douche) : 80-130 m³/h selon le volume de la pièce. Pour une SDB de 6-8 m², un extracteur de 80-100 m³/h grand débit est suffisant. Pour 10-15 m², privilégier 100-130 m³/h. Vérifier le débit nominal sur la fiche technique du produit (norme NF EN 13141-1).',
  },
  {
    question: 'Quelle est la différence entre extracteur, aérateur et VMC ?',
    answer:
      '“Aérateur” et “extracteur” désignent le même appareil : un petit ventilateur mural ou plafonnier dédié à une seule pièce humide. Il aspire l’air vicié et le rejette à l’extérieur via un conduit dédié. La “VMC” (Ventilation Mécanique Contrôlée) est un système centralisé : un caisson moteur unique dans les combles aspire l’air de toutes les pièces humides via un réseau de gaines. La VMC centralisée est plus efficace énergétiquement (récup chaleur en double flux) mais nécessite des combles ou faux-plafonds accessibles. L’extracteur dédié est la seule option en appartement non équipé.',
  },
  {
    question: 'Quelle norme électrique pour une VMC dans salle de bain ?',
    answer:
      'NF C 15-100 (norme électrique résidentielle française) impose des protections selon la zone : (1) Volume 0 (intérieur baignoire/douche) : aucun appareil sauf TBTS 12 V — JAMAIS de VMC ; (2) Volume 1 (au-dessus baignoire/douche jusqu’à 2,25 m) : IPX4 minimum, classe II, alimentation TBTS 25 V ; (3) Volume 2 (60 cm autour volume 1) : IPX4 minimum ; (4) Hors volumes : IP21. Tous appareils en volume humide doivent être protégés par un disjoncteur différentiel (DDR) 30 mA dédié SDB. Choisir un extracteur certifié NF (marquage CE + IP44 ou IPX4 minimum). Travaux à confier à un électricien qualifié (Qualifelec).',
  },
  {
    question: 'Quel extracteur pour une salle de bain sans fenêtre ?',
    answer:
      'Privilégier un extracteur PERMANENT à débit modulé : petit débit en continu (5-15 m³/h, conso 1-3 W) + grand débit hygroréglable (80-130 m³/h dès humidité > 65 %). Modèles recommandés : Aldes EasyHome PureAir (140-180 €), Unelvent Silent Dual (130-180 €), Atlantic VPI Compact (100-150 €). Éviter les extracteurs purement intermittents (interrupteur uniquement) car en SDB sans fenêtre, l’absence de ventilation continue favorise moisissures et compromet l’étanchéité à l’air du logement.',
  },
  {
    question: 'Combien coûte l’installation d’une VMC dans une SDB ?',
    answer:
      'En 2026 : (1) Bouche VMC raccordée à un système centralisé existant : 50-150 € fournie posée (1-2 h de pose) ; (2) Extracteur autonome basique : 60-180 € posé (kit + installation) ; (3) Extracteur hygroréglable haut de gamme : 150-350 € posé ; (4) Si conduit d’évacuation à créer (mur extérieur ou toiture) : +200-500 € de maçonnerie/zinguerie. Pose à confier à un électricien qualifié (Qualifelec) en zone humide ou un chauffagiste si raccord VMC centralisée. TVA 10 % en rénovation logement > 2 ans.',
  },
  {
    question: 'Une VMC SDB consomme-t-elle beaucoup d’électricité ?',
    answer:
      'NON, c’est négligeable. Un extracteur moderne consomme 5-30 W en grand débit, 1-5 W en petit débit. Sur une utilisation moyenne (2-3 douches/jour, 30 min cumulées de grand débit + 24 h de petit débit) : 30-50 kWh/an = 8-13 € à l’année (tarif EDF Base 2026). Une VMC centralisée double flux consomme un peu plus (50-100 kWh/an pour la maison entière) mais récupère 70-90 % de la chaleur extraite, économisant 100-300 €/an de chauffage.',
  },
  {
    question: 'VMC ou extracteur : quel choix en rénovation ?',
    answer:
      'Si le logement N’A PAS de VMC : extracteur autonome dédié SDB (60-300 €) — solution rapide et conforme. Si vous prévoyez une rénovation globale incluant l’isolation, installer une VMC simple flux hygroréglable B (900-2 500 € posé toute la maison) ou double flux (4 000-6 500 €) avec bouches dans toutes les pièces humides est plus performant et éligible à MaPrimeRénov’ (jusqu’à 2 500 € pour double flux). Le choix dépend du budget, de l’accessibilité des combles et du projet global. Pour comparer, voir notre guide VMC complet.',
  },
]

const sources = [
  {
    label: 'Légifrance — Arrêté du 24 mars 1982 modifié (aération logements)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000852525',
  },
  {
    label: 'Légifrance — Arrêté du 30 mai 1989 (ventilation locaux pollution non spécifique)',
    url: 'https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006065881',
  },
  {
    label: 'Légifrance — Code construction R162 (ventilation logements)',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096',
  },
  {
    label: 'AFNOR — NF DTU 68.3 (mise en œuvre VMC simple/double flux)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — NF C 15-100 (électricité résidentielle, volumes humides)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'ADEME — Guide ventilation des logements',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'Service-Public.fr — Décret logement décent 2002-120',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F1311',
  },
]

const relatedPages = [
  {
    label: 'Hub VMC : 4 types comparés',
    href: '/renovation-energetique/travaux/vmc',
    description: 'Autoréglable, hygroréglable, double flux + prix posé',
  },
  {
    label: 'VMC simple flux',
    href: '/renovation-energetique/travaux/vmc/simple-flux',
    description: 'Extraction simple, débit autoréglable ou hygroréglable',
  },
  {
    label: 'VMC hygroréglable type A et B',
    href: '/renovation-energetique/travaux/vmc/hygroreglable',
    description: 'Économie 5-10 % vs autoréglable, choix #1 rénovation',
  },
  {
    label: 'VMC double flux',
    href: '/renovation-energetique/travaux/vmc-double-flux',
    description: 'Récup chaleur 70-90 %, MaPrimeRénov’ jusqu’à 2 500 €',
  },
  {
    label: 'Entretien VMC obligation',
    href: '/renovation-energetique/travaux/vmc/entretien',
    description: 'Tous les 1-3 ans, prix 80-300 €/intervention',
  },
  {
    label: 'Trouver un électricien Qualifelec',
    href: '/services/electricien',
    description: 'Pour pose volume humide NF C 15-100',
  },
]

export default async function Page() {
  const providers = await getProvidersByService('ventilation', 6)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — VMC — Salle de bain',
    keywords: [
      'vmc salle de bain',
      'aerateur salle de bain',
      'extracteur salle de bain',
      'vmc pour salle de bain',
      'vmc sdb',
      'vmc salle de bain sans fenetre',
      'extracteur hygroreglable',
      'NF C 15-100 volumes humides',
      'arrêté 24 mars 1982',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC', url: '/renovation-energetique/travaux/vmc' },
    { name: 'Salle de bain', url: PAGE_PATH },
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
              { label: 'VMC', href: '/renovation-energetique/travaux/vmc' },
              { label: 'Salle de bain' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wind className="w-3.5 h-3.5" aria-hidden />
              Arrêté 24/03/1982 — Débit min 15 m³/h
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              VMC Salle de Bain 2026 : extracteur, débit, normes, prix
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une <strong>salle de bain doit obligatoirement être ventilée mécaniquement</strong>{' '}
              depuis l’arrêté du 24 mars 1982 modifié (débit minimum 15 m³/h). Trois solutions :
              raccorder une bouche à une <strong>VMC centralisée existante</strong> (50-150 €),
              poser un <strong>extracteur autonome</strong> (60-300 €), ou installer une{' '}
              <strong>VMC double flux</strong> en rénovation globale (jusqu’à 2 500 €
              MaPrimeRénov’). Voici les normes, les débits réglementaires et le bon choix selon
              votre configuration.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="obligation">Pourquoi ventiler obligatoirement une salle de bain</h2>
            <p>
              <Droplets className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Une salle de bain produit en moyenne{' '}
              <strong>1-2 litres de vapeur d’eau par douche</strong>. Sans extraction mécanique,
              l’hygrométrie monte rapidement à 80-95 % et reste élevée plusieurs heures.
              Conséquences :
            </p>
            <ul>
              <li>
                <strong>Moisissures et champignons</strong> : prolifération sur murs, joints,
                plafonds dès 70 % d’humidité prolongée.
              </li>
              <li>
                <strong>Dégradation matériaux</strong> : peinture qui cloque, papier peint qui se
                décolle, joints noircis, faïence fissurée.
              </li>
              <li>
                <strong>Ponts thermiques accentués</strong> : eau de condensation sur murs froids =
                isolation dégradée + risque mérule.
              </li>
              <li>
                <strong>Risques sanitaires</strong> : asthme, allergies, infections respiratoires
                liées aux moisissures (ANSES 2022).
              </li>
              <li>
                <strong>Logement non décent</strong> : décret 2002-120 — le bailleur peut être
                contraint de remettre en conformité (frais à sa charge).
              </li>
            </ul>
            <p>
              La <strong>réglementation française</strong> (arrêté du 24 mars 1982 modifié, article
              3) impose une ventilation générale et permanente de tout logement, avec extraction
              mécanique dans les pièces humides (cuisine, SDB, WC, cellier). Toute construction
              neuve ou rénovation lourde doit s’y conformer.
            </p>

            <h2 id="solutions">3 solutions pour ventiler la salle de bain</h2>
            <div className="not-prose grid gap-3 my-6">
              {SOLUTIONS.map((s) => (
                <div key={s.titre} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-1">
                    <Wind className="w-4 h-4 text-primary-700 shrink-0 mt-1" aria-hidden />
                    <p className="font-semibold text-sand-900 m-0">{s.titre}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <p className="text-sand-500 text-xs m-0">Prix 2026</p>
                      <p className="font-medium text-primary-700 m-0">{s.prix}</p>
                    </div>
                    <div>
                      <p className="text-sand-500 text-xs m-0">Quand choisir</p>
                      <p className="font-medium text-sand-900 m-0">{s.intent}</p>
                    </div>
                  </div>
                  <p className="text-sm text-sand-700 mt-2 mb-0">{s.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="debits">Débits réglementaires obligatoires (arrêté 24/03/1982)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Pièce</th>
                    <th className="p-3 border-b border-sand-200">Débit minimum</th>
                    <th className="p-3 border-b border-sand-200">Précision</th>
                  </tr>
                </thead>
                <tbody>
                  {DEBITS_REGLEMENTAIRES.map((d) => (
                    <tr key={d.piece} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold text-sand-900">{d.piece}</td>
                      <td className="p-3 text-primary-700 font-semibold">{d.debit_mini}</td>
                      <td className="p-3 text-xs text-sand-700">{d.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Débit en mode "intermittent" possible si l’occupant déclenche manuellement la grande
              vitesse (ex : interrupteur après douche). Sinon, le débit continu s’applique. Norme NF
              EN 13141-1 mesure les débits en conditions standardisées.
            </p>

            <h2 id="nf-c-15-100">NF C 15-100 : règles électriques en salle de bain</h2>
            <p>
              <Zap className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              La norme NF C 15-100 (édition 2015 + amendements) divise la salle de bain en{' '}
              <strong>4 volumes</strong> selon la distance à la baignoire ou douche. Chaque volume
              impose un indice de protection (IPxx) minimum pour les appareils électriques, dont la
              VMC :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {VOLUMES_NFC15100.map((v) => (
                <div key={v.volume} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sand-900 m-0">{v.volume}</p>
                    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                      {v.ip}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0 mb-1">
                    <em>{v.desc}</em>
                  </p>
                  <p className="text-sm text-sand-700 m-0">{v.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-sand-500">
              Tous les circuits électriques de la SDB doivent être protégés par un disjoncteur
              différentiel haute sensibilité <strong>30 mA</strong> (NF C 15-100 § 415). Travaux à
              confier impérativement à un électricien certifié{' '}
              <Link href="/services/electricien">Qualifelec ou équivalent</Link>.
            </p>

            <h2 id="sans-fenetre">Salle de bain sans fenêtre : extraction permanente impérative</h2>
            <p>
              Une SDB sans fenêtre extérieure (cas fréquent en T2/T3 et copropriétés) ne peut être
              ventilée naturellement. Le Règlement Sanitaire Départemental type (article 47) et
              l’arrêté du 24 mars 1982 imposent une{' '}
              <strong>ventilation mécanique permanente</strong> (jamais coupée), avec un débit
              minimum 15 m³/h en continu.
            </p>
            <p>
              <strong>Solution recommandée</strong> : extracteur PERMANENT hygroréglable
              fonctionnant en continu en petit débit (5-15 m³/h), passant automatiquement en grand
              débit (80-130 m³/h) dès que l’hygrométrie dépasse 65 %. Modèles éprouvés : Aldes
              EasyHome PureAir, Unelvent Silent Dual, Atlantic VPI Compact. Compter 140-280 € posé.
            </p>

            <h2 id="prix-marques">Prix et top marques 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Marque</th>
                    <th className="p-3 border-b border-sand-200">Modèle référence</th>
                    <th className="p-3 border-b border-sand-200">Prix 2026</th>
                    <th className="p-3 border-b border-sand-200">Spécificités</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_MARQUES.map((m) => (
                    <tr key={m.marque} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold text-sand-900">{m.marque}</td>
                      <td className="p-3 text-sand-700">{m.modele}</td>
                      <td className="p-3 text-primary-700 font-semibold">{m.prix}</td>
                      <td className="p-3 text-xs text-sand-700">{m.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Prix indicatifs hors pose. La pose ajoute 80-150 € (extracteur sur conduit existant)
              ou 200-500 € si percement de mur extérieur ou raccordement toiture nécessaire. TVA 10
              % applicable en rénovation logement &gt; 2 ans.
            </p>

            <h2 id="silence">Niveau sonore : critère de confort numéro 1</h2>
            <p>
              <Volume2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Le niveau sonore d’un extracteur SDB est mesuré en <strong>dB(A) à 3 m</strong> selon
              la norme NF EN ISO 3744. Pour un usage résidentiel confortable, viser :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>&lt; 25 dB(A)</strong> : excellent, quasi inaudible (chambre adulte
                acceptable). Modèles : Helios MiniVent, Aldes EasyHome.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>25-30 dB(A)</strong> : très bon (bibliothèque silencieuse). Standard marché
                premium.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>30-35 dB(A)</strong> : acceptable (salle de bain familiale). Standard marché
                grand public.
              </li>
              <li>
                <AlertTriangle className="inline w-4 h-4 text-amber-700 mr-1" aria-hidden />
                <strong>&gt; 35 dB(A)</strong> : à éviter — fatigant à l’usage, surtout si SDB
                proche chambre.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Devis ventilation SDB 2026
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 devis d’électriciens Qualifelec ou chauffagistes Qualibat 8721 (volume humide
                    + raccord VMC). Réponse sous 48 h, déplacement gratuit.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">
                  Attention : pose volume humide = NF C 15-100
                </p>
                <p className="m-0">
                  L’installation d’un extracteur en zone humide (volume 1 ou 2) impose un
                  électricien qualifié <strong>Qualifelec</strong> ou équivalent (Code travail
                  R4544). Une pose non conforme peut entraîner refus d’assurance habitation en cas
                  d’électrocution + sanction administrative jusqu’à 4 500 € (Code conso art.
                  L132-1). Toujours exiger une attestation Consuel pour pose neuve.
                </p>
              </div>
            </div>
          </article>

          <SimulateurAideBox
            serviceKey="vmc"
            estimatedSaving={300}
            subtitle="CEE Coup de pouce 100-300 € + TVA 5,5 % (rénovation > 2 ans) — éligibilité conditionnée à un artisan RGE Qualibat 8721 ou Qualifelec"
          />

          <LocalProviderShowcase
            providers={providers}
            serviceName="Installateur VMC RGE"
            cityName="France"
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
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/vmc"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub VMC
            </Link>
            <Link
              href="/renovation-energetique/travaux/vmc/entretien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Entretien VMC <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
