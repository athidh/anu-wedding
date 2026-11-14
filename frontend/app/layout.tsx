import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://anu-wedding-invitation.onrender.com'),
  title: 'Anusmithin weds Vijithra',
  description: 'Sunday, 13 December 2026 · Palakkad. Tap to open the invitation.',
  alternates: {
    canonical: 'https://anu-wedding-invitation.onrender.com/',
  },
  openGraph: {
    type: 'website',
    url: 'https://anu-wedding-invitation.onrender.com/',
    title: 'Anusmithin weds Vijithra',
    description: 'Sunday, 13 December 2026 · Palakkad. Tap to open the invitation.',
    siteName: 'Anusmithin weds Vijithra',
    images: [
      {
        url: 'https://anu-wedding-invitation.onrender.com/preview.jpg',
        width: 1200,
        height: 630,
        alt: 'Anusmithin weds Vijithra',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anusmithin weds Vijithra',
    description: 'Sunday, 13 December 2026 · Palakkad. Tap to open the invitation.',
    images: ['https://anu-wedding-invitation.onrender.com/preview.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#f6f1e7',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Anusmithin weds Vijithra" />
        <meta property="og:description" content="Sunday, 13 December 2026 · Palakkad. Tap to open the invitation." />
        <meta property="og:url" content="https://anu-wedding-invitation.onrender.com/" />
        <meta property="og:image" content="https://anu-wedding-invitation.onrender.com/preview.jpg" />
        <meta property="og:image:secure_url" content="https://anu-wedding-invitation.onrender.com/preview.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Anusmithin weds Vijithra" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Anusmithin weds Vijithra" />
        <meta name="twitter:description" content="Sunday, 13 December 2026 · Palakkad. Tap to open the invitation." />
        <meta name="twitter:image" content="https://anu-wedding-invitation.onrender.com/preview.jpg" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
