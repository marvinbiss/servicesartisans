/**
 * Page : /renovation-energetique/travaux/chauffage/chaudiere-condensation
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "chaudiere a condensation"     → 794 vol, KD 1, CPC $0,80, clicks 898 ⭐⭐ EASY WIN
 * - "chaudiere condensation"       → 502 vol, KD 3, CPC $1,00, clicks 701 ⭐⭐
 * - "prix chaudiere condensation"  → longue traîne KD bas
 * - "chaudiere gaz condensation"   → longue traîne KD bas
 * - Famille cumulée pivot : ~1 700 vol/mois (KD 1-3 = easy win)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MAJEUR (KD 1-3, intent prix élevé)
 *            Atout SA : positionnement transition honnête (chaudière gaz pas l'avenir mais reste utile)
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Chaudière condensation
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Flame,
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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chaudiere-condensation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Chaudière condensation 2026 : prix & MPR'
const DESCRIPTION =
  'Chaudière condensation 2026 : prix posé 4 500-7 500 €, rendement 105-110 %, durée 15-20 ans. Pourquoi MPR a disparu et alternatives PAC.'

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
  'Chaudière à condensation = chaudière gaz haute performance (rendement 105-110 % PCI).',
  'Prix posé 2026 : 4 500-7 500 € selon puissance (12-30 kW) et marque.',
  'Interdite à l’installation dans le neuf depuis 2025 (RE2020) — autorisée en remplacement.',
  'NON éligible MaPrimeRénov’ depuis 2024 (sauf hybride PAC + condensation).',
  'CEE limité (300-700 € selon dossier). Éco-PTZ possible si combiné isolation.',
  'Alternative recommandée : PAC air-eau (aides MPR + CEE massives).',
]

const PRIX_CONDENSATION = [
  {
    puissance: '12-15 kW (T2/T3)',
    prix: '4 500-5 500 € posé',
    detail: 'Murale gaz, ECS instantanée ou micro-accumulation',
  },
  {
    puissance: '18-25 kW (maison 100 m²)',
    prix: '5 500-7 500 € posé',
    detail: 'Murale ou sol selon ECS (ballon ou instantané)',
  },
  {
    puissance: '25-35 kW (grande maison)',
    prix: '6 500-9 500 € posé',
    detail: 'Sol avec ballon eau chaude 100-150 L intégré',
  },
]

const COMPARATIF_VS_PAC = [
  { critere: 'Prix posé (10 kW)', condensation: '5 500-7 500 €', pac: '12 000-15 000 €' },
  { critere: 'MaPrimeRénov’', condensation: '0 €', pac: '3 000-5 000 €' },
  { critere: 'CEE Coup de pouce', condensation: '300-700 €', pac: '2 500-4 000 €' },
  { critere: 'Éco-PTZ', condensation: 'Si combiné isolation', pac: 'Oui directement' },
  { critere: 'TVA', condensation: '5,5 % (avec RGE)', pac: '5,5 % (avec RGE)' },
  { critere: 'Coût gaz/an (100 m²)', condensation: '900-1 600 €', pac: '500-1 000 € (élec)' },
  { critere: 'CO2 émis/an', condensation: '2,5-4 t CO2eq', pac: '0,8-1,5 t CO2eq' },
  { critere: 'Durée de vie', condensation: '15-20 ans', pac: '15-20 ans' },
]

const QUAND_CHOISIR = [
  {
    cas: 'Vous remplacez une vieille chaudière gaz (> 20 ans)',
    reco: '✅ Pertinent en attente de PAC',
    detail:
      'Si vous n’êtes pas prêt à passer à la PAC (budget, travaux), une condensation maintient le gaz tout en réduisant la facture de 20-30 %.',
  },
  {
    cas: 'Vous avez une chaudière fioul',
    reco: '❌ Non recommandé',
    detail:
      'Préférez une PAC air-eau : aides massives (MPR 5 000 € + CEE 4 000 € Bleu) et économies factures 50-70 %. La condensation gaz est une fausse bonne idée (gaz fossile reste cher).',
  },
  {
    cas: 'Vous construisez en neuf',
    reco: '❌ Interdit RE2020',
    detail:
      'Depuis le 1er janvier 2025, les chaudières gaz sont interdites dans les logements neufs (RE2020). Obligation PAC, biomasse ou raccordement réseau de chaleur.',
  },
  {
    cas: 'Vous habitez en zone sans réseau gaz',
    reco: '❌ Pas pertinent',
    detail:
      'Sans gaz de ville, la condensation n’a pas d’intérêt. Préférez PAC air-eau, chaudière biomasse ou poêle granulés.',
  },
  {
    cas: 'Vous voulez de l’hybride PAC + condensation',
    reco: '✅ Possible MPR maintenue',
    detail:
      'Les chaudières hybrides (PAC + appoint condensation) restent éligibles MPR (forfait identique à la PAC seule). Intéressant pour grands volumes mal isolés.',
  },
]

const faqs = [
  {
    question: 'Combien coûte une chaudière à condensation en 2026 ?',
    answer:
      'Prix posé clé en main 2026 : 4 500-5 500 € pour une murale 12-15 kW (T2/T3), 5 500-7 500 € pour une murale 18-25 kW (maison 100 m²), 6 500-9 500 € pour un modèle au sol avec ballon ECS 100-150 L intégré. Le matériel représente 50-60 % du devis (1 800-3 500 € pour une bonne marque type Viessmann, De Dietrich, Saunier Duval), la pose et le raccordement 40-50 %.',
  },
  {
    question: 'Pourquoi la chaudière à condensation n’est plus éligible MaPrimeRénov’ ?',
    answer:
      'Depuis 2024, MaPrimeRénov’ a supprimé le financement des chaudières gaz à condensation pour orienter les ménages vers les énergies renouvelables (PAC, biomasse, solaire). Raisons : (1) le gaz reste fossile et émet 2,5-4 t CO2eq/an pour 100 m², (2) la PAC est maintenant techniquement mature et plus compétitive, (3) les aides massives concentrées sur EnR accélèrent la transition. Exception : les chaudières hybrides (PAC + appoint gaz condensation) restent éligibles.',
  },
  {
    question: 'Chaudière à condensation vs PAC air-eau : laquelle choisir ?',
    answer:
      'PAC air-eau systématiquement si vous remplacez une chaudière fioul (aides MPR 5 000 € + CEE 4 000 € Bleu, économies factures 50-70 %). Condensation gaz uniquement si : (1) chaudière gaz existante en panne et budget limité, (2) zone non accessible PAC (très collectif sans extérieur), (3) attente de rénovation globale ultérieure avec PAC. À long terme, le gaz restera cher (taxe carbone, instabilité géopolitique) — la PAC est l’investissement d’avenir.',
  },
  {
    question: 'Quel rendement attendre d’une chaudière à condensation ?',
    answer:
      'Rendement nominal sur PCI (Pouvoir Calorifique Inférieur) : 105-110 % pour une condensation moderne (vs 80-90 % pour une chaudière gaz classique). Le rendement &gt; 100 % vient de la récupération de la chaleur de condensation des fumées (vapeur d’eau). En pratique, le rendement saisonnier réel ηs : 92-94 % (limite physique). Économie annuelle vs chaudière classique : 15-25 % sur la facture gaz, soit 200-400 €/an pour une maison 100 m².',
  },
  {
    question: 'Faut-il un conduit d’évacuation spécifique ?',
    answer:
      'Oui. Les chaudières à condensation produisent des fumées plus froides (50-60 °C vs 150-200 °C pour une classique) chargées en vapeur d’eau condensée. Conduit obligatoire en PEHD ou inox étanche (résistant à la condensation acide). Si remplacement d’une chaudière classique : tubage du conduit existant (300-800 €) ou installation ventouse horizontale (150-400 €). Évacuation des condensats vers les eaux usées (avec siphon).',
  },
  {
    question: 'Quel artisan installer une chaudière à condensation ?',
    answer:
      'Plombier-chauffagiste qualifié <strong>QualiGaz</strong> (manipulation gaz). Pour bénéficier des CEE et de la TVA 5,5 %, mention RGE complémentaire requise (souvent intégrée à QualiGaz). Vérifier : assurance décennale, références chantiers, devis détaillé avec marque, modèle, rendement saisonnier ηs, mise en service et contrôle de combustion. Au moins 2-3 devis comparés.',
  },
  {
    question: 'Quel entretien et durée de vie ?',
    answer:
      'Entretien annuel obligatoire (loi 2009) : 120-180 € HT par an. Inclut nettoyage brûleur, contrôle combustion, vérification des sécurités. Durée de vie moyenne : 15-20 ans. Signes de fin de vie : surconsommation (rendement &lt; 90 %), pannes répétées, corrosion, bruit. Remplacement à anticiper avant la 18e année pour éviter une panne en plein hiver.',
  },
  {
    question: 'Chaudière à condensation hybride : kezako ?',
    answer:
      'Système combinant une PAC air-eau (chauffage principal) et une chaudière gaz à condensation (appoint pour grand froid ou pic de demande). Idéal pour les maisons mal isolées où une PAC seule serait sous-dimensionnée. Prix posé 2026 : 14 000-22 000 €. Aides : éligible MaPrimeRénov’ (forfait identique PAC seule), CEE Coup de pouce, éco-PTZ. ROI 7-10 ans.',
  },
]

const sources = [
  { label: 'France Rénov’ — Chaudière condensation', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Chauffage gaz', url: 'https://www.ademe.fr' },
  {
    label: 'Service-Public.fr — Entretien chaudière',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31894',
  },
  { label: 'Légifrance — RE2020 chaudières gaz neuf', url: 'https://www.legifrance.gouv.fr' },
  { label: 'GRDF — Chaudière à condensation', url: 'https://www.grdf.fr' },
]

const relatedPages = [
  {
    label: 'Chaudière gaz 2026 — panorama 4 types',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz',
    description: 'Atmosphérique, BT, condensation, hybride',
  },
  {
    label: 'Entretien chaudière gaz 2026 — prix & obligation',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation/entretien',
    description: '100-180 € HT, 12 points, attestation 2 ans',
  },
  {
    label: 'Hub Chauffage',
    href: '/renovation-energetique/travaux/chauffage',
    description: 'Comparatif PAC, granulés, condensation',
  },
  {
    label: 'PAC air-eau prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: 'Alternative recommandée — aides massives',
  },
  {
    label: 'Poêle à granulés',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
    description: 'EnR pour appoint ou principal',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ',
  },
  {
    label: 'Trouver un artisan QualiGaz',
    href: '/services/chauffagiste',
    description: 'Annuaire vérifié',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Comparer chaudière vs PAC',
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
    section: 'Chaudière à condensation',
    keywords: [
      'chaudiere a condensation',
      'chaudiere condensation',
      'prix chaudiere condensation',
      'chaudiere gaz condensation',
      'chaudiere condensation 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Chaudière condensation', url: PAGE_PATH },
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
              { label: 'Chaudière condensation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Énergie fossile — MPR supprimée 2024
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Chaudière à condensation 2026 : prix et alternatives
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>chaudière à condensation</strong> est une chaudière gaz haute performance
              (rendement 105-110 %) qui récupère la chaleur des fumées condensées. Prix posé 2026 :{' '}
              <strong>4 500 à 7 500 €</strong>. Mais depuis 2024, elle n’est{' '}
              <strong>plus éligible MaPrimeRénov’</strong> (sauf hybride PAC) et reste interdite à
              l’installation en logement neuf (RE2020 depuis 2025). Voici quand elle reste
              pertinente et quelles alternatives privilégier.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="prix">Prix chaudière à condensation 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {PRIX_CONDENSATION.map((p) => (
                <div key={p.puissance} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {p.puissance}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {p.prix}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Aides limitées en 2026</p>
                <p className="m-0">
                  MaPrimeRénov’ supprimée pour la chaudière à condensation gaz seule depuis 2024
                  (sauf hybride PAC + condensation). CEE limité (300-700 €). Éco-PTZ possible
                  uniquement si combiné avec d’autres travaux d’économie d’énergie (isolation, PAC,
                  VMC). TVA 5,5 % maintenue avec artisan QualiGaz/RGE.
                </p>
              </div>
            </div>

            <h2 id="comparatif">Comparatif chaudière condensation vs PAC air-eau</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Chaudière condensation</th>
                    <th className="p-3 border-b border-sand-200">PAC air-eau</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF_VS_PAC.map((c) => (
                    <tr key={c.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{c.critere}</td>
                      <td className="p-3 text-amber-700">{c.condensation}</td>
                      <td className="p-3 text-primary-700 font-semibold">{c.pac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="quand">Quand la chaudière à condensation reste pertinente</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUAND_CHOISIR.map((q) => (
                <div key={q.cas} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">{q.cas}</p>
                  <p className="text-sm font-bold text-primary-700 m-0 mb-1">{q.reco}</p>
                  <p className="text-sm text-sand-700 m-0">{q.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Comparer chaudière condensation vs PAC air-eau
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané prix posé, aides, économies factures. Mise en relation artisan
                    QualiGaz ou QualiPAC selon votre choix.
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

            <h2 id="installation">Installation et obligations</h2>
            <ul>
              <li>
                <Wrench className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Conduit étanche</strong> : tubage PEHD ou inox résistant à la condensation
                acide. Obligation si remplacement chaudière classique.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Évacuation condensats</strong> : raccordement réseau eaux usées avec siphon.
                Légèrement acide (pH 4-5) mais autorisé.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Entretien annuel</strong> : obligatoire (décret 2009-649), 120-180 €/an.
                Contrôle combustion, nettoyage brûleur, attestation à conserver 2 ans.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marques fiables</strong> : Viessmann, De Dietrich, Saunier Duval, Vaillant,
                Frisquet, Atlantic.
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
              href="/renovation-energetique/travaux/chauffage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Chauffage
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
