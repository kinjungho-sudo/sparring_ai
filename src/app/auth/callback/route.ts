import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/debate/new'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      // 신규 사용자 판별: created_at과 last_sign_in_at 차이가 10초 이내
      const isNew = user?.created_at && user?.last_sign_in_at
        ? Math.abs(new Date(user.created_at).getTime() - new Date(user.last_sign_in_at).getTime()) < 10000
        : false
      if (isNew) {
        return NextResponse.redirect(`${origin}/auth/agree?next=${encodeURIComponent(next)}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
