'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorSwitcher, { PALETTE } from './ColorSwitcher';

export default function Hero({ heroImageUrl }: { heroImageUrl?: string | null }) {
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
      {/* Paints the safe-area/notch region from page content. iOS Safari
          doesn't reliably repaint its native chrome from a live theme-color
          mutation, so this covers that gap directly - and this is what
          shows through when the PWA's status bar is translucent. */}
      <div
        className="fixed top-0 left-0 right-0 z-30 transition-colors duration-700"
        style={{ height: 'env(safe-area-inset-top)', backgroundColor: color }}
      />
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
            className="font-display text-white leading-none select-none whitespace-nowrap text-[15vw] md:text-[9rem] lg:text-[11rem]"
          >
            OCTOPUS
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* hero image - narrower so the giant wordmark stays visible on
          either side, even on mobile. Full-bleed at 70% width was hiding
          the wordmark completely on narrow screens. */}
      <div className="relative z-10 flex-1 flex items-end justify-center">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[50%] md:w-[38%] max-w-md h-[65%] md:h-[75%]"
        >
          {heroImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImageUrl}
                alt="Octopus Fur"
                className="w-full h-full object-cover rounded-t-3xl"
              />
              {/* color reflection onto the real photo */}
              <div
                className="absolute inset-0 mix-blend-color rounded-t-3xl transition-colors duration-700"
                style={{ backgroundColor: color }}
              />
            </>
          ) : (
            // No photo yet - a soft colored light instead of a solid block,
            // so it reads as a lighting effect rather than something hiding
            // the wordmark. Switches fully with the palette.
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full blur-[60px] mix-blend-screen transition-colors duration-700"
                style={{ backgroundColor: color, opacity: 0.75 }}
              />
              <span className="relative text-white/60 text-xs md:text-sm text-center px-6">
                hero composite goes here
              </span>
            </div>
          )}
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
