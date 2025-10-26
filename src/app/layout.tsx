// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css'; // ✅ чухал

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: { default: 'Memories', template: '%s · Memories' },
  description: 'Photos & Videos you two love',
  themeColor: '#0f1635',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
