import { createClient } from '@supabase/supabase-js';

// Hardcoded on purpose. This is the public project URL and the anon key -
// not secrets. The anon key is designed to be exposed to the browser (it's
// what Row Level Security exists to protect against), so baking it in here
// removes a whole class of "env var got mangled on mobile paste" failures.
const SUPABASE_URL = 'https://lvjatrpupssmpftutkzt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2amF0cnB1cHNzbXBmdHV0a3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNjQ0MTYsImV4cCI6MjA5Njc0MDQxNn0.K_GyXeT1R54M7FFCQgIUx1dPaG2g8vtIzJy0pNeI3kM';

// Server-only client — uses the service role key so it can bypass RLS for
// admin writes. This one genuinely is a secret and stays as an env var,
// read at request time in a Node runtime (never shipped to the browser).
// NEVER import this into a client component.
export function supabaseServer() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is missing - set it in Vercel (Settings > Environment ' +
        'Variables) and redeploy. This one must stay a secret, not hardcoded.'
    );
  }
  return createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
}

// Public client — anon key, read-only via RLS. Safe for client components.
export function supabasePublic() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
