import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/papers'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: 'Necessary Universe',
    description: SITE.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#eeefea',
    theme_color: '#eeefea',
    icons: [
      { src: '/assets/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
