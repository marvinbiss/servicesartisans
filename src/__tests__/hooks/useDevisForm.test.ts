import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/data/france-light', () => ({
  villesLight: [
    { name: 'Paris', slug: 'paris', codePostal: '75001' },
    { name: 'Lyon', slug: 'lyon', codePostal: '69001' },
    { name: 'Marseille', slug: 'marseille', codePostal: '13001' },
    { name: 'Toulouse', slug: 'toulouse', codePostal: '31000' },
    { name: 'Bordeaux', slug: 'bordeaux', codePostal: '33000' },
  ],
}))

vi.mock('@/lib/data/france', () => ({
  villes: [
    { name: 'Paris', slug: 'paris', codePostal: '75001' },
    { name: 'Lyon', slug: 'lyon', codePostal: '69001' },
    { name: 'Marseille', slug: 'marseille', codePostal: '13001' },
    { name: 'Toulouse', slug: 'toulouse', codePostal: '31000' },
    { name: 'Bordeaux', slug: 'bordeaux', codePostal: '33000' },
    { name: 'Pau', slug: 'pau', codePostal: '64000' },
    { name: 'Pantin', slug: 'pantin', codePostal: '93500' },
  ],
}))

vi.mock('@/lib/analytics/tracking', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('@/lib/validation/phone', () => ({
  isValidFrenchPhone: vi.fn((phone: string) => {
    const cleaned = phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
    return (
      /^0[1-9]\d{8}$/.test(cleaned) ||
      /^\+33[1-9]\d{8}$/.test(cleaned) ||
      /^0033[1-9]\d{8}$/.test(cleaned)
    )
  }),
  cleanPhone: vi.fn((phone: string) => phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')),
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  useDevisForm,
  initialDevisFormData,
  urgencyOptions,
  type DevisFormData,
} from '@/hooks/useDevisForm'
import { trackEvent } from '@/lib/analytics/tracking'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderDevisForm(opts: Parameters<typeof useDevisForm>[0] = { source: 'test' }) {
  return renderHook(() => useDevisForm(opts))
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  // Reset global fetch mock
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 'devis-123' }),
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ===========================================================================
// Initial state
// ===========================================================================

describe('useDevisForm — initial state', () => {
  it('returns empty form fields by default', () => {
    const { result } = renderDevisForm()
    expect(result.current.formData).toEqual(initialDevisFormData)
  })

  it('starts at step 1 by default', () => {
    const { result } = renderDevisForm()
    expect(result.current.step).toBe(1)
  })

  it('starts with no errors', () => {
    const { result } = renderDevisForm()
    expect(result.current.errors).toEqual({})
  })

  it('starts not submitted', () => {
    const { result } = renderDevisForm()
    expect(result.current.submitted).toBe(false)
    expect(result.current.submitting).toBe(false)
    expect(result.current.submitError).toBeNull()
  })

  it('accepts initialData override', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { service: 'plombier', ville: 'Paris' },
    })
    expect(result.current.formData.service).toBe('plombier')
    expect(result.current.formData.ville).toBe('Paris')
    // Other fields remain default
    expect(result.current.formData.nom).toBe('')
  })

  it('accepts initialStep override', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialStep: 2,
      initialData: { service: 'plombier', ville: 'Paris' },
    })
    expect(result.current.step).toBe(2)
  })

  it('ville query defaults to empty', () => {
    const { result } = renderDevisForm()
    expect(result.current.villeQuery).toBe('')
    expect(result.current.filteredVilles).toEqual([])
  })
})

// ===========================================================================
// urgencyOptions export
// ===========================================================================

describe('urgencyOptions', () => {
  it('contains 4 options', () => {
    expect(urgencyOptions).toHaveLength(4)
  })

  it('has flexible as first option', () => {
    expect(urgencyOptions[0]).toEqual({ value: 'flexible', label: 'Pas urgent' })
  })

  it('has urgent as last option', () => {
    expect(urgencyOptions[3]).toEqual({ value: 'urgent', label: 'Urgent' })
  })
})

