import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Superblog',
  description: 'Real estate blog SaaS starter'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
