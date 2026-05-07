import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/debate/new'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)

      const service = await createServiceClient()
      const meta = user.user_metadata ?? {}

      // 프로필 존재 여부로 신규/기존 판별 — auth.users가 아닌 sparring_profiles 기준
      const { data: existingProfile } = await service
        .from('sparring_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      // 프로필 upsert (로그인마다 최신 정보 반영)
      await service.from('sparring_profiles').upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: meta.full_name ?? meta.name ?? null,
        avatar_url: meta.avatar_url ?? meta.picture ?? null,
        provider: user.app_metadata?.provider ?? 'google',
      }, { onConflict: 'id' })

      // 프로필 없었으면 신규 → 약관 동의 페이지
      if (!existingProfile) {
        return NextResponse.redirect(`${origin}/auth/agree?next=${encodeURIComponent(next)}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
