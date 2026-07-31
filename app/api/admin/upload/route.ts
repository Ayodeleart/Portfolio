import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 });

  const supabase = supabaseServer();
  const ext = file.name.split('.').pop();
  const path = `portfolio/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from('octopusfur-media')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: publicUrl } = supabase.storage.from('octopusfur-media').getPublicUrl(path);
  return NextResponse.json({ url: publicUrl.publicUrl });
}
