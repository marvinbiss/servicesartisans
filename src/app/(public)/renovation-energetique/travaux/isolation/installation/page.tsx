/**
 * Page : /renovation-energetique/travaux/isolation/installation
 *
 * @kw-primary    installation isolation
 * @kw-volume     320
 * @kw-kd         5
 * @kw-cpc        TBD
 * @intent        commercial + how-to
 * @cluster       isolation
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster isolation)
 * @backlog-item  Sprint-pseo-isolation-installation-2026-05-22
 * @author        isabelle-renault
 *
 * KW cibles (validés Ahrefs gap CSV 2026-05-04, country=fr) :
 * - "installation isolation"                  ~320 vol, KD 5  ⭐ PIVOT
 * - "pose ITE"                                ~180 vol, KD 4
 * - "isolation combles installation"          ~200 vol, KD 3
 * - "isolation par l'extérieur"              12000 vol, KD 2  (head connexe hub ITE)
 * - "isolation extérieur maison"              3700 vol, KD 4  (head connexe)
 * - "isolation sous toiture entre chevrons"   1100 vol, KD 0
 * - Famille cumulée pose ITE/ITI/combles : ~2 000 vol/mois (focus how-to)
 *
 * Easy win : OUI (KD ≤ 5 sur pivot, intent how-to + commercial).
 * Page how-to + checklist pose + DTU + RGE obligatoire.
 *
 * Anti-cannibalisation :
 *   - /isolation                       = hub PRODUIT (techniques, matériaux)
 *   - /isolation/exterieure-ite        = sous-page ITE technique
 *   - /isolation/combles               = sous-page combles technique
 *   - /isolation/prix                  = sous-page PRIX (grille m²)
 *   - Cette page                       = sous-page INSTALLATION (étapes, DTU)
 *
 * YMYL : pose impacte performance thermique (R), étanchéité (pare-vapeur),
 * durabilité (corrosion charpente) et aides. RGE Qualibat 7141/7142/8611
 * obligatoire pour aides. Cite : France Rénov’, ADEME, DTU 45.3 ITE, DTU 31.2
 * pare-vapeur, DTU 25.41 plâtrerie, Légifrance, ANAH, Service-Public.fr.
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

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/isolation/installation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'isabelle-renault'
const AUTHOR_NAME = 'Isabelle Renault'

const TITLE = 'Installation isolation 2026 : étapes ITE, ITI, combles + RGE'
const DESCRIPTION =
  'Installation isolation 2026 : guide pose ITE crépi/bardage 3-6 sem, combles 1-2 jours, ITI 5-10 jours. DTU 45.3 / 31.2. RGE Qualibat 7141/7142/8611 obligatoire pour MPR + CEE.'

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
  'Combles perdus soufflés : 1-2 jours pour 100 m², 1 jour de chantier propre.',
  'Combles aménagés rampants : 4-7 jours pour 80 m² (entre chevrons + pare-vapeur).',
  'ITI doublage : 5-10 jours pour 70 m² appartement (placo + isolant + finition).',
  'ITE crépi : 3-5 semaines maison 100 m² façade (échafaudage + séchage enduit).',
  'ITE bardage ventilé : 4-6 semaines (lattage + isolant + bardage + finition).',
  'RGE Qualibat 7141 (ITE) / 7142 (ITI) / 8611 (combles) obligatoire pour MPR + CEE + TVA 5,5 %.',
  'Pare-vapeur DTU 31.2 obligatoire côté chaud combles/rampants (sinon condensation).',
]

const ETAPES = [
  {
    step: 'Visite technique préalable',
    duree: '1-2 h',
    detail:
      'L’artisan vérifie : surface exacte (m²) avec retours menuiseries, état du support (façade saine, charpente, structure), accessibilité (échafaudage / nacelle), respect PLU mairie (couleur enduit, hauteur, zones protégées ABF), points singuliers (descentes EP, gouttières, volets battants, climatisation), épaisseur isolant à poser selon R cible (3,7 mur, 7 combles).',
  },
  {
    step: 'Audit énergétique (si projet > 5 000 € avec saut 2 classes DPE)',
    duree: 'J+0 à J+15',
    detail:
      'Audit énergétique obligatoire pour MaPrimeRénov’ Parcours accompagné. Coût 500-1 200 € TTC (aide ANAH 500 € maximum). Identifie priorités (toit > murs > sol > menuiseries) et chiffre 2 scénarios cible classe B-C. Réalisé par un auditeur agréé France Rénov’.',
  },
  {
    step: 'Devis détaillé + dépôt aides',
    duree: 'J+15 à J+30',
    detail:
      'Devis exigés en 3 exemplaires comparatifs. Doivent contenir : surface, épaisseur, R, matériau précis, mention RGE Qualibat 7141/7142/8611, total HT, TVA 5,5 %, total TTC. Dépôt MaPrimeRénov’ sur france-renov.gouv.fr et contrat CEE BAR-EN-101/102/103 AVANT signature devis. Délai accord 7-15 jours.',
  },
  {
    step: 'Signature devis + acompte + autorisations',
    duree: 'J+30',
    detail:
      'Acompte 20-30 % à la signature. Délai légal de rétractation 14 jours. Pour ITE en zone urbaine : déclaration préalable de travaux mairie (délai 1 mois) car modification aspect extérieur. En zone ABF (monuments historiques) : autorisation Architecte des Bâtiments de France (délai 2-4 mois).',
  },
  {
    step: 'Préparation support (ITE / ITI)',
    duree: '2-5 jours',
    detail:
      'ITE : nettoyage façade (haute pression), réparation fissures, traitement humidité ascensionnelle si présente. ITI : protection sol et meubles, dépose plinthes, plâtre dans bon état (sinon piochage). Combles : aspiration ancien isolant (si tassé/sale), nettoyage poutres, contrôle charpente (insectes xylophages).',
  },
  {
    step: 'Pose isolant',
    duree: 'Selon technique',
    detail:
      'ITE crépi : collage + chevillage panneaux PSE / laine de roche sur façade (1-2 sem maison 100 m²). ITE bardage : ossature bois + isolant + lame d’air ventilée + bardage. ITI doublage collé : panneaux placo + PSE / PU collés au mortier sur mur. ITI ossature : rails + isolant en lés + placo. Combles soufflés : machine de soufflage ouate cellulose / laine minérale (R 7 = ~30 cm).',
  },
  {
    step: 'Pare-vapeur + étanchéité à l’air',
    duree: '1-2 jours',
    detail:
      'Pose pare-vapeur DTU 31.2 côté chaud (intérieur), agrafé sur ossature, recouvrement ≥ 100 mm, adhésif spécifique sur joints. Traitement des points singuliers : passages câbles, gaines électriques, conduits VMC. Test étanchéité à l’air recommandé (porte soufflante) pour viser BBC ≤ 0,6 Vol/h.',
  },
  {
    step: 'Finitions ITE (enduit ou bardage)',
    duree: '1-3 semaines',
    detail:
      'ITE crépi : sous-couche armée fibre de verre + enduit minéral teinté (2 couches, séchage 24-48 h chaque). Bardage : lame d’air 20-30 mm + bardage bois / composite / fibrociment + accessoires (départs, profils d’angle). Reprise des éléments façade (descentes EP, volets, climatiseurs).',
  },
  {
    step: 'Finitions ITI (placo + peinture)',
    duree: '2-5 jours',
    detail:
      'Plaques de plâtre BA13 vissées sur ossature (entraxe 60 cm) ou collées sur isolant. Bandes à joint + enduit + ponçage. Peinture acrylique 2 couches ou papier peint. Repose plinthes + interrupteurs / prises (extension boîtiers selon épaisseur isolant).',
  },
  {
    step: 'Mise en service + procès-verbal + déclaration MPR',
    duree: '30-60 min',
    detail:
      'Procès-verbal de chantier signé : surface réelle isolée, épaisseur posée, R atteint, photos avant/après, déclaration de conformité DTU. Remise des fiches techniques matériaux + assurance décennale. Dépôt facture MPR sur france-renov.gouv.fr → versement aide 2-4 mois après facture.',
  },
]

const CONDITIONS_TECHNIQUES = [
  {
    label: 'Résistance thermique R minimum MPR',
    valeur: 'R ≥ 3,7 mur • 7 combles perdus • 6 rampants • 3 sol',
    detail:
      'Seuils MaPrimeRénov’ et CEE pour aides 2026. Sous le seuil : dossier rejeté. Vérifier épaisseur en cm × λ (lambda) selon matériau. Exemple laine de verre λ = 0,032 → R 7 = 22 cm.',
  },
  {
    label: 'Matériau certifié ACERMI',
    valeur: 'Certificat ACERMI obligatoire',
    detail:
      'Tous matériaux isolants doivent disposer d’un certificat ACERMI valide à la date de pose. Vérifier numéro de certificat sur la fiche technique. Sans ACERMI = aides rejetées.',
  },
  {
    label: 'Pare-vapeur DTU 31.2 (combles/rampants)',
    valeur: 'Sd ≥ 18 m côté chaud',
    detail:
      'Pare-vapeur posé côté chaud (intérieur) avec recouvrement ≥ 100 mm + adhésif spécifique sur joints. Protège l’isolant de la condensation issue de l’air intérieur (humidité, cuisine, salle de bain).',
  },
  {
    label: 'Ventilation logement (post-isolation)',
    valeur: 'VMC obligatoire',
    detail:
      'Une enveloppe isolée + étanche à l’air = nécessite une VMC simple flux hygro ou double flux pour évacuer humidité. Sans ventilation : taux humidité > 70 % = moisissures sur murs froids résiduels.',
  },
  {
    label: 'Traitement ponts thermiques',
    valeur: 'Retours fenêtres, angles, planchers',
    detail:
      'ITE : traitement systématique des retours menuiseries (~ 5 cm isolant minimum sur tableau et linteau). ITI : ponts thermiques planchers et refends = perte 20-30 % du gain si non traités. Exiger mémoire technique.',
  },
  {
    label: 'Déclaration préalable mairie (ITE)',
    valeur: 'Délai 1 mois',
    detail:
      'ITE = modification aspect extérieur = déclaration préalable obligatoire. Vérifier PLU couleur enduit, hauteur, matériau. Zone ABF (monuments historiques) : autorisation Architecte des Bâtiments de France, délai 2-4 mois.',
  },
]

const ERREURS_FREQUENTES = [
  {
    title: 'Pas de pare-vapeur',
    impact: 'Condensation + moisissures',
    desc: 'Combles ou rampants isolés sans pare-vapeur DTU 31.2 = humidité air intérieur condense dans l’isolant = laine gorgée d’eau = perte d’efficacité + moisissures + corrosion charpente.',
  },
  {
    title: 'Ponts thermiques négligés',
    impact: 'Performance -20-30 %',
    desc: 'ITI sans traitement des angles, dalle béton, retours fenêtres = ponts thermiques résiduels = condensation localisée + perte 20-30 % du gain attendu. ITE bien faite supprime 90 % des ponts.',
  },
  {
    title: 'Pose sans RGE',
    impact: 'TVA 20 % + aides perdues',
    desc: 'Sans Qualibat 7141 (ITE) / 7142 (ITI) / 8611 (combles) : TVA 20 % au lieu de 5,5 % (+ ~ 1 000 € sur 7 000 €) + MPR/CEE rejetées + assurance décennale potentiellement non couvrante.',
  },
  {
    title: 'Surface payée vs surface réellement isolée',
    impact: 'Sur-facturation 5-15 %',
    desc: 'Devis indique 100 m² mais surface réelle après déduction ouvertures (fenêtres, portes) = 85 m². Exiger surface NETTE isolée + photos de fin de chantier. Surface = aussi base CEE et MPR.',
  },
  {
    title: 'Pas de ventilation post-isolation',
    impact: 'Humidité 70-80 %',
    desc: 'Enveloppe isolée + étanche = humidité piégée = moisissures + dégradation isolant. Installer VMC simple flux hygro (~ 600-900 €) ou double flux (3 000-5 000 €) avant de finaliser isolation.',
  },
  {
    title: 'Audit énergétique oublié (MPR > 5 000 €)',
    impact: 'Dossier MPR bloqué',
    desc: 'Pour MPR Parcours accompagné (saut 2 classes DPE, > 5 000 €) : audit énergétique obligatoire (500-1 200 €). Aide ANAH 500 €. Réalisé par auditeur agréé France Rénov’.',
  },
  {
    title: 'Pas de déclaration préalable mairie (ITE)',
    impact: 'Travaux illégaux',
    desc: 'ITE = modification aspect extérieur = déclaration préalable obligatoire (délai 1 mois). Sans DP : amende administrative jusqu’à 6 000 € + risque démolition. En zone ABF : autorisation Architecte des Bâtiments de France.',
  },
]

const faqs = [
  {
    question: 'Combien de temps dure un chantier d’isolation ?',
    answer:
      '<strong>Combles perdus soufflés</strong> : 1-2 jours pour 100 m² (chantier propre, machine de soufflage). <strong>Combles aménagés rampants</strong> : 4-7 jours pour 80 m² (entre chevrons + pare-vapeur). <strong>ITI doublage</strong> : 5-10 jours pour 70 m² (placo + finition peinture). <strong>ITE crépi</strong> : 3-5 semaines maison 100 m² façade (échafaudage + collage panneaux + enduit + séchage). <strong>ITE bardage ventilé</strong> : 4-6 semaines. Délai accord MPR : 7-15 jours après dépôt. Délai versement : 2-4 mois après facture.',
  },
  {
    question: 'Faut-il un installateur RGE pour les aides isolation ?',
    answer:
      'OUI, obligatoire. Mention <strong>RGE Qualibat 7141</strong> (ITE), <strong>7142</strong> (ITI) ou <strong>8611</strong> (combles) exigée pour : (1) MaPrimeRénov’ jusqu’à 75 €/m² ITE, (2) Coup de pouce CEE BAR-EN-101/102/103, (3) TVA 5,5 % (vs 20 %), (4) éco-PTZ jusqu’à 50 000 €. Vérification sur <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a> : numéro Qualibat valide à la date du devis. Sans RGE : surcoût ~ 14 % + aides rejetées.',
  },
  {
    question: 'Quelles sont les conditions techniques pour isoler ?',
    answer:
      'Six conditions principales : (1) <strong>R minimum MPR</strong> : 3,7 mur / 7 combles perdus / 6 rampants / 3 sol, (2) <strong>matériau certifié ACERMI</strong> obligatoire, (3) <strong>pare-vapeur DTU 31.2</strong> côté chaud (combles/rampants), (4) <strong>VMC obligatoire</strong> post-isolation (sinon humidité), (5) <strong>traitement ponts thermiques</strong> (retours, angles, planchers), (6) <strong>déclaration préalable mairie</strong> pour ITE (délai 1 mois) ou autorisation ABF en zone protégée.',
  },
  {
    question: 'Faut-il une déclaration préalable de travaux ?',
    answer:
      'Pour <strong>ITE</strong> : OUI, déclaration préalable de travaux obligatoire en mairie (modification aspect extérieur). Délai instruction 1 mois. Sans DP : amende jusqu’à 6 000 € + risque démolition. En zone <strong>ABF</strong> (monuments historiques, secteurs sauvegardés) : autorisation Architecte des Bâtiments de France, délai 2-4 mois. Pour <strong>ITI et combles</strong> : aucune déclaration nécessaire (intervention intérieure). En copropriété ITE : vote AG obligatoire (majorité simple).',
  },
  {
    question: 'Que doit contenir le devis d’installation isolation ?',
    answer:
      'Checklist devis détaillée : (1) mention RGE Qualibat 7141 / 7142 / 8611 valide, (2) surface NETTE à isoler (m²) avec déduction ouvertures, (3) épaisseur posée (mm) + R thermique (m².K/W), (4) matériau précis (marque + référence + λ + certificat ACERMI), (5) pare-vapeur DTU 31.2 (combles/rampants), (6) traitement points singuliers (retours, angles, planchers), (7) garanties (décennale + biennale + parfait achèvement), (8) total HT, TVA 5,5 %, total TTC, modalités paiement.',
  },
  {
    question: 'Comment se passe la mise en service ?',
    answer:
      'Étapes obligatoires : (1) <strong>procès-verbal de chantier</strong> signé (surface, épaisseur, R, photos), (2) <strong>fiches techniques matériaux</strong> remises au client (ACERMI, λ, marque), (3) <strong>déclaration de conformité DTU</strong> (45.3 ITE, 31.2 pare-vapeur, 25.41 plâtrerie), (4) <strong>attestation décennale</strong> nominative à la date du chantier, (5) <strong>test étanchéité à l’air recommandé</strong> (porte soufflante) pour viser BBC ≤ 0,6 Vol/h, (6) <strong>dépôt facture MPR</strong> sur france-renov.gouv.fr.',
  },
  {
    question: 'Faut-il poser une VMC après l’isolation ?',
    answer:
      'OUI obligatoire. Une enveloppe isolée + étanche à l’air = humidité piégée = moisissures sur murs froids résiduels (ponts thermiques) + dégradation isolant. Solutions : <strong>VMC simple flux hygro B</strong> (600-900 €, débits asservis humidité), <strong>VMC double flux</strong> (3 000-5 000 € matériel + pose, échangeur thermique 70-90 % rendement). Réalisée par RGE QualiPAC ou Qualibat 5421 pour MPR + CEE BAR-TH-127.',
  },
  {
    question: 'Comment vérifier la qualité du chantier ?',
    answer:
      'Cinq vérifications : (1) <strong>épaisseur réelle</strong> mesurée à plusieurs endroits, (2) <strong>continuité de l’isolant</strong> (pas de zones non traitées, surtout angles), (3) <strong>pare-vapeur posé côté chaud</strong> avec recouvrements + adhésif sur joints (combles), (4) <strong>retours fenêtres traités</strong> (ITE) avec isolant tableau/linteau, (5) <strong>test étanchéité à l’air</strong> optionnel mais recommandé (porte soufflante, 100-200 € HT). Demander photos avant/après + procès-verbal détaillé.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Isoler son logement',
    url: 'https://france-renov.gouv.fr/renovation/isolation',
  },
  {
    label: 'ADEME — Guide isolation thermique',
    url: 'https://agir.ademe.fr',
  },
  {
    label: 'AFNOR — DTU 45.3 (Isolation thermique par l’extérieur)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — DTU 31.2 (Pare-vapeur combles)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — DTU 25.41 (Plâtrerie placo)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'Qualibat — Annuaire RGE 7141 / 7142 / 8611',
    url: 'https://www.qualibat.com',
  },
  {
    label: 'ANAH — MaPrimeRénov’ Isolation',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'Légifrance — Décret 2021-209 (démarchage isolation)',
    url: 'https://www.legifrance.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'Isolation — hub 2026',
    href: '/renovation-energetique/travaux/isolation',
    description: 'Techniques, matériaux, performances',
  },
  {
    label: 'Isolation — prix 2026 au m²',
    href: '/renovation-energetique/travaux/isolation/prix',
    description: 'Grille ITE/ITI/combles + aides',
  },
  {
    label: 'ITE — isolation par l’extérieur',
    href: '/renovation-energetique/travaux/isolation/exterieure-ite',
    description: 'Crépi vs bardage, performance',
  },
  {
    label: 'Combles — isolation perdus + aménagés',
    href: '/renovation-energetique/travaux/isolation/combles',
    description: 'Soufflé, rampants, R minimum',
  },
  {
    label: 'Label RGE Qualibat',
    href: '/rge/labels/qualibat',
    description: 'Certification isolation 7141/7142/8611',
  },
  {
    label: 'Audit énergétique 2026',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Obligation > 5 000 € + scénarios DPE',
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
    section: 'Travaux — Isolation — Installation',
    keywords: [
      'installation isolation',
      'pose ITE',
      'isolation combles installation',
      'isolation par l’extérieur',
      'isolation extérieur maison',
      'isolation sous toiture entre chevrons',
      'isolation 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Isolation', url: '/renovation-energetique/travaux/isolation' },
    { name: 'Installation', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Installation isolation RGE 2026',
    description:
      'Pose d’isolation thermique (ITE crépi/bardage, ITI doublage/ossature, combles soufflés/rampants) par un artisan RGE Qualibat 7141/7142/8611, conforme DTU 45.3 / 31.2 / 25.41.',
    category: 'Travaux d’isolation thermique',
  })
  const howToSchema = getHowToSchema(
    ETAPES.map((e) => ({ name: e.step, text: e.detail })),
    {
      name: 'Installer une isolation thermique en 2026',
      description:
        'Étapes complètes pour installer une isolation thermique (ITE, ITI, combles) par un artisan RGE Qualibat.',
      totalTime: 'P14D',
    }
  )
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'MaPrimeRénov’ + CEE — Installation isolation 2026',
    description:
      'Aides cumulées (MaPrimeRénov’ jusqu’à 75 €/m² ITE + CEE BAR-EN-101/102/103 + TVA 5,5 %) accordées aux ménages installant une isolation thermique par un artisan RGE Qualibat.',
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
              { label: 'Isolation', href: '/renovation-energetique/travaux/isolation' },
              { label: 'Installation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Installation isolation &middot; Guide 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Installation isolation 2026 : ITE, ITI, combles
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, l’<strong>installation d’une isolation</strong> dure de 1-2 jours (combles
              perdus soufflés) à 3-6 semaines (ITE crépi ou bardage). Les conditions techniques
              critiques : R thermique minimum (3,7 mur / 7 combles), pare-vapeur DTU 31.2,
              ventilation VMC obligatoire post-isolation, traitement des ponts thermiques. RGE
              Qualibat 7141/7142/8611 obligatoire pour MaPrimeRénov’ + CEE + TVA 5,5 %. Voici les 10
              étapes complètes et la checklist devis.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="etapes">Les 10 étapes d’installation isolation</h2>
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
                <strong>Mention RGE Qualibat 7141 / 7142 / 8611</strong> valide à la date du devis
                (vérifiable sur france-renov.gouv.fr)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Surface nette m²</strong> à isoler avec déduction ouvertures (fenêtres,
                portes)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Épaisseur posée (mm), résistance R (m².K/W), lambda λ</strong> du matériau
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Certificat ACERMI</strong> du matériau (numéro à vérifier)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Pare-vapeur DTU 31.2</strong> (combles/rampants) avec marque et Sd ≥ 18 m
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Traitement points singuliers</strong> (retours fenêtres ITE, ponts ITI)
                chiffré
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Garanties</strong> détaillées (décennale + biennale + parfait achèvement)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Total HT, TVA 5,5 % détaillée, total TTC</strong>, modalités paiement +
                échéancier
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un artisan RGE Qualibat près de chez vous
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur compare votre situation (revenus, surface, paroi) et liste les
                    artisans RGE Qualibat 7141/7142/8611 disponibles proches de chez vous, vérifiés
                    sur france-renov.gouv.fr.
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
            serviceKey="isolation"
            estimatedSaving={4500}
            subtitle="MaPrimeRénov’ jusqu’à 75 €/m² + CEE BAR-EN-101/102/103 — éligibilité en 3 min"
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
              href="/renovation-energetique/travaux/isolation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Isolation
            </Link>
            <Link
              href="/rge/labels/qualibat"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE Qualibat <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
