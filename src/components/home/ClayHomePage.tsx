import Link from 'next/link'
import { Droplets, Zap, HardHat, PaintBucket, Hammer, ShieldCheck, Star, MapPin, Shield, Wrench, Thermometer, Lock, Grid3X3, Home, Bath, Flame, Key } from 'lucide-react'
import { ClayHeroSearch } from './ClayHeroSearch'
import { ClayReviewsCarousel } from './ClayReviewsCarousel'
import { formatProviderCount } from '@/lib/data/stats'

interface Props {
  artisanCount: number
}

const SERVICES = [
  { Icon: Droplets,    name: 'Plomberie',   slug: 'plombier',            count: '3 240' },
  { Icon: Zap,         name: 'Électricité', slug: 'electricien',         count: '2 890' },
  { Icon: HardHat,     name: 'Maçonnerie',  slug: 'macon',               count: '1 750' },
  { Icon: PaintBucket, name: 'Peinture',    slug: 'peintre-en-batiment', count: '4 120' },
  { Icon: Hammer,      name: 'Menuiserie',  slug: 'menuisier',           count: '1 980' },
]

const MARQUEE_ITEMS = [
  { Icon: Wrench,      label: 'Plomberie' },
  { Icon: Zap,         label: 'Électricité' },
  { Icon: Hammer,      label: 'Menuiserie' },
  { Icon: PaintBucket, label: 'Peinture' },
  { Icon: Thermometer, label: 'Chauffage' },
  { Icon: Lock,        label: 'Serrurerie' },
  { Icon: Grid3X3,     label: 'Carrelage' },
  { Icon: Home,        label: 'Isolation' },
  { Icon: HardHat,     label: 'Maçonnerie' },
  { Icon: Bath,        label: 'Salle de bain' },
  { Icon: Flame,       label: 'Chauffage' },
  { Icon: Key,         label: 'Vitrage' },
]

const ARTISANS = [
  {
    bgImg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=250&fit=crop&q=80',
    face: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=104&h=104&fit=crop&crop=face&q=80',
    name: 'Marc Dupont',
    job: 'Plombier · Paris 11e · 15 ans exp.',
    rating: '4,9',
    reviews: 127,
    quote: 'Intervention rapide et propre. Marc a résolu notre problème de canalisation en 2h.',
    author: 'Sophie M.',
    price: '85€',
    badge: { label: '✓ Vérifié SIREN', type: 'green' as const },
  },
  {
    bgImg: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&h=250&fit=crop&q=80',
    face: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=104&h=104&fit=crop&crop=face&q=80',
    name: 'Sophie Martin',
    job: 'Électricienne · Lyon 6e · Habilitée B2V',
    rating: '4,8',
    reviews: 89,
    quote: 'Mise aux normes parfaite. Sophie a tout géré avec professionnalisme.',
    author: 'Paul D.',
    price: '75€',
    badge: { label: '✓ Vérifié SIREN', type: 'green' as const },
  },
  {
    bgImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=250&fit=crop&q=80',
    face: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=104&h=104&fit=crop&crop=face&q=80',
    name: 'Ahmed Benzara',
    job: 'Serrurier · Marseille · Disponible maintenant',
    rating: '5,0',
    reviews: 43,
    quote: 'Arrivé en 20 minutes un dimanche soir. Travail parfait, prix correct.',
    author: 'Jean-Pierre D.',
    price: '90€',
    badge: { label: '⚡ Urgences 24/7', type: 'red' as const },
    urgent: true,
  },
]

const BIG_REVIEWS = [
  {
    text: "Marc a réglé ma fuite d'eau en urgence un dimanche soir. Rapide, propre, prix honnête. ServicesArtisans m'a littéralement sauvé la mise.",
    name: 'Marie Fontaine',
    loc: 'Paris · Cliente depuis 2023',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face&q=80',
  },
  {
    text: "Rénovation complète de notre appartement. Sophie et son équipe ont fait un travail remarquable dans les délais prévus et dans le budget annoncé.",
    name: 'Thomas Bernard',
    loc: 'Lyon · Client depuis 2022',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face&q=80',
  },
  {
    text: "Enfin une plateforme sérieuse ! Artisans vraiment vérifiés, pas des fakes. J'ai trouvé mon électricien en 5 minutes, travaux réalisés 3 jours plus tard.",
    name: 'Amélie Leclerc',
    loc: 'Bordeaux · Cliente depuis 2024',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face&q=80',
  },
]

