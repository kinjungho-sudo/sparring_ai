'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function saveProfileAndConsent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('not authenticated')

  const service = await createServiceClient()
  const meta = user.user_metadata ?? {}

  await service.from('sparring_profiles').upsert({
    id: user.id,
    email: user.email ?? null,
    full_name: meta.full_name ?? meta.name ?? null,
    avatar_url: meta.avatar_url ?? meta.picture ?? null,
    provider: user.app_metadata?.provider ?? 'google',
  }, { onConflict: 'id' })

  await service.from('sparring_consents').upsert({
    user_id: user.id,
    terms_agreed: true,
    privacy_agreed: true,
    marketing_agreed: false,
    terms_version: 'v1.0',
    privacy_version: 'v1.0',
    agreed_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
}
