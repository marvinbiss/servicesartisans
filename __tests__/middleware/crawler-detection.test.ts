/**
 * Tests CRAWLER_RE — couverture UA réelles bots LLM/SEO prod.
 *
 * Source UA strings : docs officielles + robotstxt.com (vérifiés 2026-05-22) :
 * - OpenAI : https://platform.openai.com/docs/bots
 * - Anthropic : https://docs.anthropic.com/en/docs/agents-and-tools/web-search
 * - Perplexity : https://docs.perplexity.ai/guides/bots
 * - Mistral : https://docs.mistral.ai/capabilities/web-search
 * - Amazon : https://developer.amazon.com/amazonbot
 * - Meta : https://developers.facebook.com/docs/sharing/webmasters/crawler
 * - You.com : https://about.you.com/youbot
 * - Apple : https://support.apple.com/en-us/119829
 * - CommonCrawl : https://commoncrawl.org/faq
 * - Google : https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
 *
 * Pourquoi ce test : audit 2026-04-30 a étendu CRAWLER_RE avec Claude-SearchBot,
 * MistralBot, Amazonbot, Meta-ExternalAgent, YouBot, Applebot-Extended.
 * Couper ces bots = perdre indexation moteurs LLM (10% trafic search en 2026).
 * On vérifie qu'ils sont effectivement matchés et que les humains ne le sont pas.
 */

import { describe, it, expect } from 'vitest'
import { CRAWLER_RE } from '@/middleware'

const REAL_BOT_UA: Record<string, string> = {
  // OpenAI
  GPTBot:
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot',
  'OAI-SearchBot':
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
  'ChatGPT-User':
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',

  // Anthropic
  ClaudeBot: 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
  'Claude-SearchBot':
    'Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +https://anthropic.com/claudebot)',
  'Claude-User': 'Mozilla/5.0 (compatible; Claude-User/1.0; +https://anthropic.com)',
  'anthropic-ai': 'Mozilla/5.0 (compatible; anthropic-ai/1.0; +https://anthropic.com)',

  // Perplexity
  PerplexityBot:
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot',

  // Mistral
  MistralBot: 'Mozilla/5.0 (compatible; MistralBot/1.0; +https://mistral.ai/bot)',
  'Mistralai-User': 'Mozilla/5.0 (compatible; Mistralai-User/1.0; +https://mistral.ai)',

  // Amazon
  Amazonbot:
    'Mozilla/5.0 (compatible; Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)',

  // Meta
  'Meta-ExternalAgent':
    'Mozilla/5.0 (compatible; meta-externalagent/1.1 +https://developers.facebook.com/docs/sharing/webmasters/crawler)',

  // You.com
  YouBot: 'Mozilla/5.0 (compatible; YouBot (+http://www.you.com))',

  // Apple
  'Applebot-Extended': 'Mozilla/5.0 (compatible; Applebot-Extended/0.1)',

  // CommonCrawl — alimente la majorité des datasets training LLM (GPT/Claude/Mistral).
  CCBot: 'CCBot/2.0 (https://commoncrawl.org/faq/)',

  // SEO tools
  AhrefsBot: 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
  SemrushBot: 'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
  MJ12bot: 'Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)',

  // Classic search engines
  Googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  Bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
}

const HUMAN_UA = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
]

describe('CRAWLER_RE — bot detection coverage', () => {
  describe('LLM / SEO / search-engine bot UA strings match', () => {
    for (const [name, ua] of Object.entries(REAL_BOT_UA)) {
      it(`matches ${name}`, () => {
        expect(CRAWLER_RE.test(ua)).toBe(true)
      })
    }
  })

  describe('Human browser UA strings do NOT match', () => {
    HUMAN_UA.forEach((ua, idx) => {
      it(`does not match human UA #${idx + 1}`, () => {
        expect(CRAWLER_RE.test(ua)).toBe(false)
      })
    })
  })

  describe('Edge cases', () => {
    it('empty string does not match', () => {
      expect(CRAWLER_RE.test('')).toBe(false)
    })

    it('lowercase bot name matches (regex is case-insensitive)', () => {
      expect(CRAWLER_RE.test('claudebot')).toBe(true)
      expect(CRAWLER_RE.test('ahrefsbot')).toBe(true)
      expect(CRAWLER_RE.test('perplexitybot')).toBe(true)
      expect(CRAWLER_RE.test('gptbot')).toBe(true)
      expect(CRAWLER_RE.test('ccbot')).toBe(true)
    })

    it('regex is case-insensitive (has /i flag)', () => {
      expect(CRAWLER_RE.flags).toContain('i')
    })
  })
})
