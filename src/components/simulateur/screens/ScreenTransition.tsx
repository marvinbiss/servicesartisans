'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  screenKey: string
  direction: 1 | -1
  children: React.ReactNode
}

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
}

export default function ScreenTransition({ screenKey, direction, children }: Props) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={screenKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
