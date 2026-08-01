'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useColor } from '@/lib/ColorContext';

export default function Hero({ heroImageUrl }: { heroImageUrl?: string | null }) {
  const { color } = useColor();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Extra 50vh of scroll range before the sticky hero releases - this is
  // what drives the "content scrolls over it, hero blurs a little" effect
  // instead of the hero just vanishing behind the next section.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end start'],
  });
  const blur = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const blurFilter = useTransform(blur, (v) => `blur(${v}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <div ref={wrapperRef} className="relative h-[150vh]">
      <section
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between transition-colors duration-700"
        style={{ backgroundColor: color }}
      >
        {/* giant wordmark - blurs slightly with scroll, same as the image */}
        <motion.div
          style={{ filter: blurFilter, scale }}
          className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
        >
          <h1 className="font-display text-white leading-none select-none whitespace-nowrap">
            <span className="md:hidden text-[15vw]">OCTOPUS</span>
            <span className="hidden md:inline text-[7rem] lg:text-[9rem]">OCTOPUSFUR</span>
          </h1>
        </motion.div>

        {/* hero image / glow - narrower so wordmark stays visible on both
            sides, even on mobile */}
        <div className="relative z-10 flex-1 flex items-end justify-center pt-24">
          <motion.div
            style={{ filter: blurFilter, scale }}
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
                <div
                  className="absolute inset-0 mix-blend-color rounded-t-3xl transition-colors duration-700"
                  style={{ backgroundColor: color }}
                />
              </>
            ) : (
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
    </div>
  );
}
