'use client'

import Link from 'next/link'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import { useRef, useEffect } from 'react'
import {
  Users, Star, MapPin,
  Wrench, Zap, Key, Flame, PaintBucket, Hammer, HardHat, Home, TreeDeciduous, Sparkles,
  Search, ClipboardList, CheckCircle, ArrowRight, Quote,
  Eye, TrendingUp, CreditCard,
  Database, Shield, FileCheck, Banknote, Globe, BadgeCheck
} from 'lucide-react'

// ─── ANIMATION VARIANTS ────────────────────────────────────────

const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: premiumEase } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: premiumEase } },
}

// ─── ANIMATED COUNTER (Framer Motion spring-based) ──────────────

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => {
    if (target >= 1000) return Math.round(v).toLocaleString('fr-FR')
    return Number(v.toFixed(target % 1 !== 0 ? 1 : 0)).toLocaleString('fr-FR')
  })

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration, ease: premiumEase })
    }
  }, [isInView, count, target, duration])

  return <motion.span ref={ref}>{rounded}</motion.span>
}

// ─── STATS SECTION ───────────────────────────────────────────────

const stats = [
  { value: 350000, suffix: '+', label: 'Artisans référencés', icon: Users, color: 'from-blue-500 to-blue-600', accent: 'blue' },
  { value: 101, suffix: '', label: 'Départements couverts', icon: MapPin, color: 'from-emerald-500 to-emerald-600', accent: 'emerald' },
  { value: 50, suffix: '+', label: 'Corps de métier', icon: Wrench, color: 'from-amber-500 to-amber-600', accent: 'amber' },
  { value: 100, suffix: '%', label: 'Gratuit, sans engagement', icon: Star, color: 'from-purple-500 to-purple-600', accent: 'purple' },
]

