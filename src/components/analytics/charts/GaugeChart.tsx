'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface GaugeChartProps {
  value: number
  maxValue?: number
  label?: string
  unit?: string
  thresholds?: {
    low: number
    medium: number
    high: number
  }
  size?: 'sm' | 'md' | 'lg'
  showTarget?: boolean
  targetValue?: number
  className?: string
}

const SIZE_CONFIG = {
  sm: { width: 120, strokeWidth: 8, fontSize: 'text-lg' },
  md: { width: 180, strokeWidth: 12, fontSize: 'text-2xl' },
  lg: { width: 240, strokeWidth: 16, fontSize: 'text-3xl' },
}

export function GaugeChart({
  value,
  maxValue = 100,
  label,
  unit = '',
  thresholds = { low: 33, medium: 66, high: 100 },
  size = 'md',
  showTarget = false,
  targetValue,
  className,
}: GaugeChartProps) {
  const config = SIZE_CONFIG[size]
  const radius = (config.width - config.strokeWidth) / 2
  const percentage = Math.min(100, (value / maxValue) * 100)

  const getColor = useMemo(() => {
    const pct = (value / maxValue) * 100
    if (pct <= thresholds.low) return '#EF4444' // red
    if (pct <= thresholds.medium) return '#F59E0B' // amber
    return '#10B981' // green
  }, [value, maxValue, thresholds])

  const targetAngle = targetValue
    ? Math.PI - (Math.min(targetValue, maxValue) / maxValue) * Math.PI
    : 0

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        width={config.width}
        height={config.width / 2 + config.strokeWidth}
        className="transform rotate-0"
      >
        {/* Background arc */}
        <path
          d={describeArc(
            config.width / 2,
            config.width / 2,
            radius,
            180,
            360
          )}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={describeArc(
            config.width / 2,
            config.width / 2,
            radius,
            180,
            180 + (percentage / 100) * 180
          )}
          fill="none"
          stroke={getColor}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Target marker */}
        {showTarget && targetValue !== undefined && (
          <line
            x1={config.width / 2 + radius * Math.cos(targetAngle)}
            y1={config.width / 2 + radius * Math.sin(targetAngle)}
            x2={
              config.width / 2 +
              (radius - config.strokeWidth / 2 - 4) * Math.cos(targetAngle)
            }
            y2={
              config.width / 2 +
              (radius - config.strokeWidth / 2 - 4) * Math.sin(targetAngle)
            }
            stroke="#1F2937"
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        {/* Center value */}
        <text
          x={config.width / 2}
          y={config.width / 2 - 5}
          textAnchor="middle"
          className={cn(
            'fill-gray-900 dark:fill-white font-bold',
            config.fontSize
          )}
        >
          {value.toLocaleString()}
          {unit && (
            <tspan className="text-sm font-normal text-gray-500">
              {unit}
            </tspan>
          )}
        </text>

        {/* Label */}
        {label && (
          <text
            x={config.width / 2}
            y={config.width / 2 + 15}
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400 text-xs"
          >
            {label}
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>0</span>
        <div className="flex-1 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-green-500 rounded" />
        <span>{maxValue}</span>
      </div>
    </div>
  )
}

// Helper function to describe arc
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ')
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

export default GaugeChart
