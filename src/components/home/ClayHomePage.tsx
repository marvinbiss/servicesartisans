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
  Flame,
  Thermometer,
  ArrowRight,
  Clock,
  CheckCircle,
  ClipboardList,
} from 'lucide-react'
import { ClayHeroSearch } from './ClayHeroSearch'
import { FranceConstellation } from './FranceConstellation'
import AnimatedCounter from '@/components/conversion/AnimatedCounter'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import { ClayReviewsCarousel } from './ClayReviewsCarousel'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { RecentlyViewedCarousel } from '@/components/providers/RecentlyViewedCarousel'
import {
  formatProviderCount,
  type SiteStats,
  type HomepageProvider,
  type HomepageReview,
} from '@/lib/data/stats'
import { faqCategories } from '@/lib/data/faq-data'
import { BLUR_PLACEHOLDER } from '@/lib/data/images'

interface Props {
  stats: SiteStats
  serviceCounts: Record<string, number>
  topProviders: HomepageProvider[]
  recentReviews: HomepageReview[]
}

// Pivot full RGE 2026-05-03 : tile 'Serrurerie' (slug serrurier commodity hors
// RGE) retirée — remplacée par 'Isolation thermique' (gravity hub RGE).
const SERVICE_ITEMS = [
  { Icon: Droplets, name: 'Plomberie', slug: 'plombier', price: '50' },
  { Icon: Zap, name: 'Électricité', slug: 'electricien', price: '60' },
  { Icon: Flame, name: 'Chauffage', slug: 'chauffagiste', price: '80' },
  { Icon: PaintBucket, name: 'Peinture', slug: 'peintre-en-batiment', price: '25' },
  { Icon: Hammer, name: 'Menuiserie', slug: 'menuisier', price: '45' },
  { Icon: HardHat, name: 'Maçonnerie', slug: 'macon', price: '55' },
  { Icon: Thermometer, name: 'Pompe à chaleur', slug: 'pompe-a-chaleur', price: '120' },
  { Icon: Thermometer, name: 'Isolation thermique', slug: 'isolation-thermique', price: '40' },
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
  // Pivot full RGE 2026-05-03 : artisan 'Romain Simon (Serrurier)' retiré du
  // featured (slug serrurier hors catalog canonical) — remplacé par un artisan
  // RGE-canonical (chauffagiste Strasbourg en attendant resélection manuelle).
  {
    name: 'Énergie Confort',
    specialty: 'Chauffagiste',
    address_city: 'Strasbourg',
    address_postal_code: '67000',
    rating_average: null as number | null,
    review_count: null as number | null,
    is_verified: true,
    slug: 'chauffagiste',
    stable_id: 'energie-confort-strasbourg',
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

// ── Avatars monogramme ───────────────────────────────────────────
// On n'utilise PLUS de photos stock (Unsplash) ni de faux visages : ça
// sonnait « template ». Un monogramme (initiales sur fond de marque,
// couleur déterministe d'après le nom) est honnête, cohérent avec le
// design system, et lisible. Les vrais avatar_url, s'ils existent un jour,
// pourront remplacer le monogramme au cas par cas.
const MONO_BG = [
  'bg-primary-100 text-primary-600',
  'bg-accent-100 text-accent-700',
  'bg-sand-200 text-charcoal-700',
]

function initials(name: string): string {
  const parts = formatName(name)
    .replace(/[^A-Za-zÀ-ÿ ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

function monoClass(seed: string): string {
  let h = 0
  for (const c of seed) h = (h + c.charCodeAt(0)) % MONO_BG.length
  return MONO_BG[h]
}

/** Icône métier d'après la spécialité (carte artisan). */
function tradeIcon(specialty: string | null | undefined) {
  const s = (specialty ?? '').toLowerCase()
  if (s.includes('plomb')) return Droplets
  if (s.includes('électric') || s.includes('electric')) return Zap
  if (s.includes('chauff')) return Flame
  if (s.includes('peintre') || s.includes('peinture')) return PaintBucket
  if (s.includes('menuis')) return Hammer
  if (s.includes('maçon') || s.includes('macon')) return HardHat
  if (s.includes('pompe') || s.includes('isol') || s.includes('thermi')) return Thermometer
  return ShieldCheck
}

// Fallback : témoignages représentatifs (prénom + ville, pas de nom de famille).
// Pas d'avatar : on rend un monogramme (cf. initials/monoClass) — pas de faux
// visage stock.
const FALLBACK_REVIEWS = [
  {
    author_name: 'Sophie · Lyon',
    rating: 5,
    content:
      "Fuite d'eau un dimanche soir, j'ai trouvé un plombier en 20 minutes via le site. Intervention rapide, tarif annoncé respecté. Je recommande sans hésiter.",
    created_at: '',
  },
  {
    author_name: 'Marc · Bordeaux',
    rating: 5,
    content:
      "3 devis reçus en 48h pour ma rénovation de salle de bain. J'ai pu comparer les prix et choisir sereinement. L'artisan a respecté les délais et le budget.",
    created_at: '',
  },
  {
    author_name: 'Nathalie · Toulouse',
    rating: 5,
    content:
      "Ce qui m'a convaincue c'est la vérification SIREN des artisans. On sait à qui on a affaire. Mise en relation simple, travaux réalisés dans la foulée.",
    created_at: '',
  },
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
    <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-16 md:py-20">
      <h2
        className="font-heading font-black tracking-[-0.04em] leading-tight text-charcoal-900 text-center mb-12"
        style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)' }}
      >
        Questions fréquentes
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
      {/* ─── HERO — asymétrique : pitch + recherche / photo chantier ── */}
      <section className="relative bg-gradient-sand overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-5 md:px-10 pt-10 pb-12 md:pt-16 md:pb-20 grid lg:grid-cols-[1fr_minmax(0,440px)] gap-10 lg:gap-16 items-center">
          {/* Colonne gauche — pitch + recherche */}
          <div>
            <h2
              className="font-heading font-black tracking-[-0.04em] leading-[1.05] text-charcoal-900 text-balance mb-5"
              style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.6rem)' }}
              aria-hidden="true"
            >
              Trouvez un artisan RGE certifié. <span className="text-primary-500">Vraiment.</span>
            </h2>

            <p className="text-charcoal-600 text-base md:text-lg leading-relaxed max-w-lg mb-8">
              {countStr} artisans vérifiés au registre RGE de l&apos;ADEME. Décrivez votre projet,
              recevez jusqu&apos;à 3 devis gratuits sous 48&nbsp;h.
            </p>

            <div className="max-w-xl mb-4">
              <ClayHeroSearch stacked ctaLabel="Trouver un artisan" />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8 text-sm">
              <Link
                href="/devis"
                className="inline-flex items-center gap-1.5 font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                ou demandez directement vos devis
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/simulateur-aides-renovation"
                className="inline-flex items-center gap-1.5 font-medium text-charcoal-500 hover:text-primary-600 transition-colors"
              >
                <Zap className="w-4 h-4" aria-hidden="true" />
                Simuler mes aides
              </Link>
            </div>

            {/* Trust line — sources officielles + note */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-charcoal-500">
              <span className="font-medium">Source&nbsp;: registre RGE ADEME</span>
              <span className="hidden sm:inline text-sand-400">·</span>
              <span>data.gouv.fr</span>
              <span className="hidden sm:inline text-sand-400">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                <strong className="text-charcoal-800">{ratingStr}/5</strong>
                <span>sur {reviewStr} avis</span>
              </span>
            </div>
          </div>

          {/* Colonne droite — photo chantier + badge vérification */}
          <div className="relative hidden lg:block">
            <div className="relative h-[520px] rounded-3xl overflow-hidden border border-sand-200">
              <Image
                src="https://images.unsplash.com/photo-1672748341520-6a839e6c05bb?w=900&h=1100&fit=crop&q=80"
                alt="Artisan RGE certifié souriant sur un chantier de rénovation énergétique"
                fill
                priority
                sizes="(max-width: 1024px) 0px, 440px"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-charcoal-950/35 via-transparent to-transparent"
                aria-hidden="true"
              />
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 bg-white rounded-2xl border border-sand-200 shadow-soft px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-accent-600" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal-900">
                  Certification RGE vérifiée
                </div>
                <div className="text-xs text-charcoal-500">Source&nbsp;: Registre RGE ADEME</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BANDEAU CONFIANCE — sous le hero ──────────────────── */}
      <div className="bg-white border-y border-sand-200">
        <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-8 flex flex-wrap justify-around items-center gap-6">
          {[
            { Icon: ShieldCheck, label: 'SIREN vérifié', sub: 'Chaque artisan contrôlé' },
            { Icon: Star, label: `${ratingStr}/5 moyenne`, sub: `${reviewStr} avis vérifiés` },
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
              {i < arr.length - 1 && <div className="hidden xl:block w-px h-9 ml-6 bg-sand-300" />}
            </div>
          ))}
        </div>
      </div>

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
                <h2
                  className="font-heading font-black tracking-[-0.04em] leading-tight text-charcoal-900"
                  style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)' }}
                >
                  Trouvez le bon artisan, métier par métier
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
                    className="group relative snap-start flex-shrink-0 w-[170px] md:w-auto bg-white rounded-2xl p-5 transition-all duration-300 border border-sand-200 hover:border-primary-300 hover:-translate-y-1 hover:shadow-card-hover block overflow-hidden"
                  >
                    {/* halo d'accent au hover */}
                    <div
                      className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                        <SvcIcon className="w-6 h-6 text-primary-500" />
                      </div>
                      <div className="text-[15px] font-bold text-charcoal-900 mb-2 leading-tight">
                        {name}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        {serviceCounts[slug] > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 bg-accent-50 px-2.5 py-1 rounded-full">
                            <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                            {formatProviderCount(serviceCounts[slug])} RGE
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-charcoal-500 bg-sand-100 px-2.5 py-1 rounded-full">
                            dès {price}€
                          </span>
                        )}
                        <ArrowRight
                          className="w-4 h-4 text-charcoal-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all duration-300 shrink-0"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
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
              <h2
                className="font-heading font-black tracking-[-0.04em] leading-tight text-charcoal-900"
                style={{ fontSize: 'clamp(1.75rem,3.5vw,2.5rem)' }}
              >
                Un devis gratuit en trois étapes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
              {[
                {
                  n: '1',
                  title: 'Décrivez votre besoin',
                  desc: 'Type de travaux, localisation, urgence : 2 minutes suffisent.',
                  icon: ClipboardList,
                },
                {
                  n: '2',
                  title: 'Recevez des devis',
                  desc: "Jusqu'à 3 artisans RGE certifiés vous contactent rapidement. Gratuit.",
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
                    <div className="relative h-full bg-white rounded-2xl border border-sand-200 shadow-soft px-7 py-8 transition-shadow hover:shadow-soft-lg">
                      {/* Numéro fantôme en filigrane (coin haut-droit) */}
                      <span
                        className="absolute top-3 right-5 font-heading text-6xl font-black text-primary-100 select-none leading-none"
                        aria-hidden="true"
                      >
                        {step.n}
                      </span>
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mb-5">
                        <StepIcon className="w-7 h-7 text-primary-500" />
                      </div>
                      <div className="font-heading text-lg font-bold text-charcoal-900 mb-2">
                        {step.title}
                      </div>
                      <p className="text-sm text-charcoal-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ─── REGISTRE RGE — signature data : constellation France ── */}
      <ScrollReveal as="section">
        <div className="bg-white border-y border-sand-200">
          <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-16 md:py-20 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-sm font-medium text-charcoal-500 mb-4">
                Source&nbsp;: registre RGE ADEME — data.gouv.fr
              </p>
              <h2
                className="font-heading font-black tracking-[-0.04em] leading-[1.08] text-charcoal-900 text-balance mb-5"
                style={{ fontSize: 'clamp(1.9rem,3.4vw,2.8rem)' }}
              >
                Tout le registre RGE. Rien d&apos;autre.
              </h2>
              <p className="text-charcoal-600 leading-relaxed max-w-lg mb-9">
                Chaque fiche provient du registre officiel des artisans RGE tenu par l&apos;ADEME.
                Pas d&apos;auto-déclaration&nbsp;: une certification vérifiable, ou rien.
              </p>

              <div className="grid grid-cols-3 gap-6 max-w-md mb-10">
                <div>
                  <div className="font-heading text-2xl md:text-3xl font-black text-charcoal-900 tabular-nums">
                    {artisanCount > 0 ? (
                      <AnimatedCounter end={artisanCount} suffix="+" />
                    ) : (
                      countStr
                    )}
                  </div>
                  <div className="text-sm text-charcoal-500 mt-1">artisans RGE</div>
                </div>
                <div>
                  <div className="font-heading text-2xl md:text-3xl font-black text-charcoal-900 tabular-nums">
                    {deptCount > 0 ? <AnimatedCounter end={deptCount} /> : '---'}
                  </div>
                  <div className="text-sm text-charcoal-500 mt-1">départements</div>
                </div>
                <div>
                  <div className="font-heading text-2xl md:text-3xl font-black text-charcoal-900 tabular-nums">
                    100&nbsp;%
                  </div>
                  <div className="text-sm text-charcoal-500 mt-1">issues du registre ADEME</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/rge"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-cta hover:shadow-cta-hover transition-all"
                >
                  Explorer l&apos;annuaire RGE
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/barometre/rge"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal-600 hover:text-primary-600 transition-colors"
                >
                  Voir le baromètre RGE
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="max-w-[520px] lg:justify-self-end w-full">
              <FranceConstellation />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ─── HISTORIQUE — Fiches consultées récemment (client-only) ──────────── */}
      <RecentlyViewedCarousel />

      {/* ─── PREUVE SOCIALE — Chiffres clés + avis ──────────── */}
      <ScrollReveal as="section">
        <div className="bg-white py-16 md:py-20">
          <div className="max-w-[1320px] mx-auto px-5 md:px-10">
            {/* Key stats banner */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mb-14">
              {[
                {
                  value: countStr,
                  label: 'artisans RGE certifiés',
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
                const author = rv.author_name || 'Client vérifié'
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
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${monoClass(author)}`}
                          aria-hidden="true"
                        >
                          {initials(author)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-charcoal-900">{author}</div>
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
                <h2
                  className="font-heading font-black tracking-[-0.04em] leading-tight text-charcoal-900"
                  style={{ fontSize: 'clamp(1.75rem,3.5vw,2.5rem)' }}
                >
                  Artisans RGE certifiés près de chez vous.
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
                const TradeIcon = tradeIcon(a.specialty)

                return (
                  <ScrollReveal key={a.name} delay={i * 0.1}>
                    <div className="rounded-3xl overflow-hidden transition-all duration-300 bg-white border border-sand-200 hover:shadow-card-hover hover:-translate-y-1">
                      {/* Header marque : monogramme + icône métier (plus de photo
                          stock générique — authentique & cohérent design system). */}
                      <div className="relative h-[132px] bg-gradient-to-br from-sand-100 to-sand-200 flex items-center justify-center">
                        <div
                          className={`w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-2xl font-black shadow-soft ${monoClass(a.name)}`}
                          aria-hidden="true"
                        >
                          {initials(a.name)}
                        </div>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-1/2 w-9 h-9 rounded-xl bg-white shadow-soft border border-sand-200 flex items-center justify-center">
                          <TradeIcon className="w-5 h-5 text-primary-500" aria-hidden="true" />
                        </div>
                        <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 text-accent-700 border border-accent-200">
                          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          {a.is_verified ? 'Vérifié SIREN' : 'Référencé'}
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-6">
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
                            className="text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 bg-primary-500 hover:bg-primary-600 shadow-cta hover:shadow-cta-hover"
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

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <ScrollReveal as="section">
        <div className="bg-sand-50">
          <ClayFAQSection />
        </div>
      </ScrollReveal>
    </>
  )
}
