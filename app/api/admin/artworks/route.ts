import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*, portfolio_project_images(id, url, sort_order)')
    .eq('site', 'art')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ artworks: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, story, category, year, dimensions, screenshot_url, images } = body;

  if (!title || !screenshot_url) {
    return NextResponse.json({ error: 'title and screenshot_url are required' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: artwork, error } = await supabase
    .from('portfolio_projects')
    .insert({
      title,
      description: description || '',
      story: story || null,
      category: category || null,
      year: year ?? null,
      dimensions: dimensions || null,
      screenshot_url,
      site: 'art',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const extraUrls: string[] = Array.isArray(images) ? images : [];
  if (extraUrls.length > 0) {
    const rows = extraUrls.map((url, i) => ({ project_id: artwork.id, url, sort_order: i }));
    const { error: imagesError } = await supabase.from('portfolio_project_images').insert(rows);
    if (imagesError) return NextResponse.json({ error: imagesError.message }, { status: 500 });
  }

  return NextResponse.json({ artwork });
}
