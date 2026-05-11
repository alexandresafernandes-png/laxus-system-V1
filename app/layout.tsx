import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientWrapper from '@/components/ClientWrapper';

export const metadata: Metadata = {
  title: 'LAXUS SYSTEM',
  description: 'Level up your real life',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LAXUS',
  },
};

export const viewport: Viewport = {
  themeColor: '#080810',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
