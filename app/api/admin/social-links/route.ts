import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('portfolio_social_links').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ links: data });
}

export async function PUT(req: NextRequest) {
  const body = await req.json(); // { x, instagram, whatsapp, facebook }
  const supabase = supabaseServer();

  const updates = Object.entries(body).map(([platform, url]) =>
    supabase
      .from('portfolio_social_links')
      .update({ url, updated_at: new Date().toISOString() })
      .eq('platform', platform)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
