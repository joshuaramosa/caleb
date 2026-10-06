import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service role. SOLO usar en el servidor (route handlers, server actions).
 * Nunca exponer en código del cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
