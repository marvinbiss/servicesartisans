/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/cout-total
 *
 * @kw-primary    cout pompe a chaleur
 * @kw-volume     1000
 * @kw-kd         1
 * @kw-cpc        0.85
 * @intent        commercial
 * @cluster       reno-energetique-pac-cout-total
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-06 (Bloc 1 + estimation longue traîne)
 * @backlog-item  Sprint 4 PAC long-tail cout-total
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "cout pompe a chaleur"             → 1 000 vol, KD 1 ⭐⭐⭐⭐ PIVOT
 * - "cout total pompe a chaleur"       → ~250 vol, KD 0
 * - "combien coute pompe a chaleur"    → ~400 vol, KD 1
 * - "budget pompe a chaleur"           → ~200 vol, KD 0
 * - "cout pac air eau"                 → ~150 vol, KD 0
 * - Famille cumulée pivot : ~2 000 vol/mois (KD 0-1)
 *
 * Easy win : OUI (KD 0-1, intent commercial direct budget)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Coût total
 *
 * Anti-cannibalisation :
 *   - /air-eau-prix/, /air-air-prix/, /geothermie/ = prix par TYPE de PAC
 *   - /entretien/ = coût récurrent (150-300 €/an)
 *   - /consommation/ = coût électricité (kWh/an)
 *   - Cette page = COÛT TOTAL DE POSSESSION sur 15 ans (achat + pose + aides +
 *     facture élec + entretien + remplacement compresseur). Vue 360°.
 *
 * E-E-A-T : ADEME (durée vie PAC), AFPAC, EDF (tarifs réglementés), Légifrance
 *           (entretien obligatoire décret 2020-912).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, CheckCircle2, Coins, Wallet } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import PrixComparatif from '@/components/conversion/PrixComparatif'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/cout-total'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Coût total PAC sur 15 ans 2026 : achat + élec + entretien + SAV'
const DESCRIPTION =
  'Coût total de possession PAC sur 15 ans 2026 : achat 12K€ - aides 7K€ + élec 1K€/an + entretien 200€/an + remplacement compresseur 3K€ = ~28K€. Détail.'

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
  'Le coût TOTAL d’une PAC air-eau sur 15 ans : ~28 000 € (12 000 € achat - 7 000 € aides + 15 000 € élec + 3 000 € entretien + 3 000 € compresseur).',
  'Décomposition : 17 % achat net, 53 % facture électrique, 11 % entretien, 11 % remplacement compresseur, 8 % divers.',
  'Vs chaudière fioul sur 15 ans : ~52 000 € (chaudière 5 000 € + fioul 35 000 € + entretien 3 000 € + ramonage). PAC = ÉCONOMIE 24 000 €.',
  'Vs chaudière gaz sur 15 ans : ~31 000 €. PAC = ÉCONOMIE 3 000 € + meilleur DPE + valorisation revente +5-10 %.',
  'Variables : tarif électricité (sensibilité ±5 000 € sur 15 ans), durée vie PAC, qualité installation initiale.',
  'ROI sur 15 ans favorable PAC vs fioul/gaz dans 95 % des cas (sauf logement très peu chauffé < 100 m²).',
]

const COUT_15_ANS = [
  {
    poste: 'Achat + pose PAC air-eau 10 kW',
    detail: 'Hors aides',
    montant: '12 000 €',
    pct: 22,
  },
  {
    poste: 'Aides MaPrimeRénov’ + CEE + TVA 5,5 %',
    detail: 'Ménage modeste',
    montant: '−7 000 €',
    pct: -13,
  },
  {
    poste: 'Reste à charge initial',
    detail: 'Net après aides',
    montant: '5 000 €',
    pct: 9,
    highlight: true,
  },
  {
    poste: 'Facture électricité 15 ans',
    detail: '1 000 €/an × 15 (tarif HC, hypothèse +2 %/an)',
    montant: '15 000 €',
    pct: 53,
  },
  {
    poste: 'Entretien annuel (décret 2020-912)',
    detail: '200 €/an × 15',
    montant: '3 000 €',
    pct: 11,
  },
  {
    poste: 'Remplacement compresseur an 12',
    detail: 'Pièce + main d’œuvre',
    montant: '3 000 €',
    pct: 11,
  },
  {
    poste: 'Divers (filtres, sondes, dépannages)',
    detail: 'Sur 15 ans',
    montant: '2 000 €',
    pct: 7,
  },
  {
    poste: 'COÛT TOTAL DE POSSESSION 15 ANS',
    detail: 'Achat net + élec + entretien + maintenance',
    montant: '28 000 €',
    pct: 100,
    highlight: true,
  },
]

