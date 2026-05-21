import type { Metadata } from 'next'
import Link from 'next/link'
import { SOURCES } from '@/lib/aides/__sources'
import { SOURCES_CEE } from '@/lib/cee/__sources-cee'
import { safeJsonStringify } from '@/lib/seo/safe-json'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { getAlternates } from '@/lib/seo/config'

const SITE_URL = 'https://servicesartisans.fr'
const PAGE_PATH = '/transparence-ia'
const canonicalUrl = `${SITE_URL}${PAGE_PATH}`

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Transparence IA — ServicesArtisans',
  description:
    'Liste publique des agents IA utilisés par ServicesArtisans, leurs garde-fous (Critic, Calculator déterministe), modèles, sources officielles. Conformité AI Act + RGPD Art. 22.',
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    type: 'website',
    title: 'Transparence IA — ServicesArtisans',
    description:
      'Liste publique des agents IA SA, leurs garde-fous, modèles et sources officielles. Conformité AI Act + RGPD Art. 22.',
    url: canonicalUrl,
    siteName: 'ServicesArtisans',
    locale: 'fr_FR',
  },
}

type AIAgent = {
  id: string
  name: string
  role: string
  classification: 'ymyl' | 'infrastructure'
  primaryModel: string
  sources: ReadonlyArray<string>
  guardrails: ReadonlyArray<string>
  version: string
  codeRef: string
}

export const AI_AGENTS: ReadonlyArray<AIAgent> = [
  {
    id: 'answer-engine',
    name: 'AnswerEngine',
    role: "Point d'entrée unique des réponses utilisateur (orchestre LLM primaire + Critic + ground-truth).",
    classification: 'ymyl',
    primaryModel: 'multi (Mistral/Claude/Gemini)',
    sources: ['ANAH MaPrimeRénov 2026', "France Rénov'", 'Légifrance'],
    guardrails: [
      'Ground-truth déterministe calculator MPR/CEE injecté avant LLM',
      'Critic Opus 4.7 second-pass sur tout output YMYL',
      'Fail-closed sur LLM unavailable / timeout / rate-limit',
      'Citations URL + dates de snapshot obligatoires',
    ],
    version: '0.1.0',
    codeRef: 'src/lib/answer-engine/',
  },
  {
    id: 'critic-ymyl',
    name: 'Critic YMYL',
    role: 'Vérification factuelle seconde-passe avant délivrance utilisateur YMYL.',
    classification: 'ymyl',
    primaryModel: 'claude-opus-4-7',
    sources: [
      'Rubric scoring : factuality, source_present, math_check, hallucination_risk, completeness, safety_disclaimer',
    ],
    guardrails: [
      'Pre-LLM heuristic rubric (block sur "100% prise en charge", math errors, sources absentes)',
      'JSON schema strict sur output Critic (fail-closed shape invalide)',
      'Block conservateur sur YMYL si LLM Critic unavailable',
    ],
    version: '0.1.0',
    codeRef: 'src/lib/critic/',
  },
  {
    id: 'mpr-calculator',
    name: 'Calculator MaPrimeRénov 2026',
    role: 'Calcul déterministe MPR par geste x categorie menage x zone.',
    classification: 'infrastructure',
    primaryModel: 'deterministe (zero LLM)',
    sources: ['ANAH (anah.gouv.fr) snapshot 2026-04-15', "France Rénov' (france-renov.gouv.fr)"],
    guardrails: [
      'Lookup table + règles déterministes',
      'Entrées non vérifiées flaggées UNVERIFIED_PENDING_SOURCE_2026',
      'sourceRef obligatoire sur chaque entrée',
    ],
    version: '0.1.0',
    codeRef: 'src/lib/aides/',
  },
  {
    id: 'cee-calculator',
    name: 'Calculator CEE 2026',
    role: 'Calcul déterministe CEE (kWh cumac x bonus x prix marche).',
    classification: 'infrastructure',
    primaryModel: 'deterministe (zero LLM)',
    sources: [
      'Arrêté 22 décembre 2014 modifié (Légifrance)',
      'Coup de pouce Chauffage/Isolation (Ministère)',
      'EMMY (registre cotations marché)',
    ],
    guardrails: [
      'Zero appel LLM',
      'Forfaits parametriques flagges non couverts v0',
      'pac_air_air explicitement non cumulable MPR',
    ],
    version: '0.1.0',
    codeRef: 'src/lib/cee/',
  },
  {
    id: 'mcp-server',
    name: 'MCP Server v0',
    role: 'Endpoint Model Context Protocol pour intégration Claude Desktop / Cursor / agents IA tiers.',
    classification: 'infrastructure',
    primaryModel: 'deterministe',
    sources: ['Données RGE actives (ADEME refresh hebdomadaire)', 'Lookup tables MPR + CEE'],
    guardrails: [
      'JSON-RPC 2.0 strict avec error codes',
      'Bearer token optionnel (mode public si MCP_BEARER_TOKEN absent)',
      'Timing-safe auth comparison',
    ],
    version: '0.1.0',
    codeRef: 'src/app/api/v1/mcp/',
  },
  {
    id: 'eval-promptfoo',
    name: 'YMYL Eval CI Gate',
    role: 'Gate CI bloquant : 50 cas gold MPR auto-vérifiés contre calculator.',
    classification: 'infrastructure',
    primaryModel: 'multi (Promptfoo)',
    sources: ['Gold cases MPR 2026 (39 verified / 11 UNVERIFIED flagged)'],
    guardrails: [
      'Threshold 90% bareme_amount + 100% eligibilite + 95% cumul_aides',
      'Exit 1 si pass rate sous threshold',
    ],
    version: '0.1.0',
    codeRef: 'evals/factual-aides.yaml',
  },
]

