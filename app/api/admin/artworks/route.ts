import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('artworks')
    .select('*, artwork_images(id, url, sort_order)')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ artworks: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    story,
    inspiration,
    medium,
    year,
    dimensions,
    featured,
    frame_position,
    images, // array of uploaded urls; images[0] becomes the cover
  } = body;

  const urls: string[] = Array.isArray(images) ? images : [];
  if (!title || urls.length === 0) {
    return NextResponse.json({ error: 'title and at least one image are required' }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: countRows } = await supabase.from('artworks').select('id');
  const sort_order = countRows?.length ?? 0;

  const { data: artwork, error } = await supabase
    .from('artworks')
    .insert({
      title,
      image_url: urls[0],
      story: story || null,
      inspiration: inspiration || null,
      medium: medium || null,
      year: year ?? null,
      dimensions: dimensions || null,
      featured: !!featured,
      frame_position: frame_position || null,
      sort_order,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const extra = urls.slice(1);
  if (extra.length > 0) {
    const rows = extra.map((url, i) => ({ artwork_id: artwork.id, url, sort_order: i }));
    const { error: imgErr } = await supabase.from('artwork_images').insert(rows);
    if (imgErr) return NextResponse.json({ error: imgErr.message }, { status: 500 });
  }

  return NextResponse.json({ artwork });
}
