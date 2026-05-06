'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PricingSection() {
  const { language } = useLanguage()

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
            PRICING
          </p>
          <h2
            className="font-black"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
          >
            {language === 'ko' ? '심플한 가격' : 'Simple pricing'}
          </h2>
        </div>

        {/* Beta 무제한 카드 */}
        <div className="max-w-lg mx-auto">
          <div className="p-8 rounded-2xl border-2 relative text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full bg-indigo-600 text-white">
              BETA
            </div>
            <div className="text-4xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>₩0</div>
            <div className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {language === 'ko' ? 'Beta 기간 중 완전 무료' : 'Completely free during Beta'}
            </div>
            <ul className="space-y-3 text-sm text-left mb-8" style={{ color: 'var(--text-secondary)' }}>
              {(language === 'ko' ? [
                '무제한 토론 (Beta 종료 시 유료 전환)',
                'AI 페르소나 & 어조 커스텀',
                '최종 결론 리포트',
                'TTS 음성 지원',
              ] : [
                'Unlimited debates (paid after Beta)',
                'AI persona & tone customization',
                'Final verdict report',
                'TTS voice support',
              ]).map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/debate/new"
              className="block text-center h-11 leading-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
            >
              {language === 'ko' ? '지금 무료로 시작 →' : 'Start free now →'}
            </Link>
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              {language === 'ko' ? 'Beta 종료 전 가입 시 얼리버드 혜택 제공' : 'Early bird benefits for Beta users'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
