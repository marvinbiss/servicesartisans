import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ReactNode } from 'react'

export function GeographicSectionWrapper({ children }: { children: ReactNode }) {
  return <ScrollReveal>{children}</ScrollReveal>
}
