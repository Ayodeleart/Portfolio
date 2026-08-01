import type { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#FF4C00',
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}
