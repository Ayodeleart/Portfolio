'use client';

import { motion } from 'framer-motion';

export default function About() {
  return (
    <section className="relative min-h-screen w-full bg-black text-white flex items-center px-6 md:px-16 py-24">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-3xl"
      >
        <span className="text-xs tracking-[0.3em] text-white/50 uppercase">
          About
        </span>
        <h2 className="mt-6 text-4xl md:text-6xl font-display leading-tight">
          Artist first. Developer by extension.
        </h2>
        <p className="mt-8 text-white/70 text-lg leading-relaxed">
          I'm a professional artist — art meets development. When I see a
          design, I don't see one use case, I see ten. That's the edge:
          creativity that turns ordinary work into something nobody else is
          building. I lean on AI to move faster, the same way it's made
          everything else in my life easier.
        </p>
      </motion.div>
    </section>
  );
}
