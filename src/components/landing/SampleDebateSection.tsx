'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const SAMPLE_TOPICS = {
  ko: 'AI가 인간의 일자리를 대체하는 것은 긍정적이다',
  en: 'AI replacing human jobs is a positive development',
}

export default function SampleDebateSection() {
  const { language, t } = useLanguage()

  return (
    <section id="sample" className="py-24 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
          LIVE DEMO
        </p>
        <h2
          className="font-black mb-4"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
        >
          {t('지금 바로 체험해보세요', 'Try it right now')}
        </h2>

        {/* 고정 의제 표시 */}
        <div
          className="my-8 p-6 rounded-2xl border text-left"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            {t('예시 의제', 'SAMPLE TOPIC')}
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            "{SAMPLE_TOPICS[language]}"
          </p>

          <div className="flex gap-3 mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1.5">
              <span>🔴</span>
              {t('찬성 AI', 'Pro AI')}
            </span>
            <span>vs</span>
            <span className="flex items-center gap-1.5">
              <span>🔵</span>
              {t('반대 AI', 'Con AI')}
            </span>
            <span className="ml-auto">3 {t('라운드', 'rounds')}</span>
          </div>
        </div>

        <Link
          href="/debate/new"
          className="inline-flex items-center justify-center h-12 px-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-colors"
        >
          {t('토론 시작하기 →', 'Start Debate →')}
        </Link>
      </div>
    </section>
  )
}
