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
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Main circle */}
      <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" />

      {/* Calendar icon */}
      <rect x="14" y="16" width="20" height="18" rx="2" fill="white" fillOpacity="0.9" />
      <rect x="14" y="16" width="20" height="6" rx="2" fill="white" />
      <circle cx="19" cy="13" r="2" fill="white" />
      <circle cx="29" cy="13" r="2" fill="white" />

      {/* Check mark */}
      <path
        d="M19 27L22 30L29 23"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
