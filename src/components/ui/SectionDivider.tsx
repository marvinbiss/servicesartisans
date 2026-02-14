/**
 * Subtle gradient divider between homepage sections.
 * Provides visual separation with a premium, minimal look.
 */
export function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent ${className}`}
      aria-hidden="true"
    />
  )
}
