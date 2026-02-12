'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function GeographicSectionWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: premiumEase }}
    >
      {children}
    </motion.div>
  )
}
