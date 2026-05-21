import { describe, expect, it, vi } from 'vitest'
import type { LLMProvider, LLMRequest, LLMResponse } from '@/lib/llm'
import {
  ClusterContentParseError,
  generateClusterContent,
  __testing,
} from '@/lib/clusters/content-generator'
import type { GenerateClusterInput } from '@/lib/clusters/content-generator'
import type { ClusterSeed } from '@/lib/clusters/types'

const seed: ClusterSeed = {
  slug: 'pompe-a-chaleur',
  parentClusterSlug: null,
  clusterType: 'pillar',
  serviceSlug: 'pompe-a-chaleur',
  primaryKw: 'pompe a chaleur',
  volumeMonthly: 230000,
  kdAhrefs: 18,
  cpcEur: 3.2,
  ahrefsSourceDate: '2026-05-04',
}

const validContent = {
  h1: 'Pompe à chaleur : guide complet 2026',
  metaTitle: 'Pompe à chaleur 2026 — Guide complet',
  metaDescription:
    'Découvrez les types de pompes à chaleur, leurs prix, aides MaPrimeRénov 2026 et critères de choix selon votre logement.',
  intro: 'Intro test de 150 mots minimum.',
  sections: [
    { h2: 'Types', body: 'body 1', factsInjected: ['ADEME 2026'] },
    { h2: 'Prix', body: 'body 2' },
    { h2: 'Aides', body: 'body 3' },
    { h2: 'Installation', body: 'body 4' },
  ],
  faq: [
    { question: 'Q1', answer: 'A1' },
    { question: 'Q2', answer: 'A2' },
    { question: 'Q3', answer: 'A3' },
    { question: 'Q4', answer: 'A4' },
    { question: 'Q5', answer: 'A5' },
  ],
  ctaText: 'Simuler mes aides',
  schemaOrgKeys: ['Article', 'FAQPage', 'BreadcrumbList'],
  citedSources: [
    { url: 'https://anah.gouv.fr', title: 'ANAH', retrievedAt: '2026-05-21' },
    { url: 'https://ademe.fr', title: 'ADEME', retrievedAt: '2026-05-21' },
  ],
}

function mockProvider(content: string): LLMProvider {
  return {
    name: 'claude',
    defaultModel: 'claude-opus-4-7',
    complete: vi.fn(
      async (_req: LLMRequest): Promise<LLMResponse> => ({
        content,
        toolCalls: [],
        modelUsed: 'claude-opus-4-7',
        providerUsed: 'claude',
        usage: { inputTokens: 100, outputTokens: 800, totalTokens: 900 },
        latencyMs: 1200,
        stopReason: 'end_turn',
      })
    ),
    stream: () => {
      throw new Error('not used in tests')
    },
  } as unknown as LLMProvider
}

const baseInput: GenerateClusterInput = {
  seed,
  groundTruth: {
    mprBareme: ['PAC air-eau forfait 5000€ très modeste'],
    ceeForfaits: ['BAR-TH-148 PAC: 4000 kWh cumac'],
    freshness: '2026-05-21',
  },
  authorName: 'Marie Durand',
  authorRole: 'Conseillère France Rénov',
}

describe('content-generator', () => {
  it('parses valid LLM JSON output to ClusterDraft', async () => {
    const provider = mockProvider(JSON.stringify(validContent))
    const draft = await generateClusterContent(baseInput, {
      provider,
      now: () => new Date('2026-05-21T10:00:00Z'),
    })

    expect(draft.slug).toBe('pompe-a-chaleur')
    expect(draft.contentJsonb.h1).toBe(validContent.h1)
    expect(draft.contentJsonb.author.name).toBe('Marie Durand')
    expect(draft.contentJsonb.generatedBy).toBe('claude:claude-opus-4-7')
    expect(draft.contentJsonb.generatedAt).toBe('2026-05-21T10:00:00.000Z')
  })

  it('tolerates trailing whitespace + leading prose around JSON', async () => {
    const provider = mockProvider(
      `Voici le JSON demandé :\n\n${JSON.stringify(validContent)}\n\nFin.`
    )
    const draft = await generateClusterContent(baseInput, { provider })
    expect(draft.contentJsonb.metaTitle).toBe(validContent.metaTitle)
  })

  it('throws ClusterContentParseError on broken JSON', async () => {
    const provider = mockProvider('{ "h1": "broken" ')
    await expect(generateClusterContent(baseInput, { provider })).rejects.toBeInstanceOf(
      ClusterContentParseError
    )
  })

  it('throws on missing required field', async () => {
    const incomplete = { ...validContent }
    delete (incomplete as { faq?: unknown }).faq
    const provider = mockProvider(JSON.stringify(incomplete))
    await expect(generateClusterContent(baseInput, { provider })).rejects.toThrow(
      /Missing required field: faq/
    )
  })

  it('throws on non-object JSON', async () => {
    const provider = mockProvider('"a plain string"')
    await expect(generateClusterContent(baseInput, { provider })).rejects.toThrow()
  })

  it('builds user prompt with ground-truth facts injected', () => {
    const prompt = __testing.buildUserPrompt(baseInput)
    expect(prompt).toContain('pompe a chaleur')
    expect(prompt).toContain('230000')
    expect(prompt).toContain('PAC air-eau forfait 5000€ très modeste')
    expect(prompt).toContain('BAR-TH-148')
    expect(prompt).toContain('2026-05-21')
  })

  it('handles empty ground-truth gracefully', () => {
    const prompt = __testing.buildUserPrompt({
      ...baseInput,
      groundTruth: { freshness: '2026-05-21' },
    })
    expect(prompt).toContain('(aucun ground-truth - prudence maximale)')
  })

  it('SYSTEM_PROMPT enforces no hallucination contract', () => {
    expect(__testing.SYSTEM_PROMPT).toContain('Aucune invention')
    expect(__testing.SYSTEM_PROMPT).toContain('100% de prise en charge')
    expect(__testing.SYSTEM_PROMPT).toContain('JSON strict')
  })
})
