import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CREWcasts Performance | Skdiv.Studios',
  description: 'Live performance dashboard for CREWcasts, produced at Skdiv.Studios.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
