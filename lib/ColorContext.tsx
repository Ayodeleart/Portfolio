'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export const PALETTE = [
  { name: 'orange', hex: '#FF4C00' },
  { name: 'violet', hex: '#7C3AED' },
  { name: 'blue', hex: '#0EA5E9' },
  { name: 'green', hex: '#10B981' },
  { name: 'pink', hex: '#F43F5E' },
  { name: 'yellow', hex: '#FACC15' },
  { name: 'red', hex: '#EF4444' },
  { name: 'teal', hex: '#14B8A6' },
  { name: 'indigo', hex: '#6366F1' },
  { name: 'lime', hex: '#84CC16' },
  { name: 'cyan', hex: '#06B6D4' },
  { name: 'purple', hex: '#A855F7' },
  { name: 'amber', hex: '#F59E0B' },
  { name: 'rose', hex: '#FB7185' },
  { name: 'emerald', hex: '#059669' },
] as const;

type ColorContextValue = {
  color: string;
  cycle: () => void;
};

const ColorContext = createContext<ColorContextValue | null>(null);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const color = PALETTE[index].hex;

  const cycle = () => setIndex((prev) => (prev + 1) % PALETTE.length);

  // Keep the theme-color meta tag in sync (helps browsers that do respect
  // live updates, e.g. Android Chrome). The safe-area overlay in Header
  // covers the iOS case where this alone isn't reliably repainted.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }, [color]);

  return <ColorContext.Provider value={{ color, cycle }}>{children}</ColorContext.Provider>;
}

export function useColor() {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error('useColor must be used within ColorProvider');
  return ctx;
}
