/**
 * Tests — src/lib/cee/dossier-transitions.ts
 *
 * Covers:
 *   - Toutes transitions légales → canTransitionDossier retourne true
 *   - Toutes transitions illégales → canTransitionDossier retourne false
 *   - assertDossierTransition lève une erreur sur transition illégale
 *   - assertDossierTransition ne lève rien sur transition légale
 *   - isTerminalStatus : archived = terminal
 *   - artisanCanSubmit : draft = oui, submitted_by_artisan = non
 *   - artisanCanEdit : draft + qa_rejected = oui, reste = non
 *   - getAllowedTransitions : retourne la liste correcte
 */

import { describe, it, expect } from 'vitest'
import {
  canTransitionDossier,
  assertDossierTransition,
  getAllowedTransitions,
  isTerminalStatus,
  artisanCanSubmit,
  artisanCanEdit,
  DOSSIER_TRANSITIONS,
  type CeeDossierV3Status,
} from '@/lib/cee/dossier-transitions'

describe('DOSSIER_TRANSITIONS — legal transitions', () => {
  const legalCases: Array<[CeeDossierV3Status, CeeDossierV3Status]> = [
    ['draft', 'submitted_by_artisan'],
    ['draft', 'archived'],
    ['submitted_by_artisan', 'qa_pending'],
    ['submitted_by_artisan', 'draft'],
    ['submitted_by_artisan', 'archived'],
    ['qa_pending', 'qa_approved'],
    ['qa_pending', 'qa_rejected'],
    ['qa_approved', 'deposited'],
    ['qa_approved', 'archived'],
    ['qa_rejected', 'draft'],
    ['qa_rejected', 'submitted_by_artisan'],
    ['qa_rejected', 'archived'],
    ['deposited', 'validated_pncee'],
    ['deposited', 'rejected_pncee'],
    ['validated_pncee', 'paid_client'],
    ['validated_pncee', 'commission_due'],
    ['validated_pncee', 'archived'],
    ['rejected_pncee', 'archived'],
    ['paid_client', 'commission_due'],
    ['paid_client', 'archived'],
    ['commission_due', 'commission_paid'],
    ['commission_due', 'archived'],
    ['commission_paid', 'archived'],
  ]

  for (const [from, to] of legalCases) {
    it(`allows ${from} → ${to}`, () => {
      expect(canTransitionDossier(from, to)).toBe(true)
    })
  }
})

describe('DOSSIER_TRANSITIONS — illegal transitions', () => {
  const illegalCases: Array<[CeeDossierV3Status, CeeDossierV3Status]> = [
    ['draft', 'qa_pending'],
    ['draft', 'validated_pncee'],
    ['draft', 'commission_paid'],
    ['submitted_by_artisan', 'deposited'],
    ['submitted_by_artisan', 'validated_pncee'],
    ['qa_pending', 'draft'],
    ['qa_pending', 'deposited'],
    ['qa_approved', 'qa_rejected'],
    ['qa_approved', 'qa_pending'],
    ['qa_rejected', 'deposited'],
    ['qa_rejected', 'validated_pncee'],
    ['deposited', 'draft'],
    ['deposited', 'qa_pending'],
    ['deposited', 'commission_due'],
    ['validated_pncee', 'deposited'],
    ['validated_pncee', 'draft'],
    ['rejected_pncee', 'draft'],
    ['rejected_pncee', 'validated_pncee'],
    ['paid_client', 'validated_pncee'],
    ['paid_client', 'deposited'],
    ['commission_due', 'draft'],
    ['commission_due', 'validated_pncee'],
    ['commission_paid', 'commission_due'],
    ['commission_paid', 'draft'],
    ['archived', 'draft'],
    ['archived', 'validated_pncee'],
  ]

  for (const [from, to] of illegalCases) {
    it(`rejects ${from} → ${to}`, () => {
      expect(canTransitionDossier(from, to)).toBe(false)
    })
  }
})

describe('assertDossierTransition', () => {
  it('does not throw on legal transition', () => {
    expect(() => assertDossierTransition('draft', 'submitted_by_artisan')).not.toThrow()
  })

  it('throws on illegal transition with descriptive message', () => {
    expect(() => assertDossierTransition('draft', 'validated_pncee')).toThrow(
      /Transition dossier illégale/
    )
  })

  it('throws on archived → draft (terminal state)', () => {
    expect(() => assertDossierTransition('archived', 'draft')).toThrow()
  })
})

describe('getAllowedTransitions', () => {
  it('returns correct transitions for draft', () => {
    const allowed = getAllowedTransitions('draft')
    expect(allowed).toContain('submitted_by_artisan')
    expect(allowed).toContain('archived')
    expect(allowed).not.toContain('validated_pncee')
  })

  it('returns empty array for archived (terminal)', () => {
    expect(getAllowedTransitions('archived')).toHaveLength(0)
  })
})

describe('isTerminalStatus', () => {
  it('returns true for archived', () => {
    expect(isTerminalStatus('archived')).toBe(true)
  })

  it('returns false for draft', () => {
    expect(isTerminalStatus('draft')).toBe(false)
  })

  it('returns false for commission_paid (has archived transition)', () => {
    expect(isTerminalStatus('commission_paid')).toBe(false)
  })
})

describe('artisanCanSubmit', () => {
  it('returns true for draft', () => {
    expect(artisanCanSubmit('draft')).toBe(true)
  })

  const nonSubmittable: CeeDossierV3Status[] = [
    'submitted_by_artisan', 'qa_pending', 'qa_approved',
    'qa_rejected', 'deposited', 'validated_pncee', 'archived',
  ]
  for (const s of nonSubmittable) {
    it(`returns false for ${s}`, () => {
      expect(artisanCanSubmit(s)).toBe(false)
    })
  }
})

describe('artisanCanEdit', () => {
  it('returns true for draft', () => {
    expect(artisanCanEdit('draft')).toBe(true)
  })

  it('returns true for qa_rejected (artisan can fix and resubmit)', () => {
    expect(artisanCanEdit('qa_rejected')).toBe(true)
  })

  const nonEditable: CeeDossierV3Status[] = [
    'submitted_by_artisan', 'qa_pending', 'qa_approved',
    'deposited', 'validated_pncee', 'archived',
  ]
  for (const s of nonEditable) {
    it(`returns false for ${s}`, () => {
      expect(artisanCanEdit(s)).toBe(false)
    })
  }
})

describe('DOSSIER_TRANSITIONS exhaustiveness', () => {
  it('covers all statuses as keys', () => {
    const allStatuses: CeeDossierV3Status[] = [
      'draft', 'submitted_by_artisan', 'qa_pending', 'qa_approved', 'qa_rejected',
      'deposited', 'validated_pncee', 'rejected_pncee', 'paid_client',
      'commission_due', 'commission_paid', 'archived',
    ]
    for (const s of allStatuses) {
      expect(DOSSIER_TRANSITIONS).toHaveProperty(s)
    }
  })
})
