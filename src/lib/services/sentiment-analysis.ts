/**
 * Sentiment Analysis Service
 * French NLP-based sentiment analysis for reviews
 */

import { logger } from '@/lib/logger'

export interface SentimentResult {
  score: number // -1 to 1
  label: 'positive' | 'neutral' | 'negative' | 'mixed'
  confidence: number // 0 to 1
  keywords: string[]
  topics: Record<string, number> // {quality: 0.8, price: -0.2}
  language: string
}

// French positive words
const POSITIVE_WORDS = new Set([
  'excellent', 'parfait', 'super', 'génial', 'formidable', 'extraordinaire',
  'magnifique', 'incroyable', 'merveilleux', 'fantastique', 'remarquable',
  'impeccable', 'irréprochable', 'exceptionnel', 'satisfait', 'content',
  'heureux', 'ravi', 'enchanté', 'recommande', 'professionnel', 'ponctuel',
  'rapide', 'efficace', 'soigné', 'propre', 'qualité', 'compétent',
  'sérieux', 'fiable', 'courtois', 'aimable', 'sympathique', 'agréable',
  'attentif', 'disponible', 'réactif', 'consciencieux', 'méticuleux',
  'bravo', 'merci', 'top', 'nickel', 'parfaitement', 'superbe',
  'bien', 'bon', 'bonne', 'très bien', 'très bon', 'vraiment bien',
])

// French negative words
const NEGATIVE_WORDS = new Set([
  'nul', 'mauvais', 'horrible', 'terrible', 'catastrophique', 'désastreux',
  'décevant', 'déçu', 'insatisfait', 'mécontent', 'inacceptable', 'inadmissible',
  'arnaque', 'escroc', 'voleur', 'incompétent', 'amateur', 'négligent',
  'sale', 'bâclé', 'mal fait', 'retard', 'en retard', 'absent',
  'impoli', 'désagréable', 'agressif', 'malhonnête', 'menteur',
  'cher', 'trop cher', 'surfacturé', 'abusif', 'jamais', 'problème',
  'problèmes', 'défaut', 'défauts', 'panne', 'cassé', 'abîmé',
  'éviter', 'déconseille', 'fuyez', 'attention', 'méfiance',
  'pas content', 'pas satisfait', 'mal', 'pas bien', 'dommage',
])

// French negation words (reverse sentiment)
const NEGATION_WORDS = new Set([
  'ne', 'pas', 'plus', 'jamais', 'rien', 'aucun', 'aucune',
  'sans', 'non', 'ni', 'personne', 'guère', 'nullement',
])

// Topic keywords mapping
const TOPIC_KEYWORDS: Record<string, string[]> = {
  quality: ['qualité', 'travail', 'finition', 'résultat', 'rendu', 'fait', 'réalisation'],
  price: ['prix', 'tarif', 'devis', 'coût', 'facture', 'payer', 'cher', 'économique'],
  punctuality: ['ponctuel', 'heure', 'retard', 'temps', 'délai', 'attente', 'rapide'],
  communication: ['communication', 'réponse', 'contact', 'joignable', 'appel', 'message', 'écoute'],
  cleanliness: ['propre', 'propreté', 'nettoyé', 'rangé', 'sale', 'saleté', 'déchets'],
  professionalism: ['professionnel', 'sérieux', 'compétent', 'expert', 'expérience', 'connaissance'],
}

// Intensifiers
const INTENSIFIERS: Record<string, number> = {
  'très': 1.5,
  'vraiment': 1.4,
  'extrêmement': 1.8,
  'incroyablement': 1.7,
  'absolument': 1.6,
  'totalement': 1.5,
  'complètement': 1.5,
  'particulièrement': 1.3,
  'assez': 0.8,
  'plutôt': 0.7,
  'un peu': 0.5,
  'légèrement': 0.6,
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents for matching
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(word => word.length > 1)
}

function extractKeywords(text: string, sentimentWords: Set<string>): string[] {
  const normalized = normalizeText(text)
  const tokens = tokenize(normalized)
  const keywords: string[] = []

  tokens.forEach(token => {
    if (sentimentWords.has(token) && !keywords.includes(token)) {
      keywords.push(token)
    }
  })

  // Also extract from original text (with accents) for display
  const originalTokens = tokenize(text.toLowerCase())
  return originalTokens.filter(token => {
    const normalizedToken = token.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return keywords.includes(normalizedToken)
  }).slice(0, 10)
}

