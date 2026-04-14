/**
 * Tests unitaires — src/lib/cee/relance-emails.ts
 * --------------------------------------------------
 * Templates d'emails de relance CEE.
 * Fonctions pures : on verifie le HTML genere, l'escaping XSS,
 * et la presence des elements structurels.
 */

import { describe, it, expect } from 'vitest'
import {
  relanceJ3Client,
  relanceJ7Client,
  relanceJ7Artisan,
  relanceJ14Client,
  relanceJ14Artisan,
} from '@/lib/cee/relance-emails'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Verifie qu'un HTML est structurellement valide (DOCTYPE + balises). */
function assertValidHtml(html: string) {
  expect(html).toContain('<!DOCTYPE html>')
  expect(html).toContain('<html')
  expect(html).toContain('</html>')
  expect(html).toContain('<body')
  expect(html).toContain('</body>')
}

/**
 * Verifie le comportement face a un nom contenant du HTML malveillant.
 *
 * Le code source escape tous les inputs HTML via escapeHtml (format.ts).
 * On verifie que les balises dangereuses (<script>, <img>) sont bien
 * converties en entites et n'apparaissent jamais en clair.
 */
function assertXssBehavior(html: string, maliciousName: string) {
  assertValidHtml(html)
  // Le contenu brut ne doit JAMAIS apparaitre non-escape
  if (maliciousName.includes('<')) {
    expect(html).not.toContain(maliciousName)
  }
  // Les balises d'attaque doivent etre escapees en entites HTML
  if (maliciousName.includes('<script>')) {
    expect(html).toContain('&lt;script&gt;')
  }
  if (maliciousName.includes('<img')) {
    expect(html).toContain('&lt;img')
  }
}

// ---------------------------------------------------------------------------
// relanceJ3Client
// ---------------------------------------------------------------------------

describe('relanceJ3Client', () => {
  it('retourne du HTML valide avec subject', () => {
    const result = relanceJ3Client('Jean Dupont')
    expect(result.subject).toBeTruthy()
    expect(typeof result.subject).toBe('string')
    assertValidHtml(result.html)
  })

  it('contient le prenom du client (premier mot)', () => {
    const result = relanceJ3Client('Jean Dupont')
    expect(result.html).toContain('Jean')
  })

  it('utilise le nom complet si pas d espace', () => {
    const result = relanceJ3Client('Monsieur')
    expect(result.html).toContain('Monsieur')
  })

  it('contient le CTA "Nous contacter"', () => {
    const result = relanceJ3Client('Jean Dupont')
    expect(result.html).toContain('Nous contacter')
  })

  it('contient "prime CEE" dans le corps', () => {
    const result = relanceJ3Client('Jean Dupont')
    expect(result.html).toContain('prime CEE')
  })

  it('ne crash pas avec un nom contenant du HTML (XSS — pas d escaping)', () => {
    const maliciousName = '<script>alert("xss")</script>'
    const result = relanceJ3Client(maliciousName)
    assertXssBehavior(result.html, maliciousName)
  })
})

// ---------------------------------------------------------------------------
// relanceJ7Client
// ---------------------------------------------------------------------------

describe('relanceJ7Client', () => {
  it('retourne du HTML valide avec subject', () => {
    const result = relanceJ7Client('Marie Martin')
    expect(result.subject).toBeTruthy()
    assertValidHtml(result.html)
  })

  it('contient le prenom du client', () => {
    const result = relanceJ7Client('Marie Martin')
    expect(result.html).toContain('Marie')
  })

  it('mentionne que le dossier est en attente', () => {
    const result = relanceJ7Client('Marie Martin')
    expect(result.html).toContain('attente')
  })

  it('ne crash pas avec un nom contenant du HTML (XSS — pas d escaping)', () => {
    const maliciousName = '<img onerror=alert(1) src=x>'
    const result = relanceJ7Client(maliciousName)
    assertXssBehavior(result.html, maliciousName)
  })
})

// ---------------------------------------------------------------------------
// relanceJ7Artisan
// ---------------------------------------------------------------------------