// ===========================================================================
// updateField
// ===========================================================================

describe('useDevisForm — updateField', () => {
  it('updates a single field', () => {
    const { result } = renderDevisForm()
    act(() => result.current.updateField('service', 'plombier'))
    expect(result.current.formData.service).toBe('plombier')
  })

  it('clears the error for the updated field', () => {
    const { result } = renderDevisForm()

    // Trigger validation to create errors
    act(() => result.current.validateStep1())
    expect(result.current.errors.service).toBeDefined()

    // Update the field — error should be cleared
    act(() => result.current.updateField('service', 'plombier'))
    expect(result.current.errors.service).toBeUndefined()
  })

  it('does not affect other fields', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { nom: 'Jean' },
    })
    act(() => result.current.updateField('service', 'plombier'))
    expect(result.current.formData.nom).toBe('Jean')
  })
})

// ===========================================================================
// Validation — Step 1
// ===========================================================================

describe('useDevisForm — validateStep1', () => {
  it('fails when service is empty', () => {
    const { result } = renderDevisForm()
    let valid = false
    act(() => {
      valid = result.current.validateStep1()
    })
    expect(valid).toBe(false)
    expect(result.current.errors.service).toBe('Choisissez un service')
  })

  it('fails when ville is empty', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { service: 'plombier' },
    })
    let valid = false
    act(() => {
      valid = result.current.validateStep1()
    })
    expect(valid).toBe(false)
    expect(result.current.errors.ville).toBe('Indiquez votre ville')
  })

  it('passes when both service and ville are set', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { service: 'plombier', ville: 'Paris' },
    })
    let valid = false
    act(() => {
      valid = result.current.validateStep1()
    })
    expect(valid).toBe(true)
    expect(result.current.errors).toEqual({})
  })
})

// ===========================================================================
// Validation — Step 2
// ===========================================================================

describe('useDevisForm — validateStep2 (7→4 obligatoires : email + urgence optionnels)', () => {
  it('passes when email and urgence are empty (both optional)', () => {
    const { result } = renderDevisForm()
    let valid = false
    act(() => {
      valid = result.current.validateStep2()
    })
    expect(valid).toBe(true)
    expect(result.current.errors.email).toBeUndefined()
    expect(result.current.errors.urgence).toBeUndefined()
  })

  it('fails when email is provided but invalid', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { email: 'not-an-email' },
    })
    let valid = false
    act(() => {
      valid = result.current.validateStep2()
    })
    expect(valid).toBe(false)
    expect(result.current.errors.email).toBe('E-mail invalide')
  })

  it('passes when email valid + urgence empty', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { email: 'test@example.com' },
    })
    let valid = false
    act(() => {
      valid = result.current.validateStep2()
    })
    expect(valid).toBe(true)
  })

  it('passes with valid email and urgence', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { email: 'test@example.com', urgence: 'semaine' },
    })
    let valid = false
    act(() => {
      valid = result.current.validateStep2()
    })
    expect(valid).toBe(true)
  })
})

// ===========================================================================
// Validation — Step 3
// ===========================================================================

describe('useDevisForm — validateStep3', () => {
  it('fails when nom is empty', () => {
    const { result } = renderDevisForm()
    let valid = false
    act(() => {
      valid = result.current.validateStep3()
    })
    expect(valid).toBe(false)
    expect(result.current.errors.nom).toBe('Votre nom est requis')
  })

  it('fails when telephone is empty', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { nom: 'Jean', consentement: true },
    })
    let valid = false
    act(() => {
      valid = result.current.validateStep3()
    })
    expect(valid).toBe(false)
    expect(result.current.errors.telephone).toBe('Votre téléphone est requis')
  })

  it('fails when telephone is invalid', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { nom: 'Jean', telephone: '123', consentement: true },
    })
    let valid = false
    act(() => {
      valid = result.current.validateStep3()
    })
    expect(valid).toBe(false)
    expect(result.current.errors.telephone).toBe('Numéro invalide')
  })

  it('fails when consentement is false', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { nom: 'Jean', telephone: '0612345678', consentement: false },
    })
    let valid = false
    act(() => {
      valid = result.current.validateStep3()
    })
    expect(valid).toBe(false)
    expect(result.current.errors.consentement).toBe('Veuillez accepter')
  })

  it('passes with valid nom, telephone, and consentement', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { nom: 'Jean', telephone: '0612345678', consentement: true },
    })
    let valid = false
    act(() => {
      valid = result.current.validateStep3()
    })
    expect(valid).toBe(true)
  })
})

