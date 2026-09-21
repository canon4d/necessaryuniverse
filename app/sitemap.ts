import type { MetadataRoute } from 'next'
import { papers, SITE } from '@/lib/papers'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${SITE.origin}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE.origin}/argument`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE.origin}/podcasts`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...papers.map((p) => ({
      url: `${SITE.origin}/${p.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