export function ClayHomePage({ artisanCount }: Props) {
  const countStr = artisanCount > 0 ? `${formatProviderCount(artisanCount)}+` : '50 000+'

  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────── */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{
          height: '100vh',
          minHeight: '720px',
          background: 'linear-gradient(160deg,#1a0f06 0%,#2d1a0e 40%,#0a0503 100%)',
        }}
      >
        {/* Background photo */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=900&fit=crop&q=80"
            alt="Artisan au travail"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(105deg,rgba(10,8,5,.82) 0%,rgba(10,8,5,.4) 55%,rgba(10,8,5,.1) 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-10 lg:gap-14 items-center">

          {/* Colonne gauche */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 text-[11px] font-bold tracking-[.06em] uppercase"
              style={{ background: 'rgba(232,107,75,.15)', border: '1px solid rgba(232,107,75,.35)', color: '#FFB49A' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-clay-400 animate-pulse inline-block" />
              {countStr} artisans référencés · SIREN officiel
            </div>

            <h1 className="font-black tracking-[-0.05em] leading-[.92] text-white mb-8" style={{ fontSize: 'clamp(3.2rem,5.5vw,5.2rem)' }}>
              Trouvez<br /><em className="not-italic text-clay-400">l&apos;artisan</em><br />parfait.
            </h1>

            <p className="text-[17px] text-white/60 leading-[1.75] max-w-[480px] mb-10">
              Des professionnels vérifiés, assurés, recommandés. Des devis gratuits en 24h partout en France.
            </p>

            <div className="flex gap-3 flex-wrap mb-10">
              <Link
                href="/services"
                className="bg-clay-400 hover:bg-clay-600 text-white text-sm font-extrabold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                style={{ boxShadow: '0 8px 24px rgba(232,107,75,.35)' }}
              >
                Trouver un artisan →
              </Link>
              <Link
                href="/services"
                className="text-white/80 hover:text-white text-sm font-semibold px-6 py-4 rounded-full transition-all duration-200"
                style={{ border: '1.5px solid rgba(255,255,255,.25)' }}
              >
                Voir les artisans
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex gap-2.5 flex-wrap">
              {[
                { Icon: ShieldCheck, text: 'SIREN vérifié' },
                { Icon: Star,        text: '4,9/5 · 12 400 avis' },
                { Icon: Zap,         text: 'Devis en 24h' },
              ].map(({ Icon: PillIcon, text }) => (
                <div
                  key={text}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-white/70"
                  style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.12)' }}
                >
                  <PillIcon className="w-3 h-3 text-clay-400" /> {text}
                </div>
              ))}
            </div>
          </div>

          {/* Carte flottante */}
          <div
            className="hidden lg:flex flex-col rounded-3xl px-10 py-12"
            style={{ background: 'rgba(244,239,232,.96)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 80px rgba(0,0,0,.25)' }}
          >
            <div className="text-[12px] font-bold tracking-[.1em] uppercase mb-6" style={{ color: '#A8947E' }}>
              Trouver un artisan
            </div>
            <ClayHeroSearch />
            <div className="flex flex-wrap gap-2 mt-6 flex-1">
              {[
                { Icon: Droplets,    label: 'Plomberie' },
                { Icon: Zap,         label: 'Électricité' },
                { Icon: PaintBucket, label: 'Peinture' },
                { Icon: Thermometer, label: 'Chauffage' },
                { Icon: Lock,        label: 'Serrurerie' },
              ].map(({ Icon: ChipIcon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 border text-stone-500 h-fit"
                  style={{ background: '#F4EFE8', borderColor: 'rgba(0,0,0,.07)' }}
                >
                  <ChipIcon className="w-3 h-3 text-clay-400" />
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2.5 mt-8 pt-8" style={{ borderTop: '1px solid rgba(0,0,0,.06)' }}>
              <div className="flex">
                {[
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=56&h=56&fit=crop&crop=face&q=80',
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=56&h=56&fit=crop&crop=face&q=80',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=56&h=56&fit=crop&crop=face&q=80',
                ].map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover -mr-2" />
                ))}
              </div>
              <p className="text-[11px] font-medium leading-snug" style={{ color: '#A8947E' }}>
                <strong className="text-stone-900">+180 clients</strong> ont trouvé<br />leur artisan cette semaine
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ────────────────────────────────────────── */}
      <div className="bg-white" style={{ borderBottom: '1px solid rgba(0,0,0,.06)' }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-7 flex flex-wrap justify-around items-center gap-6">
          {[
            { Icon: ShieldCheck, label: 'SIREN vérifié',         sub: 'Chaque artisan contrôlé' },
            { Icon: Star,        label: '4,9/5 moyenne',         sub: '+12 400 avis vérifiés' },
            { Icon: Zap,         label: 'Devis en 24h',          sub: 'Gratuit et sans engagement' },
            { Icon: Shield,      label: 'Garantie satisfaction', sub: 'Remboursé si insatisfait' },
            { Icon: MapPin,      label: '96 départements',       sub: 'Toute la France couverte' },
          ].map(({ Icon: TrustIcon, label, sub }, i, arr) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#FDF1EC' }}
              >
                <TrustIcon className="w-5 h-5 text-clay-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-stone-900">{label}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">{sub}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="hidden xl:block w-px h-9 ml-6" style={{ background: 'rgba(0,0,0,.07)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── MARQUEE ──────────────────────────────────────────── */}
      <div className="overflow-hidden py-3.5" style={{ background: '#E5DDD4', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
        <div className="animate-marquee flex whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(({ Icon: MarqueeIcon, label }, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[12px] font-bold px-6" style={{ color: '#A8947E' }}>
              <MarqueeIcon className="w-3 h-3" />
              {label}
              <span className="mx-1.5" style={{ color: '#C4B4A4' }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── SERVICES GRID ────────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-6 md:px-10 py-20">
        <div className="text-[11px] font-bold text-clay-400 tracking-[.12em] uppercase mb-2.5">
          Ce que nous proposons
        </div>
        <div className="flex justify-between items-end mb-9">
          <h2 className="font-black tracking-[-0.04em] leading-tight text-stone-900" style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)' }}>
            Tous les corps de métier
          </h2>
          <Link href="/services" className="text-sm font-bold text-clay-400 hover:text-clay-600 transition-colors">
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SERVICES.map(({ Icon: SvcIcon, name, slug, count }) => (
            <Link
              key={slug}
              href={`/services/${slug}`}
              className="group bg-white rounded-2xl p-6 text-center transition-all duration-300 border-[1.5px] border-transparent hover:border-clay-400 hover:-translate-y-1"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}
            >
              <SvcIcon className="w-8 h-8 text-clay-400 mx-auto mb-3" />
              <div className="text-[13px] font-extrabold text-stone-900 mb-1">{name}</div>
              <div className="text-[11px] text-stone-400">{count} artisans</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── ARTISAN CARDS ────────────────────────────────────── */}
      <section style={{ background: '#EDE8E1' }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="text-[11px] font-bold text-clay-400 tracking-[.12em] uppercase mb-2.5">Près de vous</div>
              <h2 className="font-black tracking-[-0.04em] leading-tight text-stone-900" style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)' }}>
                Les artisans les mieux notés.
              </h2>
            </div>
            <Link href="/services" className="text-sm font-bold text-clay-400 hover:text-clay-600 transition-colors">
              Voir tous →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ARTISANS.map(a => (
              <div
                key={a.name}
                className="rounded-3xl overflow-hidden cursor-pointer transition-all duration-[350ms]"
                style={{
                  background: '#FFFCF8',
                  boxShadow: '0 3px 16px rgba(0,0,0,.06)',
                  border: a.urgent ? '1.5px solid #FEE2E2' : 'none',
                }}
              >
                {/* Top photo */}
                <div className="relative overflow-hidden" style={{ height: '200px', background: 'linear-gradient(160deg,#3D2414 0%,#5C3820 100%)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.bgImg} alt="" className="w-full h-full object-cover block" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0) 40%,rgba(0,0,0,.55))' }} />
                  <div
                    className={`absolute top-3 right-3 text-[10px] font-bold px-3 py-1 rounded-full ${
                      a.badge.type === 'green'
                        ? 'text-green-700 bg-white/90'
                        : 'text-red-600'
                    }`}
                    style={a.badge.type === 'red' ? { background: '#FEF2F2' } : { backdropFilter: 'blur(8px)' }}
                  >
                    {a.badge.label}
                  </div>
                </div>
                {/* Body */}
                <div className="px-5 pb-6 -mt-6 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.face}
                    alt={a.name}
                    className="w-[52px] h-[52px] rounded-2xl object-cover mb-3"
                    style={{ border: '3px solid #FFFCF8', boxShadow: '0 4px 14px rgba(0,0,0,.12)' }}
                  />
                  <div className="text-[16px] font-black text-stone-900 mb-0.5">{a.name}</div>
                  <div className="text-[12px] text-stone-400 mb-2.5">{a.job}</div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-amber-400 text-[13px]">★★★★★</span>
                    <span className="text-[12px] font-bold text-stone-900">{a.rating}</span>
                    <span className="text-[11px] text-stone-400">({a.reviews} avis)</span>
                  </div>
                  <div
                    className="text-[12px] text-stone-500 leading-relaxed italic px-3.5 py-2.5 rounded-xl mb-4"
                    style={{ background: '#F4EFE8', borderLeft: '2px solid #E86B4B' }}
                  >
                    &ldquo;{a.quote}&rdquo; — {a.author}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[20px] font-black text-stone-900">{a.price}</span>
                      <span className="text-[12px] text-stone-400">/h</span>
                    </div>
                    <Link
                      href="/services"
                      className="text-white text-[12px] font-bold px-5 py-2.5 rounded-full transition-colors"
                      style={{ background: a.urgent ? '#E86B4B' : '#1C1917' }}
                    >
                      {a.urgent ? 'Contacter →' : 'Voir le profil'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED ARTISAN ─────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-[72px] items-center">
          {/* Photo */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ height: '520px', background: 'linear-gradient(160deg,#1a3a2a 0%,#2d5940 100%)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&h=600&fit=crop&q=80"
              alt="Lucie Bernard"
              className="w-full h-full object-cover block"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(10,8,5,.65) 0%,transparent 50%)' }} />
            <div
              className="absolute top-5 left-5 text-white text-[11px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5"
              style={{ background: '#E86B4B' }}
            >
              <span className="w-1.5 h-1.5 bg-white/70 rounded-full inline-block" />
              ★ Artisan du mois
            </div>
            <div
              className="absolute bottom-5 left-5 right-5 rounded-2xl px-4 py-4 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(16px)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=88&h=88&fit=crop&crop=face&q=80"
                alt="Lucie Bernard"
                className="w-11 h-11 rounded-xl object-cover"
              />
              <div>
                <div className="text-sm font-extrabold text-stone-900">Lucie Bernard</div>
                <div className="text-[11px] text-stone-400">Peintre décoratrice · Bordeaux</div>
              </div>
              <div className="ml-auto text-amber-400 text-sm font-extrabold">★ 4,7</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <div className="text-[11px] font-bold text-clay-400 tracking-[.12em] uppercase mb-3">À la une</div>
            <h2 className="font-black tracking-[-0.05em] leading-tight text-stone-900 mb-5" style={{ fontSize: 'clamp(2.2rem,3.5vw,3rem)' }}>
              Des artisans qui font<br /><span className="text-clay-400">la différence.</span>
            </h2>
            <p className="text-[16px] text-stone-500 leading-[1.8] mb-8">
              Lucie transforme des intérieurs ordinaires en espaces extraordinaires. Spécialisée dans la peinture décorative et les effets matières, elle a réalisé plus de 200 chantiers en Nouvelle-Aquitaine avec une note parfaite.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-9">
              {[
                { num: '61', label: 'Avis clients' },
                { num: '8 ans', label: 'Expérience' },
                { num: '200+', label: 'Chantiers' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl py-4 text-center" style={{ background: '#F4EFE8' }}>
                  <div className="text-[1.8rem] font-black tracking-[-0.04em] text-clay-400">{stat.num}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            <Link
              href="/services"
              className="inline-block bg-clay-400 hover:bg-clay-600 text-white text-sm font-extrabold px-8 py-4 rounded-full transition-all duration-300"
              style={{ boxShadow: '0 8px 24px rgba(232,107,75,.35)' }}
            >
              Voir son profil complet →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROCESS ──────────────────────────────────────────── */}
      <section style={{ background: '#EDE8E1' }}>
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-20">
          <div className="text-center mb-1">
            <div className="inline-block text-[11px] font-bold text-clay-400 tracking-[.12em] uppercase">
              Comment ça marche
            </div>
          </div>
          <h2 className="font-black tracking-[-0.04em] leading-tight text-stone-900 text-center mb-12" style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)' }}>
            Simple, rapide, fiable.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Dashed connector line (desktop only) */}
            <div
              className="hidden lg:block absolute top-[25px] h-0.5 opacity-30"
              style={{
                left: '12.5%', right: '12.5%',
                background: 'repeating-linear-gradient(90deg,#E86B4B 0,#E86B4B 8px,transparent 8px,transparent 18px)',
              }}
            />
            {[
              { n: '1', title: 'Décrivez vos travaux', desc: "Type, localisation, urgence — 2 minutes suffisent pour décrire votre besoin." },
              { n: '2', title: 'Recevez des devis', desc: "Jusqu'à 3 artisans vérifiés vous contactent sous 24h. Gratuit et sans engagement." },
              { n: '3', title: 'Choisissez librement', desc: "Comparez les profils, avis et tarifs. Choisissez l'artisan qui vous convient." },
              { n: '4', title: 'Profitez des résultats', desc: "Travaux réalisés avec notre garantie satisfaction. Payez seulement quand c'est fait." },
            ].map(step => (
              <div key={step.n} className="text-center relative z-10">
                <div
                  className="w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center mx-auto mb-4 text-lg font-black text-clay-400"
                  style={{ border: '2px solid rgba(232,107,75,.2)', boxShadow: '0 4px 14px rgba(0,0,0,.07)' }}
                >
                  {step.n}
                </div>
                <div className="text-[15px] font-extrabold text-stone-900 mb-2">{step.title}</div>
                <p className="text-[13px] text-stone-500 leading-[1.65]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ──────────────────────────────────────────── */}
      <section style={{ background: '#1C1917', padding: '80px 0' }}>
        {/* Header */}
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <h2 className="font-black tracking-[-0.04em] leading-tight text-white" style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)' }}>
            Ils nous font <span className="text-clay-400">confiance.</span>
          </h2>
          <div className="text-right">
            <div className="text-[2.4rem] font-black text-clay-400">★★★★★</div>
            <div className="text-[13px]" style={{ color: 'rgba(255,255,255,.35)' }}>4,9/5 · 12 400 avis vérifiés</div>
          </div>
        </div>

        {/* 3 big review cards */}
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 pb-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {BIG_REVIEWS.map(rv => (
            <div
              key={rv.name}
              className="rounded-2xl p-7 transition-all duration-300"
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}
            >
              <div className="text-[48px] font-black leading-none mb-4 opacity-60 text-clay-400">&ldquo;</div>
              <p className="text-[15px] leading-[1.75] mb-5 italic" style={{ color: 'rgba(255,255,255,.7)' }}>{rv.text}</p>
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rv.avatar} alt={rv.name} className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid rgba(255,255,255,.1)' }} />
                <div>
                  <div className="text-sm font-bold text-white">{rv.name}</div>
                  <div className="text-[11px]" style={{ color: 'rgba(255,255,255,.35)' }}>{rv.loc}</div>
                </div>
                <div className="ml-auto text-amber-400 text-xs">★★★★★</div>
              </div>
            </div>
          ))}
        </div>

        {/* Scrolling carousel */}
        <div className="overflow-hidden mt-2 px-10">
          <ClayReviewsCarousel />
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex items-center" style={{ minHeight: '400px' }}>
        {/* Background photo */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&h=500&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover block"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,rgba(232,107,75,.92) 0%,rgba(194,75,42,.88) 100%)' }}
        />

        <div className="relative z-10 max-w-[1320px] mx-auto px-6 md:px-10 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center w-full">
          <div>
            <h2 className="font-black tracking-[-0.05em] text-white leading-[.95] mb-4" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>
              Votre projet mérite<br />le meilleur.
            </h2>
            <p className="text-[16px] leading-[1.7] mb-8" style={{ color: 'rgba(255,255,255,.75)' }}>
              Rejoignez 180 000 propriétaires qui font confiance à ServicesArtisans pour leurs travaux — et ne l&apos;ont jamais regretté.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/services"
                className="text-clay-600 text-sm font-extrabold px-8 py-3.5 rounded-full transition-all duration-200 bg-white hover:-translate-y-0.5"
                style={{ boxShadow: '0 0 0 0 transparent' }}
              >
                Trouver un artisan
              </Link>
              <Link
                href="/espace-artisan"
                className="text-white text-sm font-bold px-7 py-3.5 rounded-full transition-all duration-200 hover:bg-white/10"
                style={{ border: '1.5px solid rgba(255,255,255,.4)' }}
              >
                Je suis artisan →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '50 000+', label: 'Artisans vérifiés' },
              { num: '180 000+', label: 'Clients satisfaits' },
              { num: '4,9 / 5', label: 'Note moyenne' },
              { num: '96', label: 'Départements' },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)' }}
              >
                <div className="text-[1.8rem] font-black text-white tracking-[-0.04em]">{stat.num}</div>
                <div className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,.65)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
