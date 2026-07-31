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
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
