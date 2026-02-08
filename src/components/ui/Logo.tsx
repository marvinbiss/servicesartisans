'use client'

import Link from 'next/link'
import { clsx } from 'clsx'

export interface LogoProps {
  variant?: 'full' | 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark' | 'auto'
  href?: string
  className?: string
}

const sizes = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
  xl: { icon: 48, text: 'text-3xl' },
}

export default function Logo({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  href = '/',
  className,
}: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size]

  const textColor = theme === 'dark'
    ? 'text-white'
    : theme === 'light'
    ? 'text-gray-900'
    : 'text-gray-900 dark:text-white'

  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGradient)" />

      {/* House roof */}
      <path
        d="M24 11L10 23H14V35H34V23H38L24 11Z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Wrench in house */}
      <path
        d="M22 24C22 22.34 23.34 21 25 21C26.1 21 27.06 21.59 27.58 22.47L31 20L32 21L28.58 23.47C28.85 23.94 29 24.46 29 25C29 26.66 27.66 28 26 28C24.9 28 23.94 27.41 23.42 26.53L20 29L19 28L22.42 25.53C22.15 25.06 22 24.54 22 24Z"
        fill="#2563eb"
      />

      {/* Door */}
      <rect x="21" y="29" width="6" height="6" rx="1" fill="#2563eb" fillOpacity="0.3" />
    </svg>
  )

  const LogoText = () => (
    <span className={clsx('font-bold tracking-tight', textSize, textColor)}>
      Services<span className="text-blue-600">Artisans</span>
    </span>
  )

  const content = (
    <div className={clsx('flex items-center gap-2', className)}>
      {(variant === 'full' || variant === 'icon') && <LogoIcon />}
      {(variant === 'full' || variant === 'text') && <LogoText />}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
        {content}
      </Link>
    )
  }

  return content
}

// Tagline component
export function Tagline({ className }: { className?: string }) {
  return (
    <p className={clsx('text-gray-600 dark:text-gray-400', className)}>
      Trouvez les meilleurs artisans près de chez vous
    </p>
  )
}

// Full brand header with logo and tagline
export function BrandHeader({
  size = 'lg',
  centered = false,
  className,
}: {
  size?: LogoProps['size']
  centered?: boolean
  className?: string
}) {
  return (
    <div className={clsx(centered && 'text-center', className)}>
      <Logo size={size} variant="full" className={centered ? 'justify-center' : ''} />
      <Tagline className={clsx('mt-1', size === 'sm' && 'text-sm', size === 'xl' && 'text-lg')} />
    </div>
  )
}
