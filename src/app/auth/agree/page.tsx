'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Link from 'next/link'

async function saveProfileAndConsent() {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const meta = user.user_metadata ?? {}

  // 프로필 upsert
  await supabase.from('sparring_profiles').upsert({
    id: user.id,
    email: user.email ?? null,
    full_name: meta.full_name ?? meta.name ?? null,
    avatar_url: meta.avatar_url ?? meta.picture ?? null,
    provider: user.app_metadata?.provider ?? 'google',
  }, { onConflict: 'id' })

  // 약관 동의 기록
  await supabase.from('sparring_consents').upsert({
    user_id: user.id,
    terms_agreed: true,
    privacy_agreed: true,
    marketing_agreed: false,
    terms_version: 'v1.0',
    privacy_version: 'v1.0',
    agreed_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
}

function AgreeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/debate/new'
  const [expanded, setExpanded] = useState<'terms' | 'privacy' | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAgree = async () => {
    setLoading(true)
    await saveProfileAndConsent()
    router.replace(next)
  }

  const handleDecline = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">👋</span>
            <div>
              <h1 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                스파링 AI에 오신 걸 환영합니다!
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                서비스 이용 전 아래 내용을 확인해주세요.
              </p>
            </div>
          </div>
        </div>

        {/* 약관 목록 */}
        <div className="px-6 py-4 space-y-2 max-h-72 overflow-y-auto">

          {/* 이용약관 */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setExpanded(expanded === 'terms' ? null : 'terms')}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📄</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>이용약관</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>필수</span>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{expanded === 'terms' ? '▲' : '▼'}</span>
            </button>
            {expanded === 'terms' && (
              <div className="px-4 pb-4 text-xs leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                <p className="pt-3">스파링 AI는 의사결정 보조 목적의 AI 토론 서비스입니다.</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>생성된 토론 내용은 참고용이며 법적·의료·재정적 조언이 아닙니다.</li>
                  <li>서비스 악용 및 불법 콘텐츠 생성은 금지됩니다.</li>
                  <li>서비스는 사전 예고 없이 변경될 수 있습니다.</li>
                </ul>
                <Link href="/terms" className="inline-block text-indigo-400 underline underline-offset-2 mt-1">전문 보기 →</Link>
              </div>
            )}
          </div>

          {/* 개인정보처리방침 */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setExpanded(expanded === 'privacy' ? null : 'privacy')}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🔒</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>개인정보처리방침</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>필수</span>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{expanded === 'privacy' ? '▲' : '▼'}</span>
            </button>
            {expanded === 'privacy' && (
              <div className="px-4 pb-4 text-xs leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                <p className="pt-3">서비스 이용 시 다음 정보가 수집됩니다:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Google 계정 이메일 (인증 목적)</li>
                  <li>토론 의제 및 진행 내용 (서비스 제공 목적)</li>
                </ul>
                <p>수집된 정보는 서비스 개선 목적으로만 활용되며, 제3자에게 제공되지 않습니다.</p>
                <Link href="/privacy" className="inline-block text-indigo-400 underline underline-offset-2 mt-1">전문 보기 →</Link>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={handleAgree}
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mb-2"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? '저장 중...' : '모두 동의하고 시작하기'}
          </button>
          <p className="text-[11px] text-center mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            위 이용약관 및 개인정보처리방침(필수)에 모두 동의합니다.
          </p>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="w-full h-9 rounded-xl text-xs transition-colors hover:bg-white/5 disabled:opacity-40"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            동의하지 않음 — 로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AgreePage() {
  return (
    <Suspense>
      <AgreeContent />
    </Suspense>
  )
}
