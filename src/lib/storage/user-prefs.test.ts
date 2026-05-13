// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { clearUserContactPrefs, loadUserContactPrefs, saveUserContactPrefs } from './user-prefs'

const PREFS_KEY = 'sa:user-prefs:v1'

describe('user-prefs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing has been stored', () => {
    expect(loadUserContactPrefs()).toBeNull()
  })

  it('persists and reloads a full prefs payload', () => {
    saveUserContactPrefs({
      nom: 'Marvin',
      email: 'marvin@example.fr',
      telephone: '0612345678',
    })
    expect(loadUserContactPrefs()).toEqual({
      nom: 'Marvin',
      email: 'marvin@example.fr',
      telephone: '0612345678',
    })
  })

  it('merges partial updates without dropping existing fields', () => {
    saveUserContactPrefs({ nom: 'Marvin', email: 'm@x.fr', telephone: '0612' })
    saveUserContactPrefs({ telephone: '0698765432' })
    expect(loadUserContactPrefs()).toEqual({
      nom: 'Marvin',
      email: 'm@x.fr',
      telephone: '0698765432',
    })
  })

  it('trims whitespace on save', () => {
    saveUserContactPrefs({ nom: '  Marvin  ', email: ' m@x.fr', telephone: '0612 ' })
    expect(loadUserContactPrefs()).toEqual({
      nom: 'Marvin',
      email: 'm@x.fr',
      telephone: '0612',
    })
  })

  it('ignores fully-empty payloads', () => {
    saveUserContactPrefs({ nom: '', email: '', telephone: '' })
    expect(loadUserContactPrefs()).toBeNull()
  })

  it('returns null for malformed stored JSON', () => {
    localStorage.setItem(PREFS_KEY, '{not json')
    expect(loadUserContactPrefs()).toBeNull()
  })

  it('returns null when stored value has the wrong shape', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ foo: 'bar' }))
    expect(loadUserContactPrefs()).toBeNull()
  })

  it('returns null after clearUserContactPrefs', () => {
    saveUserContactPrefs({ nom: 'M', email: '', telephone: '' })
    clearUserContactPrefs()
    expect(loadUserContactPrefs()).toBeNull()
  })
})
