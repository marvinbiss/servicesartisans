import { redirect } from 'next/navigation'

// Refonte 2026-06-06 : le tableau de bord est devenu « Aujourd'hui »,
// l'index de l'espace artisan. Redirect conservé pour les bookmarks.
export default function DashboardArtisanPage() {
  redirect('/espace-artisan')
}
