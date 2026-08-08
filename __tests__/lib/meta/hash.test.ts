import { describe, it, expect } from 'vitest'
import { createHash } from 'crypto'
import {
  hashCity,
  hashCountry,
  hashEmail,
  hashExternalId,
  hashName,
  hashPhone,
  hashZip,
} from '@/lib/meta/hash'

/** Hash de référence : ce que Meta attend pour une valeur DÉJÀ normalisée. */
const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex')

describe('hashEmail', () => {
  it('normalise en minuscules et retire les espaces de bord', () => {
    expect(hashEmail('  Marvin@ServicesArtisans.FR ')).toBe(sha256('marvin@servicesartisans.fr'))
  })

  it('rejette une valeur sans arobase', () => {
    expect(hashEmail('pas-un-email')).toBeUndefined()
  })

  it('ignore les valeurs vides', () => {
    expect(hashEmail('')).toBeUndefined()
    expect(hashEmail(undefined)).toBeUndefined()
    expect(hashEmail(null)).toBeUndefined()
  })

  it('ne re-hache pas une valeur déjà hachée', () => {
    const already = sha256('marvin@servicesartisans.fr')
    expect(hashEmail(already)).toBe(already)
  })
})

describe('hashPhone', () => {
  it('convertit un numéro national FR en format international', () => {
    expect(hashPhone('06 12 34 56 78')).toBe(sha256('33612345678'))
  })

  it('accepte le format +33 avec séparateurs', () => {
    expect(hashPhone('+33 6 12 34 56 78')).toBe(sha256('33612345678'))
  })

  it('accepte le préfixe 00', () => {
    expect(hashPhone('0033612345678')).toBe(sha256('33612345678'))
  })

  it('préfixe un numéro national sans zéro initial', () => {
    expect(hashPhone('612345678')).toBe(sha256('33612345678'))
  })

  it('produit le même hash quel que soit le format saisi', () => {
    const formats = ['0612345678', '06.12.34.56.78', '+33612345678', '0033 612 345 678']
    const hashes = new Set(formats.map((f) => hashPhone(f)))
    expect(hashes.size).toBe(1)
  })

  it('conserve un indicatif étranger', () => {
    expect(hashPhone('+32475123456')).toBe(sha256('32475123456'))
  })

  it('rejette un numéro trop court', () => {
    expect(hashPhone('12345')).toBeUndefined()
  })
})

describe('hashName', () => {
  it('retire accents, ponctuation et espaces', () => {
    expect(hashName('Jean-Éric De La Tour')).toBe(sha256('jeanericdelatour'))
  })

  it('gère les cédilles', () => {
    expect(hashName('François')).toBe(sha256('francois'))
  })

  it('ignore une valeur vide après normalisation', () => {
    expect(hashName('---')).toBeUndefined()
  })
})

describe('hashCity', () => {
  it('normalise comme un nom', () => {
    expect(hashCity('Saint-Denis')).toBe(sha256('saintdenis'))
    expect(hashCity('Nîmes')).toBe(sha256('nimes'))
  })
})

describe('hashZip', () => {
  it('garde les 5 premiers chiffres', () => {
    expect(hashZip('93 200')).toBe(sha256('93200'))
    expect(hashZip('93200-1234')).toBe(sha256('93200'))
  })

  it('rejette un code postal incomplet', () => {
    expect(hashZip('932')).toBeUndefined()
  })
})

describe('hashCountry', () => {
  it('normalise en code ISO minuscule', () => {
    expect(hashCountry('FR')).toBe(sha256('fr'))
  })

  it('rejette une valeur non alpha-2', () => {
    expect(hashCountry('F')).toBeUndefined()
  })
})

describe('hashExternalId', () => {
  it('hache un identifiant interne', () => {
    expect(hashExternalId('Lead-42')).toBe(sha256('lead-42'))
  })

  it('ignore une valeur vide', () => {
    expect(hashExternalId('   ')).toBeUndefined()
  })
})
