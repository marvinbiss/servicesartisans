import { redirect } from 'next/navigation'

// Refonte 2026-06-06 : les avis vivent dans « Ma fiche » (onglet dédié).
export default function AvisPage() {
  redirect('/espace-artisan/profil?tab=avis')
}
