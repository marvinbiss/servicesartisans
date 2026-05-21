/**
 * Standard error envelope pour `/api/v1/aides/*`.
 *
 * Shape figée (contrat consommateurs API tiers) :
 *   { error: { code, message, errors? }, _meta: { api_version, license, docs } }
 *
 * Le tableau `errors` liste TOUTES les violations de validation en un seul
 * round-trip — c'est ce que les SDK clients (Sonergia, Effy, Hellio) attendent
 * pour afficher un formulaire bien rempli.
 */

import { NextResponse } from 'next/server'

import type { ValidationError } from './validation'

const DOCS_URL = 'https://servicesartisans.fr/developpeurs'

export function jsonError(
  status: number,
  code: string,
  message: string,
  errors?: ReadonlyArray<ValidationError>
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        errors: errors && errors.length > 0 ? errors : undefined,
      },
      _meta: {
        api_version: 'v1',
        license: 'CC-BY-4.0',
        docs: DOCS_URL,
      },
    },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}
