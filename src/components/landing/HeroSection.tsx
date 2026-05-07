'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HeroSection() {
  const { language, t } = useLanguage()

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.13) 0%, transparent 70%)',
      }} />
      {/* RED / BLUE 사이드 글로우 */}
      <div className="absolute left-0 top-1/3 w-64 h-64 rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)',
      }} />
      <div className="absolute right-0 top-1/3 w-64 h-64 rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* 뱃지 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
          style={{ borderColor: 'rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.08)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            {t('AI 토론 · 의사결정 보조', 'AI Debate · Decision Coach')}
          </span>
        </div>

        {/* 헤드라인 */}
        <h1 className="font-black tracking-tight mb-4 leading-tight"
          style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
          {language === 'ko' ? (
            <>결론이 안 나는<br /><span style={{ color: 'var(--accent)' }}>고민</span>이 있나요?</>
          ) : (
            <>Stuck on a<br /><span style={{ color: 'var(--accent)' }}>tough decision?</span></>
          )}
        </h1>

        {/* 서브 */}
        <p className="text-base sm:text-lg mb-3 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          {t(
            '두 AI가 찬반으로 맞붙습니다. 당신은 지켜보기만 하면 됩니다.',
            'Two AIs argue both sides. You just watch — and decide.'
          )}
        </p>
        <p className="text-sm mb-10 max-w-lg mx-auto" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
          {t(
            'RED AI가 찬성, BLUE AI가 반대 — 라운드마다 치열하게 격돌하고 사회자 AI가 팩트를 검증합니다.',
            'RED AI argues pro, BLUE AI argues con — round by round, with a host AI fact-checking live.'
          )}
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/debate/new"
            className="h-13 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
          >
            ⚡ {t('지금 무료로 시작', 'Start for free')}
          </Link>
          <a
            href="#demo"
            className="h-13 px-8 py-3.5 rounded-xl border font-semibold text-base transition-all hover:bg-white/5 inline-flex items-center justify-center gap-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            ▶ {t('데모 보기', 'Watch demo')}
          </a>
        </div>

        {/* 신뢰 지표 */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            t('✓ 무료로 시작', '✓ Free to start'),
            t('✓ 신용카드 불필요', '✓ No credit card'),
            t('✓ 매일 5회 제공', '✓ 5 debates/day'),
          ].map((item) => (
            <span key={item} className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{item}</span>
          ))}
        </div>

        {/* vs 배지 */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.07)' }}>
            <span className="text-lg">🔴</span>
            <span className="text-sm font-bold" style={{ color: '#ef4444' }}>RED AI</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('찬성', 'PRO')}</span>
          </div>
          <span className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>VS</span>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ borderColor: 'rgba(59,130,246,0.3)', backgroundColor: 'rgba(59,130,246,0.07)' }}>
            <span className="text-lg">🔵</span>
            <span className="text-sm font-bold" style={{ color: '#3b82f6' }}>BLUE AI</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('반대', 'CON')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
