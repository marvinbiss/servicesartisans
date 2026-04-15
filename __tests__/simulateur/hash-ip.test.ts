import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { hashIp } from '@/lib/simulateur/rgpd/hash-ip'

const ORIGINAL_SALT = process.env.RGPD_IP_SALT
const ORIGINAL_ENV = (process.env as Record<string, string | undefined>).NODE_ENV

describe('hashIp', () => {
  beforeEach(() => {
    process.env.RGPD_IP_SALT = 'test-salt-2026'
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'test'
  })

  afterEach(() => {
    if (ORIGINAL_SALT === undefined) delete process.env.RGPD_IP_SALT
    else process.env.RGPD_IP_SALT = ORIGINAL_SALT
    if (ORIGINAL_ENV === undefined)
      delete (process.env as Record<string, string | undefined>).NODE_ENV
    else (process.env as Record<string, string | undefined>).NODE_ENV = ORIGINAL_ENV
  })

  it('produit un hash hex 64 chars', () => {
    const h = hashIp('81.64.12.5')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
  })

  it('est déterministe pour la même IP + même salt', () => {
    const a = hashIp('81.64.12.5')
    const b = hashIp('81.64.12.5')
    expect(a).toBe(b)
  })

  it('produit des hashs différents pour des IPs différentes', () => {
    expect(hashIp('81.64.12.5')).not.toBe(hashIp('81.64.12.6'))
    expect(hashIp('::1')).not.toBe(hashIp('127.0.0.1'))
  })

  it('produit des hashs différents pour des salts différents', () => {
    const h1 = hashIp('81.64.12.5')
    process.env.RGPD_IP_SALT = 'autre-salt'
    const h2 = hashIp('81.64.12.5')
    expect(h1).not.toBe(h2)
  })

  it('throw si salt manquant en dev/test', () => {
    delete process.env.RGPD_IP_SALT
    expect(() => hashIp('81.64.12.5')).toThrow(/RGPD_IP_SALT/)
  })

  it('throw aussi en production si salt absent (RGPD hard requirement)', () => {
    delete process.env.RGPD_IP_SALT
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    // Pas de fallback silencieux : un hash non-salé est trivialement réversible
    // par rainbow-table sur l'espace IPv4. Mieux vaut un 500 qu'une fuite.
    expect(() => hashIp('81.64.12.5')).toThrow(/RGPD_IP_SALT/)
  })

  it('throw si IP vide ou non-string', () => {
    expect(() => hashIp('')).toThrow()
    // @ts-expect-error test defensive
    expect(() => hashIp(null)).toThrow()
    // @ts-expect-error test defensive
    expect(() => hashIp(undefined)).toThrow()
  })
})
