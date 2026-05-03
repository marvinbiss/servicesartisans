/**
 * CEE Client-Term Mapping — SEO title-rewrite layer.
 *
 * The DB column `cee_operations.nom` stores ADEME jargon labels (ex: "Appareil
 * indépendant de chauffage au bois (BAR-TH-112)"). Real users search using
 * client-friendly terms ("poêle à granulés"). This mapping translates the
 * jargon to the intent term to lift CTR + capture striking-distance volume.
 *
 * Source: Ahrefs Phase 0 audit 2026-05-03 (`docs/audit-ahrefs-2026-05-03/E_site/
 * kw_attack_existing_50.csv`). Top KW × CEE op pairings :
 *   - BAR-TH-112 ← "poêle à granulés" (16K) + "granulés de bois" (13K)
 *   - BAR-TH-148 ← "chauffe eau thermodynamique" (31K) + variants (7K)
 *   - BAR-TH-127 ← "vmc simple flux hygroréglable" (4.6K) + "ventilation" (4.3K)
 *   - BAR-EN-104 ← "fenêtres" KW (low individual but cumul important)
 *   - BAR-TH-104 ← "pompe à chaleur air/eau" hub (handled by /services/pompe-a-chaleur)
 *
 * Convention :
 *   - `clientTerm` = singular, capitalized first letter, no marketing fluff.
 *   - Used as title prefix : `${clientTerm} : prime CEE 2026 (${opCode})`
 *   - Description keeps the ADEME jargon for authority + technical accuracy.
 *
 * Returns `null` if no client mapping exists — caller falls back to ADEME nom.
 */

const CEE_CLIENT_TERMS: Record<string, string> = {
  // Chauffage bois / granulés
  'BAR-TH-112': 'Poêle à granulés',
  'BAR-TH-113': 'Chaudière biomasse',

  // Pompes à chaleur
  'BAR-TH-104': 'Pompe à chaleur air/eau',
  'BAR-TH-171': 'Pompe à chaleur hybride',
  'BAR-TH-172': 'Pompe à chaleur géothermique',

  // Eau chaude
  'BAR-TH-148': 'Chauffe-eau thermodynamique',
  'BAR-TH-101': 'Chauffe-eau solaire individuel',

  // Ventilation
  'BAR-TH-125': 'VMC double flux',
  'BAR-TH-127': 'VMC simple flux hygroréglable',

  // Isolation
  'BAR-EN-101': 'Isolation des combles',
  'BAR-EN-102': 'Isolation murs intérieurs',
  'BAR-EN-103': 'Isolation murs extérieurs (ITE)',
  'BAR-EN-108': 'Isolation toiture-terrasse',

  // Menuiseries
  'BAR-EN-104': 'Fenêtres double-vitrage',

  // Régulation / chauffage
  'BAR-TH-129': 'Robinet thermostatique',
  'BAR-TH-143': 'Système solaire combiné',
  'BAR-TH-159': 'Émetteurs électriques basse consommation',
  'BAR-TH-161': 'Régulation par programmation chaudière',
  'BAR-TH-173': 'Calorifugeage chauffage',
  'BAR-TH-174': 'Mitigeur thermostatique',
  'BAR-TH-175': 'Thermostat avec régulation',
  'BAR-TH-177': 'Plancher chauffant solaire',

  // Sécurité
  'BAR-SE-104': 'Détecteur autonome de fumée',
}

/**
 * Returns the client-friendly term for a CEE operation code, or null if none.
 * Code is normalized to uppercase before lookup.
 */
export function getCeeClientTerm(opCode: string): string | null {
  return CEE_CLIENT_TERMS[opCode.toUpperCase()] ?? null
}