// ===========================================================================
// Computed validity flags
// ===========================================================================

describe('useDevisForm — computed validity flags', () => {
  it('isStep1Valid is false when service/ville missing', () => {
    const { result } = renderDevisForm()
    expect(result.current.isStep1Valid).toBe(false)
  })

  it('isStep1Valid is true when service and ville are set', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { service: 'plombier', ville: 'Paris' },
    })
    expect(result.current.isStep1Valid).toBe(true)
  })

  it('isStep2Valid is true when email and urgence are empty (optional)', () => {
    const { result } = renderDevisForm()
    expect(result.current.isStep2Valid).toBe(true)
  })

  it('isStep2Valid is true with valid email', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { email: 'a@b.com' },
    })
    expect(result.current.isStep2Valid).toBe(true)
  })

  it('isStep2Valid is false with provided but invalid email', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { email: 'bad' },
    })
    expect(result.current.isStep2Valid).toBe(false)
  })

  it('isStep3Valid requires nom, valid phone, and consentement', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { nom: 'Jean', telephone: '0612345678', consentement: true },
    })
    expect(result.current.isStep3Valid).toBe(true)
  })

  it('isStep3Valid is false with invalid phone', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { nom: 'Jean', telephone: '123', consentement: true },
    })
    expect(result.current.isStep3Valid).toBe(false)
  })
})

// ===========================================================================
// validateAndNext (step navigation)
// ===========================================================================

describe('useDevisForm — validateAndNext', () => {
  it('advances from step 1 to step 2 when valid', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { service: 'plombier', ville: 'Paris' },
    })
    act(() => result.current.validateAndNext())
    expect(result.current.step).toBe(2)
  })

  it('stays on step 1 when invalid', () => {
    const { result } = renderDevisForm()
    act(() => result.current.validateAndNext())
    expect(result.current.step).toBe(1)
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)
  })

  it('advances from step 2 to step 3 when valid', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialStep: 2,
      initialData: { email: 'a@b.com', urgence: 'semaine' },
    })
    act(() => result.current.validateAndNext())
    expect(result.current.step).toBe(3)
  })

  it('advances from step 2 to step 3 when email/urgence empty (optional)', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialStep: 2,
    })
    act(() => result.current.validateAndNext())
    expect(result.current.step).toBe(3)
  })

  it('stays on step 2 when email provided but invalid', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialStep: 2,
      initialData: { email: 'bad-email' },
    })
    act(() => result.current.validateAndNext())
    expect(result.current.step).toBe(2)
    expect(result.current.errors.email).toBe('E-mail invalide')
  })
})

// ===========================================================================
// selectVille
// ===========================================================================

describe('useDevisForm — selectVille', () => {
  it('updates ville field and villeQuery', () => {
    const { result } = renderDevisForm()
    act(() => result.current.selectVille('Lyon', '69001'))
    expect(result.current.formData.ville).toBe('Lyon')
    expect(result.current.villeQuery).toBe('Lyon')
    expect(result.current.showVilleSuggestions).toBe(false)
  })

  it('returns postcode if provided', () => {
    const { result } = renderDevisForm()
    let postcode: string | undefined
    act(() => {
      postcode = result.current.selectVille('Lyon', '69001')
    })
    expect(postcode).toBe('69001')
  })
})

// ===========================================================================
// Ville filtering
// ===========================================================================

