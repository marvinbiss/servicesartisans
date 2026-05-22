import { describe, it, expect } from 'vitest'
import { getServiceLabel, SERVICE_LABELS_FR } from '@/lib/services/labels'
import { CANONICAL_SERVICE_SLUGS } from '@/lib/services/canonical-slugs'

describe('lib/services/labels — getServiceLabel', () => {
  it('couvre TOUS les slugs canoniques (cohérence taxonomie ↔ labels)', () => {
    for (const slug of CANONICAL_SERVICE_SLUGS) {
      const label = getServiceLabel(slug)
      expect(label, `Label manquant pour slug canonical "${slug}"`).toBeTruthy()
      // Aucun label ne doit être identique au slug (sinon = fallback déclenché).
      expect(label).not.toBe(slug)
      // Aucun tiret dans le label final (UX française).
      expect(label).not.toContain('-')
    }
  })

  it('expose les labels canoniques attendus pour les services RGE', () => {
    expect(getServiceLabel('pompe-a-chaleur')).toBe('Pompe à chaleur')
    expect(getServiceLabel('isolation-thermique')).toBe('Isolation thermique')
    expect(getServiceLabel('panneaux-solaires')).toBe('Panneaux solaires')
    expect(getServiceLabel('borne-recharge')).toBe('Borne de recharge électrique')
    expect(getServiceLabel('renovation-energetique')).toBe('Rénovation énergétique')
  })

  it('absorbe les alias legacy (rétro-compat fiches déjà saisies)', () => {
    expect(getServiceLabel('chauffe-eau-thermodynamique')).toBe('Chauffe-eau thermodynamique')
    expect(getServiceLabel('audit-energetique')).toBe('Audit énergétique')
    expect(getServiceLabel('ventilation')).toBe('Ventilation (VMC)')
    expect(getServiceLabel('fenetres')).toBe('Fenêtres performantes')
  })

  it('fallback capitalisé (jamais vide) pour un slug inconnu', () => {
    const label = getServiceLabel('foo-bar-baz')
    expect(label).toBe('Foo bar baz')
  })

  it('SERVICE_LABELS_FR est readonly (typage)', () => {
    // Smoke test : SERVICE_LABELS_FR doit être un objet et contenir les canon.
    expect(typeof SERVICE_LABELS_FR).toBe('object')
    expect(SERVICE_LABELS_FR['pompe-a-chaleur']).toBe('Pompe à chaleur')
  })
})
