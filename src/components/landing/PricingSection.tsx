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

        <div className="grid md:grid-cols-2 gap-4">
          {/* 무료 플랜 */}
          <div className="p-8 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-muted)' }}>FREE</div>
            <div className="text-4xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>₩0</div>
            <div className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {language === 'ko' ? '매일 무료' : 'Free every day'}
            </div>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {[
                language === 'ko' ? '매일 3회 토론' : '3 debates/day',
                language === 'ko' ? '비회원 샘플 체험 1회' : '1 sample debate (no login)',
                language === 'ko' ? '사고확장 리포트' : 'Thought expansion report',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 block text-center h-10 leading-10 rounded-xl border font-semibold text-sm transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              {language === 'ko' ? '무료로 시작' : 'Start free'}
            </Link>
          </div>

          {/* 유료 플랜 */}
          <div className="p-8 rounded-2xl border-2 relative" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full bg-indigo-600 text-white">
              {language === 'ko' ? '사전 등록 혜택' : 'Early bird'}
            </div>
            <div className="text-sm font-bold mb-2" style={{ color: 'var(--accent)' }}>PRO</div>
            <div className="text-4xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>₩9,900</div>
            <div className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {language === 'ko' ? '/월 · 첫 달 무료' : '/mo · First month free'}
            </div>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {[
                language === 'ko' ? '무제한 토론' : 'Unlimited debates',
                language === 'ko' ? '모든 무료 기능 포함' : 'All free features',
                language === 'ko' ? '우선 지원' : 'Priority support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 block text-center h-10 leading-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
            >
              {language === 'ko' ? '사전 등록하기' : 'Pre-register'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
