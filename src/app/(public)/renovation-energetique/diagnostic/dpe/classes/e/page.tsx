/**
 * Page : /renovation-energetique/diagnostic/dpe/classes/e
 *
 * @kw-primary    dpe classe e
 * @kw-volume     400
 * @kw-kd         0
 * @kw-cpc        0.40
 * @intent        info
 * @cluster       reno-energetique-diagnostic-dpe-classes-e
 * @ahrefs-source docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md (Bloc 1 niche v3)
 * @snapshot      2026-05-06 (Bloc 1 + estimation snapshot — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 3 orphelin DPE classe E (anticipation interdiction 2034)
 *
 * KW cibles :
 * - "dpe classe e"          → ~400 vol, KD 0 ⭐⭐⭐ PIVOT
 * - "classe e dpe"          → ~150 vol, KD 0
 * - "logement classe e"     → ~100 vol, KD 0
 * - "dpe e"                 → ~150 vol, KD 1
 * - Famille cumulée pivot : ~800 vol/mois (KD 0-1)
 *
 * Anti-cannibalisation :
 *   - Hub /classes/ = recap A-G
 *   - /classes/{f,g}/ = passoires actives
 *   - Cette page = focus E (24% du parc, dernier pré-passoire, interdiction 2034)
 *
 * E-E-A-T : Légifrance, ADEME, ANAH, France Rénov', INSEE.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calendar, Calculator, Flame, Leaf } from 'lucide-react'

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
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/classes/e'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'DPE classe E 2026 : seuils, interdiction location 2034, sauts E→C/B'
const DESCRIPTION =
  'DPE classe E en 2026 : 251-330 kWh/m²/an, 24 % du parc. Interdiction location au 1er janvier 2034. 3 sauts E→D/C/B chiffrés avec aides MaPrimeRénov’.'

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
  'DPE classe E : 251 → 330 kWh/m²/an OU 51 → 70 kg CO₂/m²/an (méthode 3CL-2021).',
  '~7,2 millions de logements concernés, soit 24 % du parc résidentiel principal — plus gros segment "intermédiaire".',
  'Interdiction de mise en location au 1er janvier 2034 (loi Climat 2021 art. 160).',
  'Vente : audit énergétique non obligatoire (réservé F/G), mais conseillé pour valoriser projet de travaux.',
  'Saut E → D (~ 9-15 K€) sécurise long terme. Saut E → C (~ 18-25 K€) recommandé bailleur > 10 ans.',
  'Aides 2026 : MaPrimeRénov’ Parcours accompagné jusqu’à 70 K€ + bonus saut ≥ 2 classes 1 500 €.',
]

const SEUILS_E = [
  {
    indicateur: 'Énergie primaire',
    seuil: '251 → 330 kWh/m²/an',
    detail: '5 usages réglementaires (chauffage, ECS, refroidissement, éclairage, auxiliaires).',
  },
  {
    indicateur: 'Émissions CO₂',
    seuil: '51 → 70 kg CO₂/m²/an',
    detail: 'Si dépassé seul (chauffage gaz partiel) → bascule possible en E malgré conso < 251.',
  },
  {
    indicateur: 'Facture énergétique',
    seuil: '~ 1 300 - 2 200 €/an',
    detail: 'Pour 100 m². Maisons RT 1974-2005 partiellement isolées avec chauffage gaz/élec.',
  },
]

const SAUTS_E = [
  {
    saut: 'E → D',
    cout: '9 - 15 K€',
    aides: '4 - 8 K€',
    reste: '5 - 7 K€',
    travaux: 'Isolation combles 30 cm + remplacement convecteurs élec → PAC air/air ou air/eau.',
    impact: '~ 900 €/an. Sécurise long terme — D pas concerné par interdiction location prévue.',
    rentabilite: 'ROI 6-8 ans. Solution recommandée pour bailleurs et résidence principale.',
  },
  {
    saut: 'E → C',
    cout: '18 - 25 K€',
    aides: '8 - 13 K€',
    reste: '10 - 12 K€',
    travaux: 'Combles + ITE 14 cm + PAC + ballon thermodynamique. Bonus saut ≥ 2 classes 1 500 €.',
    impact: '~ 1 400 €/an. Valorisation +5-7 % à la revente vs E (Notaires de France).',
    rentabilite: 'ROI 8-10 ans. Optimal bailleur long terme + résidence principale.',
  },
  {
    saut: 'E → B',
    cout: '35 - 55 K€',
    aides: '15 - 25 K€',
    reste: '20 - 30 K€',
    travaux: 'Rénovation globale BBC + photovoltaïque autoconsommation 3 kWc.',
    impact: '~ 2 000 €/an + production solaire 800-1 200 €/an.',
    rentabilite: 'ROI 12-15 ans. Justifié résidence principale 15+ ans.',
  },
]

const sources = [
  {
    label: 'Arrêté du 31 mars 2021 — méthode 3CL-2021',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043301471',
  },
  {
    label: 'Loi Climat et Résilience n° 2021-1104 (interdiction E au 1er jan 2034)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
  },
  {
    label: 'Observatoire DPE-Audit ADEME',
    url: 'https://observatoire-dpe-audit.ademe.fr',
  },
  {
    label: 'France Rénov’ — MaPrimeRénov’ Parcours accompagné',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'ANAH — Bonus sortie passoire et saut classes',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'INSEE — Recensement parc logements 2024',
    url: 'https://www.insee.fr',
  },
]

const faqs = [
  {
    question: 'Mon logement classé E est-il une passoire thermique ?',
    answer:
      'NON, pas au sens juridique strict. La loi Climat 2021 désigne explicitement comme "passoires thermiques" les classes F et G. La classe E n’est PAS classée passoire mais reste "mauvais" sur l’étiquette DPE. Conséquence : pas d’audit énergétique obligatoire à la vente (réservé F/G), pas de bonus passoire MaPrimeRénov’ +10 %. En revanche, l’interdiction de mise en location entrera en vigueur le 1er janvier 2034 (8 ans pour anticiper).',
  },
  {
    question: 'Quand la location d’un E sera-t-elle interdite ?',
    answer:
      'À partir du 1er janvier 2034 (loi Climat 2021 art. 160). Cela laisse environ 8 ans pour réaliser les travaux. Si vous êtes bailleur, anticiper sur les 4-5 prochaines années permet d’étaler le budget et d’éviter le pic de demande artisans 2032-2033 (où les prix risquent de monter sensiblement par tension marché).',
  },
  {
    question: 'Combien coûte un saut E → D pour 100 m² ?',
    answer:
      '9-15 K€ HT typiquement, après aides 5-7 K€ reste à charge pour ménage modeste. Combinaison standard : isolation combles 30 cm (3-6 K€) + remplacement convecteurs ou chaudière vieillissante par PAC air/air ou air/eau (6-9 K€). Aides MaPrimeRénov’ Parcours accompagné + CEE Coup de pouce + éco-PTZ couvrent typiquement 4-8 K€ pour ménage modeste.',
  },
  {
    question: 'Faut-il viser E → C plutôt que E → D ?',
    answer:
      'Cela dépend du profil. E → D suffit pour bailleur court-moyen terme (vente prévue avant 2034) car D ne sera pas concerné par interdiction prévue. E → C est recommandé si : 1) résidence principale long terme (10+ ans) où confort + facture cumulée justifient les 9-10 K€ supplémentaires ; 2) bailleur long terme souhaitant capter la valeur verte +5-7 % à la revente ; 3) bonus saut ≥ 2 classes 1 500 € MaPrimeRénov’ qui réduit le surcoût net.',
  },
  {
    question: 'Mon DPE E doit-il être refait avant 2034 ?',
    answer:
      'OUI dans deux cas. 1) DPE réalisé avant le 1er juillet 2021 → caduc depuis le 1er janvier 2025. Doit être refait avant location ou vente. 2) Travaux significatifs réalisés → un nouveau DPE peut faire passer en D, C ou B. Sinon, un DPE 3CL-2021 reste valide 10 ans à compter de sa date de réalisation. Coût d’un DPE 100-200 € en moyenne 2026, à comparer au DPE + audit énergétique (500-1 200 €) requis pour F/G.',
  },
  {
    question: 'Quelles aides en 2026 pour rénover une classe E ?',
    answer:
      'MaPrimeRénov’ Parcours accompagné jusqu’à 70 K€ HT + bonus saut ≥ 2 classes 1 500 € (E → C/B/A). PAS de bonus passoire (réservé F/G). Cumulables : CEE Coup de pouce 3-5 K€ chauffage, éco-PTZ 50 K€ taux 0 sur 20 ans, TVA 5,5 %, exonération taxe foncière 3-5 ans selon commune. Total moyen 40-55 % du devis HT couvert pour ménage modeste.',
  },
  {
    question: 'Vendre un E en 2026 : décote ou pas ?',
    answer:
      'Décote modérée 2-5 % vs un D équivalent (Notaires de France 2024) — bien moindre que F (7-12 %) ou G (10-15 %). E reste vendable sans contrainte particulière en 2026 : pas d’audit énergétique obligatoire, pas de mention "consommation énergétique excessive". Le délai de vente moyen E ~85 jours (vs 75 j moyenne nationale) est légèrement allongé par effet psychologique acheteurs.',
  },
]

export default async function DpeClasseEPage() {
  const providers = await getProvidersByService('isolation-thermique', 6)
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Classes A à G', url: '/renovation-energetique/diagnostic/dpe/classes' },
    { name: 'Classe E', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Diagnostic — DPE — Classe E',
    keywords: [
      'dpe classe e',
      'classe e dpe',
      'logement classe e',
      'dpe e',
      'interdiction location dpe e 2034',
    ],
  })
  const govSchema = getGovernmentServiceSchema({
    name: 'Interdiction location DPE E au 1er janvier 2034',
    description:
      'Loi Climat et Résilience 2021 (art. 160) : interdiction de mise en location et renouvellement de bail pour tout logement classé E à compter du 1er janvier 2034.',
    url: PAGE_URL,
    serviceType: 'Réglementation logement — interdiction location classe E',
    serviceOperator: {
      name: 'Ministère de la Transition écologique',
      url: 'https://www.ecologie.gouv.fr',
    },
  })

  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema].filter(
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
            { label: 'Classe E' },
          ]}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6"
        />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Flame className="w-3.5 h-3.5" aria-hidden /> Mauvais — interdite location 2034
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sand-900 mt-3 mb-3 leading-tight">
              DPE classe E en 2026 : seuils et anticipation 2034
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tout sur la classe E : seuils 3CL-2021, 24 % du parc résidentiel français (~7,2
              millions de logements), interdiction de mise en location prévue le 1er janvier 2034,
              et 3 sauts de rénovation chiffrés (E→D, E→C, E→B) avec aides 2026.
            </p>
            <LastUpdated date={MODIFIED} label="Mis à jour le" className="mt-3 text-sm" />
          </header>

          <TldrBlock bullets={tldr} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Définition technique de la classe E
            </h2>
            <p className="text-sand-700 mb-6">
              Méthode 3CL-2021 (arrêté du 31 mars 2021) : la pire des deux notes (énergie primaire
              ou émissions CO₂) est retenue. Un logement bascule en E dès qu’un seuil est dépassé.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {SEUILS_E.map((s) => (
                <div
                  key={s.indicateur}
                  className="bg-white border-2 border-orange-100 rounded-xl p-5 shadow-sm"
                >
                  <p className="font-semibold text-orange-700 text-sm uppercase tracking-wide">
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
              Anticipation 1er janvier 2034
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Calendar className="w-7 h-7 text-orange-600 shrink-0" aria-hidden />
                <div>
                  <p className="font-semibold text-orange-900 mb-2">
                    8 ans pour rénover avant interdiction location
                  </p>
                  <p className="text-sm text-orange-800 leading-relaxed">
                    L’interdiction du 1er janvier 2034 vise les nouveaux baux et renouvellements.
                    Les baux en cours signés avant cette date ne sont pas rompus. Pour bailleurs
                    long terme, anticiper avant 2030-2031 = éviter pic de demande artisans + tension
                    prix matériaux + saturation MaPrimeRénov’.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              3 sauts de classe pour quitter le E
            </h2>
            <p className="text-sand-700 mb-6">
              Coûts indicatifs HT pour 100 m² SHAB hors zone tendue. Aides moyennes pour ménage
              modeste (Parcours accompagné MaPrimeRénov’ + CEE).
            </p>
            <div className="space-y-4">
              {SAUTS_E.map((s) => (
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
            <div className="flex flex-wrap gap-3">
              <Link
                href="/simulateur-aides-renovation"
                className="inline-flex items-center gap-2 bg-accent-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-800 transition-colors"
              >
                Simulateur aides
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href="/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne"
                className="inline-flex items-center gap-2 bg-white border border-accent-300 text-accent-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-50 transition-colors"
              >
                MaPrimeRénov’ Parcours accompagné
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </section>

          <SimulateurAideBox
            serviceKey="isolation"
            estimatedSaving={6500}
            title="Améliorer mon DPE : aides 2026"
            subtitle="MaPrimeRénov' par geste + CEE + Éco-PTZ — gain 1-2 classes"
          />

          <LocalProviderShowcase
            providers={providers}
            serviceName="Artisan RGE isolation thermique"
            cityName="France"
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
                  label: 'DPE classe F — interdiction location 2028',
                  href: '/renovation-energetique/diagnostic/dpe/classes/f',
                },
                {
                  label: 'DPE classe G — interdiction location 2025',
                  href: '/renovation-energetique/diagnostic/dpe/classes/g',
                },
                {
                  label: 'Calendrier passoires 2025-2034',
                  href: '/renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034',
                },
                {
                  label: 'Pompe à chaleur — guide complet',
                  href: '/renovation-energetique/travaux/pompe-a-chaleur',
                },
                {
                  label: 'Audit énergétique 2026',
                  href: '/renovation-energetique/diagnostic/audit-energetique',
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
