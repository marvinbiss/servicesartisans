/**
 * Cluster content generator — orchestre LLM + ground-truth inject.
 *
 * Pipeline :
 *   1. Récupère ClusterSeed (taxonomy.ts)
 *   2. Inject ground-truth déterministe (MPR calculator + CEE catalogue + RGE
 *      stats) dans le prompt système -> empêche hallucination chiffres
 *   3. Appel LLM via abstraction `@/lib/llm` (Claude Opus 4.7 default)
 *   4. Parse JSON output -> ClusterContent
 *   5. Retourne ClusterDraft à passer ensuite à `runClusterCritic` puis
 *      `publishCluster`
 *
 * Provider injectable -> tests sans réseau, prod via registry.
 * Pas d'I/O DB ici (lecture seule taxonomy + écriture déléguée à publisher).
 */

import type { LLMProvider, LLMMessage, LLMRequest } from '@/lib/llm'
import { getRegistry } from '@/lib/llm'
import type { ClusterContent, ClusterDraft, ClusterSeed } from './types'

export type GroundTruthFacts = {
  mprBareme?: ReadonlyArray<string>
  ceeForfaits?: ReadonlyArray<string>
  rgeStats?: ReadonlyArray<string>
  freshness: string
}

export type GenerateClusterInput = {
  seed: ClusterSeed
  groundTruth: GroundTruthFacts
  authorName: string
  authorRole: string
  authorProfileUrl?: string
}

export type GenerateClusterDeps = {
  provider?: LLMProvider
  now?: () => Date
}

export class ClusterContentParseError extends Error {
  constructor(
    message: string,
    readonly rawOutput: string
  ) {
    super(message)
    this.name = 'ClusterContentParseError'
  }
}

const SYSTEM_PROMPT = `Tu es expert YMYL rénovation énergétique France. Tu écris des pages SEO authoritative.

CONTRAT STRICT :
1. Toute affirmation chiffrée doit provenir des GROUND-TRUTH FACTS fournis. Aucune invention.
2. Cite la source pour chaque fait (URL + date snapshot).
3. Aucune affirmation type "100% de prise en charge", "gratuit sans condition", "tous éligibles".
4. Style : neutre, pédagogique, professionnel. Pas de marketing pushy.
5. Output FORMAT : JSON strict matchant le schéma fourni. Aucun texte hors JSON.

Schéma JSON attendu :
{
  "h1": string (45-65 chars),
  "metaTitle": string (50-60 chars),
  "metaDescription": string (140-160 chars),
  "intro": string (150-250 mots),
  "sections": [
    { "h2": string, "body": string (200-400 mots), "factsInjected": [string] }
  ] (min 4 sections),
  "faq": [{ "question": string, "answer": string }] (min 5 entries),
  "ctaText": string (10-15 mots),
  "schemaOrgKeys": ["Article", "FAQPage", "BreadcrumbList"],
  "citedSources": [{ "url": string, "title": string, "retrievedAt": "YYYY-MM-DD" }] (min 2)
}`

function buildUserPrompt(input: GenerateClusterInput): string {
  const { seed, groundTruth } = input
  const factsBlocks: string[] = []
  if (groundTruth.mprBareme?.length) {
    factsBlocks.push(`MPR_BAREME:\n${groundTruth.mprBareme.join('\n')}`)
  }
  if (groundTruth.ceeForfaits?.length) {
    factsBlocks.push(`CEE_FORFAITS:\n${groundTruth.ceeForfaits.join('\n')}`)
  }
  if (groundTruth.rgeStats?.length) {
    factsBlocks.push(`RGE_STATS:\n${groundTruth.rgeStats.join('\n')}`)
  }

  return `MOT-CLÉ PRIMAIRE : "${seed.primaryKw}"
VOLUME MENSUEL : ${seed.volumeMonthly}
KD : ${seed.kdAhrefs}
TYPE : ${seed.clusterType}
SLUG : ${seed.slug}
PARENT : ${seed.parentClusterSlug ?? '(racine)'}
SERVICE : ${seed.serviceSlug ?? '(transverse)'}

GROUND-TRUTH FACTS (freshness ${groundTruth.freshness}) :
${factsBlocks.join('\n\n') || '(aucun ground-truth - prudence maximale)'}

Génère le contenu JSON pour cette page selon le contrat strict.`
}

function parseClusterContent(raw: string): ClusterContent {
  const trimmed = raw.trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new ClusterContentParseError('No JSON object found in LLM output', raw)
  }
  const slice = trimmed.slice(start, end + 1)
  let parsed: unknown
  try {
    parsed = JSON.parse(slice)
  } catch (err) {
    throw new ClusterContentParseError(`JSON parse failed: ${(err as Error).message}`, raw)
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new ClusterContentParseError('Parsed JSON is not an object', raw)
  }

  const obj = parsed as Record<string, unknown>
  const required = [
    'h1',
    'metaTitle',
    'metaDescription',
    'intro',
    'sections',
    'faq',
    'ctaText',
    'citedSources',
  ]
  for (const key of required) {
    if (!(key in obj)) {
      throw new ClusterContentParseError(`Missing required field: ${key}`, raw)
    }
  }

  return obj as unknown as ClusterContent
}

export async function generateClusterContent(
  input: GenerateClusterInput,
  deps: GenerateClusterDeps = {}
): Promise<ClusterDraft> {
  const now = deps.now ?? (() => new Date())
  const provider = deps.provider ?? getRegistry().claude

  const messages: ReadonlyArray<LLMMessage> = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(input) },
  ]

  const req: LLMRequest = {
    messages,
    classification: 'bulk_seo',
    maxTokens: 4000,
    temperature: 0.4,
    metadata: {
      module: 'clusters/content-generator',
      seedSlug: input.seed.slug,
    },
  }

  const response = await provider.complete(req)
  const parsedContent = parseClusterContent(response.content)

  const content: ClusterContent = {
    ...parsedContent,
    schemaOrgKeys: parsedContent.schemaOrgKeys ?? ['Article', 'FAQPage', 'BreadcrumbList'],
    author: {
      name: input.authorName,
      role: input.authorRole,
      profileUrl: input.authorProfileUrl,
    },
    generatedBy: `${response.providerUsed}:${response.modelUsed}`,
    generatedAt: now().toISOString(),
  }

  return {
    ...input.seed,
    contentJsonb: content,
  }
}

export const __testing = { SYSTEM_PROMPT, buildUserPrompt, parseClusterContent }
