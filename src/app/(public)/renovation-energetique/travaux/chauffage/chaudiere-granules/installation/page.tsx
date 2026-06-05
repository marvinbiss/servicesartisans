/**
 * Page : /renovation-energetique/travaux/chauffage/chaudiere-granules/installation
 *
 * @kw-primary    installation chaudière granulés
 * @kw-volume     220
 * @kw-kd         3
 * @kw-cpc        TBD
 * @intent        commercial + how-to
 * @cluster       chaudiere_biomasse
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster granulés/biomasse)
 * @backlog-item  Sprint-pseo-chaudiere-granules-installation-2026-05-22
 * @author        jean-pierre-duval
 *
 * KW cibles (validés Ahrefs gap CSV 2026-05-04, country=fr) :
 * - "installation chaudière granulés"  ~220 vol, KD 3   ⭐ PIVOT
 * - "pose chaudière granulés"          ~120 vol, KD 2
 * - "raccordement chaudière biomasse"  ~ 90 vol, KD 1
 * - "installation poele a granule"     1000 vol, KD 0   (longue traîne hub)
 * - "chaudière biomasse"               2800 vol, KD 0   (head connexe)
 * - Famille cumulée how-to install : ~ 4 200 vol/mois
 *
 * Easy win : OUI (KD ≤ 3 sur tous KW). Page how-to + checklist devis + EN 303-5
 * + conduit + désembouage + RGE Module Chaudière obligatoire.
 *
 * Anti-cannibalisation :
 *   - /chaudiere-granules         = hub PRODUIT (silo, marques, fonctionnement)
 *   - /chaudiere-granules/prix    = sous-page PRIX (puissance, ROI)
 *   - /chaudiere-bois             = chaudière bûches (alternative)
 *   - /poele-granules             = appoint (point unique vs central)
 *   - Cette page                  = sous-page INSTALLATION (étapes, EN 303-5)
 *
 * YMYL high : pose chaudière biomasse chauffage central, conduit d’évacuation
 * fumée DTU 24.1, désembouage, conformité Flamme Verte 7★, RGE Qualibois Module
 * Chaudière obligatoire pour aides. Cite : ANAH, France Rénov’, ADEME, AFNOR
 * EN 303-5, DTU 24.1, Flamme Verte, Légifrance, Décret 2009-649 entretien.
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
import FinalCtaSection from '@/components/conversion/FinalCtaSection'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chaudiere-granules/installation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Installation chaudière à granulés 2026 : étapes & RGE'
const DESCRIPTION =
  'Installation chaudière granulés 2026 : chantier 3-5 jours, conduit T400-P1, silo 1-5 t. RGE Qualibois Chaudière obligatoire pour MPR + CEE BAR-TH-113.'

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
  'Chantier sur site : 3-5 jours (dépose ancienne chaudière + pose chaudière + silo + conduit + raccordement).',
  'Conduit d’évacuation obligatoire : T400-P1-Wxx-G-50 (inox isolé) ou tubage si conduit existant.',
  'Silo dédié : 1-5 tonnes (textile ou maçonné), accès camion citerne aspirateur (1 t = 1,5 m³).',
  'Désembouage circuit hydraulique obligatoire sur installation existante (élimine boues).',
  'Local technique : 4-6 m² minimum, ventilation haute + basse, distance feu 50 mm matériaux combustibles.',
  'Flamme Verte 7★ + EN 303-5 (rendement ≥ 87 % PCI) obligatoires pour MPR + CEE BAR-TH-113.',
  'RGE Qualibois Module Chaudière (et NON Module Poêle) obligatoire pour aides + TVA 5,5 %.',
]

const ETAPES = [
  {
    step: 'Visite technique préalable',
    duree: '1-2 h',
    detail:
      'L’installateur vérifie : surface logement + isolation actuelle (calcul puissance kW), local technique (4-6 m² minimum, ventilation, accès), conduit d’évacuation existant (à tuber ou créer), emplacement silo (textile ou maçonné, accès camion 25 m max), tableau électrique (mise aux normes éventuelle), distribution chauffage existante (radiateurs ou plancher chauffant).',
  },
  {
    step: 'Devis détaillé + dépôt aides',
    duree: 'J+0 à J+15',
    detail:
      'Devis exigé en 3 exemplaires comparatifs. Doit contenir : marque + modèle + puissance kW + rendement % PCI, certification Flamme Verte 7★ + EN 303-5, silo dimensionné (tonnes + type + accès), conduit T400-P1-Wxx-G-50, désembouage circuit, mention RGE Qualibois Module Chaudière. Dépôt MPR sur france-renov.gouv.fr + contrat CEE BAR-TH-113 AVANT signature devis. Délai 7-15 jours.',
  },
  {
    step: 'Signature devis + acompte + planification',
    duree: 'J+15',
    detail:
      'Acompte 20-30 % à la signature. Délai légal de rétractation 14 jours. Planification chantier 4-8 semaines (délai livraison matériel + délai accord aides). En cas de remplacement chaudière fioul/gaz : prévoir continuité chauffage (souvent réalisable en 1-2 jours sans coupure prolongée).',
  },
  {
    step: 'Dépose ancienne chaudière + cuve fioul si présente',
    duree: '1-2 jours',
    detail:
      'Vidange et coupure ancienne chaudière. Découpe tuyauterie + démontage corps de chauffe. Évacuation vers déchetterie professionnelle. Si cuve fioul présente : neutralisation obligatoire (nettoyage + inertage sable ou enlèvement selon volume) par entreprise certifiée RSDE. Coût ~ 1 500-3 000 € si non inclus au devis principal.',
  },
  {
    step: 'Désembouage circuit hydraulique',
    duree: '4-6 h',
    detail:
      'Sur installation existante > 5 ans : désembouage circuit chauffage obligatoire avant raccordement chaudière neuve. Élimine boues hydrocolloïdes (oxydation fer radiateurs). Procédure : vidange + injection produit désembouant + circulation 24 h + rinçage + ajout inhibiteur corrosion. Coût ~ 500-900 €.',
  },
  {
    step: 'Pose chaudière + silo',
    duree: '1-2 jours',
    detail:
      'Mise en place chaudière (poids 250-450 kg selon puissance, manutention transpalette), pose silo textile (1-5 t, sangles + ancrages plafond/sol) OU construction silo maçonné (chape + parpaings + trappe + aérations). Raccordement vis sans fin entre silo et chaudière (réglage longueur, fixation, étanchéité poussières).',
  },
  {
    step: 'Conduit d’évacuation + raccordement fumée',
    duree: '0,5-1 jour',
    detail:
      'Conduit T400-P1-Wxx-G-50 (inox isolé, étanche, à condensation, distance feu 50 mm) avec sortie en toiture obligatoire. Si conduit existant : tubage inox flexible. Si pas de conduit : création conduit + traversée toiture + chapeau. Conformité DTU 24.1. Inspection visuelle obligatoire + mesure tirage.',
  },
  {
    step: 'Raccordement hydraulique + électrique',
    duree: '0,5-1 jour',
    detail:
      'Raccordement aller/retour chauffage + ECS (si ballon tampon couplé). Pose pompe + vase d’expansion + soupape sécurité 3 bar. Ajout pot à boue + filtre magnétique recommandé. Câblage 230 V monophasé + sonde extérieure + thermostat ambiance. Mise à la terre + protection différentielle 30 mA.',
  },
  {
    step: 'Mise en service + tests',
    duree: '2-4 h',
    detail:
      'Remplissage circuit + purge points hauts. Mise en chauffe progressive. Mesure rendement (NF EN 303-5) + mesure CO + tirage cheminée. Contrôle programmation (courbe d’eau + zones horaires + ECS). Configuration alimentation granulés (volume silo + cycle vis sans fin). Procès-verbal de mise en service signé.',
  },
  {
    step: 'Procès-verbal + formation utilisateur',
    duree: '30-60 min',
    detail:
      'Remise du procès-verbal (puissance, rendement mesuré, conformité NF EN 303-5), notice d’utilisation, formation programmation (régulation, ECS, vacances), explications entretien obligatoire annuel décret 2009-649 (180-280 € HT/an, ramonage 2 fois/an).',
  },
]

const CONDITIONS_TECHNIQUES = [
  {
    label: 'Local technique chaudière',
    valeur: '4-6 m² minimum, ventilé',
    detail:
      'Local dédié obligatoire avec ventilation basse (apport d’air comburant) + haute (évacuation chaleur résiduelle). Distance feu 50 mm matériaux combustibles autour. Idéal : cave, garage, buanderie, sous-sol non chauffé. À éviter : pièce de vie, chambre.',
  },
  {
    label: 'Silo granulés',
    valeur: '1-5 t (~ 1,5-7,5 m³)',
    detail:
      'Silo textile (suspendu plafond, 700-1500 € matériel) ou maçonné (5-10 m³, 1500-3500 € matériel + main d’œuvre). Accès camion citerne aspirateur ≤ 25 m, vidange dépose-tube DN50, ventilation supérieure obligatoire pour évacuer poussières.',
  },
  {
    label: 'Conduit d’évacuation',
    valeur: 'T400-P1-Wxx-G-50',
    detail:
      'Conduit inox isolé étanche à condensation, distance feu 50 mm. Si conduit existant (chaudière fioul/gaz) : tubage inox flexible obligatoire (1 500-2 500 €). Sortie en toiture obligatoire (pas en façade). DTU 24.1 + DTU 24.2.',
  },
  {
    label: 'Flamme Verte 7 étoiles + EN 303-5',
    valeur: 'Certificat obligatoire',
    detail:
      'Pour MPR + CEE BAR-TH-113 : Flamme Verte 7★ obligatoire (rendement ≥ 87 % PCI, émissions CO ≤ 0,03 %, particules ≤ 30 mg/Nm³). Vérifier numéro Flamme Verte sur fiche produit. Norme NF EN 303-5 (chaudières chauffage central biomasse) classe 5.',
  },
  {
    label: 'Granulés EN ISO 17225-2 classe A1',
    valeur: 'DINplus ou ENplus A1',
    detail:
      'Granulés certifiés DINplus / ENplus A1 obligatoires (humidité < 10 %, cendres < 0,7 %, longueur 6-30 mm, densité ≥ 600 kg/m³). Bas de gamme = encrassement chaudière + perte rendement 10 % + pannes vis sans fin.',
  },
  {
    label: 'Désembouage circuit existant',
    valeur: 'Obligatoire si > 5 ans',
    detail:
      'Sur installation > 5 ans : désembouage hydraulique obligatoire avant raccordement chaudière neuve. Élimine boues hydrocolloïdes (oxydation radiateurs). Sans désembouage : encrassement + corrosion + perte rendement -15-25 %.',
  },
]

const ERREURS_FREQUENTES = [
  {
    title: 'RGE Qualibois Module Poêle (non Module Chaudière)',
    impact: 'Aides perdues',
    desc: 'Module Poêle = poêles à granulés seulement. Module Chaudière = obligatoire pour chaudières centrales. Confusion fréquente. Vérifier sur france-renov.gouv.fr le numéro spécifique « Module Chaudière ». Sans ce module : MPR + CEE rejetés.',
  },
  {
    title: 'Silo sous-dimensionné',
    impact: 'Sur-livraisons annuelles',
    desc: 'Une maison 130 m² consomme 4-6 t/an. Silo 1 t = 6-8 livraisons/an = surcoût 100-150 €/an + risque de rupture. Optimum : silo 3-5 t = 1-2 livraisons/an + tarif tonne plus avantageux.',
  },
  {
    title: 'Conduit cheminée non tubé',
    impact: 'Risque CO + corrosion',
    desc: 'Conduit ancien (briques, terre cuite) non compatible chaudière granulés à condensation. Tubage inox flexible obligatoire (1 500-2 500 €). Sans tubage : risque intoxication CO + corrosion accélérée + invalidation assurance.',
  },
  {
    title: 'Pas de désembouage circuit',
    impact: 'Rendement -15-25 %',
    desc: 'Sur installation > 5 ans, boues hydrocolloïdes (oxydation fer) s’accumulent. Sans désembouage avant raccordement : encrassement radiateurs + perte rendement + corrosion chaudière neuve = garantie potentiellement annulée.',
  },
  {
    title: 'Vérification accès camion granulés oubliée',
    impact: 'Surcoût livraison',
    desc: 'Camion citerne aspirateur ≤ 25 m d’accès au silo, hauteur ≤ 4 m, route praticable poids lourd 26 t. Si non : livraison « big bag » sac 1 t à 50-100 € de surcoût par livraison.',
  },
  {
    title: 'Programmation par défaut non optimisée',
    impact: 'Surconsommation 10-20 %',
    desc: 'Courbe d’eau par défaut = consigne fixe = surconsommation. Optimisation : courbe d’eau adaptée à l’isolation + zones horaires + sonde extérieure + ECS prioritaire en heures creuses. Demander formation programmation incluse.',
  },
  {
    title: 'Entretien obligatoire annuel oublié',
    impact: 'Décret 2009-649',
    desc: 'Entretien annuel chaudière > 4 kW obligatoire (décret 2009-649). 180-280 € HT/an. Ramonage conduit 2 fois/an. Sans entretien : invalidation assurance + amende administrative + risque CO. Contrat annuel recommandé.',
  },
]

const faqs = [
  {
    question: 'Combien de temps dure l’installation d’une chaudière à granulés ?',
    answer:
      '<strong>3-5 jours de chantier</strong> en moyenne : Jour 1-2 = dépose ancienne chaudière (+ cuve fioul si présente) + désembouage circuit. Jour 3-4 = pose chaudière + silo + conduit + raccordement. Jour 5 = mise en service + tests + formation utilisateur. Total projet : 6-10 semaines de la signature devis à la mise en service (délai accord MPR 7-15 j + délai livraison matériel 4-6 semaines). Versement aides : 2-4 mois après facture.',
  },
  {
    question: 'Quelles démarches administratives pour une chaudière granulés ?',
    answer:
      'En général, aucune autorisation d’urbanisme requise (équipement intérieur). Exceptions : (1) <strong>création conduit traversant toiture</strong> = déclaration préalable mairie (Cerfa 13703, 1 mois). (2) <strong>Zone ABF</strong> (monuments historiques) : autorisation Architecte des Bâtiments de France. (3) <strong>Cuve fioul à neutraliser</strong> : entreprise certifiée RSDE obligatoire (déclaration à la mairie + procès-verbal de neutralisation). (4) <strong>Copropriété</strong> : vote AG si modification parties communes (conduit collectif).',
  },
  {
    question: 'Faut-il un installateur RGE pour les aides chaudière granulés ?',
    answer:
      'OUI, obligatoire. Mention <strong>RGE Qualibois Module Chaudière</strong> (et NON Module Poêle) exigée pour : (1) MaPrimeRénov’ jusqu’à 7 000 € (Bleu), (2) Coup de pouce CEE BAR-TH-113 jusqu’à 5 500 €, (3) TVA 5,5 % (vs 20 %), (4) éco-PTZ jusqu’à 30 000 €. Vérification sur <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a> : numéro Qualibois Module Chaudière valide à la date du devis. Sans RGE Module Chaudière : aides rejetées + TVA 20 % = surcoût ~ 3 500 € sur 18 000 €.',
  },
  {
    question: 'Quelles sont les conditions techniques obligatoires ?',
    answer:
      'Six conditions principales : (1) <strong>local technique 4-6 m²</strong> ventilé (haute + basse), distance feu 50 mm. (2) <strong>silo 1-5 t</strong> avec accès camion ≤ 25 m, ventilation supérieure. (3) <strong>conduit T400-P1-Wxx-G-50</strong> avec sortie toiture, tubage si existant. (4) <strong>Flamme Verte 7★ + EN 303-5</strong> classe 5. (5) <strong>granulés DINplus / ENplus A1</strong>. (6) <strong>désembouage circuit</strong> obligatoire si installation > 5 ans.',
  },
  {
    question: 'Que doit contenir le devis d’installation chaudière granulés ?',
    answer:
      'Checklist détaillée : (1) mention <strong>RGE Qualibois Module Chaudière</strong> valide, (2) marque + modèle + puissance kW + rendement % PCI, (3) certification <strong>Flamme Verte 7★</strong> + EN 303-5, (4) silo dimensionné (capacité tonnes + type textile / maçonné + accès camion), (5) conduit <strong>T400-P1-Wxx-G-50</strong> ou tubage inox, (6) désembouage circuit chiffré, (7) raccordement hydraulique + électrique + sécurités, (8) mise en service + procès-verbal + formation, (9) garanties (cuve 5 ans + décennale), (10) total HT, TVA 5,5 % détaillée, total TTC.',
  },
  {
    question: 'Comment se passe la mise en service ?',
    answer:
      'Étapes obligatoires : (1) <strong>remplissage circuit</strong> + purge points hauts, (2) <strong>mise en chauffe progressive</strong> (palier 30-50-70 °C sur 4-6 h), (3) <strong>mesure rendement</strong> NF EN 303-5 (température fumées, CO, CO2, tirage cheminée), (4) <strong>contrôle programmation</strong> (courbe d’eau adaptée + zones horaires + ECS prioritaire), (5) <strong>configuration alimentation granulés</strong> (volume silo + cycle vis sans fin), (6) <strong>procès-verbal</strong> signé (puissance, rendement, conformité), (7) <strong>formation utilisateur</strong> programmation + entretien.',
  },
  {
    question: 'Quel entretien après l’installation ?',
    answer:
      '<strong>Entretien annuel obligatoire</strong> (décret 2009-649) : 180-280 € HT/an. Inclut : nettoyage brûleur + foyer + échangeur + vis sans fin, contrôle évacuation fumée, mesure CO + CO2 + rendement, vérification sécurités. <strong>Ramonage</strong> conduit obligatoire 2 fois/an (DTU 24.1) : 80-120 € chaque. Sans entretien : invalidation assurance + amende administrative. Souscrire contrat annuel chez installateur ou chauffagiste Qualibois.',
  },
  {
    question: 'Faut-il prévoir un ballon tampon ?',
    answer:
      'Recommandé sur chaudière granulés < 25 kW couplée à plancher chauffant ou multi-zones. <strong>Ballon tampon 300-500 L</strong> (~ 1 500-3 000 €) stocke la chaleur produite par la chaudière, permet à la chaudière de fonctionner par cycles longs (rendement optimal) et de couvrir les pics de demande. Non obligatoire mais améliore rendement +5-8 % + réduit cycles courts (-20 %). Combiner avec ECS pour optimiser.',
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
    label: 'AFNOR — NF DTU 24.1 (Travaux de fumisterie)',
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
    label: 'Chaudière granulés — prix 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-granules/prix',
    description: 'Grille puissance + ROI 10 ans',
  },
  {
    label: 'Chaudière bois bûches — alternative',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
    description: 'Stère bois vs granulés',
  },
  {
    label: 'Poêle à granulés — appoint',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
    description: 'Point unique 5-12 kW',
  },
  {
    label: 'Label RGE Qualibois',
    href: '/rge/labels/qualibois',
    description: 'Certification chauffagiste biomasse',
  },
  {
    label: 'Tubage cheminée',
    href: '/renovation-energetique/travaux/chauffage/tubage-cheminee',
    description: 'Inox flexible obligatoire',
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
    section: 'Travaux — Chauffage biomasse — Chaudière granulés — Installation',
    keywords: [
      'installation chaudière granulés',
      'pose chaudière granulés',
      'raccordement chaudière biomasse',
      'installation chaudière pellet',
      'chaudière granulés conduit',
      'chaudière granulés RGE',
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
    { name: 'Installation', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Installation chaudière à granulés RGE 2026',
    description:
      'Pose chaudière granulés Flamme Verte 7★ + silo + conduit T400-P1 + désembouage + raccordement par artisan RGE Qualibois Module Chaudière, conforme NF EN 303-5 et DTU 24.1.',
    category: 'Installation chaudière biomasse',
  })
  const howToSchema = getHowToSchema(
    ETAPES.map((e) => ({ name: e.step, text: e.detail })),
    {
      name: 'Installer une chaudière à granulés en 2026',
      description:
        'Étapes complètes pour installer une chaudière à granulés (15-30 kW) avec silo, conduit et désembouage par un artisan RGE Qualibois Module Chaudière.',
      totalTime: 'P5D',
    }
  )
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'MaPrimeRénov’ + CEE BAR-TH-113 — Chaudière granulés 2026',
    description:
      'Aides cumulées (MaPrimeRénov’ jusqu’à 7 000 € + Coup de pouce CEE BAR-TH-113 jusqu’à 5 500 € + TVA 5,5 %) accordées aux ménages installant une chaudière à granulés Flamme Verte 7★ par un artisan RGE Qualibois Module Chaudière.',
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
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              {
                label: 'Chaudière à granulés',
                href: '/renovation-energetique/travaux/chauffage/chaudiere-granules',
              },
              { label: 'Installation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Installation chaudière granulés &middot; Guide 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Installation chaudière à granulés : guide 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, l’<strong>installation d’une chaudière à granulés</strong> dure 3-5 jours de
              chantier + 6-10 semaines de démarches (signature devis à mise en service). Conditions
              techniques critiques : local technique 4-6 m² ventilé, silo 1-5 t avec accès camion,
              conduit T400-P1, désembouage si installation existante. RGE Qualibois Module Chaudière
              obligatoire pour MPR + CEE BAR-TH-113 + TVA 5,5 %. Voici les 10 étapes complètes.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="etapes">Les 10 étapes d’installation chaudière granulés</h2>
            <div className="not-prose grid gap-3 my-6">
              {ETAPES.map((etape, idx) => (
                <div key={etape.step} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-700 text-white font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-sand-900 m-0">{etape.step}</p>
                        <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                          {etape.duree}
                        </span>
                      </div>
                      <p className="text-sm text-sand-700 m-0 mt-1">{etape.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="conditions-techniques">6 conditions techniques obligatoires</h2>
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
                  <p className="text-sm text-sand-700 m-0 mt-1">{c.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="erreurs">7 erreurs fréquentes à éviter</h2>
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

            <h2 id="checklist-devis">Checklist devis installation</h2>
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
                <strong>Certification Flamme Verte 7★ + EN 303-5</strong> classe 5 (numéro
                vérifiable)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Silo dimensionné</strong> (capacité tonnes + type textile / maçonné + accès
                camion ≤ 25 m)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Conduit T400-P1-Wxx-G-50</strong> ou tubage inox flexible chiffré
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Désembouage circuit hydraulique</strong> chiffré (sur installation &gt; 5
                ans)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Cuve fioul</strong> à neutraliser chiffrée (si présente) — entreprise RSDE
                certifiée
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Total HT, TVA 5,5 %, total TTC</strong>, modalités paiement + échéancier
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un chauffagiste RGE Qualibois près de chez vous
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur compare votre situation (revenus, surface, chauffage actuel) et
                    liste les chauffagistes Qualibois Module Chaudière vérifiés sur
                    france-renov.gouv.fr disponibles proches de chez vous.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
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
        heading="Demandez vos devis pose chaudière à granulés"
        description="Recevez 3 devis d'artisans RGE Qualibois en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur-aides-renovation?service=chaudiere-granules',
          intent: 'final-devis-installation',
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
