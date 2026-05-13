'use client'

import { motion } from 'framer-motion'

interface Props {
  selected?: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export default function CardButton({ selected, onClick, children, className = '' }: Props) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-colors ${
        selected
          ? 'border-accent-500 bg-accent-50 ring-2 ring-accent-200'
          : 'border-charcoal-200 bg-white hover:border-charcoal-300 hover:bg-charcoal-50'
      } ${className}`}
    >
      {children}
    </motion.button>
  )
}
