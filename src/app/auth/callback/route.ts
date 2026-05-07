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

      // 신규 사용자 판별: created_at과 last_sign_in_at 차이가 10초 이내
      const isNew = user.created_at && user.last_sign_in_at
        ? Math.abs(new Date(user.created_at).getTime() - new Date(user.last_sign_in_at).getTime()) < 10000
        : false

      // 로그인할 때마다 프로필 upsert (신규/기존 모두) — service role로 RLS 우회
      const service = await createServiceClient()
      const meta = user.user_metadata ?? {}
      await service.from('sparring_profiles').upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: meta.full_name ?? meta.name ?? null,
        avatar_url: meta.avatar_url ?? meta.picture ?? null,
        provider: user.app_metadata?.provider ?? 'google',
      }, { onConflict: 'id' })

      if (isNew) {
        return NextResponse.redirect(`${origin}/auth/agree?next=${encodeURIComponent(next)}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
