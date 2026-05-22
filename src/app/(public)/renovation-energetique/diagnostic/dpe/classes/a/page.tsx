/**
 * Page : /renovation-energetique/diagnostic/dpe/classes/a
 *
 * @kw-primary    dpe classe a
 * @kw-volume     250
 * @kw-kd         0
 * @kw-cpc        0.32
 * @intent        info
 * @cluster       reno-energetique-diagnostic-dpe-classes-a
 * @ahrefs-source docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md (Bloc 1 niche v3)
 * @snapshot      2026-05-06 (Bloc 1 + estimation snapshot — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 3 orphelin DPE classe A (1 % parc, excellence énergétique)
 *
 * KW cibles :
 * - "dpe classe a"          → ~250 vol, KD 0
 * - "classe a dpe"          → ~120 vol, KD 0
 * - "logement classe a"     → ~80 vol, KD 0
 * - "dpe a"                 → ~100 vol, KD 1
 * - Famille cumulée pivot : ~550 vol/mois (KD 0-1)
 *
 * Anti-cannibalisation :
 *   - Hub /classes/ = recap A-G
 *   - /classes/{b,c,d,e,f,g}/ = niveaux inférieurs
 *   - Cette page = focus A (1 % parc, excellence, valorisation +10-15 %, RT 2012/RE 2020).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Star } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/classes/a'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'DPE classe A 2026 : seuils, excellence, valorisation revente'
const DESCRIPTION =
  'DPE classe A en 2026 : ≤ 70 kWh/m²/an. 1 % du parc résidentiel français — excellence énergétique. RT 2012 / RE 2020. Valorisation +10-15 % à la revente.'

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
  'DPE classe A : ≤ 70 kWh/m²/an ET ≤ 6 kg CO₂/m²/an (méthode 3CL-2021).',
  '~300 000 logements concernés, soit 1 % du parc résidentiel principal — excellence énergétique.',
  'Étiquette officielle : "très performant" (catégorie haute, A et B regroupées).',
  'Concerne quasi-exclusivement les maisons RT 2012, RE 2020, BBC Effinergie + rénovations BBC complètes.',
  'Valorisation revente : +10-15 % vs un C équivalent (étude Notaires de France 2024 — zones tendues).',
  'Maintien : entretien PAC + ventilation + étanchéité fenêtres + bilan biennal performance ENR.',
]

const SEUILS_A = [
  {
    indicateur: 'Énergie primaire',
    seuil: '≤ 70 kWh/m²/an',
    detail: '5 usages réglementaires. Niveau RT 2012 / RE 2020 minimum requis.',
  },
  {
    indicateur: 'Émissions CO₂',
    seuil: '≤ 6 kg CO₂/m²/an',
    detail: 'Très bas carbone. PAC + ENR + ECS thermodynamique + élec ENR (auto-conso solaire).',
  },
  {
    indicateur: 'Facture énergétique',
    seuil: '~ 250 - 600 €/an',
    detail: 'Pour 100 m². Faible vulnérabilité prix énergie + autonomie partielle si solaire.',
  },
]

const TYPOLOGIE_A = [
  {
    type: 'Construction RT 2012',
    detail:
      'Maisons construites entre 2013 et 2021 sous Réglementation Thermique 2012 — souvent classées B ou A selon performance technique réelle (étanchéité air mesurée, ENR intégrées).',
  },
  {
    type: 'Construction RE 2020',
    detail:
      'Maisons construites depuis 2022 sous Réglementation Environnementale 2020 — quasi-systématiquement classées A par exigence carbone renforcée + obligation ENR.',
  },
  {
    type: 'Rénovation BBC complète',
    detail:
      'Rénovations rares mais existantes : ITE 20 cm + PAC + VMC double flux + photovoltaïque autoconsommation + ECS thermodynamique. Investissement typique 60-90 K€ pour saisons C/D vers A.',
  },
  {
    type: 'BBC Effinergie label',
    detail:
      'Logements ayant obtenu le label Effinergie (post-2007) — déjà très performants, classés A ou B selon nuances calcul DPE 3CL-2021.',
  },
]

const sources = [
  {
    label: 'Arrêté du 31 mars 2021 — méthode 3CL-2021',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043301471',
  },
  {
    label: 'RT 2012 — décret 2010-1269',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000023049033',
  },
  {
    label: 'RE 2020 — décret 2021-1004',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043884448',
  },
  {
    label: 'Effinergie — labels BBC',
    url: 'https://www.effinergie.org',
  },
  {
    label: 'Observatoire DPE-Audit ADEME',
    url: 'https://observatoire-dpe-audit.ademe.fr',
  },
  {
    label: 'Notaires de France — Étude valeur verte 2024',
    url: 'https://www.notaires.fr',
  },
  {
    label: 'INSEE — Recensement parc logements 2024',
    url: 'https://www.insee.fr',
  },
]

const faqs = [
  {
    question: 'Quels logements sont en classe A en 2026 ?',
    answer:
      'Quasi-exclusivement : 1) maisons construites sous RE 2020 (depuis 2022) — quasi-systématiquement classées A par obligations ENR + carbone bas. 2) Maisons RT 2012 (2013-2021) avec ENR intégrées et étanchéité air optimale. 3) Logements labellisés BBC Effinergie. 4) Très rares rénovations BBC complètes (60-90 K€ d’investissement). Soit ~300 000 logements en France, 1 % du parc résidentiel principal (INSEE 2024).',
  },
  {
    question: 'Comment maintenir un DPE A dans le temps ?',
    answer:
      'Plusieurs entretiens essentiels : 1) PAC : entretien annuel obligatoire (loi 2020) par RGE QualiPAC, 100-200 €. 2) VMC : nettoyage filtres tous les 6 mois + bilan complet tous les 3 ans. 3) Étanchéité fenêtres : vérification joints tous les 5 ans. 4) Photovoltaïque (si présent) : nettoyage panneaux annuel + suivi production via app. 5) Bilan biennal performance globale (recommandé, non obligatoire) — DPE post-travaux refait après modifications majeures. Coût total moyen : 200-400 €/an.',
  },
  {
    question: 'Vendre un A en 2026 : quelle prime ?',
    answer:
      'Valorisation +10-15 % vs un C équivalent (étude Notaires de France 2024). Forte hétérogénéité régionale : 5-8 % en zones rurales, 12-18 % en zones tendues (Paris, Lyon, Bordeaux). Délai de vente moyen ~50-60 jours, plus rapide que la moyenne nationale (75 j). Argument fort pour : 1) rassurer acheteurs sur facture énergétique long terme. 2) Attirer banques (taux préférentiels prêt vert pour DPE A/B). 3) Cibler clientèle haut de gamme + écologique.',
  },
  {
    question: 'Mon DPE A peut-il devenir B ou C ?',
    answer:
      'Possible dans 4 cas : 1) Vétusté progressive : isolation tassée, étanchéité air dégradée, PAC qui perd en rendement après 10-15 ans. 2) Dégradation entretien : PAC non entretenue, VMC encrassée, photovoltaïque non nettoyé. 3) Changement d’usage : passage de résidence secondaire à principale modifie le calcul. 4) Évolution méthode DPE : un futur arrêté plus strict pourrait revoir les seuils 3CL-2021 (annoncé 2-3 ans à l’avance). Solution : DPE post-travaux ou re-DPE pour confirmer.',
  },
  {
    question: 'Aides 2026 pour rénover vers une classe A ?',
    answer:
      'Saut C/D → A justifié uniquement résidence principale long terme (15+ ans). MaPrimeRénov’ Parcours accompagné jusqu’à 70 K€ HT (rénovation d’ampleur > 35 % gain énergétique) + bonus saut ≥ 2 classes 1 500 €. Cumulables : prime à l’autoconsommation photovoltaïque (~ 80-380 €/kWc), CEE Coup de pouce 3-5 K€, éco-PTZ 50 K€ taux 0 sur 20 ans, TVA 5,5 %, exonération taxe foncière 3-5 ans. Couverture moyenne 30-40 % du devis HT (saut très long, peu d’aides marginales vs sauts depuis passoires).',
  },
  {
    question: 'Quelle différence A vs A++ ?',
    answer:
      'Le DPE officiel s’arrête à la classe A. Le label "A++" n’existe pas dans la méthode 3CL-2021 réglementaire. Certains constructeurs ou labels privés (Maison passive Passivhaus, BEPOS Effinergie) utilisent des appellations supplémentaires pour des logements à énergie positive (production > consommation). Pour la valorisation officielle DPE, A reste le top atteignable. Une maison "passive" est généralement classée A avec une marge confortable mais reste juridiquement A au sens du DPE.',
  },
]

export default function DpeClasseAPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Classes A à G', url: '/renovation-energetique/diagnostic/dpe/classes' },
    { name: 'Classe A', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Diagnostic — DPE — Classe A',
    keywords: [
      'dpe classe a',
      'classe a dpe',
      'logement classe a',
      'dpe a',
      'excellence dpe',
      'rt 2012',
      're 2020',
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
            { label: 'Classe A' },
          ]}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6"
        />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Star className="w-3.5 h-3.5" aria-hidden /> Excellence — 1 % du parc
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sand-900 mt-3 mb-3 leading-tight">
              DPE classe A en 2026 : excellence énergétique, valorisation +10-15 %
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tout sur la classe A : seuils 3CL-2021 (≤ 70 kWh/m²/an), 1 % du parc résidentiel
              principal (~300 000 logements), construite RT 2012 / RE 2020 ou rénovée BBC complète,
              valorisation revente +10-15 % vs un C équivalent.
            </p>
            <LastUpdated date={MODIFIED} label="Mis à jour le" className="mt-3 text-sm" />
          </header>

          <TldrBlock bullets={tldr} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Définition technique de la classe A
            </h2>
            <p className="text-sand-700 mb-6">
              Méthode 3CL-2021 (arrêté du 31 mars 2021) : la classe A exige les deux notes (énergie
              primaire ET émissions CO₂) au top niveau. Aucune tolérance — un seul seuil dépassé
              fait basculer en B.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {SEUILS_A.map((s) => (
                <div
                  key={s.indicateur}
                  className="bg-white border-2 border-accent-200 rounded-xl p-5 shadow-sm"
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
              Quels logements sont en classe A en 2026 ?
            </h2>
            <div className="space-y-3">
              {TYPOLOGIE_A.map((t) => (
                <div
                  key={t.type}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-sand-900 mb-1">{t.type}</h3>
                  <p className="text-sm text-sand-600 leading-relaxed">{t.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10 bg-accent-50 border-2 border-accent-200 rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-accent-900 mb-3">
              <Calculator className="inline w-5 h-5 mr-2" aria-hidden />
              Estimer mes aides en 2 minutes
            </h2>
            <p className="text-sm text-accent-800 mb-4 leading-relaxed">
              Si vous envisagez une rénovation BBC complète (D/C → A), le simulateur officiel France
              Rénov’ calcule MaPrimeRénov’ Parcours accompagné + CEE + éco-PTZ + prime
              autoconsommation.
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
                  label: 'DPE classe B — très performant',
                  href: '/renovation-energetique/diagnostic/dpe/classes/b',
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
                  label: 'VMC double flux — guide',
                  href: '/renovation-energetique/travaux/vmc/double-flux-thermodynamique',
                },
                {
                  label: 'MaPrimeRénov’ Parcours accompagné',
                  href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
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
