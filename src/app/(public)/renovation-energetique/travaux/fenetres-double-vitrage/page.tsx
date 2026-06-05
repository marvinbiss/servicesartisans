/**
 * Page : /renovation-energetique/travaux/fenetres-double-vitrage
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "double vitrage"               → 4 636 vol, KD 1, CPC $0,60, clicks 4 081 ⭐⭐ JACKPOT
 * - "fenetre double vitrage"       → 1 937 vol, KD 4, CPC $1,00, clicks 1 910 ⭐⭐
 * - "prix double vitrage"          → 422 vol, KD 1, CPC $0,70 ⭐
 * - "double vitrage prix"          → variant
 * - "fenetre double vitrage prix"  → longue traîne
 * - Famille cumulée pivot : ~7 500 vol/mois (KD 1-4 = MEGA EASY WIN)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MAJEUR (KD 1 sur "double vitrage" 4 636 vol — meilleur ratio vol/KD de Vague B)
 *            Concurrence Lapeyre, Tryba, K par K (pages produits) + comparateurs
 *            Atout SA : focus performance Up + aides limitées (Parcours accompagné uniquement)
 * Cluster pillar : Rénovation Énergétique → Travaux → Fenêtres double vitrage
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  ThermometerSun,
  Wind,
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

const PAGE_PATH = '/renovation-energetique/travaux/fenetres-double-vitrage'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'isabelle-renault'
const AUTHOR_NAME = 'Isabelle Renault'

const TITLE = 'Fenêtre double vitrage 2026 : prix Uw'
const DESCRIPTION =
  'Fenêtre double vitrage 2026 : prix posé 400-1 200 €/u, Uw < 1,3 W/m².K, gain énergie 30-40 %. Aides Parcours accompagné MPR + TVA 5,5 %.'

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
  'Double vitrage = 2 verres séparés par une lame d’air ou de gaz argon (16 mm typique).',
  'Coefficient thermique cible : Up ≤ 1,3 W/m².K (limite RGE 2026).',
  'Prix posé 2026 : 400-1 200 €/fenêtre selon dimensions et matériau (PVC/alu/bois).',
  'Économie énergie 30-40 % vs simple vitrage. ROI 15-25 ans (sauf si simple vitrage à remplacer obligatoirement).',
  'Éligible MaPrimeRénov’ uniquement dans le Parcours accompagné (rénovation d’ampleur).',
  'TVA 5,5 % automatique avec artisan RGE Qualibat menuiserie + CEE 100-300 €/fenêtre.',
]

const TYPES_VITRAGE = [
  {
    type: 'Double vitrage standard',
    composition: '4-16-4 (verre/argon/verre)',
    up: '1,3-1,6 W/m².K',
    detail: 'Le plus courant. Bon compromis prix/performance.',
    prix: '400-700 €/fenêtre posée',
  },
  {
    type: 'Double vitrage faible émissivité (VIR)',
    composition: '4-16-4 + couche basse émissivité',
    up: '1,1-1,3 W/m².K',
    detail: 'Couche métallique microscopique réfléchissant chaleur intérieure. Standard 2026 RGE.',
    prix: '500-900 €/fenêtre posée',
  },
  {
    type: 'Triple vitrage',
    composition: '4-12-4-12-4 (3 verres + 2 lames argon)',
    up: '0,7-0,9 W/m².K',
    detail:
      'Top performance. Recommandé maisons passives, climats froids. Plus lourd : huisseries renforcées.',
    prix: '700-1 400 €/fenêtre posée',
  },
  {
    type: 'Vitrage acoustique',
    composition: '6-16-44.2 (verre acoustique + PVB)',
    up: '1,2-1,4 W/m².K',
    detail: 'Affaiblissement bruit 35-42 dB. Idéal centres-villes ou voies rapides.',
    prix: '600-1 100 €/fenêtre posée',
  },
]

const PRIX_MATERIAU = [
  {
    materiau: 'PVC',
    prix: '400-700 €/fenêtre posée',
    detail:
      'Le moins cher, entretien quasi nul, bonne isolation thermique. Standard 70 % du marché.',
  },
  {
    materiau: 'Aluminium',
    prix: '700-1 100 €/fenêtre posée',
    detail:
      'Esthétique moderne, profilés fins (max lumière). Choisir alu à rupture de pont thermique. Durable 30+ ans.',
  },
  {
    materiau: 'Bois',
    prix: '600-1 200 €/fenêtre posée',
    detail:
      'Esthétique chaleureuse, recyclable, isolation excellente. Entretien tous les 5-10 ans (lasure/peinture).',
  },
  {
    materiau: 'Mixte bois-alu',
    prix: '900-1 400 €/fenêtre posée',
    detail:
      'Bois intérieur (chaleur) + alu extérieur (sans entretien). Haut de gamme, durable 50+ ans.',
  },
]

const AIDES_2026 = [
  {
    aide: 'MaPrimeRénov’ Parcours accompagné',
    montant: '40-100 €/fenêtre selon catégorie',
    detail: 'UNIQUEMENT dans rénovation d’ampleur (gain ≥ 2 classes DPE). Pas en geste isolé.',
  },
  {
    aide: 'CEE Coup de pouce',
    montant: '100-300 € / fenêtre',
    detail: 'Si simple vitrage → double Up ≤ 1,3 W/m².K. Cumulable MPR.',
  },
  {
    aide: 'TVA 5,5 %',
    montant: 'Automatique avec RGE',
    detail: 'Sur main-d’œuvre + matériaux. Économie ~15 % vs TVA 20 %.',
  },
  {
    aide: 'Éco-PTZ',
    montant: 'Jusqu’à 15 000 € (1 action) ou 50 000 € (rénovation d’ampleur)',
    detail: 'Sans condition de ressources. Cumulable autres aides.',
  },
]

const faqs = [
  {
    question: 'Combien coûte une fenêtre double vitrage en 2026 ?',
    answer:
      'Prix posé clé en main 2026 : 400-700 € pour une fenêtre PVC standard (1,2 × 1,3 m), 700-1 100 € pour de l’aluminium, 600-1 200 € pour du bois, 900-1 400 € pour du mixte bois-alu. Triple vitrage : 700-1 400 €. Pour une maison de 10 fenêtres : 4 000-12 000 € selon matériau. Le matériel représente 60-70 %, la pose 30-40 %. Devis gratuits par 2-3 menuisiers RGE comparés.',
  },
  {
    question: 'Le double vitrage est-il éligible à MaPrimeRénov’ ?',
    answer:
      'Uniquement dans le cadre du Parcours accompagné MaPrimeRénov’ (rénovation d’ampleur visant gain ≥ 2 classes DPE). Le geste fenêtre seul N’EST PAS éligible MPR par geste depuis 2024. Montants Parcours accompagné : 40-100 € par fenêtre selon catégorie de revenus, plafonné dans le total Parcours accompagné (jusqu’à 70 000 € de devis). Les CEE Coup de pouce restent disponibles (100-300 €/fenêtre).',
  },
  {
    question: 'Quel coefficient Up choisir pour le double vitrage ?',
    answer:
      'Up ≤ 1,3 W/m².K obligatoire pour bénéficier des CEE et de la TVA 5,5 % en 2026 (norme RGE). Up ≤ 1,1 W/m².K recommandé pour vraies économies d’énergie (vitrage VIR avec couche basse émissivité). Up = coefficient de transmission thermique de la fenêtre complète (vitrage + huisserie). Plus Up est bas, mieux la fenêtre isole. Triple vitrage atteint Up 0,7-0,9 W/m².K (top performance).',
  },
  {
    question: 'Combien d’économies avec du double vitrage ?',
    answer:
      'Remplacement simple vitrage par double vitrage VIR : économie 25-35 % sur la facture chauffage (réduction des déperditions par les fenêtres de 50-70 %). Pour une maison 100 m² chauffée à 1 800 €/an, économie ~450-630 €/an. Remplacement double vitrage ancien (Up 2-3) par neuf VIR (Up 1,1) : économie 5-10 % seulement. Le ROI sec est de 15-25 ans, ce qui rend les fenêtres pertinentes en cas de simple vitrage existant ou inconfort.',
  },
  {
    question: 'Quelle différence entre double et triple vitrage ?',
    answer:
      'Double vitrage : 2 verres + 1 lame argon, Up 1,1-1,6 W/m².K, prix moyen. Triple vitrage : 3 verres + 2 lames argon, Up 0,7-0,9 W/m².K, top performance mais 30-40 % plus cher. Triple vitrage pertinent : (1) maison passive ou BBC, (2) climat très froid (zone H1), (3) façades exposées nord, (4) bruit important. Sinon, double vitrage VIR suffit largement.',
  },
  {
    question: 'PVC, alu ou bois : quel matériau choisir ?',
    answer:
      'PVC : meilleur rapport qualité/prix (70 % du marché), entretien zéro, bonne isolation. Alu : esthétique moderne, profilés fins (plus de lumière), durable 30 ans+. Bois : esthétique chaleureuse, isolation excellente, recyclable, mais entretien tous les 5-10 ans (lasure ou peinture). Mixte bois-alu : top haut de gamme, bois intérieur + alu extérieur sans entretien, durable 50 ans+. PVC pour budget serré, mixte pour investissement durable.',
  },
  {
    question: 'Quel artisan choisir pour les fenêtres ?',
    answer:
      'Menuisier (entreprise locale) ou poseur de fenêtres avec mention RGE Qualibat ou QB17 (pour bénéficier CEE/TVA 5,5 %). Vérifier : assurance décennale, références chantiers, devis détaillé (marque, modèle, Up, Sw, type de pose : rénovation/dépose totale). Méfiance envers les "spécialistes fenêtres" multi-marques avec démarchage agressif (Tryba, K par K, Lapeyre) : prix souvent 30-50 % plus chers qu’un artisan local indépendant.',
  },
  {
    question: 'Pose en rénovation ou dépose totale ?',
    answer:
      'Pose en rénovation : conserve l’ancien dormant (cadre fixe), pose de la nouvelle fenêtre dessus. Avantage : plus rapide (1-2h/fenêtre), moins cher (-150-300 €/fenêtre). Inconvénient : réduit l’ouverture vitrée (perte 5-10 % luminosité). Dépose totale : retire tout l’ancien dormant + maçonnerie, pose neuve. Avantage : restauration complète, performance maximale. Inconvénient : plus cher, salissures plâtre/peinture à reprendre.',
  },
]

const sources = [
  { label: 'France Rénov’ — Fenêtres', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Menuiseries vitrées', url: 'https://www.ademe.fr' },
  { label: 'CSTB — Avis techniques fenêtres', url: 'https://www.cstb.fr' },
  {
    label: 'Service-Public.fr — TVA 5,5 % rénovation',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31875',
  },
  { label: 'Anah — Parcours accompagné menuiseries', url: 'https://www.anah.gouv.fr' },
]

const relatedPages = [
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
    description: '4 clusters travaux + ordre logique',
  },
  {
    label: 'Isolation murs intérieurs (ITI)',
    href: '/renovation-energetique/travaux/isolation/interieure',
    description: 'Combinaison isolation + fenêtres',
  },
  {
    label: 'VMC double flux',
    href: '/renovation-energetique/travaux/vmc-double-flux',
    description: 'Indispensable après remplacement fenêtres étanches',
  },
  {
    label: 'Parcours accompagné MPR',
    href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
    description: 'Seul parcours finançant les fenêtres',
  },
  {
    label: 'CEE Coup de pouce',
    href: '/renovation-energetique/aides/prime-coup-de-pouce',
    description: '100-300 € par fenêtre',
  },
  {
    label: 'Trouver un menuisier RGE',
    href: '/services/menuisier',
    description: 'Annuaire vérifié',
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
    section: 'Fenêtres double vitrage',
    keywords: [
      'double vitrage',
      'fenetre double vitrage',
      'prix double vitrage',
      'double vitrage prix',
      'fenetre double vitrage prix',
      'double vitrage 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Fenêtres double vitrage', url: PAGE_PATH },
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
              { label: 'Fenêtres double vitrage' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ThermometerSun className="w-3.5 h-3.5" aria-hidden />
              Up ≤ 1,3 W/m².K — TVA 5,5 % + CEE
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Fenêtre double vitrage 2026 : prix et performance
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>double vitrage</strong> divise les déperditions thermiques par les fenêtres
              par 2 à 3 par rapport à un simple vitrage. Prix posé 2026 :{' '}
              <strong>400 à 1 200 €/fenêtre</strong> selon matériau (PVC / alu / bois). Aides
              limitées en 2026 : MaPrimeRénov’ uniquement dans le{' '}
              <strong>Parcours accompagné</strong>, mais TVA 5,5 % et CEE Coup de pouce maintenus.
              Voici comment choisir.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="types-vitrage">Les 4 types de vitrage 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {TYPES_VITRAGE.map((t) => (
                <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-1">
                    Composition : <span className="font-mono">{t.composition}</span> · Up : {t.up}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="materiaux">PVC, alu, bois : prix par matériau</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Matériau</th>
                    <th className="p-3 border-b border-sand-200">Prix posé / fenêtre</th>
                    <th className="p-3 border-b border-sand-200">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_MATERIAU.map((p) => (
                    <tr key={p.materiau} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{p.materiau}</td>
                      <td className="p-3 text-primary-700 font-semibold">{p.prix}</td>
                      <td className="p-3 text-sand-600 text-xs">{p.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Prix base fenêtre 1,2 × 1,3 m, double vitrage VIR, pose en rénovation. Variations
              selon dimensions, type d’ouverture (oscillo-battant, coulissant), accessoires (volet
              roulant intégré : +200-400 €).
            </p>

            <h2 id="aides">Aides 2026 pour fenêtres double vitrage</h2>
            <div className="not-prose grid gap-3 my-6">
              {AIDES_2026.map((a) => (
                <div key={a.aide} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sand-900 m-0">{a.aide}</p>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {a.montant}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{a.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">MPR par geste supprimée pour fenêtres</p>
                <p className="m-0">
                  Depuis 2024, MaPrimeRénov’ ne finance plus les fenêtres en geste isolé. Pour
                  bénéficier d’une aide MPR, intégrer les fenêtres dans un Parcours accompagné
                  (rénovation d’ampleur visant gain ≥ 2 classes DPE). Les CEE Coup de pouce restent
                  disponibles individuellement (100-300 €/fenêtre si remplacement simple vitrage).
                </p>
              </div>
            </div>

            <h2 id="exemple">Exemple chiffré 10 fenêtres PVC</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <p className="font-semibold text-sand-900 m-0 mb-3">
                Maison 100 m², 10 fenêtres PVC double vitrage VIR (devis 6 500 €) — modeste (Jaune)
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-sand-600">Devis HT</span>
                <span className="text-sand-900 font-medium text-right">6 500 €</span>
                <span className="text-sand-600">CEE Coup de pouce (10 × 200 €)</span>
                <span className="text-primary-700 font-medium text-right">- 2 000 €</span>
                <span className="text-sand-600">TVA 5,5 % (vs 20 %) ≈</span>
                <span className="text-primary-700 font-medium text-right">- 750 €</span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200">
                  Reste à charge
                </span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200 text-right">
                  3 750 €
                </span>
                <span className="text-primary-700 font-semibold mt-1">
                  Économie chauffage annuelle
                </span>
                <span className="text-primary-700 font-semibold text-right mt-1">
                  ~400-600 €/an
                </span>
              </div>
              <p className="text-xs text-sand-500 italic mt-3 mb-0">
                ROI : 6-10 ans si simple vitrage existant à remplacer. Bonus confort acoustique +
                valorisation immobilière non chiffrés.
              </p>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer vos fenêtres double vitrage
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané prix posé selon matériau + CEE + TVA 5,5 %. Si rénovation
                    d’ampleur : éligibilité Parcours accompagné MPR. Mise en relation menuisier RGE.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="apres-pose">Après pose : penser la VMC</h2>
            <p>
              <Wind className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Les fenêtres double vitrage modernes sont quasi étanches à l’air. Sans renouvellement
              d’air par <Link href="/renovation-energetique/travaux/vmc-double-flux">VMC</Link>{' '}
              (simple flux hygro minimum, double flux idéalement), risque de condensation,
              moisissures et qualité d’air dégradée. Vérifier l’existence et le bon fonctionnement
              de la VMC AVANT remplacement des fenêtres.
            </p>
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
              href="/renovation-energetique/travaux"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Travaux
            </Link>
            <Link
              href="/services/menuisier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Menuisiers RGE <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>

          <p className="sr-only">
            <CheckCircle2 className="inline" aria-hidden /> Page mise à jour selon barèmes 2026 CEE
            et critères techniques RGE Qualibat menuiserie.
          </p>
        </div>
      </div>
    </>
  )
}