type CompiledSource = {
  id: string
  name: string
  url: string
  domain: 'mpr' | 'cee'
  snapshot: string
  isPlaceholder: boolean
}

type SourceShape = {
  title: string
  url: string
  snapshot: string
  placeholder?: boolean
}

function getCompiledSources(): ReadonlyArray<CompiledSource> {
  const compiled: CompiledSource[] = []
  for (const [id, src] of Object.entries(SOURCES) as Array<[string, SourceShape]>) {
    compiled.push({
      id: `mpr_${id.toLowerCase()}`,
      name: src.title,
      url: src.url,
      domain: 'mpr',
      snapshot: src.snapshot,
      isPlaceholder: Boolean(src.placeholder),
    })
  }
  for (const [id, src] of Object.entries(SOURCES_CEE) as Array<[string, SourceShape]>) {
    compiled.push({
      id: `cee_${id.toLowerCase()}`,
      name: src.title,
      url: src.url,
      domain: 'cee',
      snapshot: src.snapshot,
      isPlaceholder: Boolean(src.placeholder),
    })
  }
  return compiled
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': canonicalUrl,
  name: 'Transparence IA — ServicesArtisans',
  url: canonicalUrl,
  description:
    "Page de transparence sur l'utilisation des intelligences artificielles par ServicesArtisans.",
  dateModified: '2026-05-21',
  inLanguage: 'fr-FR',
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Accueil', url: SITE_URL },
  { name: 'Transparence IA', url: canonicalUrl },
])

