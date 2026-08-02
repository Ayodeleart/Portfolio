import { supabasePublic } from '@/lib/supabase';
import ProjectsGrid from './ProjectsGrid';

export const revalidate = 0; // always fresh, same pattern used on other projects

export default async function Projects() {
  const supabase = supabasePublic();
  const { data: projects } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('site', 'dev')
    .order('sort_order', { ascending: true });

  return (
    <section className="relative min-h-screen w-full bg-black text-white px-6 md:px-16 py-24">
      <span className="text-xs tracking-[0.3em] text-white/50 uppercase">Work</span>
      <h2 className="mt-4 text-4xl md:text-6xl font-display mb-16">Selected Projects</h2>
      <ProjectsGrid projects={projects || []} />
    </section>
  );
}
