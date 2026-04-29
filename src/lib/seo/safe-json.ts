/**
 * Module unique pour la sérialisation sûre du JSON injecté dans
 * `<script type="application/ld+json">`.
 *
 * Sources de risque neutralisées :
 *   - `<`, `>`, `&` : XSS via fermeture de balise (sanitize Sprint 0.1).
 *   - U+2028 (LINE SEPARATOR) / U+2029 (PARAGRAPH SEPARATOR) : interprétés
 *     comme fins de ligne par le parser HTML, peuvent casser un script tag.
 *     Pris en compte dans Sprint 0.2 (audit gap-analyst).
 *
 * Fail-soft : retourne `'null'` (Schema.org valide) plutôt que de crash le
 * rendu serveur sur :
 *   - circular references
 *   - BigInt (TypeError natif de JSON.stringify)
 *   - undefined (JSON.stringify retourne `undefined` non-string)
 *
 * Centralisé ici (et plus dans `app/(public)/rge/[s]/[v]/helpers.ts`) parce
 * que JsonLd.tsx, ArtisanSchema.tsx et `app/layout.tsx` ont besoin du même
 * helper. Avant Sprint 0.3, plusieurs implémentations divergeaient.
 *
 * Toute nouvelle injection JSON-LD via `dangerouslySetInnerHTML` DOIT passer
 * par cette fonction (vérifié par hook pre-commit `audit-jsonld-escape.mjs`).
 */
export function safeJsonStringify(data: unknown): string {
  try {
    const raw = JSON.stringify(data)
    if (typeof raw !== 'string') return 'null'
    return raw
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
  } catch {
    return 'null'
  }
}
