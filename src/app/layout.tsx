import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AcadMatch — Academic Research Collaboration',
  description: 'Connect with researchers and professors for interdisciplinary collaboration',
  keywords: ['academic', 'research', 'collaboration', 'professor', 'PhD', 'university'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-slate-950 text-slate-100 font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
