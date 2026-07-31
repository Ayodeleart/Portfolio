'use client';

export const PALETTE = [
  { name: 'orange', hex: '#FF4C00' },
  { name: 'violet', hex: '#7C3AED' },
  { name: 'blue', hex: '#0EA5E9' },
  { name: 'green', hex: '#10B981' },
  { name: 'pink', hex: '#F43F5E' },
  { name: 'yellow', hex: '#FACC15' },
] as const;

export default function ColorSwitcher({
  index,
  onSwitch,
}: {
  index: number;
  onSwitch: () => void;
}) {
  return (
    <button
      onClick={onSwitch}
      aria-label="Switch color theme"
      className="group flex flex-col items-center gap-1 mx-auto"
    >
      <span className="w-16 h-[2px] bg-white/80 group-hover:bg-white transition-colors" />
      <span className="text-[11px] tracking-[0.3em] text-white/80 uppercase">
        Menu
      </span>
    </button>
  );
}
