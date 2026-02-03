'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiveMetricCounterProps {
  value: number
  previousValue?: number
  label: string
  icon?: React.ReactNode
  format?: 'number' | 'currency' | 'percentage'
  prefix?: string
  suffix?: string
  animationDuration?: number
  showTrend?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CONFIG = {
  sm: {
    container: 'p-3',
    value: 'text-xl',
    label: 'text-xs',
    icon: 'w-8 h-8',
  },
  md: {
    container: 'p-4',
    value: 'text-3xl',
    label: 'text-sm',
    icon: 'w-10 h-10',
  },
  lg: {
    container: 'p-6',
    value: 'text-4xl',
    label: 'text-base',
    icon: 'w-12 h-12',
  },
}

export function LiveMetricCounter({
  value,
  previousValue,
  label,
  icon,
  format = 'number',
  prefix = '',
  suffix = '',
  animationDuration = 1000,
  showTrend = true,
  size = 'md',
  className,
}: LiveMetricCounterProps) {
  const [displayValue, setDisplayValue] = useState(previousValue ?? value)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)
  const config = SIZE_CONFIG[size]

  // Animate value changes
  useEffect(() => {
    const startValue = displayValue
    const endValue = value
    const startTime = Date.now()

    if (startValue === endValue) return

    setIsAnimating(true)

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / animationDuration, 1)
      const easeProgress = easeOutExpo(progress)
      const currentValue = startValue + (endValue - startValue) * easeProgress

      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, animationDuration])

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(val)
      case 'percentage':
        return `${val}%`
      default:
        return val.toLocaleString('fr-FR')
    }
  }

  const getTrend = () => {
    if (previousValue === undefined) return null
    const diff = value - previousValue
    const percentage = previousValue !== 0 ? (diff / previousValue) * 100 : 0

    if (diff > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        text: `+${Math.abs(percentage).toFixed(1)}%`,
      }
    } else if (diff < 0) {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        text: `-${Math.abs(percentage).toFixed(1)}%`,
      }
    }
    return {
      icon: Minus,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      text: '0%',
    }
  }

  const trend = showTrend ? getTrend() : null

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700',
        config.container,
        className
      )}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        {icon && (
          <div className={cn('text-gray-400 dark:text-gray-500', config.icon)}>
            {icon}
          </div>
        )}

        {/* Trend badge */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              trend.bgColor,
              trend.color
            )}
          >
            <trend.icon className="w-3 h-3" />
            {trend.text}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className={cn(
          'font-bold text-gray-900 dark:text-white mt-2 transition-transform',
          config.value,
          isAnimating && 'scale-105'
        )}
      >
        {prefix}
        {formatValue(displayValue)}
        {suffix}
      </div>

      {/* Label */}
      <div className={cn('text-gray-500 dark:text-gray-400 mt-1', config.label)}>
        {label}
      </div>
    </div>
  )
}

// Easing function for smooth animation
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

export default LiveMetricCounter
