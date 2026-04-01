/**
 * UUID v4 validation helper.
 * Used by API routes to reject malformed IDs with a 400 instead of
 * letting Supabase throw a 500 (invalid input syntax for type uuid).
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value)
}
