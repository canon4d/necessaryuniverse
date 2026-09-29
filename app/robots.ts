import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/papers'

export const dynamic = 'force-static'

/**
 * Every crawler is allowed everywhere on this site — there is nothing here
 * that benefits from being hidden from search engines or AI systems; the
 * whole point of publishing is to be read, cited, and checked.
 *
 * The bare `userAgent: '*'` rule below is sufficient on its own: a robots.txt
 * parser falls back to the wildcard group for any crawler that has no
 * dedicated section. The named groups are listed anyway, for two reasons:
 *  1. it makes the policy auditable at a glance instead of implicit, and
 *  2. it means a future edit narrowing one group can't accidentally narrow
 *     every crawler that isn't named yet.
 *
 * Nothing here is blocked. If you ever want to opt a specific crawler out,
 * add a `disallow` rule for it explicitly rather than removing it from these
 * lists — removing it just returns it to the wildcard `allow: '/'` group.
 */

// General-purpose search engines.
const SEARCH_ENGINES = [
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  'Slurp', // Yahoo
  'YandexBot',
  'Baiduspider',
  'Yeti', // Naver
  'SeznamBot',
  'Qwantify',
  'Sogou',
  'ia_archiver', // Internet Archive
]

// AI assistants, answer engines, and the crawlers that build their training
// and retrieval indexes. Grouped separately from search engines only for
// readability; the permission is identical.
const AI_CRAWLERS = [
  'GPTBot', // OpenAI — training
  'ChatGPT-User', // OpenAI — live browsing for a ChatGPT user
  'OAI-SearchBot', // OpenAI — search
  'ClaudeBot', // Anthropic — training & retrieval
  'anthropic-ai', // Anthropic
  'Claude-User', // Anthropic — live browsing for a Claude user
  'Claude-SearchBot', // Anthropic — search
  'PerplexityBot', // Perplexity — index
  'Perplexity-User', // Perplexity — live browsing
  'Google-Extended', // Google — Gemini training (separate from Googlebot)
  'Applebot-Extended', // Apple — Apple Intelligence training (separate from Applebot)
  'CCBot', // Common Crawl — widely used as LLM training data
  'Bytespider', // ByteDance
  'Amazonbot', // Amazon
  'Meta-ExternalAgent', // Meta AI
  'Diffbot',
  'cohere-ai',
  'DuckAssistBot', // DuckDuckGo AI answers
  'MistralAI-User', // Mistral — live browsing
  'Meta-ExternalFetcher', // Meta AI — user-triggered fetch
  'FacebookBot',
  'YouBot', // You.com
  'PetalBot', // Huawei
  'Ai2Bot', // Allen Institute
  'Google-CloudVertexBot',
  'Timpibot',
  'omgili',
  'ImagesiftBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: SEARCH_ENGINES, allow: '/' },
      { userAgent: AI_CRAWLERS, allow: '/' },
    ],
    sitemap: `${SITE.origin}/sitemap.xml`,
  }
}
