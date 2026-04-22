import { readFileSync, writeFileSync } from 'node:fs'

const p = 'src/lib/seo/service-intents.ts'
const src = readFileSync(p, 'utf8')

const oldBlock = [
  "  if (intent === 'urgence') {",
  '    return `${countFragment} à ${locationName} · Dépannage ${svcLower} 24h/24, intervention sous 2h, devis gratuit ${year}. Avis clients transparents, SIRET vérifié.`',
  '  }',
  '',
  "  if (intent === 'renovation') {",
  '    return `${countFragment} à ${locationName} — certifiés RGE ${year}, éligibles MaPrimeRénov’ & CEE. Devis gratuit, aides simulées, artisans vérifiés SIRET.`',
  '  }',
  '',
  '  return `Trouvez un ${svcLower} qualifié à ${locationName}. ${countFragment} SIREN, devis gratuit et avis clients transparents en ${year}.`',
].join('\n')

const newBlock = [
  '  // Target 140-155 chars rendered. Ahrefs flags <120 chars as too short.',
  '  // Caller appends a review snippet (`· Note X/5 sur Y avis`) when available.',
  "  if (intent === 'urgence') {",
  '    return `${countFragment} à ${locationName} · Dépannage ${svcLower} 24h/24 soir & week-end, intervention rapide, devis gratuit ${year}. SIRET vérifié, assurance décennale.`',
  '  }',
  '',
  "  if (intent === 'renovation') {",
  '    return `${countFragment} à ${locationName} — certifiés RGE ${year}, éligibles MaPrimeRénov’ & CEE. Devis gratuit, aides simulées, garantie décennale et assurance travaux.`',
  '  }',
  '',
  '  return `Trouvez un ${svcLower} qualifié à ${locationName}. ${countFragment} SIREN, devis gratuit, avis clients transparents et tarifs indicatifs ${year}. Réponse 24h.`',
].join('\n')

if (!src.includes(oldBlock)) {
  console.error('OLD NOT FOUND')
  process.exit(1)
}
writeFileSync(p, src.replace(oldBlock, newBlock))
console.log('OK — description templates updated')
