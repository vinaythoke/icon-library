import '@/styles/globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import Head from 'next/head';
import { useEffect } from 'react';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Font optimization with automatic self-hosting and caching
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Use 'swap' for best performance
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600'], // Semibold weight
  display: 'swap',
  variable: '--font-space-grotesk',
});

export default function App({ Component, pageProps }) {
  // Register service worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load PWA script after component mounts
      const script = document.createElement('script');
      script.src = '/pwa.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        // Clean up on unmount
        document.body.removeChild(script);
      };
    }
  }, []);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#FF5350" />
        <meta name="description" content="Browse, search, and download icons from the comprehensive Sarvārth Icon Library" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sarvārth Icon Library" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/app/apple-icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/app/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/app/favicon-16x16.png" />
      </Head>
      <div className={`${inter.variable} ${spaceGrotesk.variable} flex flex-col min-h-screen bg-gray-50`}>
        <Header />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </>
  );
} 