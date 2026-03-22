'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'premium'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-xl',
      'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'active:scale-[0.98]',
      'touch-manipulation',
    ]

    const variants = {
      primary: [
        'bg-primary-400 text-white',
        'hover:bg-primary-500',
        'focus-visible:ring-primary-400',
        'shadow-[0_4px_14px_0_rgba(232,107,75,0.3)]',
        'hover:shadow-[0_8px_25px_0_rgba(212,85,58,0.4)]',
        'hover:-translate-y-[2px]',
      ],
      secondary: [
        'bg-charcoal-900 text-white',
        'hover:bg-charcoal-800',
        'focus-visible:ring-charcoal-700',
        'shadow-[0_4px_14px_0_rgba(28,25,23,0.2)]',
        'hover:shadow-[0_8px_25px_0_rgba(28,25,23,0.3)]',
        'hover:-translate-y-[2px]',
      ],
      outline: [
        'bg-transparent border-2 border-primary-400 text-primary-500',
        'hover:bg-primary-50 hover:border-primary-500 hover:text-primary-600',
        'focus-visible:ring-primary-400',
      ],
      ghost: [
        'bg-transparent text-charcoal-700',
        'hover:bg-sand-200/80',
        'focus-visible:ring-charcoal-400',
      ],
      danger: [
        'bg-red-600 text-white',
        'hover:bg-red-700',
        'focus-visible:ring-red-500',
        'shadow-[0_4px_14px_0_rgba(239,68,68,0.25)]',
        'hover:shadow-[0_8px_25px_0_rgba(239,68,68,0.35)]',
        'hover:-translate-y-[2px]',
      ],
      premium: [
        'bg-gradient-to-r from-secondary-500 via-secondary-400 to-secondary-500 text-white font-semibold',
        'hover:from-secondary-600 hover:via-secondary-500 hover:to-secondary-600',
        'focus-visible:ring-secondary-500',
        'shadow-[0_4px_20px_0_rgba(232,150,10,0.35)]',
        'hover:shadow-[0_10px_35px_0_rgba(232,150,10,0.45)]',
        'hover:-translate-y-[3px]',
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
      ],
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
