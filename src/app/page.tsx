import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { PopularCitiesLinks, PopularServicesLinks, PopularServiceCityLinks, GeographicNavigation } from '@/components/InternalLinks'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/jsonld'
import Link from 'next/link'
import { HeroSearch } from '@/components/search/HeroSearch'
import { TrustBadges, AvailabilityBadge } from '@/components/ui/TrustBadges'
import {
  StatsSection,
  ServicesShowcase,
  HowItWorksSection,
  TestimonialsSection,
  ArtisanCTASection,
  GuaranteeSection,
  WhyUsSection,
} from '@/components/home/HomePageSections'

export const metadata: Metadata = {
  title: 'ServicesArtisans — 350 000+ artisans vérifiés en France',
  description:
    'Le plus grand annuaire d\'artisans de France. 350 000+ professionnels vérifiés par SIREN, 101 départements couverts. Comparez les avis, obtenez des devis gratuits. Plombiers, électriciens, menuisiers et plus.',
  alternates: { canonical: 'https://servicesartisans.fr' },
  openGraph: {
    title: 'ServicesArtisans — 350 000+ artisans vérifiés en France',
    description:
      'Le plus grand annuaire d\'artisans de France. 350 000+ professionnels vérifiés par SIREN dans 101 départements. Devis gratuits.',
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
              <AvailabilityBadge count={350000} />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold mb-6 tracking-[-0.025em] leading-[1.08]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
                350 000+
              </span>{' '}
              artisans vérifiés,
              <br className="hidden md:block" />
              partout en France
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6">
              Le plus grand annuaire d&apos;artisans de France. Données SIREN vérifiées,
              101 départements couverts. Comparez et contactez gratuitement.
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 transition-all duration-300"
            >
              Demander un devis gratuit
            </Link>
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

      {/* ─── GUARANTEE ─────────────────────────────────────────── */}
      <GuaranteeSection />

      {/* ─── WHY US ──────────────────────────────────────────── */}
      <WhyUsSection />

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
