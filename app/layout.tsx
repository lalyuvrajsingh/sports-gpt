import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport = {
  themeColor: '#18181B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: '%s | Sports GPT',
    default: 'Sports GPT - Cricket AI Assistant',
  },
  description: 'Your AI assistant for cricket statistics and real-time updates. Get instant access to cricket stats, match details, and player information.',
  keywords: ['cricket', 'AI', 'statistics', 'sports', 'cricket stats', 'live scores', 'cricket assistant', 'sports GPT', 'cricket data'],
  authors: [{ name: 'Sports GPT Team' }],
  creator: 'Sports GPT Team',
  publisher: 'Sports GPT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Sports GPT - Cricket AI Assistant',
    description: 'Your AI assistant for cricket statistics and real-time updates',
    url: '/',
    siteName: 'Sports GPT',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sports GPT',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sports GPT - Cricket AI Assistant',
    description: 'Your AI assistant for cricket statistics and real-time updates',
    images: ['/og-image.png'],
    creator: '@sportsgpt',
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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#5bbad5',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} dark`}>
      <body className="antialiased bg-zinc-900 text-zinc-100 selection:bg-blue-500/20 selection:text-blue-200">
        {children}
        
        {/* Analytics script - add your production analytics here */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                // Your analytics code here
                console.log('Analytics loaded in production mode');
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
