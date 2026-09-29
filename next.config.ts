import type { NextConfig } from 'next'

/**
 * Fully static output: `next build` writes a self-contained site to ./out
 * that can be served from GitHub Pages, Netlify, Cloudflare Pages, Vercel,
 * S3, or any plain web server. No Node runtime is required in production.
 *
 * If you deploy to a GitHub Pages *project* site (username.github.io/repo),
 * set BASE_PATH=/repo in the build environment.
 */
const basePath = process.env.BASE_PATH || ''

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default nextConfig
