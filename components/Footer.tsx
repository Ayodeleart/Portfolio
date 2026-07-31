import { supabasePublic } from '@/lib/supabase';

export const revalidate = 0;

const LABELS: Record<string, string> = {
  x: 'X',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
};

export default async function Footer() {
  const supabase = supabasePublic();
  const { data: links } = await supabase.from('portfolio_social_links').select('*');

  const active = (links || []).filter((l) => l.url);

  return (
    <footer className="w-full bg-black text-white px-6 md:px-16 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-white/10">
      <span className="text-sm text-white/40">© {new Date().getFullYear()} Octopus Fur</span>
      <div className="flex gap-6">
        {active.map((l) => (
          <a
            key={l.platform}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm tracking-wide uppercase text-white/70 hover:text-white transition-colors"
          >
            {LABELS[l.platform] || l.platform}
          </a>
        ))}
      </div>
    </footer>
  );
}
