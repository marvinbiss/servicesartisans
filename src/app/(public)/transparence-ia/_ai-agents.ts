export type AIAgent = {
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
