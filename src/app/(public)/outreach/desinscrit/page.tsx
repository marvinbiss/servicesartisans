/**
 * Sprint 4 vague 4 — Confirmation opt-out outreach (RGPD pro B2B).
 *
 * Page d'arrivée après le clic sur le lien d'opt-out 1-clic en pied d'email
 * Lemlist. Le RPC `outreach_opt_out` met à jour le log côté DB (idempotent).
 *
 * Robots: noindex (page transactionnelle).
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Désinscription confirmée — ServicesArtisans',
  robots: { index: false, follow: false },
}

export default function OutreachUnsubscribedPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Vous êtes désinscrit</h1>
      <p className="mt-4 text-gray-700">
        Nous ne vous adresserons plus d&apos;emails de prospection. Si vous changez d&apos;avis ou
        souhaitez revendiquer votre fiche artisan plus tard, vous pourrez toujours le faire depuis
        notre site.
      </p>
      <p className="mt-2 text-gray-700">
        Pour toute question relative à vos données, contactez-nous à
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
