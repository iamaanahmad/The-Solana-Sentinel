import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SolanaWalletProvider } from '@/providers/wallet-provider';

export const metadata: Metadata = {
  title: 'The Solana Sentinel - AI-Powered Token Risk Analysis',
  description: 'AI-powered risk analysis for Solana tokens. Get comprehensive on-chain forensics, sentiment analysis, and real-time alerts with x402 protocol integration.',
  keywords: ['Solana', 'Token Analysis', 'Risk Assessment', 'Blockchain', 'Crypto', 'x402', 'AI'],
  authors: [{ name: 'The Solana Sentinel Team' }],
  openGraph: {
    title: 'The Solana Sentinel',
    description: 'AI-powered risk analysis for Solana tokens',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></link>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e293b" />
      </head>
      <body className="font-body antialiased">
        <SolanaWalletProvider>
          {children}
          <Toaster />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
