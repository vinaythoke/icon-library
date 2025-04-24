import '@/styles/globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';

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
  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <Component {...pageProps} />
    </div>
  );
} 