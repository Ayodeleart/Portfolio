import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Octopus Fur Admin',
  manifest: '/admin-manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OF Admin',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
