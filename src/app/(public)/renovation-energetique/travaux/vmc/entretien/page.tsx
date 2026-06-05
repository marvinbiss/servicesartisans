/**
 * Page : /renovation-energetique/travaux/vmc/entretien
 *
 * @kw-primary    entretien vmc
 * @kw-volume     2400
 * @kw-kd         0
 * @kw-cpc        0.06
 * @cluster       4
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster ventilation entretien)
 * @backlog-item  Levier-H-vmc-entretien
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "entretien vmc"            → 2 400 vol, KD 0 ⭐⭐⭐ MEGA EASY pivot
 * - "nettoyage vmc"            → 1 400 vol, KD 0
 * - "prix vmc"                 → 1 300 vol, KD 0 (entretien angle)
 * - "entretien vmc obligatoire"→   500 vol, KD 0
 * - "pose vmc"                 →   500 vol, KD 0 (lien install)
 * - "installation vmc maison ancienne" → 400 vol, KD 0
 * - Famille cumulée pivot : ~6 100 vol/mois (Travaux.com #2 actuel)
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * Easy win : MAJEUR (KD 0, 0 acteur RGE-first sur SERP, 0 page existante côté SA sur l'angle entretien)
 * Cluster pillar : Rénovation Énergétique → Travaux → Ventilation → Entretien
 *
 * Anti-cannibalisation :
 *   - /travaux/vmc                    = hub VMC (4 familles, intent comparaison)
 *   - /travaux/vmc/installation       = pose / installation (intent neuf)
 *   - /travaux/vmc/simple-flux        = produit simple flux (intent choix)
 *   - /travaux/vmc/hygroreglable      = produit hygro (intent choix)
 *   - /travaux/vmc-double-flux        = produit double flux (intent choix)
 *   - Cette page = ENTRETIEN récurrent (intent service après-vente)
 *
 * YMYL medium : sécurité air intérieur (ANSES, Code construction R162) +
 * VMC gaz collective DSC (Arrêté 30 mai 1989). Pas d'aide MPR/CEE pour
 * l'entretien — uniquement pour l'installation (BAR-TH-127 / 125).
 *
 * Cite : CCH R162-1 à R162-6, Arrêté 24/03/1982 modifié (ventilation logements),
 * Arrêté 30/05/1989 (VMC gaz DSC), Décret 87-712 (charges locataire),
 * Loi 89-462 art. 7 (charges bailleur), ADEME guide entretien VMC,
 * ANSES rapports qualité air intérieur.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Wind,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Calendar,
  Wrench,
  HardHat,
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

const PAGE_PATH = '/renovation-energetique/travaux/vmc/entretien'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Prix entretien VMC 2026 : 80-300 € selon type'
const DESCRIPTION =
  'Entretien VMC en 2026 : 80-300 € selon type (simple flux 80-150, hygro 100-200, double flux 150-300). Fréquence, obligations, méthode pro et contrats annuels.'

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
  'Prix moyen 2026 entretien VMC : simple flux 80-150 €, hygroréglable 100-200 €, double flux 150-300 € (filtres compris partiellement). Contrat annuel : 100-250 €/an.',
  'Fréquence recommandée par l’ADEME : visite annuelle complète, filtres double flux tous les 3-6 mois (selon pollens / PM2.5), nettoyage gaines tous les 3 ans.',
  'Obligation légale logement : ventilation permanente exigée (Arrêté 24 mars 1982 modifié, Code construction art. R162-1 à R162-6).',
  'VMC gaz collective : contrôle annuel obligatoire par installateur agréé (Arrêté 30 mai 1989) — DSC dispositif de sécurité collective. Risque CO sinon.',
  'Charges bailleur / locataire (Décret 87-712 + Loi 89-462 art. 7) : entretien courant à la charge du locataire, gros entretien et remplacement à la charge du bailleur.',
  'Pas d’aide MaPrimeRénov’ ni CEE pour l’entretien (BAR-TH-127 / 125 = installation seulement). TVA 10 % logement > 2 ans avec artisan.',
]

const PRIX_ENTRETIEN = [
  {
    type: 'VMC simple flux autoréglable',
    visite: '80 - 150 €',
    contrat: '80 - 130 €/an',
    duree: '1 h',
    note: 'Démontage bouches cuisine/SdB/WC, nettoyage caisson + roue, vérif débits. Le plus simple à entretenir.',
  },
  {
    type: 'VMC simple flux hygroréglable',
    visite: '100 - 200 €',
    contrat: '100 - 180 €/an',
    duree: '1-1,5 h',
    note: 'Idem simple flux + contrôle des bouches hygro (capteur humidité). Bouches à remplacer après 10-15 ans.',
  },
  {
    type: 'VMC double flux',
    visite: '150 - 300 €',
    contrat: '150 - 250 €/an',
    duree: '1,5-2 h',
    note: 'Échangeur + 2 ventilateurs + filtres entrée/sortie. Filtres = 30-80 € la paire (à changer 1-2× par an).',
  },
  {
    type: 'VMC gaz collective (DSC)',
    visite: '120 - 250 €',
    contrat: '120 - 220 €/an',
    duree: '1-1,5 h',
    note: 'Contrôle annuel obligatoire (Arrêté 30/05/1989) par installateur agréé. Sécurité CO. Charges syndic.',
  },
  {
    type: 'Détartrage caisson + nettoyage gaines',
    visite: '200 - 400 €',
    contrat: 'À la demande',
    duree: '2-4 h',
    note: 'Recommandé tous les 3 ans (ADEME). Nécessaire si débits chutent ou bruit anormal. Caméra inspection possible.',
  },
]

const FACTEURS_PRIX = [
  {
    title: 'Type de VMC',
    impact: '×1 à ×2,5',
    desc: 'Simple flux : le plus simple. Hygro : +20-30 %. Double flux : +50-100 % (échangeur + filtres + 2 ventilateurs). Thermodynamique : +20 % vs DF classique.',
  },
  {
    title: 'Surface logement et nombre de bouches',
    impact: '+10 à +30 %',
    desc: 'Logement < 80 m² avec 4 bouches : tarif plancher. T5 / maison > 150 m² avec 8-10 bouches : +25 %. Caisson en combles difficile d’accès : +50-100 €.',
  },
  {
    title: 'Filtres double flux',
    impact: '30 - 80 €/paire',
    desc: 'Filtres G4 standard 30-50 €. F7 (anti-pollens / PM2.5) : 50-80 €. À changer tous les 3-6 mois en zone polluée. Auto-fourniture possible (économie 30-40 %).',
  },
  {
    title: 'Contrat annuel vs visite ponctuelle',
    impact: '-15 à -20 %',
    desc: 'Le contrat annuel inclut typiquement : 1 visite, déplacement, petit consommable. Visite à la carte : +20-30 % facturé au temps passé.',
  },
  {
    title: 'État de la VMC',
    impact: '×1,5 à ×2',
    desc: 'VMC > 15 ans, gaines encrassées, débits chutés : nécessite détartrage caisson + nettoyage gaines + remplacement bouches. Devis sur diagnostic.',
  },
]

const FREQUENCES = [
  {
    title: 'Annuelle — visite de contrôle complète',
    desc: 'Démontage bouches, nettoyage caisson + roue, mesure débits, contrôle moteur. Préconisation ADEME et constructeurs (Aldes, Atlantic, Helios). Souvent intégrée au contrat annuel 100-250 €/an.',
  },
  {
    title: 'Tous les 3 à 6 mois — filtres double flux',
    desc: 'En zone polluée (Île-de-France, vallée du Rhône, agglomérations) : tous les 3 mois. En zone rurale : tous les 6 mois. Surveiller alarme colmatage filtres si la VMC en est équipée.',
  },
  {
    title: 'Tous les 3 ans — nettoyage gaines + détartrage caisson',
    desc: 'Préconisation ADEME pour conserver des débits conformes (en m³/h) à la norme NF DTU 68.3. Nettoyage hydropneumatique (200-400 €). Indispensable avant 10-15 ans pour préserver l’hygiène de l’air.',
  },
  {
    title: 'Tous les 10 à 15 ans — remplacement bouches hygro et caisson',
    desc: 'Bouches hygroréglables : capteur humidité usé après 10-15 ans (15-30 €/u). Caisson VMC : durée de vie 15-25 ans selon usage. Remplacement complet 800-2 500 € selon type.',
  },
]

const OBLIGATIONS_LEGALES = [
  {
    title: 'Code construction R162-1 à R162-6 — ventilation logements',
    desc: 'Tout logement neuf depuis 1982 doit être équipé d’une ventilation permanente. Le maintien en bon état de fonctionnement de cette ventilation est une obligation pour le propriétaire occupant ou le bailleur.',
  },
  {
    title: 'Arrêté 24 mars 1982 modifié (logements neufs)',
    desc: 'Définit les débits minimaux d’extraction par pièce (cuisine, SdB, WC, séjour) et impose une ventilation permanente. Référence technique pour tout entretien VMC en logement résidentiel.',
  },
  {
    title: 'Arrêté 30 mai 1989 — VMC gaz collective (DSC)',
    desc: 'En copropriété équipée d’une VMC reliée à des appareils gaz : contrôle annuel obligatoire par un installateur agréé (Qualigaz) avec rapport écrit. Sécurité critique : risque d’intoxication CO.',
  },
  {
    title: 'Décret 87-712 + Loi 89-462 art. 7 — charges bailleur / locataire',
    desc: 'Entretien courant (changement filtres, nettoyage bouches, contrat annuel) = à la charge du locataire. Gros entretien (caisson, gaines, remplacement complet) = à la charge du bailleur.',
  },
]

const QUI_CHOISIR = [
  {
    title: 'Frigoriste, plombier-chauffagiste ou installateur VMC',
    must: 'Recommandé',
    desc: 'Métiers les plus formés à l’entretien VMC. Préférer un artisan référencé constructeur (Aldes, Atlantic, Helios, Brink) pour les VMC double flux complexes.',
  },
  {
    title: 'Agréé Qualigaz pour VMC gaz collective (DSC)',
    must: 'Obligatoire',
    desc: 'Le contrôle annuel d’une VMC gaz collective doit obligatoirement être réalisé par un installateur agréé Qualigaz (Arrêté 30 mai 1989). Refuser tout artisan sans agrément.',
  },
  {
    title: 'Devis détaillé avec mesure de débits',
    must: 'Obligatoire',
    desc: 'Un entretien sérieux inclut la mesure des débits (anémomètre) en m³/h sur chaque bouche. Sans mesure : pas de preuve de conformité. Exigez le rapport écrit après visite.',
  },
  {
    title: 'Contrat annuel sans engagement reconductible tacitement',
    must: 'Recommandé',
    desc: 'Préférer un contrat annuel 12 mois sans tacite reconduction (ou avec préavis 30 jours). Méfiez-vous des contrats 3-5 ans avec pénalités de résiliation.',
  },
  {
    title: 'Assurance RC pro à jour',
    must: 'Obligatoire',
    desc: 'Toute intervention sur VMC (notamment double flux + gaz) exige une assurance RC pro à jour. Demandez attestation de moins de 12 mois avec mention « entretien ventilation mécanique ».',
  },
]

const faqs = [
  {
    question: 'Combien coûte l’entretien d’une VMC en 2026 ?',
    answer:
      'Selon le type de VMC : simple flux autoréglable 80-150 € la visite, simple flux hygroréglable 100-200 €, double flux 150-300 € (hors filtres consommables 30-80 € la paire), VMC gaz collective 120-250 €. Le contrat annuel revient 15-20 % moins cher qu’une visite ponctuelle. Détartrage caisson + nettoyage gaines (tous les 3 ans environ) : 200-400 € en supplément.',
  },
  {
    question: 'L’entretien d’une VMC est-il obligatoire ?',
    answer:
      'Pour les VMC résidentielles (simple flux, hygro, double flux) : pas d’obligation légale formelle, mais l’ADEME recommande une visite annuelle. Pour les VMC gaz collectives en copropriété : OUI, contrôle annuel obligatoire par installateur agréé (Arrêté 30 mai 1989). Pour le maintien de la ventilation permanente exigée par l’Arrêté 24 mars 1982 modifié + Code construction R162 : entretien implicite obligatoire pour le propriétaire ou le bailleur.',
  },
  {
    question: 'À quelle fréquence faut-il entretenir une VMC ?',
    answer:
      'Visite annuelle complète : 1× par an (recommandation ADEME et constructeurs). Filtres VMC double flux : tous les 3-6 mois (3 mois en zone polluée, 6 mois en zone rurale). Détartrage caisson + nettoyage gaines : tous les 3 ans environ (préconisation ADEME). Remplacement bouches hygroréglables : tous les 10-15 ans. Remplacement caisson complet : tous les 15-25 ans selon usage.',
  },
  {
    question: 'Qui paye l’entretien VMC, le propriétaire ou le locataire ?',
    answer:
      'Décret 87-712 + Loi 89-462 art. 7 : l’entretien courant (changement filtres, nettoyage bouches, contrat annuel) est à la charge du locataire. Le gros entretien (détartrage caisson, nettoyage gaines, remplacement caisson ou bouches) est à la charge du bailleur. Pour la VMC gaz collective en copropriété : à la charge du syndic, refacturé via charges courantes (loi 1965 + décret 67-223).',
  },
  {
    question: 'Que comprend exactement une visite d’entretien VMC ?',
    answer:
      'Une visite pro 2026 standard inclut : (1) démontage et nettoyage des bouches d’extraction (cuisine, SdB, WC), (2) nettoyage caisson VMC et roue, (3) mesure des débits en m³/h sur chaque bouche (anémomètre), (4) contrôle moteur et asservissements, (5) remplacement filtres si VMC double flux, (6) rapport écrit avec mesures et préconisations. Si débits hors normes : devis pour détartrage caisson + nettoyage gaines.',
  },
  {
    question: 'Comment entretenir soi-même sa VMC ?',
    answer:
      'Possible pour la partie courante : (1) tous les 3-6 mois, dépoussiérer les bouches d’extraction (sortir la grille, brosse douce ou aspirateur), (2) tous les 6-12 mois, nettoyer la grille de prise d’air extérieure si accessible, (3) pour la VMC double flux : changer les filtres tous les 3-6 mois (notice constructeur). NE JAMAIS toucher au caisson, au moteur, à l’électrique : confier à un pro. Aucun nettoyage caisson ou gaine sans matériel adapté (anémomètre, hydropneumatique).',
  },
  {
    question: 'Y a-t-il des aides MaPrimeRénov’ ou CEE pour l’entretien VMC ?',
    answer:
      'NON. L’entretien VMC n’est éligible à AUCUNE aide publique (pas de MaPrimeRénov’ ni de CEE). Les aides ne couvrent que l’INSTALLATION : BAR-TH-127 (CEE) pour la VMC double flux, BAR-TH-125 (CEE) pour la VMC simple flux hygroréglable. Pour l’entretien, seule la TVA 10 % s’applique en logement de plus de 2 ans avec un artisan. Pour le contrat annuel, certains assureurs habitation l’incluent en option.',
  },
  {
    question: 'Quels sont les signes d’une VMC à entretenir d’urgence ?',
    answer:
      'Les 5 signaux d’alerte : (1) bruit anormal au caisson (grincement, vibration) = roue déséquilibrée ou roulement HS, (2) condensation sur les murs salle de bain ou cuisine = débits chutés, (3) odeurs persistantes en SdB / WC = bouches encrassées, (4) moisissures dans la salle de bain = ventilation insuffisante, (5) facture chauffage qui grimpe sans raison sur VMC double flux = échangeur encrassé. Dans tous les cas : faites diagnostiquer par un pro avant remplacement complet.',
  },
]

const sources = [
  {
    label: 'Légifrance — Code construction et habitation art. R162-1 à R162-6',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000006176010/',
  },
  {
    label: 'Légifrance — Arrêté du 24 mars 1982 modifié (ventilation logements)',
    url: 'https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006063839/',
  },
  {
    label: 'Légifrance — Arrêté du 30 mai 1989 (VMC gaz collective DSC)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000511355/',
  },
  {
    label: 'Légifrance — Décret 87-712 (charges récupérables locataire)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000874984/',
  },
  {
    label: 'ADEME — Guide entretien et performance ventilation',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'ANSES — Qualité de l’air intérieur et ventilation',
    url: 'https://www.anses.fr/fr/content/qualité-de-l’air-intérieur',
  },
  {
    label: 'Qualigaz — installateurs agréés VMC gaz',
    url: 'https://www.qualigaz.com',
  },
  {
    label: 'France Rénov’ — fiches CEE BAR-TH-127 et BAR-TH-125',
    url: 'https://france-renov.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub VMC (4 familles)',
    href: '/renovation-energetique/travaux/vmc',
  },
  {
    label: 'VMC simple flux (15K vol)',
    href: '/renovation-energetique/travaux/vmc/simple-flux',
  },
  {
    label: 'VMC hygroréglable (14K vol)',
    href: '/renovation-energetique/travaux/vmc/hygroreglable',
  },
  {
    label: 'VMC double flux (13K vol)',
    href: '/renovation-energetique/travaux/vmc-double-flux',
  },
  {
    label: 'Installation VMC (1.2K vol)',
    href: '/renovation-energetique/travaux/vmc/installation',
  },
  {
    label: 'Trouver un installateur VMC',
    href: '/rge/renovation-energetique',
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
    section: 'Travaux — Ventilation — Entretien VMC',
    keywords: [
      'entretien vmc',
      'nettoyage vmc',
      'prix entretien vmc',
      'entretien vmc obligatoire',
      'contrat entretien vmc',
      'vmc double flux entretien',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC', url: '/renovation-energetique/travaux/vmc' },
    { name: 'Entretien', url: PAGE_PATH },
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
              { label: 'Entretien' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wind className="w-3.5 h-3.5" aria-hidden />
              Ventilation &middot; Entretien VMC
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix entretien VMC en 2026 : 80-300 € selon le type
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, l’entretien d’une VMC coûte <strong>80-150 €</strong> pour une simple flux,{' '}
              <strong>100-200 €</strong> pour une hygroréglable et <strong>150-300 €</strong> pour
              une double flux (filtres en sus). Le contrat annuel revient 15-20 % moins cher qu’une
              visite ponctuelle. Pour les VMC gaz collectives, le contrôle annuel est{' '}
              <strong>obligatoire</strong> (Arrêté 30 mai 1989) par installateur agréé Qualigaz.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix entretien VMC en 2026 selon le type</h2>
            <p>
              Le prix de l’entretien dépend essentiellement du type de VMC. Voici les fourchettes
              constatées 2026 (TTC, hors options détartrage / gaines) :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type de VMC</th>
                    <th className="p-3 border-b border-sand-200">Visite</th>
                    <th className="p-3 border-b border-sand-200">Contrat annuel</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Durée</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_ENTRETIEN.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.visite}
                      </td>
                      <td className="p-3 whitespace-nowrap">{row.contrat}</td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.duree}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs nationaux 2026, hors filtres double flux (30-80 €/paire) et hors gros
                entretien. TVA 10 % logement &gt; 2 ans avec artisan.
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

            <h2>Fréquence d’entretien recommandée</h2>
            <p>
              L’ADEME et les fabricants (Aldes, Atlantic, Helios, Brink) convergent sur les
              fréquences suivantes pour préserver la performance et la qualité d’air en 2026 :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {FREQUENCES.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <Calendar className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Vos obligations légales 2026</h2>
            <p>
              L’entretien VMC est encadré par 4 textes principaux qu’un propriétaire ou un bailleur
              doit connaître :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {OBLIGATIONS_LEGALES.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose border-2 border-red-300 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    VMC gaz collective : contrôle annuel obligatoire (Arrêté 30 mai 1989)
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    En copropriété équipée d’une VMC reliée à des appareils gaz, le contrôle annuel
                    par un installateur agréé <strong>Qualigaz</strong> est obligatoire (DSC =
                    Dispositif de Sécurité Collective). Sans ce contrôle, risque d’intoxication au
                    monoxyde de carbone (CO) en cas de défaillance. Responsabilité civile et pénale
                    engagée pour le syndic.
                  </p>
                </div>
              </div>
            </div>

            <h2>5 critères pour choisir un pro</h2>
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
                <Wrench className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis entretien VMC en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 installateurs vérifiés vous répondent sous 48 h. Devis détaillés contrat
                    annuel ou visite ponctuelle, mesure de débits incluse.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/renovation-energetique"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Annuaire installateurs <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Aide au calcul : votre budget en 30 secondes</h2>
            <p>Estimation rapide selon votre type de VMC en 2026 :</p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>VMC simple flux</strong> : visite annuelle ~100 €, contrat annuel ~100-130
                €/an, détartrage tous les 3 ans ~250 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>VMC hygroréglable</strong> : visite annuelle ~150 €, contrat ~140 €/an,
                remplacement bouches tous les 10-15 ans ~200-400 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>VMC double flux</strong> : visite annuelle ~225 €, contrat ~200 €/an,
                filtres 60-160 €/an (2 changes), nettoyage gaines tous les 3 ans ~350 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Coût annuel total double flux 2026</strong> : ~260-360 €/an tout compris, à
                comparer aux ~100-130 €/an d’une simple flux.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> TVA 10
                % automatique avec artisan dans logement &gt; 2 ans (entretien comme installation).
                Pas d’aide MPR/CEE.
              </li>
            </ul>
          </article>

          <SimulateurAideBox
            serviceKey="vmc"
            estimatedSaving={3700}
            title="Remplacer votre VMC ? Estimez vos aides en 3 min"
            subtitle="MaPrimeRénov' (double flux) + CEE Coup de pouce + TVA 5,5 % — éligibilité conditionnée à un artisan RGE Qualibat 8721"
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
              href="/renovation-energetique/travaux/vmc"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub VMC
            </Link>
            <Link
              href="/renovation-energetique/travaux"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Hub Travaux <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
