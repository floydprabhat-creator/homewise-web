import type { Metadata } from 'next';
import { Pacifico, Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { themeInitScript } from '@/lib/theme';
import { Providers } from './providers';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });
const pacifico = Pacifico({ subsets: ['latin'], weight: '400', variable: '--font-pacifico' });

export const metadata: Metadata = {
  title: 'HomeWise',
  description: 'Household budgeting, spending and bills',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme script sets data-theme before React hydrates, so the attribute may differ from the server HTML.
    <html lang="en" className={`${jakarta.variable} ${pacifico.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
