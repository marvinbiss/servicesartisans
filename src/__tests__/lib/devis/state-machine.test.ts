import { describe, it, expect } from 'vitest'
import {
  canTransition,
  assertTransition,
  InvalidTransitionError,
  transitionTimestampColumn,
} from '@/lib/devis/state-machine'

describe('canTransition', () => {
  it('autorise brouillon → envoye', () => {
    expect(canTransition('brouillon', 'envoye')).toBe(true)
  })

  it('autorise envoye → accepte / refuse / vu / expire', () => {
    expect(canTransition('envoye', 'accepte')).toBe(true)
    expect(canTransition('envoye', 'refuse')).toBe(true)
    expect(canTransition('envoye', 'vu')).toBe(true)
    expect(canTransition('envoye', 'expire')).toBe(true)
  })

  it('refuse brouillon → accepte (doit passer par envoye)', () => {
    expect(canTransition('brouillon', 'accepte')).toBe(false)
  })

  it('états terminaux ne transitionnent plus', () => {
    expect(canTransition('accepte', 'refuse')).toBe(false)
    expect(canTransition('refuse', 'envoye')).toBe(false)
    expect(canTransition('expire', 'envoye')).toBe(false)
  })
})

describe('assertTransition', () => {
  it('ne jette pas sur transition valide', () => {
    expect(() => assertTransition('brouillon', 'envoye')).not.toThrow()
  })

  it('jette InvalidTransitionError sur transition invalide', () => {
    expect(() => assertTransition('accepte', 'envoye')).toThrow(InvalidTransitionError)
  })
})

describe('transitionTimestampColumn', () => {
  it('mappe chaque état vers sa colonne timestamp', () => {
    expect(transitionTimestampColumn('envoye')).toBe('sent_at')
    expect(transitionTimestampColumn('vu')).toBe('viewed_at')
    expect(transitionTimestampColumn('accepte')).toBe('accepted_at')
    expect(transitionTimestampColumn('refuse')).toBe('refused_at')
    expect(transitionTimestampColumn('expire')).toBeNull()
  })
})
