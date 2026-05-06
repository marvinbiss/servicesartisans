/**
 * Page : /renovation-energetique/travaux/chauffage
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "chauffage"                         → 17 157 vol, KD 10, CPC $0,45, clicks 9 967 ⭐⭐⭐ JACKPOT
 * - "chauffage maison"                  → longue traîne KD bas
 * - "chauffage central"                 → longue traîne
 * - "chauffage ecologique"              → longue traîne
 * - Famille cumulée pivot : ~22 000 vol/mois (KW pivot KD 10 = easy win majeur)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MAJEUR (KD 10 sur "chauffage" 17K vol)
 *            Concurrence Engie, EDF, sites-prix (effy, hellio)
 *            Atout SA : focus chauffage EnR + comparatif honnête + aides 2026
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage
 *
 * Anti-cannibalisation :
 *   - Hub /travaux/ = panorama 4 clusters (isolation, chauffage, fenêtres, VMC)
 *   - Cette page = HUB chauffage uniquement (4 sub-pages : chaudière condensation, poêle, CET, raccordement)
 *   - Sub /pompe-a-chaleur/ = cluster PAC distinct (3 sous-pages déjà livrées)
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
  ShieldCheck,
  ThermometerSun,
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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Chauffage 2026 : PAC, granulés, chaudière'
const DESCRIPTION =
  'Chauffage 2026 : comparatif PAC, chaudière condensation, poêle granulés, chauffe-eau thermo. Prix posé, aides MPR + CEE, ROI réel.'

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
  '4 grandes familles : pompe à chaleur, chaudière (condensation/biomasse), poêle, chauffe-eau thermodynamique.',
  'Chaudières fioul interdites depuis 2022 et chaudières gaz interdites pour le neuf 2025.',
  'PAC air-eau : top ROI (5-7 ans) si remplacement chaudière fioul.',
  'Chaudière granulés : top alternative pour gros besoins (maison ancienne mal isolée).',
  'Chauffe-eau thermodynamique : 28K vol/mois — économie 60-75 % vs ballon électrique.',
  'Tous les chauffages EnR éligibles MaPrimeRénov’ + CEE Coup de pouce + éco-PTZ.',
]

const SOLUTIONS = [
  {
    icon: ThermometerSun,
    name: 'Pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    headline: 'Air-eau, géothermique, hybride',
    prixPose: '12 000-32 000 €',
    aidesMax: '11 000 € (MPR Bleu géothermique)',
    cop: '3,5-5,5',
    detail: 'Solution n°1 pour remplacer chaudière fioul/gaz. ROI 5-12 ans selon type.',
  },
  {
    icon: Flame,
    name: 'Chaudière condensation',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
    headline: 'Gaz haute performance',
    prixPose: '4 500-7 500 €',
    aidesMax: '0 € MPR (depuis 2024) — CEE limité',
    cop: 'Rendement 105-110 %',
    detail: 'À éviter en remplacement chaudière fioul (préférer PAC). Reste utile en attente PAC.',
  },
  {
    icon: Flame,
    name: 'Chaudière à bois (biomasse)',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
    headline: 'Granulés, bûches ou mixte',
    prixPose: '8 000-22 000 €',
    aidesMax: 'MPR + CEE BAR-TH-104 + Coup de pouce',
    cop: 'Rendement ETAS 70-85 %',
    detail:
      'Chauffage central + ECS via combustible bois. Top alternative pour maison rurale mal isolée + sortie fioul. Label RGE Qualibois requis.',
  },
  {
    icon: Flame,
    name: 'Poêle à granulés',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
    headline: 'Chauffage d’appoint EnR',
    prixPose: '4 000-8 000 €',
    aidesMax: '2 500 € (MPR Bleu)',
    cop: 'Rendement 85-92 %',
    detail: 'Idéal salon/chauffage principal petit logement. Combustible éco renouvelable.',
  },
  {
    icon: Droplets,
    name: 'Chauffe-eau thermodynamique',
    href: '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique',
    headline: 'ECS PAC sur air ambiant',
    prixPose: '2 500-4 500 €',
    aidesMax: '1 200 € (MPR Bleu)',
    cop: '3,0-3,5',
    detail: 'Remplace ballon élec. ROI 4-6 ans, économie 60-75 % facture ECS.',
  },
]

const COMPARATIF = [
  {
    critere: 'Prix posé moyen (10 kW chauffage central)',
    pac: '12-15K €',
    granules: '15-22K €',
    condensation: '4,5-7,5K €',
  },
  { critere: 'MaPrimeRénov’ Bleu max', pac: '5 000 €', granules: '7 000 €', condensation: '0 €' },
  { critere: 'CEE Coup de pouce max', pac: '4 000 €', granules: '5 000 €', condensation: 'Limité' },
  {
    critere: 'Coût énergie/an (100 m²)',
    pac: '500-1 000 €',
    granules: '650-1 100 €',
    condensation: '900-1 600 €',
  },
  {
    critere: 'Rendement / COP',
    pac: 'COP 3,5-4,5',
    granules: '85-92 %',
    condensation: '105-110 %',
  },
  {
    critere: 'Encombrement intérieur',
    pac: 'Modéré',
    granules: 'Important + silo',
    condensation: 'Minimal',
  },
  {
    critere: 'Entretien annuel',
    pac: '120-200 €',
    granules: '180-280 €',
    condensation: '120-180 €',
  },
  { critere: 'Durée de vie', pac: '15-20 ans', granules: '20-25 ans', condensation: '15-20 ans' },
  {
    critere: 'ROI typique',
    pac: '5-7 ans',
    granules: '7-10 ans',
    condensation: 'N/A (transition)',
  },
]

const ORDRE_PRIORITE = [
  {
    cas: 'Vous avez une chaudière fioul',
    priorite: 'PAC air-eau',
    detail: 'Aides massives MPR + CEE Coup de pouce, économies factures 50-70 %, ROI 5-7 ans.',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
  },
  {
    cas: 'Vous avez une chaudière gaz < 15 ans',
    priorite: 'Garder (sauf rénovation globale)',
    detail:
      'Pas urgent : pas d’interdiction immédiate (sauf neuf depuis 2025). En revanche, si vous faites une rénovation d’ampleur, profitez-en pour passer en PAC.',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    cas: 'Vous avez un chauffage électrique direct',
    priorite: 'PAC air-air ou air-eau',
    detail:
      'Économies 50-65 % sur facture électrique. PAC air-eau si chauffage central possible, sinon multi-split air-air.',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    cas: 'Vous habitez une maison rurale ancienne mal isolée',
    priorite: 'Chaudière à bois (granulés ou bûches)',
    detail:
      'Idéal pour gros besoins en chauffage avant isolation lourde. Combustible local, ROI plus rapide qu’une PAC sur logement non isolé. Label RGE Qualibois.',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
  },
  {
    cas: 'Votre ballon ECS électrique est en fin de vie',
    priorite: 'Chauffe-eau thermodynamique',
    detail:
      'Remplacement direct par CET PAC sur air ambiant. Économie 60-75 % facture ECS. Aides MPR jusqu’à 1 200 €.',
    href: '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique',
  },
]

const faqs = [
  {
    question: 'Quel est le meilleur chauffage en 2026 pour remplacer une chaudière fioul ?',
    answer:
      'La pompe à chaleur air-eau est aujourd’hui la solution n°1 pour remplacer une chaudière fioul. Elle bénéficie des aides les plus généreuses (MaPrimeRénov’ jusqu’à 5 000 € Bleu, CEE Coup de pouce 4 000 € modeste, éco-PTZ jusqu’à 50 000 € à 0 %). Elle s’adapte sur le réseau de chauffage central et radiateurs existants. Économie facture 50-70 % la 1re année. ROI 5-7 ans. Pour les très gros besoins ou maisons rurales mal isolées, la chaudière biomasse granulés reste pertinente.',
  },
  {
    question: 'Les chaudières gaz sont-elles interdites en 2026 ?',
    answer:
      'Non, pas pour le parc existant. L’interdiction concerne UNIQUEMENT les logements neufs depuis le 1er janvier 2025 (RE2020). Vous pouvez donc remplacer votre chaudière gaz par une nouvelle chaudière gaz à condensation. En revanche, MaPrimeRénov’ ne finance plus les chaudières gaz depuis 2023 (sauf hybrides PAC + gaz dans certains cas). Stratégie recommandée : si votre chaudière gaz est récente (&lt; 15 ans), la garder. Si elle a plus de 15 ans, planifier le passage à une PAC.',
  },
  {
    question: 'Combien coûte un chauffage écologique en 2026 ?',
    answer:
      'PAC air-eau 10 kW : 12 000-15 000 € posée. PAC géothermique : 22 000-32 000 €. Chaudière granulés 25 kW + silo : 15 000-22 000 €. Poêle à granulés étanche : 4 000-8 000 €. Chauffe-eau thermodynamique 200 L : 2 500-4 500 €. Système solaire combiné (chauffage + ECS) : 12 000-20 000 €. Avec aides cumulées (MPR + CEE + éco-PTZ + TVA 5,5 %), reste à charge net 30-50 % du devis pour ménage modeste.',
  },
  {
    question: 'Faut-il isoler avant de changer son chauffage ?',
    answer:
      'Idéalement oui. Logique : isoler réduit les besoins de chauffage de 30-50 %, ce qui permet de DIMENSIONNER correctement la nouvelle PAC ou chaudière (au lieu de surdimensionner pour un logement passoire). Une PAC sous-dimensionnée sur logement isolé = COP optimal. Une PAC surdimensionnée sur logement non isolé = courts cycles, usure prématurée, factures élevées. En pratique : audit énergétique préalable + Parcours accompagné MPR si rénovation globale (gain ≥ 2 classes DPE).',
  },
  {
    question: 'Combien d’aides pour un nouveau chauffage en 2026 ?',
    answer:
      'PAC air-eau remplacement fioul, ménage Bleu : MPR 5 000 € + CEE Coup de pouce 4 000 € = 9 000 € (devis 14 000 €). PAC géothermique Bleu : MPR 11 000 € + CEE 7 000 € = 18 000 € (devis 28 000 €). Chaudière granulés Bleu : MPR 7 000 € + CEE 5 000 € = 12 000 € (devis 18 000 €). Avec éco-PTZ pour le reste à charge à 0 %, l’investissement chauffage devient accessible aux ménages modestes.',
  },
  {
    question: 'Quel artisan choisir pour son chauffage ?',
    answer:
      'Selon le type de chauffage : QualiPAC pour PAC (mention spécifique géothermie si géothermique), Qualibois pour chaudière biomasse granulés/bûches et poêle à granulés, Qualisol pour solaire thermique, Qualigaz pour chaudière gaz, Qualifelec mention Solaire Photovoltaïque pour PV. Tous doivent porter la mention RGE valide à la date du devis. Vérifier dans notre annuaire RGE alimenté par l’API ADEME quotidiennement.',
  },
  {
    question: 'Quel chauffage pour un appartement ?',
    answer:
      'Si chauffage collectif : pas de choix individuel possible (sauf petit appoint). Si chauffage individuel électrique : remplacer convecteurs vétustes par des radiateurs à inertie de qualité (gain confort + 15 % éco), ou installer une PAC air-air mono-split sur le salon. Si chauffage gaz individuel ancien : remplacer par chaudière gaz à condensation murale (4 500-6 500 €). En copropriété, MaPrimeRénov’ Copropriété possible pour chauffage collectif.',
  },
  {
    question: 'Combien de temps dure une installation de chauffage ?',
    answer:
      'PAC air-eau : 2-4 jours (dépose ancien + raccordement réseau central existant). PAC géothermique : 5-10 jours (forage + pose). Chaudière granulés + silo : 2-3 jours. Chaudière condensation : 1-2 jours. Poêle à granulés : 1 jour (avec ramonage et tubage si conduit existant). Chauffe-eau thermodynamique : 0,5-1 jour. Toujours prévoir une période de transition (chauffage temporaire) si remplacement en hiver.',
  },
]

const sources = [
  { label: 'France Rénov’ — Choisir son chauffage', url: 'https://france-renov.gouv.fr' },
  { label: 'AFPAC — Pompes à chaleur', url: 'https://www.afpac.org' },
  { label: 'ADEME — Chauffage et ECS', url: 'https://www.ademe.fr' },
  { label: 'Anah — Aides chauffage 2026', url: 'https://www.anah.gouv.fr' },
  { label: 'Service-Public.fr — Chauffage logement', url: 'https://www.service-public.fr' },
]

const relatedPages = [
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
    description: '4 clusters travaux + ordre logique',
  },
  {
    label: 'Hub pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Comparatif air-eau / air-air / géothermique',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ cumulables',
  },
  {
    label: 'Label QualiPAC',
    href: '/rge/labels/qualipac',
    description: 'Mention RGE PAC officielle',
  },
  {
    label: 'Label Qualibois',
    href: '/rge/labels/qualibois',
    description: 'Mention RGE chaudière + poêle bois',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimation MPR + CEE + éco-PTZ',
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
    section: 'Chauffage',
    keywords: [
      'chauffage',
      'chauffage maison',
      'chauffage central',
      'chauffage ecologique',
      'chauffage renouvelable',
      'remplacer chaudiere',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: PAGE_PATH },
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
              { label: 'Chauffage' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Hub Chauffage 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Chauffage 2026 : guide complet
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Quatre grandes familles dominent le marché du <strong>chauffage</strong> en 2026 :
              pompe à chaleur, chaudière (condensation ou biomasse), poêle à granulés et chauffe-eau
              thermodynamique. La <strong>chaudière fioul</strong> est interdite à l’installation
              depuis 2022 et la <strong>chaudière gaz</strong> dans le neuf depuis 2025. Voici
              comment choisir, leurs prix posés, les aides cumulables et le ROI réel.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="solutions">Les 4 solutions de chauffage 2026</h2>
            <div className="not-prose grid gap-4 my-6">
              {SOLUTIONS.map((s) => {
                const Icon = s.icon
                return (
                  <Link
                    key={s.name}
                    href={s.href}
                    className="block bg-white border border-sand-200 rounded-xl p-5 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-6 h-6" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                            {s.name}
                          </h3>
                          <span className="text-sm font-bold text-primary-700">{s.prixPose}</span>
                        </div>
                        <p className="text-xs text-primary-600 font-medium mt-0.5 mb-2 m-0">
                          {s.headline} · {s.cop}
                        </p>
                        <p className="text-sm text-sand-700 m-0 mb-2">{s.detail}</p>
                        <p className="text-xs text-primary-700 font-semibold m-0">
                          Aides max : {s.aidesMax}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-2" aria-hidden />
                    </div>
                  </Link>
                )
              })}
            </div>

            <h2 id="comparatif">Comparatif PAC / Granulés / Condensation</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">PAC air-eau</th>
                    <th className="p-3 border-b border-sand-200">Chaudière granulés</th>
                    <th className="p-3 border-b border-sand-200">Chaudière condensation gaz</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF.map((c) => (
                    <tr key={c.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{c.critere}</td>
                      <td className="p-3 text-primary-700 font-semibold">{c.pac}</td>
                      <td className="p-3">{c.granules}</td>
                      <td className="p-3 text-amber-700">{c.condensation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="ordre-priorite">Quel chauffage selon votre situation ?</h2>
            <div className="not-prose grid gap-3 my-6">
              {ORDRE_PRIORITE.map((p) => (
                <Link
                  key={p.cas}
                  href={p.href}
                  className="block bg-white border border-sand-200 rounded-xl p-4 hover:border-primary-400 transition-colors"
                >
                  <p className="font-semibold text-sand-900 m-0 mb-1">→ {p.cas}</p>
                  <p className="text-sm text-primary-700 font-bold m-0 mb-1">
                    Priorité : {p.priorite}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                </Link>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Choisir et estimer votre nouveau chauffage
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Comparateur PAC vs granulés vs condensation selon votre logement, isolation et
                    budget. Calcul aides MPR + CEE + éco-PTZ instantané. Mise en relation artisan
                    RGE.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="reglementation">Réglementation 2026 : ce qui change</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Chaudières fioul</strong> : interdites à l’installation depuis le 1er
                juillet 2022 (sauf maintenance des installations existantes).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Chaudières gaz neuves</strong> : interdites dans les logements neufs depuis
                le 1er janvier 2025 (RE2020).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov’ chaudière gaz</strong> : supprimée depuis 2023 sauf hybrides
                PAC + gaz.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Chaudières biomasse</strong> : nouvelles normes émissions (Ecodesign Lot 15)
                plus strictes depuis 2024.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Démarchage chauffage interdit</p>
                <p className="m-0">
                  Démarchage téléphonique <strong>interdit</strong> depuis juillet 2020 pour la
                  rénovation énergétique. Tout appel non sollicité proposant un changement de
                  chauffage est suspect. Aucun organisme officiel (Anah, France Rénov’) ne sollicite
                  par téléphone. Privilégiez les artisans RGE locaux et les annuaires officiels pour
                  vos devis.
                </p>
              </div>
            </div>
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
