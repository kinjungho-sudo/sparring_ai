'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function saveProfileAndConsent({
  displayName,
  marketingAgreed,
}: {
  displayName: string
  marketingAgreed: boolean
}) {
  console.log('[agree/actions] saveProfileAndConsent 시작')

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('[agree/actions] getUser 결과:', { userId: user?.id, email: user?.email, authError })

  if (!user) throw new Error('not authenticated')

  const service = await createServiceClient()
  const meta = user.user_metadata ?? {}

  // plan 컬럼은 건드리지 않음 — callback에서 신규 가입 시 이미 'free'로 세팅됨
  const { error: profileError } = await service.from('sparring_profiles').upsert({
    id: user.id,
    email: user.email ?? null,
    full_name: displayName,
    avatar_url: meta.avatar_url ?? meta.picture ?? null,
    provider: user.app_metadata?.provider ?? 'google',
  }, { onConflict: 'id' })
  console.log('[agree/actions] sparring_profiles upsert:', profileError ?? 'OK')

  const { error: consentError } = await service.from('sparring_consents').upsert({
    user_id: user.id,
    terms_agreed: true,
    privacy_agreed: true,
    marketing_agreed: marketingAgreed,
    terms_version: 'v1.0',
    privacy_version: 'v1.0',
    agreed_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  console.log('[agree/actions] sparring_consents upsert:', consentError ?? 'OK')

  console.log('[agree/actions] saveProfileAndConsent 완료')
}
