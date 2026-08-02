import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from('artworks')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ artwork: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  // artwork_images rows cascade-delete via their FK.
  const { error } = await supabase.from('artworks').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
