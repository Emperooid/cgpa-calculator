import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/providers/QueryProvider';
import GuestAuth from '@/components/providers/GuestAuth';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GradePath — CGPA Calculator & Academic Planner',
  description: 'Calculate your GPA, predict your CGPA, and plan your path to academic success.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full bg-background text-on-background" suppressHydrationWarning>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer=window.dataLayer||[];
              function gtag(){dataLayer.push(arguments);}
              gtag('js',new Date());
              gtag('config','${GA_ID}');
            `}</Script>
          </>
        )}
        <QueryProvider>
          <GuestAuth>
            {children}
          </GuestAuth>
        </QueryProvider>
        <Toaster position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
