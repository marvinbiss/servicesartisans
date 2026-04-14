'use client'

/**
 * Training step — 4 Wistia video placeholders + 10-question quiz.
 *
 * Flow:
 * 1. Watch 4 videos (placeholders — iframe embeds)
 * 2. Answer all 10 quiz questions
 * 3. POST /api/cee/partners/training/quiz → { score, total, passed, certified }
 * 4. Show score. If passed → onNext(). If failed → allow retry.
 *
 * States: default, hover, focus, active, disabled, loading, error, success
 * WCAG: fieldset+legend per question, aria-live for score, required answers
 */

import { useState } from 'react'
import { PlayCircle, CheckCircle, XCircle, ChevronRight, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import Button from '@/components/ui/Button'
import { QUIZ_QUESTIONS, PASS_THRESHOLD } from '@/lib/cee/quiz-questions'
import type { CeePartnerData } from '../page'

interface TrainingProps {
  partner: CeePartnerData | null
  onNext: () => void
  onPartnerRefresh: () => Promise<void>
}

const WISTIA_VIDEOS = [
  { id: 'v1', title: 'Introduction au CEE et rôle du mandataire', duration: '8 min' },
  { id: 'v2', title: 'Les opérations BAR-TH éligibles', duration: '12 min' },
  { id: 'v3', title: 'Montage dossier et pièces justificatives', duration: '10 min' },
  { id: 'v4', title: 'Règles de sécurité IBAN et conformité PNCEE', duration: '6 min' },
]

interface QuizResult {
  score: number
  total: number
  passed: boolean
  certified: boolean
}

export default function Training({ partner, onNext, onPartnerRefresh }: TrainingProps) {
  const isAlreadyCertified = Boolean(partner?.certified_at)

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [result, setResult] = useState<QuizResult | null>(null)
  const [validationError, setValidationError] = useState('')

  const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.id] !== undefined)
  const answeredCount = Object.keys(answers).length

  const handleAnswer = (questionId: string, choiceIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceIndex }))
    setValidationError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allAnswered) {
      setValidationError(
        `Répondez à toutes les questions. Il reste ${QUIZ_QUESTIONS.length - answeredCount} question(s) sans réponse.`
      )
      return
    }
    setIsSubmitting(true)
    setApiError('')
    setValidationError('')

    try {
      const res = await fetch('/api/cee/partners/training/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      const json = await res.json().catch(() => ({}))

      if (res.status === 429) {
        setApiError('Trop de tentatives. Attendez une minute avant de réessayer.')
        return
      }
      if (!res.ok) {
        setApiError(json?.error?.message || 'Erreur lors de la soumission du quiz.')
        return
      }

      const data: QuizResult = json.data
      setResult(data)
      await onPartnerRefresh()

      if (data.passed) {
        setTimeout(() => onNext(), 1200)
      }
    } catch {
      setApiError('Erreur réseau. Vérifiez votre connexion et réessayez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setAnswers({})
    setApiError('')
    setValidationError('')
  }

  if (isAlreadyCertified && !result) {
    return (
      <section
        className="p-6 sm:p-8"
        aria-labelledby="training-heading"
        data-testid="step-training"
      >
        <header className="mb-6">
          <div className="mb-3 inline-flex items-center rounded-full bg-primary-50 px-3 py-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
              Étape 4 sur 5
            </span>
          </div>
          <h2 id="training-heading" className="font-heading text-2xl font-bold text-charcoal-900">
            Formation &amp; quiz
          </h2>
        </header>

        <div
          role="status"
          className="mb-6 flex items-center gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4"
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-accent-500" aria-hidden="true" />
          <div>
            <p className="font-semibold text-accent-700">Formation validée</p>
            <p className="text-sm text-accent-600">
              Score : {partner?.certification_score ?? '—'}/{QUIZ_QUESTIONS.length} — Seuil de
              réussite : {PASS_THRESHOLD}/{QUIZ_QUESTIONS.length}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            rightIcon={<ChevronRight className="h-5 w-5" aria-hidden="true" />}
            onClick={onNext}
            data-testid="training-continue-btn"
          >
            Continuer
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="p-6 sm:p-8" aria-labelledby="training-heading" data-testid="step-training">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center rounded-full bg-primary-50 px-3 py-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
            Étape 4 sur 5
          </span>
        </div>
        <h2 id="training-heading" className="font-heading text-2xl font-bold text-charcoal-900">
          Formation &amp; quiz
        </h2>
        <p className="mt-2 text-charcoal-500">
          Regardez les vidéos de formation, puis répondez aux {QUIZ_QUESTIONS.length} questions du
          quiz. Score minimum : {PASS_THRESHOLD}/{QUIZ_QUESTIONS.length}.
        </p>
      </header>

      {/* Videos */}
      <div className="mb-8">
        <h3 className="mb-3 font-semibold text-charcoal-900">Vidéos de formation</h3>
        <ul className="grid gap-3 sm:grid-cols-2" role="list">
          {WISTIA_VIDEOS.map((video) => (
            <li
              key={video.id}
              className="overflow-hidden rounded-xl border border-sand-300 bg-sand-50"
            >
              {/* Wistia placeholder — replace with real embed when available */}
              <div
                className="flex aspect-video w-full items-center justify-center bg-charcoal-950"
                aria-label={`Vidéo : ${video.title}`}
                role="img"
              >
                <PlayCircle className="h-12 w-12 text-white/60" aria-hidden="true" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-charcoal-900">{video.title}</p>
                <p className="text-xs text-charcoal-400">{video.duration}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Result banner */}
      {result && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={clsx(
            'mb-6 flex items-start gap-3 rounded-xl border p-4',
            result.passed ? 'border-accent-200 bg-accent-50' : 'border-red-200 bg-red-50'
          )}
        >
          {result.passed ? (
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" aria-hidden="true" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
          )}
          <div>
            <p
              className={clsx('font-semibold', result.passed ? 'text-accent-700' : 'text-red-800')}
            >
              {result.passed ? 'Quiz réussi !' : 'Quiz échoué'}
            </p>
            <p className={clsx('text-sm', result.passed ? 'text-accent-600' : 'text-red-700')}>
              Score : {result.score}/{result.total} — Seuil de réussite : {PASS_THRESHOLD}/
              {result.total}
            </p>
            {!result.passed && (
              <p className="mt-1 text-sm text-red-700">
                Vous pouvez retenter le quiz. Révisez les vidéos ci-dessus.
              </p>
            )}
          </div>
        </div>
      )}

      {/* API error */}
      {apiError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {apiError}
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div
          id="quiz-validation-error"
          role="alert"
          aria-live="polite"
          className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {validationError}
        </div>
      )}

      {/* Quiz form */}
      {!result?.passed && (
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Quiz de formation CEE"
          className="space-y-6"
          data-testid="quiz-form"
        >
          {QUIZ_QUESTIONS.map((question, qIdx) => {
            const selectedAnswer = answers[question.id]
            return (
              <fieldset
                key={question.id}
                className="rounded-xl border border-sand-200 bg-sand-50 p-5"
                aria-required="true"
              >
                <legend className="font-semibold text-charcoal-900">
                  <span className="mr-2 text-sm font-bold text-primary-500">Q{qIdx + 1}.</span>
                  {question.question}
                </legend>
                <ul className="mt-3 space-y-2" role="list">
                  {question.choices.map((choice, choiceIdx) => {
                    const isSelected = selectedAnswer === choiceIdx
                    const inputId = `q-${question.id}-c-${choiceIdx}`
                    return (
                      <li key={choiceIdx}>
                        <label
                          htmlFor={inputId}
                          className={clsx(
                            'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors duration-150',
                            'focus-within:ring-2 focus-within:ring-primary-400 focus-within:ring-offset-1',
                            isSelected
                              ? 'border-primary-400 bg-primary-50 text-primary-700'
                              : 'border-sand-300 bg-white text-charcoal-700 hover:border-primary-200 hover:bg-primary-50/30'
                          )}
                        >
                          <input
                            id={inputId}
                            type="radio"
                            name={`question-${question.id}`}
                            value={choiceIdx}
                            checked={isSelected}
                            onChange={() => handleAnswer(question.id, choiceIdx)}
                            disabled={isSubmitting}
                            className="h-4 w-4 shrink-0 border-sand-400 text-primary-500 focus:ring-primary-400 focus:ring-offset-0"
                            aria-describedby={
                              validationError && selectedAnswer === undefined
                                ? 'quiz-validation-error'
                                : undefined
                            }
                          />
                          <span className="text-sm">{choice}</span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>
            )
          })}

          {/* Progress */}
          <div className="text-sm text-charcoal-500" aria-live="polite">
            {answeredCount}/{QUIZ_QUESTIONS.length} question
            {answeredCount !== 1 ? 's' : ''} répondue
            {answeredCount !== 1 ? 's' : ''}
          </div>

          <div className="flex justify-end gap-3">
            {result && !result.passed && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleRetry}
                disabled={isSubmitting}
                data-testid="quiz-retry-btn"
              >
                Réessayer
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              rightIcon={<ChevronRight className="h-5 w-5" aria-hidden="true" />}
              data-testid="quiz-submit-btn"
            >
              Soumettre le quiz
            </Button>
          </div>
        </form>
      )}

      {/* Passed — continue */}
      {result?.passed && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            rightIcon={<ChevronRight className="h-5 w-5" aria-hidden="true" />}
            onClick={onNext}
            data-testid="training-continue-btn"
          >
            Continuer
          </Button>
        </div>
      )}
    </section>
  )
}
