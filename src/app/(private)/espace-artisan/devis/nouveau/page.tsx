import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DevisForm } from '@/components/devis/DevisForm'

export const metadata = { title: 'Nouveau devis' }

export default function NouveauDevisPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href="/espace-artisan/devis"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 mb-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Mes devis
        </Link>
        <h1 className="text-2xl font-bold text-charcoal-900 font-heading">Nouveau devis</h1>
      </div>
      <DevisForm mode="create" />
    </div>
  )
}
