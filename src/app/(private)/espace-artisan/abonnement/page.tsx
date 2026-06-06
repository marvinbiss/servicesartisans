import { redirect } from 'next/navigation'

// Gel 2026-06-06 : monétisation 0 € en phase de rodage — pas de page
// abonnement. Routes Stripe conservées — réactivable en restaurant cette
// page depuis l'historique git.
export default function AbonnementArtisanPage() {
  redirect('/espace-artisan')
}
