/**
 * CEE partner training quiz — SERVER-SIDE source of truth.
 *
 * Security
 * --------
 * - Client submits `{ answers: { [questionId]: number } }`.
 * - Server scores against this constant. `score` / `certified` fields from
 *   the client body are IGNORED (CWE-602).
 * - Passing threshold: `>= PASS_THRESHOLD` correct answers out of 10.
 */

export interface QuizQuestion {
  /** Stable identifier — do not renumber; client UI references it. */
  id: string
  question: string
  choices: string[]
  /** 0-based index of the correct choice. */
  correct: number
}

export const PASS_THRESHOLD = 8

/**
 * 10 questions — arrêté 2 novembre 2023, obligations mandataire, IBAN sécu.
 * Stable ordering: changing IDs invalidates historical attempts.
 */
export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'q1',
    question:
      'Quel texte encadre les obligations du mandataire CEE depuis novembre 2023 ?',
    choices: [
      'Arrêté du 2 novembre 2023',
      'Décret du 15 décembre 2022',
      'Règlement européen 2018/842',
      'Code de la consommation article L.121',
    ],
    correct: 0,
  },
  {
    id: 'q2',
    question:
      'Pour une opération BAR-TH-171 (PAC air/eau), qui signe le mandat CEE ?',
    choices: [
      "L'artisan uniquement",
      'Le bénéficiaire (client final) avant le début des travaux',
      'Le délégataire',
      'Le mandataire après les travaux',
    ],
    correct: 1,
  },
  {
    id: 'q3',
    question: "Quelle est la date limite de dépôt d'un dossier CEE après la fin des travaux ?",
    choices: ['3 mois', '6 mois', '12 mois', "Pas de limite"],
    correct: 2,
  },
  {
    id: 'q4',
    question: 'Que doit comporter une facture éligible CEE pour un BAR-TH-171 ?',
    choices: [
      'Marque, modèle, ETAS, SCOP',
      'Uniquement le prix TTC',
      'La mention "facture CEE"',
      "Le numéro d'agrément mandataire",
    ],
    correct: 0,
  },
  {
    id: 'q5',
    question:
      'Quelle qualification RGE est nécessaire pour une opération de pompe à chaleur air/eau ?',
    choices: ['Qualibat 5911', 'QualiPAC module CET', 'Qualifelec IRVE', 'Qualit\u2019ENR QualiBois'],
    correct: 1,
  },
  {
    id: 'q6',
    question: 'Quel est le délai moyen de paiement PNCEE après validation du dossier ?',
    choices: ['7 jours', '1 mois', '3 à 6 mois', '1 an'],
    correct: 2,
  },
  {
    id: 'q7',
    question: 'Qui est responsable de la conformité RGE au moment du devis ?',
    choices: [
      'Le mandataire',
      "L'artisan (qualification RGE en cours de validité au devis ET à la facture)",
      'Le client',
      'Le délégataire',
    ],
    correct: 1,
  },
  {
    id: 'q8',
    question: "En cas de non-conformité détectée après dépôt, qui supporte la retenue ?",
    choices: [
      'Le client',
      "L'artisan (article X de la convention mandataire)",
      'Le mandataire',
      "L'État",
    ],
    correct: 1,
  },
  {
    id: 'q9',
    question: 'Quelle est la règle de stockage des IBAN sur notre plateforme ?',
    choices: [
      'En clair en base',
      'Chiffrés via pgcrypto, les 4 derniers chiffres seuls visibles',
      'Uniquement sur papier',
      "Dans un fichier .env",
    ],
    correct: 1,
  },
  {
    id: 'q10',
    question:
      "Quel document justifie l'éligibilité précarité énergétique pour un bonus CEE ?",
    choices: [
      'Avis d\u2019imposition + justificatif domicile (grille ANAH)',
      'Attestation sur l\u2019honneur seule',
      'Quittance EDF',
      'Aucune justification requise',
    ],
    correct: 0,
  },
]

/**
 * Score an answers map against the server-side key.
 * Unknown question IDs are ignored silently.
 */
export function scoreQuiz(answers: Record<string, number>): {
  score: number
  passed: boolean
  total: number
} {
  let score = 0
  for (const q of QUIZ_QUESTIONS) {
    const given = answers[q.id]
    if (typeof given === 'number' && given === q.correct) {
      score += 1
    }
  }
  return {
    score,
    passed: score >= PASS_THRESHOLD,
    total: QUIZ_QUESTIONS.length,
  }
}
