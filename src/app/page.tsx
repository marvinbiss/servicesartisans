import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { PopularCitiesLinks, PopularServicesLinks, PopularServiceCityLinks, GeographicNavigation } from '@/components/InternalLinks'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/jsonld'
import { HeroSection } from '@/components/home/HeroSection'
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
  title: 'ServicesArtisans — 350 000+ artisans référencés en France',
  description:
    'Le plus grand annuaire d\'artisans de France. 350 000+ professionnels référencés, 101 départements couverts. Comparez les avis, obtenez des devis gratuits. Plombiers, électriciens, menuisiers et plus.',
  alternates: { canonical: 'https://servicesartisans.fr' },
  openGraph: {
    title: 'ServicesArtisans — 350 000+ artisans référencés en France',
    description:
      'Le plus grand annuaire d\'artisans de France. 350 000+ professionnels référencés dans 101 départements. Devis gratuits.',
    type: 'website',
    url: 'https://servicesartisans.fr',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <JsonLd data={[getOrganizationSchema(), getWebsiteSchema()]} />

      {/* ─── HERO + TRUST BAR ────────────────────────────────── */}
      <HeroSection />

      {/* ─── STATS ─────────────────────────────────────────── */}
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
