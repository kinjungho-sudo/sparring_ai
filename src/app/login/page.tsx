'use client'

import LoginButton from '@/components/auth/LoginButton'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

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
            AI가 당신 대신<br />치열하게 싸웁니다.
          </h2>
          <p className="text-base mb-10" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            두 AI가 찬반으로 격돌하는 토론을 지켜보며<br />
            더 나은 결정에 도달하세요.
          </p>

          <div className="space-y-3">
            {[
              { icon: '🔴🔵', text: 'RED vs BLUE — 완전 반대 입장 AI 2인 토론' },
              { icon: '⚖️', text: '팩트체크 사회자가 오류를 실시간 감지' },
              { icon: '📊', text: '토론 종료 후 중립적 리포트 자동 생성' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-sm mt-0.5">{item.icon}</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Beta — 매일 10회 무료 · 언제든 취소 가능
        </p>
      </div>

      {/* 오른쪽 — 로그인/회원가입 패널 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* 모바일 브랜드 */}
          <div className="md:hidden text-center mb-10">
            <p className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>⚡ Sparring AI</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI 토론으로 더 나은 결정을</p>
          </div>

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
                {m === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          {/* 헤드카피 */}
          <div className="mb-6">
            {mode === 'login' ? (
              <>
                <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  로그인
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Google 계정으로 로그인하세요.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  회원가입
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Google 계정으로 가입하세요.<br />
                  신용카드 불필요 · 매일 10회 무료.
                </p>
              </>
            )}
          </div>

          <LoginButton redirectTo="/debate/new" mode={mode} />

          {/* 약관 안내 */}
          <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            계속하면{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
              이용약관
            </Link>
            {' '}및{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>

          {/* 모드 전환 안내 */}
          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <>계정이 없으신가요?{' '}
                <button onClick={() => setMode('signup')} className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--accent)' }}>
                  회원가입
                </button>
              </>
            ) : (
              <>이미 계정이 있으신가요?{' '}
                <button onClick={() => setMode('login')} className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--accent)' }}>
                  로그인
                </button>
              </>
            )}
          </p>

        </div>
      </div>

    </div>
  )
}
