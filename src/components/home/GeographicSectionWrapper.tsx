'use client'

import { ReactNode } from 'react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export function GeographicSectionWrapper({ children }: { children: ReactNode }) {
  return <ScrollReveal>{children}</ScrollReveal>
}
