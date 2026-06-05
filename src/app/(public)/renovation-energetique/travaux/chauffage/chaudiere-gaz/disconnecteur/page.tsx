/**
 * Page : /renovation-energetique/travaux/chauffage/chaudiere-gaz/disconnecteur
 *
 * @kw-primary    disconnecteur chaudiere
 * @kw-volume     1500
 * @kw-kd         0
 * @kw-cpc        0.85
 * @intent        informational + commercial
 * @cluster       chaudiere
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #59)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster sécurité chaudière)
 * @backlog-item  Levier-T-disconnecteur-chaudiere
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "disconnecteur chaudiere"        1 500 vol, KD 0 ⭐⭐⭐ pivot rang #59
 * - "disconnecteur chaudière"        ~700 vol estimé KD 0 (variante accent)
 * - "clapet anti-retour chaudière"   ~150 vol estimé KD 0
 * - "disconnecteur ca cb"            ~80 vol estimé KD 0
 * - "disconnecteur chaudiere obligatoire" ~120 vol estimé KD 0
 * - "disconnecteur chaudiere gaz"    ~250 vol estimé KD 0
 * - Famille cumulée pivot : ~2 800 vol/mois (KD 0 = quasi-libre)
 *
 * Easy win : OUI MAJEUR (KD 0, leader effy.fr #2 page courte de vente).
 * Concurrence : effy, watts, sferaco — pages produit ou marketing brèves.
 * Atout SA : guide RÉGLEMENTAIRE complet (NF EN 1717, arrêté 30/11/2005,
 * 4 types CA/CB/BA/EB, contrôle annuel obligatoire CB, prix achat + pose,
 * 4 marques, 8 FAQ).
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Chaudière gaz → Disconnecteur
 *
 * Anti-cannibalisation :
 *   - /chauffage                                  = hub chauffage
 *   - /chauffage/chaudiere-gaz                    = panorama chaudière gaz
 *   - /chauffage/chaudiere-gaz/remplacement       = action remplacement
 *   - /chauffage/chaudiere-condensation           = sub-tech rendement
 *   - /chauffage/chaudiere-condensation/entretien = entretien obligatoire
 *   - Cette page = ÉQUIPEMENT DE SÉCURITÉ disconnecteur (clapet anti-pollution
 *     CB obligatoire, NF EN 1717, contrôle annuel, prix 80-200 €).
 *
 * YMYL santé publique (anti-pollution réseau eau potable). Cite : Légifrance
 * arrêté 30/11/2005, NF EN 1717, NF EN 12729, ARS, Code santé publique R.1321-49.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Banknote,
  Calculator,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Coins,
  Droplet,
  FileText,
  Lock,
  ShieldCheck,
  Wrench,
  XCircle,
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chaudiere-gaz/disconnecteur'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Disconnecteur chaudière 2026 : rôle, types, prix, contrôle'
const DESCRIPTION =
  'Disconnecteur chaudière 2026 : équipement anti-pollution obligatoire (NF EN 1717), 4 types (CA, CB, BA, EB), contrôle annuel, prix 80-200 € + pose.'

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
  "Le disconnecteur est un équipement de sécurité OBLIGATOIRE qui sépare le réseau de chaudière du réseau d'eau potable.",
  "Il empêche le retour d'eau contaminée (additifs, bactéries, glycol) vers le réseau public — anti-pollution sanitaire.",
  'Réglementation : NF EN 1717 (Europe) + arrêté 30 novembre 2005 (France) + Code santé publique R.1321-49.',
  '4 types selon protection : CA (basique), CB (standard chaudière individuelle), BA (collectif), EB (industriel).',
  'Le disconnecteur CB (le plus courant en résidentiel) doit être CONTRÔLÉ ANNUELLEMENT par un pro qualifié.',
  'Prix achat : 80-200 € selon marque + Pose : 80-150 € + Contrôle annuel : 50-90 € HT.',
  '4 marques fiables : Sferaco (France), Watts (USA), Honeywell-Resideo (USA), Caleffi (Italie).',
]

const TYPES_DISCONNECTEUR = [
  {
    code: 'CA',
    nomComplet: 'Disconnecteur Anti-pollution Catégorie A',
    norme: 'NF EN 1717 type CA',
    cas: 'Eau froide sanitaire — protection contre les fluides catégorie 2 (modification couleur, odeur, T°)',
    usage:
      "Robinets de service, tuyaux d'arrosage extérieur. Protection minimale, pas adapté chaudière.",
    prix: '15-40 €',
    controleAnnuel: 'Non',
  },
  {
    code: 'CB',
    nomComplet: 'Disconnecteur Anti-pollution Catégorie B (zone de pression réduite contrôlable)',
    norme: 'NF EN 1717 type CB / NF EN 12729',
    cas: 'Eau froide vers chaudière individuelle, ECS, climatisation — protection contre les fluides catégorie 3 (toxique faible : glycol, antigel, additifs chaudière)',
    usage:
      'STANDARD résidentiel : chaudière gaz/fioul individuelle, chauffe-eau instantané, PAC air-eau. Le plus répandu en France.',
    prix: '80-200 €',
    controleAnnuel: 'OUI — obligatoire chaque année par pro qualifié',
  },
  {
    code: 'BA',
    nomComplet:
      'Disconnecteur Anti-pollution Catégorie BA (zone de pression réduite contrôlable surveillance permanente)',
    norme: 'NF EN 1717 type BA',
    cas: 'Chauffage collectif gros débit, bâtiments tertiaires — fluides catégorie 4 (toxique élevé)',
    usage:
      'Chaufferies collectives copropriété, hôpitaux, ERP. Avec surveillance permanente par capteur de pression.',
    prix: '350-1 200 €',
    controleAnnuel: 'OUI + télésurveillance',
  },
  {
    code: 'EB',
    nomComplet: 'Disconnecteur Anti-pollution Catégorie EB (industriel)',
    norme: 'NF EN 1717 type EB',
    cas: 'Process industriels avec fluides catégorie 5 (très toxique, biocide, hydrocarbures)',
    usage: 'Industrie chimique, agroalimentaire, traitement eau. JAMAIS en résidentiel.',
    prix: '800-3 500 €',
    controleAnnuel: 'OUI + audit ARS',
  },
]

const POURQUOI_OBLIGATOIRE: { icon: LucideIcon; raison: string; detail: string }[] = [
  {
    icon: AlertTriangle,
    raison: 'Risque sanitaire pollution réseau public',
    detail:
      "Une chaudière contient de l'eau additivée (anticorrosion, antigel propylène-glycol jusqu'à 30 %, antitartre, biocides). En cas de baisse de pression réseau (coupure d'eau, fuite voisinage, intervention pompier), un siphonnage inverse peut aspirer cette eau polluée vers le réseau public d'eau potable. Le disconnecteur CB sectorise hydrauliquement les 2 circuits.",
  },
  {
    icon: FileText,
    raison: 'Obligation réglementaire',
    detail:
      "Trois textes encadrent l'installation : (1) arrêté du 30 novembre 2005 (protection contre les retours d'eau) ; (2) NF EN 1717 (norme européenne anti-pollution réseau eau potable) ; (3) Code de la santé publique R.1321-49 (responsabilité installateur + propriétaire). Absence de disconnecteur = mise en demeure ARS + responsabilité civile/pénale en cas de pollution avérée.",
  },
  {
    icon: Lock,
    raison: 'Couverture assurance',
    detail:
      "En cas de pollution réseau, l'assurance habitation refuse la prise en charge si le disconnecteur est absent ou non contrôlé annuellement. Le propriétaire est financièrement responsable des frais ARS (analyses, désinfection, responsabilité civile voisinage). Coûts réels documentés : 5 000-50 000 €.",
  },
  {
    icon: CheckCircle2,
    raison: 'Garantie chaudière',
    detail:
      "Les fabricants (Viessmann, De Dietrich, Saunier Duval, Atlantic) exigent l'installation d'un disconnecteur CB conforme NF EN 1717 dans leurs notices d'installation (souvent annexées au carnet d'entretien). Sans disconnecteur = perte de garantie matériel en cas de retour d'eau parasite endommageant l'échangeur.",
  },
]

const POSE_INSTALLATION = [
  {
    titre: 'Position dans le circuit',
    detail:
      "Le disconnecteur s'installe sur le tube d'eau froide ALIMENTANT la chaudière, EN AMONT du circuit chauffage et de l'ECS instantanée. Position : après le compteur d'eau, après le réducteur de pression (s'il y en a un), AVANT la vanne d'arrêt chaudière. Il doit être ACCESSIBLE pour le contrôle annuel (placard accessible, pas mural fermé).",
  },
  {
    titre: 'Sens de pose',
    detail:
      'Sens du flux marqué par une flèche sur le corps. Eau froide entre par la flèche, sort vers chaudière. Pose horizontale ou verticale (tête vers le haut). Distance évacuation entonnoir minimum 50 mm vers évier/évacuation. JAMAIS de réducteur en aval direct (peut bloquer la membrane).',
  },
  {
    titre: 'Évacuation entonnoir',
    detail:
      "Le disconnecteur CB doit avoir une évacuation libre (entonnoir) connectée à un siphon (évier ou évacuation eaux usées). En cas de retour d'eau ou défaillance membrane, l'eau parasite est évacuée par cet entonnoir — visible et détectable. Section minimum DN 32, hauteur mini garde d'air 50 mm (anti-siphonnage).",
  },
  {
    titre: 'Raccordement',
    detail:
      'Filetage standard 1/2" (DN 15) ou 3/4" (DN 20) selon débit chaudière. Joint plat ou joint torique fourni. Couple de serrage 25-35 Nm (ne pas surserrer = fissuration laiton). Étanchéité Téflon PTFE ou pâte d\'étanchéité agréée alimentaire (ATG ou ACS).',
  },
]

const CONTROLE_ANNUEL: { icon: LucideIcon; titre: string; detail: string }[] = [
  {
    icon: Calendar,
    titre: 'Fréquence : 1 fois par an minimum',
    detail:
      "Le contrôle annuel du disconnecteur CB est OBLIGATOIRE par arrêté 30/11/2005 + NF EN 1717. Souvent réalisé en même temps que l'entretien annuel chaudière (Décret 2009-649) — gain de coût combiné.",
  },
  {
    icon: Wrench,
    titre: 'Qui peut contrôler',
    detail:
      "Plombier-chauffagiste qualifié OU technicien certifié ASTEE (Association Scientifique et Technique pour l'Eau et l'Environnement) OU Carsat (Caisse d'Assurance Retraite Santé Travail). Vérifier formation NF EN 1717 + matériel manomètre différentiel calibré (étalonnage < 1 an).",
  },
  {
    icon: CheckCircle2,
    titre: '5 points contrôlés',
    detail:
      "(1) Étanchéité 3 clapets (amont, intermédiaire, aval) au manomètre. (2) Pression différentielle entre chambres (doit être > 14 kPa). (3) Étanchéité aérateur (entonnoir d'évacuation libre). (4) État membrane élastomère. (5) Marquage NF EN 1717 + numéro de série visible.",
  },
  {
    icon: ClipboardList,
    titre: 'Attestation à conserver 2 ans',
    detail:
      'Le pro remet une attestation de conformité (modèle ARS) avec date, n° de série, mesures relevées, conformité ou non-conformité. À conserver 2 ans MINIMUM. Exigée en cas de contrôle ARS, déclaration sinistre assurance, vente du logement (annexée au DDT — Dossier Diagnostic Technique).',
  },
  {
    icon: Banknote,
    titre: 'Prix contrôle annuel',
    detail:
      '50-90 € HT pour un contrôle seul. Combiné avec entretien chaudière (forfait + 30-50 €) — recommandé. Contrats annuels chaudière (200-400 €/an) intègrent souvent le contrôle disconnecteur dans leurs prestations basique ou tout inclus.',
  },
]

const MARQUES = [
  {
    nom: 'Sferaco (France)',
    produit: 'BA-7102, CA-2096, CB-2071',
    particularite:
      'Fabricant français historique (Bourg-en-Bresse). Référence du marché professionnel. Corps laiton CW617N qualité alimentaire. Garantie 5 ans. ATG/ACS. Prix CB 80-130 €.',
  },
  {
    nom: 'Watts (USA / France)',
    produit: 'BA-009, BA-9D, série BA pour particuliers',
    particularite:
      'Numéro 1 mondial protection eau. Filiale française à La Verrière. Très large gamme. Excellente accessibilité maintenance (cartouche démontable). Garantie 5 ans. Prix CB 90-160 €.',
  },
  {
    nom: 'Honeywell-Resideo (USA)',
    produit: 'BA295S, série Braukmann BA295',
    particularite:
      'Référence du résidentiel haut de gamme (souvent fournie par fabricants chaudière Viessmann, Vaillant). Compact, démontable sans extraire du circuit. Garantie 5 ans. Prix CB 120-200 €.',
  },
  {
    nom: 'Caleffi (Italie)',
    produit: 'série 574, série 573 BA',
    particularite:
      'Spécialiste italien chauffage collectif et résidentiel. Excellent rapport qualité/prix. Distribué en France via plombiers-chauffagistes. Garantie 5 ans. Prix CB 80-140 €.',
  },
]

const ERREURS_A_EVITER = [
  'Acheter un disconnecteur CA pour chaudière (insuffisant — il faut CB minimum).',
  "Installer un disconnecteur sans entonnoir d'évacuation (non conforme NF EN 1717).",
  'Réducteur de pression POSÉ APRÈS le disconnecteur (peut bloquer la membrane).',
  'Disconnecteur dans placard fermé inaccessible (impossible de contrôler annuellement).',
  'Oublier le contrôle annuel obligatoire (perte garantie + assurance).',
  "Pâte d'étanchéité non alimentaire (rejet ARS — utiliser ATG/ACS).",
  'Surserrer le filetage laiton (fissuration → fuite → coupure réseau).',
  'Confondre disconnecteur (anti-pollution) et clapet anti-retour simple (insuffisant).',
  'Acheter sans marquage NF EN 1717 (non conforme français).',
  'Pose en zone gel sans protection (fissure corps laiton à -5 °C).',
]

const faqs = [
  {
    question: "Qu'est-ce qu'un disconnecteur de chaudière et à quoi sert-il ?",
    answer:
      "Un disconnecteur est un équipement de sécurité hydraulique OBLIGATOIRE qui sépare le réseau d'eau potable (alimentation publique) du réseau de chauffage (chaudière, radiateurs). Son rôle : empêcher le retour d'eau polluée (additifs, antigel, biocides chaudière) vers le réseau public en cas de baisse de pression (siphonnage inverse). Sans disconnecteur, une coupure d'eau ou une fuite voisinage peut aspirer l'eau polluée de la chaudière vers la canalisation publique — pollution sanitaire grave.",
  },
  {
    question: 'Le disconnecteur est-il obligatoire pour ma chaudière ?',
    answer:
      "OUI, sur toute chaudière individuelle gaz, fioul, granulés ou PAC air-eau raccordée au réseau d'eau potable. Réglementation : (1) <strong>arrêté du 30 novembre 2005</strong> sur la protection contre les retours d'eau ; (2) <strong>NF EN 1717</strong> norme européenne ; (3) <strong>Code de la santé publique R.1321-49</strong> qui impose l'obligation. L'absence est sanctionnée : mise en demeure ARS, perte garantie chaudière, refus assurance habitation en cas de pollution avérée. Un disconnecteur CB (catégorie B) est le standard résidentiel.",
  },
  {
    question: 'Quelle est la différence entre CA, CB, BA, EB ?',
    answer:
      'Les 4 catégories correspondent au niveau de protection contre les fluides : <strong>CA</strong> = anti-pollution simple (eau froide non potable, robinets extérieurs, fluides catégorie 2 — ne convient PAS à une chaudière). <strong>CB</strong> = zone de pression réduite contrôlable (STANDARD chaudière individuelle, fluides catégorie 3 type glycol-antigel). <strong>BA</strong> = comme CB + surveillance permanente par capteur (chaufferies collectives, ERP, fluides catégorie 4). <strong>EB</strong> = protection maximale (industries chimiques, fluides catégorie 5 très toxiques). Pour résidentiel : CB suffit et est obligatoire.',
  },
  {
    question: 'Combien coûte un disconnecteur de chaudière en 2026 ?',
    answer:
      "Prix disconnecteur CB seul : 80-200 € TTC selon la marque (Sferaco 80-130 €, Watts 90-160 €, Caleffi 80-140 €, Honeywell-Resideo 120-200 €). Pose par plombier-chauffagiste : 80-150 € HT (1 h de travail + raccords). Total achat + pose : <strong>160-350 €</strong>. À cela s'ajoute le contrôle annuel obligatoire : 50-90 € HT (combiné avec entretien chaudière souvent + 30-50 €). Sur 10 ans : ~700-1 200 € coût total (achat + pose + 10 contrôles).",
  },
  {
    question: 'Le contrôle annuel du disconnecteur est-il vraiment obligatoire ?',
    answer:
      "OUI pour les disconnecteurs CB et BA (NF EN 1717 + arrêté 30/11/2005). Le contrôle annuel par un pro certifié vérifie 5 points : (1) étanchéité 3 clapets au manomètre différentiel ; (2) pression différentielle entre chambres > 14 kPa ; (3) étanchéité aérateur (entonnoir d'évacuation) ; (4) état membrane ; (5) marquage NF EN 1717 visible. Le pro remet une attestation conformité (modèle ARS) à conserver 2 ans MINIMUM. Souvent réalisé en même temps que l'entretien annuel chaudière (Décret 2009-649) — gain de coût.",
  },
  {
    question: 'Où installer le disconnecteur dans mon installation ?',
    answer:
      "Le disconnecteur s'installe sur le tube d'eau froide ALIMENTANT la chaudière, EN AMONT du circuit chauffage et de l'ECS instantanée. Schéma type : compteur d'eau → réducteur de pression (si présent) → disconnecteur → vanne d'arrêt chaudière → chaudière. Position : <strong>ACCESSIBLE</strong> pour le contrôle annuel (placard accessible, pas mural fermé). Évacuation entonnoir obligatoire (siphon évier ou évacuation eaux usées, garde d'air 50 mm). Sens de flux respectant la flèche corps. Pose horizontale ou verticale tête haut.",
  },
  {
    question: 'Quelle marque de disconnecteur choisir ?',
    answer:
      '4 marques fiables se partagent le marché français : (1) <strong>Sferaco</strong> — fabricant français historique (Bourg-en-Bresse), référence pro, 80-130 € ; (2) <strong>Watts</strong> — n°1 mondial protection eau, filiale française, large gamme, 90-160 € ; (3) <strong>Honeywell-Resideo</strong> — résidentiel haut de gamme (souvent fourni avec chaudières Viessmann/Vaillant), compact, 120-200 € ; (4) <strong>Caleffi</strong> — italien, excellent rapport qualité/prix, 80-140 €. Vérifier marquage <strong>NF EN 1717 + ATG/ACS</strong> (agréé contact eau alimentaire) sur le corps. Garantie minimum 5 ans.',
  },
  {
    question: "Que se passe-t-il si je n'ai pas de disconnecteur ?",
    answer:
      '4 conséquences directes : (1) <strong>Mise en demeure ARS</strong> (Agence Régionale de Santé) à régulariser sous 30 jours ; (2) <strong>Refus assurance habitation</strong> en cas de pollution réseau public (vous = financièrement responsable des frais ARS et voisinage, 5 000-50 000 €) ; (3) <strong>Perte garantie chaudière</strong> car notices fabricants exigent disconnecteur CB ; (4) <strong>Responsabilité civile/pénale</strong> en cas de pollution avérée (Code santé publique). À la vente du logement : absence de disconnecteur signalée dans le diagnostic plomberie = négociation prix à la baisse ou bloque la transaction.',
  },
]

const sources = [
  {
    label: "Légifrance — Arrêté du 30 novembre 2005 (protection retours d'eau)",
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000823416',
  },
  {
    label: 'Code de la santé publique — Article R.1321-49',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026773275',
  },
  {
    label: 'NF EN 1717 — Protection contre la pollution réseau eau potable',
    url: 'https://www.boutique.afnor.org/fr-fr/norme/nf-en-1717/protection-contre-la-pollution-de-leau-potable-dans-les-reseaux-interi/fa050194/27269',
  },
  {
    label: 'NF EN 12729 — Disconnecteurs avec zone de pression réduite contrôlable',
    url: 'https://www.boutique.afnor.org/fr-fr/norme/nf-en-12729',
  },
  {
    label: 'Légifrance — Décret n° 2009-649 (entretien annuel chaudière)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000020703778',
  },
  {
    label: 'ARS (Agences Régionales de Santé)',
    url: 'https://www.ars.sante.fr',
  },
  {
    label: "ASTEE — Association Scientifique et Technique pour l'Eau",
    url: 'https://www.astee.org',
  },
  {
    label: 'Service-Public.fr — Entretien chaudière',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31894',
  },
]

const relatedPages = [
  {
    label: 'Hub Chaudière gaz 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz',
    description: '4 types + statut RE2020 + prix neufs',
  },
  {
    label: 'Remplacement chaudière gaz',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz/remplacement',
    description: '5 alternatives + planning chantier',
  },
  {
    label: 'Chaudière à condensation 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
    description: 'Tech haute perf, rendement 92-94 %',
  },
  {
    label: 'Entretien chaudière gaz 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation/entretien',
    description: '100-180 € HT, Décret 2009-649',
  },
  {
    label: 'Hub Chauffage 2026',
    href: '/renovation-energetique/travaux/chauffage',
    description: '4 familles + comparatif prix',
  },
  {
    label: 'Trouver un chauffagiste QualiGaz',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE + QualiGaz vérifié',
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
    section: 'Chauffage — Sécurité chaudière',
    keywords: [
      'disconnecteur chaudiere',
      'disconnecteur chaudière',
      'disconnecteur ca cb',
      'disconnecteur chaudiere obligatoire',
      'clapet anti-retour chaudiere',
      'nf en 1717',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Chaudière gaz', url: '/renovation-energetique/travaux/chauffage/chaudiere-gaz' },
    { name: 'Disconnecteur', url: PAGE_PATH },
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
              {
                label: 'Chaudière gaz',
                href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz',
              },
              { label: 'Disconnecteur' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              Équipement OBLIGATOIRE — NF EN 1717 + arrêté 30/11/2005
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Disconnecteur chaudière 2026 : rôle, types, prix, contrôle
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>disconnecteur de chaudière</strong> est un équipement de sécurité
              hydraulique OBLIGATOIRE qui sépare le réseau de chaudière du réseau d&apos;eau
              potable. Son rôle : empêcher le retour d&apos;eau polluée (antigel, biocides
              chaudière) vers la canalisation publique en cas de baisse de pression. Réglementation
              : <strong>NF EN 1717</strong> + <strong>arrêté 30/11/2005</strong> +{' '}
              <strong>Code santé publique R.1321-49</strong>. 4 types existent (CA, CB, BA, EB), le{' '}
              <strong>CB</strong> est le standard résidentiel chaudière individuelle. Prix achat
              80-200 € + pose 80-150 € + contrôle annuel obligatoire 50-90 €/an.
            </p>
            <LastUpdated date={MODIFIED} />
          </header>

          <TldrBlock bullets={tldr} />

          <section aria-labelledby="pourquoi" className="my-10">
            <h2
              id="pourquoi"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Droplet className="w-5 h-5 text-primary-700" aria-hidden />
              Pourquoi un disconnecteur est OBLIGATOIRE
            </h2>
            <p className="text-sand-700 mb-5">
              Le disconnecteur n&apos;est pas un accessoire confort. C&apos;est un équipement de
              sécurité sanitaire imposé par 3 textes réglementaires. 4 raisons principales le
              rendent indispensable :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {POURQUOI_OBLIGATOIRE.map((p) => {
                const Icon = p.icon
                return (
                  <article
                    key={p.raison}
                    className="bg-white border border-sand-200 rounded-lg p-5"
                  >
                    <h3 className="font-heading text-base font-semibold text-sand-900 mb-2 flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary-700 shrink-0" aria-hidden />
                      {p.raison}
                    </h3>
                    <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                  </article>
                )
              })}
            </div>
          </section>

          <section aria-labelledby="types" className="my-10">
            <h2
              id="types"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-primary-700" aria-hidden />4 types de
              disconnecteur (CA, CB, BA, EB)
            </h2>
            <p className="text-sand-700 mb-5">
              La NF EN 1717 définit 4 catégories de protection selon le niveau de pollution
              potentiel du fluide. Pour une chaudière individuelle résidentielle, le type{' '}
              <strong>CB est obligatoire</strong> — les autres sont insuffisants ou réservés à des
              usages collectifs/industriels :
            </p>
            <div className="space-y-3">
              {TYPES_DISCONNECTEUR.map((t) => (
                <article
                  key={t.code}
                  className={`border rounded-lg p-5 ${
                    t.code === 'CB'
                      ? 'bg-primary-50 border-primary-300'
                      : 'bg-white border-sand-200'
                  }`}
                >
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-1 flex items-center gap-2">
                    <span className="bg-sand-900 text-white text-xs font-bold px-2 py-1 rounded">
                      Type {t.code}
                    </span>
                    {t.nomComplet}
                  </h3>
                  <p className="text-xs text-sand-500 m-0 mb-2">Norme : {t.norme}</p>
                  <p className="text-sm text-sand-700 m-0 mb-1">
                    <strong>Cas d&apos;usage :</strong> {t.cas}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Application :</strong> {t.usage}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-sand-50 rounded p-2">
                      <p className="text-sand-600 m-0">Prix indicatif</p>
                      <p className="font-semibold text-sand-900 m-0">{t.prix}</p>
                    </div>
                    <div className="bg-sand-50 rounded p-2">
                      <p className="text-sand-600 m-0">Contrôle annuel</p>
                      <p className="font-semibold text-sand-900 m-0">{t.controleAnnuel}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="pose" className="my-10">
            <h2
              id="pose"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Wrench className="w-5 h-5 text-primary-700" aria-hidden />
              Pose et installation : 4 règles à respecter
            </h2>
            <p className="text-sand-700 mb-5">
              Une pose non conforme rend le disconnecteur inefficace et fait perdre la couverture
              assurance. 4 règles techniques fondamentales :
            </p>
            <div className="space-y-3">
              {POSE_INSTALLATION.map((p) => (
                <article key={p.titre} className="bg-white border border-sand-200 rounded-lg p-4">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-1">
                    {p.titre}
                  </h3>
                  <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="controle" className="my-10">
            <h2
              id="controle"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Calculator className="w-5 h-5 text-primary-700" aria-hidden />
              Contrôle annuel obligatoire (5 points)
            </h2>
            <p className="text-sand-700 mb-5">
              Le disconnecteur CB doit être contrôlé chaque année par un professionnel qualifié. 5
              points sont vérifiés au manomètre différentiel calibré :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {CONTROLE_ANNUEL.map((c) => {
                const Icon = c.icon
                return (
                  <article key={c.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                    <h3 className="font-heading text-base font-semibold text-sand-900 mb-2 flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary-700 shrink-0" aria-hidden />
                      {c.titre}
                    </h3>
                    <p className="text-sm text-sand-700 m-0">{c.detail}</p>
                  </article>
                )
              })}
            </div>
          </section>

          <section aria-labelledby="marques" className="my-10">
            <h2
              id="marques"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-primary-700" aria-hidden />4 marques fiables de
              disconnecteur
            </h2>
            <p className="text-sand-700 mb-5">
              4 fabricants se partagent le marché français du disconnecteur résidentiel et
              tertiaire. Toujours vérifier le marquage <strong>NF EN 1717 + ATG/ACS</strong> sur le
              corps avant achat :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {MARQUES.map((m) => (
                <article key={m.nom} className="bg-white border border-sand-200 rounded-lg p-4">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-1">
                    {m.nom}
                  </h3>
                  <p className="text-xs text-sand-500 m-0 mb-2">Produits : {m.produit}</p>
                  <p className="text-sm text-sand-700 m-0">{m.particularite}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="erreurs" className="my-10">
            <h2
              id="erreurs"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-red-700" aria-hidden />
              10 erreurs à éviter
            </h2>
            <ul className="space-y-2 bg-white border border-sand-200 rounded-lg p-5 list-none pl-0">
              {ERREURS_A_EVITER.map((e) => (
                <li
                  key={e}
                  className="text-sm text-sand-700 m-0 flex items-start gap-2 border-b border-sand-100 last:border-b-0 py-2 first:pt-0 last:pb-0"
                >
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" aria-hidden />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="artisan" className="my-10">
            <h2
              id="artisan"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Wrench className="w-5 h-5 text-primary-700" aria-hidden />
              Faire poser et contrôler par un pro qualifié
            </h2>
            <p className="text-sand-700 mb-3">
              La pose et le contrôle annuel exigent un plombier-chauffagiste qualifié{' '}
              <strong>QualiGaz Évolution</strong> (chaudière) ou certifié <strong>ASTEE</strong>{' '}
              (Association Scientifique et Technique pour l&apos;Eau et l&apos;Environnement).
              Vérifier :
            </p>
            <ul className="space-y-2 mb-3 list-disc pl-6 text-sand-700 text-sm">
              <li>SIRET valide + assurance décennale en cours.</li>
              <li>Formation NF EN 1717 (pour le contrôle annuel).</li>
              <li>Manomètre différentiel calibré (étalonnage &lt; 1 an).</li>
              <li>Attestation de conformité ARS remise après contrôle.</li>
              <li>
                Combinaison avec entretien chaudière annuel pour économie (forfait + 30-50 €).
              </li>
            </ul>
            <Link
              href="/services/plombier"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Trouver un plombier-chauffagiste qualifié
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>

          <FlagshipFaq title="Disconnecteur chaudière : foire aux questions" items={faqs} />

          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
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
              href="/renovation-energetique/travaux/chauffage/chaudiere-gaz"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Chaudière gaz
            </Link>
            <Link
              href="/services/plombier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Plombiers <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
