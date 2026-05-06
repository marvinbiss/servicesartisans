/**
 * Anti-régression Plan C — C-6 :
 *   `RGE_STATIC_2SEG_PREFIXES` (gone-paths.ts) doit lister TOUT segment
 *   statique sous `src/app/(public)/rge/<seg>/` qui contient une sous-route.
 *   Sinon le middleware retourne 410 silencieusement avant que Next.js ne
 *   render la page.
 *
 * Découverte 2026-05-05 : `qualifications/[slug]` était 410-killed.
 */

import { describe, it, expect } from 'vitest'
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { RGE_STATIC_2SEG_PREFIXES } from '@/lib/seo/gone-paths'

const RGE_DIR = join(process.cwd(), 'src', 'app', '(public)', 'rge')

function listSubdirs(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((entry) => {
    const full = join(dir, entry)
    try {
      return statSync(full).isDirectory()
    } catch {
      return false
    }
  })
}

describe('RGE_STATIC_2SEG_PREFIXES — filesystem sync', () => {
  it('le dossier /src/app/(public)/rge/ existe', () => {
    expect(existsSync(RGE_DIR)).toBe(true)
  })

  it('chaque segment statique sous /rge/ avec sous-route est dans la Set', () => {
    const segments = listSubdirs(RGE_DIR).filter((s) => !s.startsWith('[') && !s.startsWith('__'))
    const segmentsWithSubroutes = segments.filter((seg) => {
      const subdirs = listSubdirs(join(RGE_DIR, seg))
      return subdirs.length > 0
    })

    const missing = segmentsWithSubroutes.filter((seg) => !RGE_STATIC_2SEG_PREFIXES.has(seg))

    expect(missing).toEqual([])
  })

  it("aucun segment dans la Set n'est obsolète (existe encore sur disque)", () => {
    const segmentsOnDisk = new Set(listSubdirs(RGE_DIR))
    const obsolete: string[] = []
    RGE_STATIC_2SEG_PREFIXES.forEach((seg) => {
      if (!segmentsOnDisk.has(seg)) obsolete.push(seg)
    })
    expect(obsolete).toEqual([])
  })

  it('couvre les routes connues (labels, qualifications)', () => {
    expect(RGE_STATIC_2SEG_PREFIXES.has('labels')).toBe(true)
    expect(RGE_STATIC_2SEG_PREFIXES.has('qualifications')).toBe(true)
  })
})
