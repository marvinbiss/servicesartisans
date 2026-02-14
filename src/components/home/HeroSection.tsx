'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { heroImage } from '@/lib/data/images'
import { HeroSearch } from '@/components/search/HeroSearch'
import { HeroAccent } from '@/components/ui/HeroAccent'

// ── Simple fade-in-up variants ───────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
  }),
}

// ── Main Hero Component ───────────────────────────────────────────────
export function HeroSection() {
  return (
    <>
      {/* ── HERO SECTION ────────────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        {/* Background layers — simplified to 2 subtle gradients */}
        <div className="absolute inset-0" aria-hidden="true">
          {/* Background photo */}
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            className="object-cover opacity-15"
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={heroImage.blurDataURL}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#0a0f1e]/75" />
          {/* Gradient 1: blue glow top-center */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(37,99,235,0.15) 0%, transparent 60%)',
            }}
          />
          {/* Gradient 2: slate fade bottom */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% 110%, rgba(30,41,59,0.4) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* Decorative corner accents */}
        <HeroAccent />

        {/* Hero content */}
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 lg:py-40 flex flex-col items-center">
          {/* Heading — single fade-in-up for the whole block */}
          <motion.div
            variants={fadeInUp}
            custom={0}
            initial="hidden"
            animate="visible"
            aria-hidden="true"
            role="presentation"
            className="text-center mb-6"
          >
            <span className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-white block">
              L&apos;annuaire des artisans
            </span>
            <span className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-amber-400 block">
              qualifi&eacute;s en France
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            custom={0.15}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl text-slate-300 font-normal max-w-2xl mx-auto mt-2 mb-10 text-center leading-relaxed"
          >
            Trouvez l&apos;artisan id&eacute;al pr&egrave;s de chez vous. Comparez les profils et obtenez des devis gratuits.
          </motion.p>

          {/* ── SEARCH FORM ─────────────────────────────────── */}
          <motion.div
            variants={fadeInUp}
            custom={0.25}
            initial="hidden"
            animate="visible"
            className="w-full max-w-3xl mx-auto mb-10"
          >
            <HeroSearch />
          </motion.div>

          {/* ── CTA BUTTONS ─────────────────────────────────── */}
          <motion.div
            variants={fadeInUp}
            custom={0.35}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/devis"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-8 py-4 text-lg shadow-sm hover:shadow-md transition-all"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/comment-ca-marche"
              className="bg-white/10 hover:bg-white/20 text-white font-medium rounded-full px-8 py-4 text-lg border border-white/20 backdrop-blur-sm transition-all"
            >
              Comment &ccedil;a marche
            </Link>
          </motion.div>

          {/* ── TRUST INDICATORS ─────────────────────────────── */}
          <motion.div
            variants={fadeInUp}
            custom={0.45}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              350 000+ artisans
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Devis gratuit
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Partout en France
            </span>
          </motion.div>
        </div>
      </section>
    </>
  )
}
