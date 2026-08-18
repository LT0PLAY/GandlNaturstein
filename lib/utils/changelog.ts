import { createSupabaseAdminClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type Action = 'create' | 'update' | 'delete'

export async function logChange({
  action,
  entity_type,
  entity_id,
  entity_name,
  old_value,
  new_value,
}: {
  action:      Action
  entity_type: string
  entity_id?:  string
  entity_name?: string
  old_value?:  Record<string, unknown>
  new_value?:  Record<string, unknown>
}) {
  try {
    // Aktuellen User holen
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    let team_member_id: string | null = null
    let changed_by_email: string | null = user?.email ?? null

    if (user) {
      // Admin-Client verwenden damit RLS den Lookup nicht blockiert
      const { data: member } = await createSupabaseAdminClient()
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      team_member_id = member?.id ?? null
    }

    const adminClient = createSupabaseAdminClient()
    await adminClient.from('change_log').insert({
      action,
      entity_type,
      entity_id:         entity_id        ?? null,
      entity_name:       entity_name      ?? null,
      changed_by:        team_member_id,
      changed_by_email:  changed_by_email,
      old_value:         old_value        ?? null,
      new_value:         new_value        ?? null,
    })
  } catch (err) {
    // Logging soll niemals die eigentliche Aktion blockieren
    console.error('logChange error:', err)
  }
}
