'use client'

/**
 * FormationHub — hub formation CEE artisan (V3).
 *
 * Contenu :
 *   - 4 modules vidéo Wistia (placeholders) avec état watched
 *   - Quiz 10 questions CEE, validation côté serveur
 *   - Badge de certification affiché si certified_at
 *   - Alerte recyclage annuel si > 11 mois
 *
 * WCAG 2.1 AA : aria-live sur résultats quiz, labels, focus visible.
 * Light-only, zéro dark:*.
 */

import { useState } from 'react'
import {
  PlayCircle,
  CheckCircle2,
  Award,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Lock,
  BookOpen,
} from 'lucide-react'
import { QUIZ_QUESTIONS, PASS_THRESHOLD } from '@/lib/cee/quiz-questions'

interface FormationHubProps {
  providerId: string
  certifiedAt: string | null
  certificationScore: number | null
  trainingCompletedAt: string | null
  needsRecycling: boolean
}

interface VideoModule {
  id: string
  title: string
  description: string
  durationMin: number
  wistiaId: string // placeholder
}

const VIDEO_MODULES: VideoModule[] = [
  {
    id: 'v1',
    title: 'Introduction au dispositif CEE',
    description: 'Le cadre réglementaire, les acteurs, les arrêtés 2023.',
    durationMin: 12,
    wistiaId: 'placeholder-v1',
  },
  {
    id: 'v2',
    title: "Les fiches d\u2019op\u00e9rations standardis\u00e9es",
    description: 'BAR-TH, BAR-EN : comment les lire et les appliquer à vos chantiers.',
    durationMin: 18,
    wistiaId: 'placeholder-v2',
  },
  {
    id: 'v3',
    title: "Montage d\u2019un dossier complet",
    description: 'Pièces obligatoires, délais, erreurs les plus fréquentes.',
    durationMin: 22,
    wistiaId: 'placeholder-v3',
  },
  {
    id: 'v4',
    title: 'Suivi et commissions',
    description: 'Statuts dossier, versements, obligations mandataire.',
    durationMin: 10,
    wistiaId: 'placeholder-v4',
  },
]

type QuizState =
  | { kind: 'idle' }
  | { kind: 'in_progress' }
  | { kind: 'submitting' }
  | { kind: 'result'; score: number; passed: boolean }
  | { kind: 'error'; message: string }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

