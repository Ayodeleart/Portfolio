import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Octopus Fur',
  description: 'Art meets development. Portfolio of Octopus Fur.',
  manifest: '/manifest.json',
  themeColor: '#FF4C00',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
