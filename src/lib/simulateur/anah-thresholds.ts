/**
 * Génère les cartes de tranches de revenus ANAH pour l'écran 6 du stepper V2.
 *
 * Dynamique : les seuils sont calculés à partir des plafonds officiels 2026,
 * ajustés selon la taille du foyer et la zone (IDF / hors-IDF).
 */

import type { CategorieAnah } from './types'
import { getPlafondsAnah } from './baremes/anah-plafonds-client'

export interface RevenuCard {
  categorie: CategorieAnah
  label: string
  description: string
  seuilLabel: string
  color: string
  bgColor: string
  borderColor: string
  /** RFR milieu de tranche — envoyé au pipeline pour le calcul. */
  rfrMilieu: number
}

/**
 * Retourne 4 cartes de revenus avec seuils dynamiques.
 *
 * Les tranches :
 * - Bleu : 0 → plafond bleu
 * - Jaune : plafond bleu+1 → plafond jaune
 * - Violet : plafond jaune+1 → plafond violet
 * - Rose : > plafond violet
 */
export function getRevenusCards(foyer: number, idf: boolean): RevenuCard[] {
  const p = getPlafondsAnah(foyer, idf)

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)

  return [
    {
      categorie: 'bleu',
      label: 'Revenus très modestes',
      description: 'Vous bénéficiez des aides maximales',
      seuilLabel: `Jusqu'à ${fmt(p.bleu)} €`,
      color: 'text-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      rfrMilieu: Math.round(p.bleu / 2),
    },
    {
      categorie: 'jaune',
      label: 'Revenus modestes',
      description: 'Aides importantes disponibles',
      seuilLabel: `${fmt(p.bleu + 1)} – ${fmt(p.jaune)} €`,
      color: 'text-amber-800',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-400',
      rfrMilieu: Math.round((p.bleu + p.jaune) / 2),
    },
    {
      categorie: 'violet',
      label: 'Revenus intermédiaires',
      description: 'Aides partielles disponibles',
      seuilLabel: `${fmt(p.jaune + 1)} – ${fmt(p.violet)} €`,
      color: 'text-purple-800',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-400',
      rfrMilieu: Math.round((p.jaune + p.violet) / 2),
    },
    {
      categorie: 'rose',
      label: 'Revenus supérieurs',
      description: 'Aides réduites, prêts à taux zéro possibles',
      seuilLabel: `Plus de ${fmt(p.violet)} €`,
      color: 'text-pink-800',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-400',
      rfrMilieu: Math.round(p.violet * 1.3),
    },
  ]
}
