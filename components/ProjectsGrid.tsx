'use client';

import ProjectCard, { Project } from './ProjectCard';

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p className="text-white/40">No projects published yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((p, i) => (
        <ProjectCard key={p.id} project={p} index={i} />
      ))}
    </div>
  );
}
