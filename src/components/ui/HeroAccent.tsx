/**
 * Decorative concentric-circle corner accents for hero sections.
 * Extremely subtle (3% opacity) — barely visible, adds depth.
 * Jony Ive aesthetic: geometric, precise, understated.
 */
export function HeroAccent() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Top-right corner accent */}
      <svg className="absolute top-0 right-0 w-64 h-64 opacity-[0.03]" viewBox="0 0 256 256" fill="none">
        <circle cx="256" cy="0" r="200" stroke="white" strokeWidth="1" />
        <circle cx="256" cy="0" r="150" stroke="white" strokeWidth="0.5" />
        <circle cx="256" cy="0" r="100" stroke="white" strokeWidth="0.5" />
      </svg>
      {/* Bottom-left corner accent */}
      <svg className="absolute bottom-0 left-0 w-48 h-48 opacity-[0.03]" viewBox="0 0 192 192" fill="none">
        <circle cx="0" cy="192" r="160" stroke="white" strokeWidth="1" />
        <circle cx="0" cy="192" r="120" stroke="white" strokeWidth="0.5" />
      </svg>
    </div>
  )
}
