import { redirect } from 'next/navigation'

// Refonte 2026-06-06 : le portfolio vit dans « Ma fiche » (onglet dédié).
export default function PortfolioPage() {
  redirect('/espace-artisan/profil?tab=portfolio')
}