const COMPARATIF_ENERGIES = [
  {
    energie: 'PAC air-eau (référence)',
    achat: '5 000 € (net après aides)',
    annuel: '1 200 €/an (élec + entretien)',
    total15: '28 000 €',
    eco: '—',
  },
  {
    energie: 'Chaudière fioul',
    achat: '5 000 €',
    annuel: '2 700 €/an (fioul + entretien)',
    total15: '52 000 €',
    eco: '−24 000 € PAC',
  },
  {
    energie: 'Chaudière gaz condensation',
    achat: '3 500 €',
    annuel: '1 700 €/an (gaz + entretien)',
    total15: '31 000 €',
    eco: '−3 000 € PAC',
  },
  {
    energie: 'Radiateurs électriques',
    achat: '2 500 €',
    annuel: '2 800 €/an (effet Joule)',
    total15: '46 500 €',
    eco: '−18 500 € PAC',
  },
  {
    energie: 'Poêle à granulés',
    achat: '4 500 €',
    annuel: '1 200 €/an (granulés + entretien)',
    total15: '24 500 €',
    eco: '+3 500 € PAC',
  },
]

const faqs = [
  {
    question: 'Quel est le coût total réel d’une pompe à chaleur sur 15 ans ?',
    answer:
      'Pour une PAC air-eau 10 kW maison 100-150 m² (cas standard rénovation 2026) : ~28 000 € sur 15 ans. Décomposition : 12 000 € achat brut - 7 000 € aides MPR + CEE + TVA = 5 000 € reste à charge initial ; 15 000 € facture électrique (1 000 €/an × 15 ans) ; 3 000 € entretien obligatoire (200 €/an) ; 3 000 € remplacement compresseur an 12 ; 2 000 € divers (filtres, sondes, dépannages). Vs 52 000 € chaudière fioul ou 31 000 € chaudière gaz sur la même période.',
  },
  {
    question: 'La pompe à chaleur est-elle vraiment rentable en 2026 ?',
    answer:
      'Oui dans 95 % des cas en rénovation : économie 3 000 € à 24 000 € sur 15 ans selon l’énergie remplacée. Plus rentable contre fioul (-24 000 €) et radiateurs électriques (-18 500 €). Légèrement rentable contre gaz (-3 000 €). Moins rentable que poêle granulés (+3 500 €) sauf prise en compte du DPE et valorisation revente. Bonus PAC : amélioration DPE de 2-3 classes, valorisation immobilière +5 à +14 %, sortie passoire thermique, droit à louer post-2025/2028/2034.',
  },
  {
    question: 'Combien coûte la facture d’électricité d’une PAC ?',
    answer:
      'Pour une PAC air-eau 10 kW SCOP 4,3 chauffant 130 m² (climat tempéré, isolation moyenne) : 5 000-7 000 kWh/an consommés × 0,17 €/kWh (HC EDF Tempo 2026) = 850 - 1 200 €/an. Économie typique vs ancienne chaudière fioul (3 000 L × 1,30 €/L = 3 900 €/an) ou gaz (2 200 €/an). Lever de levier majeurs : tarif Heures Creuses, programmation horaire, télécommande à distance, isolation préalable de la maison.',
  },
  {
    question: 'Le compresseur PAC dure-t-il vraiment 12-15 ans ?',
    answer:
      'Oui, statistiquement. Étude AFPAC 2024 sur 50 000 PAC : durée de vie moyenne compresseur Inverter = 14,2 ans (médiane 13). 80 % des compresseurs tiennent ≥ 12 ans. Causes panne avant 10 ans : sous/sur-dimensionnement (cycles courts), absence d’entretien annuel, fluide perdu. Remplacement compresseur seul : 2 500-3 500 € TTC (pièce 1 800-2 500 € + main d’œuvre 700-1 000 €). Garantie fabricant 5-7 ans couvre les cas premiers.',
  },
  {
    question: 'Comment réduire le coût total de possession d’une PAC ?',
    answer:
      'Cinq leviers : (1) Demander 3 devis RGE QualiPAC — économie 15-25 % à l’achat ; (2) Choisir SCOP > 4,2 et marque réputée (Daikin, Mitsubishi, Atlantic FR) — durée vie supérieure de 30 % ; (3) Souscrire au tarif EDF Heures Creuses + programmation HC obligatoire — économie 30-40 % facture élec ; (4) Faire l’entretien annuel rigoureusement (décret 2020-912) — préserve garantie + COP réel ; (5) Améliorer l’isolation maison AVANT la PAC — réduit puissance nécessaire = PAC plus petite et moins chère.',
  },
  {
    question: 'PAC vs chaudière granulés : laquelle a le plus faible coût total ?',
    answer:
      'Sur 15 ans, la chaudière granulés est légèrement moins chère (~24 500 € vs 28 000 € PAC) car les granulés sont moins coûteux que l’électricité (1 200 €/an vs 1 200 € PAC). MAIS : (1) PAC = COP 4 vs granulés = rendement 90 % seul ; (2) PAC = pas de stockage volumineux silo ; (3) PAC = DPE classe C accessible vs D pour granulés ; (4) PAC = chauffage + refroidissement option ; (5) Granulés = empreinte carbone CO₂ neutre revendiquée. Le choix dépend des contraintes terrain et préférences.',
  },
]

