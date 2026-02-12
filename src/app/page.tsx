import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { PopularCitiesLinks, PopularServicesLinks, PopularServiceCityLinks, GeographicNavigation } from '@/components/InternalLinks'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/jsonld'
import { HeroSection } from '@/components/home/HeroSection'
import {
  ServicesShowcase,
  HowItWorksSection,
  ArtisanCTASection,
  TrustSection,
} from '@/components/home/HomePageSections'
import { GeographicSectionWrapper } from '@/components/home/GeographicSectionWrapper'

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

      {/* ─── SERVICES ─────────────────────────────────────────── */}
      <ServicesShowcase />

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ─── TRUST (Guarantees + Why Us) ─────────────────────── */}
      <TrustSection />

      {/* ─── GEOGRAPHIC COVERAGE ──────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <GeographicSectionWrapper>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                Couverture nationale
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">
                Artisans partout en France
              </h2>
              <p className="text-slate-500 text-center max-w-lg mx-auto">
                Trouvez des professionnels dans votre région, département ou ville.
              </p>
            </div>
            <GeographicNavigation />
          </GeographicSectionWrapper>
        </div>
      </section>

      {/* ─── ARTISAN CTA ──────────────────────────────────────── */}
      <ArtisanCTASection />

      {/* ─── POPULAR LINKS (SEO) ──────────────────────────────── */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
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
