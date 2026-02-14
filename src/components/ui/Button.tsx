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
      'font-semibold rounded-full',
      'transition-colors duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'touch-manipulation',
    ]

    const variants = {
      primary: [
        'bg-blue-600 text-white',
        'hover:bg-blue-700',
        'focus-visible:ring-blue-500',
      ],
      secondary: [
        'bg-amber-500 text-white',
        'hover:bg-amber-600',
        'focus-visible:ring-amber-500',
        'shadow-sm hover:shadow-md',
      ],
      outline: [
        'border border-slate-200 text-slate-700',
        'hover:bg-slate-50',
        'focus-visible:ring-slate-500',
      ],
      ghost: [
        'bg-transparent text-slate-700',
        'hover:bg-slate-50',
        'focus-visible:ring-slate-500',
      ],
      danger: [
        'bg-red-600 text-white',
        'hover:bg-red-700',
        'focus-visible:ring-red-500',
      ],
      premium: [
        'bg-amber-500 text-white font-semibold',
        'hover:bg-amber-600',
        'focus-visible:ring-amber-500',
        'shadow-sm hover:shadow-md',
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