function analyzeTopics(text: string): Record<string, number> {
  const normalized = normalizeText(text)
  const topics: Record<string, number> = {}

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    let topicScore = 0
    let topicMentions = 0

    keywords.forEach(keyword => {
      const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (normalized.includes(normalizedKeyword)) {
        topicMentions++

        // Find surrounding context for sentiment
        const index = normalized.indexOf(normalizedKeyword)
        const contextStart = Math.max(0, index - 50)
        const contextEnd = Math.min(normalized.length, index + normalizedKeyword.length + 50)
        const context = normalized.slice(contextStart, contextEnd)

        // Check sentiment in context
        let contextSentiment = 0
        POSITIVE_WORDS.forEach(pw => {
          if (context.includes(pw)) contextSentiment += 0.3
        })
        NEGATIVE_WORDS.forEach(nw => {
          if (context.includes(nw)) contextSentiment -= 0.3
        })

        topicScore += contextSentiment
      }
    })

    if (topicMentions > 0) {
      topics[topic] = Math.max(-1, Math.min(1, topicScore / topicMentions))
    }
  }

  return topics
}

function calculateSentimentScore(text: string): { score: number; confidence: number } {
  const normalized = normalizeText(text)
  const tokens = tokenize(normalized)

  let positiveCount = 0
  let negativeCount = 0
  let totalWeight = 0
  let currentIntensifier = 1

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const prevToken = i > 0 ? tokens[i - 1] : ''
    const prevPrevToken = i > 1 ? tokens[i - 2] : ''

    // Check for intensifiers
    if (INTENSIFIERS[token]) {
      currentIntensifier = INTENSIFIERS[token]
      continue
    }

    // Check for negation
    const hasNegation = NEGATION_WORDS.has(prevToken) || NEGATION_WORDS.has(prevPrevToken)

    if (POSITIVE_WORDS.has(token)) {
      if (hasNegation) {
        negativeCount += currentIntensifier
      } else {
        positiveCount += currentIntensifier
      }
      totalWeight += currentIntensifier
    } else if (NEGATIVE_WORDS.has(token)) {
      if (hasNegation) {
        positiveCount += currentIntensifier * 0.5 // Negated negatives are mildly positive
      } else {
        negativeCount += currentIntensifier
      }
      totalWeight += currentIntensifier
    }

    currentIntensifier = 1 // Reset intensifier
  }

  if (totalWeight === 0) {
    return { score: 0, confidence: 0.3 }
  }

  const score = (positiveCount - negativeCount) / totalWeight
  const confidence = Math.min(1, totalWeight / 5) // More sentiment words = higher confidence

  return {
    score: Math.max(-1, Math.min(1, score)),
    confidence: Math.max(0.3, confidence),
  }
}

function getSentimentLabel(score: number): 'positive' | 'neutral' | 'negative' | 'mixed' {
  if (score >= 0.3) return 'positive'
  if (score <= -0.3) return 'negative'
  if (Math.abs(score) < 0.1) return 'neutral'
  return 'mixed'
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    const { score, confidence } = calculateSentimentScore(text)
    const label = getSentimentLabel(score)
    const keywords = extractKeywords(text, label === 'positive' || label === 'mixed' ? POSITIVE_WORDS : NEGATIVE_WORDS)
    const topics = analyzeTopics(text)

    return {
      score: parseFloat(score.toFixed(3)),
      label,
      confidence: parseFloat(confidence.toFixed(3)),
      keywords,
      topics,
      language: 'fr',
    }
  } catch (error) {
    logger.error('Sentiment analysis error', error)
    return {
      score: 0,
      label: 'neutral',
      confidence: 0,
      keywords: [],
      topics: {},
      language: 'fr',
    }
  }
}

// Batch analysis for multiple reviews
export async function analyzeSentimentBatch(texts: string[]): Promise<SentimentResult[]> {
  return Promise.all(texts.map(text => analyzeSentiment(text)))
}

// Calculate average sentiment for a provider
export function calculateAverageSentiment(results: SentimentResult[]): {
  averageScore: number
  distribution: { positive: number; neutral: number; negative: number; mixed: number }
  topKeywords: string[]
  averageTopics: Record<string, number>
} {
  if (results.length === 0) {
    return {
      averageScore: 0,
      distribution: { positive: 0, neutral: 0, negative: 0, mixed: 0 },
      topKeywords: [],
      averageTopics: {},
    }
  }

  const distribution = { positive: 0, neutral: 0, negative: 0, mixed: 0 }
  const keywordCounts: Record<string, number> = {}
  const topicSums: Record<string, { sum: number; count: number }> = {}

  let totalScore = 0

  results.forEach(result => {
    totalScore += result.score
    distribution[result.label]++

    result.keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
    })

    Object.entries(result.topics).forEach(([topic, score]) => {
      if (!topicSums[topic]) {
        topicSums[topic] = { sum: 0, count: 0 }
      }
      topicSums[topic].sum += score
      topicSums[topic].count++
    })
  })

  const averageTopics: Record<string, number> = {}
  Object.entries(topicSums).forEach(([topic, data]) => {
    averageTopics[topic] = parseFloat((data.sum / data.count).toFixed(3))
  })

  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword]) => keyword)

  return {
    averageScore: parseFloat((totalScore / results.length).toFixed(3)),
    distribution,
    topKeywords,
    averageTopics,
  }
}

export default {
  analyzeSentiment,
  analyzeSentimentBatch,
  calculateAverageSentiment,
}
