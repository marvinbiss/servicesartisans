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
          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      } ${className}`}
    >
      {children}
    </motion.button>
  )
}
