import { createClient } from '@supabase/supabase-js';

// Server-only client — uses the service role key so it can bypass RLS for admin writes.
// NEVER import this into a client component.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Public client — anon key, read-only via RLS. Safe for client components.
export function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from this build. ' +
        'These are baked in at build time, not read at runtime - check they\'re set in Vercel ' +
        'for this environment, then trigger a fresh deploy (saving the env var alone does not update an existing build).'
    );
  }

  return createClient(url, key);
}
