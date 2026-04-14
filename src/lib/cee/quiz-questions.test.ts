/**
 * Tests — quiz-questions scorer (server-side).
 */

import { describe, it, expect } from 'vitest'
import {
  QUIZ_QUESTIONS,
  PASS_THRESHOLD,
  scoreQuiz,
} from './quiz-questions'

describe('QUIZ_QUESTIONS', () => {
  it('contains exactly 10 questions', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(10)
  })

  it('each question has a correct index within choices bounds', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.correct).toBeGreaterThanOrEqual(0)
      expect(q.correct).toBeLessThan(q.choices.length)
    }
  })

  it('all question ids are unique', () => {
    const ids = new Set(QUIZ_QUESTIONS.map((q) => q.id))
    expect(ids.size).toBe(QUIZ_QUESTIONS.length)
  })
})

describe('scoreQuiz', () => {
  it('returns 10 when all correct', () => {
    const answers: Record<string, number> = {}
    for (const q of QUIZ_QUESTIONS) answers[q.id] = q.correct
    const r = scoreQuiz(answers)
    expect(r.score).toBe(10)
    expect(r.passed).toBe(true)
    expect(r.total).toBe(10)
  })

  it('returns 0 when all wrong', () => {
    const answers: Record<string, number> = {}
    for (const q of QUIZ_QUESTIONS) answers[q.id] = (q.correct + 1) % q.choices.length
    const r = scoreQuiz(answers)
    expect(r.score).toBe(0)
    expect(r.passed).toBe(false)
  })

  it('ignores unknown question ids', () => {
    const r = scoreQuiz({ fake: 0, garbage: 1 })
    expect(r.score).toBe(0)
    expect(r.total).toBe(10)
  })

  it('passes at >= 8/10', () => {
    const answers: Record<string, number> = {}
    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const q = QUIZ_QUESTIONS[i]
      answers[q.id] = i < 8 ? q.correct : (q.correct + 1) % q.choices.length
    }
    const r = scoreQuiz(answers)
    expect(r.score).toBe(8)
    expect(r.passed).toBe(true)
    expect(PASS_THRESHOLD).toBe(8)
  })
})
