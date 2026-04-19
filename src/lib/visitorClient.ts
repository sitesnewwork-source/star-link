import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Anonymous client dedicated to public visitor flows.
 * It never reuses the admin auth session stored by the main app client,
 * which prevents expired/invalid auth tokens from breaking public tracking.
 */
export const visitorClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storageKey: "sl-visitor-anon-auth",
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
