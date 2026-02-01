import { clsx } from 'clsx'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function Loading({ size = 'md', className }: LoadingProps) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Chargement"
    >
      <span className="sr-only">Chargement...</span>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" />
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Loading size="lg" />
    </div>
  )
}

export function LoadingButton() {
  return <Loading size="sm" className="border-white/20 border-t-white" />
}

export default Loading
