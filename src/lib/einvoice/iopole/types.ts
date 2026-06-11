/** Types adaptateur Iopole. Forme canonique SA → sérialisée vers l'API Iopole. */

export type IopoleResult<T> = { data: T | null; error: string | null }

/** Enrôlement émetteur (artisan) — marque grise, émission sous son SIREN. */
export type IopoleEmitterInput = {
  siren: string
  name: string
  email?: string | null
}

export type IopoleEmitterResult = {
  emitterId: string
  status: string
}

/** Une ligne de facture (montants en euros décimaux). */
export type IopoleLine = {
  designation: string
  quantite: number
  unite: string
  prixUnitaireHt: number
  tvaRate: number
  totalLigneHt: number
}

/** Payload canonique d'une facture à transmettre. */
export type IopoleInvoicePayload = {
  /** Notre id interne (mapping retour Iopole). */
  internalId: string
  numero: string
  type: 'acompte' | 'situation' | 'solde'
  format: string
  issuedAt: string
  emitter: {
    emitterId?: string | null
    siren?: string | null
    name: string
  }
  buyer: {
    type: 'particulier' | 'pro'
    name: string | null
    siren: string | null
    email: string | null
  }
  lines: IopoleLine[]
  totals: {
    totalHt: number
    totalTva: number
    totalTtc: number
  }
}

export type IopoleSubmitResult = {
  iopoleId: string
  status: string
}

export type IopoleStatusResult = {
  iopoleId: string
  status: string
}
