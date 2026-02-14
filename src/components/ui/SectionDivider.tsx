/**
 * Brand-colored section divider with geometric dot motif.
 * Minimal, precise — three dots (amber-blue-amber) flanked by thin lines.
 */
export function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-2 ${className}`} aria-hidden="true">
      <svg width="120" height="12" viewBox="0 0 120 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 6h48" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx="54" cy="6" r="2" fill="#f59e0b" />
        <circle cx="60" cy="6" r="3" fill="#2563eb" />
        <circle cx="66" cy="6" r="2" fill="#f59e0b" />
        <path d="M72 6h48" stroke="#e2e8f0" strokeWidth="1" />
      </svg>
    </div>
  )
}
