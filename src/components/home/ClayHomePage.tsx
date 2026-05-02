import Link from 'next/link'
import Image from 'next/image'
import {
  Droplets,
  Zap,
  HardHat,
  PaintBucket,
  Hammer,
  ShieldCheck,
  Star,
  MapPin,
  Shield,
  Key,
  Flame,
  Thermometer,
  ArrowRight,
  Clock,
  CheckCircle,
  ClipboardList,
} from 'lucide-react'
import { ClayHeroSearch } from './ClayHeroSearch'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import { ClayReviewsCarousel } from './ClayReviewsCarousel'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import {
  formatProviderCount,
  type SiteStats,
  type HomepageProvider,
  type HomepageReview,
} from '@/lib/data/stats'
import { faqCategories } from '@/lib/data/faq-data'
import { BLUR_PLACEHOLDER } from '@/lib/data/images'
import dynamic from 'next/dynamic'

const SocialProofToast = dynamic(() => import('@/components/conversion/SocialProofToast'), {
  ssr: false,
})

interface Props {
  stats: SiteStats
  serviceCounts: Record<string, number>
  topProviders: HomepageProvider[]
  recentReviews: HomepageReview[]
}

const SERVICE_ITEMS = [
  { Icon: Droplets, name: 'Plomberie', slug: 'plombier', price: '50' },
  { Icon: Zap, name: 'Électricité', slug: 'electricien', price: '60' },
  { Icon: Key, name: 'Serrurerie', slug: 'serrurier', price: '70' },
  { Icon: Flame, name: 'Chauffage', slug: 'chauffagiste', price: '80' },
  { Icon: PaintBucket, name: 'Peinture', slug: 'peintre-en-batiment', price: '25' },
  { Icon: Hammer, name: 'Menuiserie', slug: 'menuisier', price: '45' },
  { Icon: HardHat, name: 'Maçonnerie', slug: 'macon', price: '55' },
  { Icon: Thermometer, name: 'Pompe à chaleur', slug: 'pompe-a-chaleur', price: '120' },
]

// Artisans mis en avant (sélection manuelle — vrais profils vérifiés)
// rating_average et review_count à null : seules les données réelles de la DB sont affichées
const FEATURED_ARTISANS = [
  {
    name: 'P B C Services',
    specialty: 'Plombier',
    address_city: 'Paris',
    address_postal_code: '75013',
    rating_average: null as number | null,
    review_count: null as number | null,
    is_verified: true,
    slug: 'plombier',
    stable_id: 'p-b-c-services-814394359',
    profileCity: 'paris',
  },
  {
    name: 'Ecoterra',
    specialty: 'Électricien',
    address_city: 'Marseille',
    address_postal_code: '13006',
    rating_average: null as number | null,
    review_count: null as number | null,
    is_verified: true,
    slug: 'electricien',
    stable_id: 'ecoterra-940717085',
    profileCity: 'marseille',
  },
  {
    name: 'Romain Simon',
    specialty: 'Serrurier',
    address_city: 'Strasbourg',
    address_postal_code: '67000',
    rating_average: null as number | null,
    review_count: null as number | null,
    is_verified: true,
    slug: 'serrurier',
    stable_id: 'romain-simon-strasbourg',
    profileCity: 'strasbourg',
  },
]

