import type { MetadataRoute } from 'next'
import { papers, SITE } from '@/lib/papers'

export const dynamic = 'force-static'

/**
 * `lastModified` is intentionally omitted here rather than stamped with the
 * build time. Every static-export build re-runs regardless of whether a
 * page's content actually changed, so setting `lastModified: new Date()` on
 * every entry would claim a content change on every deploy — including
 * deploys that only touched, say, this file. Search engines are explicit
 * that an inaccurate `lastmod` is worse than none: it trains the crawler to
 * distrust the signal. Leaving it out lets Google/Bing fall back to their
 * own crawl history, which is honest by construction. If a genuine
 * publication or revision date is ever tracked per document, add it back
 * here from that data rather than from `Date.now()`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.origin}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE.origin}/argument`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE.origin}/podcasts`, changeFrequency: 'monthly', priority: 0.7 },
    ...papers.map((p) => ({
      url: `${SITE.origin}/${p.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
