/**
 * Sanitisers for the public RGE endpoints (`/api/v1/rge/*`).
 *
 * The qualification filter value is interpolated into BOTH a JSON literal
 * (`[{"code":"${safe}"}]`) and a Postgres array literal (`{${safe}}`). Any
 * unsanitised `"`, `\\`, `,`, `{`, `}`, `'` would break the query at best
 * and enable injection at worst.
 *
 * RGE codes are ASCII in practice: `QualiPAC`, `Qualibat`, `RGE`, `PG-Eco-Artisan`.
 * We strip accents, then whitelist to [A-Za-z0-9+\\-\\s], cap length.
 */

export function sanitizeQualificationCode(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9+\-\s]/g, '')
    .trim()
    .slice(0, 40)
}
