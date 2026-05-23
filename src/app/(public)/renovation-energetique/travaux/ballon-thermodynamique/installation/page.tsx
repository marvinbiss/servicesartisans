/**
 * Page : /renovation-energetique/travaux/ballon-thermodynamique/installation
 *
 * @kw-primary    installation ballon thermodynamique
 * @kw-volume     ~300
 * @kw-kd         0
 * @kw-cpc        TBD
 * @intent        commercial + how-to
 * @cluster       ballon_thermo
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster ballon_thermo)
 * @backlog-item  Sprint3-ballon-thermodynamique-installation
 * @author        marc-lefebvre
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "installation ballon thermodynamique"      ~300 vol, KD 0 ⭐ PIVOT how-to
 * - "pose ballon thermodynamique"               ~180 vol, KD 0
 * - "installer un ballon thermodynamique"       ~150 vol, KD 0
 * - "ballon thermodynamique installation prix"  ~120 vol, KD 0
 * - "remplacement ballon thermodynamique"        ~90 vol, KD 0
 * - "ballon thermodynamique installation rge"    ~60 vol, KD 0
 *
 * Easy win : OUI MAJEUR (KD 0 sur tous KW, intent how-to + commercial).
 * Page how-to + checklist devis + conditions techniques + RGE obligatoire.
 *
 * Anti-cannibalisation :
 *   - /ballon-thermodynamique          = hub PRODUIT (capacités, marques)
 *   - /ballon-thermodynamique/prix     = sous-page PRIX (grille, ROI)
 *   - Cette page                       = sous-page INSTALLATION (étapes, pose)
 *
 * YMYL high : pose équipement électrique 230 V, fluide frigorigène, évacuation
 * condensats, RGE QualiPAC/Qualisol obligatoire pour aides. Cite : Légifrance,
 * France Rénov', ADEME, AFNOR EN 16147, ANAH, NF DTU 60.1.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Award,
  Calculator,
  CheckCircle2,
  ShieldCheck,
  Wrench,
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
  getGovernmentServiceSchema,
  getHowToSchema,
  getServiceSchema,
} from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import PrixComparatif from '@/components/conversion/PrixComparatif'
import FinalCtaSection from '@/components/conversion/FinalCtaSection'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/ballon-thermodynamique/installation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Installation ballon thermodynamique 2026 : étapes & prix pose'
const DESCRIPTION =
  'Installation ballon thermodynamique 2026 : pose 1-2 jours, prix 900-2 200 € main d’œuvre, conditions techniques, RGE QualiPAC obligatoire pour aides.'

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
  'Durée installation : 1 jour (remplacement standard) à 2 jours (nouvelle pose ou modèle split).',
  'Prix pose seule (main d’œuvre) : 900-2 200 € selon capacité et complexité.',
  'Local technique requis : 20 m³ minimum, T° 5-30 °C, sec, ventilé (cellier, garage, buanderie).',
  'Évacuation condensats vers eaux usées avec siphon (eau pH 5-6, ~5 L/jour).',
  'Raccordement électrique 230 V monophasé 16 A dédié + différentiel 30 mA.',
  'RGE QualiPAC ou Qualisol obligatoire pour MPR + CEE BAR-TH-148 + TVA 5,5 %.',
  'Mise en service avec mesure performances + procès-verbal + formation utilisateur.',
]

const ETAPES = [
  {
    step: 'Visite technique préalable',
    duree: '30-60 min',
    detail:
      'L’artisan vérifie : volume du local (20 m³ minimum pour modèle air ambiant), température hivernale (5-30 °C), accès évacuation eaux usées, état du tableau électrique, espace pour le ballon (Ø 600 mm × H 1 600-2 100 mm), trajet futur des liaisons. Pour modèle split : emplacement unité extérieure (mur, sol, distance < 10 m).',
  },
  {
    step: 'Devis détaillé + acceptation aides',
    duree: 'J+0 à J+15',
    detail:
      'Devis exigé en 3 exemplaires comparatifs. Doit contenir : marque, modèle, capacité, COP NF EN 16147, classe énergétique, garantie cuve 5 ans, total HT, TVA 5,5 %, total TTC. Dépôt MaPrimeRénov’ sur france-renov.gouv.fr et signature contrat CEE BAR-TH-148 AVANT signature devis. Acceptation aides en 7-15 jours.',
  },
  {
    step: 'Signature devis + acompte',
    duree: 'J+15',
    detail:
      'Acompte 20-30 % à la signature. Délai légal de rétractation 14 jours. Planification du chantier 2-6 semaines après signature selon disponibilité de l’artisan et délai de livraison du matériel.',
  },
  {
    step: 'Dépose ancien chauffe-eau',
    duree: '1-2 h',
    detail:
      'Vidange complète de la cuve (raccordement vers évacuation), débranchement électrique (coupure disjoncteur), démontage des raccords plomberie (eau froide, eau chaude, groupe sécurité). Évacuation de l’ancien ballon vers déchetterie ou recyclage matière.',
  },
  {
    step: 'Préparation emplacement + tableau électrique',
    duree: '1-2 h',
    detail:
      'Mise à niveau du sol (socle si nécessaire), création ou renforcement du tableau électrique (disjoncteur dédié 16 A + différentiel 30 mA), passage du câblage 230 V monophasé sous gaine ICTA. Pour modèle split : préparation de l’unité extérieure (support mural/socle anti-vibratile).',
  },
  {
    step: 'Pose du ballon thermodynamique',
    duree: '2-4 h',
    detail:
      'Mise en place de la cuve (poids 80-150 kg selon capacité, manutention à 2 personnes), raccordement hydraulique (eau froide en bas, eau chaude en haut, groupe de sécurité 3 bar obligatoire, vase d’expansion sanitaire si pression réseau > 5 bar), raccordement condensats vers eaux usées avec siphon, mise à la terre.',
  },
  {
    step: 'Installation unité extérieure (modèle split uniquement)',
    duree: '2-3 h',
    detail:
      'Pose support extérieur (anti-vibratile, distance ≥ 30 cm du mur, hauteur ≥ 30 cm du sol), passage liaisons frigorifiques (cuivre + isolant, longueur 5-10 m max), raccordement électrique unité extérieure, tirage au vide circuit frigorifique avec pompe à vide, contrôle pression et étanchéité.',
  },
  {
    step: 'Raccordement électrique + mise sous tension',
    duree: '30-60 min',
    detail:
      'Câblage 230 V monophasé depuis tableau électrique vers boîtier de raccordement du ballon. Vérification continuité terre, polarité, isolement (mégohmmètre). Mise sous tension contrôlée, premier démarrage compresseur (à vide pendant 5-10 min).',
  },
  {
    step: 'Mise en service + mesure performances',
    duree: '1-2 h',
    detail:
      'Remplissage de la cuve en eau (200-300 L), purge des points hauts, mise en chauffe à 60 °C. Mesure des températures (entrée / sortie / ambiant / évaporateur) avec thermomètre infrarouge, contrôle COP réel sur cycle complet (référence A15 selon NF EN 16147), vérification niveau sonore (< 45 dB à 1 m).',
  },
  {
    step: 'Procès-verbal + formation utilisateur',
    duree: '20-30 min',
    detail:
      'Remise du procès-verbal de mise en service (températures, COP mesuré, débit, niveau sonore), notice d’utilisation, programmation horaires (mode économie nuit, mode boost vacances), explications entretien (anode magnésium 2-3 ans, nettoyage évaporateur annuel, vidange si eau dure).',
  },
]

const CONDITIONS_TECHNIQUES = [
  {
    label: 'Volume local technique',
    valeur: '≥ 20 m³ (modèle air ambiant)',
    detail:
      'Le ballon prélève la chaleur de l’air ambiant et refroidit la pièce de 2-4 °C en hiver. Un local sous-dimensionné = COP effondré. Idéal : cellier, garage non chauffé, buanderie, sous-sol ventilé. À éviter : pièce de vie, chambre.',
  },
  {
    label: 'Température du local',
    valeur: '5-30 °C toute l’année',
    detail:
      'En dessous de 5 °C, le COP chute fortement et le compresseur peut tomber en sécurité. Au-dessus de 30 °C, surchauffe possible. Vérifier la température hivernale réelle avant choix de l’emplacement.',
  },
  {
    label: 'Évacuation des condensats',
    valeur: 'Réseau eaux usées + siphon',
    detail:
      'Le ballon thermo produit ~5 L/jour d’eau de condensat acide (pH 5-6) issue de la déshumidification de l’air. Évacuation obligatoire vers le réseau eaux usées (lavabo, lave-linge, douche) avec siphon anti-remontée d’odeurs.',
  },
  {
    label: 'Raccordement électrique',
    valeur: '230 V monophasé 16 A dédié',
    detail:
      'Disjoncteur dédié 16 A + différentiel 30 mA. Calibre 2 500 W (compresseur + résistance d’appoint). Câblage 3G2,5 mm² sous gaine ICTA. Mise à la terre obligatoire (norme NF C 15-100). Pour modèle split puissant : alimentation triphasée possible.',
  },
  {
    label: 'Ventilation du local',
    valeur: 'Naturelle ou mécanique',
    detail:
      'Le local doit être ventilé pour renouveler l’air refroidi par la PAC. Grille de ventilation haute + basse (≥ 100 cm² chacune) ou raccordement sur VMC pour modèle « air extrait ». Sinon : taux d’humidité > 80 % = corrosion accélérée.',
  },
  {
    label: 'Distance points de puisage',
    valeur: '< 8 m du point le plus éloigné',
    detail:
      'Au-delà de 8 m, pertes en lignes importantes (~2-3 °C par 5 m de tube non isolé). Si distance > 8 m : prévoir bouclage ECS (pompe + retour) ou installer un second ballon décentralisé.',
  },
]

const PRIX_POSE = [
  {
    capacite: '150 L',
    posSeule: '900 - 1 400 €',
    packComplet: '2 200 - 3 200 €',
    note: 'Remplacement standard cumulus existant',
  },
  {
    capacite: '200 L',
    posSeule: '1 000 - 1 500 €',
    packComplet: '2 500 - 3 600 €',
    note: 'Configuration la plus courante en rénovation',
  },
  {
    capacite: '270 L',
    posSeule: '1 200 - 1 700 €',
    packComplet: '3 000 - 4 400 €',
    note: 'Famille 4-5 personnes, maison standard',
  },
  {
    capacite: '300 L+ (split)',
    posSeule: '1 600 - 2 200 €',
    packComplet: '3 800 - 4 800 €',
    note: 'Modèle split (UE + UI), 2 jours de pose',
  },
]

const ERREURS_FREQUENTES = [
  {
    title: 'Pose dans pièce de vie',
    impact: 'Inconfort thermique hiver',
    desc: 'Installation dans le salon ou la chambre = refroidissement -2 à -4 °C en hiver + bruit compresseur 35-45 dB(A). Bonne pratique : cellier, garage non chauffé, buanderie isolée du reste de la maison.',
  },
  {
    title: 'Local sous-dimensionné',
    impact: 'COP -30-50 %',
    desc: 'Local < 20 m³ = la PAC manque d’air à prélever, le COP s’effondre, la résistance d’appoint prend le relais (consommation × 2-3). Solution : raccordement gaines air extérieur ou changer d’emplacement.',
  },
  {
    title: 'Pas d’évacuation condensats',
    impact: 'Dégâts des eaux',
    desc: '~5 L/jour à évacuer. Si écoulement sauvage : tâches au sol, corrosion structure, moisissures. Évacuation obligatoire vers eaux usées avec siphon. Souvent oublié sur les devis low-cost.',
  },
  {
    title: 'Pose par installateur non RGE',
    impact: '+600-900 € (TVA + aides perdues)',
    desc: 'Sans RGE QualiPAC/Qualisol : TVA 20 % au lieu de 5,5 % (+~500 € sur 3 500 €) + MPR/CEE rejetées. Vérifier mention RGE valide à la date du devis sur france-renov.gouv.fr.',
  },
  {
    title: 'Surdimensionnement de la cuve',
    impact: 'Surconsommation 10-20 %',
    desc: 'Capacité largement supérieure aux besoins = pertes thermiques permanentes accrues. Règle : 50 L par personne pour usage standard. Couple = 150-200 L, famille 4 = 250-270 L, famille 5+ = 300 L max.',
  },
  {
    title: 'Anode magnésium non contrôlée',
    impact: 'Cuve percée à 6-8 ans',
    desc: 'L’anode magnésium se consume à 0,5-1 cm/an. Sans contrôle tous les 2-3 ans, la cuve se perce et fuit = remplacement total. Remplacement anode 80-150 € HT vs ballon neuf 2 200-4 800 €.',
  },
  {
    title: 'Devis sans mise en service formelle',
    impact: 'Garantie perdue',
    desc: 'Sans procès-verbal de mise en service signé (températures, COP mesuré, débit), la garantie fabricant peut être refusée en cas de panne. Exiger un procès-verbal détaillé inclus dans le devis.',
  },
]

const faqs = [
  {
    question: 'Combien de temps dure l’installation d’un ballon thermodynamique ?',
    answer:
      '<strong>1 jour</strong> pour un remplacement standard (dépose ancien cumulus + pose nouveau ballon thermo air ambiant 200 L). <strong>1,5-2 jours</strong> pour une nouvelle installation (sans cumulus existant, nécessite passage électrique + évacuation condensats + tableau à reprendre). <strong>2 jours</strong> pour un modèle split (unité extérieure + liaisons frigorifiques + tirage au vide). Pour les capacités 300 L+ ou installations complexes en sous-sol : prévoir 2-3 jours.',
  },
  {
    question: 'Quel est le prix de la pose seule (main d’œuvre) en 2026 ?',
    answer:
      'Prix pose seule (sans matériel) 2026 : <strong>900-1 400 €</strong> pour un 150 L, <strong>1 000-1 500 €</strong> pour un 200 L, <strong>1 200-1 700 €</strong> pour un 270 L, <strong>1 600-2 200 €</strong> pour un 300 L+ ou modèle split. Inclut : dépose ancien chauffe-eau, pose nouveau ballon, raccordement hydraulique + électrique + condensats, mise en service avec mesure performances, garantie pose 2 ans (légale). Variations +10-20 % en Île-de-France, PACA, grandes métropoles.',
  },
  {
    question: 'Quelles sont les conditions techniques pour installer un ballon thermodynamique ?',
    answer:
      'Six conditions principales : (1) <strong>local technique ≥ 20 m³</strong> pour modèle air ambiant (sec, ventilé), (2) <strong>température 5-30 °C</strong> toute l’année (cellier, garage non chauffé idéal), (3) <strong>évacuation condensats</strong> vers eaux usées avec siphon (~5 L/jour), (4) <strong>électricité 230 V monophasé 16 A dédié</strong> + différentiel 30 mA, (5) <strong>ventilation</strong> naturelle ou mécanique du local, (6) <strong>distance < 8 m</strong> du point de puisage le plus éloigné.',
  },
  {
    question: 'Faut-il un installateur RGE pour les aides ?',
    answer:
      'OUI, obligatoire. Mention <strong>RGE QualiPAC</strong> ou <strong>Qualisol</strong> exigée pour : (1) MaPrimeRénov’ jusqu’à 1 200 €, (2) Coup de pouce CEE BAR-TH-148 ~150 €, (3) TVA 5,5 % (vs 20 %). Vérification obligatoire sur <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a> : numéro Qualibat/QualiPAC valide à la date du devis. Sans RGE : surcoût ~600-900 € (TVA + aides perdues) sur un devis 3 500 €.',
  },
  {
    question: 'Que doit contenir le devis d’installation ?',
    answer:
      'Checklist devis détaillée : (1) mention RGE QualiPAC ou Qualisol valide, (2) marque + modèle précis + capacité litres, (3) COP NF EN 16147 (≥ 2,5 pour MPR), (4) classe énergétique (A+ minimum, A++ ou A+++ recommandée), (5) groupe de sécurité 3 bar inclus, (6) évacuation condensats incluse, (7) reprise tableau électrique si nécessaire, (8) mise en service avec procès-verbal (températures, COP mesuré, débit), (9) garantie pose 2 ans + cuve 5 ans + pièces 2-5 ans, (10) total HT, TVA 5,5 %, total TTC, modalités paiement.',
  },
  {
    question: 'Faut-il une déclaration préalable de travaux ?',
    answer:
      'Pour modèle <strong>air ambiant intérieur</strong> : aucune déclaration nécessaire (équipement intérieur). Pour modèle <strong>split avec unité extérieure</strong> : déclaration préalable mairie si modification aspect extérieur (façade, toiture, copropriété). Délai instruction 1 mois. En copropriété : accord syndic préalable obligatoire (vote AG si modification parties communes). Pour bâtiments classés monuments historiques : autorisation Architecte des Bâtiments de France (ABF), délai 4 mois.',
  },
  {
    question: 'Comment se passe la mise en service ?',
    answer:
      'Étapes obligatoires NF EN 16147 : (1) <strong>remplissage cuve</strong> 150-300 L + purge points hauts, (2) <strong>mise en chauffe</strong> à 60 °C (durée 6-10 h selon capacité), (3) <strong>mesure performances</strong> avec thermomètre infrarouge (entrée/sortie/ambiant/évaporateur), (4) <strong>contrôle COP réel</strong> sur cycle complet (référence A15), (5) <strong>vérification niveau sonore</strong> (< 45 dB(A) à 1 m), (6) <strong>procès-verbal signé</strong> remis au client. Sans mise en service formelle : pas de garantie fabricant, pas de versement CEE/MPR.',
  },
  {
    question: 'Quel entretien après l’installation ?',
    answer:
      '<strong>Entretien recommandé annuel</strong> (non obligatoire légalement, contrairement aux chaudières gaz) : 80-150 € HT/an. Inclut : (1) nettoyage évaporateur (poussières, peluches), (2) contrôle pression circuit fluide frigorigène, (3) vérification anode magnésium (à remplacer si consumée > 50 %), (4) vidange si eau dure (>25 °TH = adoucisseur recommandé), (5) test sécurités (groupe 3 bar, thermostat surchauffe). Durée de vie moyenne avec entretien : 12-15 ans (vs 8-12 ans pour cumulus classique).',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Installer un chauffe-eau thermodynamique',
    url: 'https://france-renov.gouv.fr/renovation/chauffage/chauffe-eau-thermodynamique',
  },
  {
    label: 'ADEME — Guide eau chaude sanitaire',
    url: 'https://agir.ademe.fr',
  },
  {
    label: 'AFNOR — Norme NF EN 16147 (essais COP chauffe-eau thermodynamique)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — NF DTU 60.1 (Plomberie sanitaire)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — NF C 15-100 (Installations électriques basse tension)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'Qualit’ENR — Annuaire QualiPAC officiel',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'ANAH — MaPrimeRénov’ chauffe-eau thermodynamique',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'Légifrance — Décret 2009-649 modifié',
    url: 'https://www.legifrance.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'Ballon thermodynamique — hub 2026',
    href: '/renovation-energetique/travaux/ballon-thermodynamique',
    description: 'Capacités, marques, sources d’air',
  },
  {
    label: 'Ballon thermodynamique — prix 2026',
    href: '/renovation-energetique/travaux/ballon-thermodynamique/prix',
    description: 'Grille prix, ROI 10 ans, marques',
  },
  {
    label: 'Chauffe-eau thermodynamique — solution complète',
    href: '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique',
    description: 'COP 3-3,5, ROI 4-6 ans',
  },
  {
    label: 'Label RGE QualiPAC',
    href: '/rge/labels/qualipac',
    description: 'Certification chauffagiste PAC ECS',
  },
  {
    label: 'Annuaire chauffagistes RGE',
    href: '/rge/chauffagiste',
    description: 'Trouver un artisan QualiPAC près de chez vous',
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
    section: 'Travaux — Ballon thermodynamique — Installation',
    keywords: [
      'installation ballon thermodynamique',
      'pose ballon thermodynamique',
      'installer un ballon thermodynamique',
      'ballon thermodynamique installation prix',
      'remplacement ballon thermodynamique',
      'ballon thermodynamique installation rge',
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
    { name: 'Installation', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Installation ballon thermodynamique RGE 2026',
    description:
      'Pose, raccordement hydraulique et électrique, mise en service d’un ballon thermodynamique par un artisan RGE QualiPAC ou Qualisol. Durée 1-2 jours. Prix pose seule 900-2 200 €.',
    category: 'Installation chauffe-eau thermodynamique',
  })
  const howToSchema = getHowToSchema(
    ETAPES.map((e) => ({ name: e.step, text: e.detail })),
    {
      name: 'Installer un ballon thermodynamique en 2026',
      description:
        'Étapes complètes pour installer un ballon thermodynamique (chauffe-eau avec PAC intégrée) 150-300 L par un artisan RGE QualiPAC ou Qualisol.',
      totalTime: 'P1D',
    }
  )
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'MaPrimeRénov’ + CEE BAR-TH-148 — Chauffe-eau thermodynamique 2026',
    description:
      'Aides cumulées (MaPrimeRénov’ jusqu’à 1 200 € + CEE BAR-TH-148 ~150 € + TVA 5,5 %) accordées aux ménages installant un ballon thermodynamique (COP ≥ 2,5 NF EN 16147) par un artisan RGE QualiPAC ou Qualisol.',
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
    howToSchema,
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
              { label: 'Installation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Installation ballon thermo &middot; Guide 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Installation ballon thermodynamique : guide 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>Installer un ballon thermodynamique</strong> en 2026 : 1-2 jours de pose, prix
              main d’œuvre <strong>900-2 200 €</strong> selon capacité, conditions techniques
              strictes (local 20 m³ minimum, ventilation, évacuation condensats, électricité 230 V
              dédiée). Mention <strong>RGE QualiPAC</strong> ou <strong>Qualisol</strong>{' '}
              obligatoire pour bénéficier des aides MaPrimeRénov’ + CEE BAR-TH-148 et de la TVA 5,5
              %. Voici les 10 étapes détaillées, les 6 conditions techniques, le prix de pose et la
              checklist devis 2026.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="etapes">Les 10 étapes d’installation détaillées</h2>
            <p>
              L’installation d’un ballon thermodynamique suit un processus rigoureux pour garantir
              la performance (COP réel ≥ 3) et la longévité (12-15 ans). Voici les 10 étapes
              standard suivies par un artisan RGE QualiPAC :
            </p>
            <ol className="list-none p-0 my-6">
              {ETAPES.map((e, i) => (
                <li
                  key={e.step}
                  className="not-prose bg-white border border-sand-200 rounded-xl p-4 mb-3 flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                        {e.step}
                      </h3>
                      <span className="text-xs text-sand-500 italic whitespace-nowrap">
                        {e.duree}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{e.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h2 id="conditions-techniques">6 conditions techniques obligatoires</h2>
            <p>
              Le ballon thermodynamique exige des conditions techniques strictes pour fonctionner à
              pleine performance. Une visite technique préalable est obligatoire avant tout devis
              pour vérifier ces 6 points :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {CONDITIONS_TECHNIQUES.map((c) => (
                <div key={c.label} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sand-900 m-0">
                      <Wrench className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                      {c.label}
                    </p>
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {c.valeur}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{c.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="prix-pose">Prix pose seule vs pack complet</h2>
            <p>
              Le prix de la pose seule (main d’œuvre + raccordements) varie selon la capacité du
              ballon et la complexité du chantier. Le pack complet (matériel + pose) reste l’option
              la plus courante car il permet de bénéficier de la TVA 5,5 % sur l’ensemble.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Capacité</th>
                    <th className="p-3 border-b border-sand-200">Pose seule</th>
                    <th className="p-3 border-b border-sand-200">Pack complet TTC</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_POSE.map((row) => (
                    <tr key={row.capacite} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.capacite}</td>
                      <td className="p-3 whitespace-nowrap">{row.posSeule}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.packComplet}
                      </td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Prix moyens 2026 toutes marques confondues. Pack complet = matériel + pose + TVA 5,5
                % avec artisan RGE QualiPAC. Variations +10-20 % en Île-de-France et grandes
                métropoles. Sources : baromètre prix artisans RGE 2026, AFPAC.
              </p>
            </div>

            <h2 id="erreurs">7 erreurs fréquentes à éviter</h2>
            <p>
              Plus de 60 % des pannes précoces (avant 5 ans) sur ballon thermodynamique sont liées à
              une erreur de pose ou de configuration. Voici les 7 erreurs les plus fréquentes à
              éviter absolument :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {ERREURS_FREQUENTES.map((err) => (
                <div
                  key={err.title}
                  className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{err.title}</p>
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {err.impact}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{err.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="rge-obligatoire">RGE QualiPAC obligatoire pour les aides</h2>
            <div className="not-prose border-2 border-red-300 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    Sans RGE QualiPAC ou Qualisol : aucune aide ne sera versée.
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    Le label <strong>RGE QualiPAC</strong> (Reconnu Garant de l’Environnement,
                    mention pompes à chaleur) est <strong>obligatoire</strong> pour bénéficier de :
                    MaPrimeRénov’ (jusqu’à 1 200 €), Coup de pouce CEE BAR-TH-148 (~150 €), TVA 5,5
                    % (vs 20 %), éco-PTZ. Vérification systématique sur{' '}
                    <a
                      href="https://france-renov.gouv.fr"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      france-renov.gouv.fr
                    </a>{' '}
                    : numéro Qualibat/QualiPAC valide à la date du devis. Sans RGE : surcoût total
                    estimé 600-900 € (TVA + aides perdues) sur un devis 3 500 €.
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    <Link
                      href="/rge/labels/qualipac"
                      className="font-semibold underline hover:no-underline"
                    >
                      En savoir plus sur le label RGE QualiPAC →
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <h2 id="checklist-devis">Checklist devis : 10 points à vérifier</h2>
            <p>
              Avant de signer un devis d’installation ballon thermodynamique, vérifiez que{' '}
              <strong>chaque point ci-dessous</strong> figure clairement. Tout devis incomplet est
              un signal d’alerte.
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mention RGE QualiPAC ou Qualisol</strong> valide à la date du devis
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marque + modèle précis</strong>, capacité litres, COP NF EN 16147 (≥ 2,5
                pour MPR)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Classe énergétique</strong> A+ minimum (A++ ou A+++ recommandée)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Groupe de sécurité 3 bar</strong> inclus + vase d’expansion si nécessaire
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Évacuation des condensats</strong> incluse (siphon + raccord eaux usées)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Reprise tableau électrique</strong> chiffrée si nécessaire (disjoncteur
                dédié + différentiel 30 mA)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mise en service formelle</strong> avec procès-verbal (températures, COP
                mesuré, débit, niveau sonore)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Garanties</strong> détaillées : pose 2 ans + cuve 5 ans + pièces 2-5 ans +
                décennale artisan
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Total HT, TVA 5,5 %, total TTC</strong>, délai prévisionnel, modalités
                paiement
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Engagement aides MPR + CEE</strong> avant signature (acceptation préalable
                obligatoire)
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouvez un installateur RGE QualiPAC en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre annuaire RGE est mis à jour mensuellement via l’API officielle ADEME.
                    Comparez 2-3 artisans RGE QualiPAC près de chez vous pour bénéficier des aides
                    MPR + CEE 2026.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Simulateur aides <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <PrixComparatif
            title="Prix pose ballon thermodynamique par technique"
            caption="Main d'œuvre seule, hors matériel. Artisan RGE QualiPAC ou Qualisol. Sources : devis terrain 2026 + AFPAC."
            rows={[
              {
                brand: 'Air ambiant (modèle compact)',
                priceRange: '900 - 1 400 €',
                warranty: 'Décennale obligatoire',
                rating: 4.2,
                highlight: true,
                notes: 'Installation 1 jour, local 20 m³ requis',
              },
              {
                brand: 'Air gainé (extraction extérieure)',
                priceRange: '1 200 - 1 800 €',
                warranty: 'Décennale obligatoire',
                rating: 4.3,
                notes: 'Pose 1-2 jours, gaines isolées 200 mm',
              },
              {
                brand: 'Air extrait VMC',
                priceRange: '1 400 - 2 000 €',
                warranty: 'Décennale obligatoire',
                rating: 4.4,
                notes: 'Optimal maison BBC, raccord VMC mutualisé',
              },
              {
                brand: 'Split aérothermique (UE + UI)',
                priceRange: '1 600 - 2 200 €',
                warranty: 'Décennale obligatoire',
                rating: 4.0,
                notes: 'Liaison frigorifique, qualification fluides frigorigènes',
              },
            ]}
          />

          <SimulateurAideBox
            serviceKey="ballon-thermodynamique"
            estimatedSaving={1350}
            title="Estimez vos aides en 3 min"
            subtitle="MaPrimeRénov' BAR-TH-148 + CEE — éligibilité conditionnée à un artisan RGE QualiPAC"
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
        heading="Demandez vos devis pose ballon thermodynamique"
        description="Recevez 3 devis d'artisans RGE QualiPAC en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur-aides-renovation?service=ballon-thermodynamique',
          intent: 'final-devis-installation',
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
