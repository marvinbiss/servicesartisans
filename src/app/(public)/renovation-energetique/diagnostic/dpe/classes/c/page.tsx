/**
 * Page : /renovation-energetique/diagnostic/dpe/classes/c
 *
 * @kw-primary    dpe classe c
 * @kw-volume     300
 * @kw-kd         0
 * @kw-cpc        0.36
 * @intent        info
 * @cluster       reno-energetique-diagnostic-dpe-classes-c
 * @ahrefs-source docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md (Bloc 1 niche v3)
 * @snapshot      2026-05-06 (Bloc 1 + estimation snapshot — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 3 orphelin DPE classe C (24 % parc, performant)
 *
 * KW cibles :
 * - "dpe classe c"          → ~300 vol, KD 0 ⭐⭐⭐
 * - "classe c dpe"          → ~150 vol, KD 0
 * - "logement classe c"     → ~80 vol, KD 0
 * - "dpe c"                 → ~120 vol, KD 1
 * - Famille cumulée pivot : ~650 vol/mois (KD 0-1)
 *
 * Anti-cannibalisation :
 *   - Hub /classes/ = recap A-G
 *   - /classes/{a,b}/ = très performant
 *   - /classes/{d,e,f,g}/ = médiocre/mauvais/passoires
 *   - Cette page = focus C (24 % parc, "performant", optimisation marginale possible).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, CheckCircle2, Leaf } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/classes/c'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'DPE classe C 2026 : seuils, % parc, optimisation C→B/A'
const DESCRIPTION =
  'DPE classe C en 2026 : 111-180 kWh/m²/an. 24 % du parc résidentiel français — performant. 2 sauts C→B/A chiffrés. Aides MaPrimeRénov’ 2026.'

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
  'DPE classe C : 111 → 180 kWh/m²/an OU 12 → 30 kg CO₂/m²/an (méthode 3CL-2021).',
  '~7,2 millions de logements concernés, soit 24 % du parc résidentiel principal.',
  'Étiquette officielle : "performant" — optimisation marginale possible mais pas obligatoire.',
  'Pas concerné par interdictions location actuelles ni à 10+ ans.',
  'Saut C → B (~ 8-14 K€) optionnel : ROI 12-18 ans, surtout pertinent en rénovation globale.',
  'Aides 2026 : MaPrimeRénov’ classique, CEE, éco-PTZ. 25-40 % du devis HT couvert pour ménage modeste.',
]

const SEUILS_C = [
  {
    indicateur: 'Énergie primaire',
    seuil: '111 → 180 kWh/m²/an',
    detail: '5 usages réglementaires. Maisons RT 2005-2012 ou rénovations partielles récentes.',
  },
  {
    indicateur: 'Émissions CO₂',
    seuil: '12 → 30 kg CO₂/m²/an',
    detail: 'Si dépassé seul → bascule en C malgré conso < 111. Cas chauffage gaz récent.',
  },
  {
    indicateur: 'Facture énergétique',
    seuil: '~ 700 - 1 300 €/an',
    detail: 'Pour 100 m². Performant : confort thermique correct, marge optimisation 15-25 %.',
  },
]

const SAUTS_C = [
  {
    saut: 'C → B',
    cout: '8 - 14 K€',
    aides: '2 - 5 K€',
    reste: '6 - 9 K€',
    travaux: 'ITE 8-10 cm + remplacement chaudière classique → PAC ou ballon thermodynamique.',
    impact: '~ 400 €/an économies + confort été (ITE atténue surchauffe estivale).',
    rentabilite:
      'ROI 12-18 ans. Pertinent uniquement en rénovation programmée + autoconso solaire.',
  },
  {
    saut: 'C → A',
    cout: '25 - 40 K€',
    aides: '8 - 15 K€',
    reste: '17 - 25 K€',
    travaux:
      'ITE 14 cm + PAC réversible + photovoltaïque autoconsommation 3-6 kWc + VMC double flux.',
    impact: '~ 700 €/an économies + production solaire 1 000-2 000 €/an.',
    rentabilite: 'ROI 18-25 ans. Justifié résidence principale très long terme + écologie pure.',
  },
]

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
    question: 'Faut-il rénover un DPE classe C ?',
    answer:
      'Non, pas obligatoire. La classe C est étiquetée "performant" et n’est concernée par aucune interdiction location actuelle ni prévue à 10+ ans. La rénovation reste optionnelle, justifiée principalement par : 1) baisse de facture énergétique (~ 400 €/an pour saut C → B) ; 2) amélioration confort été (ITE) ; 3) anticipation revente long terme (B = signal "très performant").',
  },
  {
    question: 'Mon logement classe C peut-il devenir D un jour ?',
    answer:
      'Théoriquement oui si : 1) un nouveau DPE plus strict est instauré (méthode 3CL-2021 pourrait être renforcée par un futur arrêté). 2) Vétusté progressive du bâti (isolation tassée, chaudière qui perd en rendement). 3) Changement d’usage (passage de résidence secondaire à principale modifie le calcul). En pratique, les changements de méthode DPE sont annoncés 2-3 ans à l’avance pour permettre adaptation.',
  },
  {
    question: 'Vendre un C en 2026 : valorisation ?',
    answer:
      'Pas de bonus particulier vs un D dans la plupart des marchés. Délai de vente moyen ~70-75 jours, équivalent à la moyenne nationale. La valeur verte commence à se manifester clairement à partir de la classe B et plus encore A (étude Notaires de France 2024). Une rénovation C → B avant vente n’est rentable que si le marché local valorise très fortement la performance énergétique (zones tendues comme Paris, Lyon).',
  },
  {
    question: 'Quel ROI pour saut C → B ?',
    answer:
      'ROI 12-18 ans typiquement, soit faible vs sauts depuis classes inférieures. Économies ~ 400 €/an pour 8-14 K€ HT investis (reste à charge 6-9 K€ après aides). Le saut se justifie principalement en rénovation programmée (changement chaudière de toute façon nécessaire, ITE prévue, etc.) ou en couplage avec autoconsommation photovoltaïque qui ajoute 1 000-2 000 €/an de revenus solaires.',
  },
  {
    question: 'Quelles aides pour rénover un C en 2026 ?',
    answer:
      'MaPrimeRénov’ classique (Parcours accompagné si saut ≥ 2 classes ou rénovation d’ampleur > 35 % gain énergétique). PAS de bonus passoire (réservé F/G). Cumulables : CEE Coup de pouce 1-3 K€, éco-PTZ 50 K€ taux 0 sur 20 ans, TVA 5,5 % travaux RGE. Total moyen 25-40 % du devis HT couvert pour ménage modeste, vs 50-65 % pour passoires.',
  },
  {
    question: 'Mon DPE classe C est-il fiable ?',
    answer:
      'OUI si réalisé après le 1er juillet 2021 (méthode 3CL-2021). Les DPE antérieurs sont caducs depuis le 1er janvier 2025. Vérification authenticité sur l’Observatoire DPE-Audit ADEME (numéro à 13 caractères). En cas de doute, demander un re-DPE par autre diagnostiqueur certifié — le DPE étant valide 10 ans, mieux vaut le sécuriser dès le départ pour éviter mauvaise surprise lors de revente.',
  },
]

export default function DpeClasseCPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Classes A à G', url: '/renovation-energetique/diagnostic/dpe/classes' },
    { name: 'Classe C', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Diagnostic — DPE — Classe C',
    keywords: ['dpe classe c', 'classe c dpe', 'logement classe c', 'dpe c', 'performant dpe'],
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
            { label: 'Classe C' },
          ]}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6"
        />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden /> Performant — 24 % du parc
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sand-900 mt-3 mb-3 leading-tight">
              DPE classe C en 2026 : performant, 24 % du parc, optimisation
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tout sur la classe C : seuils 3CL-2021, 24 % du parc résidentiel principal (~7,2
              millions de logements), étiquette officielle "performant", pas de contrainte légale,
              et 2 sauts d’optimisation chiffrés (C→B, C→A) avec aides 2026.
            </p>
            <LastUpdated date={MODIFIED} label="Mis à jour le" className="mt-3 text-sm" />
          </header>

          <TldrBlock bullets={tldr} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Définition technique de la classe C
            </h2>
            <p className="text-sand-700 mb-6">
              Méthode 3CL-2021 (arrêté du 31 mars 2021) : la pire des deux notes (énergie primaire
              ou émissions CO₂) est retenue. La classe C est étiquetée "performant" sur le DPE.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {SEUILS_C.map((s) => (
                <div
                  key={s.indicateur}
                  className="bg-white border-2 border-lime-100 rounded-xl p-5 shadow-sm"
                >
                  <p className="font-semibold text-lime-700 text-sm uppercase tracking-wide">
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
              2 sauts d’optimisation possibles depuis un C
            </h2>
            <p className="text-sand-700 mb-6">
              Coûts indicatifs HT pour 100 m² SHAB. Aides moyennes pour ménage modeste sans bonus
              passoire. Sauts optionnels — uniquement justifiés en rénovation programmée ou
              valorisation revente.
            </p>
            <div className="space-y-4">
              {SAUTS_C.map((s) => (
                <div
                  key={s.saut}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="font-heading text-2xl font-bold text-accent-700 shrink-0">
                      {s.saut}
                    </div>
                    <div className="flex-1 min-w-[280px]">
                      <p className="text-sand-700 leading-relaxed mb-3">
                        <strong>Travaux : </strong>
                        {s.travaux}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Coût HT</p>
                          <p className="font-semibold text-sand-900">{s.cout}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Aides</p>
                          <p className="font-semibold text-accent-700">{s.aides}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Reste à charge</p>
                          <p className="font-semibold text-sand-900">{s.reste}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Rentabilité</p>
                          <p className="font-semibold text-sand-700 text-xs leading-snug">
                            {s.rentabilite}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-sand-600 mt-3 border-t border-sand-100 pt-3">
                        <Leaf className="inline w-4 h-4 text-accent-600 mr-1" aria-hidden />
                        {s.impact}
                      </p>
                    </div>
                  </div>
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
              Le simulateur officiel France Rénov’ calcule MaPrimeRénov’ + CEE + éco-PTZ selon votre
              revenu fiscal et la classe DPE de départ.
            </p>
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 bg-accent-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-800 transition-colors"
            >
              Simulateur aides
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>

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
                  label: 'DPE classe D — médiocre',
                  href: '/renovation-energetique/diagnostic/dpe/classes/d',
                },
                {
                  label: 'Pompe à chaleur — guide complet',
                  href: '/renovation-energetique/travaux/pompe-a-chaleur',
                },
                {
                  label: 'ITE — isolation extérieure prix',
                  href: '/renovation-energetique/travaux/isolation/exterieure-ite',
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
