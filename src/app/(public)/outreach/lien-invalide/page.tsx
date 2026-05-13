/**
 * Sprint 4 vague 4 — Lien d'opt-out invalide.
 *
 * Robots: noindex.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lien invalide — ServicesArtisans',
  robots: { index: false, follow: false },
}

export default function OutreachInvalidPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-charcoal-900">Lien invalide</h1>
      <p className="mt-4 text-charcoal-700">
        Ce lien de désinscription n&apos;est pas reconnu. Pour vous désinscrire ou exercer vos
        droits sur vos données, contactez directement
        <a className="ml-1 text-orange-600 underline" href="mailto:contact@servicesartisans.fr">
          contact@servicesartisans.fr
        </a>
        .
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
