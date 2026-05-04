/**
 * Sprint 4 vague 4 — Lien de confirmation invalide ou expiré.
 *
 * Robots: noindex.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lien invalide — ServicesArtisans',
  robots: { index: false, follow: false },
}

export default function ClaimLinkInvalidPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Lien invalide ou expiré</h1>
      <p className="mt-4 text-gray-700">
        Ce lien de confirmation n&apos;est plus valide. Cela peut arriver si&nbsp;:
      </p>
      <ul className="mt-2 list-disc pl-6 text-gray-700">
        <li>le lien a déjà été utilisé,</li>
        <li>il a expiré (validité 7 jours),</li>
        <li>la demande a déjà été traitée par notre équipe.</li>
      </ul>
      <p className="mt-4 text-gray-700">
        Si vous avez besoin de relancer la revendication, recommencez depuis votre fiche artisan.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-block rounded-md bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
