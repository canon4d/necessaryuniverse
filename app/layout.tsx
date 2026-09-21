import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import 'katex/dist/katex.min.css'
import './globals.css'
import Header from '@/components/Header'
import ReaderChrome from '@/components/ReaderChrome'
import { papers, SITE } from '@/lib/papers'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.origin),
  title: { default: `${SITE.name} — a three-paper series`, template: `%s — ${SITE.name}` },
  description:
    'Three papers deriving the shape of the universe from the law of identity: the ontological argument, the topological classification, and the conditional dynamics.',
  authors: [{ name: SITE.author }],
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/assets/favicon.svg', type: 'image/svg+xml' },
      { url: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/assets/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} — a three-paper series`,
    description: SITE.tagline,
    url: SITE.origin,
    images: [{ url: '/assets/og-card.png', width: 1200, height: 630, alt: SITE.tagline }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.tagline,
    images: ['/assets/og-card.png'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eeefea' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1418' },
  ],
}

// Google Analytics 4 measurement ID.
const GA_ID = 'G-3GRK4FC3E9'

/* Applied before first paint so the chosen theme never flashes. */
const THEME_BOOT = `(function(){try{var s=localStorage.getItem('nu-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',s||(m?'dark':'light'));}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <ReaderChrome />
        <Header />
        <main id="main">{children}</main>

        <footer className="site-foot">
          <div className="shell">
            <div className="foot-grid">
              <div>
                <h2>The series</h2>
                <ul>
                  {papers.map((p) => (
                    <li key={p.id}>
                      <Link href={`/${p.id}`}>
                        {p.numeral}. {p.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/argument">The argument in one page</Link>
                  </li>
                  <li>
                    <Link href="/podcasts">Listen to the series</Link>
                  </li>
                </ul>
              </div>

              <div>
                <h2>Full text</h2>
                <ul>
                  {papers.map((p) => (
                    <li key={p.id}>
                      <a href={p.pdf}>{p.title} (PDF)</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2>Record</h2>
                <ul>
                  {papers.map((p) => (
                    <li key={p.id}>
                      <a href={p.doiUrl} target="_blank" rel="noreferrer noopener">
                        DOI, Document {p.numeral}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="foot-note">
              {SITE.name} is an independent research series by {SITE.author}, deposited on Zenodo and
              published here in full. {SITE.version}, {SITE.year}. The text on this site is generated
              directly from the LaTeX sources, so the web and PDF editions carry the same numbering
              for every section, statement and equation.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}