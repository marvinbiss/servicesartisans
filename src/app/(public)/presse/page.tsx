import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Espace presse',
  description: 'Espace presse de ServicesArtisans. Communiqués, kit média et contacts presse du plus grand annuaire d\'artisans de France.',
  robots: { index: false, follow: true },
}

export default function PressePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(59,130,246,0.06) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[{ label: 'Presse' }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
          />
          <h1 className="font-heading text-4xl font-extrabold mb-4 tracking-[-0.025em]">
            Espace presse
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl">
            Retrouvez toutes les informations presse de ServicesArtisans, le plus grand annuaire d&apos;artisans de France.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
            Espace presse en cours de préparation
          </h2>
          <p className="text-gray-600 mb-6">
            Notre dossier de presse et notre kit média seront bientôt disponibles.
          </p>
          <p className="text-gray-500 mb-8">
            Pour toute demande presse, contactez-nous à{' '}
            <a href="mailto:presse@servicesartisans.fr" className="text-blue-600 hover:underline font-medium">
              presse@servicesartisans.fr
            </a>
          </p>
          <Link
            href="/a-propos"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            En savoir plus sur ServicesArtisans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
