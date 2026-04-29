'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle, Shield, Clock } from 'lucide-react'
import dynamic from 'next/dynamic'
import { slugify } from '@/lib/utils'

const DevisBottomSheet = dynamic(() => import('@/components/conversion/DevisBottomSheet'), {
  ssr: false,
})

interface TarifsDevisCTAProps {
  service: string
  serviceName: string
  ville: string
  villeName?: string
  taskName?: string
  variant: 'inline' | 'banner'
}

export default function TarifsDevisCTA({
  service,
  serviceName,
  ville,
  taskName,
  variant,
}: TarifsDevisCTAProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Build desktop devis link with pre-filled service + ville
  const villeSlug = ville ? slugify(ville) : ''
  const devisHref =
    service && villeSlug
      ? `/services/${service}/${villeSlug}`
      : service
        ? `/devis/${service}`
        : '/devis'

  const handleClick = () => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    if (isDesktop) {
      const devisSection = document.getElementById('devis')
      if (devisSection) {
        devisSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = devisHref
      }
    } else {
      setIsOpen(true)
    }
  }

  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base"
        >
          Devis gratuit sans engagement
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-xs text-charcoal-400 mt-2">
          Gratuit, sans engagement, r{'é'}ponse rapide
        </p>
        <DevisBottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          prefilledService={service}
          prefilledCity={ville}
        />
      </>
    )
  }

  // variant === 'banner'
  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-3 bg-white text-primary-500 px-10 py-5 rounded-2xl font-bold hover:bg-primary-50 transition-all text-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        {taskName
          ? `Obtenir mon devis ${taskName.toLowerCase()}`
          : `Obtenir mon devis ${serviceName}`}
        <ArrowRight className="w-6 h-6" />
      </button>
      <div className="flex flex-wrap justify-center gap-6 mt-6 text-primary-100 text-sm">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          100% gratuit
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-4 h-4" />
          Artisans v{'é'}rifi{'é'}s SIREN
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />R{'é'}ponse rapide
        </span>
      </div>
      <DevisBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        prefilledService={service}
        prefilledCity={ville}
      />
    </>
  )
}
