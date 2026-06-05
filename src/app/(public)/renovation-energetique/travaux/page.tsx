/**
 * Page : /renovation-energetique/travaux
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "renovation energetique"           → ~5 800 vol, KD 60 (intent général ; partagé avec hub /renovation-energetique)
 * - "travaux renovation energetique"   → longue traîne
 * - "renovation thermique"             → longue traîne
 * - Hub navigationnel — capte la longue traîne via maillage interne vers les 14 sous-pages
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : NON (KD élevé) — page hub destinée à siloer les 4 clusters travaux (chauffage / isolation / menuiseries / ventilation)
 *            et capter intent général, transmettre PageRank vers les sous-pages mieux positionnées.
 * Cluster pillar : Rénovation Énergétique → Travaux
 *
 * Anti-cannibalisation :
 *   - Hub racine /renovation-energetique = panorama 4 clusters (aides, travaux, diagnostic, passoires)
 *   - Cette page = HUB travaux uniquement (4 sous-clusters, comparatif, aides cumulées par geste)
 *   - Sous-pages : isolation×4, PAC×4, chauffage×4, fenêtres, VMC
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Coins,
  Droplets,
  Flame,
  Home,
  Layers,
  Sparkles,
  Sun,
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

const PAGE_PATH = '/renovation-energetique/travaux'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Travaux rénovation énergétique 2026'
const DESCRIPTION =
  'Isolation, pompe à chaleur, chauffage, fenêtres, VMC : guide travaux rénovation énergétique 2026. Comparatif technique, prix, aides cumulables.'

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
  '4 grandes familles de travaux : isolation, chauffage EnR, menuiseries, ventilation.',
  'Ordre logique : isolation D’ABORD (réduit besoin chauffage), puis chauffage adapté.',
  'Bonus combinaison : aides bonifiées si 2+ travaux groupés (Parcours accompagné MPR).',
  'Top ROI : isolation combles (1-3 ans), PAC air-eau (5-7 ans), VMC double flux (8-12 ans).',
  'Tous les travaux nécessitent un artisan RGE pour ouvrir droit aux aides.',
  'Audit énergétique préalable recommandé pour rénovation d’ampleur (gain ≥ 2 classes DPE).',
]

const CLUSTERS = [
  {
    icon: Layers,
    name: 'Isolation thermique',
    href: '/renovation-energetique/travaux/isolation',
    headline: 'Le préalable n°1',
    detail:
      '30 % des déperditions par la toiture, 25 % par les murs. À traiter avant tout changement de chauffage pour dimensionner correctement.',
    pages: [
      { label: 'Combles (4 080 vol)', href: '/renovation-energetique/travaux/isolation/combles' },
      {
        label: 'Extérieure ITE (678 vol)',
        href: '/renovation-energetique/travaux/isolation/exterieure-ite',
      },
      {
        label: 'Intérieure ITI (248 vol)',
        href: '/renovation-energetique/travaux/isolation/interieure',
      },
    ],
  },
  {
    icon: Flame,
    name: 'Chauffage à énergie renouvelable',
    href: '/renovation-energetique/travaux/chauffage',
    headline: 'Remplacer fioul/gaz par EnR',
    detail:
      'Pompe à chaleur, chaudière biomasse, poêle granulés, chauffe-eau thermodynamique. Aides massives pour quitter les énergies fossiles.',
    pages: [
      { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
      {
        label: 'Chaudière condensation',
        href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
      },
      {
        label: 'Poêle à granulés',
        href: '/renovation-energetique/travaux/chauffage/poele-granules',
      },
      {
        label: 'Chauffe-eau thermodynamique (28K vol)',
        href: '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique',
      },
    ],
  },
  {
    icon: ThermometerSun,
    name: 'Menuiseries',
    href: '/renovation-energetique/travaux/menuiseries',
    headline: 'Menuiseries extérieures',
    detail:
      'Réduit déperditions thermiques de 10-15 %. Fenêtres double vitrage Uw ≤ 1.3 obligatoire pour MPR. Hub matériaux PVC/alu/bois.',
    pages: [
      {
        label: 'Hub menuiseries (PVC/alu/bois)',
        href: '/renovation-energetique/travaux/menuiseries',
      },
      {
        label: 'Fenêtres double vitrage',
        href: '/renovation-energetique/travaux/fenetres-double-vitrage',
      },
    ],
  },
  {
    icon: Wind,
    name: 'Ventilation',
    href: '/renovation-energetique/travaux/vmc',
    headline: 'VMC (4 familles)',
    detail:
      'Hub VMC complet : auto, hygroréglable, double flux, double flux thermo. Cluster #1 Bloc 1 (215 KW, vol 127K, KD 0.7). Indispensable après isolation.',
    pages: [
      {
        label: 'Hub VMC (vol 8.1K + sub-pages)',
        href: '/renovation-energetique/travaux/vmc',
      },
      {
        label: 'VMC simple flux (15K vol KD 2)',
        href: '/renovation-energetique/travaux/vmc/simple-flux',
      },
      {
        label: 'VMC hygroréglable (14K vol KD 1)',
        href: '/renovation-energetique/travaux/vmc/hygroreglable',
      },
      {
        label: 'VMC double flux (13K vol KD 2)',
        href: '/renovation-energetique/travaux/vmc-double-flux',
      },
      {
        label: 'Installation VMC (1.2K vol KD 0)',
        href: '/renovation-energetique/travaux/vmc/installation',
      },
    ],
  },
  {
    icon: Sun,
    name: 'Solaire photovoltaïque',
    href: '/renovation-energetique/travaux/solaire',
    headline: 'Autoconsommation EDF OA',
    detail:
      'Panneaux PV pour autoconsommation + revente surplus. Prime EDF OA 190-380 €/kWc. HORS CEE et HORS MaPrimeRénov’ (PV ≠ solaire thermique). Supply : 3 985 artisans QualiPV actifs.',
    pages: [
      {
        label: 'Hub solaire PV (6.3K vol KD 25)',
        href: '/renovation-energetique/travaux/solaire',
      },
    ],
  },
]

const ORDRE_TRAVAUX = [
  {
    step: 'Audit énergétique',
    detail:
      'Réalisé par un auditeur agréé (500-1 200 €). Identifie les postes prioritaires et propose 2 scénarios chiffrés. Obligatoire pour Parcours accompagné MPR.',
  },
  {
    step: 'Isolation thermique',
    detail:
      'Toujours en premier : combles (30 % déperditions), murs (25 %), planchers bas (10 %). Réduit le besoin chauffage de 30-50 %.',
  },
  {
    step: 'Ventilation (VMC double flux)',
    detail:
      'Après isolation pour éviter condensation et humidité. Récupère 70-90 % de la chaleur de l’air extrait.',
  },
  {
    step: 'Chauffage adapté',
    detail:
      'PAC, chaudière biomasse ou poêle granulés DIMENSIONNÉS pour les nouveaux besoins post-isolation. Économie installation 20-30 %.',
  },
  {
    step: 'Menuiseries',
    detail:
      'Fenêtres double vitrage si simple vitrage existant. Si déjà double vitrage : à reporter (ROI faible).',
  },
  {
    step: 'Solaire (option)',
    detail:
      'Solaire thermique pour ECS ou chauffage combiné. ROI 8-15 ans selon ensoleillement zone.',
  },
]

const COMPARATIF_PRIX_ROI = [
  {
    travaux: 'Isolation combles 100 m²',
    prix: '3 500-7 000 €',
    aides: '2 500-4 500 €',
    restNet: '1 000-2 500 €',
    roi: '1-3 ans',
  },
  {
    travaux: 'Isolation ITE 80 m²',
    prix: '12 000-20 000 €',
    aides: '6 000-12 000 €',
    restNet: '6 000-8 000 €',
    roi: '8-12 ans',
  },
  {
    travaux: 'PAC air-eau 10 kW',
    prix: '12 000-15 000 €',
    aides: '5 000-9 000 €',
    restNet: '6 000-7 000 €',
    roi: '5-7 ans',
  },
  {
    travaux: 'Chaudière granulés',
    prix: '15 000-22 000 €',
    aides: '7 000-10 000 €',
    restNet: '8 000-12 000 €',
    roi: '7-10 ans',
  },
  {
    travaux: 'VMC double flux',
    prix: '4 000-6 500 €',
    aides: '2 000-3 500 €',
    restNet: '2 000-3 000 €',
    roi: '8-12 ans',
  },
  {
    travaux: 'Fenêtres double vitrage (10 unités)',
    prix: '7 000-12 000 €',
    aides: '0-1 000 €',
    restNet: '6 500-11 000 €',
    roi: '15-25 ans',
  },
  {
    travaux: 'Audit énergétique',
    prix: '500-1 200 €',
    aides: '300-500 €',
    restNet: '200-700 €',
    roi: 'Catalyseur',
  },
]

const faqs = [
  {
    question: 'Par où commencer pour une rénovation énergétique ?',
    answer:
      'L’ordre rationnel est : (1) audit énergétique pour identifier les postes prioritaires, (2) isolation toiture (30 % des déperditions), (3) isolation murs (25 %), (4) ventilation VMC double flux, (5) chauffage adapté aux nouveaux besoins post-isolation. Mettre une PAC sur un logement non isolé = surdimensionnement, surcoût d’installation et factures énergie élevées. L’isolation EST LE PRÉALABLE numéro 1.',
  },
  {
    question: 'Quels travaux apportent le plus d’économies ?',
    answer:
      'Top 3 ROI : (1) isolation combles perdus (1-3 ans, économie 25-30 % chauffage), (2) PAC air-eau remplaçant chaudière fioul (5-7 ans, économie 50-70 %), (3) isolation ITE (8-12 ans, économie 30-40 % chauffage + valorisation immobilière). Les fenêtres double vitrage améliorent le confort mais leur ROI seul est de 15-25 ans (sauf si simple vitrage à remplacer obligatoirement).',
  },
  {
    question: 'Faut-il faire tous les travaux d’un coup ?',
    answer:
      'Pour les passoires thermiques (F/G), oui : MaPrimeRénov’ Parcours accompagné finance jusqu’à 90 % d’une rénovation globale (gain ≥ 2 classes DPE). Pour les logements D ou mieux, étalement possible : isolation année 1, chauffage année 2-3, ventilation année 4. Avantage du global : Parcours accompagné + Coup de pouce Rénovation d’ampleur + bonus sortie passoire + bonus BBC se cumulent.',
  },
  {
    question: 'Combien coûte une rénovation énergétique complète ?',
    answer:
      'Maison individuelle 100 m² classe G → C : 35 000-80 000 € HT. Inclut isolation toiture + ITE + PAC air-eau + VMC double flux. Avec aides cumulées (MPR Parcours accompagné + CEE + éco-PTZ + TVA 5,5 %), reste à charge net 5 000-25 000 € pour ménage modeste. Les Bleu (très modeste) atteignent souvent 0 € à charge immédiate avec éco-PTZ.',
  },
  {
    question: 'Mon logement est éligible à quelles aides ?',
    answer:
      'Tous les logements > 15 ans (sauf chauffage EnR, dès 2 ans depuis 2026) sont éligibles à : MaPrimeRénov’, CEE Coup de pouce, éco-PTZ, TVA 5,5 %. Pour vérifier votre éligibilité personnalisée selon revenus, foyer et travaux : utilisez notre simulateur officiel basé sur barèmes Anah 2026.',
  },
  {
    question: 'Quel artisan choisir pour la rénovation énergétique ?',
    answer:
      'Toujours un artisan portant la mention RGE (Reconnu Garant de l’Environnement) à la date du devis. Sans RGE = pas d’aides. Mentions par métier : Qualibat (isolation, ITE 5911, ITI 5912, combles 7131), QualiPAC (pompe à chaleur), Qualibois (chaudière biomasse), Qualisol (solaire thermique), Qualifelec (électricité, IRVE). Vérifier la validité dans notre annuaire RGE alimenté par l’API ADEME.',
  },
  {
    question: 'Quelle différence entre rénovation par geste et rénovation d’ampleur ?',
    answer:
      'Par geste : 1 ou 2 travaux ciblés (ex. isolation combles seule), aides forfaitaires MPR (jusqu’à 11 000 €). Rénovation d’ampleur : projet groupé visant un gain ≥ 2 classes DPE, MPR Parcours accompagné en pourcentage du devis (jusqu’à 90 %), Mon Accompagnateur Rénov’ obligatoire, plafond 70 000 € (90 000 € si sortie passoire + BBC).',
  },
  {
    question: 'Faut-il un audit énergétique avant les travaux ?',
    answer:
      'Obligatoire pour : (1) MaPrimeRénov’ Parcours accompagné, (2) vente d’une maison individuelle classée F ou G (depuis 2023, étendu aux E en 2025). Recommandé pour toute rénovation > 15 000 €. Coût 500-1 200 € (forfait MPR 300-500 € selon revenus). L’audit identifie les postes prioritaires et propose 2 scénarios chiffrés (gain 2 classes vs gain 3+ classes).',
  },
]

const sources = [
  { label: 'France Rénov’ — Guide travaux', url: 'https://france-renov.gouv.fr/travaux' },
  { label: 'ADEME — Travaux rénovation énergétique', url: 'https://www.ademe.fr' },
  { label: 'Anah — Aides par travaux', url: 'https://www.anah.gouv.fr' },
  {
    label: 'Service-Public.fr — Rénovation énergétique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/N321',
  },
  { label: 'CSTB — Référentiel technique RGE', url: 'https://www.cstb.fr' },
]

const relatedPages = [
  {
    label: 'Hub Rénovation énergétique',
    href: '/renovation-energetique',
    description: 'Aides + travaux + diagnostic + passoires',
  },
  {
    label: 'Aides rénovation énergétique 2026',
    href: '/renovation-energetique/aides',
    description: '4 dispositifs nationaux cumulables',
  },
  {
    label: 'Audit énergétique : prix et obligations',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Préalable Parcours accompagné',
  },
  {
    label: 'Passoires thermiques : sortir de F/G',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'Calendrier loi + aides cumulables',
  },
  {
    label: 'Trouver un artisan RGE',
    href: '/rge/renovation-energetique',
    description: 'Annuaire vérifié ADEME quotidien',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimation personnalisée 2 minutes',
  },
  {
    label: 'Nettoyage et démoussage de toiture',
    href: '/renovation-energetique/travaux/nettoyage-toiture',
    description: 'Prix 100 m² 700-3 000 € selon prestation',
  },
  {
    label: 'Charpente : 4 types et prix 2026',
    href: '/renovation-energetique/travaux/charpente',
    description: '100-300 €/m², traditionnelle, fermettes, lamellé-collé',
  },
  {
    label: 'VMI (Ventilation Mécanique par Insufflation)',
    href: '/renovation-energetique/travaux/vmi',
    description: 'Alternative VMC, 3 500-7 000 €, maison ancienne',
  },
  {
    label: 'Ballon thermodynamique 2026',
    href: '/renovation-energetique/travaux/ballon-thermodynamique',
    description: 'ECS PAC 150-300L, prix 2 500-4 500 €, MPR + CEE 1 350 €',
  },
  {
    label: 'Climatisation : prix installation 2026',
    href: '/renovation-energetique/travaux/climatisation',
    description: 'Monosplit, multisplit, gainable, 1 500-15 000 €',
  },
  {
    label: 'Électricité : prix électricien et NF C 15-100',
    href: '/renovation-energetique/travaux/electricite',
    description: 'Tarif horaire, mise aux normes, IRVE, Consuel',
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
    section: 'Travaux rénovation énergétique',
    keywords: [
      'travaux renovation energetique',
      'renovation thermique',
      'isolation pompe a chaleur',
      'rge travaux',
      'pose double vitrage vmc',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: PAGE_PATH },
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
              { label: 'Travaux' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Hub Travaux 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Travaux de rénovation énergétique 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Quatre familles de travaux structurent la rénovation énergétique en 2026 :{' '}
              <strong>isolation</strong>, <strong>chauffage à énergie renouvelable</strong>,{' '}
              <strong>menuiseries</strong> et <strong>ventilation</strong>. Voici comment choisir,
              dans quel ordre les réaliser, leurs prix moyens et le ROI réel après aides cumulées.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="clusters">Les 4 clusters travaux</h2>
            <div className="not-prose grid gap-4 my-6">
              {CLUSTERS.map((c) => {
                const Icon = c.icon
                return (
                  <div key={c.name} className="bg-white border border-sand-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-6 h-6" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={c.href}
                          className="block font-heading text-lg font-semibold text-sand-900 hover:text-primary-700"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-primary-600 font-medium mt-0.5 mb-2 m-0">
                          {c.headline}
                        </p>
                        <p className="text-sm text-sand-700 m-0 mb-3">{c.detail}</p>
                        <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
                          {c.pages.map((p) => (
                            <li key={p.href}>
                              <Link
                                href={p.href}
                                className="inline-flex items-center text-xs bg-sand-50 text-primary-700 hover:bg-primary-50 px-2.5 py-1 rounded-full font-medium transition-colors"
                              >
                                {p.label}
                                <ArrowRight className="w-3 h-3 ml-1" aria-hidden />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <h2 id="ordre-travaux">Ordre logique des travaux (6 étapes)</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ORDRE_TRAVAUX.map((s, i) => (
                  <li
                    key={s.step}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{s.step}</p>
                      <p className="text-sm text-sand-700 mt-1 mb-0">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <h2 id="comparatif">Prix, aides et ROI : comparatif</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Travaux</th>
                    <th className="p-3 border-b border-sand-200">Prix HT</th>
                    <th className="p-3 border-b border-sand-200">Aides typiques</th>
                    <th className="p-3 border-b border-sand-200">Reste à charge</th>
                    <th className="p-3 border-b border-sand-200">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF_PRIX_ROI.map((r) => (
                    <tr key={r.travaux} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{r.travaux}</td>
                      <td className="p-3">{r.prix}</td>
                      <td className="p-3 text-primary-700">{r.aides}</td>
                      <td className="p-3 font-semibold text-sand-900">{r.restNet}</td>
                      <td className="p-3 text-primary-700 font-semibold">{r.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Aides estimées pour un ménage modeste (Jaune) avec MPR + CEE + TVA 5,5 %. Variations
              selon zone, état initial et complexité chantier. Calcul précis avec notre simulateur
              officiel.
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer vos travaux et aides 2026
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané selon vos travaux, revenus et zone. MPR + CEE + éco-PTZ + TVA
                    5,5 %. Mise en relation avec un artisan RGE vérifié.
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

            <h2 id="combinaisons">Combinaisons gagnantes</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Isolation combles + PAC air-eau</strong> = ROI 4-6 ans, gain DPE 2 classes,
                bonus sortie passoire si F/G.
              </li>
              <li>
                <Sparkles className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>ITE + chaudière granulés + VMC double flux</strong> = rénovation d’ampleur
                typique, jusqu’à 70 000 € MPR Parcours accompagné.
              </li>
              <li>
                <Droplets className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Chauffe-eau thermodynamique + solaire thermique</strong> = ECS +
                préchauffage, économie 60-75 % vs chauffe-eau électrique.
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
              href="/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Rénovation énergétique
            </Link>
            <Link
              href="/rge/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