export function StatsSection() {
  return (
    <section className="relative py-1 bg-white">
      {/* Floating stat bar overlapping hero */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionReveal}
          className="bg-white rounded-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] border border-gray-100/80 p-2"
        >
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                className={`relative flex flex-col items-center py-6 px-4 ${
                  i < stats.length - 1 ? 'lg:border-r lg:border-gray-100' : ''
                }`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl mb-3 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                  <AnimatedCounter target={stat.value} duration={stat.value >= 1000 ? 2.5 : 2} />
                  {stat.suffix}
                </div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── SERVICES SHOWCASE → BENTO GRID ─────────────────────────────

const services = [
  { name: 'Plombier', slug: 'plombier', icon: Wrench, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', count: '35 200+', desc: 'Fuite, robinetterie, chauffe-eau, canalisation' },
  { name: 'Électricien', slug: 'electricien', icon: Zap, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600', count: '32 400+', desc: 'Installation, dépannage, mise aux normes' },
  { name: 'Serrurier', slug: 'serrurier', icon: Key, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-100', text: 'text-slate-600', count: '8 500+', desc: 'Ouverture, blindage, serrures' },
  { name: 'Chauffagiste', slug: 'chauffagiste', icon: Flame, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600', count: '28 100+', desc: 'Chaudière, pompe à chaleur, radiateur' },
  { name: 'Peintre', slug: 'peintre-en-batiment', icon: PaintBucket, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600', count: '26 800+', desc: 'Intérieur, extérieur, ravalement' },
  { name: 'Menuisier', slug: 'menuisier', icon: Hammer, color: 'from-amber-600 to-amber-700', bg: 'bg-amber-50', text: 'text-amber-700', count: '24 300+', desc: 'Fenêtres, portes, agencement' },
  { name: 'Carreleur', slug: 'carreleur', icon: Sparkles, color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50', text: 'text-teal-600', count: '18 600+', desc: 'Sol, mur, salle de bain' },
  { name: 'Couvreur', slug: 'couvreur', icon: Home, color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-600', count: '15 400+', desc: 'Toiture, zinguerie, charpente' },
  { name: 'Maçon', slug: 'macon', icon: HardHat, color: 'from-stone-500 to-stone-600', bg: 'bg-stone-100', text: 'text-stone-600', count: '30 200+', desc: 'Gros œuvre, extension, rénovation' },
  { name: 'Jardinier', slug: 'jardinier', icon: TreeDeciduous, color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-600', count: '22 100+', desc: 'Entretien, élagage, aménagement' },
]

export function ServicesShowcase() {
  // Bento layout: first 2 large, next 4 medium, remaining 4 in 3-col grid (last row)
  const featured = services.slice(0, 2)
  const medium = services.slice(2, 6)
  const compact = services.slice(6)

  return (
    <section className="py-20 md:py-28 bg-[#FEFDFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={sectionReveal}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-5">
            <Wrench className="w-3.5 h-3.5" />
            50+ métiers disponibles
          </div>
          <h2 className="font-heading text-3xl md:text-[2.5rem] font-bold text-slate-900 mb-4 tracking-tight">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-3 mb-1" />
            Tous les corps de métier
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Trouvez le bon professionnel pour chaque besoin, de l&apos;urgence à la rénovation complète.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-4"
        >
          {/* Row 1: 2 featured large cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {featured.map((service) => {
              const Icon = service.icon
              return (
                <motion.div key={service.slug} variants={staggerItem}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group relative flex items-center gap-6 p-8 bg-white rounded-2xl border border-gray-100/80 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  >
                    <div className={`w-16 h-16 ${service.bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
                      <Icon className={`w-8 h-8 ${service.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-heading font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                          {service.name}
                        </span>
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          {service.count}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{service.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Row 2: 4 medium cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {medium.map((service) => {
              const Icon = service.icon
              return (
                <motion.div key={service.slug} variants={staggerItem}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group relative flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100/80 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  >
                    <div className={`w-14 h-14 ${service.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
                      <Icon className={`w-7 h-7 ${service.text}`} />
                    </div>
                    <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 text-center mb-1">
                      {service.name}
                    </span>
                    <span className="text-xs text-slate-400 mb-3">{service.count} artisans</span>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-blue-400 transition-colors duration-300" />
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Row 3: remaining compact cards in a row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {compact.map((service) => {
              const Icon = service.icon
              return (
                <motion.div key={service.slug} variants={staggerItem}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100/80 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  >
                    <div className={`w-11 h-11 ${service.bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${service.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors duration-300 block">
                        {service.name}
                      </span>
                      <span className="text-xs text-slate-400">{service.count}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300 shrink-0" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionReveal}
          className="text-center mt-12"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group transition-colors"
          >
            Voir tous les services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS → VISUAL STEPS ────────────────────────────────

const steps = [
  {
    step: '1',
    title: 'Recherchez',
    description: 'Indiquez le service dont vous avez besoin et votre localisation. Notre moteur trouve les artisans disponibles près de chez vous.',
    icon: Search,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  {
    step: '2',
    title: 'Comparez',
    description: 'Consultez les profils détaillés, les avis vérifiés et les tarifs. Choisissez l\'artisan qui correspond à vos attentes.',
    icon: ClipboardList,
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
    gradient: 'from-amber-500/20 to-amber-600/20',
  },
  {
    step: '3',
    title: 'Contactez',
    description: 'Demandez un devis gratuit et sans engagement. L\'artisan vous répond sous 24h avec une proposition détaillée.',
    icon: CheckCircle,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    gradient: 'from-emerald-500/20 to-emerald-600/20',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={sectionReveal}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium mb-5">
            <CheckCircle className="w-3.5 h-3.5" />
            Simple et rapide
          </div>
          <h2 className="font-heading text-3xl md:text-[2.5rem] font-bold text-slate-900 mb-4 tracking-tight">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-3 mb-1" />
            Comment ça marche ?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            En 3 étapes simples, trouvez l&apos;artisan idéal pour votre projet.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-[5.5rem] left-[20%] right-[20%] z-0">
            <div className="h-0.5 bg-gradient-to-r from-blue-200 via-amber-200 to-emerald-200 rounded-full" />
          </div>

          {steps.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.step}
                variants={staggerItem}
                className="relative text-center group"
              >
                {/* Large step number background */}
                <div className="relative z-10 mx-auto mb-8">
                  <div className="relative">
                    {/* Background number */}
                    <span className={`absolute -top-4 -left-2 font-heading text-[5rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-br ${item.gradient} select-none leading-none opacity-60`}>
                      {item.step}
                    </span>
                    {/* Icon */}
                    <div className={`relative w-20 h-20 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center shadow-lg mx-auto group-hover:-translate-y-1 group-hover:shadow-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
                      <Icon className="w-9 h-9 text-white" />
                    </div>
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-slate-700">0{item.step}</span>
                  </div>
                </div>

                <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionReveal}
          className="text-center mt-14"
        >
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            Demander un devis gratuit <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ─── TESTIMONIALS → MODERN CARD CAROUSEL ─────────────────────────

const testimonials = [
  {
    name: 'Marie L.',
    city: 'Paris 15e',
    rating: 5,
    text: 'J\'ai trouvé un plombier en moins de 2h pour une fuite urgente. Le fait que les artisans soient référencés avec leurs données SIREN m\'a rassurée. Professionnel et tarif correct.',
    service: 'Plomberie',
    avatar: 'M',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Thomas D.',
    city: 'Lyon 3e',
    rating: 5,
    text: 'Impressionné par le nombre d\'artisans disponibles. J\'ai pu comparer 6 menuisiers dans mon quartier et choisir celui qui correspondait à mon budget.',
    service: 'Menuiserie',
    avatar: 'T',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Sophie R.',
    city: 'Bordeaux',
    rating: 5,
    text: 'Bien mieux que PagesJaunes. Les fiches sont complètes avec les données vérifiées. J\'ai trouvé un excellent peintre pour mon appartement.',
    service: 'Peinture',
    avatar: 'S',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Jean-Pierre M.',
    city: 'Toulouse',
    rating: 5,
    text: 'En tant qu\'artisan, c\'est la première plateforme où mon profil était déjà créé grâce aux données officielles. Il m\'a suffi de le réclamer. Très pratique.',
    service: 'Électricité',
    avatar: 'JP',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Nathalie C.',
    city: 'Nantes',
    rating: 5,
    text: 'Rénovation énergétique complète : isolation + chauffage. J\'ai trouvé deux artisans RGE en 10 minutes. La couverture nationale est un vrai plus.',
    service: 'Isolation',
    avatar: 'N',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    name: 'Karim B.',
    city: 'Marseille',
    rating: 4,
    text: '350 000 artisans, ce n\'est pas une blague. J\'ai cherché un couvreur dans le 13e arrondissement et j\'avais plus de 40 résultats. Difficile de choisir !',
    service: 'Couverture',
    avatar: 'K',
    gradient: 'from-sky-500 to-blue-500',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0a0f1e] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(37,99,235,0.08) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 80% 30%, rgba(139,92,246,0.06) 0%, transparent 50%)',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={sectionReveal}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-amber-300 rounded-full text-sm font-medium mb-5 border border-white/10">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            Particuliers et artisans
          </div>
          <h2 className="font-heading text-3xl md:text-[2.5rem] font-bold text-white mb-4 tracking-tight">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-3 mb-1" />
            Ils utilisent ServicesArtisans
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Retours de particuliers et d&apos;artisans dans toute la France
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={staggerItem}
              className="relative bg-white/[0.06] backdrop-blur-sm rounded-2xl p-7 border border-white/10 hover:-translate-y-1 hover:bg-white/[0.1] hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group"
            >
              {/* Quote mark */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5 group-hover:text-white/10 transition-colors duration-500" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                {Array.from({ length: 5 - t.rating }).map((_, j) => (
                  <Star key={`empty-${j}`} className="w-4 h-4 text-white/10" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-300 leading-relaxed mb-6 relative z-10 text-sm italic">
                &quot;{t.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                <div className={`w-11 h-11 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center ring-2 ring-white/20 shadow-md`}>
                  <span className="text-white font-bold text-xs">{t.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{t.name}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-xs text-slate-500">{t.service} — {t.city}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── ARTISAN CTA → PREMIUM DESIGN ───────────────────────────────

const artisanBenefits = [
  { icon: Eye, text: 'Visibilité auprès de milliers de clients' },
  { icon: TrendingUp, text: 'Recevez des demandes de devis qualifiées' },
  { icon: CreditCard, text: 'Inscription gratuite, sans engagement' },
]

export function ArtisanCTASection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Premium dark background with radial accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#111827] to-[#0a0f1e]">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 50% 80% at 20% 50%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 80% 50%, rgba(139,92,246,0.06) 0%, transparent 50%)',
        }} />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={sectionReveal}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-amber-300 rounded-full text-sm font-medium mb-6 border border-white/10">
            <Users className="w-3.5 h-3.5" />
            Rejoignez 350 000+ artisans référencés
          </div>

          <h2 className="font-heading text-3xl md:text-[2.75rem] lg:text-5xl font-bold mb-5 tracking-tight leading-tight">
            Vous êtes artisan ?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
              Rendez-vous visible
            </span>
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Votre entreprise est déjà dans notre base grâce aux registres officiels.
            Réclamez votre profil et recevez des demandes de devis qualifiées.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {artisanBenefits.map((b, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-white/[0.08] backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                  <b.icon className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-sm text-slate-300 text-left">{b.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/inscription-artisan"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-900 font-semibold px-8 py-4 rounded-xl hover:shadow-[0_8px_30px_-4px_rgba(245,158,11,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              Inscrire mon entreprise <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/comment-ca-marche"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium px-6 py-4 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 hover:-translate-y-1 transition-all duration-300"
            >
              En savoir plus
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── GARANTIE SECTION ────────────────────────────────────────────

const guarantees = [
  {
    icon: Database,
    title: 'Données officielles',
    description: 'Chaque artisan provient des registres SIREN de l\'État français. Pas de fausses fiches, pas de doublons.',
    stat: '100%',
    statLabel: 'données vérifiées',
  },
  {
    icon: Shield,
    title: 'Entreprises actives',
    description: 'Seules les entreprises avec un SIREN actif et valide sont référencées. Radiations exclues automatiquement.',
    stat: '350k+',
    statLabel: 'artisans actifs',
  },
  {
    icon: FileCheck,
    title: 'Devis gratuits',
    description: 'Demandez autant de devis que vous souhaitez. Aucun frais, aucun engagement, aucune commission cachée.',
    stat: '0€',
    statLabel: 'pour les particuliers',
  },
  {
    icon: Globe,
    title: 'Couverture nationale',
    description: 'De la métropole aux DOM-TOM, chaque département est couvert. Trouvez un artisan où que vous soyez.',
    stat: '101',
    statLabel: 'départements',
  },
]

export function GuaranteeSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={sectionReveal}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-5">
            <Shield className="w-3.5 h-3.5" />
            La garantie ServicesArtisans
          </div>
          <h2 className="font-heading text-3xl md:text-[2.5rem] font-bold text-slate-900 mb-4 tracking-tight">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-3 mb-1" />
            Des données que vous pouvez{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              vérifier
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Contrairement aux annuaires classiques, nos données proviennent directement
            des registres officiels de l&apos;État français via l&apos;API Annuaire des Entreprises.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {guarantees.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                variants={staggerItem}
                className="relative bg-gradient-to-b from-slate-50 to-white rounded-2xl p-6 border border-gray-100/80 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="font-heading text-2xl font-extrabold text-slate-900 mb-0.5">
                  {item.stat}
                </div>
                <div className="text-xs text-blue-600 font-medium mb-3">{item.statLabel}</div>
                <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Source attribution */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionReveal}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-full border border-slate-100">
            <BadgeCheck className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-slate-600">
              Source : <strong className="text-slate-900">API Annuaire des Entreprises</strong> — données ouvertes du gouvernement français
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── WHY US / COMPETITIVE ADVANTAGE ──────────────────────────────

const advantages = [
  {
    title: 'La plus grande base de France',
    description: '350 000+ artisans référencés, soit plus que PagesJaunes Pro, Habitatpresto et Travaux.com réunis pour les métiers du bâtiment.',
    icon: Users,
    highlight: '7x',
    highlightLabel: 'plus que le 2e',
  },
  {
    title: 'Données gouvernementales',
    description: 'Chaque fiche provient du registre SIREN via l\'API officielle de l\'État. Pas de scraping douteux, pas de données obsolètes.',
    icon: Database,
    highlight: 'SIREN',
    highlightLabel: 'source officielle',
  },
  {
    title: 'Gratuit pour tous',
    description: 'Pas d\'abonnement, pas de commission, pas de frais cachés. Ni pour les particuliers, ni pour les artisans.',
    icon: Banknote,
    highlight: '0€',
    highlightLabel: 'toujours gratuit',
  },
]

export function WhyUsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FEFDFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={sectionReveal}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-5">
            <TrendingUp className="w-3.5 h-3.5" />
            Pourquoi ServicesArtisans ?
          </div>
          <h2 className="font-heading text-3xl md:text-[2.5rem] font-bold text-slate-900 mb-4 tracking-tight">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-3 mb-1" />
            Ce qui nous rend{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              différents
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Un annuaire construit sur la transparence et les données publiques.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {advantages.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                variants={staggerItem}
                className="relative bg-white rounded-2xl p-8 border border-gray-100/80 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-heading text-2xl font-extrabold text-slate-900">{item.highlight}</div>
                    <div className="text-xs text-purple-600 font-medium">{item.highlightLabel}</div>
                  </div>
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
