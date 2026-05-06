import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || '').split(',').map(e => e.trim())

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // 관리자 페이지 접근 제어
  if (pathname.startsWith('/admin')) {
    if (!user || !ADMIN_WHITELIST.includes(user.email ?? '')) {
      return NextResponse.rewrite(new URL('/403', request.url))
    }
  }

  // /debate 페이지는 로그인 필수 (샘플은 API로 별도 처리)
  if (pathname.startsWith('/debate') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
