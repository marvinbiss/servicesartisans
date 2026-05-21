/**
 * Spec source for the API explorer.
 *
 * Imports the OpenAPI 3.1 const directly from Ralph 27
 * (`@/app/api/v1/openapi/_spec`) — no HTTP fetch at build → deterministic
 * + fast + zero risk of a broken explorer when the API route 5xxs.
 *
 * Wrapped behind `getSpec()` so tests can stub the source without
 * touching the const.
 */

import { OPENAPI_SPEC } from '@/app/api/v1/openapi/_spec'

export function getSpec(): typeof OPENAPI_SPEC {
  return OPENAPI_SPEC
}
