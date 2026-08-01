import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Octopus Fur',
  description: 'Art meets development. Portfolio of Octopus Fur.',
  manifest: '/manifest.json',
  themeColor: '#FF4C00',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Octopus Fur',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ruslan+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
