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
        {/* 상황 태그 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['스타트업 PM', '기획자', '1인 기업가', '투자자'].map((tag) => (
            <span
              key={tag}
              className="text-xs font-bold px-3 py-1 rounded-full border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h1
          className="font-black tracking-tight mb-6 leading-tight"
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
          }}
        >
          {language === 'ko' ? (
            <>당신의 기획안에<br /><span style={{ color: 'var(--accent)' }}>임원이 던질 반론</span>을<br />AI가 먼저 던집니다</>
          ) : (
            <>Your proposal will face<br /><span style={{ color: 'var(--accent)' }}>executive pushback</span><br />— from AI first</>
          )}
        </h1>

        <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {t(
            '두 AI가 찬반으로 격돌하는 동안, 사용자는 스스로 결론에 도달합니다.',
            'While two AIs clash for and against, you arrive at your own conclusion.'
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="#sample"
            className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-colors inline-flex items-center justify-center"
          >
            {t('무료로 체험해보기 →', 'Try for free →')}
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
