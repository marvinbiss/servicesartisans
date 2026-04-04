import { ClipboardList, Send, FileText, ThumbsUp } from 'lucide-react'
import type { ReactNode } from 'react'

interface Step {
  icon: ReactNode
  title: string
  description: string
  duration: string
}

const steps: Step[] = [
  {
    icon: <ClipboardList className="h-5 w-5" aria-hidden="true" />,
    title: 'Décrivez votre besoin',
    description: 'Remplissez le formulaire en quelques clics.',
    duration: '1 min',
  },
  {
    icon: <Send className="h-5 w-5" aria-hidden="true" />,
    title: 'Nous contactons les artisans',
    description: 'Votre demande est transmise aux professionnels qualifiés proches de chez vous.',
    duration: 'Instantané',
  },
  {
    icon: <FileText className="h-5 w-5" aria-hidden="true" />,
    title: 'Recevez votre devis',
    description: 'Les artisans intéressés vous envoient leur proposition détaillée.',
    duration: 'Sous 24h',
  },
  {
    icon: <ThumbsUp className="h-5 w-5" aria-hidden="true" />,
    title: 'Choisissez librement',
    description: 'Comparez les offres et sélectionnez l\'artisan qui vous convient.',
    duration: 'Sans engagement',
  },
]

interface ProcessTimelineProps {
  className?: string
}

export default function ProcessTimeline({ className = '' }: ProcessTimelineProps) {
  return (
    <section aria-label="Comment ça marche" className={className}>
      <h3 className="font-heading text-base font-semibold text-charcoal-900 mb-4">
        Comment ça marche ?
      </h3>

      <ol className="relative ml-3" role="list">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1

          return (
            <li key={step.title} className="relative pb-6 last:pb-0">
              {/* Vertical line */}
              {!isLast && (
                <span
                  className="absolute left-[11px] top-[30px] h-[calc(100%-14px)] w-px bg-accent-200"
                  aria-hidden="true"
                />
              )}

              <div className="flex items-start gap-3.5">
                {/* Step circle */}
                <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-accent-400 bg-white text-accent-600">
                  <span className="sr-only">Étape {index + 1}</span>
                  {step.icon}
                </span>

                {/* Content */}
                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-sm font-semibold text-charcoal-900">
                      {step.title}
                    </p>
                    <span className="inline-flex items-center rounded-full bg-accent-50 px-2 py-0.5 text-2xs font-medium text-accent-700">
                      {step.duration}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-charcoal-500">
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
