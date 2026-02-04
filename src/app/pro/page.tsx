import { redirect } from 'next/navigation'

export default function ProPage() {
  // Redirection vers le nouvel espace artisan unifié
  redirect('/espace-artisan/dashboard')
}
