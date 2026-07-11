import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/providers/QueryProvider';
import GuestAuth from '@/components/providers/GuestAuth';
import './globals.css';

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
        <QueryProvider>
          <GuestAuth>
            {children}
          </GuestAuth>
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
