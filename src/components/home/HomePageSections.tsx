'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import {
  Users, Star, MapPin, MessageSquare,
  Wrench, Zap, Key, Flame, PaintBucket, Hammer, HardHat, Home, TreeDeciduous, Sparkles,
  Search, ClipboardList, CheckCircle, ArrowRight,
  Eye, TrendingUp, CreditCard
} from 'lucide-react'

// ─── STATS SECTION ───────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}

const stats = [
  { value: 2500, suffix: '+', label: 'Artisans vérifiés', icon: Users, color: 'from-blue-500 to-blue-600' },
  { value: 50000, suffix: '+', label: 'Avis clients', icon: MessageSquare, color: 'from-amber-500 to-amber-600' },
  { value: 100, suffix: '+', label: 'Villes couvertes', icon: MapPin, color: 'from-emerald-500 to-emerald-600' },
  { value: 4.8, suffix: '/5', label: 'Satisfaction moyenne', icon: Star, color: 'from-purple-500 to-purple-600' },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl mb-4 shadow-lg`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">
                {stat.value === 4.8 ? (
                  <AnimatedCounter target={48} suffix="" duration={1500} />
                ) : (
                  <AnimatedCounter target={stat.value} suffix="" />
                )}
                <span className="text-blue-600">{stat.value === 4.8 ? '' : stat.suffix}</span>
              </div>
              {stat.value === 4.8 && (
                <div className="text-3xl md:text-4xl font-extrabold text-slate-900 -mt-8 mb-1" style={{ visibility: 'hidden' }}>0</div>
              )}
              <div className="text-slate-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── SERVICES SHOWCASE ───────────────────────────────────────────

const services = [
  { name: 'Plombier', slug: 'plombier', icon: Wrench, color: 'from-blue-500 to-blue-600', count: '542' },
  { name: 'Electricien', slug: 'electricien', icon: Zap, color: 'from-amber-500 to-amber-600', count: '489' },
  { name: 'Serrurier', slug: 'serrurier', icon: Key, color: 'from-slate-600 to-slate-700', count: '312' },
  { name: 'Chauffagiste', slug: 'chauffagiste', icon: Flame, color: 'from-orange-500 to-orange-600', count: '278' },
  { name: 'Peintre', slug: 'peintre-en-batiment', icon: PaintBucket, color: 'from-purple-500 to-purple-600', count: '356' },
  { name: 'Menuisier', slug: 'menuisier', icon: Hammer, color: 'from-amber-700 to-amber-800', count: '234' },
  { name: 'Carreleur', slug: 'carreleur', icon: Sparkles, color: 'from-teal-500 to-teal-600', count: '189' },
  { name: 'Couvreur', slug: 'couvreur', icon: Home, color: 'from-red-500 to-red-600', count: '156' },
  { name: 'Macon', slug: 'macon', icon: HardHat, color: 'from-stone-500 to-stone-600', count: '267' },
  { name: 'Jardinier', slug: 'jardinier', icon: TreeDeciduous, color: 'from-green-500 to-green-600', count: '198' },
]

export function ServicesShowcase() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Tous les corps de metier
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Trouvez le bon professionnel pour chaque besoin, de l&apos;urgence a la renovation complete.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-center">
                    {service.name}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    {service.count} artisans
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Voir tous les services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ────────────────────────────────────────────────

const steps = [
  {
    step: '01',
    title: 'Recherchez',
    description: 'Indiquez le service dont vous avez besoin et votre localisation. Notre moteur trouve les artisans disponibles pres de chez vous.',
    icon: Search,
    color: 'from-blue-500 to-blue-600',
  },
  {
    step: '02',
    title: 'Comparez',
    description: 'Consultez les profils detailles, les avis verifies et les tarifs. Choisissez l\'artisan qui correspond a vos attentes.',
    icon: ClipboardList,
    color: 'from-amber-500 to-amber-600',
  },
  {
    step: '03',
    title: 'Contactez',
    description: 'Demandez un devis gratuit et sans engagement. L\'artisan vous repond sous 24h avec une proposition detaillee.',
    icon: CheckCircle,
    color: 'from-emerald-500 to-emerald-600',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Comment ca marche ?
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            En 3 etapes simples, trouvez l&apos;artisan ideal pour votre projet.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-20 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-200 via-amber-200 to-emerald-200" />

          {steps.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Step number circle */}
                <div className="relative z-10 mx-auto mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg mx-auto`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm">
                    {item.step}
                  </div>
                </div>

                <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── TESTIMONIALS ────────────────────────────────────────────────

const testimonials = [
  {
    name: 'Marie L.',
    city: 'Paris',
    rating: 5,
    text: 'J\'ai trouve un plombier en moins de 2h pour une fuite urgente. Professionnel, rapide et tarif tres correct. Je recommande !',
    service: 'Plomberie',
    avatar: 'M',
  },
  {
    name: 'Thomas D.',
    city: 'Lyon',
    rating: 5,
    text: 'Renovation complete de ma salle de bain. L\'artisan etait ponctuel, soigneux et le resultat est magnifique. Merci ServicesArtisans !',
    service: 'Carrelage',
    avatar: 'T',
  },
  {
    name: 'Sophie R.',
    city: 'Bordeaux',
    rating: 5,
    text: 'Excellente plateforme pour comparer les artisans. Les avis m\'ont aide a faire le bon choix pour la peinture de mon appartement.',
    service: 'Peinture',
    avatar: 'S',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Des milliers de clients satisfaits partout en France.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 leading-relaxed mb-6">
                &quot;{t.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{t.avatar}</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.service} - {t.city}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── ARTISAN CTA ─────────────────────────────────────────────────

const artisanBenefits = [
  { icon: Eye, text: 'Visibilite aupres de milliers de clients' },
  { icon: TrendingUp, text: 'Recevez des demandes de devis qualifiees' },
  { icon: CreditCard, text: 'Inscription gratuite, sans engagement' },
]

export function ArtisanCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Vous etes artisan ?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Rejoignez notre reseau et developpez votre activite grace a ServicesArtisans.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            {artisanBenefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-blue-100"
              >
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-left">{b.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/inscription-artisan"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Inscrire mon entreprise <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/comment-ca-marche"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium px-6 py-4 rounded-xl border border-white/20 hover:border-white/40 transition-all"
            >
              En savoir plus
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
