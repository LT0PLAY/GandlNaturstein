import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// ============================================================
// Browser Client (Client Components)
// ============================================================
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnon)
}

// ============================================================
// Server Admin Client (Server Actions / API Routes)
// Nur serverseitig verwenden – nie im Browser!
// ============================================================
export function createSupabaseAdminClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