export default function TransparenceIAPage() {
  const sources = getCompiledSources()
  const ymylAgents = AI_AGENTS.filter((a) => a.classification === 'ymyl')
  const infraAgents = AI_AGENTS.filter((a) => a.classification === 'infrastructure')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumbSchema) }}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <nav className="text-sm text-charcoal-500 mb-4">
          <Link href="/">Accueil</Link> &raquo; Transparence IA
        </nav>

        <h1 className="text-3xl font-bold mb-4">Transparence IA</h1>
        <p className="text-lg text-charcoal-700 mb-6">
          ServicesArtisans utilise des systèmes d&apos;intelligence artificielle pour aider les
          utilisateurs à comprendre leurs droits aux aides à la rénovation énergétique. Cette page
          liste publiquement chaque agent IA, son rôle, ses garde-fous, et les sources officielles
          consultées. Mise à jour : 21 mai 2026.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Pourquoi cette page</h2>
          <p className="mb-2">
            Le règlement européen <strong>AI Act</strong> (entrée en vigueur 2025) classe en
            &laquo;&nbsp;haut-risque&nbsp;&raquo; (Annexe III &sect;5b) les systèmes IA qui
            interviennent dans des décisions financières concernant des personnes physiques. SA met
            en place plusieurs niveaux de garde-fous, dont cette publication.
          </p>
          <p>
            Le <strong>RGPD article 22</strong> reconnaît à chaque utilisateur le droit
            d&apos;obtenir une information claire sur les traitements automatisés qui les
            concernent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Agents YMYL (Your Money Your Life)</h2>
          <p className="mb-4">
            Soumis à un dispositif de double vérification (Critic) + ground-truth déterministe
            (Calculator).
          </p>
          {ymylAgents.map((agent) => (
            <article key={agent.id} className="mb-6 border-l-4 border-amber-400 pl-4">
              <h3 className="text-xl font-semibold">{agent.name}</h3>
              <p>
                <strong>Rôle :</strong> {agent.role}
              </p>
              <p>
                <strong>Modèle :</strong> {agent.primaryModel}
              </p>
              <p>
                <strong>Version :</strong> {agent.version} —{' '}
                <code className="text-sm">{agent.codeRef}</code>
              </p>
              <details>
                <summary className="cursor-pointer">Sources</summary>
                <ul className="ml-4 list-disc">
                  {agent.sources.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </details>
              <details>
                <summary className="cursor-pointer">Garde-fous</summary>
                <ul className="ml-4 list-disc">
                  {agent.guardrails.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Agents Infrastructure</h2>
          {infraAgents.map((agent) => (
            <article key={agent.id} className="mb-6 border-l-4 border-charcoal-300 pl-4">
              <h3 className="text-xl font-semibold">{agent.name}</h3>
              <p>
                <strong>Rôle :</strong> {agent.role}
              </p>
              <p>
                <strong>Modèle :</strong> {agent.primaryModel}
              </p>
              <p>
                <strong>Version :</strong> {agent.version} —{' '}
                <code className="text-sm">{agent.codeRef}</code>
              </p>
              <details>
                <summary className="cursor-pointer">Sources</summary>
                <ul className="ml-4 list-disc">
                  {agent.sources.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </details>
              <details>
                <summary className="cursor-pointer">Garde-fous</summary>
                <ul className="ml-4 list-disc">
                  {agent.guardrails.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Sources officielles citées</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Source</th>
                <th className="text-left p-2">Domaine</th>
                <th className="text-left p-2">Snapshot</th>
                <th className="text-left p-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">
                    <a href={s.url} className="underline">
                      {s.name}
                    </a>
                  </td>
                  <td className="p-2">{s.domain === 'mpr' ? 'MaPrimeRénov' : 'CEE'}</td>
                  <td className="p-2">{s.snapshot}</td>
                  <td className="p-2">{s.isPlaceholder ? 'En cours' : 'Validée'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Vos droits</h2>
          <ul className="list-disc ml-6">
            <li>
              <strong>Droit à l&apos;information (RGPD Art. 13-14)</strong> : cette page constitue
              l&apos;information sur les traitements automatisés liés au calcul d&apos;aides.
            </li>
            <li>
              <strong>Droit à intervention humaine (RGPD Art. 22)</strong> : sur toute décision
              automatisée individuelle, vous pouvez demander une revue humaine en écrivant à{' '}
              <a href="mailto:dpo@servicesartisans.fr" className="underline">
                dpo@servicesartisans.fr
              </a>
              .
            </li>
            <li>
              <strong>Droit d&apos;explication</strong> : contactez{' '}
              <a href="mailto:dpo@servicesartisans.fr" className="underline">
                dpo@servicesartisans.fr
              </a>{' '}
              pour la décomposition (geste, catégorie ménage, source de la valeur).
            </li>
            <li>
              <strong>Droit de recours</strong> : saisir la CNIL (cnil.fr/plaintes).
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Historique</h2>
          <ul className="list-disc ml-6">
            <li>
              <strong>2026-05-21</strong> — Première publication. 6 agents documentés.
            </li>
          </ul>
        </section>
      </main>
    </>
  )
}
