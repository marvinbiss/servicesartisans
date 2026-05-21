import { describe, it, expect } from 'vitest'
import { AI_AGENTS } from '@/app/(public)/transparence-ia/_ai-agents'

describe('AI_AGENTS data', () => {
  it('contains at least 6 agents', () => {
    expect(AI_AGENTS.length).toBeGreaterThanOrEqual(6)
  })

  it('every agent has unique id', () => {
    const ids = AI_AGENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every YMYL agent mentions Critic in guardrails', () => {
    const ymyl = AI_AGENTS.filter((a) => a.classification === 'ymyl')
    expect(ymyl.length).toBeGreaterThan(0)
    for (const agent of ymyl) {
      const allText = agent.guardrails.join(' ')
      expect(allText).toMatch(/Critic/i)
    }
  })

  it('every agent has non-empty sources and guardrails', () => {
    for (const agent of AI_AGENTS) {
      expect(agent.sources.length).toBeGreaterThan(0)
      expect(agent.guardrails.length).toBeGreaterThan(0)
    }
  })

  it('every agent codeRef points to src/ evals/ or scripts/', () => {
    for (const agent of AI_AGENTS) {
      expect(agent.codeRef).toMatch(/^(src\/|evals\/|scripts\/)/)
    }
  })

  it('deterministic agents are not classification ymyl', () => {
    const deterministic = AI_AGENTS.filter((a) =>
      /déterministe|deterministe|zéro LLM|zero LLM/i.test(a.primaryModel)
    )
    for (const agent of deterministic) {
      expect(agent.classification).not.toBe('ymyl')
    }
  })
})
