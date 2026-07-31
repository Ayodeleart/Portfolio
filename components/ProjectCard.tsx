'use client';

import { motion } from 'framer-motion';

export type Project = {
  id: string;
  title: string;
  description: string;
  live_url: string;
  screenshot_url: string | null;
  tech: string[];
};

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.a
      href={project.live_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ scale: 0.98 }}
      className="group block bg-white/5 hover:bg-white/10 transition-colors rounded-2xl overflow-hidden"
    >
      <div className="aspect-[4/3] overflow-hidden bg-black/30">
        {project.screenshot_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.screenshot_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-display text-white">{project.title}</h3>
        <p className="mt-2 text-sm text-white/60 line-clamp-2">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-[11px] tracking-wide uppercase text-white/50 border border-white/20 rounded-full px-3 py-1"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.a>
  );
}
