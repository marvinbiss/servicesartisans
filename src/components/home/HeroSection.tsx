'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import { Search, MapPin } from 'lucide-react'
import { services, villes, departements } from '@/lib/data/france'

// ── Animated counter component ────────────────────────────────────────
function AnimatedNumber({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => {
    if (v >= 1000) {
      return Math.round(v).toLocaleString('fr-FR')
    }
    return Math.round(v).toString()
  })

  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    })
    return controls.stop
  }, [isInView, motionValue, value, duration])

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

// ── Filter chips for popular services ─────────────────────────────────
const chipServices = [
  { name: 'Plombier', slug: 'plombier' },
  { name: '\u00c9lectricien', slug: 'electricien' },
  { name: 'Serrurier', slug: 'serrurier' },
  { name: 'Peintre', slug: 'peintre-en-batiment' },
  { name: 'Menuisier', slug: 'menuisier' },
  { name: 'Chauffagiste', slug: 'chauffagiste' },
  { name: 'Couvreur', slug: 'couvreur' },
  { name: 'Ma\u00e7on', slug: 'macon' },
]

// ── Stagger animation variants ────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
}

// ── Main Hero Component ───────────────────────────────────────────────
export function HeroSection() {
  const router = useRouter()
  const [serviceQuery, setServiceQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const serviceInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const params = new URLSearchParams()
      if (serviceQuery.trim()) params.set('service', serviceQuery.trim())
      if (locationQuery.trim()) params.set('ville', locationQuery.trim())
      router.push(`/recherche?${params.toString()}`)
    },
    [serviceQuery, locationQuery, router]
  )

  return (
    <>
      {/* ── HERO SECTION ────────────────────────────────────── */}
      <section
        className="relative bg-[#0a0f1e] text-white overflow-hidden"
        style={{ minHeight: '70vh' }}
      >
        {/* Background layers */}
        <div className="absolute inset-0" aria-hidden="true">
          {/* Primary gradient mesh */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(59,130,246,0.06) 0%, transparent 50%)',
            }}
          />
          {/* Amber accent blob */}
          <div
            className="absolute top-1/3 right-1/4 w-[600px] h-[400px] opacity-[0.07]"
            style={{
              background:
                'radial-gradient(circle, rgba(245,158,11,0.6) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          {/* Blue accent blob */}
          <div
            className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] opacity-[0.06]"
            style={{
              background:
                'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          {/* Center glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-[0.04]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            }}
          />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          {/* Bottom fade for trust bar overlap */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/[0.03] to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28 flex flex-col items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center w-full"
          >
            {/* Animated badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center gap-2.5 bg-white/[0.07] backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-sm text-white/80 font-medium">
                  350 000+ artisans r&eacute;f&eacute;renc&eacute;s en France
                </span>
              </div>
            </motion.div>

            {/* H1 heading */}
            <motion.h1
              variants={itemVariants}
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05] mb-6"
            >
              <span className="text-white">Trouvez l&apos;artisan</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                id&eacute;al pr&egrave;s de chez vous
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Comparez les profils, consultez les avis et obtenez des devis gratuits.
            </motion.p>

            {/* ── SEARCH FORM ─────────────────────────────────── */}
            <motion.div
              variants={itemVariants}
              className="w-full max-w-3xl mx-auto mb-8"
            >
              <form
                onSubmit={handleSubmit}
                role="search"
                aria-label="Rechercher un artisan"
                className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-2"
              >
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Service input */}
                  <div className="flex-1 flex items-center gap-3 px-4 py-3">
                    <Search className="w-5 h-5 text-white/50 flex-shrink-0" />
                    <input
                      ref={serviceInputRef}
                      type="text"
                      value={serviceQuery}
                      onChange={(e) => setServiceQuery(e.target.value)}
                      placeholder="Quel service ? (plombier, &eacute;lectricien...)"
                      aria-label="Type de service recherch&eacute;"
                      autoComplete="off"
                      className="w-full bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-base"
                    />
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px bg-white/15 my-2" />
                  <div className="block md:hidden h-px bg-white/15 mx-4" />

                  {/* Location input */}
                  <div className="flex-1 flex items-center gap-3 px-4 py-3">
                    <MapPin className="w-5 h-5 text-white/50 flex-shrink-0" />
                    <input
                      ref={locationInputRef}
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="Ville ou code postal"
                      aria-label="Ville ou code postal"
                      autoComplete="off"
                      className="w-full bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-base"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="p-1.5">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      aria-label="Rechercher un artisan"
                      className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl px-8 py-4 transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Search className="w-5 h-5" />
                      <span>Rechercher</span>
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* ── FILTER CHIPS ────────────────────────────────── */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-2.5 mb-14"
            >
              <span className="text-sm text-white/50 mr-1">Populaire :</span>
              {chipServices.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-full px-4 py-2 text-sm transition-all duration-200"
                >
                  {svc.name}
                </Link>
              ))}
            </motion.div>

            {/* ── ANIMATED STATS ROW ──────────────────────────── */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto"
            >
              {[
                { value: 350000, suffix: '+', label: 'artisans' },
                { value: villes.length, suffix: '', label: 'villes' },
                { value: departements.length, suffix: '', label: 'd\u00e9partements' },
                { value: services.length, suffix: '', label: 'm\u00e9tiers' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-heading">
                    <AnimatedNumber
                      value={stat.value}
                      suffix={stat.suffix}
                      duration={2.2}
                    />
                  </div>
                  <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FLOATING TRUST BAR ──────────────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  Donn&eacute;es SIREN officielles
                </div>
                <div className="text-xs text-slate-500">
                  Registres de l&apos;&Eacute;tat v&eacute;rifi&eacute;s
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  50+ corps de m&eacute;tier
                </div>
                <div className="text-xs text-slate-500">
                  Tous les m&eacute;tiers du b&acirc;timent
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-end">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  100% gratuit, sans engagement
                </div>
                <div className="text-xs text-slate-500">
                  Recherche et devis offerts
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
