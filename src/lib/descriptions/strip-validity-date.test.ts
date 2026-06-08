import { describe, it, expect } from 'vitest'
import { stripValidityDate, appendLiveValidity } from './strip-validity-date'

describe('stripValidityDate', () => {
  it("retire une phrase « valables jusqu'au <date longue> »", () => {
    const input =
      "Plombier RGE à Paris. L'ensemble de ces certifications RGE sont valables jusqu'au 30 mai 2026. Intervention rapide."
    const out = stripValidityDate(input)
    expect(out).not.toMatch(/2026/)
    expect(out).not.toMatch(/jusqu/i)
    expect(out).toContain('Plombier RGE à Paris.')
    expect(out).toContain('Intervention rapide.')
  })

  it("retire « valide jusqu'au jj/mm/aaaa »", () => {
    const input = "Qualibat 5911 valide jusqu'au 30/05/2030. Reste du texte."
    const out = stripValidityDate(input)
    expect(out).toBe('Reste du texte.')
  })

  it("retire « validité confirmée jusqu'au <date> »", () => {
    const input = "Artisan certifié RGE. Validité confirmée jusqu'au 15 janvier 2027. Zone Lyon."
    const out = stripValidityDate(input)
    expect(out).not.toMatch(/2027|jusqu/i)
    expect(out).toContain('Zone Lyon.')
  })

  it("retire « certifié RGE jusqu'au <date> » (sans mot valable/valide)", () => {
    const input =
      "L'entreprise exerce en tant qu'artisan reconnu garant de l'environnement, certifié RGE jusqu'au 28 septembre 2029. Zone Lyon."
    const out = stripValidityDate(input)
    expect(out).not.toMatch(/2029|jusqu['’]au/i)
    expect(out).toContain('Zone Lyon.')
  })

  it("retire « Reconnue Garant … jusqu'au <date>, … »", () => {
    const input =
      "Reconnue au titre de Garant de l'Environnement jusqu'au 21 décembre 2026, SARL LEFEVRE détient plusieurs qualifications."
    expect(stripValidityDate(input)).toBe('')
  })

  it("retire « validée jusqu'au <date> » et « titulaire … jusqu'au <date> »", () => {
    expect(stripValidityDate("La pose de chauffe-eau, validée jusqu'au 9 octobre 2026.")).toBe('')
    expect(
      stripValidityDate(
        "L'entreprise est titulaire de la qualification RGE jusqu'au 7 décembre 2029."
      )
    ).toBe('')
  })

  it("retire aussi « jusqu'en <année> »", () => {
    expect(stripValidityDate("Qualification RGE valable jusqu'en 2027. Suite.")).toBe('Suite.')
  })

  it('ne touche pas une prose sans date de validité', () => {
    const input = 'Plombier RGE à Paris, spécialiste pompe à chaleur. Devis gratuit via le site.'
    expect(stripValidityDate(input)).toBe(input)
  })

  it("ne retire pas « jusqu'à 3 offres » (pas de date)", () => {
    const input = "Comparez jusqu'à 3 offres en quelques minutes."
    expect(stripValidityDate(input)).toBe(input)
  })

  it('gère null/undefined/empty', () => {
    expect(stripValidityDate(null)).toBe('')
    expect(stripValidityDate(undefined)).toBe('')
    expect(stripValidityDate('')).toBe('')
  })

  it('normalise les espaces résiduels après suppression', () => {
    const input = "Avant.  Ces qualifications sont valables jusqu'au 1 décembre 2025.  Après."
    const out = stripValidityDate(input)
    expect(out).not.toMatch(/ {2,}/)
    expect(out).toContain('Avant.')
    expect(out).toContain('Après.')
  })
})

describe('appendLiveValidity', () => {
  it('injecte la date live formatée (UTC, sans dérive timezone)', () => {
    const out = appendLiveValidity('Plombier RGE à Paris.', '2030-05-30')
    expect(out).toBe(
      "Plombier RGE à Paris. Validité RGE confirmée jusqu'au 30 mai 2030 (source : annuaire ADEME)."
    )
  })

  it('strip puis append redonne la VRAIE date (cycle complet)', () => {
    const stale =
      "Plombier RGE. Ces certifications sont valables jusqu'au 30 mai 2026. Devis gratuit."
    const out = appendLiveValidity(stripValidityDate(stale), '2030-05-30')
    expect(out).not.toMatch(/2026/)
    expect(out).toContain('30 mai 2030')
    expect(out).toContain('Plombier RGE.')
    expect(out).toContain('Devis gratuit.')
  })

  it("idempotent : n'ajoute pas si la date est déjà présente", () => {
    const txt = "Artisan RGE. Validité confirmée jusqu'au 15 janvier 2027."
    expect(appendLiveValidity(txt, '2027-01-15')).toBe(txt)
  })

  it('no-op si validUntil null/invalide', () => {
    expect(appendLiveValidity('Texte.', null)).toBe('Texte.')
    expect(appendLiveValidity('Texte.', 'pas-une-date')).toBe('Texte.')
  })
})
