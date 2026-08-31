import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { PwaUpdater } from '@/components/PwaUpdater';
import { OfflineSyncListener } from '@/components/offline/OfflineSyncListener';

export const metadata: Metadata = {
  metadataBase: new URL('https://xaviaerox.github.io'),
  title: 'MIRATEA 🌟 — Autonomía y Autorregulación Familiar',
  description: 'Un espacio seguro, amable y libre de juicios para crecer juntos a través de la autorregulación emocional y el refuerzo positivo.',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'MIRATEA' },
  openGraph: {
    title: 'MIRATEA 🌟 — Crecimiento y Autorregulación Familiar',
    description: 'Plataforma inteligente y amable para apoyar la autonomía de niños neurodivergentes.',
    url: 'https://xaviaerox.github.io/miratea',
    siteName: 'MIRATEA',
    images: [{ url: 'https://xaviaerox.github.io/miratea/mira-banner.jpg', width: 1200, height: 630, alt: 'MIRATEA Hero Banner' }],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MIRATEA 🌟 — Crecimiento y Autorregulación Familiar',
    description: 'Plataforma inteligente y amable para apoyar la autonomía de niños neurodivergentes.',
    images: ['https://xaviaerox.github.io/miratea/mira-banner.jpg'],
  },
  icons: {
    icon: [
      { url: '/miratea/icon.svg', type: 'image/svg+xml' },
      { url: '/miratea/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/miratea/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/miratea/favicon.ico',
    apple: '/miratea/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#faf9f7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="icon" href="/miratea/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/miratea/icon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="shortcut icon" href="/miratea/favicon.ico" />
        <link rel="apple-touch-icon" href="/miratea/icon-192x192.png" />
      </head>
      <body className="h-full antialiased font-body bg-background text-text-primary">
        <Providers>
          {children}
        </Providers>
        <OfflineSyncListener />
        <PwaUpdater />
      </body>
    </html>
  );
}
