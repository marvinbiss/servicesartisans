// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

type Listener = (e: { matches: boolean }) => void

class MockMQL {
  matches: boolean
  private listeners = new Set<Listener>()
  constructor(matches: boolean) {
    this.matches = matches
  }
  addEventListener(_type: 'change', l: Listener) {
    this.listeners.add(l)
  }
  removeEventListener(_type: 'change', l: Listener) {
    this.listeners.delete(l)
  }
  fire(matches: boolean) {
    this.matches = matches
    this.listeners.forEach((l) => l({ matches }))
  }
}

let mockMql: MockMQL

describe('useReducedMotion', () => {
  beforeEach(() => {
    mockMql = new MockMQL(false)
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mockMql)
    )
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn(() => mockMql),
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when user has no reduced-motion preference', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when matchMedia reports matches', () => {
    mockMql.matches = true
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('updates when the OS preference flips', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
    act(() => mockMql.fire(true))
    expect(result.current).toBe(true)
    act(() => mockMql.fire(false))
    expect(result.current).toBe(false)
  })
})
