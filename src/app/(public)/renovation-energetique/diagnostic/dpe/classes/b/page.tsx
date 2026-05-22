/**
 * Page : /renovation-energetique/diagnostic/dpe/classes/b
 *
 * @kw-primary    dpe classe b
 * @kw-volume     150
 * @kw-kd         0
 * @kw-cpc        0.34
 * @intent        info
 * @cluster       reno-energetique-diagnostic-dpe-classes-b
 * @ahrefs-source docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md (Bloc 1 niche v3)
 * @snapshot      2026-05-06 (Bloc 1 + estimation snapshot — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 3 orphelin DPE classe B (4 % parc, très performant)
 *
 * KW cibles :
 * - "dpe classe b"          → ~150 vol, KD 0
 * - "classe b dpe"          → ~80 vol, KD 0
 * - "logement classe b"     → ~50 vol, KD 0
 * - Famille cumulée pivot : ~330 vol/mois (KD 0-1)
 *
 * Anti-cannibalisation :
 *   - Hub /classes/ = recap A-G
 *   - /classes/{a}/ = excellence
 *   - /classes/{c,d,e,f,g}/ = niveaux inférieurs
 *   - Cette page = focus B (4 % parc, "très performant", saut B → A possible).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Leaf, Sparkles } from 'lucide-react'

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

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/classes/b'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'DPE classe B 2026 : seuils, % parc, saut B→A possible'
const DESCRIPTION =
  'DPE classe B en 2026 : 71-110 kWh/m²/an. 4 % du parc résidentiel français — très performant. Saut B→A via autoconsommation solaire chiffré. Aides 2026.'

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
  'DPE classe B : 71 → 110 kWh/m²/an OU 7 → 11 kg CO₂/m²/an (méthode 3CL-2021).',
  '~1,2 million de logements concernés, soit 4 % du parc résidentiel principal.',
  'Étiquette officielle : "très performant" — proche de l’excellence énergétique.',
  'Aucune contrainte légale (location, vente). Valorisation revente +5-8 % vs C.',
  'Saut B → A possible (~ 12-22 K€) avec autoconsommation solaire 3-6 kWc + ECS thermodynamique.',
  'Aides 2026 : MaPrimeRénov’ Parcours accompagné réduit (saut < 2 classes), CEE Coup de pouce, éco-PTZ.',
]

const SEUILS_B = [
  {
    indicateur: 'Énergie primaire',
    seuil: '71 → 110 kWh/m²/an',
    detail: '5 usages réglementaires. Maisons RT 2012 + rénovations BBC.',
  },
  {
    indicateur: 'Émissions CO₂',
    seuil: '7 → 11 kg CO₂/m²/an',
    detail: 'Excellent niveau bas carbone. Souvent chauffage électrique récent + PAC + ENR.',
  },
  {
    indicateur: 'Facture énergétique',
    seuil: '~ 500 - 900 €/an',
    detail: 'Pour 100 m². Confort thermique optimal + faible vulnérabilité prix énergie.',
  },
]

const SAUT_B_A = {
  cout: '12 - 22 K€',
  aides: '3 - 7 K€',
  reste: '9 - 15 K€',
  travaux:
    'Photovoltaïque autoconsommation 3-6 kWc + ECS thermodynamique + remplacement convecteurs résiduels.',
  impact: '~ 250 €/an économies + production solaire 1 000-2 000 €/an + autonomie partielle.',
  rentabilite:
    'ROI 14-18 ans purement énergétique, mais autonomie + valeur verte +3-5 % à la revente.',
}

const sources = [
  {
    label: 'Arrêté du 31 mars 2021 — méthode 3CL-2021',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043301471',
  },
  {
    label: 'Loi Climat et Résilience n° 2021-1104',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
  },
  {
    label: 'Observatoire DPE-Audit ADEME',
    url: 'https://observatoire-dpe-audit.ademe.fr',
  },
  {
    label: 'France Rénov’ — MaPrimeRénov’ 2026',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'INSEE — Recensement parc logements 2024',
    url: 'https://www.insee.fr',
  },
]

const faqs = [
  {
    question: 'Mon logement classe B doit-il être amélioré ?',
    answer:
      'NON, aucune obligation. La classe B est étiquetée "très performant" et n’est concernée par aucune réglementation actuelle ou prévue. La rénovation B → A est purement optionnelle, généralement motivée par : 1) volonté écologique (zéro carbone) ; 2) autonomie énergétique partielle via photovoltaïque ; 3) valorisation revente niche premium (+3-5 %).',
  },
  {
    question: 'Quel est l’écart B vs A en pratique ?',
    answer:
      'Différence faible mais réelle : B = 71-110 kWh/m²/an, A = ≤ 70 kWh/m²/an. Concrètement, 30-40 kWh/m²/an d’écart se gagne typiquement par : photovoltaïque autoconsommation 3 kWc (réduit conso élec ~30 %) + ECS thermodynamique vs cumulus classique (économie ~ 800 kWh/an pour 4 personnes) + remplacement convecteurs résiduels par PAC réversible. Investissement 12-22 K€ pour saut B → A.',
  },
  {
    question: 'Vendre un B en 2026 : prime ?',
    answer:
      'Oui, valorisation +5-8 % vs un C équivalent dans la plupart des marchés (étude Notaires de France 2024). Délai de vente moyen ~65 jours, plus rapide que la moyenne nationale (75 j). Argument fort en zones tendues (Paris, Lyon, Bordeaux) où la valeur verte est mieux capturée. Une rénovation C → B avant vente n’est rentable que si le marché local valorise la performance énergétique au-delà de la moyenne.',
  },
  {
    question: 'Saut B → A est-il rentable ?',
    answer:
      'Pas purement économiquement (ROI 14-18 ans), mais peut être justifié dans 3 cas : 1) Résidence principale très long terme (15+ ans) — la production solaire 1 000-2 000 €/an + autonomie compensent l’investissement. 2) Volonté écologique (zéro carbone, indépendance réseau). 3) Bailleur premium ciblant clientèle haut de gamme zones tendues — la classe A devient un argument différenciant.',
  },
  {
    question: 'Quelles aides en 2026 pour saut B → A ?',
    answer:
      'MaPrimeRénov’ classique (Parcours accompagné si rénovation d’ampleur > 35 % gain énergétique). PAS de bonus passoire (réservé F/G). Cumulables : prime à l’autoconsommation photovoltaïque (~ 80-380 €/kWc), CEE Coup de pouce 1-2 K€, éco-PTZ 50 K€ taux 0 sur 20 ans, TVA 5,5 %, exonération taxe foncière selon commune. Couverture moyenne 20-35 % du devis HT, vs 50-65 % pour passoires.',
  },
  {
    question: 'Mon DPE B post-2021 est-il fiable ?',
    answer:
      'OUI si réalisé après le 1er juillet 2021 (méthode 3CL-2021 unifiée). Vérification authenticité sur l’Observatoire DPE-Audit ADEME. Attention erreurs fréquentes : 1) Surface SHAB approximative — vérifier vs métré certifié. 2) Hypothèses chauffage — la prise en compte d’une PAC vs convecteurs change la note. 3) Ventilation — VMC double flux vs simple flux peut faire basculer B vers A ou C. En cas de doute, second DPE par autre diagnostiqueur certifié.',
  },
]

export default function DpeClasseBPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Classes A à G', url: '/renovation-energetique/diagnostic/dpe/classes' },
    { name: 'Classe B', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Diagnostic — DPE — Classe B',
    keywords: [
      'dpe classe b',
      'classe b dpe',
      'logement classe b',
      'tres performant dpe',
      'saut b a dpe',
    ],
  })

  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />

      <main className="bg-sand-50 min-h-screen">
        <Breadcrumb
          items={[
            { label: 'Rénovation énergétique', href: '/renovation-energetique' },
            { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
            { label: 'DPE', href: '/renovation-energetique/diagnostic/dpe' },
            { label: 'Classes A à G', href: '/renovation-energetique/diagnostic/dpe/classes' },
            { label: 'Classe B' },
          ]}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6"
        />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" aria-hidden /> Très performant — 4 % du parc
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sand-900 mt-3 mb-3 leading-tight">
              DPE classe B en 2026 : très performant, saut B→A possible
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tout sur la classe B : seuils 3CL-2021, 4 % du parc résidentiel principal (~1,2
              million de logements), étiquette "très performant", valorisation +5-8 % à la revente,
              et saut B→A via autoconsommation solaire chiffré.
            </p>
            <LastUpdated date={MODIFIED} label="Mis à jour le" className="mt-3 text-sm" />
          </header>

          <TldrBlock bullets={tldr} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Définition technique de la classe B
            </h2>
            <p className="text-sand-700 mb-6">
              Méthode 3CL-2021 (arrêté du 31 mars 2021) : la pire des deux notes (énergie primaire
              ou émissions CO₂) est retenue. La classe B = "très performant", proche de l’excellence
              énergétique.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {SEUILS_B.map((s) => (
                <div
                  key={s.indicateur}
                  className="bg-white border-2 border-accent-100 rounded-xl p-5 shadow-sm"
                >
                  <p className="font-semibold text-accent-700 text-sm uppercase tracking-wide">
                    {s.indicateur}
                  </p>
                  <p className="font-heading text-2xl font-bold text-sand-900 mt-2 mb-3">
                    {s.seuil}
                  </p>
                  <p className="text-sm text-sand-600 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Saut B → A : photovoltaïque + thermodynamique
            </h2>
            <p className="text-sand-700 mb-6">
              Le saut B → A est optionnel mais accessible avec un investissement modéré. Levier
              principal : autoconsommation photovoltaïque qui réduit la consommation primaire
              comptabilisée dans le DPE.
            </p>
            <div className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="font-heading text-2xl font-bold text-accent-700 shrink-0">
                  B → A
                </div>
                <div className="flex-1 min-w-[280px]">
                  <p className="text-sand-700 leading-relaxed mb-3">
                    <strong>Travaux : </strong>
                    {SAUT_B_A.travaux}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Coût HT</p>
                      <p className="font-semibold text-sand-900">{SAUT_B_A.cout}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Aides</p>
                      <p className="font-semibold text-accent-700">{SAUT_B_A.aides}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Reste à charge</p>
                      <p className="font-semibold text-sand-900">{SAUT_B_A.reste}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Rentabilité</p>
                      <p className="font-semibold text-sand-700 text-xs leading-snug">
                        {SAUT_B_A.rentabilite}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-sand-600 mt-3 border-t border-sand-100 pt-3">
                    <Leaf className="inline w-4 h-4 text-accent-600 mr-1" aria-hidden />
                    {SAUT_B_A.impact}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="my-10 bg-accent-50 border-2 border-accent-200 rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-accent-900 mb-3">
              <Calculator className="inline w-5 h-5 mr-2" aria-hidden />
              Estimer mes aides en 2 minutes
            </h2>
            <p className="text-sm text-accent-800 mb-4 leading-relaxed">
              Le simulateur officiel France Rénov’ calcule MaPrimeRénov’ + CEE + éco-PTZ + prime à
              l’autoconsommation selon votre revenu fiscal et la classe DPE de départ.
            </p>
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 bg-accent-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-800 transition-colors"
            >
              Simulateur aides
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>

          <SimulateurAideBox
            serviceKey="renovation-energetique"
            estimatedSaving={3000}
            title="Maintenir mon DPE A/B/C : aides entretien"
            subtitle="Éco-gestes + remplacement équipements vieillissants — MaPrimeRénov' par geste"
          />

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {[
                {
                  label: 'Hub Classes DPE A à G',
                  href: '/renovation-energetique/diagnostic/dpe/classes',
                },
                {
                  label: 'DPE classe A — excellence',
                  href: '/renovation-energetique/diagnostic/dpe/classes/a',
                },
                {
                  label: 'DPE classe C — performant',
                  href: '/renovation-energetique/diagnostic/dpe/classes/c',
                },
                {
                  label: 'Solaire autoconsommation — guide',
                  href: '/renovation-energetique/travaux/solaire/autoconsommation',
                },
                {
                  label: 'Pompe à chaleur — guide complet',
                  href: '/renovation-energetique/travaux/pompe-a-chaleur',
                },
                {
                  label: 'MaPrimeRénov’ 2026',
                  href: '/renovation-energetique/aides/maprimerenov-2026',
                },
              ].map((g) => (
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
        </article>
      </main>
    </>
  )
}
