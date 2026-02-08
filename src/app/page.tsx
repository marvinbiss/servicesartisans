import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { PopularCitiesLinks, PopularServicesLinks, GeographicNavigation } from '@/components/InternalLinks'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/jsonld'
import { HeroSearch } from '@/components/search/HeroSearch'
import { TrustBadges, AvailabilityBadge } from '@/components/ui/TrustBadges'
import {
  StatsSection,
  ServicesShowcase,
  HowItWorksSection,
  TestimonialsSection,
  ArtisanCTASection,
} from '@/components/home/HomePageSections'

export const metadata: Metadata = {
  title: 'ServicesArtisans — Trouvez les meilleurs artisans près de chez vous',
  description:
    'Comparez les avis, les tarifs et obtenez des devis gratuits auprès de 2 500+ artisans vérifiés. Plombiers, électriciens, serruriers et plus dans toute la France.',
  alternates: { canonical: 'https://servicesartisans.fr' },
  openGraph: {
    title: 'ServicesArtisans — Trouvez les meilleurs artisans près de chez vous',
    description:
      'Comparez les avis, les tarifs et obtenez des devis gratuits auprès de 2 500+ artisans vérifiés dans toute la France.',
    type: 'website',
    url: 'https://servicesartisans.fr',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <JsonLd data={[getOrganizationSchema(), getWebsiteSchema()]} />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59,130,246,0.2) 0%, transparent 50%)',
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Trouvez l&apos;artisan ideal,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                pres de chez vous
              </span>
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-4">
              Comparez les avis, les tarifs et obtenez des devis gratuits
              aupres d&apos;artisans verifies dans toute la France.
            </p>
            <AvailabilityBadge count={2500} />
          </div>

          {/* Search */}
          <HeroSearch />

          {/* Trust badges */}
          <TrustBadges variant="hero" />
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────── */}
      <StatsSection />

      {/* ─── SERVICES ─────────────────────────────────────────── */}
      <ServicesShowcase />

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ─── GEOGRAPHIC COVERAGE ──────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6 text-center">
            Artisans partout en France
          </h2>
          <GeographicNavigation />
        </div>
      </section>

      {/* ─── ARTISAN CTA ──────────────────────────────────────── */}
      <ArtisanCTASection />

      {/* ─── POPULAR LINKS (SEO) ──────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <PopularServicesLinks showTitle limit={8} />
            <PopularCitiesLinks showTitle limit={10} />
          </div>
        </div>
      </section>
    </div>
  )
}
