import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, live_url, screenshot_url, tech } = body;

  if (!title || !live_url) {
    return NextResponse.json({ error: 'title and live_url are required' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .insert({
      title,
      description: description || '',
      live_url,
      screenshot_url: screenshot_url || null,
      tech: tech || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data });
}
