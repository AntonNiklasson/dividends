import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dividend Portfolio Projector',
  description:
    'Project your dividend income for the next 3 years with DRIP reinvestment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-background">
          <header className="border-b shadow-sm">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold">
                Dividend Portfolio Projector
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Project your dividend income with DRIP reinvestment
              </p>
            </div>
          </header>
          <main className="container mx-auto px-0 sm:px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
