'use client'

import { memo, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: number; isPositive: boolean }
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'indigo' | 'purple' | 'gray'
  delay?: number
}

const colorMap = {
  blue: 'bg-primary-50 text-primary-600',
  green: 'bg-accent-50 text-accent-600',
  yellow: 'bg-secondary-50 text-secondary-600',
  red: 'bg-red-50 text-red-600',
  indigo: 'bg-primary-100 text-primary-700',
  purple: 'bg-primary-50 text-primary-700',
  gray: 'bg-sand-50 text-charcoal-600',
}

function AnimatedValue({ value }: { value: number }) {
  const motionValue = useMotionValue(0)
  const display = useTransform(motionValue, (v) => Math.round(v).toLocaleString('fr-FR'))

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.8,
      ease: 'easeOut',
    })
    return controls.stop
  }, [motionValue, value])

  return <motion.span>{display}</motion.span>
}

export const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
    >
      <div className="bg-white rounded-xl border border-sand-200 p-5 transition-shadow">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>{icon}</div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                trend.isPositive ? 'bg-accent-50 text-accent-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-charcoal-900 tabular-nums">
            {typeof value === 'number' ? <AnimatedValue value={value} /> : value}
          </p>
          <p className="text-sm text-charcoal-500 mt-0.5">{title}</p>
          {subtitle && <p className="text-xs text-charcoal-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  )
})
