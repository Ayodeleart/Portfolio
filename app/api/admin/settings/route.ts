import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('portfolio_settings').select('*').eq('id', 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PUT(req: NextRequest) {
  const { hero_image_url } = await req.json();
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('portfolio_settings')
    .update({ hero_image_url, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
