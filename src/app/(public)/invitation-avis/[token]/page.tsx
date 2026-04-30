import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { findInvitationByPlaintextToken } from '@/lib/reviews/invitations'
import InvitationReviewForm from './InvitationReviewForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Laisser un avis',
  description: 'Partagez votre retour sur votre artisan.',
  robots: { index: false, follow: false },
}

type PageProps = {
  params: { token: string }
}

export default async function DonnerAvisPage({ params }: PageProps) {
  const invitation = await findInvitationByPlaintextToken(params.token)

  if (!invitation) {
    notFound()
  }

  const now = Date.now()
  const expired = new Date(invitation.expires_at).getTime() < now
  const alreadySubmitted = !!invitation.completed_at

  if (alreadySubmitted) {
    return (
      <main className="min-h-screen bg-sand-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-sand-200 p-8 text-center">
          <h1
            data-speakable="true"
            className="font-heading text-2xl font-bold text-charcoal-900 mb-3"
          >
            Avis deja enregistre
          </h1>
          <p className="text-charcoal-600">
            Vous avez deja repondu a cette invitation. Merci pour votre retour.
          </p>
        </div>
      </main>
    )
  }

  if (expired) {
    return (
      <main className="min-h-screen bg-sand-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-sand-200 p-8 text-center">
          <h1
            data-speakable="true"
            className="font-heading text-2xl font-bold text-charcoal-900 mb-3"
          >
            Lien expire
          </h1>
          <p className="text-charcoal-600">
            Le lien de cette invitation n&apos;est plus valide (au-dela de 30 jours). Vous pouvez
            toujours nous contacter si vous souhaitez laisser un avis.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-sand-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-6">
          <h1
            data-speakable="true"
            className="font-heading text-3xl font-bold text-charcoal-900 mb-2"
          >
            Votre avis compte
          </h1>
          <p className="text-charcoal-600">
            {invitation.service_name
              ? `Votre retour sur ${invitation.service_name}`
              : 'Partagez votre retour en 30 secondes.'}
          </p>
        </header>
        <InvitationReviewForm
          token={params.token}
          clientName={invitation.client_name}
          serviceName={invitation.service_name}
        />
      </div>
    </main>
  )
}
