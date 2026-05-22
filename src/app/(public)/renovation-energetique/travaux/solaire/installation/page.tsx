/**
 * Page : /renovation-energetique/travaux/solaire/installation
 *
 * @kw-primary    installation panneau solaire
 * @kw-volume     1500
 * @kw-kd         15
 * @kw-cpc        TBD
 * @intent        commercial + how-to
 * @cluster       solaire
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster solaire_pv)
 * @backlog-item  Sprint-pseo-solaire-installation-2026-05-22
 * @author        jean-pierre-duval
 *
 * KW cibles (validés Ahrefs gap CSV 2026-05-04, country=fr) :
 * - "installation panneau solaire"            ~1500 vol, KD 15  ⭐ PIVOT
 * - "pose panneau solaire"                    ~ 480 vol, KD 8
 * - "installer panneau solaire"               ~ 320 vol, KD 7
 * - "raccordement panneau solaire enedis"     ~ 150 vol, KD 4
 * - "démarches panneau solaire CRE"           ~  90 vol, KD 2
 * - "EDF OA panneau solaire"                  ~ 180 vol, KD 6
 * - Famille cumulée how-to install : ~2 700 vol/mois
 *
 * Easy win : OUI (KD ≤ 15 pivot, variants KD 2-8). Intent how-to + commercial.
 * Page how-to + démarches CRE/Enedis/EDF OA + checklist devis + RGE obligatoire.
 *
 * Anti-cannibalisation :
 *   - /solaire                       = hub PRODUIT (autoconso, rendement, marques)
 *   - /solaire/prix                  = sous-page PRIX (par kWc, ROI)
 *   - /solaire/autoconsommation      = sous-page concept autoconso
 *   - /solaire/dimension             = sous-page choix kWc
 *   - Cette page                     = sous-page INSTALLATION (étapes, démarches)
 *
 * YMYL : pose toiture (étanchéité, fixation), électrique haute tension, démarches
 * réglementaires CRE/Enedis/EDF OA, prime autoconso conditionnée. Cite : CRE,
 * Enedis, EDF OA, France Rénov’, ADEME, Légifrance, AFNOR NF C 15-712-1.
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

const PAGE_PATH = '/renovation-energetique/travaux/solaire/installation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Installation panneau solaire 2026 : étapes, démarches, RGE'
const DESCRIPTION =
  'Installation panneau solaire 2026 : chantier 1-3 jours, démarches Enedis + CRE + EDF OA 2-4 mois. Norme NF C 15-712-1, RGE QualiPV obligatoire pour prime autoconso + TVA 10 %.'

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
  'Chantier sur site : 1-3 jours pour 3-9 kWc (pose + onduleur + câblage + sécurités).',
  'Démarches administratives totales : 2-4 mois (déclaration mairie + Enedis + Consuel + EDF OA).',
  'Étape 1 : déclaration préalable de travaux mairie (délai 1 mois).',
  'Étape 2 : convention de raccordement Enedis (délai 6-12 semaines, frais 150-500 €).',
  'Étape 3 : contrat d’achat 20 ans EDF Obligation d’Achat (≤ 0,127 €/kWh surplus 3-9 kWc S1 2026).',
  'Étape 4 : prime autoconso CRE versée sur 5 ans après mise en service.',
  'RGE QualiPV / QualiSol obligatoire pour prime autoconso + TVA 10 % + assurance décennale.',
]

const ETAPES = [
  {
    step: 'Étude technique préalable',
    duree: '1-2 h site + 3-7 j calcul',
    detail:
      'L’installateur évalue : orientation et inclinaison du toit (idéal sud, 30-35°), surface utile (panneaux ~ 2 m², 1 kWc ≈ 5 m²), masques d’ombre (cheminée, arbres, bâtiments), état charpente (capable supporter 15-20 kg/m²), tableau électrique (rénovation si > 15 ans). Production estimée via PVGIS / logiciel SolarEdge.',
  },
  {
    step: 'Devis détaillé + signature',
    duree: 'J+0 à J+15',
    detail:
      'Devis exigé en 3 exemplaires comparatifs. Doit contenir : puissance kWc, nombre de panneaux + Wc unitaire, marque + référence onduleur, étude PVGIS, garanties produit ≥ 12 ans + performance 25 ans, mention RGE QualiPV, total HT + TVA 10 % + total TTC. Délai de rétractation légal 14 jours.',
  },
  {
    step: 'Déclaration préalable de travaux (mairie)',
    duree: '1 mois instruction',
    detail:
      'Formulaire Cerfa 13703 déposé en mairie. Plan toiture + photos + DPE. Délai légal d’instruction 1 mois (2 mois en zone ABF monuments historiques). Sans réponse = accord tacite. En zone ABF : autorisation Architecte des Bâtiments de France obligatoire, délai 2-4 mois.',
  },
  {
    step: 'Demande de raccordement Enedis',
    duree: '6-12 semaines',
    detail:
      'Dossier déposé sur portail Enedis Connect. Convention de raccordement chiffrée 200-1 500 € selon distance compteur (gratuit < 30 m, 500 € < 100 m, jusqu’à 1 500 € au-delà). Acceptation client + paiement → mise en place compteur Linky avec mesure injection.',
  },
  {
    step: 'Contrat d’achat EDF OA',
    duree: '4-6 semaines',
    detail:
      'Signature contrat d’achat 20 ans EDF Obligation d’Achat (~ 0,127 €/kWh surplus 3-9 kWc S1 2026). Tarif réévalué trimestriellement par CRE. Démarches gratuites mais souvent externalisées par installateur (pack 200-500 €). Versement mensuel ou annuel.',
  },
  {
    step: 'Pose panneaux + onduleur sur toiture',
    duree: '1-2 j',
    detail:
      'Pose rails de fixation conformes à la couverture (tuile, ardoise, zinc, bac acier), pose des panneaux par paires (1 panneau = ~ 25 kg, manutention à 2), câblage DC entre panneaux en série/parallèle selon plan, descente câbles DC sous gaine vers onduleur (en garage, cellier, sous-comble), pose onduleur + protections DC/AC + parafoudre selon NF C 15-712-1.',
  },
  {
    step: 'Raccordement électrique + sécurités',
    duree: '4-6 h',
    detail:
      'Liaison onduleur → tableau électrique principal par câble dédié 4 mm² (selon puissance). Protection AC : disjoncteur différentiel 30 mA + parafoudre obligatoire (NF C 15-712-1). Mise à la terre du châssis panneaux + onduleur (norme NF C 15-100 et NF C 15-712-1). Pose interrupteur sectionneur DC + AC accessible.',
  },
  {
    step: 'Mise en service initiale',
    duree: '2-3 h',
    detail:
      'Vérifications préalables : continuité terre, isolement (mégohmmètre), polarité, calibrage disjoncteurs. Mise sous tension contrôlée (DC puis AC), démarrage onduleur, premier autotest système. Mesure tension + courant + puissance en temps réel. Configuration monitoring (application installateur + cloud).',
  },
  {
    step: 'Visite Consuel + attestation conformité',
    duree: '2-4 semaines',
    detail:
      'Visite obligatoire du Consuel (Comité National pour la Sécurité des Usagers de l’Électricité) pour installation > 3 kWc avec injection réseau. Vérifie conformité NF C 15-712-1, étiquetage tableau, accessibilité sectionneur DC, mise à la terre. Coût ~ 150-250 €. Sans attestation = pas de mise en service Enedis.',
  },
  {
    step: 'Mise en service réseau + production',
    duree: 'J+30 à J+90 post-Consuel',
    detail:
      'Enedis programme la mise en service du compteur Linky avec mesure d’injection. Production commence dès activation. Contrat EDF OA actif → versement surplus mensuel ou annuel. Demande prime autoconso CRE sur portail dédié (versement 5 ans étalé).',
  },
]

const CONDITIONS_TECHNIQUES = [
  {
    label: 'Orientation toiture (idéal sud)',
    valeur: 'Sud 100 % • Est/Ouest 85 %',
    detail:
      'Production optimale plein sud, inclinaison 30-35°. Sud-est / sud-ouest : -5-10 %. Est / ouest pur : -15-20 % (mais autoconso matin/soir favorisée). Nord : à éviter (-50 % production).',
  },
  {
    label: 'Inclinaison toiture',
    valeur: '30-35° optimal',
    detail:
      'Toit plat (0°) : -10-15 % production, prévoir bacs inclinés ou structure inclinante. Toit > 50° : production réduite l’été (-5-10 %) mais bonne autonomie hiver. Vérifier compatibilité poids fixations.',
  },
  {
    label: 'Charpente / support',
    valeur: 'Capable 15-20 kg/m²',
    detail:
      'Charpente bois en bon état (sans insectes xylophages), pannes capables de supporter 15-20 kg/m² additionnels. Toiture < 25 ans recommandée. Si toiture en fin de vie : prévoir réfection avant installation (sinon démontage / remontage panneaux dans 5-10 ans).',
  },
  {
    label: 'Tableau électrique',
    valeur: 'Conforme NF C 15-100 récent',
    detail:
      'Tableau > 15 ans = mise aux normes recommandée (200-600 €). Disjoncteur différentiel 30 mA obligatoire en aval onduleur. Parafoudre type 2 obligatoire si zone foudre AQ 1-AQ 2. Compteur Linky obligatoire (déjà installé > 90 % foyers FR).',
  },
  {
    label: 'Surface utile toiture (en m²)',
    valeur: '1 kWc ≈ 5 m² panneaux',
    detail:
      'Panneau standard 400-450 Wc ≈ 2 m². Pour 3 kWc : 15 m². Pour 6 kWc : 30 m². Pour 9 kWc : 45 m². Prévoir 50 cm en périphérie (sécurité incendie + maintenance) et éviter zone cheminée.',
  },
  {
    label: 'Démarche Consuel (sécurité)',
    valeur: 'Obligatoire > 3 kWc avec injection',
    detail:
      'Visite Consuel obligatoire pour installation > 3 kWc avec injection réseau. Vérifie conformité NF C 15-712-1, sectionneur DC accessible, mise à la terre, étiquetage tableau. Coût 150-250 €. Sans attestation = blocage mise en service Enedis.',
  },
]

const ERREURS_FREQUENTES = [
  {
    title: 'Démarchage téléphonique illégal',
    impact: 'Fraude potentielle',
    desc: 'Le démarchage téléphonique pour la rénovation énergétique (dont solaire) est interdit depuis la loi du 24 juillet 2020. Toute proposition suite à un appel froid = à refuser. Signaler sur SignalConso DGCCRF.',
  },
  {
    title: 'Étude production fantaisiste',
    impact: 'Sur-promesses 30-50 %',
    desc: 'Promesse 5 000 kWh/an pour 3 kWc en Bretagne = irréaliste. Réalité : 3 200-3 600 kWh/an. Exiger étude PVGIS / Mines ParisTech avec orientation, inclinaison, masques d’ombre, et garantie de performance contractuelle.',
  },
  {
    title: 'Pose sans RGE',
    impact: 'Prime perdue + TVA 20 %',
    desc: 'Sans RGE QualiPV / QualiSol : (1) prime autoconso CRE rejetée, (2) TVA 20 % au lieu de 10 % (+ 1 350 € sur 15 000 €), (3) assurance décennale potentiellement non couvrante. Vérifier numéro sur france-renov.gouv.fr.',
  },
  {
    title: 'Étanchéité toiture compromise',
    impact: 'Infiltrations',
    desc: 'Fixation panneaux par chevillage direct dans la couverture (sans pattes étanches DTU 40.11) = infiltrations à 5-10 ans. Exiger fixations DTU + crochets de toit étanches + photos avant/après remontage tuiles.',
  },
  {
    title: 'Surdimensionnement > conso',
    impact: 'Rentabilité dégradée',
    desc: 'Installer 9 kWc pour conso 5 MWh/an = surplus 70 % à revente faible vs autoconso. Règle : production ≤ 1,2 × conso annuelle. Optimum autoconso 30-50 % du temps (sans batterie) à 60-75 % (avec batterie 5 kWh).',
  },
  {
    title: 'Onduleur unique pour toit ombragé',
    impact: 'Perte 15-25 %',
    desc: 'Onduleur string sur toit avec ombre partielle (cheminée, arbre) = production -15-25 % vs micro-onduleurs (1 par panneau). Si ombrage > 10 % du temps : micro-onduleurs Enphase / APsystems = ROI +5-10 %.',
  },
  {
    title: 'Pas de visite Consuel',
    impact: 'Mise en service bloquée',
    desc: 'Visite Consuel obligatoire > 3 kWc avec injection. Sans attestation = Enedis refuse mise en service compteur Linky = pas de production réseau + pas de prime + pas de revente. Inclure dans devis (~ 150-250 €).',
  },
]

const faqs = [
  {
    question: 'Combien de temps dure l’installation d’un système photovoltaïque ?',
    answer:
      '<strong>Chantier sur site</strong> : 1-3 jours pour 3-9 kWc (pose panneaux + onduleur + câblage + sécurités + Consuel). <strong>Démarches administratives</strong> : 2-4 mois en parallèle (déclaration préalable mairie 1 mois + Enedis 6-12 semaines + Consuel 2-4 semaines + EDF OA 4-6 semaines). Production effective : 3-4 mois après signature devis en moyenne. Versement prime CRE : étalé 5 ans à compter de la mise en service.',
  },
  {
    question: 'Quelles démarches administratives pour installer du solaire ?',
    answer:
      'Quatre démarches obligatoires : (1) <strong>déclaration préalable de travaux</strong> en mairie (Cerfa 13703, délai 1 mois ; 2-4 mois en zone ABF), (2) <strong>convention de raccordement Enedis</strong> (portail Enedis Connect, délai 6-12 semaines, coût 200-1 500 € selon distance compteur), (3) <strong>visite Consuel</strong> obligatoire > 3 kWc avec injection (150-250 €), (4) <strong>contrat d’achat EDF OA</strong> 20 ans + demande prime autoconso CRE (gratuit mais souvent externalisée par installateur). Total durée 2-4 mois.',
  },
  {
    question: 'Faut-il un installateur RGE pour les aides solaire ?',
    answer:
      'OUI, obligatoire. Mention <strong>RGE QualiPV</strong> (photovoltaïque), <strong>QualiSol</strong> (thermique CESI) ou <strong>QualiSol Combi</strong> (système combiné chauffage + ECS) exigée pour : (1) prime autoconso CRE jusqu’à 1 620 €, (2) MaPrimeRénov’ solaire thermique jusqu’à 10 000 €, (3) TVA 10 % (vs 20 %), (4) éco-PTZ. Vérification sur <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a> : numéro QualitENR valide à la date du devis.',
  },
  {
    question: 'Quelles sont les conditions techniques pour installer du solaire ?',
    answer:
      'Six conditions : (1) <strong>orientation</strong> sud optimal (sud-est / sud-ouest -5-10 % ; est / ouest -15-20 %), (2) <strong>inclinaison</strong> 30-35° idéal, (3) <strong>charpente capable</strong> 15-20 kg/m² additionnels, toiture < 25 ans, (4) <strong>tableau électrique</strong> conforme NF C 15-100 récent, (5) <strong>surface utile</strong> ~ 5 m²/kWc, (6) <strong>conformité NF C 15-712-1</strong> (norme installation PV) validée par visite Consuel obligatoire > 3 kWc avec injection.',
  },
  {
    question: 'Que doit contenir le devis d’installation solaire ?',
    answer:
      'Checklist devis : (1) mention <strong>RGE QualiPV / QualiSol</strong> valide à la date du devis, (2) <strong>puissance crête (kWc)</strong> + nombre de panneaux + Wc unitaire, (3) marque + référence panneaux + onduleur + fixations, (4) <strong>étude PVGIS</strong> avec orientation, inclinaison, masques d’ombre, (5) <strong>garantie produit ≥ 12 ans</strong> + garantie performance 25 ans (≥ 80 % à 25 ans), (6) démarches CRE / EDF OA / Enedis incluses, (7) <strong>visite Consuel</strong> incluse (150-250 €), (8) total HT, TVA 10 %, total TTC.',
  },
  {
    question: 'Faut-il une déclaration préalable de travaux ?',
    answer:
      'OUI obligatoire dans tous les cas (modification aspect extérieur). Formulaire <strong>Cerfa 13703</strong> déposé en mairie. Délai légal d’instruction <strong>1 mois</strong>. Sans réponse à 1 mois = accord tacite. En <strong>zone ABF</strong> (monuments historiques, secteurs sauvegardés) : autorisation Architecte des Bâtiments de France obligatoire, délai 2-4 mois. Sans DP : amende administrative jusqu’à 6 000 € + risque démolition. En copropriété : vote AG préalable obligatoire.',
  },
  {
    question: 'Comment se passe la mise en service ?',
    answer:
      'Six étapes : (1) <strong>vérifications préalables</strong> (continuité terre, isolement, polarité, calibrage), (2) <strong>mise sous tension contrôlée</strong> DC puis AC + démarrage onduleur, (3) <strong>autotest système</strong> initial, (4) <strong>visite Consuel</strong> (attestation conformité NF C 15-712-1), (5) <strong>mise en service Enedis</strong> (compteur Linky activé en injection), (6) <strong>configuration monitoring</strong> (application installateur + cloud). Production active dès activation Enedis. Versement prime CRE début 1er anniversaire mise en service.',
  },
  {
    question: 'Quel entretien après l’installation ?',
    answer:
      '<strong>Entretien recommandé</strong> annuel (non obligatoire) : 80-150 € HT/an. Inclut : (1) nettoyage des panneaux (pollen, poussières, fientes) avec eau déminéralisée, (2) vérification serrage fixations, (3) contrôle visuel câblage, (4) test parafoudre + sectionneurs DC/AC, (5) vérification production via monitoring (alerte si baisse > 10 %). Durée de vie panneaux 25-30 ans. Onduleur 10-15 ans (remplacement ~ 1 500-2 500 €).',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Énergie solaire',
    url: 'https://france-renov.gouv.fr/renovation/energies-renouvelables/solaire',
  },
  {
    label: 'CRE — Tarifs achat et prime autoconso',
    url: 'https://www.cre.fr',
  },
  {
    label: 'EDF OA — Obligation d’Achat solaire',
    url: 'https://www.edf-oa.fr',
  },
  {
    label: 'Enedis — Raccordement producteur',
    url: 'https://www.enedis.fr/producteurs',
  },
  {
    label: 'Consuel — Attestation conformité',
    url: 'https://www.consuel.com',
  },
  {
    label: 'AFNOR — NF C 15-712-1 (Installations PV basse tension)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — NF C 15-100 (Installations électriques basse tension)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'Qualit’ENR — Annuaire QualiPV / QualiSol',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Service-Public.fr — Aides énergies renouvelables',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35054',
  },
]

const relatedPages = [
  {
    label: 'Solaire — hub 2026',
    href: '/renovation-energetique/travaux/solaire',
    description: 'Photovoltaïque + thermique + hybride',
  },
  {
    label: 'Solaire — prix 2026',
    href: '/renovation-energetique/travaux/solaire/prix',
    description: 'Grille 3-9 kWc + ROI 25 ans',
  },
  {
    label: 'Autoconsommation solaire 2026',
    href: '/renovation-energetique/travaux/solaire/autoconsommation',
    description: 'Maximiser l’autoconso, batterie',
  },
  {
    label: 'Dimensionner son installation (kWc)',
    href: '/renovation-energetique/travaux/solaire/dimension',
    description: '3, 6 ou 9 kWc selon conso',
  },
  {
    label: 'Aides panneau solaire 2026',
    href: '/renovation-energetique/aides/panneau-solaire-2026',
    description: 'Prime autoconso + EDF OA',
  },
  {
    label: 'Label RGE QualiSol',
    href: '/rge/labels/qualisol',
    description: 'Certification installateur solaire',
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
    section: 'Travaux — Solaire — Installation',
    keywords: [
      'installation panneau solaire',
      'pose panneau solaire',
      'installer panneau solaire',
      'raccordement panneau solaire enedis',
      'démarches panneau solaire CRE',
      'EDF OA panneau solaire',
      'installation solaire 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Installation', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Installation panneaux solaires RGE 2026',
    description:
      'Pose panneaux photovoltaïques + onduleur + raccordement par un installateur RGE QualiPV, conforme NF C 15-712-1, avec démarches Enedis, Consuel, contrat EDF OA et demande prime autoconso CRE.',
    category: 'Installation photovoltaïque',
  })
  const howToSchema = getHowToSchema(
    ETAPES.map((e) => ({ name: e.step, text: e.detail })),
    {
      name: 'Installer une installation photovoltaïque 3-9 kWc',
      description:
        'Étapes complètes pour installer une installation solaire photovoltaïque en autoconsommation avec revente de surplus.',
      totalTime: 'P90D',
    }
  )
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'Prime autoconso + EDF OA — Installation solaire 2026',
    description:
      'Aides financières (prime CRE autoconso jusqu’à 1 620 € + tarif d’achat EDF OA 20 ans) accordées aux ménages installant un système photovoltaïque par un installateur RGE QualiPV.',
    url: PAGE_URL,
    serviceType: 'Aide financière aux énergies renouvelables',
    serviceOperator: {
      name: 'CRE — Commission de régulation de l’énergie',
      url: 'https://www.cre.fr',
    },
    audience: 'Propriétaires occupants, bailleurs et copropriétés — logement > 2 ans',
    sameAs: ['https://france-renov.gouv.fr', 'https://www.cre.fr'],
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
              { label: 'Solaire', href: '/renovation-energetique/travaux/solaire' },
              { label: 'Installation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Installation solaire &middot; Guide 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Installation panneau solaire 2026 : démarches & étapes
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, l’<strong>installation d’une installation photovoltaïque</strong> mobilise
              1-3 jours de chantier et 2-4 mois de démarches (déclaration mairie, raccordement
              Enedis, Consuel, contrat EDF OA, prime CRE). Conditions techniques critiques :
              orientation sud + 30-35° + charpente saine + tableau électrique aux normes. RGE
              QualiPV obligatoire pour prime autoconso + TVA 10 %. Voici les 10 étapes complètes.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="etapes">Les 10 étapes d’installation solaire</h2>
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

            <h2 id="checklist-devis">Checklist devis installation solaire</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mention RGE QualiPV / QualiSol</strong> valide à la date du devis
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Puissance kWc</strong> + nombre de panneaux + Wc unitaire + marque +
                référence
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Onduleur</strong> (marque + référence + topologie string ou micro)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Étude PVGIS / Mines ParisTech</strong> avec orientation, inclinaison,
                masques d’ombre
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Garantie produit ≥ 12 ans + performance 25 ans</strong> (≥ 80 % à 25 ans)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Démarches incluses</strong> : DP mairie, Enedis, Consuel, EDF OA, prime CRE
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Fixations DTU 40.11</strong> + crochets de toit étanches selon couverture
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Total HT, TVA 10 % détaillée, total TTC</strong>, modalités paiement +
                échéancier
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un installateur RGE QualiPV près de chez vous
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur compare votre situation (conso, surface toit, orientation) et
                    liste les installateurs RGE QualiPV / QualiSol vérifiés sur france-renov.gouv.fr
                    disponibles proches de chez vous.
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
          </article>

          <SimulateurAideBox
            serviceKey="panneau-solaire"
            estimatedSaving={1080}
            subtitle="Prime autoconso CRE jusqu’à 1 620 € + revente surplus EDF OA — éligibilité en 3 min"
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
              href="/renovation-energetique/travaux/solaire"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Solaire
            </Link>
            <Link
              href="/rge/labels/qualisol"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Installateurs RGE QualiSol / QualiPV{' '}
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <FinalCtaSection
        heading="Demandez vos devis pose solaire"
        description="Recevez 3 devis d'installateurs RGE QualiSol / QualiPV en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur-aides-renovation?service=panneau-solaire',
          intent: 'final-devis-installation',
        }}
        secondaryCta={{
          label: 'Voir les installateurs RGE',
          href: '/rge/labels/qualisol',
        }}
        accent="blue"
        trustLine="Installateurs RGE QualiSol / QualiPV • Source : Registre RGE ADEME • RGPD"
      />
    </>
  )
}