describe('relanceJ7Artisan', () => {
  it('retourne du HTML valide avec subject', () => {
    const result = relanceJ7Artisan('Plomberie Express SARL')
    expect(result.subject).toBeTruthy()
    assertValidHtml(result.html)
  })

  it('contient le nom de l artisan', () => {
    const result = relanceJ7Artisan('Plomberie Express SARL')
    expect(result.html).toContain('Plomberie Express SARL')
  })

  it('contient un lien vers l espace artisan', () => {
    const result = relanceJ7Artisan('Plomberie Express SARL')
    expect(result.html).toContain('/espace-artisan/cee')
  })

  it('ne crash pas avec un nom contenant du HTML (XSS — pas d escaping)', () => {
    const maliciousName = '<script>document.cookie</script>'
    const result = relanceJ7Artisan(maliciousName)
    assertXssBehavior(result.html, maliciousName)
  })
})

// ---------------------------------------------------------------------------
// relanceJ14Client
// ---------------------------------------------------------------------------

describe('relanceJ14Client', () => {
  it('retourne du HTML valide avec subject', () => {
    const result = relanceJ14Client('Pierre Durand')
    expect(result.subject).toBeTruthy()
    assertValidHtml(result.html)
  })

  it('contient le prenom du client', () => {
    const result = relanceJ14Client('Pierre Durand')
    expect(result.html).toContain('Pierre')
  })

  it('mentionne "dernier rappel"', () => {
    const result = relanceJ14Client('Pierre Durand')
    expect(result.html.toLowerCase()).toContain('dernier rappel')
  })

  it('subject contient "Dernier rappel"', () => {
    const result = relanceJ14Client('Pierre Durand')
    expect(result.subject).toContain('Dernier rappel')
  })

  it('ne crash pas avec un nom contenant du HTML (XSS — pas d escaping)', () => {
    const maliciousName = '"><script>alert(1)</script>'
    const result = relanceJ14Client(maliciousName)
    assertXssBehavior(result.html, maliciousName)
  })
})

// ---------------------------------------------------------------------------
// relanceJ14Artisan
// ---------------------------------------------------------------------------

describe('relanceJ14Artisan', () => {
  it('retourne du HTML valide avec subject', () => {
    const result = relanceJ14Artisan('Chauffage Plus')
    expect(result.subject).toBeTruthy()
    assertValidHtml(result.html)
  })

  it('contient le nom de l artisan', () => {
    const result = relanceJ14Artisan('Chauffage Plus')
    expect(result.html).toContain('Chauffage Plus')
  })

  it('contient un lien vers l espace artisan', () => {
    const result = relanceJ14Artisan('Chauffage Plus')
    expect(result.html).toContain('/espace-artisan/cee')
  })

  it('mentionne "dernier rappel"', () => {
    const result = relanceJ14Artisan('Chauffage Plus')
    expect(result.html.toLowerCase()).toContain('dernier rappel')
  })

  it('ne crash pas avec un nom contenant du HTML (XSS — pas d escaping)', () => {
    const maliciousName = '<script>alert("xss")</script>'
    const result = relanceJ14Artisan(maliciousName)
    assertXssBehavior(result.html, maliciousName)
  })
})

// ---------------------------------------------------------------------------
// Invariants transversaux
// ---------------------------------------------------------------------------

describe('invariants transversaux templates relance', () => {
  const allTemplates = [
    { name: 'relanceJ3Client', fn: () => relanceJ3Client('Test Client') },
    { name: 'relanceJ7Client', fn: () => relanceJ7Client('Test Client') },
    { name: 'relanceJ7Artisan', fn: () => relanceJ7Artisan('Test Artisan') },
    { name: 'relanceJ14Client', fn: () => relanceJ14Client('Test Client') },
    { name: 'relanceJ14Artisan', fn: () => relanceJ14Artisan('Test Artisan') },
  ]

  for (const { name, fn } of allTemplates) {
    it(`${name} : contient le branding ServicesArtisans`, () => {
      const result = fn()
      expect(result.html).toContain('ServicesArtisans')
    })

    it(`${name} : contient servicesartisans.fr`, () => {
      const result = fn()
      expect(result.html).toContain('servicesartisans.fr')
    })

    it(`${name} : HTML contient lang="fr"`, () => {
      const result = fn()
      expect(result.html).toContain('lang="fr"')
    })

    it(`${name} : HTML contient charset utf-8`, () => {
      const result = fn()
      expect(result.html).toContain('charset="utf-8"')
    })
  }
})
