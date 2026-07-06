import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

let client;
export function getSupabase() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}

let serviceRoleClient;
export function getSupabaseServiceRole() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseServiceRole must only be called on the server');
  }
  if (!serviceRoleClient) {
    serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return serviceRoleClient;
}
