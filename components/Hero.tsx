'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorSwitcher, { PALETTE } from './ColorSwitcher';

export default function Hero() {
  const [index, setIndex] = useState(0);
  const color = PALETTE[index].hex;

  const handleSwitch = () => setIndex((prev) => (prev + 1) % PALETTE.length);

  // The status bar / browser chrome color is controlled by the theme-color
  // meta tag, which is static by default. Without this, the top strip stays
  // whatever color it was on first load regardless of what's tapped below.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }, [color]);

  return (
    <section
      className="relative h-screen w-full overflow-hidden flex flex-col justify-between transition-colors duration-700"
      style={{ backgroundColor: color }}
    >
      {/* top bar */}
      <div className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-8">
        <span className="text-white tracking-[0.25em] text-sm font-medium">
          OCTOPUS FUR
        </span>
        <ColorSwitcher index={index} onSwitch={handleSwitch} />
        <span className="text-white tracking-[0.25em] text-sm font-medium cursor-pointer">
          CONTACT
        </span>
      </div>

      {/* giant wordmark behind the hero image */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.h1
            key={color}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-white font-display font-bold leading-none select-none"
            style={{ fontSize: 'min(28vw, 300px)' }}
          >
            OCTOPUS
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* hero image placeholder - swap src once real composite is uploaded */}
      <div className="relative z-10 flex-1 flex items-end justify-center">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[70%] max-w-2xl h-[75%]"
        >
          {/* Placeholder box - replace with <Image src="/hero.png" />.
              Mid-gray so mix-blend-color previews accurately; a near-black
              placeholder makes the blend look muddy regardless of the
              active color, which isn't a switcher bug. */}
          <div className="w-full h-full bg-neutral-500 rounded-t-3xl flex items-center justify-center text-white/70 text-sm">
            hero composite goes here
          </div>
          {/* color reflection overlay onto the hero image */}
          <div
            className="absolute inset-0 mix-blend-color rounded-t-3xl transition-colors duration-700"
            style={{ backgroundColor: color }}
          />
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="relative z-20 mx-auto mb-8 w-[1px] h-10 bg-white/60"
      />
    </section>
  );
}
