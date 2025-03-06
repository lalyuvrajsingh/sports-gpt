import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  themeColor: '#18181B',
};

export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Sports GPT - Cricket AI Assistant',
  description: 'Your AI assistant for cricket statistics and real-time updates. Get instant access to cricket stats, match details, and player information.',
  keywords: 'cricket, AI, statistics, sports, cricket stats, live scores',
  authors: [{ name: 'Sports GPT Team' }],
  openGraph: {
    title: 'Sports GPT - Cricket AI Assistant',
    description: 'Your AI assistant for cricket statistics and real-time updates',
    type: 'website',
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
  },
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
      </body>
    </html>
  );
}