/** Met en forme le nom : "DUPONT JEAN" -> "Dupont Jean" */
function formatName(raw: string): string {
  if (raw === raw.toUpperCase()) {
    return raw
      .toLowerCase()
      .replace(/(?:^|\s|['-])\S/g, (c) => c.toUpperCase())
      .replace(/\s*\(.*$/, '')
  }
  return raw.replace(/\s*\(.*$/, '')
}

// Fallback : témoignages représentatifs (prénom + ville, pas de nom de famille)
const FALLBACK_REVIEWS = [
  {
    author_name: 'Sophie · Lyon',
    rating: 5,
    content:
      "Fuite d'eau un dimanche soir, j'ai trouvé un plombier en 20 minutes via le site. Intervention rapide, tarif annoncé respecté. Je recommande sans hésiter.",
    created_at: '',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face&q=80',
  },
  {
    author_name: 'Marc · Bordeaux',
    rating: 5,
    content:
      "3 devis reçus en 48h pour ma rénovation de salle de bain. J'ai pu comparer les prix et choisir sereinement. L'artisan a respecté les délais et le budget.",
    created_at: '',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face&q=80',
  },
  {
    author_name: 'Nathalie · Toulouse',
    rating: 5,
    content:
      "Ce qui m'a convaincue c'est la vérification SIREN des artisans. On sait à qui on a affaire. Mise en relation simple, travaux réalisés dans la foulée.",
    created_at: '',
    avatar:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face&q=80',
  },
]

const CARD_BG_IMAGES = [
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=250&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&h=250&fit=crop&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=250&fit=crop&q=80',
]

const REVIEW_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face&q=80',
]

function renderStars(rating: number) {
  return [1, 2, 3, 4, 5].map((i) => (
    <span key={i} className={i <= Math.round(rating) ? 'text-amber-400' : 'text-charcoal-200'}>
      &#9733;
    </span>
  ))
}

// ── FAQ Section ──────────────────────────────────────────────────
const FAQ_CATEGORIES = ['Général', 'Demande de devis']

function ClayFAQSection() {
  const faqs = faqCategories
    .filter((c) => FAQ_CATEGORIES.includes(c.name))
    .flatMap((c) => c.questions)

  return (
    <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-24">
      <div className="text-center mb-1">
        <div className="inline-block text-xs font-bold text-primary-400 tracking-[.12em] uppercase">
          Questions fréquentes
        </div>
      </div>
      <h2
        className="font-heading font-black tracking-[-0.04em] leading-tight text-charcoal-900 text-center mb-12"
        style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)' }}
      >
        Tout ce que vous devez savoir.
      </h2>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-2xl bg-sand-50 border border-sand-300/60 transition-shadow duration-300 hover:shadow-soft"
          >
            <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-left text-base font-bold text-charcoal-900 list-none [&::-webkit-details-marker]:hidden">
              <span>{faq.q}</span>
              <svg
                className="w-5 h-5 text-primary-400 shrink-0 ml-4 transition-transform duration-300 group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>
            <div className="faq-answer px-6 pb-5 text-sm text-charcoal-500 leading-relaxed">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────
export function ClayHomePage({ stats, serviceCounts, topProviders, recentReviews }: Props) {
  const { artisanCount, reviewCount, avgRating, deptCount } = stats
  const countStr = artisanCount > 0 ? `${formatProviderCount(artisanCount)}+` : '---'
  const reviewStr = reviewCount > 0 ? `${formatProviderCount(reviewCount)}` : '---'
  const ratingStr = avgRating > 0 ? avgRating.toFixed(1).replace('.', ',') : '---'

  // Use real top providers from DB when available, fall back to curated list
  const artisans =
    topProviders.length >= 3
      ? topProviders.slice(0, 3).map((p) => ({
          ...p,
          profileCity: (p.address_city ?? '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        }))
      : FEATURED_ARTISANS
  const bigReviews = recentReviews.length >= 3 ? recentReviews.slice(0, 3) : FALLBACK_REVIEWS
  const carouselReviews = recentReviews.length >= 6 ? recentReviews.slice(3) : undefined

  return (
    <>
      {/* ─── HERO — Règle des 3 secondes ──────────────────────── */}
      <section className="relative bg-gradient-sand overflow-hidden">
        {/* Subtle decorative shapes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle, #E86B4B 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, #3D8B68 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-10 pt-12 pb-10 md:pt-20 md:pb-16">
          {/* Animated badge */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
              </span>
              {countStr} artisans disponibles aujourd'hui
            </div>
          </div>

          {/* Main headline — value-proposition first */}
          <h2
            className="font-heading font-black tracking-[-0.04em] leading-[1.08] text-charcoal-900 text-center mb-4 md:mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            aria-hidden="true"
          >
            Recevez 3 devis d&apos;artisans vérifiés aujourd&apos;hui
          </h2>

          <p className="text-center text-charcoal-500 text-base md:text-lg max-w-xl mx-auto mb-6 md:mb-8 leading-relaxed">
            Gratuit, sans frais. Réponse artisan en 24-48h.
          </p>

          {/* Primary CTA — high contrast, impossible to miss */}
          <div className="flex flex-col items-center gap-4 mb-8 md:mb-10">
            <Link
              href="/devis"
              className="inline-flex items-center justify-center gap-2.5 px-10 py-5 rounded-2xl font-heading font-extrabold text-lg md:text-xl text-white bg-primary-500 hover:bg-primary-600 shadow-cta hover:shadow-cta-hover transition-all duration-200 hover:-translate-y-1 animate-pulse-subtle"
            >
              <ClipboardList className="w-6 h-6" />
              Obtenir mes 3 devis gratuits — en 2 min
            </Link>
            {/* Trust micro-copy directly under CTA */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs md:text-sm font-medium text-charcoal-500">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                {countStr} artisans vérifiés
              </span>
              <span className="text-charcoal-200">·</span>
              <span>100% gratuit</span>
              <span className="text-charcoal-200">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary-400" />
                Réponse rapide
              </span>
            </div>
            <Link
              href="/urgence"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-500 hover:text-primary-400 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Urgent ? Réponse en 24h garantie
            </Link>
          </div>

          {/* MASSIVE search bar */}
          <div className="max-w-2xl mx-auto mb-5 md:mb-6">
            <ClayHeroSearch />
          </div>

          {/* Trust line — immediately under search */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-charcoal-500">
            <span className="inline-flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <strong className="text-charcoal-800">{ratingStr}/5</strong> sur {reviewStr} avis
            </span>
            <span className="hidden sm:inline text-charcoal-200">|</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-500" />
              Artisans vérifiés SIREN
            </span>
            <span className="hidden sm:inline text-charcoal-200">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary-400" />
              Devis gratuit
            </span>
          </div>
        </div>
      </section>

      {/* ─── SIMULATEUR AIDES — CTA post-hero, pré-services ─── */}
      <ScrollReveal as="section">
        <div className="bg-white pt-10 md:pt-12">
          <div className="max-w-4xl mx-auto px-5 md:px-10">
            <SimulateurCTA variant="card" />
          </div>
        </div>
      </ScrollReveal>

      {/* ─── SERVICES POPULAIRES — Grid 4x2 ─────────────────── */}
      <ScrollReveal as="section">
        <div className="bg-white py-16 md:py-20">
          <div className="max-w-[1320px] mx-auto px-5 md:px-10">
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="text-xs font-bold text-primary-400 tracking-[.12em] uppercase mb-2">
                  Services populaires
                </div>
                <h2
                  className="font-heading font-black tracking-[-0.04em] leading-tight text-charcoal-900"
                  style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)' }}
                >
                  50+ corps de métier — Trouvez le bon artisan en 2 min
                </h2>
              </div>
              <Link
                href="/services"
                className="text-sm font-bold text-primary-400 hover:text-primary-600 transition-colors hidden sm:block"
              >
                Voir tout <ArrowRight className="w-4 h-4 inline" />
              </Link>
            </div>

            {/* Desktop: 4x2 grid | Mobile: horizontal scroll */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 -mx-5 px-5 pb-3 md:grid md:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {SERVICE_ITEMS.map(({ Icon: SvcIcon, name, slug, price }, i) => (
                <ScrollReveal key={slug} delay={i * 0.06}>
                  <Link
                    href={`/services/${slug}`}
                    className="group snap-start flex-shrink-0 w-[160px] md:w-auto bg-white rounded-2xl p-5 text-center transition-all duration-300 border border-sand-200 hover:border-primary-200 hover:-translate-y-1 hover:shadow-card-hover block"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
                      <SvcIcon className="w-6 h-6 text-primary-400" />
                    </div>
                    <div className="text-sm font-bold text-charcoal-900 mb-1">{name}</div>
                    <div className="text-xs text-charcoal-400">
                      {serviceCounts[slug] > 0
                        ? `${formatProviderCount(serviceCounts[slug])} artisans`
                        : `À partir de ${price}€`}
                    </div>
                    <ArrowRight className="w-4 h-4 text-charcoal-200 group-hover:text-primary-400 mx-auto mt-2 transition-colors" />
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <Link
              href="/services"
              className="text-sm font-bold text-primary-400 hover:text-primary-600 transition-colors block text-center mt-6 sm:hidden"
            >
              Voir tous les services <ArrowRight className="w-4 h-4 inline" />
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* ─── COMMENT CA MARCHE — 3 étapes visuelles ─────────── */}
      <ScrollReveal as="section">
        <div className="bg-sand-100 py-16 md:py-20">
          <div className="max-w-[1320px] mx-auto px-5 md:px-10">
            <div className="text-center mb-12">
              <div className="inline-block text-xs font-bold text-primary-400 tracking-[.12em] uppercase mb-2">
                Comment ça marche
              </div>
              <h2
                className="font-heading font-black tracking-[-0.04em] leading-tight text-charcoal-900"
                style={{ fontSize: 'clamp(1.75rem,3.5vw,2.5rem)' }}
              >
                Devis gratuit en 2 min — 48h réponse garantie — 100% artisans vérifiés
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative max-w-4xl mx-auto">
              {/* Connector line (desktop) */}
              <div
                className="hidden md:block absolute top-[48px] h-0.5 opacity-20"
                style={{
                  left: '20%',
                  right: '20%',
                  background:
                    'repeating-linear-gradient(90deg,#E86B4B 0,#E86B4B 8px,transparent 8px,transparent 18px)',
                }}
                aria-hidden="true"
              />

              {[
                {
                  n: '1',
                  title: 'Décrivez votre besoin',
                  desc: 'Type de travaux, localisation, urgence --- 2 minutes suffisent.',
                  icon: ClipboardList,
                },
                {
                  n: '2',
                  title: 'Recevez des devis',
                  desc: "Jusqu'à 3 artisans vérifiés vous contactent rapidement. Gratuit.",
                  icon: Clock,
                },
                {
                  n: '3',
                  title: 'Choisissez votre artisan',
                  desc: 'Comparez profils, avis et tarifs. Choisissez librement.',
                  icon: CheckCircle,
                },
              ].map((step, i) => {
                const StepIcon = step.icon
                return (
                  <ScrollReveal key={step.n} delay={i * 0.12}>
                    <div className="text-center relative z-10">
                      {/* Big step number */}
                      <div className="relative mx-auto mb-5 w-24 h-24 flex items-center justify-center">
                        <span
                          className="absolute inset-0 flex items-center justify-center font-heading text-7xl font-black text-primary-100 select-none"
                          aria-hidden="true"
                        >
                          {step.n}
                        </span>
                        <div className="relative w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center border border-sand-200">
                          <StepIcon className="w-7 h-7 text-primary-400" />
                        </div>
                      </div>
                      <div className="font-heading text-lg font-bold text-charcoal-900 mb-2">
                        {step.title}
                      </div>
                      <p className="text-sm text-charcoal-500 leading-relaxed max-w-xs mx-auto">
                        {step.desc}
                      </p>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ─── PREUVE SOCIALE — Chiffres clés + avis ──────────── */}
      <ScrollReveal as="section">
        <div className="bg-white py-16 md:py-20">
          <div className="max-w-[1320px] mx-auto px-5 md:px-10">
            {/* Key stats banner */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mb-14">
              {[
                {
                  value: countStr,
                  label: 'artisans vérifiés',
                  icon: ShieldCheck,
                  color: 'text-accent-600',
                },
                {
                  value: `${ratingStr}/5`,
                  label: 'note moyenne',
                  icon: Star,
                  color: 'text-amber-500',
                },
                {
                  value: 'Gratuit',
                  label: 'devis sans engagement',
                  icon: Clock,
                  color: 'text-primary-400',
                },
              ].map((stat) => {
                const StatIcon = stat.icon
                return (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-sand-100 flex items-center justify-center">
                      <StatIcon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="font-heading text-2xl font-black text-charcoal-900">
                        {stat.value}
                      </div>
                      <div className="text-xs text-charcoal-400">{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Reviews heading */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
              <h2
                className="font-heading font-black tracking-[-0.04em] leading-tight text-charcoal-900"
                style={{ fontSize: 'clamp(1.75rem,3.5vw,2.5rem)' }}
              >
                Ils nous font <span className="text-primary-400">confiance.</span>
              </h2>
              <div className="text-right">
                <div className="text-2xl font-black text-amber-400">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </div>
                <div className="text-sm text-charcoal-400">
                  {ratingStr}/5 · {reviewStr} avis vérifiés
                </div>
              </div>
            </div>

            {/* Big review cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {bigReviews.map((rv, i) => {
                const avatar =
                  'avatar' in rv && rv.avatar
                    ? (rv.avatar as string)
                    : REVIEW_AVATARS[i % REVIEW_AVATARS.length]
                return (
                  <ScrollReveal key={rv.author_name || i} delay={i * 0.1}>
                    <div className="bg-sand-50 rounded-2xl p-6 border border-sand-200 hover:shadow-card-hover transition-all duration-300">
                      <div className="text-4xl font-black leading-none mb-3 text-primary-200">
                        “
                      </div>
                      <p className="text-base leading-[1.75] mb-5 text-charcoal-700 italic">
                        {rv.content}
                      </p>
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={avatar}
                          alt={rv.author_name || 'Client vérifié'}
                          width={40}
                          height={40}
                          sizes="40px"
                          placeholder="blur"
                          blurDataURL={BLUR_PLACEHOLDER}
                          className="rounded-full object-cover border-2 border-sand-200"
                        />
                        <div>
                          <div className="text-sm font-bold text-charcoal-900">
                            {rv.author_name || 'Client vérifié'}
                          </div>
                          <div className="text-xs text-charcoal-400">Client vérifié</div>
                        </div>
                        <div className="ml-auto text-xs">{renderStars(rv.rating)}</div>
                      </div>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>

            {/* Carousel for additional reviews */}
            {carouselReviews && carouselReviews.length > 0 && (
              <div className="overflow-hidden">
                <ClayReviewsCarousel reviews={carouselReviews} />
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* ─── ARTISAN CARDS (les mieux notés) ────────────────── */}
      <ScrollReveal as="section">
        <div className="bg-sand-100 py-16 md:py-20">
          <div className="max-w-[1320px] mx-auto px-5 md:px-10">
            <div className="flex justify-between items-end mb-10">
              <div>
                <div className="text-xs font-bold text-primary-400 tracking-[.12em] uppercase mb-2">
                  Près de vous
                </div>
                <h2
                  className="font-heading font-black tracking-[-0.04em] leading-tight text-charcoal-900"
                  style={{ fontSize: 'clamp(1.75rem,3.5vw,2.5rem)' }}
                >
                  Artisans vérifiés près de chez vous.
                </h2>
              </div>
              <Link
                href="/services"
                className="text-sm font-bold text-primary-400 hover:text-primary-600 transition-colors"
              >
                Voir tous <ArrowRight className="w-4 h-4 inline" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {artisans.map((a, i) => {
                const rating = a.rating_average ?? 0
                const ratingDisplay = rating.toFixed(1).replace('.', ',')
                const profileHref = a.stable_id
                  ? `/services/${a.slug}/${a.profileCity}/${a.stable_id}`
                  : `/services/${a.slug}`
                const bgImage = CARD_BG_IMAGES[i % CARD_BG_IMAGES.length]

                return (
                  <ScrollReveal key={a.name} delay={i * 0.1}>
                    <div className="rounded-3xl overflow-hidden transition-all duration-300 bg-white border border-sand-200 hover:shadow-card-hover hover:-translate-y-1">
                      <div className="relative overflow-hidden h-[200px]">
                        <Image
                          src={bgImage}
                          alt={`${a.name} — services artisans en France`}
                          fill
                          {...(i < 3 ? { priority: true } : { loading: 'lazy' as const })}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          placeholder="blur"
                          blurDataURL={BLUR_PLACEHOLDER}
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                        <div className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                          {a.is_verified ? '✓ Vérifié SIREN' : '✓ Référencé'}
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-4">
                        <div className="text-base font-black text-charcoal-900 mb-0.5 line-clamp-1">
                          {formatName(a.name)}
                        </div>
                        <div className="text-sm text-charcoal-400 mb-2.5 line-clamp-1">
                          {a.specialty}
                          {a.address_city ? ` · ${a.address_city}` : ''}
                          {a.address_postal_code ? ` (${a.address_postal_code})` : ''}
                        </div>
                        <div className="flex items-center gap-1.5 mb-3">
                          {rating > 0 ? (
                            <>
                              <span className="text-sm">{renderStars(rating)}</span>
                              <span className="text-sm font-bold text-charcoal-900">
                                {ratingDisplay}
                              </span>
                              {a.review_count != null && a.review_count > 0 && (
                                <span className="text-xs text-charcoal-400">
                                  ({a.review_count} avis)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs font-medium text-accent-600 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Profil vérifié
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end items-center">
                          <Link
                            href={profileHref}
                            className="text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 bg-primary-400 hover:bg-primary-600 shadow-cta hover:shadow-cta-hover"
                          >
                            Voir le profil
                          </Link>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ─── TRUST BAR ──────────────────────────────────────────── */}
      <ScrollReveal>
        <div className="bg-white border-y border-sand-200">
          <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-14 flex flex-wrap justify-around items-center gap-6">
            {[
              { Icon: ShieldCheck, label: 'SIREN vérifié', sub: 'Chaque artisan contrôlé' },
              { Icon: Star, label: `${ratingStr}/5 moyenne`, sub: `+${reviewStr} avis vérifiés` },
              { Icon: Zap, label: 'Devis en 24h', sub: 'Gratuit et sans engagement' },
              { Icon: Shield, label: 'Données officielles', sub: "Registres de l'État" },
              { Icon: MapPin, label: `${deptCount} départements`, sub: 'Toute la France couverte' },
            ].map(({ Icon: TrustIcon, label, sub }, i, arr) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <TrustIcon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-charcoal-900">{label}</div>
                  <div className="text-xs text-charcoal-400 mt-0.5">{sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden xl:block w-px h-9 ml-6 bg-sand-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <ScrollReveal as="section">
        <div className="bg-sand-50">
          <ClayFAQSection />
        </div>
      </ScrollReveal>

      {/* ─── CTA FINAL — Bannière pleine largeur ────────────── */}
      <ScrollReveal as="section">
        <div className="relative overflow-hidden flex items-center" style={{ minHeight: '360px' }}>
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&h=500&fit=crop&q=80"
              alt="Artisan qualifié sur un chantier de construction en France"
              fill
              loading="lazy"
              sizes="100vw"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-terra opacity-[0.92]" />

          <div className="relative z-10 max-w-[1320px] mx-auto px-5 md:px-10 py-20 text-center w-full">
            <h2
              className="font-heading font-black tracking-[-0.04em] text-white leading-[1.05] mb-4"
              style={{ fontSize: 'clamp(1.75rem,4vw,2.8rem)' }}
            >
              Prêt à démarrer votre projet ?
            </h2>
            <p className="text-base leading-[1.7] mb-8 max-w-xl mx-auto text-white/80">
              Des milliers de propriétaires font confiance à ServicesArtisans pour leurs travaux.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link
                href="/devis"
                className="font-heading text-primary-600 text-sm font-extrabold px-8 py-4 rounded-full transition-all duration-200 bg-white hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Obtenir mon devis gratuit
              </Link>
              <Link
                href="/espace-artisan"
                className="text-white text-sm font-bold px-7 py-4 rounded-full transition-all duration-200 hover:bg-white/10 border-[1.5px] border-white/40"
              >
                Je suis artisan <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ─── Social Proof Toast — Booking.com style ──────────── */}
      <SocialProofToast initialDelay={6000} displayDuration={5000} interval={15000} maxToasts={4} />
    </>
  )
}
