'use client';

import { useColor } from '@/lib/ColorContext';

export default function Header() {
  const { color, cycle } = useColor();

  return (
    <>
      {/* Paints the safe-area/notch region from page content, since iOS
          Safari doesn't reliably repaint its native chrome from a live
          theme-color mutation. */}
      <div
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-700"
        style={{ height: 'env(safe-area-inset-top)', backgroundColor: color }}
      />
      <header
        className="fixed left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 transition-colors duration-700"
        style={{ top: 'env(safe-area-inset-top)', backgroundColor: color }}
      >
        <span className="text-white tracking-[0.25em] text-sm font-medium">OCTOPUS FUR</span>
        <button
          onClick={cycle}
          aria-label="Switch color theme"
          className="group flex flex-col items-center gap-1"
        >
          <span className="w-16 h-[2px] bg-white/80 group-hover:bg-white transition-colors" />
          <span className="text-[11px] tracking-[0.3em] text-white/80 uppercase">Menu</span>
        </button>
        <span className="text-white tracking-[0.25em] text-sm font-medium cursor-pointer">
          CONTACT
        </span>
      </header>
    </>
  );
}
