import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/debate/new'
  console.log('[callback] 진입 — code 존재:', !!code, '/ next:', next)

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[callback] exchangeCodeForSession 결과:', error ?? 'OK')

    if (!error) {
      // exchangeCodeForSession 반환값에서 직접 user를 사용 — getUser() 재호출 시 타이밍 문제로 email이 null일 수 있음
      const user = sessionData?.user ?? null
      console.log('[callback] user:', { userId: user?.id, email: user?.email })

      if (!user) return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)

      const service = await createServiceClient()
      const meta = user.user_metadata ?? {}

      const { data: existingProfile, error: profileLookupError } = await service
        .from('sparring_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      console.log('[callback] 기존 프로필 조회:', { found: !!existingProfile, profileLookupError })

      // plan은 기존 값을 유지하기 위해 신규 사용자일 때만 'free'로 세팅
      const upsertPayload: Record<string, unknown> = {
        id: user.id,
        email: user.email ?? null,
        full_name: meta.full_name ?? meta.name ?? null,
        avatar_url: meta.avatar_url ?? meta.picture ?? null,
        provider: user.app_metadata?.provider ?? 'google',
      }
      if (!existingProfile) upsertPayload.plan = 'free'

      const { error: upsertError } = await service.from('sparring_profiles').upsert(
        upsertPayload,
        { onConflict: 'id' }
      )
      console.log('[callback] sparring_profiles upsert:', upsertError ?? 'OK')

      if (!existingProfile) {
        console.log('[callback] 신규 사용자 → /auth/agree 리다이렉트')
        return NextResponse.redirect(`${origin}/auth/agree?next=${encodeURIComponent(next)}`)
      }
      console.log('[callback] 기존 사용자 → 리다이렉트:', next)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.log('[callback] 실패 — code 없거나 세션 교환 실패')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
