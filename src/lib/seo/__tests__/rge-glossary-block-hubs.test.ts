import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Sprint AI Ahrefs 2026-05-03 — verrou anti-régression hub wire.
 *
 * Cause : si quelqu'un retire `<RgeGlossaryBlock>` ou `getRgeDefinedTermSetSchema`
 * d'un des 3 hubs (Sprints J/M/P), aucun test existant ne le détecte.
 * Le composant isolé est testé (Sprint S) mais pas son câblage.
 * Même piège que le bug Footer Sprint T (lien sitewide cassé invisible).
 *
 * Ce test est volontairement source-scan (readFileSync) : il se déclenche
 * dès que l'import OU le render OU l'appel helper disparaît.
 */

const REPO_ROOT = process.cwd()

const HUBS = [
  {
    label: '/rge/[service]',
    file: join(REPO_ROOT, 'src', 'app', '(public)', 'rge', '[service]', 'page.tsx'),
  },
  {
    label: '/services/[service]',
    file: join(REPO_ROOT, 'src', 'app', '(public)', 'services', '[service]', 'page.tsx'),
  },
  {
    label: '/cee/[operation]',
    file: join(REPO_ROOT, 'src', 'app', '(public)', 'cee', '[operation]', 'page.tsx'),
  },
] as const

describe('Sprint AI — RgeGlossaryBlock câblage hubs (anti-régression silencieuse)', () => {
  for (const hub of HUBS) {
    describe(hub.label, () => {
      const src = readFileSync(hub.file, 'utf8')

      it('importe RgeGlossaryBlock', () => {
        expect(src).toMatch(
          /import\s+RgeGlossaryBlock\s+from\s+['"]@\/components\/seo\/RgeGlossaryBlock['"]/
        )
      })

      it('rend <RgeGlossaryBlock> au moins une fois dans le JSX', () => {
        expect(src).toMatch(/<RgeGlossaryBlock\b/)
      })

      it('appelle buildHubRgeGlossarySchema (cohérence Sprint AI factor)', () => {
        // Sprint AI Ahrefs 2026-05-03 — les 3 hubs partagent le même helper
        // qui force canonicalEntityBaseUrl=/rge/glossaire (cohérence Sprint Z).
        // Le helper élimine la possibilité d'oublier l'attribut canonical.
        expect(src).toMatch(/buildHubRgeGlossarySchema\s*\(/)
      })

      it('importe buildHubRgeGlossarySchema depuis @/lib/seo/jsonld', () => {
        expect(src).toMatch(/buildHubRgeGlossarySchema/)
        expect(src).toMatch(/from\s+['"]@\/lib\/seo\/jsonld['"]/)
      })
    })
  }
})
