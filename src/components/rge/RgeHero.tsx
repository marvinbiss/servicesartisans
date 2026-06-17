/**
 * RgeHero — hero immersif charcoal-950 du template RGE `/rge/[service]/[ville]`.
 *
 * Sert ~49K pages (template flagship). Conforme DESIGN.md §"Hero Sections"
 * (charcoal-950 + overlay radial terracotta, jamais bleu/violet) et à la
 * formule premium de docs/design-premium/SYNTHESIS-2026-06-05.md
 * (headings weight 600, tracking-tight, text-balance, 1 CTA rempli, pills
 * trust discrètes, tabular-nums sur les stats, lucide au lieu d'emoji).
 *
 * Server component, zéro JS client. LCP texte (CLS-safe : aucune image).
 *
 * Les variantes de chaîne du h1 / sous-titre / bloc auteur restent dans la
 * page (helpers grammaticaux svcCounted/svcAccord) et sont injectées ici en
 * ReactNode — on déplace la JSX, on ne réécrit pas les strings.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { BadgeCheck, Clock, FileText, ShieldCheck } from 'lucide-react'

import Breadcrumb, { type BreadcrumbItem } from '@/components/Breadcrumb'

type Props = {
  breadcrumbItems: BreadcrumbItem[]
  /** Contenu exact du h1 (variantes monthYear / count / fallback département). */
  title: ReactNode
  /** Sous-titre : ligne count + ville (accord grammatical préservé). */
  subtitle: ReactNode
  /** Stat RGE affichée dans la rangée de trust (nombre d'artisans actifs). */
  rgeCount: number
  /** Lien de la CTA primaire (buildDevisHref). */
  devisHref: string
  /** Badge preuve sociale optionnel (avis vérifiés département). */
  socialProof?: ReactNode
  /** Bloc auteur / date de mise à jour optionnel (E-E-A-T). */
  authorLine?: ReactNode
}

export default function RgeHero({
  breadcrumbItems,
  title,
  subtitle,
  rgeCount,
  devisHref,
  socialProof,
  authorLine,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-charcoal-950 text-white">
      {/* Lueur radiale chaude terracotta — jamais bleu/violet (DESIGN.md). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200, 73, 42,0.16) 0%, transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <Breadcrumb items={breadcrumbItems} variant="dark" className="mb-7" />

        <h1
          data-speakable="true"
          className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-5xl"
        >
          {title}
        </h1>

        {socialProof && <div className="mt-3">{socialProof}</div>}

        <p className="mt-3 max-w-2xl text-base leading-relaxed text-sand-300">{subtitle}</p>

        {authorLine && <div className="mt-2 text-sm text-charcoal-300">{authorLine}</div>}

        {/* Rangée de pills trust — discrètes, lucide, pas de bannière colorée. */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-sand-300">
            <ShieldCheck className="h-4 w-4 text-accent-400" aria-hidden="true" />
            Qualifications vérifiées ADEME / France Rénov&rsquo;
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-sand-300">
            <Clock className="h-4 w-4 text-accent-400" aria-hidden="true" />
            Devis gratuit sous 24h
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-sand-300">
            <BadgeCheck className="h-4 w-4 text-accent-400" aria-hidden="true" />
            <span className="tabular-nums font-semibold text-white">{rgeCount}</span>
            artisans RGE actifs
          </span>
        </div>

        <Link
          href={devisHref}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3.5 font-semibold text-white shadow-cta transition-colors duration-200 ease-out hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950"
        >
          <FileText className="h-5 w-5" aria-hidden="true" />
          Demander un devis RGE
        </Link>
      </div>
    </section>
  )
}
