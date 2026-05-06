'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HeroSection() {
  const { language, t } = useLanguage()

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center overflow-hidden">
      {/* 배경 그라디언트 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* 서비스 유형 뱃지 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
          style={{ borderColor: 'rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.08)' }}>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>AI COACHING</span>
        </div>

        <h1
          className="font-black tracking-tight mb-6 leading-tight"
          style={{
            fontSize: 'clamp(32px, 5.5vw, 68px)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
          }}
        >
          {language === 'ko' ? (
            <><span style={{ color: 'var(--accent)' }}>의사결정 보조</span>이자,<br />토론형 AI 코칭 서비스</>
          ) : (
            <>Your <span style={{ color: 'var(--accent)' }}>AI Decision Coach</span><br />powered by debate</>
          )}
        </h1>

        <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          {t(
            '두 AI가 찬반으로 격돌하며 당신의 생각을 단련합니다. 스스로 결론에 도달하는 가장 빠른 방법.',
            'Two AIs clash for and against, sharpening your thinking. The fastest path to your own conclusion.'
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/debate/new"
            className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-colors inline-flex items-center justify-center"
          >
            {t('토론 시작하기 →', 'Start a debate →')}
          </Link>
          <Link
            href="/login"
            className="h-12 px-8 rounded-xl border font-semibold text-sm transition-colors inline-flex items-center justify-center hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {t('로그인하고 매일 3회 무료', 'Log in — 3 free debates/day')}
          </Link>
        </div>

        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          {t('신용카드 불필요 · 스팸 없음', 'No credit card · No spam')}
        </p>
      </div>
    </section>
  )
}
