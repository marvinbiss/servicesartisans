/**
 * Sprint 4 vague 4 — Confirmation email validée (succès).
 *
 * Page statique d'arrivée après le clic sur le lien de confirmation envoyé
 * par /api/artisan/claim/confirm/[token]. Volontairement minimaliste : pas
 * de PII, pas de claim id en URL, juste un message de confirmation.
 *
 * Robots: noindex — page transactionnelle utilitaire, aucune valeur SEO.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Email confirmé — ServicesArtisans',
  robots: { index: false, follow: false },
}

export default function ClaimConfirmedPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-charcoal-900">Email confirmé</h1>
      <p className="mt-4 text-charcoal-700">
        Merci, votre adresse email est maintenant validée. Votre demande de revendication est en
        cours d&apos;examen.
      </p>
      <p className="mt-2 text-charcoal-700">
        Si toutes les conditions sont réunies (SIRET vérifié, RGE actif), elle peut être approuvée
        automatiquement dans l&apos;heure qui suit. Sinon, un administrateur la traite sous 24-72h.
      </p>
      <p className="mt-2 text-charcoal-700">
        Vous recevrez un nouvel email dès que votre fiche sera active.
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
