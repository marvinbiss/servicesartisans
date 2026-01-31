/**
 * No-Show Prediction System - ServicesArtisans
 * Predicts likelihood of no-shows and suggests preventive measures
 * Based on industry research: reduces no-shows by up to 50%
 */

export interface ClientRiskFactors {
  previousNoShows: number
  totalBookings: number
  lastMinuteBookings: number
  cancelledBookings: number
  avgLeadTime: number // Days between booking and appointment
  hasPaymentOnFile: boolean
  isVerifiedEmail: boolean
  isVerifiedPhone: boolean
  lastBookingDate?: string
  accountAge: number // Days since registration
}

export interface BookingRiskFactors {
  leadTimeDays: number // Days until appointment
  isWeekend: boolean
  isHoliday: boolean
  timeSlot: 'early_morning' | 'morning' | 'afternoon' | 'evening'
  hasDeposit: boolean
  depositPercentage: number
  remindersSent: number
  confirmationReceived: boolean
}

export interface RiskAssessment {
  score: number // 0-100 (higher = more likely to no-show)
  level: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
  recommendations: string[]
}

// Weight factors based on research
const WEIGHTS = {
  previousNoShows: 25, // Major predictor
  noShowRate: 15,
  lastMinuteBooking: 10,
  longLeadTime: 10,
  newClient: 8,
  noPayment: 12,
  unverifiedContact: 8,
  weekendSlot: 5,
  earlyMorningSlot: 5,
  noReminders: 7,
  noConfirmation: 10,
}

// Calculate client risk score
function calculateClientRisk(factors: ClientRiskFactors): {
  score: number
  contributions: string[]
} {
  let score = 0
  const contributions: string[] = []

  // Previous no-shows (strongest predictor)
  if (factors.previousNoShows > 0) {
    const noShowImpact = Math.min(factors.previousNoShows * 15, 40)
    score += noShowImpact
    contributions.push(`${factors.previousNoShows} non-présentations précédentes`)
  }

  // No-show rate
  if (factors.totalBookings > 2) {
    const noShowRate = factors.previousNoShows / factors.totalBookings
    if (noShowRate > 0.2) {
      score += WEIGHTS.noShowRate
      contributions.push(`Taux de non-présentation: ${Math.round(noShowRate * 100)}%`)
    }
  }

  // New client (no history)
  if (factors.totalBookings === 0) {
    score += WEIGHTS.newClient
    contributions.push('Nouveau client (pas d\'historique)')
  }

  // Last minute bookings pattern
  if (
    factors.lastMinuteBookings > 2 &&
    factors.lastMinuteBookings / factors.totalBookings > 0.3
  ) {
    score += WEIGHTS.lastMinuteBooking
    contributions.push('Tendance aux réservations de dernière minute')
  }

  // No payment method on file
  if (!factors.hasPaymentOnFile) {
    score += WEIGHTS.noPayment
    contributions.push('Aucun moyen de paiement enregistré')
  }

  // Unverified contact
  if (!factors.isVerifiedEmail && !factors.isVerifiedPhone) {
    score += WEIGHTS.unverifiedContact
    contributions.push('Email et téléphone non vérifiés')
  }

  // Account age (newer accounts = higher risk)
  if (factors.accountAge < 30) {
    score += 5
    contributions.push('Compte récent')
  }

  return { score, contributions }
}

// Calculate booking-specific risk
function calculateBookingRisk(factors: BookingRiskFactors): {
  score: number
  contributions: string[]
} {
  let score = 0
  const contributions: string[] = []

  // Long lead time (>14 days = higher risk)
  if (factors.leadTimeDays > 14) {
    score += WEIGHTS.longLeadTime
    contributions.push(`Réservation très anticipée (${factors.leadTimeDays} jours)`)
  }

  // Weekend appointments
  if (factors.isWeekend) {
    score += WEIGHTS.weekendSlot
    contributions.push('Rendez-vous le week-end')
  }

  // Early morning slots (higher no-show rate)
  if (factors.timeSlot === 'early_morning') {
    score += WEIGHTS.earlyMorningSlot
    contributions.push('Créneau tôt le matin')
  }

  // No deposit
  if (!factors.hasDeposit) {
    score += WEIGHTS.noPayment * 0.5
    contributions.push('Pas d\'acompte versé')
  }

  // Low deposit percentage
  if (factors.hasDeposit && factors.depositPercentage < 20) {
    score += 5
    contributions.push('Acompte faible')
  }

  // No reminders sent
  if (factors.remindersSent === 0) {
    score += WEIGHTS.noReminders
    contributions.push('Aucun rappel envoyé')
  }

  // No confirmation received
  if (!factors.confirmationReceived && factors.remindersSent > 0) {
    score += WEIGHTS.noConfirmation
    contributions.push('Pas de confirmation reçue')
  }

  return { score, contributions }
}

