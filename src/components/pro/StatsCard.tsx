'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  size?: 'default' | 'large'
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    trend: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    trend: 'text-green-600',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    trend: 'text-orange-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    trend: 'text-purple-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    trend: 'text-red-600',
  },
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  size = 'default',
}: StatsCardProps) {
  const colors = colorClasses[color]
  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
      className={`
        bg-white rounded-2xl border border-slate-200 overflow-hidden
        ${size === 'large' ? 'p-6' : 'p-5'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p
            className={`font-bold text-slate-900 ${
              size === 'large' ? 'text-4xl' : 'text-2xl'
            }`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${colors.icon} p-3 rounded-xl`}>
          <Icon className={size === 'large' ? 'w-7 h-7' : 'w-5 h-5'} />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-100">
          {TrendIcon && (
            <TrendIcon
              className={`w-4 h-4 ${
                trend.value > 0
                  ? 'text-green-500'
                  : trend.value < 0
                  ? 'text-red-500'
                  : 'text-slate-400'
              }`}
            />
          )}
          <span
            className={`text-sm font-semibold ${
              trend.value > 0
                ? 'text-green-600'
                : trend.value < 0
                ? 'text-red-600'
                : 'text-slate-500'
            }`}
          >
            {trend.value > 0 ? '+' : ''}
            {trend.value}%
          </span>
          <span className="text-sm text-slate-500">{trend.label}</span>
        </div>
      )}
    </motion.div>
  )
}

// Mini variant for compact displays
export function StatsCardMini({
  title,
  value,
  icon: Icon,
  color = 'blue',
}: Pick<StatsCardProps, 'title' | 'value' | 'icon' | 'color'>) {
  const colors = colorClasses[color]

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
      <div className={`${colors.icon} p-2 rounded-lg`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}