export default function FormationHub({
  providerId,
  certifiedAt,
  certificationScore,
  trainingCompletedAt: _trainingCompletedAt,
  needsRecycling,
}: FormationHubProps) {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set())
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [quizState, setQuizState] = useState<QuizState>({ kind: 'idle' })
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const allWatched = watchedIds.size >= VIDEO_MODULES.length
  const isAlreadyCertified = !!certifiedAt && !needsRecycling

  function markWatched(id: string) {
    setWatchedIds((prev) => new Set([...Array.from(prev), id]))
  }

  function startQuiz() {
    setAnswers({})
    setQuizState({ kind: 'in_progress' })
    // Focus the quiz section
    setTimeout(() => {
      document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      document.getElementById('quiz-q-0')?.focus()
    }, 100)
  }

  async function submitQuiz() {
    // Vérification côté client que toutes les réponses sont données
    if (Object.keys(answers).length < QUIZ_QUESTIONS.length) {
      setQuizState({ kind: 'error', message: 'Veuillez répondre à toutes les questions.' })
      return
    }
    setQuizState({ kind: 'submitting' })
    try {
      const res = await fetch('/api/cee/partners/training/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, answers }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        score?: number
        passed?: boolean
        error?: string
      }
      if (!res.ok) throw new Error(data.error ?? `Erreur serveur (${res.status})`)
      setQuizState({
        kind: 'result',
        score: data.score ?? 0,
        passed: data.passed ?? false,
      })
    } catch (err) {
      setQuizState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Badge certifié */}
      {isAlreadyCertified && certifiedAt && (
        <div className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-5">
          <Award className="h-10 w-10 shrink-0 text-green-600" aria-hidden="true" />
          <div>
            <p className="text-base font-semibold text-green-800">Certifié CEE SA Energy</p>
            <p className="mt-0.5 text-sm text-green-700">
              Certification obtenue le {formatDate(certifiedAt)}
              {certificationScore !== null && ` — Score : ${certificationScore}/10`}
            </p>
          </div>
        </div>
      )}

      {/* Alerte recyclage */}
      {needsRecycling && certifiedAt && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Recyclage annuel requis</p>
            <p className="mt-1 text-sm text-amber-700">
              Votre certification date du {formatDate(certifiedAt)}. Repassez le quiz pour la
              renouveler.
            </p>
          </div>
        </div>
      )}

      {/* Progression training */}
      <section aria-label="Modules de formation">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-charcoal-900">
            <BookOpen className="mr-2 inline h-5 w-5 text-primary-500" aria-hidden="true" />
            Modules vidéo
          </h2>
          <span className="text-xs text-charcoal-500">
            {watchedIds.size} / {VIDEO_MODULES.length} regardé{watchedIds.size !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-valuenow={watchedIds.size}
          aria-valuemin={0}
          aria-valuemax={VIDEO_MODULES.length}
          aria-label={`${watchedIds.size} module${watchedIds.size !== 1 ? 's' : ''} regardé${watchedIds.size !== 1 ? 's' : ''} sur ${VIDEO_MODULES.length}`}
          className="mb-5 h-2 w-full overflow-hidden rounded-full bg-sand-200"
        >
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${(watchedIds.size / VIDEO_MODULES.length) * 100}%` }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {VIDEO_MODULES.map((mod) => {
            const watched = watchedIds.has(mod.id)
            const isPlaying = activeVideo === mod.id
            return (
              <div
                key={mod.id}
                className={[
                  'rounded-xl border p-4 transition-all',
                  watched
                    ? 'border-green-200 bg-green-50'
                    : 'border-sand-300 bg-white hover:border-primary-200 hover:shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      watched ? 'bg-green-100 text-green-600' : 'bg-primary-50 text-primary-500'
                    }`}
                    aria-hidden="true"
                  >
                    {watched ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <PlayCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal-900">{mod.title}</p>
                    <p className="mt-0.5 text-xs text-charcoal-500">{mod.description}</p>
                    <p className="mt-1 text-xs text-charcoal-400">{mod.durationMin} min</p>
                  </div>
                </div>

                {/* Lecteur placeholder Wistia */}
                {isPlaying ? (
                  <div className="mt-4 space-y-3">
                    <div
                      className="flex h-40 items-center justify-center rounded-lg bg-charcoal-900 text-white"
                      aria-label={`Lecteur vidéo : ${mod.title}`}
                    >
                      <div className="text-center">
                        <PlayCircle className="mx-auto h-10 w-10 opacity-60" aria-hidden="true" />
                        <p className="mt-2 text-xs opacity-60">
                          Vidéo Wistia — ID : {mod.wistiaId}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        markWatched(mod.id)
                        setActiveVideo(null)
                      }}
                      className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 active:scale-[0.98]"
                    >
                      Marquer comme vu
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveVideo(mod.id)}
                    className={[
                      'mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1',
                      'active:scale-[0.98]',
                      watched
                        ? 'border border-green-200 bg-white text-green-700 hover:bg-green-50'
                        : 'bg-primary-500 text-white hover:bg-primary-600',
                    ].join(' ')}
                    aria-label={watched ? `Revoir : ${mod.title}` : `Regarder : ${mod.title}`}
                  >
                    {watched ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                        Revoir
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Regarder
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Quiz */}
      <section id="quiz-section" aria-label="Quiz de certification CEE">
        <h2 className="mb-4 text-base font-semibold text-charcoal-900">
          <Award className="mr-2 inline h-5 w-5 text-secondary-500" aria-hidden="true" />
          Quiz de certification
        </h2>

        {/* Blocage si vidéos non regardées (sauf si déjà certifié) */}
        {!allWatched && !isAlreadyCertified && quizState.kind === 'idle' && (
          <div className="rounded-xl border border-sand-200 bg-white p-6 text-center">
            <Lock className="mx-auto h-8 w-8 text-charcoal-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-charcoal-700">
              Regardez tous les modules avant d'accéder au quiz.
            </p>
            <p className="mt-1 text-xs text-charcoal-500">
              {VIDEO_MODULES.length - watchedIds.size} module
              {VIDEO_MODULES.length - watchedIds.size !== 1 ? 's' : ''} restant
              {VIDEO_MODULES.length - watchedIds.size !== 1 ? 's' : ''}.
            </p>
          </div>
        )}

        {/* Bouton démarrer */}
        {(allWatched || isAlreadyCertified) && quizState.kind === 'idle' && (
          <div className="rounded-xl border border-sand-300 bg-white p-6 text-center">
            <p className="text-sm text-charcoal-600">
              {isAlreadyCertified
                ? 'Repassez le quiz pour renouveler votre certification.'
                : 'Bonne chance ! Obtenez 8/10 pour être certifié.'}
            </p>
            <p className="mt-1 text-xs text-charcoal-500">
              Seuil de réussite : {PASS_THRESHOLD}/10 — 10 questions
            </p>
            <button
              type="button"
              onClick={startQuiz}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 active:translate-y-0"
            >
              {isAlreadyCertified ? (
                <>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Repasser le quiz
                </>
              ) : (
                <>
                  Démarrer le quiz
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Quiz en cours */}
        {quizState.kind === 'in_progress' && (
          <div className="rounded-xl border border-sand-300 bg-white p-6 space-y-6">
            <p className="text-sm text-charcoal-500">
              Répondez aux {QUIZ_QUESTIONS.length} questions. Une seule bonne réponse par question.
            </p>
            <ol className="space-y-6" aria-label="Questions du quiz CEE">
              {QUIZ_QUESTIONS.map((q, qIdx) => (
                <li key={q.id}>
                  <fieldset>
                    <legend
                      id={`quiz-q-${qIdx}`}
                      className="mb-3 text-sm font-semibold text-charcoal-900"
                      tabIndex={qIdx === 0 ? -1 : undefined}
                    >
                      {qIdx + 1}. {q.question}
                    </legend>
                    <div className="space-y-2" role="radiogroup" aria-labelledby={`quiz-q-${qIdx}`}>
                      {q.choices.map((choice, cIdx) => {
                        const inputId = `q-${q.id}-c-${cIdx}`
                        const isSelected = answers[q.id] === cIdx
                        return (
                          <label
                            key={cIdx}
                            htmlFor={inputId}
                            className={[
                              'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-all',
                              'focus-within:ring-2 focus-within:ring-primary-400 focus-within:ring-offset-1',
                              isSelected
                                ? 'border-primary-400 bg-primary-50 text-primary-700'
                                : 'border-sand-200 bg-sand-50 text-charcoal-700 hover:border-primary-200 hover:bg-primary-50/30',
                            ].join(' ')}
                          >
                            <input
                              id={inputId}
                              type="radio"
                              name={`question-${q.id}`}
                              value={cIdx}
                              checked={isSelected}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [q.id]: cIdx }))
                              }
                              className="mt-0.5 h-4 w-4 shrink-0 accent-primary-500"
                            />
                            {choice}
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>
                </li>
              ))}
            </ol>

            {quizState.kind === 'in_progress' && (
              <div
                aria-live="polite"
                className={Object.keys(answers).length < QUIZ_QUESTIONS.length ? '' : 'hidden'}
              >
                <p className="text-xs text-charcoal-500">
                  {Object.keys(answers).length} / {QUIZ_QUESTIONS.length} réponse
                  {Object.keys(answers).length !== 1 ? 's' : ''} données
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < QUIZ_QUESTIONS.length}
              aria-disabled={Object.keys(answers).length < QUIZ_QUESTIONS.length}
              className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              Valider mes réponses
            </button>
          </div>
        )}

        {/* Soumission en cours */}
        {quizState.kind === 'submitting' && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-center gap-3 rounded-xl border border-sand-200 bg-white p-10"
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" aria-hidden="true" />
            <p className="text-sm text-charcoal-700">Correction en cours…</p>
          </div>
        )}

        {/* Résultat */}
        {quizState.kind === 'result' && (
          <div
            role="status"
            aria-live="polite"
            className={[
              'rounded-xl border p-6 text-center',
              quizState.passed
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50',
            ].join(' ')}
          >
            {quizState.passed ? (
              <Award className="mx-auto h-12 w-12 text-green-600" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />
            )}
            <p className={`mt-3 text-2xl font-bold ${quizState.passed ? 'text-green-800' : 'text-red-800'}`}>
              {quizState.score} / {QUIZ_QUESTIONS.length}
            </p>
            <p className={`mt-1 text-sm font-medium ${quizState.passed ? 'text-green-700' : 'text-red-700'}`}>
              {quizState.passed
                ? 'Félicitations ! Vous êtes certifié CEE SA Energy.'
                : `Score insuffisant. Seuil requis : ${PASS_THRESHOLD}/${QUIZ_QUESTIONS.length}.`}
            </p>
            {!quizState.passed && (
              <button
                type="button"
                onClick={startQuiz}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Repasser le quiz
              </button>
            )}
          </div>
        )}

        {/* Erreur soumission */}
        {quizState.kind === 'error' && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-red-800">{quizState.message}</p>
              <button
                type="button"
                onClick={() => setQuizState({ kind: 'in_progress' })}
                className="mt-2 text-sm text-red-700 underline underline-offset-2 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 rounded"
              >
                Reprendre le quiz
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
