/**
 * Artisan Avatar API — Temporairement désactivée
 *
 * La colonne avatar_url a été supprimée de la table providers (migration 100).
 * Cette fonctionnalité est temporairement indisponible.
 * TODO: Stocker l'URL avatar dans une table dédiée ou un champ profil.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const NOT_IMPLEMENTED = NextResponse.json(
  {
    error:
      'La fonctionnalité de photo de profil est temporairement indisponible. Veuillez contacter le support.',
  },
  { status: 501 }
)

export async function POST() {
  return NOT_IMPLEMENTED
}

export async function DELETE() {
  return NOT_IMPLEMENTED
}
