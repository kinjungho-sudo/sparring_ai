'use client'

import LoginButton from '@/components/auth/LoginButton'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

function LoginContent() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [alreadyMember, setAlreadyMember] = useState(false)

  useEffect(() => {
    if (searchParams.get('already_member') === '1') {
      setAlreadyMember(true)
      setMode('login')
    }
  }, [searchParams])

  return (
    <div className="flex min-h-[calc(100vh-64px)]">

      {/* 왼쪽 — 브랜드 패널 (md 이상) */}
      <div
        className="hidden md:flex flex-col justify-between w-1/2 p-12"
        style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        <div>
          <div className="mb-16">
            <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ⚡ Sparring AI
            </span>
          </div>

          <h2
            className="font-black mb-4 leading-tight"
            style={{ fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
          >
            {t('AI가 당신 대신', 'AI argues for you,')}
            <br />
            {t('치열하게 싸웁니다.', 'fiercely.')}
          </h2>
          <p className="text-base mb-10" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('두 AI가 찬반으로 격돌하는 토론을 지켜보며', 'Watch two AIs clash in a for-vs-against debate')}
            <br />
            {t('더 나은 결정에 도달하세요.', 'and reach a better decision.')}
          </p>

          <div className="space-y-3">
            {[
              { icon: '🔴🔵', text: t('RED vs BLUE — 완전 반대 입장 AI 2인 토론', 'RED vs BLUE — two AIs on opposite sides') },
              { icon: '⚖️', text: t('팩트체크 사회자가 오류를 실시간 감지', 'Fact-checking host catches errors in real time') },
              { icon: '📊', text: t('토론 종료 후 중립적 리포트 자동 생성', 'Neutral report generated automatically after the debate') },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-sm mt-0.5">{item.icon}</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {t('Beta — 매일 10회 무료 · 언제든 취소 가능', 'Beta — 10 free/day · Cancel anytime')}
        </p>
      </div>

      {/* 오른쪽 — 로그인/회원가입 패널 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* 모바일 브랜드 */}
          <div className="md:hidden text-center mb-10">
            <p className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>⚡ Sparring AI</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('AI 토론으로 더 나은 결정을', 'Better decisions through AI debate')}</p>
          </div>

          {/* 이미 회원 배너 */}
          {alreadyMember && (
            <div className="mb-6 px-4 py-4 rounded-xl border text-sm space-y-3" style={{ backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)', color: 'var(--text-primary)' }}>
              <p className="font-semibold" style={{ color: '#ef4444' }}>
                {t('이미 가입된 계정입니다', 'This account is already registered')}
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t('해당 Google 계정으로 가입된 계정이 이미 있습니다. 아래에서 로그인해 주세요.', 'An account with this Google address already exists. Please sign in instead.')}
              </p>
              <LoginButton redirectTo={searchParams.get('next') ?? '/debate/new'} mode="login" />
            </div>
          )}

          {/* 탭 */}
          <div
            className="flex p-1 rounded-xl mb-8"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 h-9 rounded-lg text-sm font-bold transition-all"
                style={{
                  backgroundColor: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {m === 'login' ? t('로그인', 'Sign in') : t('회원가입', 'Sign up')}
              </button>
            ))}
          </div>

          {/* 헤드카피 */}
          <div className="mb-6">
            {mode === 'login' ? (
              <>
                <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  {t('로그인', 'Sign in')}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {t('Google 계정으로 로그인하세요.', 'Sign in with your Google account.')}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  {t('회원가입', 'Sign up')}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {t('Google 계정으로 가입하세요.', 'Sign up with your Google account.')}<br />
                  {t('신용카드 불필요 · 매일 10회 무료.', 'No credit card · 10 free/day.')}
                </p>
              </>
            )}
          </div>

          <LoginButton redirectTo="/debate/new" mode={mode} />

          {/* 약관 안내 */}
          <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {t('계속하면', 'By continuing, you agree to our')}{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
              {t('이용약관', 'Terms of Service')}
            </Link>
            {t(' 및 ', ' and ')}{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
              {t('개인정보처리방침', 'Privacy Policy')}
            </Link>
            {t('에 동의하는 것으로 간주됩니다.', '.')}
          </p>

          {/* 모드 전환 안내 */}
          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <>{t('계정이 없으신가요?', "Don't have an account?")}{' '}
                <button onClick={() => setMode('signup')} className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--accent)' }}>
                  {t('회원가입', 'Sign up')}
                </button>
              </>
            ) : (
              <>{t('이미 계정이 있으신가요?', 'Already have an account?')}{' '}
                <button onClick={() => setMode('login')} className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--accent)' }}>
                  {t('로그인', 'Sign in')}
                </button>
              </>
            )}
          </p>

        </div>
      </div>

    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