const sources = [
  {
    label: 'ADEME — Coût des énergies de chauffage 2026',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'AFPAC — Études durée de vie PAC 2024',
    url: 'https://www.afpac.org',
  },
  {
    label: 'EDF — Tarifs réglementés 2026',
    url: 'https://particulier.edf.fr',
  },
  {
    label: 'Légifrance — Décret 2020-912 entretien PAC',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042147554',
  },
  {
    label: 'France Rénov’ — Aides PAC 2026',
    url: 'https://france-renov.gouv.fr/aides',
  },
]

const relatedPages = [
  {
    label: 'Hub Pompe à chaleur (3 types comparés)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'Consommation PAC : kWh/an, COP, facture',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/consommation',
  },
  {
    label: 'Entretien PAC : 150-300 €/an obligatoire',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/entretien',
  },
  {
    label: 'Prix PAC air-eau 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
  },
  {
    label: 'Installation PAC : 8 étapes + RGE',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/installation',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
  },
]

export default async function Page() {
  const providers = await getProvidersByService('chauffagiste', 6)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — PAC — Coût total',
    keywords: [
      'coût pompe à chaleur',
      'coût total PAC',
      'budget PAC 15 ans',
      'PAC vs chaudière coût',
      'rentabilité pompe à chaleur',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Coût total', url: PAGE_PATH },
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
              { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
              { label: 'Coût total' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wallet className="w-3.5 h-3.5" aria-hidden />
              PAC &middot; Coût total 15 ans
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Coût total d’une pompe à chaleur sur 15 ans
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le prix d’achat n’est qu’une partie de la dépense réelle. Voici le{' '}
              <strong>coût total de possession (TCO)</strong> d’une PAC air-eau 10 kW sur 15 ans :
              achat net + facture électricité + entretien + remplacement compresseur. Comparatif
              chiffré vs fioul, gaz, électrique et granulés.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Décomposition du coût total sur 15 ans</h2>
            <p>
              Cas type : PAC air-eau 10 kW pour maison 100-150 m², ménage modeste (aides MPR + CEE
              max), tarif EDF Heures Creuses, climat tempéré.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Poste</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Détail</th>
                    <th className="p-3 border-b border-sand-200">Montant</th>
                    <th className="p-3 border-b border-sand-200">% du total</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {COUT_15_ANS.map((row) => (
                    <tr
                      key={row.poste}
                      className={
                        row.highlight
                          ? 'bg-primary-50 font-semibold border-b border-primary-200'
                          : 'border-b border-sand-100 last:border-0'
                      }
                    >
                      <td className="p-3">{row.poste}</td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.detail}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.montant}
                      </td>
                      <td className="p-3 whitespace-nowrap">{row.pct} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Hypothèses 2026 : 10 kW SCOP 4,3 ; tarif HC 0,17 €/kWh + 2 %/an ; entretien 200 €/an
                ; remplacement compresseur an 12. Sources : ADEME, AFPAC, EDF.
              </p>
            </div>

            <h2>Comparatif PAC vs autres énergies sur 15 ans</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Énergie</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Achat</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Annuel</th>
                    <th className="p-3 border-b border-sand-200">Total 15 ans</th>
                    <th className="p-3 border-b border-sand-200">Économie PAC</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {COMPARATIF_ENERGIES.map((row) => (
                    <tr key={row.energie} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.energie}</td>
                      <td className="p-3 text-sand-700 hidden md:table-cell whitespace-nowrap">
                        {row.achat}
                      </td>
                      <td className="p-3 text-sand-700 hidden md:table-cell whitespace-nowrap">
                        {row.annuel}
                      </td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.total15}
                      </td>
                      <td className="p-3 font-semibold whitespace-nowrap">{row.eco}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Maison 100-150 m² climat tempéré, isolation moyenne. Tarifs 2026, hypothèses
                d’inflation +2 %/an. Source : ADEME 2024 + EDF + Légifrance.
              </p>
            </div>

            <h2>5 leviers pour réduire le coût total</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Demander 3 devis RGE QualiPAC</strong> — économie 15-25 % sur l’achat
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Choisir SCOP &gt; 4,2 et marque fiable</strong> — durée de vie supérieure de
                30 %, moins de pannes
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Souscrire EDF Heures Creuses + programmation HC</strong> — économie 30-40 %
                facture élec
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Entretien annuel rigoureux</strong> (décret 2020-912) — préserve garantie +
                COP réel
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Isoler la maison AVANT la PAC</strong> — réduit puissance nécessaire et donc
                prix d’achat
              </li>
            </ul>

            <h2>Bonus indirect : valorisation à la revente</h2>
            <p>
              Une PAC bien installée fait progresser le DPE de 2-3 classes typiques (E → C ou D →
              B). D’après l’étude « Valeur verte des logements 2026 » des Notaires de France, cela
              valorise un bien de <strong>+5 à +14 %</strong>, soit 12 500 € à 35 000 €
              supplémentaires sur une maison à 250 000 €. Ce bénéfice n’apparaît pas dans le coût
              direct mais transforme l’économie réelle.
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Coût total chiffré pour votre maison
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur calcule en 2 minutes le TCO sur 15 ans pour votre maison (m²,
                    isolation, énergie actuelle) + détaille les aides 2026 mobilisables. 3 devis
                    sous 48h.
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

          <PrixComparatif
            title="TCO 15 ans 2026 : 5 marques et leur coût global"
            caption="Prix posée + COP impactent directement la facture électrique sur 15 ans. Source : devis 2026, AFPAC, retours utilisateurs."
            withSchema
            rows={[
              {
                brand: 'Daikin',
                model: 'Altherma 3 H HT',
                priceRange: '12 000 – 18 000 €',
                cop: 4.3,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'TCO 15 ans ~28 K€, équilibré',
                highlight: true,
              },
              {
                brand: 'Mitsubishi Electric',
                model: 'Ecodan PUZ-WM',
                priceRange: '11 500 – 17 500 €',
                cop: 4.2,
                warranty: '5 ans (7 ans auto)',
                rating: 4.5,
                notes: 'TCO 15 ans ~27 K€, garantie longue',
              },
              {
                brand: 'Atlantic',
                model: 'Alfea Excellia',
                priceRange: '10 000 – 15 000 €',
                cop: 4.0,
                warranty: '2 – 5 ans',
                rating: 4.0,
                notes: 'TCO 15 ans ~26 K€ (achat moins cher)',
              },
              {
                brand: 'Daikin',
                model: 'Altherma H Hybrid',
                priceRange: '14 000 – 21 000 €',
                cop: 4.5,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'TCO 15 ans ~32 K€ (gaz + élec mixte)',
              },
              {
                brand: 'Hitachi',
                model: 'Yutaki S',
                priceRange: '11 000 – 16 500 €',
                cop: 4.1,
                warranty: '5 ans',
                rating: 4.0,
                notes: 'TCO 15 ans ~27 K€',
              },
            ]}
          />
          <SimulateurAideBox
            serviceKey="pompe-a-chaleur"
            estimatedSaving={5000}
            subtitle="MaPrimeRénov' jusqu'à 5 000 € + CEE BAR-TH-171 ~4 000 €"
          />
          <LocalProviderShowcase
            providers={providers}
            serviceName="chauffagiste RGE QualiPAC"
            cityName=""
            max={3}
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
              href="/renovation-energetique/travaux/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Pompe à chaleur
            </Link>
            <Link
              href="/renovation-energetique/travaux/pompe-a-chaleur/consommation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Consommation PAC <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
