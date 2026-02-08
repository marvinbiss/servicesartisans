import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { PopularCitiesLinks, PopularServicesLinks, PopularServiceCityLinks, GeographicNavigation } from '@/components/InternalLinks'
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
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        {/* Refined background — layered radial gradients for depth */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(37,99,235,0.08) 0%, transparent 50%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(59,130,246,0.06) 0%, transparent 50%)',
          }} />
          {/* Subtle grid pattern for depth */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="text-center mb-12">
            <div className="mb-6">
              <AvailabilityBadge count={2500} />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold mb-6 tracking-[-0.02em] leading-[1.1]">
              Trouvez l&apos;artisan idéal,{' '}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
                près de chez vous
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Comparez les avis, les tarifs et obtenez des devis gratuits
              auprès d&apos;artisans vérifiés dans toute la France.
            </p>
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
          <div className="grid md:grid-cols-3 gap-12">
            <PopularServicesLinks showTitle limit={8} />
            <PopularCitiesLinks showTitle limit={10} />
            <PopularServiceCityLinks showTitle limit={12} />
          </div>
        </div>
      </section>
    </div>
  )
}
