/**
 * Page : /renovation-energetique/travaux/menuiseries/fenetre-de-toit
 *
 * @kw-primary    prix velux
 * @kw-volume     1700
 * @kw-kd         1
 * @kw-cpc        0.08
 * @cluster       3
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3)
 * @backlog-item  Levier-D-fenetre-de-toit
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "prix velux"     → 1 700 vol, KD 1 (Travaux.com #8)
 * - "velux prix"     → 1 600 vol, KD 2 (Travaux.com #9)
 * - "pose velux"     → 1 200 vol, KD 1 (Travaux.com #9)
 * - "velux pvc"      →   600 vol, KD 1 (Travaux.com #7)
 * - "fenetre de toit" → ~600 vol estimé (générique non-marque)
 * - Famille cumulée pivot : ~5 700 vol/mois (cluster Velux/fenêtre de toit)
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * Easy win : OUI (KD 1-2, Travaux.com positionné mais content thin)
 * Cluster pillar : Rénovation Énergétique → Travaux → Menuiseries → Fenêtre de toit
 *
 * Anti-cannibalisation :
 *   - Hub /travaux/menuiseries = fenêtres verticales + portes (PVC/alu/bois)
 *   - /travaux/fenetres-double-vitrage = vitrage transactionnel "double vitrage"
 *   - Cette page = fenêtre de TOIT spécifiquement (Velux marque + concurrents
 *     Fakro/Roto). Particularités : étanchéité DTU 40.29, raccordement EDPV,
 *     forfaits MPR/CEE BAR-EN-104 spécifiques pose en toiture.
 *
 * Velux est marque déposée (Velux Group, Danemark) — usage encadré : on cite
 * la marque mais on rappelle systématiquement les alternatives Fakro/Roto et
 * le terme générique « fenêtre de toit » dans les Hn et meta.
 *
 * YMYL : aides + sécurité étanchéité couverture. Cite Légifrance, ADEME,
 * DTU 40.29, fiche FOS BAR-EN-104, AFNOR.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Sun,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Ruler,
  Layers,
  Euro,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/menuiseries/fenetre-de-toit'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Fenêtre de toit Velux 2026 : prix, pose, aides'
const DESCRIPTION =
  'Fenêtre de toit Velux 2026 : 600-2 500 € posée selon type. Aides MPR + CEE BAR-EN-104 jusqu’à 100 €/u. Étanchéité DTU 40.29.'

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
  'Fenêtre de toit (Velux, Fakro, Roto) : 600 à 2 500 € posée selon type, taille et motorisation.',
  'Velux pèse environ 80 % du marché français. Le terme générique reste « fenêtre de toit ».',
  'Manuel : 600-1 200 €. Électrique : 1 200-1 800 €. Solaire (Velux Integra) : 1 500-2 500 €.',
  'Aides MPR/CEE BAR-EN-104 si remplacement avec Uw ≤ 1,3 W/m².K (verre + cadre + raccord) : forfait MPR 40-100 €/u, CEE 60-100 kWhc/m².',
  'Pose obligatoirement raccordée EDPV (Écran de Sous-Toiture HPV) selon DTU 40.29 — sinon fuites garanties.',
  'Garantie décennale couvre l’étanchéité 10 ans. Assurance dommage-ouvrage recommandée pour rénovation lourde de toiture.',
]

const TYPES_FENETRE_TOIT = [
  {
    type: 'Manuelle (rotation ou projection)',
    prix: '300-650 € équipement',
    pose: '300-600 €',
    total: '600-1 200 € TTC',
    usage: 'Combles aménagés courants, accès facile, sans motorisation. Modèle entrée de gamme.',
  },
  {
    type: 'Électrique 230 V',
    prix: '700-1 100 € équipement',
    pose: '500-700 €',
    total: '1 200-1 800 € TTC',
    usage: 'Combles hauts ou hors d’atteinte. Télécommande, capteur de pluie automatique.',
  },
  {
    type: 'Solaire (Velux Integra) ou domotique',
    prix: '900-1 600 € équipement',
    pose: '600-900 €',
    total: '1 500-2 500 € TTC',
    usage: 'Pas d’alimentation 230 V à tirer. Compatible Apple HomeKit / Google Home.',
  },
  {
    type: 'Verrière de toit / fenêtre balcon (Velux Cabrio)',
    prix: '2 500-5 000 € équipement',
    pose: '1 500-2 500 €',
    total: '4 000-7 500 € TTC',
    usage: 'Loft, transformation grenier en pièce de vie, double fonction balcon ouvrant.',
  },
]

const POSTES_DEVIS = [
  { label: 'Fenêtre de toit (verre + cadre)', range: '300 - 1 600 €' },
  { label: 'Raccord d’étanchéité EDPV (couleur tuile/ardoise)', range: '120 - 250 €' },
  { label: 'Pose (dépose tuiles + chevêtre + scellement)', range: '300 - 700 €' },
  {
    label: 'Modification charpente (chevêtre bois si dimensions hors gabarit)',
    range: '200 - 600 €',
  },
  { label: 'Habillage intérieur (gaines, retours plâtre)', range: '150 - 400 €' },
  { label: 'Volet roulant extérieur (option, gros gain thermique)', range: '450 - 900 €' },
  { label: 'Store occultant intérieur (option)', range: '60 - 200 €' },
  {
    label: 'Frais de raccordement électrique (modèle 230 V uniquement)',
    range: '150 - 400 €',
  },
]

const AIDES_TABLE = [
  {
    profil: 'Très modestes (bleu)',
    mpr: '100 €/équipement',
    cee: '60-100 kWhc/m² (~80-130 €/u)',
    rac: '~480-1 200 € après aides',
  },
  {
    profil: 'Modestes (jaune)',
    mpr: '80 €/équipement',
    cee: '60-100 kWhc/m² (~80-130 €/u)',
    rac: '~520-1 250 € après aides',
  },
  {
    profil: 'Intermédiaires (violet)',
    mpr: '0 € (forfait par geste supprimé depuis 2024)',
    cee: '60-100 kWhc/m² (~80-130 €/u)',
    rac: '~600-1 350 €. Passer par Parcours accompagné > 25 % gains',
  },
  {
    profil: 'Supérieurs (rose)',
    mpr: '0 € (forfait par geste supprimé)',
    cee: '60-100 kWhc/m² (~80-130 €/u)',
    rac: '~600-1 400 €. Éco-PTZ jusqu’à 7 000 € seul équipement',
  },
]

const PIEGES = [
  {
    title: 'Pose sans EDPV homologué = fuites garanties',
    impact: '+1 500 à 5 000 € (réfection toiture)',
    desc: 'L’étanchéité repose sur le raccord pré-formé (EDPV) fourni par le fabricant, posé selon DTU 40.29. Une pose sans EDPV ou avec un raccord générique entraîne des infiltrations sous 1-3 ans. Vérifiez sur devis : référence du raccord (ex Velux EDW pour ardoises, EDP pour tuiles).',
  },
  {
    title: 'Uw du verre seul ≠ Uw fenêtre complète',
    impact: 'Refus aides MPR/CEE',
    desc: 'La fiche FOS BAR-EN-104 exige Uw ≤ 1,3 W/m².K pour la fenêtre COMPLÈTE (verre + cadre + raccord). Certains revendeurs affichent l’Ug du vitrage seul (~1,0). Demandez la fiche technique du fabricant avec la mention « Uw fenêtre complète ».',
  },
  {
    title: 'Démolition couverture sous-estimée',
    impact: '+300 à 1 200 €',
    desc: 'L’ouverture du toit pour percer le chevêtre nécessite parfois la dépose de tuiles et la modification d’une chevron. Devis low-cost « pose seule » 200 € = quasi-systématiquement complétés en cours de chantier (avenant). Demander un devis incluant la dépose et la repose intégrales des tuiles à l’unité.',
  },
  {
    title: 'Surchauffe en été non anticipée',
    impact: 'Inconfort + climatisation +30 %',
    desc: 'Une fenêtre de toit exposée sud sans protection (volet ou store occultant extérieur) augmente la température de la pièce de 5-8 °C en été. Toujours prévoir un volet roulant extérieur (450-900 €) ou un store extérieur (200-400 €) — protection thermique 7 fois plus efficace qu’un store intérieur.',
  },
  {
    title: 'Modèle « tout compris à 1 500 € » sans détail',
    impact: 'Risque devis dérivant',
    desc: 'Vrai devis transparent : fenêtre référencée + raccord + pose + dépose + habillage + raccord électrique. Devis avec un seul forfait global = appelez 2 devis concurrents. Écart typique entre 3 devis : 20-35 % à configuration équivalente.',
  },
]

const ALTERNATIVES_VELUX = [
  {
    marque: 'Velux',
    pdm: '~80 % France',
    usp: 'Leader, SAV étendu, raccords EDPV/EDW/EDP/EDS, modèles solaires Integra.',
    note: 'Prix +10-15 % vs concurrents. Délai dispo court.',
  },
  {
    marque: 'Fakro',
    pdm: '~10 % France',
    usp: 'Polonais, gamme proche Velux à -10 %, raccords compatibles, garantie 10 ans.',
    note: 'Réseau pose moins dense, vérifier disponibilité raccord en région.',
  },
  {
    marque: 'Roto',
    pdm: '~5 % France',
    usp: 'Allemand, ouverture par projection (mieux pour grandes hauteurs), Uw ≤ 1,1.',
    note: 'Tarifs alignés Velux, distribution Leroy Merlin / Lapeyre.',
  },
  {
    marque: 'Optilight (Fakro)',
    pdm: '~3 %',
    usp: 'Entrée de gamme accessible 250-400 €, bon Uw 1,3 W/m².K compatible aides.',
    note: 'Modèles manuels uniquement, raccords basiques.',
  },
]

const faqs = [
  {
    question: 'Combien coûte une fenêtre de toit Velux en 2026 ?',
    answer:
      'Entre 600 et 2 500 € TTC posée selon le type. Manuelle : 600-1 200 €. Électrique 230 V : 1 200-1 800 €. Solaire (Velux Integra) ou domotique : 1 500-2 500 €. Verrière (Velux Cabrio fenêtre-balcon) : 4 000-7 500 €. Le prix inclut la fenêtre, le raccord d’étanchéité (EDPV), la pose, la dépose des tuiles, l’habillage intérieur. Compter 2-3 devis pour comparer (écart typique 20-35 %).',
  },
  {
    question: 'Velux est une marque ou un nom générique ?',
    answer:
      'Velux est une marque déposée (groupe Velux, Danemark, fondé 1941) qui domine ~80 % du marché français des fenêtres de toit. Le terme générique reste « fenêtre de toit ». Concurrents : Fakro (Pologne), Roto (Allemagne), Optilight. Les raccords d’étanchéité (EDPV) ne sont généralement pas interchangeables entre marques — vérifiez la compatibilité avant remplacement.',
  },
  {
    question: 'Les fenêtres de toit sont-elles éligibles MaPrimeRénov’ ?',
    answer:
      'Oui, sous condition : la fenêtre complète (verre + cadre + raccord) doit afficher un Uw ≤ 1,3 W/m².K (fiche FOS BAR-EN-104). Le forfait MaPrimeRénov’ par geste 2026 : 100 €/équipement (très modeste, bleu), 80 € (modeste, jaune), 0 € pour les revenus intermédiaires/supérieurs (supprimé depuis 2024). Cumul Coup de pouce CEE : 60-100 kWhc/m² selon zone climatique (~80-130 € par fenêtre). Eco-PTZ jusqu’à 7 000 € si geste seul.',
  },
  {
    question: 'Quelles dimensions standard chez Velux ?',
    answer:
      'Velux utilise des codes de dimensions : CK02 (55×78 cm), CK04 (55×98 cm), MK04 (78×98 cm), MK06 (78×118 cm), MK08 (78×140 cm), SK06 (114×118 cm), SK08 (114×140 cm). Les modèles les plus posés en rénovation : MK04, MK06, SK06. Pour des dimensions hors gabarit (verrières, ouverture pleine), prévoir une modification de la charpente (chevêtre bois) +200-600 €.',
  },
  {
    question: 'Combien coûte la pose seule d’une Velux ?',
    answer:
      'La pose seule (sans fourniture) coûte 300 à 700 € selon la complexité : dépose des tuiles ou ardoises, percement du chevêtre, scellement de l’EDPV (raccord d’étanchéité), repose de la couverture, habillage intérieur. Pour une pose électrique 230 V, prévoir +150-400 € pour l’alimentation. Choisir un couvreur ou menuisier titulaire d’une assurance décennale et idéalement RGE.',
  },
  {
    question: 'Quels risques en cas de mauvaise pose ?',
    answer:
      'Les fuites sont le risque majeur (1-3 ans après pose si EDPV mal posé) : infiltrations dans l’isolation, moisissures, dégâts sur la charpente. Coût de réparation 1 500-5 000 €. La garantie décennale (assurance obligatoire de l’artisan) couvre l’étanchéité 10 ans à compter de la réception. Pour une rénovation lourde de toiture, souscrire une assurance dommage-ouvrage (~3-5 % du coût des travaux) accélère l’indemnisation.',
  },
  {
    question: 'Manuel, électrique ou solaire : que choisir ?',
    answer:
      'Manuel : combles bas accessibles, budget limité, robuste 30+ ans (600-1 200 €). Électrique 230 V : combles hauts hors d’atteinte, capteur pluie automatique (1 200-1 800 €), nécessite alimentation à proximité. Solaire (Velux Integra) : pas de tirage électrique, idéal en rénovation où l’alimentation est complexe (1 500-2 500 €). Pour combles habités exposés sud, ajouter systématiquement un volet roulant extérieur solaire (450-900 €).',
  },
  {
    question: 'Comment être sûr de l’éligibilité aux aides ?',
    answer:
      'Trois conditions cumulatives : (1) Uw ≤ 1,3 W/m².K sur la fenêtre complète (fiche technique fabricant à conserver), (2) artisan RGE pour la pose (Qualibat 3511 ou équivalent menuiserie), (3) logement principal achevé depuis plus de 15 ans (achevé > 2 ans pour Coup de pouce CEE). Validation préalable possible via france-renov.gouv.fr ou un Conseiller France Rénov’. Sans ces 3 conditions, ni MaPrimeRénov’ ni CEE ne sont accordés.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Forfaits MaPrimeRénov’ fenêtres 2026',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  {
    label: 'Fiche FOS BAR-EN-104 — fenêtres et porte-fenêtres (DGEC)',
    url: 'https://www.ecologie.gouv.fr/dispositif-des-certificats-deconomies-denergie',
  },
  { label: 'AFNOR / DTU 40.29 — Pose des fenêtres de toit', url: 'https://www.boutique.afnor.org' },
  {
    label: 'Légifrance — Décret CEE arrêté valeurs forfaitaires BAR-EN-104',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'ADEME — Guide isolation toiture par l’intérieur', url: 'https://librairie.ademe.fr' },
  {
    label: 'CSTB — Avis techniques fenêtres de toit (Velux, Fakro, Roto)',
    url: 'https://www.cstb.fr/atec',
  },
]

const relatedPages = [
  {
    label: 'Hub Menuiseries (PVC, alu, bois — fenêtres verticales)',
    href: '/renovation-energetique/travaux/menuiseries',
  },
  {
    label: 'Fenêtres double vitrage : prix et performances Uw',
    href: '/renovation-energetique/travaux/fenetres-double-vitrage',
  },
  {
    label: 'Isolation toiture : combles + rampants',
    href: '/renovation-energetique/travaux/isolation/toiture',
  },
  {
    label: 'Isolation des combles aménagés ou perdus',
    href: '/renovation-energetique/travaux/isolation/combles',
  },
  {
    label: 'CEE — Certificats d’Économie d’Énergie 2026',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
  },
  {
    label: 'Trouver un menuisier ou couvreur RGE',
    href: '/rge/menuisier',
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
    section: 'Travaux — Menuiseries — Fenêtre de toit',
    keywords: [
      'prix Velux',
      'fenêtre de toit',
      'pose Velux',
      'Velux PVC',
      'fenêtre de toit MaPrimeRénov',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Menuiseries', url: '/renovation-energetique/travaux/menuiseries' },
    { name: 'Fenêtre de toit (Velux)', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Aides 2026 fenêtre de toit (BAR-EN-104)',
    description:
      'MaPrimeRénov’ par geste + Coup de pouce CEE BAR-EN-104 pour le remplacement de fenêtres de toit avec Uw ≤ 1,3 W/m².K, posé par un artisan RGE.',
    url: PAGE_URL,
    serviceType: 'Aide à la rénovation énergétique — fenêtre de toit',
    audience:
      'Propriétaires occupants ou bailleurs, logement principal achevé depuis plus de 15 ans',
    temporalCoverage: '2026-01-01/2026-12-31',
    serviceOperator: {
      name: "Agence nationale de l'habitat (Anah)",
      url: 'https://www.anah.gouv.fr/',
    },
    sameAs: [
      'https://france-renov.gouv.fr/aides/maprimerenov',
      'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
    ],
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema].filter(
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
              { label: 'Menuiseries', href: '/renovation-energetique/travaux/menuiseries' },
              { label: 'Fenêtre de toit (Velux)' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sun className="w-3.5 h-3.5" aria-hidden />
              Fenêtre de toit &middot; Velux 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Fenêtre de toit Velux en 2026 : prix, pose et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, une fenêtre de toit (Velux, Fakro, Roto) coûte entre{' '}
              <strong>600 et 2 500 € TTC posée</strong> selon le type (manuel, électrique, solaire).
              Avec un Uw ≤ 1,3 W/m².K et un artisan RGE, vous cumulez{' '}
              <strong>MaPrimeRénov’ + Coup de pouce CEE BAR-EN-104</strong> jusqu’à ~230 € par
              équipement. Voici la grille de prix par type, la décomposition d’un devis, les pièges
              à éviter et les alternatives à Velux.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>4 types de fenêtre de toit, 4 budgets</h2>
            <p>
              Le marché 2026 distingue quatre catégories selon le mécanisme d’ouverture et la
              motorisation. Le <strong>manuel à rotation</strong> reste le plus courant en
              rénovation ; le <strong>solaire (Velux Integra)</strong> simplifie la pose en évitant
              le tirage électrique 230 V.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Équipement</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Pose</th>
                    <th className="p-3 border-b border-sand-200">Total TTC</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Usage</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {TYPES_FENETRE_TOIT.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 whitespace-nowrap">{row.prix}</td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.pose}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.total}
                      </td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes nationales 2026, hors options (volet roulant +450-900 €, store +60-200
                €). Sources : grille tarifs Velux + baromètre artisans Qualibat 3511 menuisiers.
              </p>
            </div>

            <h2>Décomposition d’un devis fenêtre de toit</h2>
            <p>
              Un devis transparent doit détailler chaque ligne. Voici la structure type d’un devis{' '}
              <strong>Velux MK06 manuel posé en rénovation tuile</strong> (cas standard) :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6">
              <ul className="divide-y divide-sand-100">
                {POSTES_DEVIS.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 p-3 text-sm"
                  >
                    <span className="text-sand-800">{row.label}</span>
                    <span className="font-semibold text-primary-800 whitespace-nowrap">
                      {row.range}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-sand-500 p-3 border-t border-sand-100">
                TVA 5,5 % avec artisan RGE pour les remplacements éligibles BAR-EN-104. Sinon TVA 10
                % sur logement &gt; 2 ans, ou 20 % sur logement neuf.
              </p>
            </div>

            <h2>Aides 2026 : MaPrimeRénov’ + CEE BAR-EN-104</h2>
            <p>
              Le remplacement d’une fenêtre de toit est éligible aux aides{' '}
              <strong>
                uniquement si la fenêtre complète (verre + cadre + raccord) affiche un Uw ≤ 1,3
                W/m².K
              </strong>{' '}
              (fiche FOS BAR-EN-104, DGEC). Vous pouvez cumuler{' '}
              <strong>MaPrimeRénov’ par geste</strong> + <strong>Coup de pouce CEE</strong> + TVA
              5,5 %.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">Coup de pouce CEE</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">RAC*</th>
                  </tr>
                </thead>
                <tbody>
                  {AIDES_TABLE.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3">{row.mpr}</td>
                      <td className="p-3">{row.cee}</td>
                      <td className="p-3 hidden md:table-cell">{row.rac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                *Reste à charge calculé sur Velux MK06 manuel à 850 € TTC posé. La fiche BAR-EN-104
                forfait CEE varie selon zone H1/H2/H3 et taille fenêtre. Vérifier montants exacts
                sur france-renov.gouv.fr.
              </p>
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Pas de prime sans Uw ≤ 1,3 W/m².K SUR LA FENÊTRE COMPLÈTE.
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    Méfiance : certains revendeurs affichent l’Ug du vitrage seul (~1,0 W/m².K) qui
                    est NON pertinent. Demandez la fiche technique du fabricant indiquant{' '}
                    <strong>Uw fenêtre complète</strong> (verre + cadre + raccord). Sans cette
                    valeur, MaPrimeRénov’ et le CEE peuvent être refusés au moment du dépôt.
                  </p>
                </div>
              </div>
            </div>

            <h2>5 pièges à éviter sur le devis</h2>
            <div className="not-prose grid gap-3 my-6">
              {PIEGES.map((piege) => (
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

            <h2>Velux ou un concurrent ? 4 marques comparées</h2>
            <p>
              Velux domine ~80 % du marché français mais 3 concurrents sérieux sont distribués en
              France. Les{' '}
              <strong>raccords d’étanchéité ne sont généralement pas interchangeables</strong> entre
              marques — vérifiez avant remplacement.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Marque</th>
                    <th className="p-3 border-b border-sand-200">PDM France</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">USP</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {ALTERNATIVES_VELUX.map((row) => (
                    <tr key={row.marque} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.marque}</td>
                      <td className="p-3 whitespace-nowrap">{row.pdm}</td>
                      <td className="p-3 hidden md:table-cell">{row.usp}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Estimations parts de marché 2024-2025 (source : Velux Group annual report + presse
                spécialisée).
              </p>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis fenêtre de toit en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 menuisiers / couvreurs RGE vérifiés vous répondent sous 48 h. Devis détaillés
                    + simulation aides MPR / CEE intégrée.
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

            <h2>Comment comparer 3 devis efficacement</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Référence du modèle</strong> (ex Velux MK06 GPL ou GGL Solar) explicite, pas
                « équivalent »
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Uw fenêtre complète</strong> indiqué (≤ 1,3 W/m².K pour aides BAR-EN-104)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Référence de l’EDPV</strong> (raccord d’étanchéité) compatible avec votre
                couverture (tuile, ardoise, zinc)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Numéro Qualibat 3511</strong> (menuiseries extérieures) ou 8211 (couverture)
                + assurance décennale
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Garanties</strong> : décennale 10 ans + garantie fabricant (Velux 10 ans
                pièces, 5 ans motorisation)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Détail dépose / repose</strong> tuiles à l’unité (pas de forfait global
                opaque)
              </li>
            </ul>

            <h2>Et si la fenêtre est posée sur des combles non aménagés ?</h2>
            <p>
              Le percement d’une fenêtre de toit dans des combles perdus (non aménagés) est possible
              mais nécessite une <strong>étude préalable de la charpente</strong> (chevron à
              modifier) et n’est éligible aux aides{' '}
              <strong>que si la pièce est rendue habitable</strong> (isolation des rampants,
              chauffage). Si vous comptez aménager les combles, profitez-en pour combiner : fenêtre
              de toit + isolation rampants (BAR-EN-101) + plancher chauffant. Le pack d’aides
              cumulées peut atteindre 4 000-7 000 € pour un foyer modeste.
            </p>

            <h2>Économies sur la facture de chauffage</h2>
            <p>
              Le remplacement d’une fenêtre de toit ancienne (simple vitrage, Uw ≥ 3,5) par un
              modèle moderne (double vitrage Uw 1,1) limite les déperditions de 60-70 % sur cette
              ouverture. Ordre de grandeur :
            </p>
            <ul>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Économie
                annuelle : 30-80 € par fenêtre remplacée (selon zone climatique)
              </li>
              <li>
                <Euro className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> ROI travaux
                seuls : 12-20 ans (long, mais confort et acoustique gagnés immédiatement)
              </li>
              <li>
                <Ruler className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> ROI dans le
                cadre d’une rénovation globale (toiture + isolation rampants) : 5-10 ans
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
              href="/renovation-energetique/travaux/menuiseries"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Menuiseries
            </Link>
            <Link
              href="/rge/menuisier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Menuisiers RGE <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
