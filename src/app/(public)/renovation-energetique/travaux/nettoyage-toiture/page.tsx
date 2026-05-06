/**
 * Page : /renovation-energetique/travaux/nettoyage-toiture
 *
 * @kw-primary    prix nettoyage toiture 100 m2
 * @kw-volume     2600
 * @kw-kd         0
 * @kw-cpc        0.98
 * @cluster       3
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster couverture/démoussage)
 * @backlog-item  Levier-G-nettoyage-toiture
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "prix nettoyage toiture 100 m2"   → 2 600 vol, KD 0 ⭐⭐⭐ MEGA EASY pivot
 * - "prix nettoyage toiture"          → 1 800 vol, KD 0
 * - "nettoyage toiture prix"          → 1 600 vol, KD 0
 * - "prix demoussage toiture"         → 1 100 vol, KD 1
 * - "nettoyage de toiture"            → 1 000 vol, KD 3
 * - "demoussage toiture tarif"        →   500 vol, KD 0
 * - Famille cumulée pivot : ~8 600 vol/mois (Travaux.com positionné #1-4)
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * Easy win : MAJEUR (KD 0-3, 0 acteur RGE-first sur SERP, business artisan local)
 * Cluster pillar : Rénovation Énergétique → Travaux → Couverture → Nettoyage / démoussage
 *
 * Anti-cannibalisation :
 *   - /travaux/isolation/toiture = isolation THERMIQUE par l'intérieur
 *     (combles, rampants) — différent métier, différent intent
 *   - Cette page = entretien SURFACE de couverture (mousses, lichens,
 *     hydrofuge). Métier couvreur / spécialiste démoussage. Pas RGE
 *     obligatoire (juste Qualibat 2261-2263 couverture recommandé).
 *
 * YMYL bas-medium : sécurité travail en hauteur (Code Travail R4323-58)
 * + produits biocides (Règlement UE 528/2012). Pas d'aide publique.
 *
 * Cite : INRS R408/R430, Règlement UE 528/2012 biocides, DTU 40,
 * Qualibat 2261-2263, ANSES (produits autorisés), ADEME.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Calendar,
  Droplets,
  HardHat,
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

const PAGE_PATH = '/renovation-energetique/travaux/nettoyage-toiture'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Prix nettoyage toiture 2026 : 100 m² 700-3 000 €'
const DESCRIPTION =
  'Prix nettoyage toiture 100 m² en 2026 : 700-3 000 € selon prestation. Nettoyage 5-15 €/m², démoussage 10-20, hydrofuge 8-18. Sécurité travail en hauteur.'

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
  '4 prestations distinctes : nettoyage (mousses, lichens, débris), démoussage (anti-mousse curatif/préventif), hydrofuge (imperméabilisation), traitement anti-mousse choc.',
  'Prix moyen 2026 toiture 100 m² : nettoyage seul 700-1 500 €, démoussage 1 000-2 000 €, hydrofuge 800-1 800 €, pack complet 2 000-4 000 € TTC.',
  'Fréquence recommandée : nettoyage tous les 5-10 ans (climat humide), tous les 10-15 ans (climat sec). Hydrofuge à refaire tous les 8-12 ans.',
  'Méthode pro : nettoyage manuel ou basse pression < 100 bar (haute pression = décollement tuiles), produits biocides TP 7/8 (Règlement UE 528/2012), travail amorcé en bas-toit pour éviter saletés.',
  'Sécurité : travail en hauteur encadré (Code travail R4323-58), 2ᵉ cause d’accidents mortels du BTP. Échafaudage ou nacelle obligatoire si pente > 25° ou hauteur > 6 m.',
  'Pas d’aide MaPrimeRénov’ ni CEE (pas une rénovation énergétique). TVA 10 % logement > 2 ans avec artisan. Choisir Qualibat 2261-2263 (couverture) avec assurance décennale.',
]

const PRIX_PRESTATIONS = [
  {
    type: 'Nettoyage simple (mousses, débris)',
    prixM2: '5 - 15 €/m²',
    prix100: '500 - 1 500 €',
    duree: '4-8 h',
    note: 'Brossage manuel + jet basse pression. Élimination mousses, lichens, branches, feuilles. Préparation indispensable avant démoussage / hydrofuge.',
  },
  {
    type: 'Démoussage curatif (produit anti-mousse)',
    prixM2: '10 - 20 €/m²',
    prix100: '1 000 - 2 000 €',
    duree: '1-2 jours (pose + temps action)',
    note: 'Application produit biocide (TP 7-8). Action sous 4-8 semaines selon météo. Effet 5-10 ans selon exposition. Souvent associé au nettoyage.',
  },
  {
    type: 'Hydrofuge (imperméabilisation)',
    prixM2: '8 - 18 €/m²',
    prix100: '800 - 1 800 €',
    duree: '1 jour',
    note: 'Application résine ou siloxane sur tuiles propres et sèches. Limite la repousse mousses + ralentit dégradation eau. Effet 8-12 ans.',
  },
  {
    type: 'Pack complet : nettoyage + démoussage + hydrofuge',
    prixM2: '20 - 40 €/m²',
    prix100: '2 000 - 4 000 €',
    duree: '2-3 jours',
    note: 'Le plus rentable au m². Garantie typique 10 ans sur l’hydrofuge. Idéal après 10-15 ans sans entretien ou avant pose panneaux solaires.',
  },
  {
    type: 'Anti-mousse choc (traitement express)',
    prixM2: '4 - 8 €/m²',
    prix100: '400 - 800 €',
    duree: '2-4 h',
    note: 'Pulvérisation produit fort sans brossage. Action rapide mais durée d’effet courte (2-4 ans). Utile en attente d’un pack complet.',
  },
]

const FACTEURS_PRIX = [
  {
    title: 'Surface et pente du toit',
    impact: '×1 à ×2 sur le tarif au m²',
    desc: 'Surface < 100 m² = tarif unitaire +20-30 % (forfait main d’œuvre minimum). Pente > 35° = +30 % (sécurité, harnais ligne de vie obligatoire).',
  },
  {
    title: 'Hauteur et accessibilité',
    impact: '+200 à +800 €',
    desc: 'Hauteur > 6 m = échafaudage roulant (200-400 €) ou nacelle (400-800 €/jour). Accès difficile (jardin clos, voisinage) = supplément manutention.',
  },
  {
    title: 'État de la toiture',
    impact: '×1,5 à ×2 sur le tarif',
    desc: 'Mousses incrustées, lichen massif, encrassement noir profond : double brossage nécessaire. Tuiles cassées à remplacer en cours de chantier (15-30 €/u).',
  },
  {
    title: 'Type de couverture',
    impact: 'Variable',
    desc: 'Tuiles terre cuite : standard. Tuiles béton : -10 % (surface plus lisse). Ardoise : +10-20 % (fragile, technique douce). Zinc/inox : nettoyage spécifique.',
  },
  {
    title: 'Région et saison',
    impact: '±15 %',
    desc: 'Zones humides (Bretagne, Normandie) : entretien plus fréquent et tarifs +10 %. Saison : printemps + automne = haute saison +10-15 % vs été creux.',
  },
]

const SECURITE = [
  {
    title: 'Code du travail R4323-58 à R4323-69',
    desc: 'Le travail en hauteur > 3 m impose : EPI antichute, point d’ancrage testé, garde-corps ou ligne de vie homologuée, formation salarié.',
  },
  {
    title: 'INRS — Recommandations R408 / R430',
    desc: 'Pour intervention en toiture, l’INRS impose : harnais antichute + longe + absorbeur d’énergie, échafaudage roulant ou nacelle si pente > 25°.',
  },
  {
    title: 'Règlement UE 528/2012 biocides (produits anti-mousse)',
    desc: 'Tout produit anti-mousse doit être autorisé Type Produit (TP) 7 (préservation films / dépôts) ou TP 8 (préservation matériaux) selon le Règlement européen biocides 528/2012. Liste ANSES officielle.',
  },
  {
    title: 'Pas de nettoyeur haute pression > 100 bar',
    desc: 'La haute pression décolle les tuiles, fragilise les jointures et abime la couche superficielle de protection. Nettoyage doit se faire à pression douce (< 100 bar) ou manuel.',
  },
]

const QUI_CHOISIR = [
  {
    title: 'Qualibat 2261-2263 (couverture) avec décennale',
    must: 'Recommandé',
    desc: 'Le label Qualibat 2261-2263 atteste de la qualification professionnelle du couvreur. Demandez le numéro + attestation décennale en cours de validité.',
  },
  {
    title: 'Assurance RC pro travail en hauteur',
    must: 'Obligatoire',
    desc: 'Toute intervention sur toiture exige une assurance RC pro spécifique travail en hauteur. Sans cette assurance, en cas d’accident, votre responsabilité civile peut être engagée.',
  },
  {
    title: 'Démoussage avec produit biocide autorisé ANSES',
    must: 'Obligatoire',
    desc: 'Le produit biocide doit figurer sur la liste ANSES des biocides autorisés en France (TP 7 ou TP 8). Demandez la fiche technique avec numéro AMM.',
  },
  {
    title: 'Hydrofuge avec garantie ≥ 10 ans',
    must: 'Recommandé',
    desc: 'L’hydrofuge sérieux (résine acrylique siloxane) doit être garanti 10 ans minimum. Méfiez-vous des hydrofuges low-cost garantis 2-3 ans seulement.',
  },
  {
    title: 'Devis détaillé en 5 lignes minimum',
    must: 'Obligatoire',
    desc: 'Devis obligatoirement détaillé : surface, prestation, marque produit, garantie, méthode (échafaudage/nacelle), main-d’œuvre. Pas de "forfait global" opaque.',
  },
]

const faqs = [
  {
    question: 'Combien coûte le nettoyage d’une toiture de 100 m² en 2026 ?',
    answer:
      'Selon la prestation : nettoyage simple 700-1 500 € TTC, démoussage curatif 1 000-2 000 €, hydrofuge 800-1 800 €, pack complet (les trois) 2 000-4 000 €. Pour une toiture standard tuile terre cuite, comptez 20-30 €/m² pour un pack complet bien réalisé. Les tarifs varient ±20 % selon la région (humidité, accessibilité).',
  },
  {
    question: 'Nettoyage, démoussage, hydrofuge : quelle différence ?',
    answer:
      'Trois étapes complémentaires : (1) nettoyage = élimination mécanique des mousses, lichens, débris (manuel + jet basse pression), (2) démoussage = application d’un produit biocide TP 7/8 qui détruit les spores et empêche la repousse 5-10 ans, (3) hydrofuge = application d’une résine imperméabilisante qui ralentit la dégradation par l’eau et la repousse. Pour une toiture jamais entretenue, faire les 3 successivement (pack complet) est le plus rentable.',
  },
  {
    question: 'À quelle fréquence faut-il nettoyer une toiture ?',
    answer:
      'En climat sec (sud, sud-est) : tous les 10-15 ans. En climat humide (Bretagne, Normandie, montagne) : tous les 5-10 ans. Pour l’hydrofuge, refaire tous les 8-12 ans selon la qualité du produit et l’exposition. Une toiture entretenue régulièrement dure 60-80 ans (vs 40-50 ans non entretenue). L’hydrofuge prolonge la durée de 10-20 ans.',
  },
  {
    question: 'Le nettoyeur haute pression est-il dangereux pour la toiture ?',
    answer:
      'OUI. Une haute pression (> 100 bar) décolle les tuiles, abîme les jointures et arrache la couche superficielle de protection. Conséquences : infiltrations rapides, durée de vie de la toiture divisée par 2, micro-fissures invisibles. La méthode pro 2026 : nettoyage manuel (brosse), jet basse pression (< 100 bar), parfois lance télescopique. Pour les zones très encrassées : produit anti-mousse choc + brossage manuel.',
  },
  {
    question: 'Y a-t-il des aides ou subventions pour nettoyer une toiture ?',
    answer:
      'NON. Le nettoyage de toiture n’est éligible à aucune aide publique : pas de MaPrimeRénov’ ni de CEE (pas une rénovation thermique). Seule TVA 10 % s’applique si pose par un artisan dans un logement de plus de 2 ans. Pour bénéficier des aides : combiner avec une rénovation thermique (isolation toiture + démoussage par exemple) — l’isolation devient éligible MPR/CEE, le nettoyage reste à votre charge.',
  },
  {
    question: 'Peut-on nettoyer une toiture soi-même ?',
    answer:
      'Techniquement oui, mais c’est dangereux : le travail en hauteur > 3 m est encadré (Code travail R4323-58) et exige harnais, ligne de vie, formation. Le risque de chute est la 2ᵉ cause d’accidents mortels du BTP. Pour une toiture < 3 m (cabanon, hangar bas), si vous êtes équipé EPI : possible. Sinon, faites appel à un pro Qualibat 2261-2263 : le coût est largement justifié par la sécurité et la qualité du résultat.',
  },
  {
    question: 'Quels produits anti-mousse sont autorisés ?',
    answer:
      'Les produits anti-mousse pour toiture doivent être autorisés au titre du Règlement européen 528/2012 (biocides) en Type Produit (TP) 7 « préservation des films / dépôts » ou TP 8 « préservation des matériaux ». La liste officielle des produits autorisés en France est tenue par l’ANSES (anses.fr/biocides). Évitez les produits non listés ou importés sans autorisation française. Demandez à l’artisan la fiche technique avec numéro AMM.',
  },
  {
    question: 'Faut-il faire ce nettoyage avant ou après les panneaux solaires ?',
    answer:
      'Toujours AVANT. Une toiture encrassée, mal hydrofugée ou avec mousses fragilisée ne pourra pas accueillir correctement des panneaux solaires (étanchéité à risque, fissures sous le poids). De plus, faire le nettoyage et l’hydrofuge AVANT les panneaux : (1) protège la toiture pour les 10-15 prochaines années, (2) évite de devoir tout démonter pour entretenir plus tard, (3) prolonge la durée de vie de l’investissement PV. Coût en 2026 : 2 000-4 000 € en pack complet, à amortir sur la durée de l’installation solaire.',
  },
]

const sources = [
  {
    label: 'INRS — Travail en hauteur, recommandations R408 / R430',
    url: 'https://www.inrs.fr/risques/chutes-hauteur',
  },
  {
    label: 'Légifrance — Code du travail R4323-58 à R4323-69',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018532034/',
  },
  {
    label: 'Règlement UE 528/2012 — biocides (Types Produit 7 et 8)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32012R0528',
  },
  {
    label: 'ANSES — liste des biocides autorisés en France',
    url: 'https://www.anses.fr/fr/content/biocides',
  },
  {
    label: 'Qualibat — référentiels 2261-2263 couverture',
    url: 'https://www.qualibat.com',
  },
  {
    label: 'AFNOR / DTU 40.1 à 40.5 — couvertures (tuiles, ardoise, zinc)',
    url: 'https://www.boutique.afnor.org',
  },
  { label: 'ADEME — Entretien toiture et bâtiments', url: 'https://librairie.ademe.fr' },
]

const relatedPages = [
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
  },
  {
    label: 'Isolation toiture (combles + rampants)',
    href: '/renovation-energetique/travaux/isolation/toiture',
  },
  {
    label: 'Fenêtre de toit Velux',
    href: '/renovation-energetique/travaux/menuiseries/fenetre-de-toit',
  },
  {
    label: 'Nettoyage panneau solaire (entretien post-PV)',
    href: '/renovation-energetique/travaux/solaire/nettoyage',
  },
  {
    label: 'Trouver un couvreur RGE Qualibat 2261-2263',
    href: '/rge/couvreur',
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
    section: 'Travaux — Couverture — Nettoyage / démoussage',
    keywords: [
      'prix nettoyage toiture',
      'prix nettoyage toiture 100 m2',
      'prix démoussage toiture',
      'nettoyage de toiture',
      'démoussage toiture tarif',
      'hydrofuge toiture',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Nettoyage toiture', url: PAGE_PATH },
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
              { label: 'Nettoyage toiture' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              Couverture &middot; Nettoyage / démoussage
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix nettoyage toiture en 2026 (100 m²) : nettoyage, démoussage, hydrofuge
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Pour une toiture de <strong>100 m²</strong> en 2026, comptez{' '}
              <strong>700 à 1 500 €</strong> pour un nettoyage simple,{' '}
              <strong>1 000-2 000 €</strong> pour un démoussage curatif,{' '}
              <strong>800-1 800 €</strong> pour un hydrofuge, et <strong>2 000-4 000 €</strong> pour
              un pack complet (les trois). Travail en hauteur encadré (Code Travail R4323-58) :
              faites appel à un couvreur Qualibat 2261-2263 avec assurance décennale et RC pro.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>5 prestations distinctes : ne pas confondre</h2>
            <p>
              Quatre prestations distinctes sont souvent regroupées sous « nettoyage de toiture ».
              Comprendre leur différence évite de payer pour ce dont vous n’avez pas besoin :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Prestation</th>
                    <th className="p-3 border-b border-sand-200">Prix au m²</th>
                    <th className="p-3 border-b border-sand-200">Toiture 100 m²</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Durée</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_PRESTATIONS.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 whitespace-nowrap">{row.prixM2}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix100}
                      </td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.duree}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs nationaux 2026, hors options (remplacement tuiles 15-30 €/u, dépose cheminée,
                faîtage). TVA 10 % sur logement &gt; 2 ans.
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

            <h2>Sécurité : 4 règles obligatoires en toiture</h2>
            <p>
              Le travail en toiture est <strong>la 2ᵉ cause d’accidents mortels du BTP</strong> en
              France. Les règles ci-dessous ne sont pas optionnelles :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {SECURITE.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <HardHat className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Pas de nettoyeur haute pression &gt; 100 bar : décollement tuiles garanti.
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    La haute pression abîme la couche de protection des tuiles, fragilise les
                    jointures et accélère la dégradation. Conséquence : durée de vie de la toiture
                    divisée par 2 et infiltrations rapides. La méthode pro 2026 = brossage manuel +
                    jet basse pression (&lt; 100 bar) + produit anti-mousse autorisé ANSES.
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
                  <ShieldCheck className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
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
                <Calendar className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis nettoyage de toiture en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 couvreurs Qualibat 2261-2263 vérifiés vous répondent sous 48 h. Devis
                    détaillés + comparatif des 3 prestations (nettoyage / démoussage / hydrofuge).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/couvreur"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Annuaire couvreurs <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Quand programmer le nettoyage ?</h2>
            <p>
              Trois moments sont particulièrement pertinents en 2026 pour planifier un nettoyage /
              démoussage / hydrofuge :
            </p>
            <ul>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Avant la pose de panneaux solaires</strong> : protège l’étanchéité 10-15
                ans, évite démontage ultérieur
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Avant un projet de vente immobilière</strong> : valorise le bien, élément
                positif au DPE et à l’audit énergétique
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Couplé avec isolation toiture</strong> (si combles aménageables) : optimise
                la durée de chantier et réduit les coûts d’échafaudage
              </li>
            </ul>

            <h2>Aide au calcul : votre budget en 30 secondes</h2>
            <p>Estimation rapide selon votre toiture (méthode 2026, fourchettes nationales) :</p>
            <ul>
              <li>
                <Droplets className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Toit{' '}
                <strong>60 m²</strong> standard tuile : pack complet ~1 200-2 400 €
              </li>
              <li>
                <Droplets className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Toit{' '}
                <strong>100 m²</strong> standard : pack complet ~2 000-4 000 €
              </li>
              <li>
                <Droplets className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Toit{' '}
                <strong>150 m²</strong> standard : pack complet ~3 000-6 000 €
              </li>
              <li>
                <Wrench className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Majoration
                pente &gt; 35° ou hauteur &gt; 6 m : +20-30 %
              </li>
              <li>
                <Wrench className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Majoration
                ardoise / zinc : +10-20 % vs tuile terre cuite
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> TVA 10
                % automatique avec artisan dans logement &gt; 2 ans
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
              href="/renovation-energetique/travaux"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Travaux
            </Link>
            <Link
              href="/rge/couvreur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Couvreurs Qualibat 2261-2263 <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
