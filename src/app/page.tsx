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
        {/* Premium background — gradient mesh with depth layers */}
        <div className="absolute inset-0">
          {/* Primary gradient mesh */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(59,130,246,0.06) 0%, transparent 50%)',
          }} />
          {/* Accent glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-[0.04]" style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
          }} />
          {/* Subtle grid pattern for depth */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          {/* Bottom fade to white (for stats overlap) */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-32 md:pt-28 md:pb-40">
          <div className="text-center mb-12">
            <div className="mb-6">
              <AvailabilityBadge count={2500} />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold mb-6 tracking-[-0.025em] leading-[1.08]">
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

      {/* ─── STATS (overlaps hero) ───────────────────────────── */}
      <StatsSection />

      {/* ─── SERVICES ─────────────────────────────────────────── */}
      <ServicesShowcase />

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ─── GEOGRAPHIC COVERAGE ──────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">
            Artisans partout en France
          </h2>
          <p className="text-slate-500 text-center mb-8 max-w-lg mx-auto">
            Trouvez des professionnels dans votre région, département ou ville.
          </p>
          <GeographicNavigation />
        </div>
      </section>

      {/* ─── ARTISAN CTA ──────────────────────────────────────── */}
      <ArtisanCTASection />

      {/* ─── POPULAR LINKS (SEO) ──────────────────────────────── */}
      <section className="py-16 bg-gray-50/80 border-t border-gray-100">
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
