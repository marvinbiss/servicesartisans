/**
 * CEE dossier status machine — server-side transition map.
 *
 * Source de vérité : trigger `cee_dossiers_check_status_transition` (migration 433
 * — remplace 431). Cette map est un MIROIR exact du trigger SQL — toute
 * transition non listée ici doit aussi être absente du trigger, et vice-versa.
 *
 * Règle non-négociable :
 *   Zéro transition de status sans passer par cette map.
 *   Toute tentative de transition illégale lève une erreur (CWE-639).
 *
 * Alignement SQL (migration 433 — version en vigueur) :
 *   draft                → submitted_by_artisan | archived
 *   submitted_by_artisan → qa_pending | qa_rejected | archived
 *   qa_pending           → qa_approved | qa_rejected
 *   qa_approved          → deposited | archived
 *   qa_rejected          → submitted_by_artisan | archived
 *   deposited            → validated_pncee | rejected_pncee
 *   validated_pncee      → paid_client | archived
 *   rejected_pncee       → archived
 *   paid_client          → commission_due
 *   commission_due       → commission_paid
 *   commission_paid      → archived
 *   archived             → (terminal)
 */

export type CeeDossierV3Status =
  | 'draft'
  | 'submitted_by_artisan'
  | 'qa_pending'
  | 'qa_approved'
  | 'qa_rejected'
  | 'deposited'
  | 'validated_pncee'
  | 'rejected_pncee'
  | 'paid_client'
  | 'commission_due'
  | 'commission_paid'
  | 'archived'

/**
 * Map des transitions autorisées — miroir du trigger SQL migration 433.
 * Clé = statut actuel, valeur = tableau des statuts cibles autorisés.
 */
export const DOSSIER_TRANSITIONS: Record<CeeDossierV3Status, CeeDossierV3Status[]> = {
  draft: ['submitted_by_artisan', 'archived'],
  submitted_by_artisan: ['qa_pending', 'qa_rejected', 'archived'],
  qa_pending: ['qa_approved', 'qa_rejected'],
  qa_approved: ['deposited', 'archived'],
  qa_rejected: ['submitted_by_artisan', 'archived'],
  deposited: ['validated_pncee', 'rejected_pncee'],
  validated_pncee: ['paid_client', 'archived'],
  rejected_pncee: ['archived'],
  paid_client: ['commission_due'],
  commission_due: ['commission_paid'],
  commission_paid: ['archived'],
  archived: [],
}

/**
 * Vérifie si une transition est autorisée.
 */
export function canTransitionDossier(
  from: CeeDossierV3Status,
  to: CeeDossierV3Status
): boolean {
  return DOSSIER_TRANSITIONS[from]?.includes(to) ?? false
}

/**
 * Asserte qu'une transition est autorisée.
 * Lève une erreur détaillée en cas de transition illégale (CWE-639).
 */
export function assertDossierTransition(
  from: CeeDossierV3Status,
  to: CeeDossierV3Status
): void {
  if (!canTransitionDossier(from, to)) {
    throw new Error(
      `Transition dossier illégale : ${from} → ${to}. ` +
        `Transitions autorisées depuis '${from}': [${(DOSSIER_TRANSITIONS[from] ?? []).join(', ')}]`
    )
  }
}

/**
 * Retourne les transitions autorisées depuis un statut donné.
 */
export function getAllowedTransitions(from: CeeDossierV3Status): CeeDossierV3Status[] {
  return [...(DOSSIER_TRANSITIONS[from] ?? [])]
}

/**
 * Vérifie si un statut est terminal (aucune transition possible).
 */
export function isTerminalStatus(status: CeeDossierV3Status): boolean {
  return (DOSSIER_TRANSITIONS[status] ?? []).length === 0
}

/**
 * Détermine si l'artisan peut soumettre le dossier depuis ce statut.
 * Seule la transition draft → submitted_by_artisan est ouverte aux artisans.
 * La transition qa_rejected → submitted_by_artisan est gérée par les ops.
 */
export function artisanCanSubmit(status: CeeDossierV3Status): boolean {
  return status === 'draft'
}

/**
 * Détermine si l'artisan peut modifier le dossier dans ce statut.
 * Modifications autorisées uniquement en draft ou après rejet QA.
 */
export function artisanCanEdit(status: CeeDossierV3Status): boolean {
  return status === 'draft' || status === 'qa_rejected'
}
