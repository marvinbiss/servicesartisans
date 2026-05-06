import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import TwoFactorSettings from '@/components/auth/TwoFactorSettings'

// Plan C — C-2 : page d'enrollment + gestion 2FA pour les artisans.
// Le middleware protège déjà `/espace-artisan` ; aucune logique d'auth ici.

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Sécurité — Vérification en deux étapes | ServicesArtisans',
  robots: { index: false, follow: false },
}

export default function Artisan2FAPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/espace-artisan/parametres"
        className="inline-flex items-center gap-1 text-sm text-charcoal-500 hover:text-charcoal-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Retour aux paramètres
      </Link>
      <h1 className="text-2xl font-bold mb-6">Sécurité du compte</h1>
      <TwoFactorSettings />
    </div>
  )
}
