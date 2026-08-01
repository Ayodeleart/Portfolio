import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Footer from '@/components/Footer';
import { supabasePublic } from '@/lib/supabase';

export const revalidate = 0;

export default async function Home() {
  const supabase = supabasePublic();
  const { data: settings } = await supabase
    .from('portfolio_settings')
    .select('hero_image_url')
    .eq('id', 1)
    .single();

  return (
    <main className="scroll-jack">
      <Hero heroImageUrl={settings?.hero_image_url} />
      <About />
      <Projects />
      <Footer />
    </main>
  );
}
