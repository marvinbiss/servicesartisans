'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { useCompare } from '@/components/compare/CompareProvider'

type Props = {
  href: string
  serviceLabel: string
  villeLabel: string
  /** Pixels scrolled before the bar appears. Default 600. */
  threshold?: number
}

export function StickyMobileDevisCTA({ href, serviceLabel, villeLabel, threshold = 600 }: Props) {
  const [visible, setVisible] = useState(false)
  const { compareList } = useCompare()
  // Mute when compare mode active: CompareBar owns the bottom-0 mobile real
  // estate. The user is engaged in a different decision flow; don't compete.
  const muted = compareList.length > 0

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const active = visible && !muted
  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-3 pt-2 bg-gradient-to-t from-white via-white/95 to-white/0 transition-transform duration-200 motion-reduce:transition-none ${
        active ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
      aria-hidden={!active}
    >
      <Link
        href={href}
        className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white font-bold px-4 py-3.5 rounded-2xl shadow-cta hover:shadow-cta-hover transition-all duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
        aria-label={`Recevoir mes devis ${serviceLabel} à ${villeLabel}`}
      >
        <FileText className="w-4 h-4" aria-hidden="true" />
        <span>Recevoir mes devis gratuits</span>
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