describe('useDevisForm — ville filtering', () => {
  it('returns empty results for queries shorter than 2 chars', async () => {
    const { result } = renderDevisForm()
    act(() => result.current.setVilleQuery('P'))
    // Wait for effects
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    expect(result.current.filteredVilles).toEqual([])
  })

  it('filters villes by name prefix', async () => {
    const { result } = renderDevisForm()
    act(() => result.current.setVilleQuery('Pa'))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    // Should find Paris, Pau, Pantin from the full list
    const names = result.current.filteredVilles.map((v) => v.name)
    expect(names).toContain('Paris')
    expect(names).toContain('Pau')
  })

  it('filters villes by postal code prefix', async () => {
    const { result } = renderDevisForm()
    act(() => result.current.setVilleQuery('69'))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    const names = result.current.filteredVilles.map((v) => v.name)
    expect(names).toContain('Lyon')
  })

  it('limits results to 8 max', async () => {
    const { result } = renderDevisForm()
    act(() => result.current.setVilleQuery('Pa'))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    expect(result.current.filteredVilles.length).toBeLessThanOrEqual(8)
  })
})

// ===========================================================================
// resetForm
// ===========================================================================

describe('useDevisForm — resetForm', () => {
  it('resets all fields to initial state', () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { service: 'plombier', ville: 'Paris' },
      initialStep: 2,
    })
    act(() => result.current.resetForm())
    expect(result.current.formData).toEqual(initialDevisFormData)
    expect(result.current.step).toBe(1)
    expect(result.current.errors).toEqual({})
    expect(result.current.submitted).toBe(false)
    expect(result.current.submitError).toBeNull()
  })

  it('accepts partial data override on reset', () => {
    const { result } = renderDevisForm()
    act(() => result.current.resetForm({ service: 'electricien' }, 2))
    expect(result.current.formData.service).toBe('electricien')
    expect(result.current.step).toBe(2)
  })
})

// ===========================================================================
// handleSubmit
// ===========================================================================

describe('useDevisForm — handleSubmit', () => {
  const fullFormData: Partial<DevisFormData> = {
    service: 'plombier',
    ville: 'Paris',
    email: 'a@b.com',
    urgence: 'semaine',
    nom: 'Jean',
    telephone: '0612345678',
    consentement: true,
    description: 'Test',
  }

  it('does not submit if step 3 validation fails', async () => {
    const { result } = renderDevisForm({ source: 'test' })
    await act(async () => {
      await result.current.handleSubmit()
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits successfully with valid data', async () => {
    const onSuccess = vi.fn()
    const { result } = renderDevisForm({
      source: 'test',
      initialData: fullFormData,
      onSubmitSuccess: onSuccess,
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/devis',
      expect.objectContaining({
        method: 'POST',
      })
    )
    expect(result.current.submitted).toBe(true)
    expect(result.current.submitError).toBeNull()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('calls trackEvent on success', async () => {
    const { result } = renderDevisForm({
      source: 'homepage',
      initialData: fullFormData,
    })
    await act(async () => {
      await result.current.handleSubmit()
    })
    expect(trackEvent).toHaveBeenCalledWith('form_completed', {
      service: 'plombier',
      source: 'homepage',
    })
  })

  it('passes extraPayload to the API', async () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: fullFormData,
    })
    await act(async () => {
      await result.current.handleSubmit({ referralCode: 'ABC' })
    })

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(fetchCall[1].body)
    expect(body.referralCode).toBe('ABC')
  })

  it('handles server error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Rate limited' }),
    })

    const { result } = renderDevisForm({
      source: 'test',
      initialData: fullFormData,
    })
    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.submitted).toBe(false)
    expect(result.current.submitError).toBe('Rate limited')
  })

  it('handles server error with non-JSON response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error('not json')),
    })

    const { result } = renderDevisForm({
      source: 'test',
      initialData: fullFormData,
    })
    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.submitError).toBe('Erreur serveur')
  })

  it('handles network error (Failed to fetch)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const { result } = renderDevisForm({
      source: 'test',
      initialData: fullFormData,
    })
    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.submitError).toBe('Erreur de connexion. Vérifiez votre internet.')
  })

  it('handles unknown error', async () => {
    global.fetch = vi.fn().mockRejectedValue('something weird')

    const { result } = renderDevisForm({
      source: 'test',
      initialData: fullFormData,
    })
    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.submitError).toBe('Une erreur est survenue. Veuillez réessayer.')
  })

  it('sets submitting to true during submission and false after', async () => {
    let resolveFetch: (v: unknown) => void
    global.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      })
    )

    const { result } = renderDevisForm({
      source: 'test',
      initialData: fullFormData,
    })

    // Start submit (don't await)
    let submitPromise: Promise<unknown>
    act(() => {
      submitPromise = result.current.handleSubmit() as Promise<unknown>
    })

    expect(result.current.submitting).toBe(true)

    // Resolve fetch
    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({ id: '1' }) })
      await submitPromise
    })

    expect(result.current.submitting).toBe(false)
  })

  it('does not double-submit when already submitting', async () => {
    let resolveFetch: (v: unknown) => void
    global.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      })
    )

    const { result } = renderDevisForm({
      source: 'test',
      initialData: fullFormData,
    })

    // First submit
    let p1: Promise<unknown>
    act(() => {
      p1 = result.current.handleSubmit() as Promise<unknown>
    })

    // Second submit while first is in-flight
    await act(async () => {
      await result.current.handleSubmit()
    })

    // Only one fetch call
    expect(global.fetch).toHaveBeenCalledTimes(1)

    // Cleanup
    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) })
      await p1
    })
  })

  it('fires abandon-complete on successful submission with email', async () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: fullFormData,
    })
    await act(async () => {
      await result.current.handleSubmit()
    })

    // fetch called: 1) /api/devis, 2) /api/devis/abandon-complete
    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
    const abandonCall = calls.find((c: unknown[]) => (c[0] as string).includes('abandon-complete'))
    expect(abandonCall).toBeDefined()
  })
})

