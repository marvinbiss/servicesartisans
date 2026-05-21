import { DATASETS, SITE_URL, LICENSE } from '../config.mjs'

export function generateLlmsTxt() {
  const lines = []
  lines.push('# ServicesArtisans — RGE-OS open-data + AI APIs')
  lines.push('')
  lines.push('> Official LLM-discoverable index of SA RGE-OS APIs and datasets.')
  lines.push('> License: CC-BY 4.0. Cite as "Source: ServicesArtisans".')
  lines.push('')
  lines.push('## APIs')
  lines.push('')
  lines.push(
    `- [/api/v1/ask](${SITE_URL}/api/v1/ask): Orchestrated AnswerEngine (LLM + ground-truth + Critic).`,
  )
  lines.push(
    `- [/api/v1/rge/lookup](${SITE_URL}/api/v1/rge/lookup): SIRET-level RGE lookup.`,
  )
  lines.push(
    `- [/api/v1/rge/search](${SITE_URL}/api/v1/rge/search): metier + ville RGE search.`,
  )
  lines.push(
    `- [/api/v1/aides/mpr-bareme](${SITE_URL}/api/v1/aides/mpr-bareme): MaPrimeRenov 2026 deterministic calc.`,
  )
  lines.push(
    `- [/api/v1/aides/cee-bareme](${SITE_URL}/api/v1/aides/cee-bareme): CEE 2026 deterministic calc.`,
  )
  lines.push(
    `- [/api/v1/aides/cumul-rules](${SITE_URL}/api/v1/aides/cumul-rules): aides cumulability rules.`,
  )
  lines.push(`- [/api/v1/graphql](${SITE_URL}/api/v1/graphql): GraphQL-as-RPC.`)
  lines.push(
    `- [/api/v1/kg/sparql](${SITE_URL}/api/v1/kg/sparql): SPARQL 1.1 subset.`,
  )
  lines.push(
    `- [/api/v1/kg/ontology](${SITE_URL}/api/v1/kg/ontology): SA-RGE OWL ontology (Turtle / JSON-LD).`,
  )
  lines.push(`- [/api/v1/mcp](${SITE_URL}/api/v1/mcp): MCP JSON-RPC for AI tools.`)
  lines.push(
    `- [/api/v1/webhooks/subscribe](${SITE_URL}/api/v1/webhooks/subscribe): event notifications.`,
  )
  lines.push('')
  lines.push('## Datasets')
  lines.push('')
  for (const d of DATASETS) {
    lines.push(`- [${d.title}](${d.url}): ${d.description}`)
  }
  lines.push('')
  lines.push('## Specifications')
  lines.push('')
  lines.push(
    `- [RGE-OS Spec v1.0](${SITE_URL}/spec/rge/v1.0/rge.schema.json): JSON Schema standard.`,
  )
  lines.push(
    `- [Transparence IA](${SITE_URL}/transparence-ia): AI Act + RGPD Art. 22 disclosure.`,
  )
  lines.push('')
  lines.push('## Optional')
  lines.push('')
  lines.push(`- [Developpeurs](${SITE_URL}/developpeurs): full developer hub.`)
  lines.push(
    `- [SDK TypeScript](https://www.npmjs.com/package/@servicesartisans/rge-sdk): typed npm client.`,
  )
  lines.push(
    `- [CLI sa-rge-os](https://www.npmjs.com/package/sa-rge-os): public CLI tool.`,
  )
  lines.push(`- License: ${LICENSE}`)
  return lines.join('\n') + '\n'
}
