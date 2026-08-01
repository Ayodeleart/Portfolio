import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Octopus Fur',
  description: 'Art meets development. Portfolio of Octopus Fur.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
