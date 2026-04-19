import { Sparkles } from 'lucide-react'

type TldrBlockProps = {
  title?: string
  bullets: string[]
}

/**
 * TL;DR block optimized for featured snippets and AI Overviews.
 * Uses data-speakable="true" so SpeakableSpecification can extract it.
 */
export default function TldrBlock({ title = 'L’essentiel', bullets }: TldrBlockProps) {
  if (!bullets || bullets.length === 0) return null
  return (
    <aside
      className="bg-primary-50 border border-primary-200 rounded-xl p-5 md:p-6 my-8"
      data-speakable="true"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary-700" aria-hidden />
        <h2 className="font-heading text-lg font-semibold text-primary-900 m-0">{title}</h2>
      </div>
      <ul className="space-y-2 text-sm md:text-base text-primary-950 list-disc pl-5">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </aside>
  )
}
