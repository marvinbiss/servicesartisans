import { describe, it, expect } from 'vitest'
import { resolveFinancingRail, YOUNITED_MIN_TTC } from '@/lib/devis/financing'

describe('resolveFinancingRail', () => {
  it('client pro → aria (quel que soit le montant)', () => {
    expect(resolveFinancingRail('pro', 50)).toBe('aria')
    expect(resolveFinancingRail('pro', 100000)).toBe('aria')
  })

  it('particulier au-dessus du seuil → younited', () => {
    expect(resolveFinancingRail('particulier', YOUNITED_MIN_TTC)).toBe('younited')
    expect(resolveFinancingRail('particulier', 6000)).toBe('younited')
  })

  it('particulier sous le seuil → none', () => {
    expect(resolveFinancingRail('particulier', YOUNITED_MIN_TTC - 1)).toBe('none')
    expect(resolveFinancingRail('particulier', 0)).toBe('none')
  })
})