// Generate recommendations based on risk level
function generateRecommendations(
  riskLevel: RiskAssessment['level'],
  clientFactors: ClientRiskFactors,
  bookingFactors: BookingRiskFactors
): string[] {
  const recommendations: string[] = []

  // Always recommend reminders
  if (bookingFactors.remindersSent < 2) {
    recommendations.push('Envoyer un rappel SMS 24h avant le RDV')
    recommendations.push('Envoyer un rappel email 48h avant')
  }

  // High risk: require deposit
  if (riskLevel === 'high' || riskLevel === 'critical') {
    if (!bookingFactors.hasDeposit) {
      recommendations.push('Demander un acompte de 30% minimum')
    }

    if (!clientFactors.isVerifiedPhone) {
      recommendations.push('Vérifier le numéro de téléphone')
    }

    recommendations.push('Appeler le client pour confirmer le RDV')
  }

  // Medium risk
  if (riskLevel === 'medium') {
    if (!bookingFactors.hasDeposit) {
      recommendations.push('Proposer le paiement d\'un acompte')
    }
    recommendations.push('Envoyer un rappel supplémentaire 1h avant')
  }

  // Long lead time
  if (bookingFactors.leadTimeDays > 7) {
    recommendations.push('Envoyer un rappel intermédiaire 3 jours avant')
  }

  // New client
  if (clientFactors.totalBookings === 0) {
    recommendations.push('Envoyer un message de bienvenue personnalisé')
  }

  // Repeat no-show offender
  if (clientFactors.previousNoShows >= 2) {
    recommendations.push('Exiger un acompte non remboursable')
    recommendations.push('Considérer un paiement intégral à l\'avance')
  }

  return recommendations.slice(0, 5) // Max 5 recommendations
}

// Main assessment function
export function assessNoShowRisk(
  clientFactors: ClientRiskFactors,
  bookingFactors: BookingRiskFactors
): RiskAssessment {
  const clientRisk = calculateClientRisk(clientFactors)
  const bookingRisk = calculateBookingRisk(bookingFactors)

  // Combined score (weighted average)
  const totalScore = Math.min(
    100,
    Math.round(clientRisk.score * 0.6 + bookingRisk.score * 0.4)
  )

  // Determine risk level
  let level: RiskAssessment['level']
  if (totalScore >= 70) {
    level = 'critical'
  } else if (totalScore >= 50) {
    level = 'high'
  } else if (totalScore >= 25) {
    level = 'medium'
  } else {
    level = 'low'
  }

  const factors = [...clientRisk.contributions, ...bookingRisk.contributions]
  const recommendations = generateRecommendations(level, clientFactors, bookingFactors)

  return {
    score: totalScore,
    level,
    factors,
    recommendations,
  }
}

// Quick risk check (simplified version)
export function quickRiskCheck(
  previousNoShows: number,
  hasDeposit: boolean,
  leadTimeDays: number
): 'low' | 'medium' | 'high' {
  if (previousNoShows >= 2 && !hasDeposit) return 'high'
  if (previousNoShows >= 1 || (leadTimeDays > 14 && !hasDeposit)) return 'medium'
  return 'low'
}

// Calculate optimal deposit amount based on risk
export function calculateRecommendedDeposit(
  riskLevel: RiskAssessment['level'],
  servicePrice: number
): number {
  const percentages: Record<RiskAssessment['level'], number> = {
    low: 0,
    medium: 20,
    high: 30,
    critical: 50,
  }

  const percentage = percentages[riskLevel]
  return Math.ceil(servicePrice * (percentage / 100))
}

// Overbooking recommendations based on historical data
export function calculateOverbookingFactor(
  historicalNoShowRate: number,
  slotCapacity: number
): { recommendedOverbook: number; confidence: string } {
  // Only recommend overbooking if no-show rate is significant
  if (historicalNoShowRate < 0.1) {
    return { recommendedOverbook: 0, confidence: 'N/A - Taux de non-présentation faible' }
  }

  // Conservative overbooking formula
  const overbook = Math.floor(slotCapacity * historicalNoShowRate * 0.8)

  return {
    recommendedOverbook: Math.min(overbook, 2), // Max 2 extra bookings
    confidence:
      historicalNoShowRate > 0.2 ? 'Élevée' : historicalNoShowRate > 0.15 ? 'Moyenne' : 'Faible',
  }
}