// ===========================================================================
// trackAbandon
// ===========================================================================

describe('useDevisForm — trackAbandon', () => {
  it('sends abandon tracking request for valid email', async () => {
    const { result } = renderDevisForm({
      source: 'test',
      initialData: { service: 'plombier', ville: 'Paris' },
    })
    await act(async () => {
      await result.current.trackAbandon('user@example.com')
    })

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
    const abandonCall = calls.find((c: unknown[]) => (c[0] as string).includes('abandon-tracking'))
    expect(abandonCall).toBeDefined()
    const body = JSON.parse(abandonCall![1].body)
    expect(body.email).toBe('user@example.com')
    expect(body.service).toBe('plombier')
    expect(body.city).toBe('Paris')
  })

  it('does not send for invalid email', async () => {
    const { result } = renderDevisForm({ source: 'test' })
    await act(async () => {
      await result.current.trackAbandon('not-email')
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('does not send for empty email', async () => {
    const { result } = renderDevisForm({ source: 'test' })
    await act(async () => {
      await result.current.trackAbandon('')
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('only tracks once (idempotent)', async () => {
    const { result } = renderDevisForm({ source: 'test' })
    await act(async () => {
      await result.current.trackAbandon('a@b.com')
    })
    await act(async () => {
      await result.current.trackAbandon('a@b.com')
    })
    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
    const abandonCalls = calls.filter((c: unknown[]) =>
      (c[0] as string).includes('abandon-tracking')
    )
    expect(abandonCalls).toHaveLength(1)
  })
})

// ===========================================================================
// isEmailValid
// ===========================================================================

describe('useDevisForm — isEmailValid', () => {
  it('returns true for valid email', () => {
    const { result } = renderDevisForm()
    expect(result.current.isEmailValid('test@example.com')).toBe(true)
  })

  it('returns false for invalid email', () => {
    const { result } = renderDevisForm()
    expect(result.current.isEmailValid('nope')).toBe(false)
  })

  it('trims whitespace before validation', () => {
    const { result } = renderDevisForm()
    expect(result.current.isEmailValid(' test@example.com ')).toBe(true)
  })
})
