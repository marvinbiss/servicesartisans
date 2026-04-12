import { SITE_NAME } from '@/lib/seo/config'

interface SpeakableAnswerBoxProps {
  answer: string
  source?: string
  updatedDate?: string
}

export function SpeakableAnswerBox({ answer, source, updatedDate }: SpeakableAnswerBoxProps) {
  return (
    <div
      data-speakable="true"
      className="speakable-summary mb-8 rounded-xl border border-primary-100 bg-primary-50/50 px-6 py-5"
    >
      <p className="text-base leading-relaxed text-charcoal-800">{answer}</p>
      <p className="mt-3 text-xs text-charcoal-500">
        Source : {source || SITE_NAME} {'—'} Donn{'é'}es v{'é'}rifi{'é'}es SIREN/SIRET
        {updatedDate && ` — Mis à jour : ${updatedDate}`}
      </p>
    </div>
  )
}
