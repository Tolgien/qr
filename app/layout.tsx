import type { Metadata, Viewport } from 'next'
import { Inter, Caveat, Whisper, Birthstone, Style_Script, Poppins } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
})
const whisper = Whisper({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-whisper',
  display: 'swap',
})
const birthstone = Birthstone({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-birthstone',
  display: 'swap',
})
const styleScript = Style_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-style-script',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'QRim.net - Dijital Restoran Menüsü | QR Kod ile Temassız Sipariş',
  description: 'QRim.net ile restoranınızı dijitalleştirin! Temassız sipariş, anlık menü güncelleme, çoklu dil desteği. Ücretsiz deneyin, kurulum 5 dakika. Türkiye\'nin en çok tercih edilen QR menü sistemi.',
  authors: [{ name: 'QRim.net', url: 'https://qrim.net' }],
  publisher: 'QRim.net',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-qrim.png',
    apple: '/logo-qrim.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QRim.net - Dijital Restoran Sistemi',
  },
  openGraph: {
    title: 'QRim.net - Dijital Restoran Menüsü | Temassız Sipariş',
    description: 'QRim.net ile restoranınızı dijitalleştirin! Anlık güncelleme, çoklu dil, kolay sipariş. 5 dakikada kurulum, ücretsiz deneyin.',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'QRim.net',
    url: 'https://qrim.net',
    images: [
      {
        url: 'https://qrim.net/logo-qrim.png',
        width: 1200,
        height: 630,
        alt: 'QRim.net - Dijital Restoran Menüsü',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QRim.net - Dijital Restoran Menüsü',
    description: 'QRim.net ile restoranınızı dijitalleştirin! Temassız sipariş, anlık güncelleme, çoklu dil desteği.',
    site: '@qrim',
    creator: '@qrim',
    images: ['https://qrim.net/logo-qrim.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://qrim.net',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} ${poppins.variable} ${caveat.variable} ${whisper.variable} ${birthstone.variable} ${styleScript.variable}`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}